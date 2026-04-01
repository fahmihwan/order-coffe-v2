package request

type AddOnOptionRequest struct {
	Name     string  `json:"name" validate:"required"`
	Price    float64 `json:"price" validate:"gte=0"`
	IsActive bool    `json:"is_active"`
	Type     string  `json:"type" validate:"required"`
}




// func (r *AddOnGroupRequest) Validate() error {
// 	validate := validator.New()
	
// 	if err := validate.Struct(r); err != nil{
// 		return err;
// 	}

// 	if r.MaxSelect < r.MinSelect {
// 		return fmt.Errorf("max_select must be greater than or equal to min_select")
// 	}

// 	return  nil;
// }

// func (r *AddOnGroupRequest) ToAddOnGroup() *model.AddOnGroup {
// 	addOnGroup := &model.AddOnGroup{
// 		Title:       r.Title,
// 		Description: r.Description,
// 		IsRequired: r.IsRequired,
// 		MinSelect: r.MinSelect,
// 		MaxSelect: r.MaxSelect,
// 	}

	

// 	for _, opt := range r.AddOnOptions {
// 		addOnGroup.AddOnOptions = append(addOnGroup.AddOnOptions, model.AddOnOption{
// 			Name:       opt.Name,
// 			Price:       opt.Price,
// 			IsActive:   opt.IsActive,
// 			Type: opt.Type,
// 		})
// 	}

// 	return addOnGroup
// }



