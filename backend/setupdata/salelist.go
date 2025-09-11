package setupdata

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"gorm.io/gorm"
)

// InsertMockSaleList สร้าง SaleList mock ให้รถแต่ละคัน 1 รายการ
func InsertMockSaleList(db *gorm.DB) {
	// ดึงรถทั้งหมด
	var cars []entity.Car
	if err := db.Find(&cars).Error; err != nil {
		fmt.Println("ไม่สามารถดึงข้อมูลรถ:", err)
		return
	}
	if len(cars) == 0 {
		fmt.Println("ไม่พบรถในระบบ -> ยัง insert SaleList ไม่ได้")
		return
	}

	// ดึงพนักงานคนแรก
	var emp entity.Employee
	if err := db.First(&emp).Error; err != nil {
		fmt.Println("ไม่พบพนักงาน -> ยัง insert SaleList ไม่ได้")
		return
	}

	// ดึง Manager ทั้งหมด
	var managers []entity.Manager
	if err := db.Find(&managers).Error; err != nil || len(managers) == 0 {
		fmt.Println("ไม่พบ Manager -> ยัง insert SaleList ไม่ได้")
		return
	}

	rand.Seed(time.Now().UnixNano())

	// จำกัดสูงสุด 20 คัน
	limit := 20
	if len(cars) < limit {
		limit = len(cars)
	}

	for i := 0; i < limit; i++ {
		car := cars[i]

		// สุ่มราคาขายจากต้นทุน
		salePrice := car.PurchasePrice + float64(rand.Intn(200000)) // +0 ถึง +200k

		// สุ่มสถานะ
		status := "Available"
		if rand.Intn(2) == 0 {
			status = "Sold"
		}

		// สุ่ม Manager
		manager := managers[rand.Intn(len(managers))]

		sale := entity.SaleList{
			SalePrice:  salePrice,
			CarID:      car.ID,
			Status:     status,
			ManagerID:  manager.ID,
			EmployeeID: emp.EmployeeID,
		}

		db.Create(&sale)
	}

	fmt.Printf("Inserted mock SaleList successfully! (%d records)\n", limit)
}
