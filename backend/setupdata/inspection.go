package setupdata

import (
	"log"
	"time"
	"golang.org/x/crypto/bcrypt"
	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"gorm.io/gorm"
)

// InsertMockInspections สร้างข้อมูลจำลองสำหรับสัญญาและการนัดตรวจสภาพรถ
func InsertMockInspections(db *gorm.DB) {
	// Hash password (เปลี่ยน "123456" เป็น "password123")
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("password123"), bcrypt.DefaultCost)
	if err != nil {
		log.Fatalf("failed to hash password: %v", err)
	}

	// --- 1. สร้างข้อมูลลูกค้า (ถ้ายังไม่มี) ---
	customer := entity.Customer{
		FirstName:     "สมหญิง",
		LastName:     "สมหญิง",
		Email:    "somying.jj@example.com",
		Password: string(hashedPassword), // ในระบบจริงควรเข้ารหัสผ่าน
		Phone:      "0887654321",
		Birthday:	"2025-01-15",
	}
	// ตรวจสอบว่ามีลูกค้านี้หรือยัง ถ้าไม่มีให้สร้าง
	db.Where(entity.Customer{Email: customer.Email}).FirstOrCreate(&customer)

	// --- 2. สร้างข้อมูลสัญญาซื้อขาย (SalesContract) โดยอ้างอิงจาก SaleList ---
	// สมมติว่า InsertMockSaleList ได้สร้าง SaleList ที่มี ID = 1 ไว้แล้ว
	saleListID := uint(1)

	salesContract := entity.SalesContract{
		SaleListID: saleListID,
		EmployeeID: 1,           // สมมติว่ามี Employee ID 1 อยู่แล้ว
		CustomerID: customer.ID, // อ้างอิง ID ของลูกค้าที่เพิ่งสร้าง
	}
	// ตรวจสอบว่ามีสัญญาสำหรับ SaleList นี้หรือยัง ถ้าไม่มีให้สร้าง
	db.Where(entity.SalesContract{SaleListID: saleListID}).FirstOrCreate(&salesContract)

	// --- 3. สร้างข้อมูลการนัดตรวจสภาพรถ (InspectionAppointment) ---
	// ตรวจสอบก่อนว่ามีการนัดหมายของสัญญานี้หรือยัง
	var existingAppointment entity.InspectionAppointment
	if err := db.Where("sales_contract_id = ?", salesContract.ID).First(&existingAppointment).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			// ถ้าไม่พบ ให้สร้างการนัดหมายใหม่
			appointment := entity.InspectionAppointment{
				CustomerID:      customer.ID,
				Note:            "นัดตรวจเช็คสภาพก่อนรับรถตามสัญญา",
				DateTime:        time.Now().Add(72 * time.Hour), // นัดล่วงหน้า 3 วัน
				SalesContractID: salesContract.ID,
				InspectionStatus: "กำลังดำเนินการ",
			}
			db.Create(&appointment)

			// --- 4. เชื่อมโยงการนัดหมายกับระบบรถยนต์ (InspectionSystem) ---
			// สมมติว่าต้องการตรวจระบบ ID: 1, 2, 4, 5
			carSystemIDs := []uint{1, 2, 4, 5}
			for _, systemID := range carSystemIDs {
				inspectionSystem := entity.InspectionSystem{
					InspectionAppointmentID: appointment.ID,
					CarSystemID:             systemID,
				}
				db.Create(&inspectionSystem)
			}
			log.Println("Mock inspection appointment created successfully.")
		}
	} else {
		log.Println("Mock inspection appointment already exists.")
	}
}