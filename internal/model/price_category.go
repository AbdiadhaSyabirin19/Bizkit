package model

import "gorm.io/gorm"

type PriceCategory struct {
	gorm.Model
	Name string `json:"name" gorm:"not null"`
}
