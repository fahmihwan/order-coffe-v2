package model

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Room struct {
	ID             uuid.UUID      `gorm:"type:uuid;primaryKey" json:"id"`
	QRCode         *string        `gorm:"column:qrcode;type:text" json:"qrcode,omitempty"`
	RoomPosition   string         `gorm:"column:room_position;type:varchar(50);not null" json:"room_position"`
	DetailLocation *string        `gorm:"column:detail_location;type:text" json:"detail_location,omitempty"`
	CreatedAt      *time.Time     `gorm:"column:created_at;type:timestamp;default:null" json:"created_at,omitempty"`
	UpdatedAt      *time.Time     `gorm:"column:updated_at;type:timestamp;default:null" json:"updated_at,omitempty"`
	DeletedAt      gorm.DeletedAt `gorm:"column:deleted_at;index" json:"deleted_at,omitempty"`
}

func (Room) TableName() string {
	return "rooms"
}