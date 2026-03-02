package service

import (
	"errors"

	"bizkit-backend/internal/model"
	"bizkit-backend/internal/repository"
)

type PaymentMethodRequest struct {
	Name string `json:"name" binding:"required"`
}

func GetAllPaymentMethods(search string) ([]model.PaymentMethod, error) {
	return repository.GetAllPaymentMethods(search)
}

func GetPaymentMethodByID(id uint) (*model.PaymentMethod, error) {
	method, err := repository.GetPaymentMethodByID(id)
	if err != nil {
		return nil, errors.New("Metode pembayaran tidak ditemukan")
	}
	return method, nil
}

func CreatePaymentMethod(req PaymentMethodRequest) (*model.PaymentMethod, error) {
	method := model.PaymentMethod{Name: req.Name}
	err := repository.CreatePaymentMethod(&method)
	return &method, err
}

func UpdatePaymentMethod(id uint, req PaymentMethodRequest) (*model.PaymentMethod, error) {
	method, err := repository.GetPaymentMethodByID(id)
	if err != nil {
		return nil, errors.New("Metode pembayaran tidak ditemukan")
	}
	method.Name = req.Name
	err = repository.UpdatePaymentMethod(method)
	return method, err
}

func DeletePaymentMethod(id uint) error {
	_, err := repository.GetPaymentMethodByID(id)
	if err != nil {
		return errors.New("Metode pembayaran tidak ditemukan")
	}
	return repository.DeletePaymentMethod(id)
}