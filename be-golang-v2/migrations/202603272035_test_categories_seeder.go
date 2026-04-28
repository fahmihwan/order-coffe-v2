package migrations

import (
	"pos-coffeshop/app/model"
	"pos-coffeshop/seeder/category"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func SeedCategories() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "202603272035",
		Migrate: func(tx *gorm.DB) error {
			category.SeedCategory(tx)
			// sector.SeedSubsector(tx)
			return nil
		},
		Rollback: func(tx *gorm.DB) error {
			return tx.Where("id IS NULL").Delete(&model.Category{}).Error
				// return tx.Exec("TRUNCATE TABLE menus CASCADE").Error
		},
	}
}
