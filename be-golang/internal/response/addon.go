package response

import "github.com/google/uuid"

type AddOnGroupResponse struct {
	ID           uuid.UUID             `json:"id"`
	Title        string                `json:"title"`
	Description  *string               `json:"description,omitempty"`
	IsRequired   bool                  `json:"is_required"`
	MinSelect    int                   `json:"min_select"`
	MaxSelect    int                   `json:"max_select"`
	MenuAddOnGroupId uuid.UUID         `json:"menu_add_on_group_id,omitempty"`
	AddOnOptions []AddOnOptionResponse `json:"add_on_options"`
}

type AddOnOptionResponse struct {
	ID       uuid.UUID `json:"id"`
	Name     string    `json:"name"`
	Price    float64   `json:"price"`
	IsActive bool      `json:"is_active"`
	Type     string    `json:"type"`
}
