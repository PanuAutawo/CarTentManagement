import React, { useState } from "react";
import type { Employee } from "../../types/employee";
import EmployeeEditForm from "./EmployeeEditForm";

interface Props {
  employees: Employee[];
  showNotification: (notif: { type: "success" | "error"; message: string }) => void;
  onSave: (data: Employee | Omit<Employee, "employeeID">) => void;
  onDelete: (id: number) => void;
}

const EmployeeTable: React.FC<Props> = ({ employees, showNotification, onSave, onDelete }) => {
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  return (
    <section className="card employee-table">
      <h2>รายชื่อพนักงาน</h2>

      {/* ปุ่มเพิ่มพนักงาน */}
      <button
        className="action-btn"
        onClick={() => {
          // ✅ สร้าง object ใหม่แบบไม่ต้องมี employeeID
          setEditingEmployee({
            profileImage: "",
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            address: "",
            sex: "",
            birthday: "",
            position: "",
            jobType: "",
            totalSales: "0",
          } as Employee);
          showNotification({ type: "success", message: "กำลังเพิ่มพนักงานใหม่" });
        }}
      >
        ➕ เพิ่มพนักงาน
      </button>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>ชื่อ</th>
            <th>อีเมล</th>
            <th>ตำแหน่ง</th>
            <th>ประเภทงาน</th>
            <th>ยอดขายรวม</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {employees.map(emp => (
            <tr key={emp.employeeID}>
              <td>{emp.employeeID.toString().padStart(3, "0")}</td>
              <td>{emp.firstName} {emp.lastName}</td>
              <td>{emp.email}</td>
              <td>{emp.position}</td>
              <td>{emp.jobType}</td>
              <td>{emp.totalSales}</td>
              <td>
                {/* ปุ่มแก้ไข */}
                <button onClick={() => {
                  setEditingEmployee(emp);
                  showNotification({ type: "success", message: `กำลังแก้ไขพนักงาน ${emp.firstName}` });
                }}>✏️</button>

                {/* ปุ่มลบ */}
                <button onClick={() => {
                  onDelete(emp.employeeID);
                  showNotification({ type: "success", message: `ลบพนักงาน ${emp.firstName} เรียบร้อย` });
                }}>🗑️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ฟอร์มแก้ไข/เพิ่มพนักงาน */}
      {editingEmployee && (
        <EmployeeEditForm
          employee={editingEmployee}
          onCancel={() => setEditingEmployee(null)}
          onSave={(data) => {
            onSave(data);
            setEditingEmployee(null);
            showNotification({ type: "success", message: "บันทึกข้อมูลพนักงานเรียบร้อย" });
          }}
        />
      )}
    </section>
  );
};

export default EmployeeTable;
