package repository

import (
	"context"
	"fmt"
	"pos-coffeshop/internal/model"
	"strings"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type RoomRepository struct {
	db *gorm.DB
}

type RoomRepo interface {
	Create(ctx context.Context, room *model.Room) error
	List(ctx context.Context, filter FilterRoom) (res []*model.Room, total int, err error)
	setFilter(db *gorm.DB, filter FilterRoom) *gorm.DB
	GetByID(ctx context.Context, id string) (*model.Room, error)
	Update(ctx context.Context, room *model.Room) error
	// Delete(ctx context.Context, id string) error
}

var _ RoomRepo = (*RoomRepository)(nil)

func NewRoomRepository(db *gorm.DB) *RoomRepository {
	return &RoomRepository{
		db: db,
	}
}

type FilterRoom struct {
	Pagination
	ID             *uuid.UUID `json:"id,omitempty"`
	QRCode         *string    `json:"qrcode,omitempty"`
	RoomPosition   *string    `json:"room_position,omitempty"`
	DetailLocation *string    `json:"detail_location,omitempty"`
	CreatedAt      *time.Time `json:"created_at,omitempty"`
	UpdatedAt      *time.Time `json:"updated_at,omitempty"`
	DeletedAt      *time.Time `json:"deleted_at,omitempty"`
}



func (r *RoomRepository) List(ctx context.Context, filter FilterRoom) (res []*model.Room, total int, err error) {

	funcName := "List"
	tableName := model.Room{}.TableName()

	// Pastikan slice kosong (bukan nil)
	res = make([]*model.Room, 0)

	// GORM pakai context (ini bukan OpenTelemetry; ini untuk cancel/timeout dari request)
	db := r.db.WithContext(ctx)

	// Operation `count`
	var count int64
	err = r.setFilter(db, filter).Model(&model.Room{}).Count(&count).Error

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


func (r *RoomRepository) setFilter(db *gorm.DB, filter FilterRoom) *gorm.DB {
	if filter.Search != "" {
		like := "%" + filter.Search + "%"
		db = db.Where("name ILIKE ?", like)
	}

	if filter.ID != nil && *filter.ID != uuid.Nil {
		db = db.Where("id = ?", *filter.ID)
	}

	db = db.Where("deleted_at IS NULL")

	return db
}



func (r *RoomRepository) Create(ctx context.Context, room *model.Room) error {

	err := r.db.WithContext(ctx).Create(room).Error
	if err != nil {
		return fmt.Errorf("failed to create room: %w", err)
	}
	return nil
}



func (r *RoomRepository) GetByID(ctx context.Context, id string) (*model.Room, error) {
	var room model.Room

	err := r.db.WithContext(ctx).Where("id = ? AND deleted_at IS NULL", id).First(&room).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("room not found")
		}
		return nil, fmt.Errorf("failed to get room by id: %w", err)
	}

	return &room, nil
}


func (r *RoomRepository) Update(ctx context.Context, room *model.Room) error {
	room.UpdatedAt = time.Now()
	
	err := r.db.WithContext(ctx).
	Debug().
	Model(&model.Room{}).
	Where("id = ? AND deleted_at IS NULL", room.ID).
	Updates(room).Error


	if err != nil {
		return fmt.Errorf("failed to update room: %w", err)
	}

	return nil
}



func (r *RoomRepository) Delete(ctx context.Context, id string) error {
	err := r.db.WithContext(ctx).Where("id = ?", id).Delete(&model.Room{}).Error
	if err != nil {
		return fmt.Errorf("failed to delete room: %w", err)
	}

	return nil
}