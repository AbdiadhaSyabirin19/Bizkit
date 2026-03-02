package repository

import (
	"bizkit-backend/config"
	"bizkit-backend/internal/model"
)

func GetAllUnits(search string) ([]model.Unit, error) {
	var units []model.Unit
	query := config.DB.Model(&model.Unit{})

	if search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}

	result := query.Find(&units)
	return units, result.Error
}

func GetUnitByID(id uint) (*model.Unit, error) {
	var unit model.Unit
	result := config.DB.First(&unit, id)
	return &unit, result.Error
}

func CreateUnit(unit *model.Unit) error {
	return config.DB.Create(unit).Error
}

func UpdateUnit(unit *model.Unit) error {
	return config.DB.Save(unit).Error
}

func DeleteUnit(id uint) error {
	return config.DB.Delete(&model.Unit{}, id).Error
}