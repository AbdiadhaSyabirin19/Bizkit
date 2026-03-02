package model

import "gorm.io/gorm"

type Setting struct {
	gorm.Model
	StoreName     string  `json:"store_name"`
	Logo          string  `json:"logo"`
	Tax           float64 `json:"tax" gorm:"default:0"`
	ReceiptFormat string  `json:"receipt_format"`
}