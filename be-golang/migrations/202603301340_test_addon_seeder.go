package migrations

import (
	"pos-coffeshop/seeder/addon"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func SeedAddOn() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "202603301340",
		Migrate: func(tx *gorm.DB) error {
			addon.SeedAddOnGroup(tx)
			addon.SeedAddOnOption(tx)
			return nil
		},
		Rollback: func(tx *gorm.DB) error {
			if err := tx.Exec("DELETE FROM add_on_options").Error; err != nil {
				return err
			}
			if err := tx.Exec("DELETE FROM add_on_groups").Error; err != nil {
				return err
			}
			return nil
		},
	}
}
