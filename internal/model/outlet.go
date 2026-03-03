package model

import "gorm.io/gorm"

type Outlet struct {
	gorm.Model
	Name    string `json:"name"`
	Address string `json:"address"`
	Phone   string `json:"phone"`
	Status  string `json:"status"`
}