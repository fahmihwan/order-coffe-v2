package response

import (
	"github.com/google/uuid"
)

type CategoryResponse struct {
	ID          uuid.UUID            `json:"id"`
	CategoryName string     	 `json:"category_name"`
}

type CategoryMenuResponse struct {
	ID          uuid.UUID            `json:"id"`
	CategoryName string     	 `json:"category_name"`
	Menus []MenuCategoryMenuItemResponse `json:"menus"`
}
