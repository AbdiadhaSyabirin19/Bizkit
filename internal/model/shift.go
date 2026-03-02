package model

import (
	"time"
	"gorm.io/gorm"
)

type Shift struct {
	gorm.Model
	UserID     uint      `json:"user_id"`
	StartTime  time.Time `json:"start_time"`
	EndTime    time.Time `json:"end_time"`
	CashIn     float64   `json:"cash_in"`
	CashOut    float64   `json:"cash_out"`
	Difference float64   `json:"difference"`
	User       User      `json:"user" gorm:"foreignKey:UserID"`
}