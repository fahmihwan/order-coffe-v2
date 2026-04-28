package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MenuAddOnGroup struct {
	ID           uuid.UUID `gorm:"type:uuid;primaryKey" json:"id"`
	MenuID       uuid.UUID `gorm:"column:menu_id;type:uuid;not null" json:"menu_id"`
	AddOnGroupID uuid.UUID `gorm:"column:add_on_group_id;type:uuid;not null" json:"add_on_group_id"`

	// Menu       Menu       `gorm:"foreignKey:MenuID;references:ID" json:"menu,omitempty"`
	AddOnGroup AddOnGroup `gorm:"foreignKey:AddOnGroupID;references:ID" json:"add_on_group,omitempty"`

	CreatedAt time.Time      `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt time.Time      `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"column:deleted_at;index" json:"deleted_at,omitempty"`
}

func (MenuAddOnGroup) TableName() string {
	return "menu_add_on_groups"
}