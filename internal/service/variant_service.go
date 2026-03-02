package service

import (
	"errors"

	"bizkit-backend/internal/model"
	"bizkit-backend/internal/repository"
)

type VariantOptionRequest struct {
	Name            string  `json:"name" binding:"required"`
	AdditionalPrice float64 `json:"additional_price"`
}

type VariantCategoryRequest struct {
	Name      string                 `json:"name" binding:"required"`
	MinSelect int                    `json:"min_select"`
	MaxSelect int                    `json:"max_select"`
	Status    string                 `json:"status"`
	Options   []VariantOptionRequest `json:"options"`
}

func GetAllVariantCategories(search string) ([]model.VariantCategory, error) {
	return repository.GetAllVariantCategories(search)
}

func GetVariantCategoryByID(id uint) (*model.VariantCategory, error) {
	variant, err := repository.GetVariantCategoryByID(id)
	if err != nil {
		return nil, errors.New("Varian tidak ditemukan")
	}
	return variant, nil
}

func CreateVariantCategory(req VariantCategoryRequest) (*model.VariantCategory, error) {
	status := req.Status
	if status == "" {
		status = "active"
	}

	variant := model.VariantCategory{
		Name:      req.Name,
		MinSelect: req.MinSelect,
		MaxSelect: req.MaxSelect,
		Status:    status,
	}

	for _, o := range req.Options {
		variant.Options = append(variant.Options, model.VariantOption{
			Name:            o.Name,
			AdditionalPrice: o.AdditionalPrice,
		})
	}

	err := repository.CreateVariantCategory(&variant)
	return &variant, err
}

func UpdateVariantCategory(id uint, req VariantCategoryRequest) (*model.VariantCategory, error) {
	variant, err := repository.GetVariantCategoryByID(id)
	if err != nil {
		return nil, errors.New("Varian tidak ditemukan")
	}

	variant.Name = req.Name
	variant.MinSelect = req.MinSelect
	variant.MaxSelect = req.MaxSelect
	if req.Status != "" {
		variant.Status = req.Status
	}

	var options []model.VariantOption
	for _, o := range req.Options {
		options = append(options, model.VariantOption{
			Name:            o.Name,
			AdditionalPrice: o.AdditionalPrice,
		})
	}

	err = repository.UpdateVariantCategory(variant, options)
	return variant, err
}

func DeleteVariantCategory(id uint) error {
	_, err := repository.GetVariantCategoryByID(id)
	if err != nil {
		return errors.New("Varian tidak ditemukan")
	}
	return repository.DeleteVariantCategory(id)
}