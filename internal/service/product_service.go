package service

import (
	"errors"

	"bizkit-backend/internal/model"
	"bizkit-backend/internal/repository"
)

type ProductRequest struct {
	Name       string  `json:"name" binding:"required"`
	CategoryID *uint   `json:"category_id"`
	BrandID    *uint   `json:"brand_id"`
	UnitID     *uint   `json:"unit_id"`
	Price      float64 `json:"price"`
	Status     string  `json:"status"`
	VariantIDs []uint  `json:"variant_ids"`
}

func GetAllProducts(search string) ([]model.Product, error) {
	return repository.GetAllProducts(search)
}

func GetProductByID(id uint) (*model.Product, error) {
	product, err := repository.GetProductByID(id)
	if err != nil {
		return nil, errors.New("Produk tidak ditemukan")
	}
	return product, nil
}

func CreateProduct(req ProductRequest) (*model.Product, error) {
	status := req.Status
	if status == "" {
		status = "active"
	}

	product := model.Product{
		Name:       req.Name,
		CategoryID: req.CategoryID,
		BrandID:    req.BrandID,
		UnitID:     req.UnitID,
		Price:      req.Price,
		Status:     status,
	}

	err := repository.CreateProduct(&product, req.VariantIDs)
	if err != nil {
		return nil, err
	}

	result, err := repository.GetProductByID(product.ID)
	return result, err
}

func UpdateProduct(id uint, req ProductRequest) (*model.Product, error) {
	product, err := repository.GetProductByID(id)
	if err != nil {
		return nil, errors.New("Produk tidak ditemukan")
	}

	product.Name = req.Name
	product.CategoryID = req.CategoryID
	product.BrandID = req.BrandID
	product.UnitID = req.UnitID
	product.Price = req.Price
	if req.Status != "" {
		product.Status = req.Status
	}

	err = repository.UpdateProduct(product, req.VariantIDs)
	if err != nil {
		return nil, err
	}

	result, err := repository.GetProductByID(product.ID)
	return result, err
}

func DeleteProduct(id uint) error {
	_, err := repository.GetProductByID(id)
	if err != nil {
		return errors.New("Produk tidak ditemukan")
	}
	return repository.DeleteProduct(id)
}