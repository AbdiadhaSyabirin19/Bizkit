package service

import (
	"errors"

	"bizkit-backend/internal/model"
	"bizkit-backend/internal/repository"
)

type UnitRequest struct {
	Name string `json:"name" binding:"required"`
}

func GetAllUnits(search string) ([]model.Unit, error) {
	return repository.GetAllUnits(search)
}

func GetUnitByID(id uint) (*model.Unit, error) {
	unit, err := repository.GetUnitByID(id)
	if err != nil {
		return nil, errors.New("Satuan tidak ditemukan")
	}
	return unit, nil
}

func CreateUnit(req UnitRequest) (*model.Unit, error) {
	unit := model.Unit{Name: req.Name}
	err := repository.CreateUnit(&unit)
	return &unit, err
}

func UpdateUnit(id uint, req UnitRequest) (*model.Unit, error) {
	unit, err := repository.GetUnitByID(id)
	if err != nil {
		return nil, errors.New("Satuan tidak ditemukan")
	}
	unit.Name = req.Name
	err = repository.UpdateUnit(unit)
	return unit, err
}

func DeleteUnit(id uint) error {
	_, err := repository.GetUnitByID(id)
	if err != nil {
		return errors.New("Satuan tidak ditemukan")
	}
	return repository.DeleteUnit(id)
}