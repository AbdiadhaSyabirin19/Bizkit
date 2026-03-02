package main

import (
	"fmt"

	"bizkit-backend/config"
	"bizkit-backend/internal/model"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	godotenv.Load()
	config.ConnectDB()

	fmt.Println("🌱 Mulai seeding data...")

	// ==================
	// ROLES
	// ==================
	roles := []model.Role{
		{Name: "Owner"},
		{Name: "Kasir"},
		{Name: "Admin"},
		{Name: "Supervisor"},
	}
	for i := range roles {
		config.DB.FirstOrCreate(&roles[i], model.Role{Name: roles[i].Name})
	}
	fmt.Println("✅ Roles selesai")

	// ==================
	// USERS
	// ==================
	hashed, _ := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	hashedStr := string(hashed)

	users := []struct {
		Name     string
		Username string
		RoleIdx  int
	}{
		{"Admin Bizkit", "admin", 0},
		{"Budi Kasir", "budi", 1},
		{"Siti Admin", "siti", 2},
		{"Andi Supervisor", "andi", 3},
	}
	for _, u := range users {
		user := model.User{
			Name:     u.Name,
			Username: u.Username,
			Password: hashedStr,
			RoleID:   &roles[u.RoleIdx].ID,
		}
		config.DB.FirstOrCreate(&user, model.User{Username: u.Username})
	}
	fmt.Println("✅ Users selesai")

	// ==================
	// CATEGORIES
	// ==================
	categories := []model.Category{
		{Name: "Makanan"},
		{Name: "Minuman"},
		{Name: "Snack"},
		{Name: "Dessert"},
	}
	for i := range categories {
		config.DB.FirstOrCreate(&categories[i], model.Category{Name: categories[i].Name})
	}
	fmt.Println("✅ Categories selesai")

	// ==================
	// BRANDS
	// ==================
	brands := []model.Brand{
		{Name: "Homemade"},
		{Name: "Indofood"},
		{Name: "Nestle"},
		{Name: "Local"},
	}
	for i := range brands {
		config.DB.FirstOrCreate(&brands[i], model.Brand{Name: brands[i].Name})
	}
	fmt.Println("✅ Brands selesai")

	// ==================
	// UNITS
	// ==================
	units := []model.Unit{
		{Name: "Pcs"},
		{Name: "Porsi"},
		{Name: "Gelas"},
		{Name: "Kg"},
		{Name: "Tray"},
	}
	for i := range units {
		config.DB.FirstOrCreate(&units[i], model.Unit{Name: units[i].Name})
	}
	fmt.Println("✅ Units selesai")

	// ==================
	// VARIANT CATEGORIES
	// ==================
	variantLevelPedas := model.VariantCategory{
		Name:      "Level Pedas",
		MinSelect: 1,
		MaxSelect: 1,
		Status:    "active",
		Options: []model.VariantOption{
			{Name: "Level 1", AdditionalPrice: 0},
			{Name: "Level 3", AdditionalPrice: 0},
			{Name: "Level 5", AdditionalPrice: 2000},
		},
	}
	variantTopping := model.VariantCategory{
		Name:      "Topping",
		MinSelect: 0,
		MaxSelect: 3,
		Status:    "active",
		Options: []model.VariantOption{
			{Name: "Keju", AdditionalPrice: 3000},
			{Name: "Telur", AdditionalPrice: 2000},
			{Name: "Sosis", AdditionalPrice: 4000},
		},
	}
	variantSuhu := model.VariantCategory{
		Name:      "Suhu Minuman",
		MinSelect: 1,
		MaxSelect: 1,
		Status:    "active",
		Options: []model.VariantOption{
			{Name: "Panas", AdditionalPrice: 0},
			{Name: "Dingin", AdditionalPrice: 1000},
		},
	}
	variantUkuran := model.VariantCategory{
		Name:      "Ukuran",
		MinSelect: 1,
		MaxSelect: 1,
		Status:    "active",
		Options: []model.VariantOption{
			{Name: "Regular", AdditionalPrice: 0},
			{Name: "Large", AdditionalPrice: 5000},
		},
	}

	variants := []*model.VariantCategory{&variantLevelPedas, &variantTopping, &variantSuhu, &variantUkuran}
	for _, v := range variants {
		existing := model.VariantCategory{}
		if config.DB.Where("name = ?", v.Name).First(&existing).Error != nil {
			config.DB.Create(v)
		} else {
			*v = existing
		}
	}
	fmt.Println("✅ Variants selesai")

	// ==================
	// PRODUCTS
	// ==================
	products := []struct {
		Name       string
		CatIdx     int
		BrandIdx   int
		UnitIdx    int
		Price      float64
		VariantIDs []uint
	}{
		{"Ayam Geprek", 0, 0, 1, 15000, []uint{variantLevelPedas.ID, variantTopping.ID}},
		{"Nasi Goreng", 0, 0, 1, 18000, []uint{variantLevelPedas.ID}},
		{"Mie Goreng", 0, 1, 1, 12000, []uint{variantLevelPedas.ID}},
		{"Soto Ayam", 0, 0, 1, 16000, []uint{}},
		{"Es Teh Manis", 1, 0, 2, 5000, []uint{variantUkuran.ID}},
		{"Kopi Susu", 1, 0, 2, 12000, []uint{variantSuhu.ID, variantUkuran.ID}},
		{"Jus Alpukat", 1, 0, 2, 15000, []uint{variantUkuran.ID}},
		{"Es Jeruk", 1, 0, 2, 8000, []uint{variantUkuran.ID}},
		{"Keripik Singkong", 2, 3, 0, 8000, []uint{}},
		{"Pisang Goreng", 2, 0, 0, 10000, []uint{variantTopping.ID}},
		{"Es Krim", 3, 2, 0, 13000, []uint{variantTopping.ID}},
		{"Pudding Coklat", 3, 0, 0, 11000, []uint{}},
	}

	var createdProducts []model.Product
	for _, p := range products {
		product := model.Product{
			Name:       p.Name,
			CategoryID: &categories[p.CatIdx].ID,
			BrandID:    &brands[p.BrandIdx].ID,
			UnitID:     &units[p.UnitIdx].ID,
			Price:      p.Price,
			Status:     "active",
		}
		existing := model.Product{}
		if config.DB.Where("name = ?", product.Name).First(&existing).Error != nil {
			config.DB.Create(&product)
			if len(p.VariantIDs) > 0 {
				var variantObjs []model.VariantCategory
				config.DB.Find(&variantObjs, p.VariantIDs)
				config.DB.Model(&product).Association("Variants").Replace(variantObjs)
			}
			createdProducts = append(createdProducts, product)
		} else {
			createdProducts = append(createdProducts, existing)
		}
	}
	fmt.Println("✅ Products selesai")

	// ==================
	// PAYMENT METHODS
	// ==================
	payments := []model.PaymentMethod{
		{Name: "Cash"},
		{Name: "QRIS"},
		{Name: "Transfer Bank"},
	}
	for i := range payments {
		config.DB.FirstOrCreate(&payments[i], model.PaymentMethod{Name: payments[i].Name})
	}
	fmt.Println("✅ Payment Methods selesai")

	// ==================
	// PROMOS
	// ==================
	promos := []struct {
		Name           string
		Code           string
		Type           string
		Value          float64
		MinPurchase    float64
		UsageLimit     int
		UsageRemaining int
		Status         string
	}{
		{"Diskon 10%", "DISC10", "percentage", 10, 50000, 100, 100, "active"},
		{"Hemat 5 Ribu", "HEMAT5K", "fixed", 5000, 30000, 50, 50, "active"},
		{"Promo Lebaran", "LEBARAN20", "percentage", 20, 100000, 30, 30, "upcoming"},
		{"Flash Sale", "FLASH15", "percentage", 15, 0, 20, 0, "finished"},
	}
	for _, p := range promos {
		promo := model.Promo{
			Name:           p.Name,
			Code:           p.Code,
			Type:           p.Type,
			Value:          p.Value,
			MinPurchase:    p.MinPurchase,
			UsageLimit:     p.UsageLimit,
			UsageRemaining: p.UsageRemaining,
			Status:         p.Status,
		}
		config.DB.FirstOrCreate(&promo, model.Promo{Code: p.Code})
	}
	fmt.Println("✅ Promos selesai")

	// ==================
	// SALES (Sample Transaksi)
	// ==================
	// Ambil user kasir
	var kasir model.User
	config.DB.Where("username = ?", "budi").First(&kasir)

	sampleSales := []struct {
		PaymentIdx int
		Items      []struct {
			ProductIdx int
			Qty        int
		}
	}{
		{0, []struct{ ProductIdx, Qty int }{{0, 2}, {4, 1}}},
		{1, []struct{ ProductIdx, Qty int }{{1, 1}, {5, 2}}},
		{0, []struct{ ProductIdx, Qty int }{{2, 3}, {6, 1}}},
		{2, []struct{ ProductIdx, Qty int }{{3, 1}, {7, 2}, {8, 1}}},
		{1, []struct{ ProductIdx, Qty int }{{4, 4}, {9, 2}}},
		{0, []struct{ ProductIdx, Qty int }{{0, 1}, {5, 1}, {10, 1}}},
		{1, []struct{ ProductIdx, Qty int }{{1, 2}, {11, 3}}},
		{0, []struct{ ProductIdx, Qty int }{{6, 2}, {7, 1}}},
	}

	for i, s := range sampleSales {
		var saleItems []model.SaleItem
		var subtotal float64

		for _, item := range s.Items {
			if item.ProductIdx >= len(createdProducts) {
				continue
			}
			p := createdProducts[item.ProductIdx]
			itemSubtotal := p.Price * float64(item.Qty)
			subtotal += itemSubtotal
			saleItems = append(saleItems, model.SaleItem{
				ProductID: p.ID,
				Quantity:  item.Qty,
				BasePrice: p.Price,
				Subtotal:  itemSubtotal,
			})
		}

		sale := model.Sale{
			InvoiceNumber:   fmt.Sprintf("INV-20260302-%04d", i+1),
			UserID:          kasir.ID,
			PaymentMethodID: payments[s.PaymentIdx].ID,
			Subtotal:        subtotal,
			DiscountTotal:   0,
			GrandTotal:      subtotal,
			Items:           saleItems,
		}

		existing := model.Sale{}
		if config.DB.Where("invoice_number = ?", sale.InvoiceNumber).First(&existing).Error != nil {
			config.DB.Create(&sale)
		}
	}
	fmt.Println("✅ Sales selesai")

	fmt.Println("")
	fmt.Println("🎉 Seed data berhasil!")
	fmt.Println("================================")
	fmt.Println("📌 Akun login yang tersedia:")
	fmt.Println("   Username: admin    | Password: password123 | Role: Owner")
	fmt.Println("   Username: budi     | Password: password123 | Role: Kasir")
	fmt.Println("   Username: siti     | Password: password123 | Role: Admin")
	fmt.Println("   Username: andi     | Password: password123 | Role: Supervisor")
	fmt.Println("================================")
}