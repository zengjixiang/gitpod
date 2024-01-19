/**
 * Copyright (c) 2023 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License.AGPL.txt in the project root for license information.
 */

// This file is generated by the spicedb/codegen/codegen.go. Do not edit manually.

import { v1 } from "@authzed/authzed-node";

export const InstallationID = "1";

export type ResourceType =
    | UserResourceType
    | InstallationResourceType
    | OrganizationResourceType
    | ProjectResourceType
    | WorkspaceResourceType;

export const AllResourceTypes: ResourceType[] = ["user", "installation", "organization", "project", "workspace"];

export type Relation = UserRelation | InstallationRelation | OrganizationRelation | ProjectRelation | WorkspaceRelation;

export type Permission =
    | UserPermission
    | InstallationPermission
    | OrganizationPermission
    | ProjectPermission
    | WorkspacePermission;

export type UserResourceType = "user";

export type UserRelation = "self" | "organization" | "installation";

export type UserPermission =
    | "read_info"
    | "write_info"
    | "delete"
    | "make_admin"
    | "admin_control"
    | "read_ssh"
    | "write_ssh"
    | "read_tokens"
    | "write_tokens"
    | "read_env_var"
    | "write_env_var"
    | "write_temporary_token"
    | "code_sync";

export type InstallationResourceType = "installation";

export type InstallationRelation = "member" | "admin";

export type InstallationPermission = "create_organization" | "configure";

export type OrganizationResourceType = "organization";

export type OrganizationRelation = "installation" | "member" | "owner" | "snapshoter" | "collaborator";

export type OrganizationPermission =
    | "installation_admin"
    | "installation_member"
    | "read_info"
    | "write_info"
    | "delete"
    | "read_settings"
    | "write_settings"
    | "read_members"
    | "invite_members"
    | "write_members"
    | "leave"
    | "create_project"
    | "read_git_provider"
    | "write_git_provider"
    | "read_billing"
    | "write_billing"
    | "create_workspace"
    | "write_billing_admin";

export type ProjectResourceType = "project";

export type ProjectRelation = "org" | "viewer";

export type ProjectPermission =
    | "editor"
    | "read_info"
    | "write_info"
    | "delete"
    | "read_env_var"
    | "write_env_var"
    | "read_prebuild"
    | "write_prebuild";

export type WorkspaceResourceType = "workspace";

export type WorkspaceRelation = "org" | "owner" | "shared";

export type WorkspacePermission =
    | "access"
    | "start"
    | "stop"
    | "delete"
    | "read_info"
    | "create_snapshot"
    | "admin_control";

export const rel = {
    user(id: string) {
        const result: Partial<v1.Relationship> = {
            resource: {
                objectType: "user",
                objectId: id,
            },
        };
        return {
            get self() {
                const result2 = {
                    ...result,
                    relation: "self",
                };
                return {
                    user(objectId: string) {
                        return {
                            ...result2,
                            subject: {
                                object: {
                                    objectType: "user",
                                    objectId: objectId,
                                },
                            },
                        } as v1.Relationship;
                    },
                };
            },

            get organization() {
                const result2 = {
                    ...result,
                    relation: "organization",
                };
                return {
                    organization(objectId: string) {
                        return {
                            ...result2,
                            subject: {
                                object: {
                                    objectType: "organization",
                                    objectId: objectId,
                                },
                            },
                        } as v1.Relationship;
                    },
                };
            },

            get installation() {
                const result2 = {
                    ...result,
                    relation: "installation",
                };
                return {
                    get installation() {
                        return {
                            ...result2,
                            subject: {
                                object: {
                                    objectType: "installation",
                                    objectId: InstallationID,
                                },
                            },
                        } as v1.Relationship;
                    },
                };
            },
        };
    },

    get installation() {
        const result: Partial<v1.Relationship> = {
            resource: {
                objectType: "installation",
                objectId: InstallationID,
            },
        };
        return {
            get member() {
                const result2 = {
                    ...result,
                    relation: "member",
                };
                return {
                    user(objectId: string) {
                        return {
                            ...result2,
                            subject: {
                                object: {
                                    objectType: "user",
                                    objectId: objectId,
                                },
                            },
                        } as v1.Relationship;
                    },
                };
            },

            get admin() {
                const result2 = {
                    ...result,
                    relation: "admin",
                };
                return {
                    user(objectId: string) {
                        return {
                            ...result2,
                            subject: {
                                object: {
                                    objectType: "user",
                                    objectId: objectId,
                                },
                            },
                        } as v1.Relationship;
                    },
                };
            },
        };
    },

    organization(id: string) {
        const result: Partial<v1.Relationship> = {
            resource: {
                objectType: "organization",
                objectId: id,
            },
        };
        return {
            get installation() {
                const result2 = {
                    ...result,
                    relation: "installation",
                };
                return {
                    get installation() {
                        return {
                            ...result2,
                            subject: {
                                object: {
                                    objectType: "installation",
                                    objectId: InstallationID,
                                },
                            },
                        } as v1.Relationship;
                    },
                };
            },

            get member() {
                const result2 = {
                    ...result,
                    relation: "member",
                };
                return {
                    user(objectId: string) {
                        return {
                            ...result2,
                            subject: {
                                object: {
                                    objectType: "user",
                                    objectId: objectId,
                                },
                            },
                        } as v1.Relationship;
                    },
                };
            },

            get owner() {
                const result2 = {
                    ...result,
                    relation: "owner",
                };
                return {
                    user(objectId: string) {
                        return {
                            ...result2,
                            subject: {
                                object: {
                                    objectType: "user",
                                    objectId: objectId,
                                },
                            },
                        } as v1.Relationship;
                    },
                };
            },

            get snapshoter() {
                const result2 = {
                    ...result,
                    relation: "snapshoter",
                };
                return {
                    organization_member(objectId: string) {
                        return {
                            ...result2,
                            subject: {
                                object: {
                                    objectType: "organization",
                                    objectId: objectId,
                                },
                                optionalRelation: "member",
                            },
                        } as v1.Relationship;
                    },
                };
            },

            get collaborator() {
                const result2 = {
                    ...result,
                    relation: "collaborator",
                };
                return {
                    user(objectId: string) {
                        return {
                            ...result2,
                            subject: {
                                object: {
                                    objectType: "user",
                                    objectId: objectId,
                                },
                            },
                        } as v1.Relationship;
                    },
                };
            },
        };
    },

    project(id: string) {
        const result: Partial<v1.Relationship> = {
            resource: {
                objectType: "project",
                objectId: id,
            },
        };
        return {
            get org() {
                const result2 = {
                    ...result,
                    relation: "org",
                };
                return {
                    organization(objectId: string) {
                        return {
                            ...result2,
                            subject: {
                                object: {
                                    objectType: "organization",
                                    objectId: objectId,
                                },
                            },
                        } as v1.Relationship;
                    },
                };
            },

            get viewer() {
                const result2 = {
                    ...result,
                    relation: "viewer",
                };
                return {
                    user(objectId: string) {
                        return {
                            ...result2,
                            subject: {
                                object: {
                                    objectType: "user",
                                    objectId: objectId,
                                },
                            },
                        } as v1.Relationship;
                    },
                    organization_member(objectId: string) {
                        return {
                            ...result2,
                            subject: {
                                object: {
                                    objectType: "organization",
                                    objectId: objectId,
                                },
                                optionalRelation: "member",
                            },
                        } as v1.Relationship;
                    },
                    get anyUser() {
                        return {
                            ...result2,
                            subject: {
                                object: {
                                    objectType: "user",
                                    objectId: "*",
                                },
                            },
                        } as v1.Relationship;
                    },
                };
            },
        };
    },

    workspace(id: string) {
        const result: Partial<v1.Relationship> = {
            resource: {
                objectType: "workspace",
                objectId: id,
            },
        };
        return {
            get org() {
                const result2 = {
                    ...result,
                    relation: "org",
                };
                return {
                    organization(objectId: string) {
                        return {
                            ...result2,
                            subject: {
                                object: {
                                    objectType: "organization",
                                    objectId: objectId,
                                },
                            },
                        } as v1.Relationship;
                    },
                };
            },

            get owner() {
                const result2 = {
                    ...result,
                    relation: "owner",
                };
                return {
                    user(objectId: string) {
                        return {
                            ...result2,
                            subject: {
                                object: {
                                    objectType: "user",
                                    objectId: objectId,
                                },
                            },
                        } as v1.Relationship;
                    },
                };
            },

            get shared() {
                const result2 = {
                    ...result,
                    relation: "shared",
                };
                return {
                    get anyUser() {
                        return {
                            ...result2,
                            subject: {
                                object: {
                                    objectType: "user",
                                    objectId: "*",
                                },
                            },
                        } as v1.Relationship;
                    },
                };
            },
        };
    },
};
