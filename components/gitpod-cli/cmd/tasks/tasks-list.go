// Copyright (c) 2022 Gitpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package tasks

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	supervisor_helper "github.com/gitpod-io/gitpod/gitpod-cli/pkg/supervisor-helper"
	supervisor "github.com/gitpod-io/gitpod/supervisor/api"
	"github.com/olekukonko/tablewriter"
	"github.com/spf13/cobra"
)

func ListTasksCmd(cmd *cobra.Command, args []string) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	tasks, err := supervisor_helper.GetTasksList(ctx)
	if err != nil {
		log.Fatalf("cannot get task list: %s", err)
	}

	if len(tasks) == 0 {
		fmt.Println("No tasks detected")
		return
	}

	table := tablewriter.NewWriter(os.Stdout)
	table.SetHeader([]string{"Terminal ID", "Name", "State"})
	table.SetBorders(tablewriter.Border{Left: true, Top: false, Right: true, Bottom: false})
	table.SetCenterSeparator("|")

	mapStatusToColor := map[supervisor.TaskState]int{
		0: tablewriter.FgHiGreenColor,
		1: tablewriter.FgHiGreenColor,
		2: tablewriter.FgHiBlackColor,
	}

	for _, task := range tasks {
		table.Rich([]string{task.Terminal, task.Presentation.Name, task.State.String()}, []tablewriter.Colors{{}, {}, {mapStatusToColor[task.State]}})
	}

	table.Render()
}
