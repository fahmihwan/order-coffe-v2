package migrations

import (
	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func Migration_202603301333() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "202603301333",
		Migrate: func(tx *gorm.DB) error {
			return tx.Exec(`
			CREATE TABLE add_on_options (
				id UUID NOT NULL PRIMARY KEY,
				add_on_group_id UUID NOT NULL,
				name VARCHAR(255) NOT NULL,
				price NUMERIC(12,2) NOT NULL DEFAULT 0,
				is_active BOOLEAN NOT NULL DEFAULT TRUE,
				created_at TIMESTAMP NULL DEFAULT NULL,
				updated_at TIMESTAMP NULL DEFAULT NULL,
				deleted_at TIMESTAMPTZ NULL,
				CONSTRAINT fk_add_on_options_group
					FOREIGN KEY (add_on_group_id)
					REFERENCES add_on_groups(id)
					ON DELETE CASCADE
			);
			`).Error
		},
		Rollback: func(tx *gorm.DB) error {
			return tx.Exec(`
				DROP TABLE IF EXISTS add_on_options;
			`).Error
		},
	}
}