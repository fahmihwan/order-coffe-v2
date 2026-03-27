package menu

import (
	"time"

	"pos-coffeshop/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

func stringPtr(s string) *string {
	return &s
}

func SeedMenu(db *gorm.DB) error {
	now := time.Now()

	menus := []model.Menu{
		{
			ID:          uuid.MustParse("11111111-1111-1111-1111-111111111111"),
			ImgURL:      "https://example.com/images/espresso.jpg",
			Name:        "Espresso",
			Description: stringPtr("Kopi hitam pekat dengan rasa kuat"),
			Price:       18000.00,
			IsActive:    true,
			CreatedAt:   now,
			UpdatedAt:   now,
			DeletedAt:   gorm.DeletedAt{},
		},
		{
			ID:          uuid.MustParse("22222222-2222-2222-2222-222222222222"),
			ImgURL:      "https://example.com/images/americano.jpg",
			Name:        "Americano",
			Description: stringPtr("Espresso dengan tambahan air panas"),
			Price:       20000.00,
			IsActive:    true,
			CreatedAt:   now,
			UpdatedAt:   now,
			DeletedAt:   gorm.DeletedAt{},
		},
		{
			ID:          uuid.MustParse("33333333-3333-3333-3333-333333333333"),
			ImgURL:      "https://example.com/images/cappuccino.jpg",
			Name:        "Cappuccino",
			Description: stringPtr("Espresso dengan susu dan foam lembut"),
			Price:       25000.00,
			IsActive:    true,
			CreatedAt:   now,
			UpdatedAt:   now,
			DeletedAt:   gorm.DeletedAt{},
		},
		{
			ID:          uuid.MustParse("44444444-4444-4444-4444-444444444444"),
			ImgURL:      "https://example.com/images/latte.jpg",
			Name:        "Cafe Latte",
			Description: stringPtr("Kopi susu creamy dengan rasa lembut"),
			Price:       27000.00,
			IsActive:    true,
			CreatedAt:   now,
			UpdatedAt:   now,
			DeletedAt:   gorm.DeletedAt{},
		},
		{
			ID:          uuid.MustParse("55555555-5555-5555-5555-555555555555"),
			ImgURL:      "https://example.com/images/mocha.jpg",
			Name:        "Mocha",
			Description: stringPtr("Perpaduan kopi, susu, dan cokelat"),
			Price:       30000.00,
			IsActive:    false,
			CreatedAt:   now,
			UpdatedAt:   now,
			DeletedAt:   gorm.DeletedAt{},
		},
		{
			ID:          uuid.MustParse("55555555-5555-5555-5555-555555555666"),
			ImgURL:      "https://example.com/images/mocha.jpg",
			Name:        "Mocha",
			Description: stringPtr("Perpaduan kopi, susu, dan cokelat"),
			Price:       30000.00,
			IsActive:    false,
			CreatedAt:   now,
			UpdatedAt:   now,
			DeletedAt:   gorm.DeletedAt{},
		},
	}

	for _, menu := range menus {
		if err := db.Where("id = ?", menu.ID).
			Assign(menu).
			FirstOrCreate(&menu).Error; err != nil {
			return err
		}
	}

	return nil
}