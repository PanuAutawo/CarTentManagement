package controllers

import (
	"net/http"
	"strconv"

	//"time"
	//"github.com/PanuAutawo/CarTentManagement/backend/configs"
	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"github.com/PanuAutawo/CarTentManagement/backend/middleware"
	"github.com/PanuAutawo/CarTentManagement/backend/services"
	"github.com/gin-gonic/gin"

	//"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type EmployeeController struct {
	svc *services.EmployeeService
}

func NewEmployeeController(db *gorm.DB) *EmployeeController {
	return &EmployeeController{svc: services.NewEmployeeService(db)}
}

// ===========================
// 📌 Public Endpoints
// ===========================

// GET /employees
func (ctl *EmployeeController) GetEmployees(c *gin.Context) {
	items, err := ctl.svc.List()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch employees"})
		return
	}
	c.JSON(http.StatusOK, items)
}

// GET /employees/:id
func (ctl *EmployeeController) GetEmployeeByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	item, err := ctl.svc.Get(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "employee not found"})
		return
	}
	c.JSON(http.StatusOK, item)
}

// ===========================
// 📌 Auth
// ===========================

// POST /employee/login
func (ctl *EmployeeController) LoginEmployee(c *gin.Context) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || body.Email == "" || body.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email and password are required"})
		return
	}

	emp, err := ctl.svc.GetByEmail(body.Email)
	if err != nil || bcrypt.CompareHashAndPassword([]byte(emp.Password), []byte(body.Password)) != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	// ✅ ใช้ middleware.GenerateToken (employeeID + role)
	tokenStr, err := middleware.GenerateToken(emp.EmployeeID, "employee")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to sign token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token":    tokenStr,
		"employee": emp,
	})
}

// ===========================
// 📌 Protected (Employee self)
// ===========================

// GET /employees/me
func (ctl *EmployeeController) GetCurrentEmployee(c *gin.Context) {
	val, ok := c.Get("employeeID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	id, ok := val.(uint)
	if !ok || id == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	item, err := ctl.svc.Get(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "employee not found"})
		return
	}
	c.JSON(http.StatusOK, item)
}

// PUT /employees/me
func (ctl *EmployeeController) UpdateCurrentEmployee(c *gin.Context) {
	val, ok := c.Get("employeeID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	id, ok := val.(uint)
	if !ok || id == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}

	var emp entity.Employee
	if err := c.ShouldBindJSON(&emp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updated, err := ctl.svc.Update(id, map[string]any{
		"profile_image": emp.ProfileImage,
		"first_name":    emp.FirstName,
		"last_name":     emp.LastName,
		"email":         emp.Email,
		"phone":         emp.Phone,
		"address":       emp.Address,
		"sex":           emp.Sex,
		"position":      emp.Position,
		"job_type":      emp.JobType,
		"total_sales":   emp.TotalSales,
		"birthday":      emp.Birthday,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile", "detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, updated)
}

// ===========================
// 📌 Manager actions (CRUD)
// ===========================

// POST /api/employees
func (ctl *EmployeeController) CreateEmployee(c *gin.Context) {
	var emp entity.Employee
	if err := c.ShouldBindJSON(&emp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// set default password if missing
	if emp.Password == "" {
		hash, _ := bcrypt.GenerateFromPassword([]byte("123456"), 10)
		emp.Password = string(hash)
	}

	if err := ctl.svc.Create(&emp); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, emp)
}

// PUT /api/employees/:id
func (ctl *EmployeeController) UpdateEmployeeByID(c *gin.Context) {
	idStr := c.Param("id")
	idInt, err := strconv.Atoi(idStr)
	if err != nil || idInt <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}

	var emp entity.Employee
	if err := c.ShouldBindJSON(&emp); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updated, err := ctl.svc.Update(uint(idInt), map[string]any{
		"profile_image": emp.ProfileImage,
		"first_name":    emp.FirstName,
		"last_name":     emp.LastName,
		"email":         emp.Email,
		"phone":         emp.Phone,
		"address":       emp.Address,
		"sex":           emp.Sex,
		"position":      emp.Position,
		"job_type":      emp.JobType,
		"total_sales":   emp.TotalSales,
		"birthday":      emp.Birthday,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update employee", "detail": err.Error()})
		return
	}
	c.JSON(http.StatusOK, updated)
}

// DELETE /api/employees/:id
func (ctl *EmployeeController) DeleteEmployeeByID(c *gin.Context) {
	idStr := c.Param("id")
	idInt, err := strconv.Atoi(idStr)
	if err != nil || idInt <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid id"})
		return
	}
	if err := ctl.svc.Delete(uint(idInt)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete employee"})
		return
	}
	c.Status(http.StatusNoContent)
}
