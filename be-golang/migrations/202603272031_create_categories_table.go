package migrations

import (
	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func Migration_202603272031() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "202603272031",
		Migrate: func(tx *gorm.DB) error {
			return tx.Exec(`
				CREATE TABLE IF NOT EXISTS categories (
					id UUID NOT NULL PRIMARY KEY,
					category_name VARCHAR(100) NOT NULL,
					created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
					updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
					deleted_at TIMESTAMPTZ NULL
				);
			`).Error
		},
		Rollback: func(tx *gorm.DB) error {
			return tx.Exec(`
				DROP TABLE IF EXISTS categories;
			`).Error
		},
	}
}