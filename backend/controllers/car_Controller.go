package controllers

import (
	"net/http"
	"strconv"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CarController struct {
	DB *gorm.DB
}

// Constructor
func NewCarController(db *gorm.DB) *CarController {
	return &CarController{DB: db}
}

// GET /cars
func (cc *CarController) GetAllCars(c *gin.Context) {
	var cars []entity.Car

	// Pagination
	page := c.DefaultQuery("page", "1")
	limit := c.DefaultQuery("limit", "20")
	pageInt, _ := strconv.Atoi(page)
	limitInt, _ := strconv.Atoi(limit)
	offset := (pageInt - 1) * limitInt

	// Search by car name (optional)
	search := c.Query("search")

	// Build query
	query := cc.DB.Preload("Detail.Brand").
		Preload("Detail.CarModel").
		Preload("Detail.SubModel").
		Preload("Pictures").
		Preload("Province").
		Preload("Employee").
		Preload("SaleList").
		Preload("RentList.RentAbleDates.DateforRent")

	if search != "" {
		query = query.Where("car_name LIKE ?", "%"+search+"%")
	}

	// Execute query with pagination
	if err := query.Limit(limitInt).Offset(offset).Find(&cars).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Map cars to CarResponse
	var resp []entity.CarResponse
	for _, car := range cars {
		// แปลง Pictures
		var picturesResp []entity.CarPictureResponse
		for _, pic := range car.Pictures {
			picturesResp = append(picturesResp, entity.CarPictureResponse{
				ID:    pic.ID,
				Title: pic.Title,
				Path:  pic.Path,
			})
		}

		// Map CarResponse
		cr := entity.CarResponse{
			ID:              car.ID,
			CarName:         car.CarName,
			YearManufacture: car.YearManufacture,
			Color:           car.Color,
			Mileage:         car.Mileage,
			Condition:       car.Condition,
			PurchasePrice:   car.PurchasePrice, // <-- เพิ่มตรงนี้
			Detail: entity.CarDetail{
				Brand:    car.Detail.Brand.BrandName,
				CarModel: car.Detail.CarModel.ModelName,
				SubModel: car.Detail.SubModel.SubModelName,
			},
			Pictures: picturesResp,
		}

		// SaleList
		for _, s := range car.SaleList {
			cr.SaleList = append(cr.SaleList, entity.SaleEntry{
				SalePrice: s.SalePrice,
				Status:    s.Status,
			})
		}

		// RentList
		for _, r := range car.RentList {
			for _, rd := range r.RentAbleDates {
				if rd.DateforRent != nil {
					cr.RentList = append(cr.RentList, entity.RentPeriod{
						ID:            rd.DateforRent.ID,
						RentPrice:     rd.DateforRent.RentPrice,
						RentStartDate: rd.DateforRent.OpenDate.Format("2006-01-02"),
						RentEndDate:   rd.DateforRent.CloseDate.Format("2006-01-02"),
						Status:        rd.DateforRent.Status,
					})
				}
			}
		}

		resp = append(resp, cr)
	}

	c.JSON(http.StatusOK, gin.H{
		"page":  pageInt,
		"limit": limitInt,
		"data":  resp,
	})
}

// GET /cars/:id
func (cc *CarController) GetCarByID(c *gin.Context) {
	id := c.Param("id")
	var car entity.Car

	if err := cc.DB.Preload("Detail.Brand").
		Preload("Detail.CarModel").
		Preload("Detail.SubModel").
		Preload("Pictures").
		Preload("Province").
		Preload("Employee").
		Preload("SaleList").
		Preload("RentList.RentAbleDates.DateforRent").
		First(&car, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(404, gin.H{"error": "Car not found"})
		} else {
			c.JSON(500, gin.H{"error": err.Error()})
		}
		return
	}

	// แปลง Pictures
	var picturesResp []entity.CarPictureResponse
	for _, pic := range car.Pictures {
		picturesResp = append(picturesResp, entity.CarPictureResponse{
			ID:    pic.ID,
			Title: pic.Title,
			Path:  pic.Path,
		})
	}

	// Map CarResponse
	cr := entity.CarResponse{
		ID:              car.ID,
		CarName:         car.CarName,
		YearManufacture: car.YearManufacture,
		Color:           car.Color,
		PurchasePrice:   car.PurchasePrice,
		Mileage:         car.Mileage,
		Condition:       car.Condition,
		Detail: entity.CarDetail{
			Brand:    car.Detail.Brand.BrandName,
			CarModel: car.Detail.CarModel.ModelName,
			SubModel: car.Detail.SubModel.SubModelName,
		},
		Pictures: picturesResp,
	}

	// SaleList
	for _, s := range car.SaleList {
		cr.SaleList = append(cr.SaleList, entity.SaleEntry{
			SalePrice: s.SalePrice,
			Status:    s.Status,
		})
	}

	// RentList
	for _, r := range car.RentList {
		for _, rd := range r.RentAbleDates {
			if rd.DateforRent != nil {
				cr.RentList = append(cr.RentList, entity.RentPeriod{
					ID:            rd.DateforRent.ID,
					RentPrice:     rd.DateforRent.RentPrice,
					RentStartDate: rd.DateforRent.OpenDate.Format("2006-01-02"),
					RentEndDate:   rd.DateforRent.CloseDate.Format("2006-01-02"),
					Status:        rd.DateforRent.Status,
				})
			}
		}
	}

	c.JSON(200, cr)
}
