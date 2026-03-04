package repository

import (
	"bizkit-backend/config"
	"bizkit-backend/internal/model"
	"math/rand"
	"fmt"

	"gorm.io/gorm"
)

func GetAllPromos(search string) ([]model.Promo, error) {
	var promos []model.Promo
	query := config.DB.Model(&model.Promo{}).
		Preload("Items").
		Preload("SpecialPrices.Product").
		Preload("Vouchers")
	if search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}
	return promos, query.Find(&promos).Error
}

func GetPromoByID(id uint) (*model.Promo, error) {
	var promo model.Promo
	result := config.DB.
		Preload("Items").
		Preload("SpecialPrices.Product").
		Preload("Vouchers").
		First(&promo, id)
	return &promo, result.Error
}

func CreatePromo(promo *model.Promo, items []model.PromoItem, specialPrices []model.PromoSpecialPrice, vouchers []model.PromoVoucher) error {
	tx := config.DB.Begin()

	if err := tx.Create(promo).Error; err != nil {
		tx.Rollback()
		return err
	}

	for i := range items {
		items[i].PromoID = promo.ID
	}
	if len(items) > 0 {
		if err := tx.Create(&items).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	for i := range specialPrices {
		specialPrices[i].PromoID = promo.ID
	}
	if len(specialPrices) > 0 {
		if err := tx.Create(&specialPrices).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	for i := range vouchers {
		vouchers[i].PromoID = promo.ID
	}
	if len(vouchers) > 0 {
		if err := tx.Create(&vouchers).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

func UpdatePromo(promo *model.Promo, items []model.PromoItem, specialPrices []model.PromoSpecialPrice) error {
	tx := config.DB.Begin()

	if err := tx.Save(promo).Error; err != nil {
		tx.Rollback()
		return err
	}

	// Replace items
	tx.Where("promo_id = ?", promo.ID).Delete(&model.PromoItem{})
	for i := range items {
		items[i].PromoID = promo.ID
	}
	if len(items) > 0 {
		if err := tx.Create(&items).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	// Replace special prices
	tx.Where("promo_id = ?", promo.ID).Delete(&model.PromoSpecialPrice{})
	for i := range specialPrices {
		specialPrices[i].PromoID = promo.ID
	}
	if len(specialPrices) > 0 {
		if err := tx.Create(&specialPrices).Error; err != nil {
			tx.Rollback()
			return err
		}
	}

	return tx.Commit().Error
}

func DeletePromo(id uint) error {
	tx := config.DB.Begin()
	tx.Where("promo_id = ?", id).Delete(&model.PromoItem{})
	tx.Where("promo_id = ?", id).Delete(&model.PromoSpecialPrice{})
	tx.Where("promo_id = ?", id).Delete(&model.PromoVoucher{})
	if err := tx.Delete(&model.Promo{}, id).Error; err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit().Error
}

func UpdatePromoUsage(id uint) error {
	return config.DB.Model(&model.Promo{}).
		Where("id = ?", id).
		UpdateColumn("used_count", gorm.Expr("used_count + 1")).Error
}

func GenerateVoucherCodes(promoID uint, count int) error {
	var vouchers []model.PromoVoucher
	for i := 0; i < count; i++ {
		vouchers = append(vouchers, model.PromoVoucher{
			PromoID: promoID,
			Code:    fmt.Sprintf("VC%s%d", randomString(6), i),
		})
	}
	return config.DB.Create(&vouchers).Error
}

func randomString(n int) string {
	const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
func GetPromosByProductID(productID uint, categoryID *uint, brandID *uint) ([]model.Promo, error) {
	var promos []model.Promo

	// Query promo yang berlaku untuk produk ini
	result := config.DB.Where(
		"status = 'active' AND (applies_to = 'all' OR id IN (?) OR id IN (?) OR id IN (?))",
		// applies_to = product
		config.DB.Model(&model.PromoItem{}).
			Select("promo_id").
			Where("ref_type = 'product' AND ref_id = ?", productID),
		// applies_to = category
		config.DB.Model(&model.PromoItem{}).
			Select("promo_id").
			Where("ref_type = 'category' AND ref_id = ?", categoryID),
		// applies_to = brand
		config.DB.Model(&model.PromoItem{}).
			Select("promo_id").
			Where("ref_type = 'brand' AND ref_id = ?", brandID),
	).
		Preload("Items").
		Preload("SpecialPrices").
		Find(&promos)

	return promos, result.Error
}