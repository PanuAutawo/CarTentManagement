package controllers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"github.com/PanuAutawo/CarTentManagement/backend/services"
	"gorm.io/gorm"
)

type LeaveController struct {
	svc *services.LeaveService
}

func NewLeaveController(db *gorm.DB) *LeaveController {
	return &LeaveController{svc: services.NewLeaveService(db)}
}

// GET /api/leaves?status=pending
func (ctl *LeaveController) ListLeaves(c *gin.Context) {
	status := c.Query("status")
	items, err := ctl.svc.List(status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, items)
}

// GET /api/employees/:id/leaves
func (ctl *LeaveController) ListLeavesByEmployee(c *gin.Context) {
	idStr := c.Param("id")
	idInt, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid employee id"})
		return
	}
	items, err := ctl.svc.ListByEmployee(uint(idInt))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, items)
}

// POST /api/leaves
func (ctl *LeaveController) CreateLeave(c *gin.Context) {
	var body entity.LeaveRequest
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := ctl.svc.Create(&body); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, body)
}

// PUT /api/leaves/:id/status
func (ctl *LeaveController) UpdateLeaveStatus(c *gin.Context) {
	id := c.Param("id")
	var payload struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&payload); err != nil || payload.Status == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "status is required"})
		return
	}
	if err := ctl.svc.UpdateStatus(id, payload.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.Status(http.StatusNoContent)
}
