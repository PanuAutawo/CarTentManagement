// backend/services/employee_service.go
package services

import (
	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"gorm.io/gorm"
)

type EmployeeService struct {
	db *gorm.DB
}

func NewEmployeeService(db *gorm.DB) *EmployeeService {
	return &EmployeeService{db: db}
}

func (s *EmployeeService) List() ([]entity.Employee, error) {
	var emps []entity.Employee
	err := s.db.Find(&emps).Error
	return emps, err
}

func (s *EmployeeService) Get(id uint) (*entity.Employee, error) {
	var emp entity.Employee
	err := s.db.First(&emp, id).Error
	return &emp, err
}

func (s *EmployeeService) GetByEmail(email string) (*entity.Employee, error) {
	var emp entity.Employee
	err := s.db.Where("email = ?", email).First(&emp).Error
	return &emp, err
}

func (s *EmployeeService) Create(emp *entity.Employee) error {
	return s.db.Create(emp).Error
}

func (s *EmployeeService) Update(id uint, patch map[string]any) (*entity.Employee, error) {
	var emp entity.Employee
	if err := s.db.First(&emp, id).Error; err != nil {
		return nil, err
	}
	if err := s.db.Model(&emp).Updates(patch).Error; err != nil {
		return nil, err
	}
	return &emp, nil
}

func (s *EmployeeService) Delete(id uint) error {
	return s.db.Delete(&entity.Employee{}, id).Error
}
