package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AddOnOption struct {
	ID           uuid.UUID      `gorm:"column:id;type:uuid;primaryKey" json:"id"`
	AddOnGroupID uuid.UUID      `gorm:"column:add_on_group_id;type:uuid;not null" json:"add_on_group_id"`
	Name         string         `gorm:"column:name;type:varchar(255);not null" json:"name"`
	Price        float64        `gorm:"column:price;type:decimal(12,2);not null;default:0" json:"price"`
	IsActive     bool           `gorm:"column:is_active;not null;default:true" json:"is_active"`

	// AddOnGroup   AddOnGroup     `gorm:"foreignKey:AddOnGroupID;references:ID"`
	

	CreatedAt    time.Time      `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time      `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"column:deleted_at;index" json:"deleted_at,omitempty"`
}

func (AddOnOption) TableName() string {
	return "add_on_options"
}