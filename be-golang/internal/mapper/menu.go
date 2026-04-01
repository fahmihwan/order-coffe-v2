package mapper

import (
	"pos-coffeshop/internal/model"
	"pos-coffeshop/internal/response"
)




func ToMenuWithAddOnModel(menu *model.Menu) *response.MenuWithAddOnResponse {
	if menu == nil {
		return nil
	}

	res := &response.MenuWithAddOnResponse{
		ID:          menu.ID,
		ImgURL:      menu.ImgURL,
		Name:        menu.Name,
		Description: menu.Description,
		Price:       menu.Price,
		IsActive:    menu.IsActive,
		AddOnGroups: make([]response.AddOnGroupResponse, 0),
	}

	for _, menuAddOnGroup := range menu.MenuAddOnGroups {
		group := response.AddOnGroupResponse{
			ID:           menuAddOnGroup.AddOnGroup.ID,
			Title:        menuAddOnGroup.AddOnGroup.Title,
			Description:  menuAddOnGroup.AddOnGroup.Description,
			IsRequired:   menuAddOnGroup.AddOnGroup.IsRequired,
			MinSelect:    menuAddOnGroup.AddOnGroup.MinSelect,
			MaxSelect:    menuAddOnGroup.AddOnGroup.MaxSelect,
			AddOnOptions: make([]response.AddOnOptionResponse, 0),
		}

		for _, option := range menuAddOnGroup.AddOnGroup.AddOnOptions {
			group.AddOnOptions = append(group.AddOnOptions, response.AddOnOptionResponse{
				ID:       option.ID,
				Name:     option.Name,
				Price:    option.Price,
				IsActive: option.IsActive,
				Type:     option.Type,
			})
		}

		res.AddOnGroups = append(res.AddOnGroups, group)
	}

	return res
}

func ToMenuWithAddOnModels(menus []*model.Menu) []*response.MenuWithAddOnResponse {
	res := make([]*response.MenuWithAddOnResponse, 0, len(menus))
	for _, menu := range menus {
		res = append(res, ToMenuWithAddOnModel(menu))
	}
	return res
}