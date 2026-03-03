package model

import "gorm.io/gorm"

type Product struct {
	gorm.Model
	Name       string            `json:"name"`
	CategoryID *uint             `json:"category_id"`
	BrandID    *uint             `json:"brand_id"`
	UnitID     *uint             `json:"unit_id"`
	Price      float64           `json:"price"`
	Status     string            `json:"status"`
	Category   *Category         `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	Brand      *Brand            `json:"brand,omitempty" gorm:"foreignKey:BrandID"`
	Unit       *Unit             `json:"unit,omitempty" gorm:"foreignKey:UnitID"`
	Variants   []VariantCategory `json:"variants,omitempty" gorm:"many2many:product_variant_categories;"`
}