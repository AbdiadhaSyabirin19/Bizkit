package handler

import (
	"net/http"

	"bizkit-backend/internal/service"

	"github.com/gin-gonic/gin"
)

func GetSetting(c *gin.Context) {
	setting, err := service.GetSetting()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal mengambil setting"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "OK", "data": setting})
}

func UpdateSetting(c *gin.Context) {
	var req service.SettingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Input tidak valid"})
		return
	}

	setting, err := service.UpdateSetting(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal update setting"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Setting berhasil diupdate", "data": setting})
}