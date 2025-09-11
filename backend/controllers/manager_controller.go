package controllers

import (
	"net/http"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"github.com/PanuAutawo/CarTentManagement/backend/middleware"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type ManagerController struct {
	DB *gorm.DB
}

func NewManagerController(db *gorm.DB) *ManagerController {
	return &ManagerController{DB: db}
}

type LoginManagerInput struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// LoginManager godoc
func (ctrl *ManagerController) LoginManager(c *gin.Context) {
	var input LoginManagerInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var manager entity.Manager
	if err := ctrl.DB.Where("Email = ?", input.Email).First(&manager).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(manager.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	tokenString, err := middleware.GenerateToken(manager.ID, "manager")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"manager": manager, "token": tokenString})
}
