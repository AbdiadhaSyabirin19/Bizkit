package repository

import (
	"bizkit-backend/config"
	"bizkit-backend/internal/model"
)

func GetAllPriceCategories(search string) ([]model.PriceCategory, error) {
	var priceCategories []model.PriceCategory
	query := config.DB.Model(&model.PriceCategory{})

	if search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}

	result := query.Find(&priceCategories)
	return priceCategories, result.Error
}

func GetPriceCategoryByID(id uint) (*model.PriceCategory, error) {
	var priceCategory model.PriceCategory
	result := config.DB.First(&priceCategory, id)
	return &priceCategory, result.Error
}

func CreatePriceCategory(priceCategory *model.PriceCategory) error {
	return config.DB.Create(priceCategory).Error
}

func UpdatePriceCategory(priceCategory *model.PriceCategory) error {
	return config.DB.Save(priceCategory).Error
}

func DeletePriceCategory(id uint) error {
	return config.DB.Delete(&model.PriceCategory{}, id).Error
}
