package repository

import (
	"context"
	"errors"
	"fmt"
	"pos-coffeshop/internal/model"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)



type MenuAddOnGroupRepository struct{
	db *gorm.DB	//a pointer to the GORM database connection, which will be used to perform database operations related to the CategoryMenu entity.
}

// interface 
type MenuAddOnGroupRepo interface {
	List(ctx context.Context, filter FilterMenuAddOnGroup) (res []*model.Menu, total int, err error)
	Create(ctx context.Context, menuAddOn *model.MenuAddOnGroup) error
	// setFilter(db *gorm.DB, filter FilterMenuAddOnGroup) *gorm.DB
	// GetByID(ctx context.Context, id string) (*model.MenuAddOnGroup, error)
	GetMenuAddOnGroupByMenuID(ctx context.Context, menuID string) (*model.Menu, error)
	// Update(ctx context.Context, menuAddOn *model.MenuAddOnGroup) error
	Delete(ctx context.Context, id string) error
}

// make sure MenuAddOnGroupRepository implements MenuAddOnGroupRepo interface
// if it doesn't, the code will not compile and will give an error, which helps catch implementation mistakes early in the development process.
var _ MenuAddOnGroupRepo = (*MenuAddOnGroupRepository)(nil)

// constructor function to create a new instance of MenuAddOnGroupRepository with the provided GORM database connection. This allows for dependency injection, making it easier to manage and test the repository.
func NewMenuAddOnGroupRepository(db *gorm.DB) *MenuAddOnGroupRepository {
	return &MenuAddOnGroupRepository{
		db: db,
	}
}

type FilterMenuAddOnGroup struct {
	Pagination
	ID       	*uuid.UUID `json:"id,omitempty"`
	CategoryID      string     `json:"category_id,omitempty"`
	MenuID   string `json:"menu_id,omitempty"`
	CreatedAt   *time.Time `json:"created_at,omitempty"`
	UpdatedAt   *time.Time `json:"updated_at,omitempty"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}

func (r *MenuAddOnGroupRepository) List(ctx context.Context, filter FilterMenuAddOnGroup) (res []*model.Menu, total int, err error) {
	
	funcName := "List"
	tableName := model.Menu{}.TableName()

	// Pastikan slice kosong (bukan nil)
	res = make([]*model.Menu, 0)

	// GORM pakai context (ini bukan OpenTelemetry; ini untuk cancel/timeout dari request)
	db := r.db.WithContext(ctx)

	// Operation `count`
	var count int64
	err = r.setFilter(db, filter).Model(&model.Menu{}).Count(&count).Error

	if err != nil {
		return res, total, fmt.Errorf("failed to %s %s count: %w", funcName, tableName, err)
	}

	if count == 0 {
		return
	}
	total = int(count)

	if filter.SortBy == "" {
		filter.SortBy = "id"
	}

	order := strings.ToUpper(filter.OrderBy)
	desc := order == "DESC" // default ASC kalau kosong / selain DESC

	// Operation `select`
	if err = r.setFilter(db, filter).
		Preload("MenuAddOnGroups").
		Preload("MenuAddOnGroups.AddOnGroup").
		Preload("MenuAddOnGroups.AddOnGroup.AddOnOptions").
		Order(clause.OrderByColumn{
			Column: clause.Column{Name: filter.SortBy},
			Desc:   desc,
		}).
		Limit(filter.Limit).
		Offset(filter.Offset).
		Find(&res).Error; err != nil {
		return res, total, fmt.Errorf("failed to %s %s find: %w", funcName, tableName, err)
	}

	return res, total, nil
}

func (r *MenuAddOnGroupRepository) setFilter(db *gorm.DB, filter FilterMenuAddOnGroup) *gorm.DB {
	if filter.ID != nil {
		db = db.Where("id = ?", filter.ID)
	}
	// if filter.CategoryID != "" {
	// 	db = db.Where("category_id = ?", filter.CategoryID)
	// }
	// if filter.MenuID != "" {
	// 	db = db.Where("menu_id = ?", filter.MenuID)
	// }
	// if filter.CreatedAt != nil {
	// 	db = db.Where("created_at >= ?", filter.CreatedAt)
	// }
	// if filter.UpdatedAt != nil {
	// 	db = db.Where("updated_at >= ?", filter.UpdatedAt)
	// }
	
	db = db.Where("deleted_at IS NULL")
	
	return db
}			

func (r *MenuAddOnGroupRepository) Create(ctx context.Context, AddOnGroup *model.MenuAddOnGroup) error {
	funcName := "Create"
	tableName := model.MenuAddOnGroup{}.TableName()

	db := r.db.WithContext(ctx)

	if err := db.Create(AddOnGroup).Error; err != nil {
		return fmt.Errorf("failed to %s %s: %w", funcName, tableName, err)
	}

	return nil
}


func (r *MenuAddOnGroupRepository) GetMenuAddOnGroupByMenuID(ctx context.Context, menuID string) (*model.Menu, error){
	funcName := "GetByID"
	tableName := model.Menu{}.TableName()

	
	db := r.db.WithContext(ctx)

	var menuAddOnGroup model.Menu
	if err := db.Where("id = ?", menuID).
	Preload("MenuAddOnGroups").
	Preload("MenuAddOnGroups.AddOnGroup").
	Preload("MenuAddOnGroups.AddOnGroup.AddOnOptions").
	First(&menuAddOnGroup).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to %s %s by id: %w", funcName, tableName, err)
	}

	return &menuAddOnGroup, nil	
}

// func (r *MenuAddOnGroupRepository) Update(ctx context.Context, categoryMenu *model.CategoryMenu) error {
// 	funcName := "Update"
// 	tableName := model.CategoryMenu{}.TableName()

// 	db := r.db.WithContext(ctx)

// 	if err := db.Save(categoryMenu).Error; err != nil {
// 		return fmt.Errorf("failed to %s %s: %w", funcName, tableName, err)
// 	}

// 	return nil
// }

func (r *MenuAddOnGroupRepository) Delete(ctx context.Context, id string) error {
	funcName := "Delete"
	tableName := model.MenuAddOnGroup{}.TableName()

	db := r.db.WithContext(ctx)

	if err := db.Where("id = ?", id).Delete(&model.MenuAddOnGroup{}).Error; err != nil {
		return fmt.Errorf("failed to %s %s: %w", funcName, tableName, err)
	}

	return nil
}	