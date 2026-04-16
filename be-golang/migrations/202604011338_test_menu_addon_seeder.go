package migrations

import (
	"pos-coffeshop/seeder/addon"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func SeedMenuAddOn() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "202604011338",
		Migrate: func(tx *gorm.DB) error {
			addon.SeedMenuAddOnGroup(tx)
			return nil
		},
		Rollback: func(tx *gorm.DB) error {
			if err := tx.Exec("DELETE FROM menu_add_on_groups").Error; err != nil {
				return err
			}
			return nil
		},
	}
}
