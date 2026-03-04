package service

import (
	"errors"

	"bizkit-backend/internal/model"
	"bizkit-backend/internal/repository"
)

type BrandRequest struct {
	Name string `json:"name" binding:"required"`
	Image string `json:"image"`
}

func GetAllBrands(search string) ([]model.Brand, error) {
	return repository.GetAllBrands(search)
}

func GetBrandByID(id uint) (*model.Brand, error) {
	brand, err := repository.GetBrandByID(id)
	if err != nil {
		return nil, errors.New("Brand tidak ditemukan")
	}
	return brand, nil
}

func CreateBrand(req BrandRequest) (*model.Brand, error) {
	brand := model.Brand{Name: req.Name, Image: req.Image}
	err := repository.CreateBrand(&brand)
	return &brand, err
}

func UpdateBrand(id uint, req BrandRequest) (*model.Brand, error) {
	brand, err := repository.GetBrandByID(id)
	if err != nil {
		return nil, errors.New("Brand tidak ditemukan")
	}
	brand.Name = req.Name
	brand.Image = req.Image
	err = repository.UpdateBrand(brand)
	return brand, err
}

func DeleteBrand(id uint) error {
	_, err := repository.GetBrandByID(id)
	if err != nil {
		return errors.New("Brand tidak ditemukan")
	}
	return repository.DeleteBrand(id)
}