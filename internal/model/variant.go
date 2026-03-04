package model

import "gorm.io/gorm"

type VariantCategory struct {
	gorm.Model
	Name        string          `json:"name" gorm:"not null"`
	Description string          `json:"description"`
	MinSelect   int             `json:"min_select" gorm:"default:0"`
	MaxSelect   int             `json:"max_select" gorm:"default:1"`
	Status      string          `json:"status" gorm:"default:'active'"`
	Options     []VariantOption `json:"options" gorm:"foreignKey:VariantCategoryID"`
}

type VariantOption struct {
	gorm.Model
	VariantCategoryID uint    `json:"variant_category_id"`
	Name              string  `json:"name" gorm:"not null"`
	AdditionalPrice   float64 `json:"additional_price" gorm:"default:0"`
}