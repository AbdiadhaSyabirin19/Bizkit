package model

import (
	"time"
	"gorm.io/gorm"
)

type Promo struct {
	gorm.Model
	Name           string     `json:"name" gorm:"not null"`
	Code           string     `json:"code"`
	Type           string     `json:"type"`
	Value          float64    `json:"value"`
	StartDate      time.Time  `json:"start_date"`
	EndDate        time.Time  `json:"end_date"`
	MinPurchase    float64    `json:"min_purchase"`
	UsageLimit     int        `json:"usage_limit"`
	UsageRemaining int        `json:"usage_remaining"`
	Status         string     `json:"status" gorm:"default:'active'"`
	Products       []Product  `json:"products" gorm:"many2many:promo_products"`
	Categories     []Category `json:"categories" gorm:"many2many:promo_categories"`
}