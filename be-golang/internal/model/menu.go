package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Menu struct {
	ID          uuid.UUID   `gorm:"type:uuid;primaryKey" json:"id"`
	ImgURL      string     `gorm:"column:img_url;type:text;not null" json:"img_url"`
	Name        string     `gorm:"type:varchar(255);not null" json:"name"`
	Description *string    `gorm:"type:text" json:"description,omitempty"`
	Price       float64    `gorm:"type:decimal(10,2);not null" json:"price"`
	IsActive    bool       `gorm:"column:is_active;default:true" json:"is_active"`
	CreatedAt   time.Time  `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time  `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"type:timestamp" json:"deleted_at,omitempty"`
}

func (Menu) TableName() string {
	return "menus"
}