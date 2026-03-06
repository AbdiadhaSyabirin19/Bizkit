package model

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Name            string  `json:"name" gorm:"not null"`
	Username        string  `json:"username" gorm:"unique;not null"`
	Password        string  `json:"-" gorm:"not null"`
	Email           string  `json:"email"`
	RoleID          *uint   `json:"role_id"`
	OutletID        *uint   `json:"outlet_id"`
	CanAccessCenter bool    `json:"can_access_center" gorm:"default:false"`
	Role            Role    `json:"role" gorm:"foreignKey:RoleID"`
	Outlet          Outlet  `json:"outlet" gorm:"foreignKey:OutletID"`
}