package repository

import (
	"bizkit-backend/config"
	"bizkit-backend/internal/model"
	"time"
)

func GetSalesByPeriod(start, end time.Time) ([]model.Sale, error) {
	var sales []model.Sale
	result := config.DB.
		Preload("User").
		Preload("PaymentMethod").
		Preload("Items.Product.Category").
		Preload("Items.Variants.VariantOption").
		Where("created_at BETWEEN ? AND ?", start, end).
		Order("created_at DESC").
		Find(&sales)
	return sales, result.Error
}

func GetSaleItemsByPeriod(start, end time.Time) ([]model.SaleItem, error) {
	var items []model.SaleItem
	result := config.DB.
		Preload("Product.Category").
		Joins("JOIN sales ON sales.id = sale_items.sale_id").
		Where("sales.created_at BETWEEN ? AND ?", start, end).
		Find(&items)
	return items, result.Error
}

func GetAttendanceByDate(date time.Time) ([]model.Attendance, error) {
	var attendances []model.Attendance
	start := date.Format("2006-01-02") + " 00:00:00"
	end := date.Format("2006-01-02") + " 23:59:59"
	result := config.DB.
		Preload("User").
		Where("check_in BETWEEN ? AND ?", start, end).
		Find(&attendances)
	return attendances, result.Error
}

func GetShiftsByPeriod(start, end time.Time) ([]model.Shift, error) {
	var shifts []model.Shift
	result := config.DB.
		Preload("User").
		Where("start_time BETWEEN ? AND ?", start, end).
		Order("start_time DESC").
		Find(&shifts)
	return shifts, result.Error
}