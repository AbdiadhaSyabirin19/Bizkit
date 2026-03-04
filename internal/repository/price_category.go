package repository

import (
	"bizkit-backend/config"
	"bizkit-backend/internal/model"
)

func GetAllPriceCategories(search string) ([]model.PriceCategory, error) {
	var categories []model.PriceCategory
	query := config.DB.Model(&model.PriceCategory{})
	if search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}
	return categories, query.Find(&categories).Error
}

func GetPriceCategoryByID(id uint) (*model.PriceCategory, error) {
	var category model.PriceCategory
	result := config.DB.First(&category, id)
	return &category, result.Error
}

func CreatePriceCategory(category *model.PriceCategory) error {
	return config.DB.Create(category).Error
}

func UpdatePriceCategory(category *model.PriceCategory) error {
	return config.DB.Save(category).Error
}

func DeletePriceCategory(id uint) error {
	config.DB.Where("price_category_id = ?", id).Delete(&model.ProductPrice{})
	return config.DB.Delete(&model.PriceCategory{}, id).Error
}

func GetProductPricesByCategory(priceCategoryID uint) ([]model.ProductPrice, error) {
	var prices []model.ProductPrice
	result := config.DB.
		Preload("Product").
		Where("price_category_id = ?", priceCategoryID).
		Find(&prices)
	return prices, result.Error
}


func UpsertProductPrice(productID, priceCategoryID uint, price float64) error {
	var existing model.ProductPrice
	err := config.DB.Where("product_id = ? AND price_category_id = ?", productID, priceCategoryID).First(&existing).Error
	if err != nil {
		// Create
		return config.DB.Create(&model.ProductPrice{
			ProductID:       productID,
			PriceCategoryID: priceCategoryID,
			Price:           price,
		}).Error
	}
	// Update
	existing.Price = price
	return config.DB.Save(&existing).Error
}

func DeleteProductPrice(productID, priceCategoryID uint) error {
	return config.DB.Where("product_id = ? AND price_category_id = ?", productID, priceCategoryID).
		Delete(&model.ProductPrice{}).Error
}

func GetProductPricesByProductID(productID uint) ([]model.ProductPrice, error) {
	var prices []model.ProductPrice
	result := config.DB.
		Preload("PriceCategory").
		Where("product_id = ?", productID).
		Find(&prices)
	return prices, result.Error
}