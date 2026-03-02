package model

import "gorm.io/gorm"

type Product struct {
	gorm.Model
	Name       string           `json:"name" gorm:"not null"`
	CategoryID *uint            `json:"category_id"`
	BrandID    *uint            `json:"brand_id"`
	UnitID     *uint            `json:"unit_id"`
	Price      float64          `json:"price" gorm:"default:0"`
	Status     string           `json:"status" gorm:"default:'active'"`
	Category   Category         `json:"category" gorm:"foreignKey:CategoryID"`
	Brand      Brand            `json:"brand" gorm:"foreignKey:BrandID"`
	Unit       Unit             `json:"unit" gorm:"foreignKey:UnitID"`
	Variants   []VariantCategory `json:"variants" gorm:"many2many:product_variant_categories"`
}