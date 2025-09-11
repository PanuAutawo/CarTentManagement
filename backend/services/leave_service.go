package services

import (
	"time"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"gorm.io/gorm"
)

type LeaveService struct {
	db *gorm.DB
}

func NewLeaveService(db *gorm.DB) *LeaveService {
	return &LeaveService{db: db}
}

// ดึงคำขอลาตาม status
func (s *LeaveService) List(filterStatus string) ([]entity.LeaveRequest, error) {
	q := s.db.Order("created_at desc")
	if filterStatus != "" {
		q = q.Where("status = ?", filterStatus)
	}
	var items []entity.LeaveRequest
	if err := q.Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

// ดึงคำขอลาตาม employeeID (uint)
func (s *LeaveService) ListByEmployee(empID uint) ([]entity.LeaveRequest, error) {
	var items []entity.LeaveRequest
	if err := s.db.Where("employee_id = ?", empID).Order("start_date asc").Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

// สร้างคำขอลาใหม่
func (s *LeaveService) Create(l *entity.LeaveRequest) error {
	if l.LeaveID == "" {
		l.LeaveID = "L" + time.Now().Format("20060102150405")
	}
	if l.Status == "" {
		l.Status = "pending"
	}
	return s.db.Create(l).Error
}

// อัปเดตสถานะคำขอลา
func (s *LeaveService) UpdateStatus(id string, status string) error {
	return s.db.Model(&entity.LeaveRequest{}).Where("leave_id = ?", id).Update("status", status).Error
}
