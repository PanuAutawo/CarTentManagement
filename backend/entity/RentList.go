package entity

import (
	"gorm.io/gorm"
)

type RentList struct {
	gorm.Model

	CarID uint `json:"car_id"`
	Car   *Car `gorm:"foreignKey:CarID" json:"car"`
	Status string "json:"status"

	ManagerID     uint            `json:"manager_id"`
	Manager       *Manager        `gorm:"foreignKey:ManagerID" json:"manager"`
	RentAbleDates []*RentAbleDate `gorm:"foreignKey:RentListID" json:"rent_able_dates"`
	RentContract  []*RentContract `gorm:"foreignKey:RentListID" json:"rent_contracts"` // plural
}
