package controllers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type RentListController struct {
	DB *gorm.DB
}

func NewRentListController(db *gorm.DB) *RentListController {
	return &RentListController{DB: db}
}

func (rc *RentListController) GetRentListsByCar(c *gin.Context) {
	carId := c.Param("carId")

	// ✅ preload ความสัมพันธ์ทั้งหมดที่จำเป็น
	var car entity.Car
	if err := rc.DB.
		Preload("Pictures").
		Preload("Province").
		Preload("Employee").
		Preload("Detail.SubModel.CarModel.Brand").
		Preload("SaleList").
		Preload("RentList.RentAbleDates.DateforRent").
		First(&car, carId).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Car not found"})
		return
	}

	// ✅ map Detail
	detail := entity.CarDetail{}
	if car.Detail != nil &&
		car.Detail.SubModel != nil &&
		car.Detail.SubModel.CarModel != nil &&
		car.Detail.SubModel.CarModel.Brand != nil {

		detail = entity.CarDetail{
			Brand:    car.Detail.SubModel.CarModel.Brand.BrandName,
			CarModel: car.Detail.SubModel.CarModel.ModelName,
			SubModel: car.Detail.SubModel.SubModelName,
		}
	}

	// ✅ map SaleList
	var saleList []entity.SaleEntry
	for _, s := range car.SaleList {
		saleList = append(saleList, entity.SaleEntry{
			SalePrice: s.SalePrice,
			Status:    s.Status,
		})
	}

	// ✅ map RentList
	var rentPeriods []entity.RentPeriod
	for _, rl := range car.RentList {
		for _, rad := range rl.RentAbleDates {
			if rad.DateforRent != nil {
				rentPeriods = append(rentPeriods, entity.RentPeriod{
					ID:            rad.DateforRent.ID,
					RentPrice:     rad.DateforRent.RentPrice,
					RentStartDate: rad.DateforRent.OpenDate.Format("2006-01-02"),
					RentEndDate:   rad.DateforRent.CloseDate.Format("2006-01-02"),
					Status:        rad.DateforRent.Status,
				})
			}
		}
	}

	// ✅ map Pictures
	var pictures []entity.CarPictureResponse
	for _, p := range car.Pictures {
		pictures = append(pictures, entity.CarPictureResponse{
			ID:    p.ID,
			Title: p.Title,
			Path:  p.Path,
		})
	}

	// ✅ Province, Employee แค่ id
	var province *entity.ProvinceResponse
	if car.Province != nil {
		province = &entity.ProvinceResponse{ID: car.Province.ID}
	}

	var employee *entity.EmployeeResponse
	if car.Employee != nil {
		employee = &entity.EmployeeResponse{ID: car.Employee.ID}
	}

	// ✅ response
	response := entity.CarResponse{
		ID:              car.ID,
		CarName:         car.CarName,
		YearManufacture: car.YearManufacture,
		Color:           car.Color,
		Mileage:         car.Mileage,
		Condition:       car.Condition,
		Detail:          detail,
		SaleList:        saleList,
		RentList:        rentPeriods,
		Pictures:        pictures,
		Province:        province,
		Employee:        employee,
	}

	c.JSON(http.StatusOK, response)
}

// POST /rentlists
// CreateOrUpdateRentList
func (rc *RentListController) CreateOrUpdateRentList(c *gin.Context) {
	type DateInput struct {
		ID        uint    `json:"id"` // ✅ เพิ่ม id ไว้เช็คว่ามีอยู่แล้วไหม
		OpenDate  string  `json:"open_date"`
		CloseDate string  `json:"close_date"`
		RentPrice float64 `json:"rent_price"`
	}

	type Input struct {
		CarID     uint        `json:"car_id"`
		Status    string      `json:"status"`
		ManagerID uint        `json:"manager_id"`
		Dates     []DateInput `json:"dates"`
	}

	var input Input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var rentList entity.RentList
	err := rc.DB.Where("car_id = ?", input.CarID).First(&rentList).Error

	if err == gorm.ErrRecordNotFound {
		rentList = entity.RentList{
			CarID: input.CarID,

			ManagerID: input.ManagerID,
		}
		rc.DB.Create(&rentList)
	} else {

		rc.DB.Save(&rentList)
	}

	// ✅ จัดการ periods
	for _, d := range input.Dates {
		open, _ := time.Parse("2006-01-02", d.OpenDate)
		close, _ := time.Parse("2006-01-02", d.CloseDate)

		if d.ID != 0 {
			// 👉 ถ้ามี id → update
			var existing entity.DateforRent
			if err := rc.DB.First(&existing, d.ID).Error; err == nil {
				existing.OpenDate = open
				existing.CloseDate = close
				existing.RentPrice = d.RentPrice
				rc.DB.Save(&existing)
			}
		} else {
			// 👉 ถ้าไม่มี id → create ใหม่
			date := entity.DateforRent{
				OpenDate:  open,
				CloseDate: close,
				RentPrice: d.RentPrice,
			}
			rc.DB.Create(&date)

			rc.DB.Create(&entity.RentAbleDate{
				RentListID:    rentList.ID,
				DateforRentID: date.ID,
			})
		}
	}

	// ✅ preload ให้ response กลับครบ
	rc.DB.Preload("RentAbleDates.DateforRent").First(&rentList, rentList.ID)
	c.JSON(http.StatusOK, rentList)
}

// DELETE /rentlists/date/:dateId
func (rc *RentListController) DeleteRentDate(c *gin.Context) {
	dateId := c.Param("dateId")
	var id uint
	fmt.Sscanf(dateId, "%d", &id)

	if err := rc.DB.Delete(&entity.RentAbleDate{}, "datefor_rent_id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if err := rc.DB.Delete(&entity.DateforRent{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Date deleted"})
}

// POST /rentcontracts
func (rc *RentListController) CreateRentContract(c *gin.Context) {
	type Input struct {
		RentListID uint    `json:"rent_list_id"`
		CustomerID uint    `json:"customer_id"`
		EmployeeID uint    `json:"employee_id"`
		PriceAgree float64 `json:"price_agree"`
		DateStart  string  `json:"date_start"`
		DateEnd    string  `json:"date_end"`
	}

	var input Input
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	start, err1 := time.Parse("2006-01-02", input.DateStart)
	end, err2 := time.Parse("2006-01-02", input.DateEnd)
	if err1 != nil || err2 != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid date format"})
		return
	}

	// ✅ ตรวจสอบว่ามี RentContract ทับกันหรือไม่
	var count int64
	rc.DB.Model(&entity.RentContract{}).
		Where("rent_list_id = ? AND (date_start <= ? AND date_end >= ?)", input.RentListID, end, start).
		Count(&count)

	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "ช่วงเวลานี้ถูกเช่าแล้ว"})
		return
	}

	// ✅ สร้าง RentContract ใหม่
	rentContract := entity.RentContract{
		RentListID: input.RentListID,
		CustomerID: input.CustomerID,
		EmployeeID: input.EmployeeID,
		PriceAgree: input.PriceAgree,
		DateStart:  start,
		DateEnd:    end,
	}

	if err := rc.DB.Create(&rentContract).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// ✅ อัพเดตสถานะ DateforRent ที่เกี่ยวข้อง
	var dates []entity.RentAbleDate
	rc.DB.Preload("DateforRent").
		Where("rent_list_id = ?", input.RentListID).
		Find(&dates)

	for _, d := range dates {
		if (d.DateforRent.OpenDate.Before(end) && d.DateforRent.CloseDate.After(start)) ||
			(d.DateforRent.OpenDate.Equal(start) || d.DateforRent.CloseDate.Equal(end)) {
			d.DateforRent.Status = "rented"
			rc.DB.Save(&d.DateforRent)
		}
	}

	c.JSON(http.StatusOK, rentContract)
}
