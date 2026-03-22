package model

import (
	"time"
)

type Menu struct {
	ID          int64      `gorm:"primaryKey;autoIncrement" json:"id"`
	ImgURL      string     `gorm:"column:img_url;type:text;not null" json:"img_url"`
	Name        string     `gorm:"type:varchar(255);not null" json:"name"`
	Description *string    `gorm:"type:text" json:"description,omitempty"`
	Price       float64    `gorm:"type:decimal(10,2);not null" json:"price"`
	IsActive    bool       `gorm:"column:is_active;default:true" json:"is_active"`
	CreatedAt   time.Time  `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"created_at"`
	UpdatedAt   time.Time  `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"updated_at"`
	DeletedAt   *time.Time `gorm:"type:timestamp" json:"deleted_at,omitempty"`
}

func (Menu) TableName() string {
	return "menus"
}