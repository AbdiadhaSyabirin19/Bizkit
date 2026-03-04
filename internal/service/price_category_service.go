package service

import (
	"errors"

	"bizkit-backend/internal/model"
	"bizkit-backend/internal/repository"
)

type PriceCategoryRequest struct {
	Name string `json:"name"`
}

type ProductPriceRequest struct {
	ProductID uint    `json:"product_id"`
	Price     float64 `json:"price"`
}

func GetAllPriceCategories(search string) ([]model.PriceCategory, error) {
	return repository.GetAllPriceCategories(search)
}

func GetPriceCategoryByID(id uint) (*model.PriceCategory, error) {
	cat, err := repository.GetPriceCategoryByID(id)
	if err != nil {
		return nil, errors.New("Kategori harga tidak ditemukan")
	}
	return cat, nil
}

func CreatePriceCategory(req PriceCategoryRequest) (*model.PriceCategory, error) {
	cat := model.PriceCategory{Name: req.Name}
	err := repository.CreatePriceCategory(&cat)
	return &cat, err
}

func UpdatePriceCategory(id uint, req PriceCategoryRequest) (*model.PriceCategory, error) {
	cat, err := repository.GetPriceCategoryByID(id)
	if err != nil {
		return nil, errors.New("Kategori harga tidak ditemukan")
	}
	cat.Name = req.Name
	err = repository.UpdatePriceCategory(cat)
	return cat, err
}

func DeletePriceCategory(id uint) error {
	_, err := repository.GetPriceCategoryByID(id)
	if err != nil {
		return errors.New("Kategori harga tidak ditemukan")
	}
	return repository.DeletePriceCategory(id)
}

func GetProductPricesByCategory(priceCategoryID uint) ([]model.ProductPrice, error) {
	return repository.GetProductPricesByCategory(priceCategoryID)
}

func UpsertProductPrice(priceCategoryID uint, req ProductPriceRequest) error {
	return repository.UpsertProductPrice(req.ProductID, priceCategoryID, req.Price)
}

func DeleteProductPrice(productID, priceCategoryID uint) error {
	return repository.DeleteProductPrice(productID, priceCategoryID)
}