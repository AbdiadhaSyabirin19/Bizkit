package repository

import (
	"bizkit-backend/config"
	"bizkit-backend/internal/model"
)

func GetAllBrands(search string) ([]model.Brand, error) {
	var brands []model.Brand
	query := config.DB.Model(&model.Brand{})

	if search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}

	result := query.Find(&brands)
	return brands, result.Error
}

func GetBrandByID(id uint) (*model.Brand, error) {
	var brand model.Brand
	result := config.DB.First(&brand, id)
	return &brand, result.Error
}

func CreateBrand(brand *model.Brand) error {
	return config.DB.Create(brand).Error
}

func UpdateBrand(brand *model.Brand) error {
	return config.DB.Save(brand).Error
}

func DeleteBrand(id uint) error {
	return config.DB.Delete(&model.Brand{}, id).Error
}