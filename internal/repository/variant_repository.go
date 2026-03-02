package repository

import (
	"bizkit-backend/config"
	"bizkit-backend/internal/model"
)

func GetAllVariantCategories(search string) ([]model.VariantCategory, error) {
	var variants []model.VariantCategory
	query := config.DB.Model(&model.VariantCategory{}).Preload("Options")

	if search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}

	result := query.Find(&variants)
	return variants, result.Error
}

func GetVariantCategoryByID(id uint) (*model.VariantCategory, error) {
	var variant model.VariantCategory
	result := config.DB.Preload("Options").First(&variant, id)
	return &variant, result.Error
}

func CreateVariantCategory(variant *model.VariantCategory) error {
	return config.DB.Create(variant).Error
}

func UpdateVariantCategory(variant *model.VariantCategory, options []model.VariantOption) error {
	tx := config.DB.Begin()

	if err := tx.Save(variant).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Hapus options lama lalu insert baru
	if err := tx.Where("variant_category_id = ?", variant.ID).Delete(&model.VariantOption{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	for i := range options {
		options[i].VariantCategoryID = variant.ID
		if err := tx.Create(&options[i]).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

func DeleteVariantCategory(id uint) error {
	tx := config.DB.Begin()

	if err := tx.Where("variant_category_id = ?", id).Delete(&model.VariantOption{}).Error; err != nil {
		tx.Rollback()
		return err
	}

	if err := tx.Delete(&model.VariantCategory{}, id).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func GetVariantOptionByID(id uint, option *model.VariantOption) error {
	return config.DB.First(option, id).Error
}