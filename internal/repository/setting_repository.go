package repository

import (
	"bizkit-backend/config"
	"bizkit-backend/internal/model"
)

func GetSetting() (*model.Setting, error) {
	var setting model.Setting
	result := config.DB.First(&setting)
	if result.Error != nil {
		// Buat default setting jika belum ada
		setting = model.Setting{
			StoreName:     "Bizkit Store",
			Tax:           0,
			ReceiptFormat: "default",
		}
		config.DB.Create(&setting)
	}
	return &setting, nil
}

func UpdateSetting(setting *model.Setting) error {
	return config.DB.Save(setting).Error
}