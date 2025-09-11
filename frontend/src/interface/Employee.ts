// src/interface/Employee.ts
export interface Employee {
  ID: number; // เปลี่ยนจาก id เป็น ID
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  profileImage: string;
  firstName: string;
  lastName: string;
  password?: string;
  email: string;
  phoneNumber: string;
  address: string;
  startDate: string;
  
  sex: Sex;

  position: string;
  jobType: string;
  totalSales: number;
}

// แก้ไขค่าใน Type 'Sex' ให้เป็นตัวพิมพ์เล็กทั้งหมด
export type Sex = 'male' | 'female' | 'other';