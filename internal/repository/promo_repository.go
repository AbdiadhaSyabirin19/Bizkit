package repository

import (
	"bizkit-backend/config"
	"bizkit-backend/internal/model"
)

func GetAllPromos(status string) ([]model.Promo, error) {
	var promos []model.Promo
	query := config.DB.Model(&model.Promo{}).
		Preload("Products").
		Preload("Categories")

	if status != "" {
		query = query.Where("status = ?", status)
	}

	result := query.Find(&promos)
	return promos, result.Error
}

func GetPromoByID(id uint) (*model.Promo, error) {
	var promo model.Promo
	result := config.DB.
		Preload("Products").
		Preload("Categories").
		First(&promo, id)
	return &promo, result.Error
}

func CreatePromo(promo *model.Promo, productIDs []uint, categoryIDs []uint) error {
	tx := config.DB.Begin()

	if err := tx.Create(promo).Error; err != nil {
		tx.Rollback()
		return err
	}

	if len(productIDs) > 0 {
		var products []model.Product
		tx.Find(&products, productIDs)
		if err := tx.Model(promo).Association("Products").Replace(products); err != nil {
			tx.Rollback()
			return err
		}
	}

	if len(categoryIDs) > 0 {
		var categories []model.Category
		tx.Find(&categories, categoryIDs)
		if err := tx.Model(promo).Association("Categories").Replace(categories); err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

func UpdatePromo(promo *model.Promo, productIDs []uint, categoryIDs []uint) error {
	tx := config.DB.Begin()

	if err := tx.Save(promo).Error; err != nil {
		tx.Rollback()
		return err
	}

	var products []model.Product
	if len(productIDs) > 0 {
		tx.Find(&products, productIDs)
	}
	if err := tx.Model(promo).Association("Products").Replace(products); err != nil {
		tx.Rollback()
		return err
	}

	var categories []model.Category
	if len(categoryIDs) > 0 {
		tx.Find(&categories, categoryIDs)
	}
	if err := tx.Model(promo).Association("Categories").Replace(categories); err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func DeletePromo(id uint) error {
	tx := config.DB.Begin()

	var promo model.Promo
	if err := tx.First(&promo, id).Error; err != nil {
		tx.Rollback()
		return err
	}

	tx.Model(&promo).Association("Products").Clear()
	tx.Model(&promo).Association("Categories").Clear()

	if err := tx.Delete(&promo).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}
func UpdatePromoUsage(promo *model.Promo) error {
	return config.DB.Model(promo).Update("usage_remaining", promo.UsageRemaining).Error
}