package migrations

import (
	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func Migration_202604011135() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "202604011135",
		Migrate: func(tx *gorm.DB) error {
			return tx.Exec(`			
			CREATE TABLE IF NOT EXISTS menu_add_on_groups (
				id UUID NOT NULL PRIMARY KEY,
				menu_id UUID NOT NULL,
				add_on_group_id UUID NOT NULL,
				created_at TIMESTAMP NULL DEFAULT NULL,
				updated_at TIMESTAMP NULL DEFAULT NULL,
				deleted_at TIMESTAMPTZ NULL,

				CONSTRAINT fk_menu_add_on_groups_menu
					FOREIGN KEY (menu_id)
					REFERENCES menus(id)
					ON DELETE CASCADE,

				CONSTRAINT fk_menu_add_on_groups_add_on_group
					FOREIGN KEY (add_on_group_id)
					REFERENCES add_on_groups(id)
					ON DELETE CASCADE
			);
			`).Error
		},
		Rollback: func(tx *gorm.DB) error {
			return tx.Exec(`
				DROP TABLE IF EXISTS menu_add_on_groups;
			`).Error
		},
	}
}