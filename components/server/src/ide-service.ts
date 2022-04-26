/**
 * Copyright (c) 2022 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { IDESettings, JetBrainsConfig, TaskConfig, Workspace } from "@gitpod/gitpod-protocol";
import { IDEOption, IDEOptions } from "@gitpod/gitpod-protocol/lib/ide-protocol";
import { injectable } from "inversify";

export interface IDEImageInfo {
    image: string;
    latest: boolean;
}

@injectable()
export class IDEService {
    resolveGitpodTasks(ws: Workspace): TaskConfig[] {
        const tasks: TaskConfig[] = [];
        if (ws.config.tasks) {
            tasks.push(...ws.config.tasks);
        }
        // TODO(ak) it is a hack to get users going, we should rather layer JB products on prebuild workspaces and move logic to corresponding images
        if (ws.type === "prebuild" && ws.config.jetbrains) {
            let warmUp = "";
            for (const key in ws.config.jetbrains) {
                let productCode;
                if (key === "intellij") {
                    productCode = "IIU";
                } else if (key === "goland") {
                    productCode = "GO";
                } else if (key === "pycharm") {
                    productCode = "PCP";
                } else if (key === "phpstorm") {
                    productCode = "PS";
                }
                const prebuilds = productCode && ws.config.jetbrains[key as keyof JetBrainsConfig]?.prebuilds;
                if (prebuilds) {
                    warmUp +=
                        prebuilds.version === "latest"
                            ? ""
                            : `
echo 'warming up stable release of ${key}...'
echo 'downloading stable ${key} backend...'
mkdir /tmp/backend
curl -sSLo /tmp/backend/backend.tar.gz "https://download.jetbrains.com/product?type=release&distribution=linux&code=${productCode}"
tar -xf /tmp/backend/backend.tar.gz --strip-components=1 --directory /tmp/backend

echo 'configuring JB system config and caches aligned with runtime...'
printf '\nshared.indexes.download.auto.consent=true' >> "/tmp/backend/bin/idea.properties"
unset JAVA_TOOL_OPTIONS
export IJ_HOST_CONFIG_BASE_DIR=/workspace/.config/JetBrains
export IJ_HOST_SYSTEM_BASE_DIR=/workspace/.cache/JetBrains

echo 'running stable ${key} backend in warmup mode...'
/tmp/backend/bin/remote-dev-server.sh warmup "$GITPOD_REPO_ROOT"

echo 'removing stable ${key} backend...'
rm -rf /tmp/backend
`;
                    warmUp +=
                        prebuilds.version === "stable"
                            ? ""
                            : `
echo 'warming up latest release of ${key}...'
echo 'downloading latest ${key} backend...'
mkdir /tmp/backend-latest
curl -sSLo /tmp/backend-latest/backend-latest.tar.gz "https://download.jetbrains.com/product?type=release,eap,rc&distribution=linux&code=${productCode}"
tar -xf /tmp/backend-latest/backend-latest.tar.gz --strip-components=1 --directory /tmp/backend-latest

echo 'configuring JB system config and caches aligned with runtime...'
printf '\nshared.indexes.download.auto.consent=true' >> "/tmp/backend-latest/bin/idea.properties"
unset JAVA_TOOL_OPTIONS
export IJ_HOST_CONFIG_BASE_DIR=/workspace/.config/JetBrains-latest
export IJ_HOST_SYSTEM_BASE_DIR=/workspace/.cache/JetBrains-latest

echo 'running ${key} backend in warmup mode...'
/tmp/backend-latest/bin/remote-dev-server.sh warmup "$GITPOD_REPO_ROOT"

echo 'removing latest ${key} backend...'
rm -rf /tmp/backend-latest
`;
                }
            }
            if (warmUp) {
                tasks.push({
                    init: warmUp.trim(),
                });
            }
        }
        return tasks;
    }

    migrationIDESettings(ideSettings?: IDESettings) {
        if (!ideSettings || ideSettings.settingVersion === "2.0") {
            return;
        }
        const newIDESettings: IDESettings = {
            settingVersion: "2.0",
        };
        if (ideSettings.useDesktopIde) {
            if (ideSettings.defaultDesktopIde === "code-desktop") {
                newIDESettings.defaultIde = "code-desktop";
            } else if (ideSettings.defaultDesktopIde === "code-desktop-insiders") {
                newIDESettings.defaultIde = "code-desktop";
                newIDESettings.useLatestVersion = true;
            } else {
                newIDESettings.defaultIde = ideSettings.defaultDesktopIde;
                newIDESettings.useLatestVersion = ideSettings.useLatestVersion;
            }
        } else {
            const useLatest = ideSettings.defaultIde === "code-latest";
            newIDESettings.defaultIde = "code";
            newIDESettings.useLatestVersion = useLatest;
        }
        return newIDESettings;
    }

    chooseIDE(ideChoice: string, ideOptions: IDEOptions, useLatest: boolean, hasIdeSettingPerm: boolean) {
        const chooseLatest = (useLatest: boolean, chooseOption?: IDEOption): IDEImageInfo | undefined => {
            if (!chooseOption) {
                return;
            }
            if (!useLatest) {
                return { image: chooseOption.image, latest: false };
            }
            if (chooseOption.latestImage) {
                return { image: chooseOption.latestImage, latest: true };
            }
            return { image: chooseOption.image, latest: false };
        };
        const defaultIDEOption = ideOptions.options[ideOptions.defaultIde];
        const defaultInfo = chooseLatest(useLatest, defaultIDEOption)!;
        const data: { ide: IDEImageInfo; desktopIde?: IDEImageInfo } = {
            ide: defaultInfo,
        };
        const chooseOption = ideOptions.options[ideChoice] ?? defaultIDEOption;
        const isDesktopIde = chooseOption.type === "desktop";
        if (isDesktopIde) {
            data.desktopIde = chooseLatest(useLatest, chooseOption);
            if (hasIdeSettingPerm && !data.desktopIde?.image) {
                data.desktopIde = { image: ideChoice, latest: true };
            }
        } else {
            data.ide = chooseLatest(useLatest, chooseOption)!;
            if (hasIdeSettingPerm && !data.ide.image) {
                data.ide = { image: ideChoice, latest: true };
            }
        }
        if (!data.ide.image) {
            data.ide = defaultInfo;
        }
        return data;
    }
}
