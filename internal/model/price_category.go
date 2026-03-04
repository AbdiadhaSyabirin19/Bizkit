package model

import "gorm.io/gorm"

type PriceCategory struct {
	gorm.Model
	Name   string         `json:"name" gorm:"not null"`
	Prices []ProductPrice `json:"prices,omitempty" gorm:"foreignKey:PriceCategoryID"`
}

type ProductPrice struct {
	gorm.Model
	ProductID       uint    `json:"product_id"`
	PriceCategoryID uint    `json:"price_category_id"`
	Price           float64 `json:"price" gorm:"default:0"`
	Product         *Product       `json:"product,omitempty" gorm:"foreignKey:ProductID"`
	PriceCategory   *PriceCategory `json:"price_category,omitempty" gorm:"foreignKey:PriceCategoryID"`
}