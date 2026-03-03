package repository

import (
	"bizkit-backend/config"
	"bizkit-backend/internal/model"
)

func GetAllProducts(search string) ([]model.Product, error) {
	var products []model.Product
	query := config.DB.Model(&model.Product{}).
		Preload("Category").
		Preload("Brand").
		Preload("Unit").
		Preload("Variants.Options").
		Preload("Outlets")

	if search != "" {
		query = query.Where("name LIKE ? OR code LIKE ?", "%"+search+"%", "%"+search+"%")
	}

	result := query.Find(&products)
	return products, result.Error
}

func GetProductByID(id uint) (*model.Product, error) {
	var product model.Product
	result := config.DB.
		Preload("Category").
		Preload("Brand").
		Preload("Unit").
		Preload("Variants.Options").
		Preload("Outlets").
		First(&product, id)
	return &product, result.Error
}

func CreateProduct(product *model.Product, variantIDs []uint, outletIDs []uint) error {
	tx := config.DB.Begin()

	if err := tx.Create(product).Error; err != nil {
		tx.Rollback()
		return err
	}

	if len(variantIDs) > 0 {
		var variantObjs []model.VariantCategory
		tx.Find(&variantObjs, variantIDs)
		if err := tx.Model(product).Association("Variants").Replace(variantObjs); err != nil {
			tx.Rollback()
			return err
		}
	}

	if len(outletIDs) > 0 {
		var outletObjs []model.Outlet
		tx.Find(&outletObjs, outletIDs)
		if err := tx.Model(product).Association("Outlets").Replace(outletObjs); err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

func UpdateProduct(product *model.Product, variantIDs []uint, outletIDs []uint) error {
	tx := config.DB.Begin()

	if err := tx.Save(product).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Update variants
	var variantObjs []model.VariantCategory
	if len(variantIDs) > 0 {
		tx.Find(&variantObjs, variantIDs)
	}
	if err := tx.Model(product).Association("Variants").Replace(variantObjs); err != nil {
		tx.Rollback()
		return err
	}

	// Update outlets
	var outletObjs []model.Outlet
	if len(outletIDs) > 0 {
		tx.Find(&outletObjs, outletIDs)
	}
	if err := tx.Model(product).Association("Outlets").Replace(outletObjs); err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}

func DeleteProduct(id uint) error {
	tx := config.DB.Begin()

	var product model.Product
	if err := tx.First(&product, id).Error; err != nil {
		tx.Rollback()
		return err
	}

	tx.Model(&product).Association("Variants").Clear()
	tx.Model(&product).Association("Outlets").Clear()

	if err := tx.Delete(&product).Error; err != nil {
		tx.Rollback()
		return err
	}

	return tx.Commit().Error
}