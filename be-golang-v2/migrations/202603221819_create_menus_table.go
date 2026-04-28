package migrations

import (
	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func Migration_202603221854() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "202603221854",
		Migrate: func(tx *gorm.DB) error {
			return tx.Exec(`
				CREATE TABLE IF NOT EXISTS menus (
					id UUID NOT NULL PRIMARY KEY,
					img_url TEXT NULL,
					name VARCHAR(100) NOT NULL,
					description TEXT NULL,
					price DECIMAL(10,2) NOT NULL,
					is_active BOOLEAN NOT NULL DEFAULT true,
					created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
					updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
					deleted_at TIMESTAMPTZ NULL
				);
			`).Error
		},
		Rollback: func(tx *gorm.DB) error {
			return tx.Exec(`
				DROP TABLE IF EXISTS menus;
			`).Error
		},
	}
}