package addon

import (
	"time"

	"pos-coffeshop/app/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)


func SeedMenuAddOnGroup(db *gorm.DB) error {
	now := time.Now()

	groups := []model.MenuAddOnGroup{
		{
			ID:           uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			MenuID:       uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			AddOnGroupID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			CreatedAt:    now,
			UpdatedAt:    now,
			DeletedAt:    gorm.DeletedAt{},
		},
		{
			ID:           uuid.MustParse("22222222-2222-2222-2222-222222222222"),
			MenuID:       uuid.MustParse("22222222-2222-2222-2222-222222222222"),
			AddOnGroupID: uuid.MustParse("22222222-2222-2222-2222-222222222222"),
			CreatedAt:    now,
			UpdatedAt:    now,
			DeletedAt:    gorm.DeletedAt{},
		},
	}

	for _, group := range groups {
		if err := db.Where("id = ?", group.ID).
			Assign(group).
			FirstOrCreate(&group).Error; err != nil {
			return err
		}
	}

	return nil
}