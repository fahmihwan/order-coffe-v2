package request

import (
	"mime/multipart"
	"pos-coffeshop/internal/model"

	"github.com/go-playground/validator/v10"
)

type CategoryRequest struct {
	CategoryName string  `json:"category_name" validate:"required"`
}

func (r *CategoryRequest) parse(req *multipart.Form) {
	values := req.Value

	r.CategoryName = getStringFrom(values["category_name"])
	
}

func (r *CategoryRequest) validate() error {
	validate := validator.New()
	return validate.Struct(r)
}

func (r *CategoryRequest) ToCategory() *model.Category {
	category := &model.Category{
		CategoryName: r.CategoryName,
	}
	return category
}
