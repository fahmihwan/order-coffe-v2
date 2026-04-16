package addon

import (
	"time"

	"pos-coffeshop/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func SeedAddOnOption(db *gorm.DB) error {
	now := time.Now()

	options := []model.AddOnOption{
		{
			ID:           uuid.MustParse("aaaaaaa1-1111-1111-1111-111111111111"),
			AddOnGroupID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			Name:         "Hot",
			Price:        0,
			IsActive:     true,
			Type: 	   "radio",
			CreatedAt:   now,
			UpdatedAt:   now,
			DeletedAt:   gorm.DeletedAt{},
		},
		{
			ID:           uuid.MustParse("aaaaaaa2-2222-2222-2222-222222222222"),
			AddOnGroupID: uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			Name:         "Ice",
			Price:        100,
			IsActive:     true,
			Type:        "radio",
			CreatedAt:   now,
			UpdatedAt:   now,
			DeletedAt:   gorm.DeletedAt{},
		},
		{
			ID:           uuid.MustParse("bbbbbbb1-1111-1111-1111-111111111111"),
			AddOnGroupID: uuid.MustParse("22222222-2222-2222-2222-222222222222"),
			Name:         "Vanilla",
			Price:        8000,
			IsActive:     true,
			Type:        "checkbox",
			CreatedAt:   now,
			UpdatedAt:   now,
			DeletedAt:   gorm.DeletedAt{},
		},
		{
			ID:           uuid.MustParse("bbbbbbb2-2222-2222-2222-222222222222"),
			AddOnGroupID: uuid.MustParse("22222222-2222-2222-2222-222222222222"),
			Name:         "Huzzlent",
			Price:        8000,
			IsActive:     true,
			Type:        "checkbox",
			CreatedAt:   now,
			UpdatedAt:   now,
			DeletedAt:   gorm.DeletedAt{},
		},
		{
			ID:           uuid.MustParse("bbbbbbb3-3333-3333-3333-333333333333"),
			AddOnGroupID: uuid.MustParse("22222222-2222-2222-2222-222222222222"),
			Name:         "Caramel",
			Price:        8000,
			IsActive:     true,
			Type:        "checkbox",
			CreatedAt:   now,
			UpdatedAt:   now,
			DeletedAt:   gorm.DeletedAt{},
		},
		{
			ID:           uuid.MustParse("bbbbbbb4-4444-4444-4444-444444444444"),
			AddOnGroupID: uuid.MustParse("22222222-2222-2222-2222-222222222222"),
			Name:         "Sugar",
			Price:        0,
			IsActive:     true,
			Type:        "checkbox",
			CreatedAt:   now,
			UpdatedAt:   now,
			DeletedAt:   gorm.DeletedAt{},
		},
	}

	for _, option := range options {
		if err := db.Where("id = ?", option.ID).
			Assign(option).
			FirstOrCreate(&option).Error; err != nil {
			return err
		}
	}

	return nil
}