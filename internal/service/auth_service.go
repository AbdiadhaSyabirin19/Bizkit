package service

import (
	"errors"
	"os"
	"time"

	"bizkit-backend/internal/model"
	"bizkit-backend/internal/repository"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string     `json:"token"`
	User  model.User `json:"user"`
}

func Login(req LoginRequest) (*LoginResponse, error) {
	user, err := repository.FindUserByUsername(req.Username)
	if err != nil {
		return nil, errors.New("Username atau password salah")
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		return nil, errors.New("Username atau password salah")
	}

	token, err := generateToken(user)
	if err != nil {
		return nil, errors.New("Gagal membuat token")
	}

	return &LoginResponse{
		Token: token,
		User:  *user,
	}, nil
}

func generateToken(user *model.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"role_id": user.RoleID,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}