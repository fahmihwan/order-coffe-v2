package category

import (
	"time"

	"pos-coffeshop/internal/model"

	"github.com/google/uuid"
	"gorm.io/gorm"
)


func SeedCategory(db *gorm.DB) error {
	now := time.Now()

	categories := []model.Category{
		{
			ID:          uuid.MustParse("11111111-1111-1111-1111-111111112222"),
			CategoryName:        "Rekomendasi",
			CreatedAt:   now,
			UpdatedAt:   now,
			DeletedAt:   gorm.DeletedAt{},
		},
		{
			ID:          uuid.MustParse("11111111-1111-1111-1111-111111113333"),
			CategoryName:  "Coffe",
			CreatedAt:   now,
			UpdatedAt:   now,
			DeletedAt:   gorm.DeletedAt{},
		},
	}

	for _, category := range categories {
		if err := db.Where("id = ?", category.ID).
			Assign(category).
			FirstOrCreate(&category).Error; err != nil {
			return err
		}
	}

	return nil
}