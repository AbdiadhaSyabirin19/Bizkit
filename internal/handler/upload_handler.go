package handler

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
)

func UploadImage(c *gin.Context) {
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "File tidak ditemukan"})
		return
	}

	// Buat folder uploads jika belum ada
	uploadDir := "uploads/products"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal membuat folder upload"})
		return
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("product_%d%s", time.Now().UnixNano(), ext)
	filePath := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": "Gagal menyimpan file"})
		return
	}

	// Return URL path
	url := fmt.Sprintf("/uploads/products/%s", filename)
	c.JSON(http.StatusOK, gin.H{
		"message": "Upload berhasil",
		"url":     url,
	})
}
