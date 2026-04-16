package request

import (
	"mime/multipart"
	"pos-coffeshop/internal/model"
	"strconv"

	"github.com/go-playground/validator/v10"
)

type MenuRequest struct {
	// ImgURL      string  `json:"img_url" validate:"required"`
	Name        string  `json:"name" validate:"required"`
	Description *string `json:"description,omitempty"`
	Price       float64 `json:"price" validate:"required,gt=0"`
	IsActive    *bool   `json:"is_active,omitempty"`
}



func (r *MenuRequest) parse(req *multipart.Form) {
	values := req.Value

	// r.ImgURL = getStringFrom(values["img_url"])
	r.Name = getStringFrom(values["name"])
	desc := getStringFrom(values["description"])
	if desc != "" {
		r.Description = &desc
	} else {
		r.Description = nil
	}

	priceStr := getStringFrom(values["price"])
	if priceStr != "" {
		if price, err := strconv.ParseFloat(priceStr, 64); err == nil {
			r.Price = price
		}
	}

	isActiveStr := getStringFrom(values["is_active"])
	if isActiveStr != "" {
		if isActive, err := strconv.ParseBool(isActiveStr); err == nil {
			r.IsActive = &isActive
		}
	}
}

func (r *MenuRequest) validate() error {
	validate := validator.New()
	return validate.Struct(r)
}

func (r *MenuRequest) ToMenu() *model.Menu {
	menu := &model.Menu{
		// ImgURL:      r.ImgURL,
		Name:        r.Name,
		Description: r.Description,
		Price:       r.Price,
	}


	if r.IsActive != nil {
		menu.IsActive = *r.IsActive
	}

	return menu
}
