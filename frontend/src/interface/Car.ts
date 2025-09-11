// interface/Car.ts

// ---- Picture ----
export interface CarPicture {
  ID: number;
  path: string;
  title: string;   // path ของรูปจาก backend
  car_id: number;
}
export interface SaleInfo {
  sale_price: number;
}

export interface RentInfo {
  rent_price: number;
  rent_start_date: string;
  rent_end_date: string;
}
// ---- Brand / Model / Submodel ----
export interface Brand {
  ID: number;
  brandName: string;
}

export interface CarModel {
  ID: number;
  modelName: string;
  brandID: number;
}

export interface SubModel {
  ID: number;
  submodelName: string;
  carModelID: number;
}

// ---- Province ----
export interface Province {
  ID: number;
  provinceName: string;
}

// ---- Car Info ----
export type CarType = 'sale' | 'rent' | 'noUse';

export interface CarInfo {
  ID: number;
  carName: string;
  yearManufacture: number;
  purchasePrice: number;
  startUseDate: string; // ISO string
  color: string;

  // optional relations
  brand?: Brand;
  model?: CarModel;
  submodel?: SubModel;
  province?: Province;
  pictures?: CarPicture[];

  // field เพิ่มเติม
  mileage?: number;
  condition?: string;
  type?: CarType;

  sale_list?: SaleInfo[];
  rent_list?: RentInfo[];
}

// ---- Filter ----
export interface FilterValues {
  type?: CarType;
  priceRange?: [number, number];
  ageRange?: [number, number]; // ใช้ yearManufacture หรือ startUseDate
  mileageMax?: number;
  conditions?: string[];
  brand?: string;
  model?: string;
  subModel?: string;
  province?: string;
}

// ---- Sort ----
export type SortOption =
  | 'priceAsc'
  | 'priceDesc'
  | 'mileageAsc'
  | 'mileageDesc'
  | 'condition'
  | 'yearUsedAsc'
  | 'yearUsedDesc';

export type SortField = 'condition' | 'price' | 'mileage' | 'year';

export interface SortConfig {
  fields: SortField[];            // ลำดับ priority ของการ sort
  orders?: ('asc' | 'desc')[];   // order ของแต่ละ field, default เป็น asc
}
