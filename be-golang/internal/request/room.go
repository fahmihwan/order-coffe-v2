package request

import (
	"mime/multipart"
	"pos-coffeshop/internal/model"

	"github.com/go-playground/validator/v10"
)

type RoomRequest struct {
	QRCode         *string `json:"qrcode" validate:"omitempty"`
	RoomPosition   string  `json:"room_position" validate:"required"`
	DetailLocation *string `json:"detail_location" validate:"omitempty"`
}

func (r *RoomRequest) parse(req *multipart.Form) {
	values := req.Value

	qrcode := getStringFrom(values["qrcode"]);
	if(qrcode != "") {
		r.QRCode = &qrcode
	}
	r.RoomPosition = getStringFrom(values["room_position"])

	detailLocation := getStringFrom(values["detail_location"])
	if(detailLocation != "") {
		r.DetailLocation = &detailLocation
	}
}

func (r *RoomRequest) validate() error {
	validate := validator.New()
	return validate.Struct(r)
}

func (r *RoomRequest) ToRoom() *model.Room {
	return &model.Room{
		QRCode:         r.QRCode,
		RoomPosition:   r.RoomPosition,
		DetailLocation: r.DetailLocation,
	}
}
