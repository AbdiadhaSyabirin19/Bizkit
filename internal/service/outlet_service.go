package service

import (
	"errors"

	"bizkit-backend/internal/model"
	"bizkit-backend/internal/repository"
)

type OutletRequest struct {
	Name    string `json:"name"`
	Address string `json:"address"`
	Phone   string `json:"phone"`
	Status  string `json:"status"`
}

func GetAllOutlets() ([]model.Outlet, error) {
	return repository.GetAllOutlets()
}

func GetOutletByID(id uint) (*model.Outlet, error) {
	outlet, err := repository.GetOutletByID(id)
	if err != nil {
		return nil, errors.New("Outlet tidak ditemukan")
	}
	return outlet, nil
}

func CreateOutlet(req OutletRequest) (*model.Outlet, error) {
	if req.Status == "" {
		req.Status = "active"
	}
	outlet := model.Outlet{
		Name:    req.Name,
		Address: req.Address,
		Phone:   req.Phone,
		Status:  req.Status,
	}
	err := repository.CreateOutlet(&outlet)
	return &outlet, err
}

func UpdateOutlet(id uint, req OutletRequest) (*model.Outlet, error) {
	outlet, err := repository.GetOutletByID(id)
	if err != nil {
		return nil, errors.New("Outlet tidak ditemukan")
	}
	outlet.Name = req.Name
	outlet.Address = req.Address
	outlet.Phone = req.Phone
	if req.Status != "" {
		outlet.Status = req.Status
	}
	err = repository.UpdateOutlet(outlet)
	return outlet, err
}

func DeleteOutlet(id uint) error {
	_, err := repository.GetOutletByID(id)
	if err != nil {
		return errors.New("Outlet tidak ditemukan")
	}
	return repository.DeleteOutlet(id)
}