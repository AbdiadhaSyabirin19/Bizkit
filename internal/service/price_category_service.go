package service

import (
	"errors"

	"bizkit-backend/internal/model"
	"bizkit-backend/internal/repository"
)

type PriceCategoryRequest struct {
	Name string `json:"name" binding:"required"`
}

func GetAllPriceCategories(search string) ([]model.PriceCategory, error) {
	return repository.GetAllPriceCategories(search)
}

func GetPriceCategoryByID(id uint) (*model.PriceCategory, error) {
	return repository.GetPriceCategoryByID(id)
}

func CreatePriceCategory(req PriceCategoryRequest) error {
	priceCategory := &model.PriceCategory{
		Name: req.Name,
	}
	return repository.CreatePriceCategory(priceCategory)
}

func UpdatePriceCategory(id uint, req PriceCategoryRequest) error {
	priceCategory, err := repository.GetPriceCategoryByID(id)
	if err != nil {
		return errors.New("Kategori Harga Tambahan tidak ditemukan")
	}

	priceCategory.Name = req.Name
	return repository.UpdatePriceCategory(priceCategory)
}

func DeletePriceCategory(id uint) error {
	return repository.DeletePriceCategory(id)
}
