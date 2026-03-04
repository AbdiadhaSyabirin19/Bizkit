package model

import (
	"time"

	"gorm.io/gorm"
)

type Promo struct {
	gorm.Model
	Name          string    `json:"name"`
	PromoType     string    `json:"promo_type"`     // special_price, discount, cut_price
	AppliesTo     string    `json:"applies_to"`     // all, category, brand, product
	Condition     string    `json:"condition"`      // qty, total, qty_or_total, qty_and_total
	MinQty        int       `json:"min_qty"`
	MinTotal      float64   `json:"min_total"`
	DiscountPct   float64   `json:"discount_pct"`
	MaxDiscount   float64   `json:"max_discount"`
	CutPrice      float64   `json:"cut_price"`
	ActiveDays    string    `json:"active_days"`    // "1,2,3,4,5,6,7" (1=Senin)
	StartTime     string    `json:"start_time"`     // "08:00"
	EndTime       string    `json:"end_time"`       // "22:00"
	StartDate     time.Time `json:"start_date"`
	EndDate       time.Time `json:"end_date"`
	VoucherType   string    `json:"voucher_type"`   // none, custom, generate
	VoucherCode   string    `json:"voucher_code"`
	MaxUsage      int       `json:"max_usage"`
	UsedCount     int       `json:"used_count"`
	Status        string    `json:"status"`         // active, inactive

	// Relations
	Items         []PromoItem    `json:"items,omitempty" gorm:"foreignKey:PromoID"`
	SpecialPrices []PromoSpecialPrice `json:"special_prices,omitempty" gorm:"foreignKey:PromoID"`
	Vouchers      []PromoVoucher `json:"vouchers,omitempty" gorm:"foreignKey:PromoID"`
}

type PromoItem struct {
	gorm.Model
	PromoID    uint     `json:"promo_id"`
	RefType    string   `json:"ref_type"`    // category, brand, product
	RefID      uint     `json:"ref_id"`
	RefName    string   `json:"ref_name"`
}

type PromoSpecialPrice struct {
	gorm.Model
	PromoID   uint    `json:"promo_id"`
	ProductID uint    `json:"product_id"`
	BuyPrice  float64 `json:"buy_price"`
	Product   *Product `json:"product,omitempty" gorm:"foreignKey:ProductID"`
}

type PromoVoucher struct {
	gorm.Model
	PromoID   uint   `json:"promo_id"`
	Code      string `json:"code"`
	IsUsed    bool   `json:"is_used" gorm:"default:false"`
	UsedAt    *time.Time `json:"used_at"`
}