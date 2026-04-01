package response

import (
	"pos-coffeshop/internal/model"

	"github.com/google/uuid"
)


type MenuResponse struct {
	ID          uuid.UUID            `json:"id"`
	ImgURL      string              `json:"img_url,omitempty"`
	Name        string               `json:"name"`
	Description *string              `json:"description,omitempty"`
	Price       float64              `json:"price"`
	IsActive    bool                 `json:"is_active"`
	AddOnGroups []AddOnGroupResponse `json:"add_on_groups"`
}


type MenuCategoryMenuIdResponse struct {
	ID          uuid.UUID            `json:"id"`
	CategoryMenuId uuid.UUID            `json:"category_menu_id"`	
	ImgURL      string              `json:"img_url,omitempty"`
	Name        string               `json:"name"`
	Description *string              `json:"description,omitempty"`
	Price       float64              `json:"price"`
	IsActive    bool                 `json:"is_active"`
}



func FromMenuModel(menu *model.Menu) *MenuResponse {
	if menu == nil {
		return nil
	}

	res := &MenuResponse{
		ID:          menu.ID,
		ImgURL:      menu.ImgURL,
		Name:        menu.Name,
		Description: menu.Description,
		Price:       menu.Price,
		IsActive:    menu.IsActive,
		AddOnGroups: make([]AddOnGroupResponse, 0),
	}

	for _, menuAddOnGroup := range menu.MenuAddOnGroups {
		group := AddOnGroupResponse{
			ID:           menuAddOnGroup.AddOnGroup.ID,
			Title:        menuAddOnGroup.AddOnGroup.Title,
			Description:  menuAddOnGroup.AddOnGroup.Description,
			IsRequired:   menuAddOnGroup.AddOnGroup.IsRequired,
			MinSelect:    menuAddOnGroup.AddOnGroup.MinSelect,
			MaxSelect:    menuAddOnGroup.AddOnGroup.MaxSelect,
			AddOnOptions: make([]AddOnOptionResponse, 0),
		}

		for _, option := range menuAddOnGroup.AddOnGroup.AddOnOptions {
			group.AddOnOptions = append(group.AddOnOptions, AddOnOptionResponse{
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

func FromMenuModels(menus []*model.Menu) []*MenuResponse {
	res := make([]*MenuResponse, 0, len(menus))
	for _, menu := range menus {
		res = append(res, FromMenuModel(menu))
	}
	return res
}