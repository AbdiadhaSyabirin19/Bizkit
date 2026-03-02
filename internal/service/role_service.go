package service

import (
	"errors"

	"bizkit-backend/internal/model"
	"bizkit-backend/internal/repository"
)

type RoleRequest struct {
	Name string `json:"name" binding:"required"`
}

func GetAllRoles() ([]model.Role, error) {
	return repository.GetAllRoles()
}

func GetRoleByID(id uint) (*model.Role, error) {
	role, err := repository.GetRoleByID(id)
	if err != nil {
		return nil, errors.New("Role tidak ditemukan")
	}
	return role, nil
}

func CreateRole(req RoleRequest) (*model.Role, error) {
	role := model.Role{Name: req.Name}
	err := repository.CreateRole(&role)
	return &role, err
}

func UpdateRole(id uint, req RoleRequest) (*model.Role, error) {
	role, err := repository.GetRoleByID(id)
	if err != nil {
		return nil, errors.New("Role tidak ditemukan")
	}
	role.Name = req.Name
	err = repository.UpdateRole(role)
	return role, err
}

func DeleteRole(id uint) error {
	_, err := repository.GetRoleByID(id)
	if err != nil {
		return errors.New("Role tidak ditemukan")
	}
	return repository.DeleteRole(id)
}