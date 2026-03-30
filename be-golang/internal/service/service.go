package service

type Service struct {
	Menu *MenuService
	Category *CategoryService
	CategoryMenu *CategoryMenuService
	AddOn *AddOnService
	// User *UserService
}
