package model

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Name     string `json:"name" gorm:"not null"`
	Username string `json:"username" gorm:"unique;not null"`
	Password string `json:"-" gorm:"not null"`
	RoleID   *uint  `json:"role_id"`
	Role     Role   `json:"role" gorm:"foreignKey:RoleID"`
}