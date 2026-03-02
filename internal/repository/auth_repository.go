package repository

import (
	"bizkit-backend/config"
	"bizkit-backend/internal/model"
)

func FindUserByUsername(username string) (*model.User, error) {
	var user model.User
	result := config.DB.Preload("Role").Where("username = ?", username).First(&user)
	return &user, result.Error
}

func FindUserByID(id uint) (*model.User, error) {
	var user model.User
	result := config.DB.Preload("Role").First(&user, id)
	return &user, result.Error
}