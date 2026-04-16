package request

import (
	"mime/multipart"
	"pos-coffeshop/internal/model"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type AddOnOptionRequest struct {
	Name     string  `json:"name" validate:"required"`
	AddOnGroupId      uuid.UUID  `json:"add_on_group_id" validate:"required"`
	Price    float64 `json:"price" validate:"gte=0"`
	IsActive bool    `json:"is_active"`
	Type     string  `json:"type" validate:"required"`
}



func (r *AddOnOptionRequest) parse(req *multipart.Form) {
	values := req.Value

	r.Name = getStringFrom(values["name"])
	r.AddOnGroupId, _ = uuid.Parse(getStringFrom(values["add_on_group_id"]))
	r.Price = getFloat64From(values["price"])
	r.IsActive = getBoolFrom(values["is_active"])
	r.Type = getStringFrom(values["type"])

}

func (r *AddOnOptionRequest) validate() error {
	validate := validator.New()
	return validate.Struct(r)
}

func (r *AddOnOptionRequest) ToAddOnOption() *model.AddOnOption {
	addOnOption := &model.AddOnOption{
		Name:     r.Name,
		AddOnGroupID: r.AddOnGroupId,
		Price:    r.Price,
		IsActive: r.IsActive,
		Type:     r.Type,
	}

	return addOnOption
}
