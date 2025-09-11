package main

import (
	"log"
	"time"

	"github.com/PanuAutawo/CarTentManagement/backend/configs"
	"github.com/PanuAutawo/CarTentManagement/backend/controllers"
	"github.com/PanuAutawo/CarTentManagement/backend/middleware"
	"github.com/PanuAutawo/CarTentManagement/backend/setupdata"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// 1. Connect DB
	configs.ConnectDatabase("car_full_data.db")

	// 2. Insert mock data
	setupdata.InsertMockManagers(configs.DB)
	setupdata.InsertMockEmployees(configs.DB)
	setupdata.InsertProvinces(configs.DB)
	setupdata.InsertHardcodedAddressData(configs.DB)
	setupdata.InsertCarsFromCSV(configs.DB, "car_full_data.csv")
	setupdata.InsertMockSaleList(configs.DB)
	setupdata.InsertMockRentListWithDates(configs.DB)
	setupdata.InsertCarSystems(configs.DB)
	setupdata.InsertTypeInformations(configs.DB)
	setupdata.InsertMockInspections(configs.DB)
	setupdata.InsertMockPickupDelivery(configs.DB)

	// 3. Create router
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// --- Controllers Setup ---
	carController := controllers.NewCarController(configs.DB)
	inspectionAppointmentController := controllers.NewInspectionAppointmentController(configs.DB)
	carSystemController := controllers.NewCarSystemController(configs.DB)
	pickupDeliveryController := controllers.NewPickupDeliveryController(configs.DB)
	provinceController := controllers.NewProvinceController(configs.DB)
	districtController := controllers.NewDistrictController(configs.DB)
	subDistrictController := controllers.NewSubDistrictController(configs.DB)
	employeeController := controllers.NewEmployeeController(configs.DB)
	customerController := controllers.NewCustomerController(configs.DB)
	managerController := controllers.NewManagerController(configs.DB)
	typeInformationController := controllers.NewTypeInformationController(configs.DB)
	leaveController := controllers.NewLeaveController(configs.DB) // ✅ เพิ่ม LeaveController

	// --- Routes ---

	// Public Routes
	r.POST("/register", customerController.RegisterCustomer)
	r.POST("/login", customerController.LoginCustomer)
	r.POST("/employee/login", employeeController.LoginEmployee)
	r.POST("/manager/login", managerController.LoginManager)

	// Car Routes
	carRoutes := r.Group("/cars")
	{
		carRoutes.GET("/", carController.GetAllCars)    // GET /cars
		carRoutes.GET("/:id", carController.GetCarByID) // GET /cars/:id
	}
	r.Static("/images/cars", "./public/images/cars")

	// Address Routes
	provinceRoutes := r.Group("/provinces")
	{
		provinceRoutes.GET("", provinceController.GetProvinces)
	}
	districtRoutes := r.Group("/districts")
	{
		districtRoutes.GET("/by-province/:provinceID", districtController.GetDistrictsByProvince)
	}
	subDistrictRoutes := r.Group("/sub-districts")
	{
		subDistrictRoutes.GET("/by-district/:districtID", subDistrictController.GetSubDistrictsByDistrict)
	}

	// Car System Routes
	carSystemRoutes := r.Group("/car-systems")
	{
		carSystemRoutes.GET("", carSystemController.GetCarSystems)
	}

	// Type Information Routes
	typeInformationRoutes := r.Group("/type-informations")
	{
		typeInformationRoutes.GET("", typeInformationController.GetTypeInformations)
	}

	// Protected Customer Routes
	customerRoutes := r.Group("/customers")
	customerRoutes.Use(middleware.CustomerAuthMiddleware())
	{
		customerRoutes.GET("/me", customerController.GetCurrentCustomer)
	}

	// Protected Employee Routes
	employeeProtectedRoutes := r.Group("/employees")
	employeeProtectedRoutes.Use(middleware.EmployeeAuthMiddleware())
	{
		employeeProtectedRoutes.GET("/me", employeeController.GetCurrentEmployee)
		employeeProtectedRoutes.PUT("/me", employeeController.UpdateCurrentEmployee)
	}

	// Inspection Appointment Routes
	inspectionRoutes := r.Group("/inspection-appointments")
	{
		inspectionRoutes.GET("", inspectionAppointmentController.GetInspectionAppointments)
		inspectionRoutes.GET("/:id", inspectionAppointmentController.GetInspectionAppointmentByID)
		inspectionRoutes.GET("/customer/:customerID", inspectionAppointmentController.GetInspectionAppointmentsByCustomerID)
		inspectionRoutes.POST("", inspectionAppointmentController.CreateInspectionAppointment)
		inspectionRoutes.PUT("/:id", inspectionAppointmentController.UpdateInspectionAppointment)
		inspectionRoutes.PATCH("/:id/status", inspectionAppointmentController.UpdateInspectionAppointmentStatus)
		inspectionRoutes.DELETE("/:id", inspectionAppointmentController.DeleteInspectionAppointment)
	}

	// Pickup Delivery Routes
	pickupDeliveryRoutes := r.Group("/pickup-deliveries")
	{
		pickupDeliveryRoutes.GET("/:id", pickupDeliveryController.GetPickupDeliveryByID)
		pickupDeliveryRoutes.GET("/employee/:employeeID", pickupDeliveryController.GetPickupDeliveriesByEmployeeID)
		pickupDeliveryRoutes.GET("", pickupDeliveryController.GetPickupDeliveries)
		pickupDeliveryRoutes.GET("/customer/:customerID", pickupDeliveryController.GetPickupDeliveriesByCustomerID)
		pickupDeliveryRoutes.POST("", pickupDeliveryController.CreatePickupDelivery)
		pickupDeliveryRoutes.PUT("/:id", pickupDeliveryController.UpdatePickupDelivery)
		pickupDeliveryRoutes.PATCH("/:id/status", pickupDeliveryController.UpdatePickupDeliveryStatus)
		pickupDeliveryRoutes.DELETE("/:id", pickupDeliveryController.DeletePickupDelivery)
	}

	// Public Employee Routes
	employeePublicRoutes := r.Group("/employees")
	{
		employeePublicRoutes.GET("", employeeController.GetEmployees)
		employeePublicRoutes.GET("/:id", employeeController.GetEmployeeByID)
	}

	// ✅ New API Group (สำหรับ Manager + Leaves)
	api := r.Group("/api")
	{
		// Leave Routes
		api.GET("/leaves", leaveController.ListLeaves)
		api.GET("/employees/:id/leaves", leaveController.ListLeavesByEmployee)
		api.POST("/leaves", leaveController.CreateLeave)
		api.PUT("/leaves/:id/status", leaveController.UpdateLeaveStatus)

		// Employee CRUD (Manager)
		api.GET("/employees", employeeController.GetEmployees)
		api.GET("/employees/:id", employeeController.GetEmployeeByID)
		api.POST("/employees", employeeController.CreateEmployee)
		api.PUT("/employees/:id", employeeController.UpdateEmployeeByID)
		api.DELETE("/employees/:id", employeeController.DeleteEmployeeByID)
	}

	// Admin-Only Routes
	adminCustomerRoutes := r.Group("/admin/customers")
	{
		adminCustomerRoutes.GET("/:id", customerController.GetCustomerByID)
		adminCustomerRoutes.PUT("/:id", customerController.UpdateCustomer)
		adminCustomerRoutes.DELETE("/:id", customerController.DeleteCustomer)
	}
	rentListRoutes := r.Group("/rentlists")
	{
		rentListRoutes.GET("/:carId", rentListController.GetRentListsByCar)
		rentListRoutes.PUT("", rentListController.CreateOrUpdateRentList)
		rentListRoutes.DELETE("/date/:dateId", rentListController.DeleteRentDate)
		rentListRoutes.POST("/contract", rentListController.CreateRentContract)
	}

	// Start server
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Failed to run server:", err)
	}
}
