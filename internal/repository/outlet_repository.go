package repository

import (
	"bizkit-backend/config"
	"bizkit-backend/internal/model"
)

func GetAllOutlets() ([]model.Outlet, error) {
	var outlets []model.Outlet
	result := config.DB.Find(&outlets)
	return outlets, result.Error
}

func GetOutletByID(id uint) (*model.Outlet, error) {
	var outlet model.Outlet
	result := config.DB.First(&outlet, id)
	return &outlet, result.Error
}

func CreateOutlet(outlet *model.Outlet) error {
	return config.DB.Create(outlet).Error
}

func UpdateOutlet(outlet *model.Outlet) error {
	return config.DB.Save(outlet).Error
}

func DeleteOutlet(id uint) error {
	return config.DB.Delete(&model.Outlet{}, id).Error
}