package repository

import (
	"bizkit-backend/config"
	"bizkit-backend/internal/model"
)

func GetAllRoles() ([]model.Role, error) {
	var roles []model.Role
	result := config.DB.Find(&roles)
	return roles, result.Error
}

func GetRoleByID(id uint) (*model.Role, error) {
	var role model.Role
	result := config.DB.First(&role, id)
	return &role, result.Error
}

func CreateRole(role *model.Role) error {
	return config.DB.Create(role).Error
}

func UpdateRole(role *model.Role) error {
	return config.DB.Save(role).Error
}

func DeleteRole(id uint) error {
	return config.DB.Delete(&model.Role{}, id).Error
}