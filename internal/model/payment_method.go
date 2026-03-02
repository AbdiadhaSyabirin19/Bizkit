package model

import "gorm.io/gorm"

type PaymentMethod struct {
	gorm.Model
	Name string `json:"name" gorm:"not null"`
}