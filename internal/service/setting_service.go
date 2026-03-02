package service

import (
	"bizkit-backend/internal/model"
	"bizkit-backend/internal/repository"
)

type SettingRequest struct {
	StoreName     string  `json:"store_name"`
	Logo          string  `json:"logo"`
	Tax           float64 `json:"tax"`
	ReceiptFormat string  `json:"receipt_format"`
}

func GetSetting() (*model.Setting, error) {
	return repository.GetSetting()
}

func UpdateSetting(req SettingRequest) (*model.Setting, error) {
	setting, err := repository.GetSetting()
	if err != nil {
		return nil, err
	}

	if req.StoreName != "" {
		setting.StoreName = req.StoreName
	}
	if req.Logo != "" {
		setting.Logo = req.Logo
	}
	if req.Tax >= 0 {
		setting.Tax = req.Tax
	}
	if req.ReceiptFormat != "" {
		setting.ReceiptFormat = req.ReceiptFormat
	}

	err = repository.UpdateSetting(setting)
	return setting, err
}