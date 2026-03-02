package repository

import (
	"bizkit-backend/config"
	"bizkit-backend/internal/model"
)

func GetAllUsers(search string) ([]model.User, error) {
	var users []model.User
	query := config.DB.Model(&model.User{}).Preload("Role")

	if search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}

	result := query.Find(&users)
	return users, result.Error
}

func GetUserByID(id uint) (*model.User, error) {
	var user model.User
	result := config.DB.Preload("Role").First(&user, id)
	return &user, result.Error
}

func GetUserByUsername(username string) (*model.User, error) {
	var user model.User
	result := config.DB.Preload("Role").Where("username = ?", username).First(&user)
	return &user, result.Error
}

func CreateUser(user *model.User) error {
	return config.DB.Create(user).Error
}

func UpdateUser(user *model.User) error {
	return config.DB.Save(user).Error
}

func DeleteUser(id uint) error {
	return config.DB.Delete(&model.User{}, id).Error
}