package response

import (
	"github.com/google/uuid"
)

type MenuResponse struct {
	ID          uuid.UUID            `json:"id"`
	Image      string              `json:"image,omitempty"`
	Name        string               `json:"name"`
	Description *string              `json:"description,omitempty"`
	Price       float64              `json:"price"`
	IsActive    bool                 `json:"is_active"`
}


type MenuWithAddOnResponse struct {
	ID          uuid.UUID            `json:"id"`
	Image      string              `json:"image,omitempty"`
	Name        string               `json:"name"`
	Description *string              `json:"description,omitempty"`
	Price       float64              `json:"price"`
	IsActive    bool                 `json:"is_active"`
	AddOnGroups []AddOnGroupResponse `json:"add_on_groups"`
}


type MenuCategoryMenuItemResponse struct {
	ID          uuid.UUID            `json:"id"`
	CategoryMenuId uuid.UUID            `json:"category_menu_id"`	
	Image      string              `json:"image,omitempty"`
	Name        string               `json:"name"`
	Description *string              `json:"description,omitempty"`
	Price       float64              `json:"price"`
	IsActive    bool                 `json:"is_active"`
}
