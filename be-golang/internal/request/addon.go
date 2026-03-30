package request

import (
	"pos-coffeshop/internal/model"

	"github.com/go-playground/validator/v10"
)

type AddOnGroupRequest struct {
	Title        string               `json:"title" validate:"required"`
	Description  *string              `json:"description"`
	IsRequired   bool                 `json:"is_required"`
	MinSelect    int                  `json:"min_select"`
	MaxSelect    int                  `json:"max_select"`
	AddOnOptions []AddOnOptionRequest `json:"add_on_options" validate:"required,dive"`
}

type AddOnOptionRequest struct {
	Name     string  `json:"name" validate:"required"`
	Price    float64 `json:"price"`
	IsActive bool    `json:"is_active"`
}

func (r *AddOnGroupRequest) Validate() error {
	validate := validator.New()
	return validate.Struct(r)
}

func (r *AddOnGroupRequest) ToAddOnGroup() *model.AddOnGroup {
	group := &model.AddOnGroup{
		Title:       r.Title,
		Description: r.Description,
		IsRequired:  r.IsRequired,
		MinSelect:   r.MinSelect,
		MaxSelect:   r.MaxSelect,
	}

	// options := make([]model.AddOnOption, 0, len(r.AddOnOptions))
	// for _, opt := range r.AddOnOptions {
	// 	options = append(options, model.AddOnOption{
	// 		Name:     opt.Name,
	// 		Price:    opt.Price,
	// 		IsActive: opt.IsActive,
	// 	})
	// }

	// group.AddOnOptions = options
	return group
}