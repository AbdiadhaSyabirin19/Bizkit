package model

import "gorm.io/gorm"

type Unit struct {
	gorm.Model
	Name string `json:"name" gorm:"not null"`
}