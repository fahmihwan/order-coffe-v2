package request

import (
	"mime/multipart"
	"pos-coffeshop/internal/model"

	"github.com/go-playground/validator/v10"
)

type AddOnGroupRequest struct {
	Title        string               `json:"title" validate:"required"`
	Description  *string              `json:"description,omitempty"`
	IsRequired   bool                 `json:"is_required"`
	MinSelect    int                  `json:"min_select" validate:"gte=0"`
	MaxSelect    int                  `json:"max_select" validate:"gte=0"`
	Type         string               `json:"type"`
}

func (r *AddOnGroupRequest) parse(req *multipart.Form) {
	values := req.Value

	r.Title = getStringFrom(values["title"])

	desc := getStringFrom(values["description"])
	if desc != "" {
		r.Description = &desc
	} else {
		r.Description = nil
	}	
	r.IsRequired = getBoolFrom(values["is_required"])
	r.MinSelect = getIntFrom(values["min_select"])
	r.MaxSelect = getIntFrom(values["max_select"])
	r.Type = getStringFrom(values["type"])
}

func (r *AddOnGroupRequest) validate() error {
	validate := validator.New()
	return validate.Struct(r)
}

func (r *AddOnGroupRequest) ToAddOnGroup() *model.AddOnGroup {
	addOnGroup := &model.AddOnGroup{
		Title:       r.Title,
		Description: r.Description,
		IsRequired:  r.IsRequired,
		MinSelect:   r.MinSelect,
		MaxSelect:   r.MaxSelect,
		Type: 		 r.Type,	
	}

	return addOnGroup
}
