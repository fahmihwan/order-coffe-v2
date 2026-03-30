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



type CategoryMenuRepository struct{
	db *gorm.DB	//a pointer to the GORM database connection, which will be used to perform database operations related to the CategoryMenu entity.
}

// interface 
type CategoryMenuRepo interface {
	List(ctx context.Context, filter FilterCategoryMenu) (res []*model.Category, total int, err error)
	Create(ctx context.Context, categoryMenu *model.CategoryMenu) error
	setFilter(db *gorm.DB, filter FilterCategoryMenu) *gorm.DB
	GetByID(ctx context.Context, id string) (*model.CategoryMenu, error)
	Update(ctx context.Context, categoryMenu *model.CategoryMenu) error
	Delete(ctx context.Context, id string) error
}

// make sure CategoryMenuRepository implements CategoryMenuRepo interface
// if it doesn't, the code will not compile and will give an error, which helps catch implementation mistakes early in the development process.
var _ CategoryMenuRepo = (*CategoryMenuRepository)(nil)

// constructor function to create a new instance of CategoryMenuRepository with the provided GORM database connection. This allows for dependency injection, making it easier to manage and test the repository.
func NewCategoryMenuRepository(db *gorm.DB) *CategoryMenuRepository {
	return &CategoryMenuRepository{
		db: db,
	}
}

type FilterCategoryMenu struct {
	Pagination
	ID       	*uuid.UUID `json:"id,omitempty"`
	CategoryID      string     `json:"category_id,omitempty"`
	MenuID   string `json:"menu_id,omitempty"`
	CreatedAt   *time.Time `json:"created_at,omitempty"`
	UpdatedAt   *time.Time `json:"updated_at,omitempty"`
	DeletedAt   *time.Time `json:"deleted_at,omitempty"`
}

func (r *CategoryMenuRepository) List(ctx context.Context, filter FilterCategoryMenu) (res []*model.Category, total int, err error) {
	
	funcName := "List"
	tableName := model.Category{}.TableName()

	// Pastikan slice kosong (bukan nil)
	res = make([]*model.Category, 0)

	// GORM pakai context (ini bukan OpenTelemetry; ini untuk cancel/timeout dari request)
	db := r.db.WithContext(ctx)

	// Operation `count`
	var count int64
	err = r.setFilter(db, filter).Model(&model.Category{}).Count(&count).Error

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
		Preload("CategoryMenus").
		Preload("CategoryMenus.Menu").
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

func (r *CategoryMenuRepository) setFilter(db *gorm.DB, filter FilterCategoryMenu) *gorm.DB {
	if filter.ID != nil {
		db = db.Where("id = ?", filter.ID)
	}
	if filter.CategoryID != "" {
		db = db.Where("category_id = ?", filter.CategoryID)
	}
	if filter.MenuID != "" {
		db = db.Where("menu_id = ?", filter.MenuID)
	}
	if filter.CreatedAt != nil {
		db = db.Where("created_at >= ?", filter.CreatedAt)
	}
	if filter.UpdatedAt != nil {
		db = db.Where("updated_at >= ?", filter.UpdatedAt)
	}
	
	db = db.Where("deleted_at IS NULL")
	
	return db
}			

func (r *CategoryMenuRepository) Create(ctx context.Context, categoryMenu *model.CategoryMenu) error {
	funcName := "Create"
	tableName := model.CategoryMenu{}.TableName()

	db := r.db.WithContext(ctx)

	if err := db.Create(categoryMenu).Error; err != nil {
		return fmt.Errorf("failed to %s %s: %w", funcName, tableName, err)
	}

	return nil
}

func (r *CategoryMenuRepository) GetByID(ctx context.Context, id string) (*model.CategoryMenu, error) {
	funcName := "GetByID"
	tableName := model.CategoryMenu{}.TableName()

	db := r.db.WithContext(ctx)

	var categoryMenu model.CategoryMenu
	if err := db.Where("id = ?", id).First(&categoryMenu).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to %s %s by id: %w", funcName, tableName, err)
	}

	return &categoryMenu, nil
}

func (r *CategoryMenuRepository) Update(ctx context.Context, categoryMenu *model.CategoryMenu) error {
	funcName := "Update"
	tableName := model.CategoryMenu{}.TableName()

	db := r.db.WithContext(ctx)

	if err := db.Save(categoryMenu).Error; err != nil {
		return fmt.Errorf("failed to %s %s: %w", funcName, tableName, err)
	}

	return nil
}

func (r *CategoryMenuRepository) Delete(ctx context.Context, id string) error {
	funcName := "Delete"
	tableName := model.CategoryMenu{}.TableName()

	db := r.db.WithContext(ctx)

	if err := db.Where("id = ?", id).Delete(&model.CategoryMenu{}).Error; err != nil {
		return fmt.Errorf("failed to %s %s: %w", funcName, tableName, err)
	}

	return nil
}	