package migrations

import (
	"pos-coffeshop/app/model"
	"pos-coffeshop/seeder/category_menu"

	"github.com/go-gormigrate/gormigrate/v2"
	"gorm.io/gorm"
)

func SeedCategoryMenus() *gormigrate.Migration {
	return &gormigrate.Migration{
		ID: "202603292225",
		Migrate: func(tx *gorm.DB) error {
			category_menu.SeedCategoryMenu(tx)
		
			return nil
		},
		Rollback: func(tx *gorm.DB) error {
			return tx.Where("id IS NULL").Delete(&model.CategoryMenu{}).Error
				// return tx.Exec("TRUNCATE TABLE menus CASCADE").Error``
		},
	}
}
