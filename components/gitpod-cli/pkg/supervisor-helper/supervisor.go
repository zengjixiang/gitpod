// Copyright (c) 2022 Gitpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package supervisor_helper

import (
	"log"
	"os"

	"google.golang.org/grpc"
)

var conn *grpc.ClientConn

func init() {
	supervisorAddr := os.Getenv("SUPERVISOR_ADDR")
	if supervisorAddr == "" {
		supervisorAddr = "localhost:22999"
	}
	c, err := grpc.Dial(supervisorAddr, grpc.WithInsecure())
	if err != nil {
		log.Fatalf("failed connecting to supervisor: %s", err)
	}
	conn = c
}
