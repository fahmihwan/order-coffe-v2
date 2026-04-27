package migrations

import (
	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func Migration_202604171630() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "202604171630",
		Migrate: func(tx *gorm.DB) error {
			return tx.Exec(`			
			CREATE TABLE IF NOT EXISTS rooms (
				id UUID NOT NULL PRIMARY KEY,
				qrcode TEXT NULL,
				room_position VARCHAR(50) NOT NULL,
				detail_location TEXT NULL,
				created_at TIMESTAMP NULL DEFAULT NULL,
				updated_at TIMESTAMP NULL DEFAULT NULL,
				deleted_at TIMESTAMPTZ NULL
			);
			`).Error
		},
		Rollback: func(tx *gorm.DB) error {
			return tx.Exec(`
				DROP TABLE IF EXISTS rooms;
			`).Error
		},
	}
}