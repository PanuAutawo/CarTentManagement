// src/interface/Customer.ts
import type dayjs from "dayjs";

export interface Customer {
    ID: number; // เปลี่ยนจาก string เป็น number
    FirstName: string;
    LastName: string;
    Password: string;
    Email: string;
    Phone: string;
    Birthday: dayjs.Dayjs;
}