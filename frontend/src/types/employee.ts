import type dayjs from "dayjs";

export type Sex = ""|"male" | "female" | "other";
export type JobType = ""|"Full-time" | "Part-time" | "Contract";

export interface Employee {
  employeeID: number;   // ✅ เปลี่ยนจาก string → number
  profileImage: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  sex: Sex;
  birthday: dayjs.Dayjs;
  position: string;
  jobType: JobType;
  totalSales: string;
}
