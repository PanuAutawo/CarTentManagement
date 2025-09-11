package entity

type CarResponse struct {
	ID              uint                 `json:"id"`
	CarName         string               `json:"car_name"`
	YearManufacture int                  `json:"year_manufacture"`
	Color           string               `json:"color"`
	Mileage         int                  `json:"mileage"`
	PurchasePrice   float64              `json:"purchase_price"`
	Condition       string               `json:"condition"`
	Detail          CarDetail            `json:"detail"`
	SaleList        []SaleEntry          `json:"sale_list"`
	RentList        []RentPeriod         `json:"rent_list"`
	Pictures        []CarPictureResponse `json:"pictures"`
	Province        *ProvinceResponse    `json:"province,omitempty"`
	Employee        *EmployeeResponse    `json:"employee,omitempty"`
}

type CarDetail struct {
	Brand    string `json:"brand"`
	CarModel string `json:"car_model"`
	SubModel string `json:"sub_model"`
}

type SaleEntry struct {
	SalePrice float64 `json:"sale_price"`
	Status    string  `json:"status"`
}

type RentPeriod struct {
	ID            uint    `json:"id"`
	RentPrice     float64 `json:"rent_price"`
	RentStartDate string  `json:"rent_start_date"`
	RentEndDate   string  `json:"rent_end_date"`
	Status        string  `json:"status"`
}

type CarPictureResponse struct {
	ID    uint   `json:"id"`
	Title string `json:"title"`
	Path  string `json:"path"`
}

type ProvinceResponse struct {
	ID uint `json:"id"`
}

type EmployeeResponse struct {
	ID uint `json:"id"`
}
