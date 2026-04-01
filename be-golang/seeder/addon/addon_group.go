package addon

import (
	"time"

	"pos-coffeshop/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func stringPtr(s string) *string {
	return &s
}

func SeedAddOnGroup(db *gorm.DB) error {
	now := time.Now()

	groups := []model.AddOnGroup{
		{
			ID:          uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			Title:       "Hot or Ice *",
			Description: stringPtr("Pilih jenis"),
			IsRequired:  true,
			MinSelect:   1,
			MaxSelect:   1,
			CreatedAt:   now,
			UpdatedAt:   now,
			DeletedAt:   gorm.DeletedAt{},
		},
		{
			ID:          uuid.MustParse("22222222-2222-2222-2222-222222222222"),
			Title:       "Additional syrup *",
			Description: stringPtr("pilih hingga 3 opsi"),
			IsRequired:  false,
			MinSelect:   0,
			MaxSelect:   3,
			CreatedAt:   now,
			UpdatedAt:   now,
			DeletedAt:   gorm.DeletedAt{},
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