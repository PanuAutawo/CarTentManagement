// src/types/cars.ts

// ------------------- Detail ของรถ -------------------
export interface CarDetail {
  Brand: string;      // ชื่อยี่ห้อ
  CarModel: string;   // ชื่อรุ่น
  SubModel: string;   // ชื่อซับโมเดล
}

// ------------------- รูปภาพของรถ -------------------
export interface CarPicture {
  ID: number;
  Title: string;
  Path: string; // full path จะต่อใน frontend
}

// ------------------- ข้อมูลการขาย -------------------
export interface SaleEntry {
  SalePrice: number;
  Status: string; // เช่น "on_sale", "sold"
}

// ------------------- ข้อมูลการเช่า -------------------
export interface RentPeriod {
  ID: number;
  RentPrice: number;
  RentStartDate: string;
  RentEndDate: string;
  Status: string; // เช่น "available", "rented"
}

// ------------------- Response API detail ของรถ -------------------
export interface CarResponse {
  ID: number;
  CarName: string;
  YearManufacture: number; // JSON ของคุณเป็น number
  Color: string;
  Mileage: number;
  PurchasePrice: number;
  Condition: string;
  Detail: CarDetail;
  Pictures: CarPicture[];
  SaleList: SaleEntry[] | null;
  RentList: RentPeriod[] | null;
  Province?: { ID: number }; // แค่ ID
  Employee?: { ID: number }; // แค่ ID
}

// ------------------- Type สำหรับ list / card view -------------------
export interface CarInfo {
  ID: number;
  CarName: string;
  YearManufacture: number;
  PurchasePrice: number;
  Color: string;
  Mileage: number;
  Condition: string;
  Detail: CarDetail;
  Pictures: CarPicture[];
  SaleList: SaleEntry[];
  RentList: RentPeriod[];
  Province?: { ID: number };
  Employee?: { ID: number };
}

// ------------------- Helper function สำหรับการแสดงราคาตาม priority -------------------
export function getDisplayPrice(car: CarResponse | CarInfo): { price: number; type: string } {
  // ถ้ามีรายการขาย
  if (car.SaleList && car.SaleList.length > 0) {
    return { price: car.SaleList[0].SalePrice, type: "ขาย" };
  }

  // ถ้ามีรายการเช่า
  if (car.RentList && car.RentList.length > 0) {
    return { price: car.RentList[0].RentPrice, type: `เช่า (${car.RentList[0].RentStartDate} ถึง ${car.RentList[0].RentEndDate})` };
  }

  // ถ้าไม่มีขายหรือเช่า ให้ใช้ราคาซื้อ
  if ("PurchasePrice" in car && car.PurchasePrice !== undefined) {
    return { price: car.PurchasePrice, type: "ราคาซื้อ" };
  }

  // fallback
  return { price: 0, type: "ไม่มีข้อมูลราคา" };
}