package repository

import (
	"bizkit-backend/config"
	"bizkit-backend/internal/model"
)

func GetAllPaymentMethods(search string) ([]model.PaymentMethod, error) {
	var methods []model.PaymentMethod
	query := config.DB.Preload("Outlet") // ← tambah
	if search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}
	result := query.Find(&methods)
	return methods, result.Error
}

func GetPaymentMethodByID(id uint) (*model.PaymentMethod, error) {
	var method model.PaymentMethod
	result := config.DB.Preload("Outlet").First(&method, id) // ← tambah
	return &method, result.Error
}

func CreatePaymentMethod(method *model.PaymentMethod) error {
	return config.DB.Create(method).Error
}

func UpdatePaymentMethod(method *model.PaymentMethod) error {
	// Select eksplisit agar bool false & nil pointer ikut tersimpan
	return config.DB.Model(method).Select(
		"name",
		"show_in_sale",
		"show_in_purchase",
		"outlet_id",
	).Updates(method).Error
}

func DeletePaymentMethod(id uint) error {
	return config.DB.Delete(&model.PaymentMethod{}, id).Error
}