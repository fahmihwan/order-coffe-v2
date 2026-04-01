package repository

import "gorm.io/gorm"

type Repository struct {
	Menu MenuRepo
	Category CategoryRepo
	CategoryMenu CategoryMenuRepo
	AddOnGroup AddOnGroupRepo
	AddOnOption AddOnOptionRepo
	// Book BookRepo
	// User UserRepo
}

type Pagination struct {
	Page    int    `json:"page,omitempty"`
	Limit   int    `json:"limit,omitempty"`
	Offset  int    `json:"offset,omitempty"`
	SortBy  string `json:"sort_by,omitempty"`
	OrderBy string `json:"order_by,omitempty"`
	Search  string `json:"search,omitempty"`
}

func NewRepository(db *gorm.DB) *Repository {
	return &Repository{
		Menu: NewMenuRepository(db),
		Category: NewCategoryRepository(db),
		CategoryMenu: NewCategoryMenuRepository(db),
		AddOnGroup: NewAddOnGroupRepository(db),
		AddOnOption: NewAddOnOptionRepository(db),
		// Book: NewBookRepository(db),
		// User: NewUserRepository(db),
	}
}
