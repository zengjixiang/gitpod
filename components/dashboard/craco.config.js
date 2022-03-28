/**
 * Copyright (c) 2021 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
const { whenDev } = require("@craco/craco");

module.exports = {
    style: {
        postcss: {
            plugins: [require("tailwindcss"), require("autoprefixer")],
        },
    },
    ...whenDev(() => ({
        devServer: {
            proxy: {
                "/api": {
                    target: "https://" + process.env.GP_DEV_HOST,
                    ws: true,
                    headers: {
                        host: process.env.GP_DEV_HOST,
                        origin: "https://" + process.env.GP_DEV_HOST,
                        cookie: process.env.GP_DEV_COOKIE,
                    },
                },
            },
        },
    })),
};
