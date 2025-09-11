import React, { useState } from "react";
import type { Employee } from "../../types/employee";

interface Props {
  employee: Partial<Employee>; // ✅ ใช้ Partial เพราะตอนเพิ่มใหม่ยังไม่มี ID
  onCancel: () => void;
  onSave: (data: Employee | Omit<Employee, "employeeID">) => void;
}

const EmployeeEditForm: React.FC<Props> = ({ employee, onCancel, onSave }) => {
  const [formData, setFormData] = useState<Partial<Employee>>({ ...employee });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // ✅ ถ้ามี employeeID แสดงว่าแก้ไข
    if ("employeeID" in formData && formData.employeeID !== undefined) {
      onSave(formData as Employee);
    } else {
      // ✅ ถ้าไม่มี employeeID แสดงว่าเพิ่มใหม่
      const { employeeID, ...newData } = formData;
      onSave(newData as Omit<Employee, "employeeID">);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{formData.employeeID ? "แก้ไขพนักงาน" : "เพิ่มพนักงานใหม่"}</h2>
        <form onSubmit={handleSubmit}>
          {/* ✅ แสดง ID เฉพาะกรณีแก้ไข */}
          {formData.employeeID && (
            <div className="form-group">
              <label>ID</label>
              <input
                id="employeeID"
                value={formData.employeeID}
                disabled
              />
            </div>
          )}

          <div className="form-group">
            <label>ชื่อ</label>
            <input id="firstName" value={formData.firstName || ""} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>นามสกุล</label>
            <input id="lastName" value={formData.lastName || ""} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>อีเมล</label>
            <input id="email" type="email" value={formData.email || ""} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>ตำแหน่ง</label>
            <input id="position" value={formData.position || ""} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>ประเภทงาน</label>
            <select id="jobType" value={formData.jobType || "Full-time"} onChange={handleChange}>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
          <div className="form-group">
            <label>ยอดขายรวม</label>
            <input id="totalSales" value={formData.totalSales || ""} onChange={handleChange} />
          </div>
          <div className="modal-buttons">
            <button type="submit">บันทึก</button>
            <button type="button" onClick={onCancel}>ยกเลิก</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeEditForm;