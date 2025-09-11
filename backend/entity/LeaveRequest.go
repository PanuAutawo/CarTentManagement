package entity

import "gorm.io/gorm"

type LeaveRequest struct {
	gorm.Model
	LeaveID    string    `json:"leaveID" gorm:"uniqueIndex"`
	StartDate  string    `json:"startDate"`
	EndDate    string    `json:"endDate"`
	Type       string    `json:"type"`
	Status     string    `json:"status"`
	EmployeeID uint      `json:"employeeID"`
	Employee   *Employee `json:"employee,omitempty" gorm:"foreignKey:EmployeeID;references:EmployeeID"`
}
