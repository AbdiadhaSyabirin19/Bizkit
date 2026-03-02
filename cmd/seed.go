package main

import (
	"fmt"
	"log"

	"bizkit-backend/config"
	"bizkit-backend/internal/model"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	godotenv.Load()
	config.ConnectDB()

	// Buat role owner
	role := model.Role{Name: "Owner"}
	config.DB.FirstOrCreate(&role, model.Role{Name: "Owner"})

	// Hash password
	hashed, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal(err)
	}

	// Buat user
	user := model.User{
		Name:     "Admin Bizkit",
		Username: "admin",
		Password: string(hashed),
		RoleID:   &role.ID,
	}
	config.DB.FirstOrCreate(&user, model.User{Username: "admin"})

	fmt.Println("Seed berhasil! Username: admin | Password: password123")
}