package handler

import (
	"net/http"
	"strconv"

	"bizkit-backend/internal/service"
	"github.com/gin-gonic/gin"
)

func GetAllPromos(c *gin.Context) {
	search := c.Query("search")
	promos, err := service.GetAllPromos(search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal mengambil data"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "OK", "data": promos})
}

func GetPromoByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID tidak valid"})
		return
	}
	promo, err := service.GetPromoByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "OK", "data": promo})
}

func CreatePromo(c *gin.Context) {
	var req service.PromoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Input tidak valid", "error": err.Error()})
		return
	}
	promo, err := service.CreatePromo(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Promo berhasil dibuat", "data": promo})
}

func UpdatePromo(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID tidak valid"})
		return
	}
	var req service.PromoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Input tidak valid", "error": err.Error()})
		return
	}
	promo, err := service.UpdatePromo(uint(id), req)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Promo berhasil diupdate", "data": promo})
}

func DeletePromo(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID tidak valid"})
		return
	}
	if err := service.DeletePromo(uint(id)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Promo berhasil dihapus"})
}

func GetPromosByProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID tidak valid"})
		return
	}

	// Ambil data produk dulu untuk dapat category_id dan brand_id
	product, err := service.GetProductByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "Produk tidak ditemukan"})
		return
	}

	promos, err := service.GetPromosByProductID(uint(id), product.CategoryID, product.BrandID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal mengambil data"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "OK", "data": promos})
}