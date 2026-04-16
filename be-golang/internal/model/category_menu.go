package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CategoryMenu struct {
	ID          uuid.UUID   `gorm:"type:uuid;primaryKey" json:"id"`
	CategoryID  uuid.UUID   `gorm:"type:uuid;not null" json:"category_id"`
	MenuID      uuid.UUID   `gorm:"type:uuid;not null" json:"menu_id"`	

	Menu     Menu     `json:"menu" gorm:"foreignKey:MenuID;references:ID"`
	Category Category `json:"category" gorm:"foreignKey:CategoryID;references:ID`

	CreatedAt   time.Time  `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time  `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}

func (CategoryMenu) TableName() string {
	return "category_menus"
}