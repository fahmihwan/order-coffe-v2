package migrations

import (
	"pos-coffeshop/seeder/room"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func SeedRoom() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "202604171634",
		Migrate: func(tx *gorm.DB) error {
			room.SeedRoom(tx)
			return nil
		},
		Rollback: func(tx *gorm.DB) error {
			if err := tx.Exec("DELETE FROM rooms").Error; err != nil {
				return err
			}
			return nil
		},
	}
}
