package model

import "gorm.io/gorm"

type PaymentMethod struct {
	gorm.Model
	Name          string  `json:"name" gorm:"not null"`
	ShowInSale    bool    `json:"show_in_sale" gorm:"default:true"`
	ShowInPurchase bool   `json:"show_in_purchase" gorm:"default:false"`
	OutletID      *uint   `json:"outlet_id"`
	Outlet        Outlet  `json:"outlet" gorm:"foreignKey:OutletID"`
}