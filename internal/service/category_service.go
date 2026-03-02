package service

import (
	"errors"

	"bizkit-backend/internal/model"
	"bizkit-backend/internal/repository"
)

type CategoryRequest struct {
	Name string `json:"name" binding:"required"`
}

func GetAllCategories(search string) ([]model.Category, error) {
	return repository.GetAllCategories(search)
}

func GetCategoryByID(id uint) (*model.Category, error) {
	category, err := repository.GetCategoryByID(id)
	if err != nil {
		return nil, errors.New("Kategori tidak ditemukan")
	}
	return category, nil
}

func CreateCategory(req CategoryRequest) (*model.Category, error) {
	category := model.Category{
		Name: req.Name,
	}
	err := repository.CreateCategory(&category)
	return &category, err
}

func UpdateCategory(id uint, req CategoryRequest) (*model.Category, error) {
	category, err := repository.GetCategoryByID(id)
	if err != nil {
		return nil, errors.New("Kategori tidak ditemukan")
	}

	category.Name = req.Name
	err = repository.UpdateCategory(category)
	return category, err
}

func DeleteCategory(id uint) error {
	_, err := repository.GetCategoryByID(id)
	if err != nil {
		return errors.New("Kategori tidak ditemukan")
	}
	return repository.DeleteCategory(id)
}