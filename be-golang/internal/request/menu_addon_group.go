package request

import (
	"mime/multipart"
	"pos-coffeshop/internal/model"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type MenuAddOnGroupRequest struct {
	AddOnGroupId      uuid.UUID  `json:"add_on_group_id" validate:"required"`
	MenuId	uuid.UUID `json:"menu_id" validate:"required"`
}



func (r *MenuAddOnGroupRequest) parse(req *multipart.Form) {
	values := req.Value

	addOnGroupId, _ := uuid.Parse(getStringFrom(values["add_on_group_id"]))
	r.AddOnGroupId  = addOnGroupId

	menuId, _ := uuid.Parse(getStringFrom(values["menu_id"]))
	r.MenuId = menuId

}

func (r *MenuAddOnGroupRequest) validate() error {
	validate := validator.New()
	return validate.Struct(r)
}

func (r *MenuAddOnGroupRequest) ToMenuAddOnGroup() *model.MenuAddOnGroup {
	menuAddOnOption := &model.MenuAddOnGroup{
		AddOnGroupID: r.AddOnGroupId,
		MenuID: r.MenuId,
	}

	return menuAddOnOption
}
