package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Menu struct {
	ID          uuid.UUID   `gorm:"type:uuid;primaryKey" json:"id"`
	ImgURL      *string     `gorm:"column:img_url;type:text;" json:"img_url,omitempty"`
	Name        string     `gorm:"type:varchar(100);not null" json:"name"`
	Description *string    `gorm:"type:text" json:"description,omitempty"`
	Price       float64    `gorm:"type:decimal(10,2);not null" json:"price"`
	IsActive    bool       `gorm:"column:is_active;not null" json:"is_active"`


	MenuAddOnGroups []MenuAddOnGroup `json:"menu_add_on_groups,omitempty" gorm:"foreignKey:MenuID;references:ID"`

	CreatedAt   time.Time  `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time  `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"updated_at"`
	// DeletedAt   gorm.DeletedAt `gorm:"type:timestamp" json:"deleted_at,omitempty"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

func (Menu) TableName() string {
	return "menus"
}