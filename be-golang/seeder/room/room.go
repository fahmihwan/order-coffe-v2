package room

import (
	"time"

	"pos-coffeshop/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func stringPtr(s string) *string {
	return &s
}

func SeedRoom(db *gorm.DB) error {
	now := time.Now()

	rooms := []model.Room{
		{
			ID:             uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			QRCode:         stringPtr("ROOM-001-QR"),
			RoomPosition:   "A1",
			DetailLocation: stringPtr("Dekat kasir dan pintu masuk"),
			CreatedAt:      &now,
			UpdatedAt:      &now,
			DeletedAt:      gorm.DeletedAt{},
		},
		{
			ID:             uuid.MustParse("11111111-1111-1111-1111-111111112222"),
			QRCode:         stringPtr("ROOM-002-QR"),
			RoomPosition:   "A2",
			DetailLocation: stringPtr("Dekat kasir dan pintu masuk"),
			CreatedAt:      &now,
			UpdatedAt:      &now,
			DeletedAt:      gorm.DeletedAt{},
		},
	}

	for _, room := range rooms {
		if err := db.Where("id = ?", room.ID).
			Assign(room).
			FirstOrCreate(&room).Error; err != nil {
			return err
		}
	}

	return nil
}