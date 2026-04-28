package category_menu

import (
	"time"

	"pos-coffeshop/app/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)


func SeedCategoryMenu(db *gorm.DB) error {
	now := time.Now()

	categoryMenus := []model.CategoryMenu{
		{
			ID:         uuid.MustParse("11111111-1111-1111-1111-111111112222"),
			CategoryID: uuid.MustParse("11111111-1111-1111-1111-111111112222"),
			MenuID:    uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			CreatedAt:  now,
			UpdatedAt:  now,
			DeletedAt:   gorm.DeletedAt{},
		},
		{
			ID:          uuid.MustParse("11111111-1111-1111-1111-111111113333"),
			CategoryID: uuid.MustParse("11111111-1111-1111-1111-111111113333"),
			MenuID:    uuid.MustParse("22222222-2222-2222-2222-222222222222"),
			CreatedAt:   now,
			UpdatedAt:   now,
			DeletedAt:   gorm.DeletedAt{},
		},
	}

	for _, categoryMenu := range categoryMenus {
		if err := db.Where("id = ?", categoryMenu.ID).
			Assign(categoryMenu).
			FirstOrCreate(&categoryMenu).Error; err != nil {
			return err
		}
	}

	return nil
}