package migrations

import "github.com/go-gormigrate/gormigrate/v2"

func GetMigrations() []*gormigrate.Migration {
	return []*gormigrate.Migration{
		Migration_202603221854(),
		SeedMenus(),
		Migration_202603272031(),
		SeedCategories(),
		Migration_202603292219(),
		SeedCategoryMenus(),
		Migration_202603301329(),
		Migration_202603301333(),
		SeedAddOn(),
		Migration_202604011135(),
		SeedMenuAddOn(),
	}
}
