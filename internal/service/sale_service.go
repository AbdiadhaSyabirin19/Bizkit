package service

import (
	"errors"
	"fmt"
	"time"

	"bizkit-backend/internal/model"
	"bizkit-backend/internal/repository"
)

type SaleItemVariantRequest struct {
	VariantOptionID uint `json:"variant_option_id" binding:"required"`
}

type SaleItemRequest struct {
	ProductID uint                     `json:"product_id" binding:"required"`
	Quantity  int                      `json:"quantity" binding:"required"`
	Variants  []SaleItemVariantRequest `json:"variants"`
}

type SaleRequest struct {
	PaymentMethodID uint              `json:"payment_method_id" binding:"required"`
	PromoID         *uint             `json:"promo_id"`
	Items           []SaleItemRequest `json:"items" binding:"required"`
}

func generateInvoiceNumber() string {
	now := time.Now()
	return fmt.Sprintf("INV-%s-%d", now.Format("20060102"), now.UnixNano()%10000)
}

func CreateSale(req SaleRequest, userID uint) (*model.Sale, error) {
	if len(req.Items) == 0 {
		return nil, errors.New("Item transaksi tidak boleh kosong")
	}

	var subtotal float64
	var saleItems []model.SaleItem

	// Hitung subtotal & build items
	for _, itemReq := range req.Items {
		product, err := repository.GetProductByID(itemReq.ProductID)
		if err != nil {
			return nil, fmt.Errorf("Produk ID %d tidak ditemukan", itemReq.ProductID)
		}

		itemSubtotal := product.Price * float64(itemReq.Quantity)

		// Hitung tambahan dari varian
		var saleItemVariants []model.SaleItemVariant
		for _, v := range itemReq.Variants {
			var option model.VariantOption
			if err := repository.GetVariantOptionByID(v.VariantOptionID, &option); err != nil {
				return nil, fmt.Errorf("Variant option ID %d tidak ditemukan", v.VariantOptionID)
			}
			itemSubtotal += option.AdditionalPrice * float64(itemReq.Quantity)
			saleItemVariants = append(saleItemVariants, model.SaleItemVariant{
				VariantOptionID: v.VariantOptionID,
				AdditionalPrice: option.AdditionalPrice,
			})
		}

		subtotal += itemSubtotal
		saleItems = append(saleItems, model.SaleItem{
			ProductID: itemReq.ProductID,
			Quantity:  itemReq.Quantity,
			BasePrice: product.Price,
			Subtotal:  itemSubtotal,
			Variants:  saleItemVariants,
		})
	}

	// Hitung diskon dari promo
	var discountTotal float64
	if req.PromoID != nil {
		promo, err := repository.GetPromoByID(*req.PromoID)
		if err == nil && promo.Status == "active" {
			if subtotal >= promo.MinPurchase {
				if promo.Type == "percentage" {
					discountTotal = subtotal * (promo.Value / 100)
				} else {
					discountTotal = promo.Value
				}

				// Kurangi sisa promo
				if promo.UsageRemaining > 0 {
					promo.UsageRemaining--
					repository.UpdatePromoUsage(promo)
				}
			}
		}
	}

	grandTotal := subtotal - discountTotal

	sale := model.Sale{
		InvoiceNumber:   generateInvoiceNumber(),
		UserID:          userID,
		PaymentMethodID: req.PaymentMethodID,
		PromoID:         req.PromoID,
		Subtotal:        subtotal,
		DiscountTotal:   discountTotal,
		GrandTotal:      grandTotal,
		Items:           saleItems,
	}

	err := repository.CreateSale(&sale)
	if err != nil {
		return nil, errors.New("Gagal membuat transaksi")
	}

	result, _ := repository.GetSaleByID(sale.ID)
	return result, nil
}

func GetAllSales(startDate, endDate string) ([]model.Sale, error) {
	return repository.GetAllSales(startDate, endDate)
}

func GetSaleByID(id uint) (*model.Sale, error) {
	sale, err := repository.GetSaleByID(id)
	if err != nil {
		return nil, errors.New("Transaksi tidak ditemukan")
	}
	return sale, nil
}

func GetDailySales(dateStr string) (map[string]interface{}, error) {
	var date time.Time
	var err error

	if dateStr == "" {
		date = time.Now()
	} else {
		date, err = time.Parse("2006-01-02", dateStr)
		if err != nil {
			return nil, errors.New("Format tanggal tidak valid, gunakan YYYY-MM-DD")
		}
	}

	sales, err := repository.GetDailySales(date)
	if err != nil {
		return nil, err
	}

	// Rekap metode pembayaran
	paymentSummary := map[string]float64{}
	var totalOmzet float64
	var totalQty int

	for _, sale := range sales {
		totalOmzet += sale.GrandTotal
		paymentSummary[sale.PaymentMethod.Name] += sale.GrandTotal
		for _, item := range sale.Items {
			totalQty += item.Quantity
		}
	}

	return map[string]interface{}{
		"date":            date.Format("2006-01-02"),
		"total_transaksi": len(sales),
		"total_qty":       totalQty,
		"total_omzet":     totalOmzet,
		"payment_summary": paymentSummary,
		"sales":           sales,
	}, nil
}