package request

import (
	"mime/multipart"
	"pos-coffeshop/internal/model"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type CategoryMenuRequest struct {
	CategoryID  uuid.UUID  `json:"category_id" validate:"required"`
	MenuID      uuid.UUID  `json:"menu_id" validate:"required"`
}

func (r *CategoryMenuRequest) parse(req *multipart.Form) {
	values := req.Value

	categoryID, _ := uuid.Parse(getStringFrom(values["category_id"]))
	r.CategoryID = categoryID

	menuID, _ := uuid.Parse(getStringFrom(values["menu_id"]))
	r.MenuID = menuID	
}

func (r *CategoryMenuRequest) validate() error {
	validate := validator.New()
	return validate.Struct(r)
}

func (r *CategoryMenuRequest) ToCategoryMenu() *model.CategoryMenu {
	categoryMenu := &model.CategoryMenu{
		CategoryID: r.CategoryID,
		MenuID: r.MenuID,

	}
	return categoryMenu
}
