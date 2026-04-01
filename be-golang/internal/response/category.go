package response

import (
	"github.com/google/uuid"
)

type CategoryMenuResponse struct {
	ID          uuid.UUID            `json:"id"`
	CategoryName string     	 `json:"category_name"`
	Menu []MenuCategoryMenuItemResponse `json:"menu"`
}
