package service

type Service struct {
	Menu *MenuService
	Category *CategoryService
	CategoryMenu *CategoryMenuService
	AddOnGroup *AddOnGroupService
	AddOnOption *AddOnOptionService
	MenuAddOnGroup *MenuAddOnGroupService
	Room *RoomService
	// User *UserService
}
