// src/types/leave.ts
export type LeaveType = "sick" | "vacation" | "personal";

export interface Leave {
  leaveID: number;
  employeeID: number;   // ✅ จาก string → number
  startDate: string;
  endDate: string;
  type: LeaveType;
  status?: "pending" | "approved" | "denied";
}
