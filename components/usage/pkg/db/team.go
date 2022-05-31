// Copyright (c) 2022 Gitpod GmbH. All rights reserved.
// Licensed under the GNU Affero General Public License (AGPL).
// See License-AGPL.txt in the project root for license information.

package db

import (
	"time"
)

type Team struct {
	ID            string    `gorm:"primary_key;column:id;type:char;size:36;" json:"id"`
	Name          string    `gorm:"column:name;type:varchar;size:255;" json:"name"`
	Slug          string    `gorm:"column:slug;type:varchar;size:255;" json:"slug"`
	CreationTime  string    `gorm:"column:creationTime;type:varchar;size:255;" json:"creation_time"`
	Deleted       int32     `gorm:"column:deleted;type:tinyint;default:0;" json:"deleted"`
	LastModified  time.Time `gorm:"column:_lastModified;type:timestamp;default:CURRENT_TIMESTAMP(6);" json:"_last_modified"`
	MarkedDeleted int32     `gorm:"column:markedDeleted;type:tinyint;default:0;" json:"marked_deleted"`
}

// TableName sets the insert table name for this struct type
func (d *Team) TableName() string {
	return "d_b_team"
}
