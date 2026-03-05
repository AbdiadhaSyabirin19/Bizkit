package handler

import (
	"net/http"
	"strconv"

	"bizkit-backend/internal/service"

	"github.com/gin-gonic/gin"
)

func GetAllPriceCategories(c *gin.Context) {
	search := c.Query("search")
	priceCategories, err := service.GetAllPriceCategories(search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal mengambil data kategori harga tambahan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil mengambil data kategori harga tambahan",
		"data":    priceCategories,
	})
}

func GetPriceCategoryByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	priceCategory, err := service.GetPriceCategoryByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Kategori harga tambahan tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Berhasil mendapatkan detail kategori harga tambahan",
		"data":    priceCategory,
	})
}

func CreatePriceCategory(c *gin.Context) {
	var req service.PriceCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err := service.CreatePriceCategory(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menambahkan kategori harga tambahan"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Kategori harga tambahan berhasil ditambahkan"})
}

func UpdatePriceCategory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	var req service.PriceCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	err = service.UpdatePriceCategory(uint(id), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Kategori harga tambahan berhasil diupdate"})
}

func DeletePriceCategory(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID tidak valid"})
		return
	}

	err = service.DeletePriceCategory(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menghapus kategori harga tambahan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Kategori harga tambahan berhasil dihapus"})
}
