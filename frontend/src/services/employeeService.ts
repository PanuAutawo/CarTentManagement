// src/services/employeeService.ts
import type { Employee } from "../types/employee";

const API = "http://localhost:8080";

// ✅ ตัวช่วยสร้าง header ที่ปลอดภัย
function authHeaders(token?: string): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

// ✅ ดึงข้อมูล "ฉัน" หลังล็อกอิน (ต้องส่ง token)
export async function getMyEmployee(token: string): Promise<Employee> {
  const res = await fetch(`${API}/employees/me`, {
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error(`getMyEmployee failed: ${res.status}`);
  return res.json();
}

// ✅ สำหรับ Manager ใช้ดึงพนักงานทั้งหมด
export async function getEmployees(): Promise<Employee[]> {
  const res = await fetch(`${API}/api/employees`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`getEmployees failed: ${res.status}`);
  return res.json();
}

// ✅ ดึงข้อมูลพนักงานตาม ID
export async function fetchEmployee(id: number): Promise<Employee> {
  const res = await fetch(`${API}/api/employees/${id}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`fetchEmployee failed: ${res.status}`);
  return res.json();
}

// ✅ เพิ่มพนักงานใหม่ (Manager ใช้)
export async function addEmployee(
  employee: Omit<Employee, "employeeID">
): Promise<Employee> {
  const payload: any = { ...employee };

  // ✅ ลบ birthday ถ้าไม่กรอก
  if (!payload.birthday || String(payload.birthday).trim() === "") {
    delete payload.birthday;
  } else if (payload.birthday instanceof Date) {
    payload.birthday = payload.birthday.toISOString();
  }

  const res = await fetch(`${API}/api/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`addEmployee failed: ${res.status} ${text}`);
  }
  return res.json();
}

// ✅ อัปเดตข้อมูลพนักงาน
export async function updateEmployee(employee: Employee): Promise<Employee> {
  if (!employee?.employeeID) {
    throw new Error("updateEmployee requires employee.employeeID");
  }

  const res = await fetch(`${API}/api/employees/${employee.employeeID}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employee),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`updateEmployee failed: ${res.status} ${text}`);
  }
  return res.json();
}

// ✅ ลบพนักงาน
export async function deleteEmployee(employeeID: number): Promise<void> {
  const res = await fetch(`${API}/api/employees/${employeeID}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`deleteEmployee failed: ${res.status} ${text}`);
  }
}
