import type { Leave, LeaveType } from "../types/leave";

const API = "http://localhost:8080/api/leaves";

// ✅ ดึงคำขอลารออนุมัติ
export async function getPendingLeaves(): Promise<Leave[]> {
  const res = await fetch(`${API}?status=pending`);
  if (!res.ok) throw new Error(`getPendingLeaves failed: ${res.status}`);
  return res.json();
}

// ✅ ดึงคำขอลาทั้งหมดของพนักงาน
export async function getLeavesByEmployee(employeeID: number): Promise<Leave[]> {
  const res = await fetch(`${API.replace("/leaves", "")}/employees/${employeeID}/leaves`);
  if (!res.ok) throw new Error(`getLeavesByEmployee failed: ${res.status}`);
  return res.json();
}

// ✅ สร้างคำขอลา
export async function createLeave(data: {
  employeeID: number;   // ✅ เปลี่ยนจาก string → number
  startDate: string;
  endDate: string;
  type: LeaveType;
}): Promise<Leave> {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`createLeave failed: ${res.status}`);
  return res.json();
}

// ✅ อัปเดตสถานะคำขอลา
export async function updateLeaveStatus(leaveID: number, status: "approved" | "denied"): Promise<void> {
  const res = await fetch(`${API}/${leaveID}/status`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error(`updateLeaveStatus failed: ${res.status}`);
}
