/**
 * Copyright (c) 2022 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { IDEOption, IDEOptions } from "@gitpod/gitpod-protocol/lib/ide-protocol";
import * as chai from "chai";
import { IDEService } from "./ide-service";
const expect = chai.expect;

describe("ide-service", function () {
    const ideService = new IDEService();

    describe("migrationIDESettings", function () {
        it("with no ideSettings should be undefined", function () {
            const result = ideService.migrationIDESettings(undefined);
            expect(result).to.undefined;
        });

        it("with settingVersion 2.0 should be undefined", function () {
            const result = ideService.migrationIDESettings({
                settingVersion: "2.0",
                defaultIde: "code-latest",
                useDesktopIde: false,
            });
            expect(result).to.undefined;
        });

        it("with code-latest should be code latest", function () {
            const result = ideService.migrationIDESettings({
                defaultIde: "code-latest",
                useDesktopIde: false,
            });
            expect(result?.defaultIde).to.equal("code");
            expect(result?.useLatestVersion ?? false).to.be.true;
        });

        it("with code-desktop-insiders should be code-desktop latest", function () {
            const result = ideService.migrationIDESettings({
                defaultIde: "code",
                defaultDesktopIde: "code-desktop-insiders",
                useDesktopIde: true,
            });
            expect(result?.defaultIde).to.equal("code-desktop");
            expect(result?.useLatestVersion ?? false).to.be.true;
        });

        it("with code-desktop should be code-desktop", function () {
            const result = ideService.migrationIDESettings({
                defaultIde: "code",
                defaultDesktopIde: "code-desktop",
                useDesktopIde: true,
            });
            expect(result?.defaultIde).to.equal("code-desktop");
            expect(result?.useLatestVersion ?? false).to.be.false;
        });

        it("with intellij should be intellij", function () {
            const result = ideService.migrationIDESettings({
                defaultIde: "code",
                defaultDesktopIde: "intellij",
                useLatestVersion: false,
                useDesktopIde: true,
            });
            expect(result?.defaultIde).to.equal("intellij");
            expect(result?.useLatestVersion ?? false).to.be.false;
        });

        it("with intellij latest version  should be intellij latest", function () {
            const result = ideService.migrationIDESettings({
                defaultIde: "code",
                defaultDesktopIde: "intellij",
                useLatestVersion: true,
                useDesktopIde: true,
            });
            expect(result?.defaultIde).to.equal("intellij");
            expect(result?.useLatestVersion ?? false).to.be.true;
        });

        it("with user desktopIde false should be code latest", function () {
            const result = ideService.migrationIDESettings({
                defaultIde: "code-latest",
                defaultDesktopIde: "intellij",
                useLatestVersion: false,
                useDesktopIde: false,
            });
            expect(result?.defaultIde).to.equal("code");
            expect(result?.useLatestVersion ?? false).to.be.true;
        });
    });

    describe("chooseIDE", async function () {
        const baseOpt: IDEOption = {
            title: "title",
            type: "desktop",
            logo: "",
            image: "image",
            latestImage: "latestImage",
        };
        const ideOptions: IDEOptions = {
            options: {
                code: Object.assign({}, baseOpt, { type: "browser" }),
                goland: Object.assign({}, baseOpt),
                "code-desktop": Object.assign({}, baseOpt),
                "no-latest": Object.assign({}, baseOpt),
            },
            defaultIde: "code",
            defaultDesktopIde: "code-desktop",
        };
        delete ideOptions.options["no-latest"].latestImage;

        it("code with latest", function () {
            const useLatest = true;
            const hasPerm = false;
            const result = ideService.chooseIDE("code", ideOptions, useLatest, hasPerm);
            expect(result.ide.image).to.equal(ideOptions.options["code"].latestImage);
            expect(result.ide.latest).to.equal(useLatest);
        });

        it("code without latest", function () {
            const useLatest = false;
            const hasPerm = false;
            const result = ideService.chooseIDE("code", ideOptions, useLatest, hasPerm);
            expect(result.ide.image).to.equal(ideOptions.options["code"].image);
            expect(result.ide.latest).to.equal(useLatest);
        });

        it("desktop ide with latest", function () {
            const useLatest = true;
            const hasPerm = false;
            const result = ideService.chooseIDE("code-desktop", ideOptions, useLatest, hasPerm);
            expect(result.ide.image).to.equal(ideOptions.options["code"].latestImage);
            expect(result.ide.latest).to.equal(useLatest);
            expect(result.desktopIde?.image).to.equal(ideOptions.options["code-desktop"].latestImage);
            expect(result.desktopIde?.latest).to.equal(useLatest);
        });

        it("desktop ide (JetBrains) without latest", function () {
            const useLatest = false;
            const hasPerm = false;
            const result = ideService.chooseIDE("goland", ideOptions, useLatest, hasPerm);
            expect(result.ide.image).to.equal(ideOptions.options["code"].image);
            expect(result.ide.latest).to.equal(useLatest);
            expect(result.desktopIde?.image).to.equal(ideOptions.options["goland"].image);
            expect(result.desktopIde?.latest).to.equal(useLatest);
        });

        it("desktop ide with no latest image", function () {
            const useLatest = true;
            const hasPerm = false;
            const result = ideService.chooseIDE("no-latest", ideOptions, useLatest, hasPerm);
            expect(result.ide.image).to.equal(ideOptions.options["code"].latestImage);
            expect(result.ide.latest).to.equal(useLatest);
            expect(result.desktopIde?.image).to.equal(ideOptions.options["no-latest"].image);
            expect(result.desktopIde?.latest).to.equal(false);
        });

        it("unknown ide with custom permission should be unknown", function () {
            const customOptions = Object.assign({}, ideOptions);
            customOptions.options["unknown-custom"] = {
                title: "unknown title",
                type: "browser",
                logo: "",
                image: "",
            };
            const useLatest = true;
            const hasPerm = true;
            const result = ideService.chooseIDE("unknown-custom", customOptions, useLatest, hasPerm);
            expect(result.ide.image).to.equal("unknown-custom");
            expect(result.ide.latest).to.equal(useLatest);
        });

        it("unknown desktop ide with custom permission desktop should be unknown", function () {
            const customOptions = Object.assign({}, ideOptions);
            customOptions.options["unknown-custom"] = {
                title: "unknown title",
                type: "desktop",
                logo: "",
                image: "",
            };
            const useLatest = true;
            const hasPerm = true;
            const result = ideService.chooseIDE("unknown-custom", customOptions, useLatest, hasPerm);
            expect(result.desktopIde?.image).to.equal("unknown-custom");
            expect(result.desktopIde?.latest).to.equal(true);
        });

        it("unknown desktop ide with custom permission use latest should always be true", function () {
            const customOptions = Object.assign({}, ideOptions);
            customOptions.options["unknown-custom"] = {
                title: "unknown title",
                type: "desktop",
                logo: "",
                image: "",
            };
            const useLatest = false;
            const hasPerm = true;
            const result = ideService.chooseIDE("unknown-custom", customOptions, useLatest, hasPerm);
            expect(result.desktopIde?.image).to.equal("unknown-custom");
            expect(result.desktopIde?.latest).to.equal(true);
        });

        it("unknown browser ide without custom permission should fallback to code", function () {
            const customOptions = Object.assign({}, ideOptions);
            customOptions.options["unknown-custom"] = {
                title: "unknown title",
                type: "browser",
                logo: "",
                image: "",
            };
            const useLatest = true;
            const hasPerm = false;
            const result = ideService.chooseIDE("unknown-custom", customOptions, useLatest, hasPerm);
            expect(result.ide.image).to.equal(ideOptions.options["code"].latestImage);
            expect(result.ide.latest).to.equal(useLatest);
        });

        it("not exists ide with custom permission", function () {
            const useLatest = true;
            const hasPerm = true;
            const result = ideService.chooseIDE("not-exists", ideOptions, useLatest, hasPerm);
            expect(result.ide.image).to.equal(ideOptions.options["code"].latestImage);
            expect(result.ide.latest).to.equal(useLatest);
        });

        it("not exists ide with custom permission", function () {
            const useLatest = true;
            const hasPerm = false;
            const result = ideService.chooseIDE("not-exists", ideOptions, useLatest, hasPerm);
            expect(result.ide.image).to.equal(ideOptions.options["code"].latestImage);
            expect(result.ide.latest).to.equal(useLatest);
        });
    });
});
