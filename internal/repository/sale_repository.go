package repository

import (
	"bizkit-backend/config"
	"bizkit-backend/internal/model"
	"time"
)

func GetAllSales(startDate, endDate string) ([]model.Sale, error) {
	var sales []model.Sale
	query := config.DB.Model(&model.Sale{}).
		Preload("User").
		Preload("PaymentMethod").
		Preload("Promo").
		Preload("Items.Product").
		Preload("Items.Variants.VariantOption")

	if startDate != "" && endDate != "" {
		query = query.Where("created_at BETWEEN ? AND ?", startDate, endDate)
	}

	result := query.Order("created_at DESC").Find(&sales)
	return sales, result.Error
}

func GetSaleByID(id uint) (*model.Sale, error) {
	var sale model.Sale
	result := config.DB.
		Preload("User").
		Preload("PaymentMethod").
		Preload("Promo").
		Preload("Items.Product").
		Preload("Items.Variants.VariantOption").
		First(&sale, id)
	return &sale, result.Error
}

func GetSaleByInvoice(invoice string) (*model.Sale, error) {
	var sale model.Sale
	result := config.DB.Where("invoice_number = ?", invoice).First(&sale)
	return &sale, result.Error
}

func CreateSale(sale *model.Sale) error {
	return config.DB.Create(sale).Error
}

func GetDailySales(date time.Time) ([]model.Sale, error) {
	var sales []model.Sale
	start := date.Format("2006-01-02") + " 00:00:00"
	end := date.Format("2006-01-02") + " 23:59:59"

	result := config.DB.
		Preload("PaymentMethod").
		Preload("Items.Product").
		Where("created_at BETWEEN ? AND ?", start, end).
		Order("created_at DESC").
		Find(&sales)
	return sales, result.Error
}