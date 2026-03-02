package service

import (
	"errors"

	"bizkit-backend/internal/model"
	"bizkit-backend/internal/repository"

	"golang.org/x/crypto/bcrypt"
)

type UserRequest struct {
	Name     string `json:"name" binding:"required"`
	Username string `json:"username" binding:"required"`
	Password string `json:"password"`
	RoleID   *uint  `json:"role_id"`
}

type UpdateUserRequest struct {
	Name     string `json:"name" binding:"required"`
	Username string `json:"username" binding:"required"`
	Password string `json:"password"`
	RoleID   *uint  `json:"role_id"`
}

func GetAllUsers(search string) ([]model.User, error) {
	return repository.GetAllUsers(search)
}

func GetUserByID(id uint) (*model.User, error) {
	user, err := repository.GetUserByID(id)
	if err != nil {
		return nil, errors.New("User tidak ditemukan")
	}
	return user, nil
}

func CreateUser(req UserRequest) (*model.User, error) {
	// Cek username sudah ada
	existing, _ := repository.GetUserByUsername(req.Username)
	if existing != nil && existing.ID != 0 {
		return nil, errors.New("Username sudah digunakan")
	}

	if req.Password == "" {
		return nil, errors.New("Password wajib diisi")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("Gagal memproses password")
	}

	user := model.User{
		Name:     req.Name,
		Username: req.Username,
		Password: string(hashed),
		RoleID:   req.RoleID,
	}

	err = repository.CreateUser(&user)
	if err != nil {
		return nil, err
	}

	result, _ := repository.GetUserByID(user.ID)
	return result, nil
}

func UpdateUser(id uint, req UpdateUserRequest) (*model.User, error) {
	user, err := repository.GetUserByID(id)
	if err != nil {
		return nil, errors.New("User tidak ditemukan")
	}

	// Cek username sudah dipakai user lain
	existing, _ := repository.GetUserByUsername(req.Username)
	if existing != nil && existing.ID != 0 && existing.ID != id {
		return nil, errors.New("Username sudah digunakan")
	}

	user.Name = req.Name
	user.Username = req.Username
	user.RoleID = req.RoleID

	// Update password hanya kalau diisi
	if req.Password != "" {
		hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return nil, errors.New("Gagal memproses password")
		}
		user.Password = string(hashed)
	}

	err = repository.UpdateUser(user)
	if err != nil {
		return nil, err
	}

	result, _ := repository.GetUserByID(user.ID)
	return result, nil
}

func DeleteUser(id uint, currentUserID uint) error {
	if id == currentUserID {
		return errors.New("Tidak bisa menghapus akun sendiri")
	}

	_, err := repository.GetUserByID(id)
	if err != nil {
		return errors.New("User tidak ditemukan")
	}

	return repository.DeleteUser(id)
}