package repository

import (
	"bizkit-backend/config"
	"bizkit-backend/internal/model"
)

func GetAllCategories(search string) ([]model.Category, error) {
	var categories []model.Category
	query := config.DB.Model(&model.Category{})

	if search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}

	result := query.Find(&categories)
	return categories, result.Error
}

func GetCategoryByID(id uint) (*model.Category, error) {
	var category model.Category
	result := config.DB.First(&category, id)
	return &category, result.Error
}

func CreateCategory(category *model.Category) error {
	return config.DB.Create(category).Error
}

func UpdateCategory(category *model.Category) error {
	return config.DB.Save(category).Error
}

func DeleteCategory(id uint) error {
	return config.DB.Delete(&model.Category{}, id).Error
}