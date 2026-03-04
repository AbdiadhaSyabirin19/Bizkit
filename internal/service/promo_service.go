package service

import (
	"errors"
	"time"

	"bizkit-backend/internal/model"
	"bizkit-backend/internal/repository"
)

type PromoItemRequest struct {
	RefType string `json:"ref_type"`
	RefID   uint   `json:"ref_id"`
	RefName string `json:"ref_name"`
}

type PromoSpecialPriceRequest struct {
	ProductID uint    `json:"product_id"`
	BuyPrice  float64 `json:"buy_price"`
}

type PromoRequest struct {
	Name          string                     `json:"name"`
	PromoType     string                     `json:"promo_type"`
	AppliesTo     string                     `json:"applies_to"`
	Condition     string                     `json:"condition"`
	MinQty        int                        `json:"min_qty"`
	MinTotal      float64                    `json:"min_total"`
	DiscountPct   float64                    `json:"discount_pct"`
	MaxDiscount   float64                    `json:"max_discount"`
	CutPrice      float64                    `json:"cut_price"`
	ActiveDays    string                     `json:"active_days"`
	StartTime     string                     `json:"start_time"`
	EndTime       string                     `json:"end_time"`
	StartDate     string                     `json:"start_date"`
	EndDate       string                     `json:"end_date"`
	VoucherType   string                     `json:"voucher_type"`
	VoucherCode   string                     `json:"voucher_code"`
	MaxUsage      int                        `json:"max_usage"`
	Status        string                     `json:"status"`
	Items         []PromoItemRequest         `json:"items"`
	SpecialPrices []PromoSpecialPriceRequest `json:"special_prices"`
}

func GetAllPromos(search string) ([]model.Promo, error) {
	return repository.GetAllPromos(search)
}

func GetPromoByID(id uint) (*model.Promo, error) {
	promo, err := repository.GetPromoByID(id)
	if err != nil {
		return nil, errors.New("Promo tidak ditemukan")
	}
	return promo, nil
}

func CreatePromo(req PromoRequest) (*model.Promo, error) {
	startDate, _ := time.Parse("2006-01-02", req.StartDate)
	endDate, _ := time.Parse("2006-01-02", req.EndDate)

	if req.Status == "" {
		req.Status = "active"
	}

	promo := model.Promo{
		Name:        req.Name,
		PromoType:   req.PromoType,
		AppliesTo:   req.AppliesTo,
		Condition:   req.Condition,
		MinQty:      req.MinQty,
		MinTotal:    req.MinTotal,
		DiscountPct: req.DiscountPct,
		MaxDiscount: req.MaxDiscount,
		CutPrice:    req.CutPrice,
		ActiveDays:  req.ActiveDays,
		StartTime:   req.StartTime,
		EndTime:     req.EndTime,
		StartDate:   startDate,
		EndDate:     endDate,
		VoucherType: req.VoucherType,
		VoucherCode: req.VoucherCode,
		MaxUsage:    req.MaxUsage,
		Status:      req.Status,
	}

	var items []model.PromoItem
	for _, it := range req.Items {
		items = append(items, model.PromoItem{
			RefType: it.RefType,
			RefID:   it.RefID,
			RefName: it.RefName,
		})
	}

	var specialPrices []model.PromoSpecialPrice
	for _, sp := range req.SpecialPrices {
		specialPrices = append(specialPrices, model.PromoSpecialPrice{
			ProductID: sp.ProductID,
			BuyPrice:  sp.BuyPrice,
		})
	}

	// Generate vouchers
	var vouchers []model.PromoVoucher
	if req.VoucherType == "custom" && req.VoucherCode != "" {
		vouchers = append(vouchers, model.PromoVoucher{Code: req.VoucherCode})
	}

	err := repository.CreatePromo(&promo, items, specialPrices, vouchers)
	if err != nil {
		return nil, err
	}

	// Generate vouchers jika tipe generate
	if req.VoucherType == "generate" && req.MaxUsage > 0 {
		repository.GenerateVoucherCodes(promo.ID, req.MaxUsage)
	}

	return repository.GetPromoByID(promo.ID)
}

func UpdatePromo(id uint, req PromoRequest) (*model.Promo, error) {
	promo, err := repository.GetPromoByID(id)
	if err != nil {
		return nil, errors.New("Promo tidak ditemukan")
	}

	startDate, _ := time.Parse("2006-01-02", req.StartDate)
	endDate, _ := time.Parse("2006-01-02", req.EndDate)

	promo.Name = req.Name
	promo.PromoType = req.PromoType
	promo.AppliesTo = req.AppliesTo
	promo.Condition = req.Condition
	promo.MinQty = req.MinQty
	promo.MinTotal = req.MinTotal
	promo.DiscountPct = req.DiscountPct
	promo.MaxDiscount = req.MaxDiscount
	promo.CutPrice = req.CutPrice
	promo.ActiveDays = req.ActiveDays
	promo.StartTime = req.StartTime
	promo.EndTime = req.EndTime
	promo.StartDate = startDate
	promo.EndDate = endDate
	promo.VoucherType = req.VoucherType
	promo.VoucherCode = req.VoucherCode
	promo.MaxUsage = req.MaxUsage
	if req.Status != "" {
		promo.Status = req.Status
	}

	var items []model.PromoItem
	for _, it := range req.Items {
		items = append(items, model.PromoItem{
			RefType: it.RefType,
			RefID:   it.RefID,
			RefName: it.RefName,
		})
	}

	var specialPrices []model.PromoSpecialPrice
	for _, sp := range req.SpecialPrices {
		specialPrices = append(specialPrices, model.PromoSpecialPrice{
			ProductID: sp.ProductID,
			BuyPrice:  sp.BuyPrice,
		})
	}

	err = repository.UpdatePromo(promo, items, specialPrices)
	if err != nil {
		return nil, err
	}
	return repository.GetPromoByID(promo.ID)
}

func DeletePromo(id uint) error {
	_, err := repository.GetPromoByID(id)
	if err != nil {
		return errors.New("Promo tidak ditemukan")
	}
	return repository.DeletePromo(id)
}

func GetPromosByProductID(productID uint, categoryID *uint, brandID *uint) ([]model.Promo, error) {
	return repository.GetPromosByProductID(productID, categoryID, brandID)
}