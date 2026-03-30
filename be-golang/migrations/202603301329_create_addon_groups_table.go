package migrations

import (
	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func Migration_202603301329() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "202603301329",
		Migrate: func(tx *gorm.DB) error {
			return tx.Exec(`
			CREATE TABLE add_on_groups (
				id UUID NOT NULL PRIMARY KEY,
				title VARCHAR(255) NOT NULL,
				description TEXT,
				is_required BOOLEAN NOT NULL DEFAULT FALSE,
				min_select INT NOT NULL DEFAULT 0,
				max_select INT NOT NULL DEFAULT 1,
				created_at TIMESTAMP NULL DEFAULT NULL,
				updated_at TIMESTAMP NULL DEFAULT NULL,
				deleted_at TIMESTAMPTZ NULL
			);
			`).Error
		},
		Rollback: func(tx *gorm.DB) error {
			return tx.Exec(`
				DROP TABLE IF EXISTS add_on_groups;
			`).Error
		},
	}
}