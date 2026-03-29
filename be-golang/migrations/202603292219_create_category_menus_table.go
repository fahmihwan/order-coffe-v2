package migrations

import (
	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func Migration_202603292219() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "202603292219",
		Migrate: func(tx *gorm.DB) error {
			return tx.Exec(`
			CREATE TABLE IF NOT EXISTS category_menus (
				id UUID NOT NULL PRIMARY KEY,
				category_id UUID NOT NULL,
				menu_id UUID NOT NULL,
				created_at TIMESTAMP NULL DEFAULT NULL,
				updated_at TIMESTAMP NULL DEFAULT NULL,
				deleted_at TIMESTAMPTZ NULL,

				CONSTRAINT fk_category_menus_category
					FOREIGN KEY (category_id) REFERENCES categories(id)
					ON DELETE CASCADE,

				CONSTRAINT fk_category_menus_menu
					FOREIGN KEY (menu_id) REFERENCES menus(id)
					ON DELETE CASCADE,

				CONSTRAINT uq_category_menu UNIQUE (category_id, menu_id)
			);
			`).Error
		},
		Rollback: func(tx *gorm.DB) error {
			return tx.Exec(`
				DROP TABLE IF EXISTS category_menus;
			`).Error
		},
	}
}