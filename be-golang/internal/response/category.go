package response

import (
	"pos-coffeshop/internal/model"

	"github.com/google/uuid"
)

type CategoryMenuResponse struct {
	ID          uuid.UUID            `json:"id"`
	CategoryName string     	 `json:"category_name"`
	Menu []MenuCategoryMenuIdResponse `json:"menu"`
}


func FromCategoryModel(category *model.Category) *CategoryMenuResponse {
	if category == nil {
		return nil
	}

	res := &CategoryMenuResponse{
		ID:          category.ID,
		CategoryName      	: category.CategoryName,
		Menu: make([]MenuCategoryMenuIdResponse, 0),
	}

	for _, menu := range category.CategoryMenus {
		res.Menu = append(res.Menu, MenuCategoryMenuIdResponse{
			ID:          menu.Menu.ID,
			CategoryMenuId: menu.ID,
			ImgURL:      menu.Menu.ImgURL,
			Name:        menu.Menu.Name,
			Description: menu.Menu.Description,
			Price:       menu.Menu.Price,
			IsActive:    menu.Menu.IsActive,
		})
	}
	return res
}

func FromCategoryModels(categories []*model.Category) []*CategoryMenuResponse {
	res := make([]*CategoryMenuResponse, 0, len(categories))
	for _, category := range categories {
		res = append(res, FromCategoryModel(category))
	}
	return res
}