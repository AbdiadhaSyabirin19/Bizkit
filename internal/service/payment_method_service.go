package service

import (
	"errors"
	"bizkit-backend/internal/model"
	"bizkit-backend/internal/repository"
)

type PaymentMethodRequest struct {
	Name           string `json:"name" binding:"required"`
	ShowInSale     bool   `json:"show_in_sale"`
	ShowInPurchase bool   `json:"show_in_purchase"`
	OutletID       *uint  `json:"outlet_id"`
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
	method := model.PaymentMethod{
		Name:           req.Name,
		ShowInSale:     req.ShowInSale,
		ShowInPurchase: req.ShowInPurchase,
		OutletID:       req.OutletID,
	}
	err := repository.CreatePaymentMethod(&method)
	if err != nil {
		return nil, err
	}
	result, _ := repository.GetPaymentMethodByID(method.ID)
	return result, nil
}

func UpdatePaymentMethod(id uint, req PaymentMethodRequest) (*model.PaymentMethod, error) {
	method, err := repository.GetPaymentMethodByID(id)
	if err != nil {
		return nil, errors.New("Metode pembayaran tidak ditemukan")
	}
	method.Name           = req.Name
	method.ShowInSale     = req.ShowInSale
	method.ShowInPurchase = req.ShowInPurchase
	method.OutletID       = req.OutletID

	err = repository.UpdatePaymentMethod(method)
	if err != nil {
		return nil, err
	}
	result, _ := repository.GetPaymentMethodByID(method.ID)
	return result, nil
}

func DeletePaymentMethod(id uint) error {
	_, err := repository.GetPaymentMethodByID(id)
	if err != nil {
		return errors.New("Metode pembayaran tidak ditemukan")
	}
	return repository.DeletePaymentMethod(id)
}