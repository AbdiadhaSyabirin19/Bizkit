package service

import (
	"errors"
	"time"

	"bizkit-backend/internal/model"
	"bizkit-backend/internal/repository"
)

type PromoRequest struct {
	Name           string    `json:"name" binding:"required"`
	Code           string    `json:"code"`
	Type           string    `json:"type" binding:"required"`
	Value          float64   `json:"value" binding:"required"`
	StartDate      time.Time `json:"start_date" binding:"required"`
	EndDate        time.Time `json:"end_date" binding:"required"`
	MinPurchase    float64   `json:"min_purchase"`
	UsageLimit     int       `json:"usage_limit"`
	ProductIDs     []uint    `json:"product_ids"`
	CategoryIDs    []uint    `json:"category_ids"`
}

func GetAllPromos(status string) ([]model.Promo, error) {
	return repository.GetAllPromos(status)
}

func GetPromoByID(id uint) (*model.Promo, error) {
	promo, err := repository.GetPromoByID(id)
	if err != nil {
		return nil, errors.New("Promo tidak ditemukan")
	}
	return promo, nil
}

func CreatePromo(req PromoRequest) (*model.Promo, error) {
	// Tentukan status otomatis berdasarkan tanggal
	now := time.Now()
	status := "active"
	if req.StartDate.After(now) {
		status = "upcoming"
	} else if req.EndDate.Before(now) {
		status = "finished"
	}

	promo := model.Promo{
		Name:           req.Name,
		Code:           req.Code,
		Type:           req.Type,
		Value:          req.Value,
		StartDate:      req.StartDate,
		EndDate:        req.EndDate,
		MinPurchase:    req.MinPurchase,
		UsageLimit:     req.UsageLimit,
		UsageRemaining: req.UsageLimit,
		Status:         status,
	}

	err := repository.CreatePromo(&promo, req.ProductIDs, req.CategoryIDs)
	if err != nil {
		return nil, err
	}

	result, _ := repository.GetPromoByID(promo.ID)
	return result, nil
}

func UpdatePromo(id uint, req PromoRequest) (*model.Promo, error) {
	promo, err := repository.GetPromoByID(id)
	if err != nil {
		return nil, errors.New("Promo tidak ditemukan")
	}

	now := time.Now()
	status := "active"
	if req.StartDate.After(now) {
		status = "upcoming"
	} else if req.EndDate.Before(now) {
		status = "finished"
	}

	promo.Name = req.Name
	promo.Code = req.Code
	promo.Type = req.Type
	promo.Value = req.Value
	promo.StartDate = req.StartDate
	promo.EndDate = req.EndDate
	promo.MinPurchase = req.MinPurchase
	promo.UsageLimit = req.UsageLimit
	promo.Status = status

	err = repository.UpdatePromo(promo, req.ProductIDs, req.CategoryIDs)
	if err != nil {
		return nil, err
	}

	result, _ := repository.GetPromoByID(promo.ID)
	return result, nil
}

func DeletePromo(id uint) error {
	_, err := repository.GetPromoByID(id)
	if err != nil {
		return errors.New("Promo tidak ditemukan")
	}
	return repository.DeletePromo(id)
}