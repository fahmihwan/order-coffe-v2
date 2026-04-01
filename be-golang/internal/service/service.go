package service

type Service struct {
	Menu *MenuService
	Category *CategoryService
	CategoryMenu *CategoryMenuService
	AddOnGroup *AddOnGroupService
	// User *UserService
}
