package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AddOnGroup struct {
	ID          uuid.UUID   `gorm:"type:uuid;primaryKey" json:"id"`
	Title       string         `gorm:"column:title;type:varchar(255);not null" json:"title"`
	Description *string        `gorm:"column:description;type:text" json:"description,omitempty"`
	IsRequired  bool           `gorm:"column:is_required;not null;default:false" json:"is_required"`
	MinSelect   int            `gorm:"column:min_select;not null;default:0" json:"min_select"`
	MaxSelect   int            `gorm:"column:max_select;not null;default:1" json:"max_select"`

	AddOnOptions []AddOnOption `json:"add_on_options,omitempty" gorm:"foreignKey:AddOnGroupID;references:ID"`


	CreatedAt   time.Time      `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt   time.Time      `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"column:deleted_at;index" json:"deleted_at,omitempty"`
}

func (AddOnGroup) TableName() string {
	return "add_on_groups"
}