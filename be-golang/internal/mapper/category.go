package mapper

import (
	"pos-coffeshop/internal/model"
	"pos-coffeshop/internal/response"
)


func ToCategoryWithMenuModel(category *model.Category) *response.CategoryMenuResponse {
	if category == nil {
		return nil
	}

	res := &response.CategoryMenuResponse{
		ID:          category.ID,
		CategoryName      	: category.CategoryName,
		Menu: make([]response.MenuCategoryMenuItemResponse, 0),
	}

	for _, menu := range category.CategoryMenus {
		res.Menu = append(res.Menu, response.MenuCategoryMenuItemResponse{
			ID:          menu.Menu.ID,
			CategoryMenuId: menu.ID,
			Image:      menu.Menu.ImgURL,
			Name:        menu.Menu.Name,
			Description: menu.Menu.Description,
			Price:       menu.Menu.Price,
			IsActive:    menu.Menu.IsActive,
		})
	}
	return res
}

func FromCategoryWithMenuModels(categories []*model.Category) []*response.CategoryMenuResponse {
	res := make([]*response.CategoryMenuResponse, 0, len(categories))
	for _, category := range categories {
		res = append(res, ToCategoryWithMenuModel(category))
	}
	return res
}