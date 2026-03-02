package model

import (
	"time"
	"gorm.io/gorm"
)

type Attendance struct {
	gorm.Model
	UserID   uint      `json:"user_id"`
	Photo    string    `json:"photo"`
	CheckIn  time.Time `json:"check_in"`
	CheckOut time.Time `json:"check_out"`
	User     User      `json:"user" gorm:"foreignKey:UserID"`
}