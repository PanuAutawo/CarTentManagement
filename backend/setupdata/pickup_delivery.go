package setupdata

import (
	"log"
	"time"

	"github.com/PanuAutawo/CarTentManagement/backend/entity"
	"gorm.io/gorm"
)

// InsertMockPickupDelivery สร้างข้อมูลจำลองสำหรับการนัดรับ-ส่งรถ
func InsertMockPickupDelivery(db *gorm.DB) {
	// ตรวจสอบว่ามีข้อมูลอยู่แล้วหรือไม่ ถ้ามีให้ข้ามไป
	var count int64
	db.Model(&entity.PickupDelivery{}).Count(&count)
	if count > 0 {
		log.Println("PickupDelivery data already exists. Skipping insertion.")
		return
	}

	// --- ดึงข้อมูลที่จำเป็นสำหรับการสร้าง Mock ---
	var customer entity.Customer
	db.Where("email = ?", "somying.jj@example.com").First(&customer)
	if customer.ID == 0 {
		log.Println("Customer for mock pickup/delivery not found. Skipping.")
		return
	}

	var salesContract entity.SalesContract
	db.Where("customer_id = ?", customer.ID).First(&salesContract)
	if salesContract.ID == 0 {
		log.Println("SalesContract for mock pickup/delivery not found. Skipping.")
		return
	}

	var employee entity.Employee
	db.First(&employee, 1) // สมมติว่าใช้ Employee ID 1

	var typeInfo entity.TypeInformation
	// VVVV --- แก้ไขชื่อคอลัมน์และชื่อตัวแปรตรงนี้ --- VVVV
	db.Where("type = ?", "ให้ไปส่งตามที่อยู่").First(&typeInfo)

	var province entity.Province
	// VVVV --- แก้ไขชื่อจังหวัดตรงนี้ --- VVVV
	db.Where("province_name = ?", "Bangkok").First(&province)

	var district entity.District
	db.Where("province_id = ? AND district_name = ?", province.ID, "ปทุมวัน").First(&district)

	var subDistrict entity.SubDistrict
	db.Where("district_id = ? AND sub_district_name = ?", district.ID, "ปทุมวัน").First(&subDistrict)

	// --- สร้างข้อมูล PickupDelivery ---
	pickup := entity.PickupDelivery{
		CustomerID:        customer.ID,
		TypeInformationID: typeInfo.ID,
		SalesContractID:   salesContract.ID,
		DateTime:          time.Now().Add(5 * 24 * time.Hour), // นัดอีก 5 วันข้างหน้า
		EmployeeID:        employee.EmployeeID,
		Address:           "123/45 อาคารสยามสแควร์วัน",
		SubDistrictID:     &subDistrict.ID,
		DistrictID:        &district.ID,
		ProvinceID:        &province.ID,
		Status:            "รอดำเนินการ",
	}

	if err := db.Create(&pickup).Error; err != nil {
		log.Printf("Failed to create mock pickup/delivery: %v", err)
	} else {
		log.Println("Mock PickupDelivery created successfully.")
	}
}

