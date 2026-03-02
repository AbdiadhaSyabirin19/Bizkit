package handler

import (
	"net/http"

	"bizkit-backend/internal/service"

	"github.com/gin-gonic/gin"
)

func Login(c *gin.Context) {
	var req service.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Input tidak valid"})
		return
	}

	resp, err := service.Login(req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil",
		"token":   resp.Token,
		"user":    resp.User,
	})
}

func GetMe(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	user, err := service.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"message": "User tidak ditemukan"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "OK",
		"user":    user,
	})
}