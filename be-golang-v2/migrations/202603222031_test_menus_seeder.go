package migrations

import (
	"pos-coffeshop/app/model"
	"pos-coffeshop/seeder/menu"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func SeedMenus() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "202603222031",
		Migrate: func(tx *gorm.DB) error {
			menu.SeedMenu(tx)
			// sector.SeedSubsector(tx)
			return nil
		},
		Rollback: func(tx *gorm.DB) error {
			return tx.Where("id IS NULL").Delete(&model.Menu{}).Error
				// return tx.Exec("TRUNCATE TABLE menus CASCADE").Error
		},
	}
}
