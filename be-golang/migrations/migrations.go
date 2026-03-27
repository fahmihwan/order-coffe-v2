package migrations

import "github.com/go-gormigrate/gormigrate/v2"

func GetMigrations() []*gormigrate.Migration {
	return []*gormigrate.Migration{
		Migration_202603221854(),
		SeedMenus(),
		Migration_202603272031(),
		SeedCategories(),
	}
}
