package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Category struct {
	ID          uuid.UUID   `gorm:"type:uuid;primaryKey" json:"id"`
	CategoryName string     `gorm:"type:varchar(100);not null" json:"category_name"`
	CategoryMenus []CategoryMenu `json:"category_menus,omitempty" gorm:"foreignKey:CategoryID;references:ID"`
	CreatedAt   time.Time  `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time  `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

func (Category) TableName() string {
	return "categories"
}