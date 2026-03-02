package repository

import (
	"bizkit-backend/config"
	"bizkit-backend/internal/model"
)

func GetAllPaymentMethods(search string) ([]model.PaymentMethod, error) {
	var methods []model.PaymentMethod
	query := config.DB.Model(&model.PaymentMethod{})

	if search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}

	result := query.Find(&methods)
	return methods, result.Error
}

func GetPaymentMethodByID(id uint) (*model.PaymentMethod, error) {
	var method model.PaymentMethod
	result := config.DB.First(&method, id)
	return &method, result.Error
}

func CreatePaymentMethod(method *model.PaymentMethod) error {
	return config.DB.Create(method).Error
}

func UpdatePaymentMethod(method *model.PaymentMethod) error {
	return config.DB.Save(method).Error
}

func DeletePaymentMethod(id uint) error {
	return config.DB.Delete(&model.PaymentMethod{}, id).Error
}