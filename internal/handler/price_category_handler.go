package handler

import (
	"net/http"
    "strconv"

    "bizkit-backend/config"
    "bizkit-backend/internal/model"
    "bizkit-backend/internal/service"
    "github.com/gin-gonic/gin"
)

func GetAllPriceCategories(c *gin.Context) {
	search := c.Query("search")
	cats, err := service.GetAllPriceCategories(search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal mengambil data"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "OK", "data": cats})
}

func GetPriceCategoryByID(c *gin.Context) {
    id, _ := strconv.Atoi(c.Param("id"))
    var pc model.PriceCategory
    if err := config.DB.First(&pc, id).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"message": "Tidak ditemukan"})
        return
    }
    c.JSON(http.StatusOK, gin.H{"message": "OK", "data": pc})
}

func CreatePriceCategory(c *gin.Context) {
	var req service.PriceCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Input tidak valid"})
		return
	}
	cat, err := service.CreatePriceCategory(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Berhasil dibuat", "data": cat})
}

func UpdatePriceCategory(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID tidak valid"})
		return
	}
	var req service.PriceCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Input tidak valid"})
		return
	}
	cat, err := service.UpdatePriceCategory(uint(id), req)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Berhasil diupdate", "data": cat})
}

func DeletePriceCategory(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID tidak valid"})
		return
	}
	if err := service.DeletePriceCategory(uint(id)); err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Berhasil dihapus"})
}

func GetProductPricesByCategory(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID tidak valid"})
		return
	}
	prices, err := service.GetProductPricesByCategory(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal mengambil data"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "OK", "data": prices})
}

func UpsertProductPrice(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID tidak valid"})
		return
	}
	var req service.ProductPriceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Input tidak valid"})
		return
	}
	if err := service.UpsertProductPrice(uint(id), req); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Harga berhasil disimpan"})
}

func DeleteProductPrice(c *gin.Context) {
	categoryID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "ID tidak valid"})
		return
	}
	productID, err := strconv.Atoi(c.Param("product_id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Product ID tidak valid"})
		return
	}
	if err := service.DeleteProductPrice(uint(productID), uint(categoryID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Harga berhasil dihapus"})
}