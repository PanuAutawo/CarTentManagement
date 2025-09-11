import React, { useState, useEffect } from "react";
import "../../../components/EmployeeDashboard/Employeestyle.css";
import PersonalInfoForm from "../../../components/EmployeeDashboard/PersonalInfoForm";
import WorkInfo from "../../../components/EmployeeDashboard/WorkInfo";
import Actions from "../../../components/EmployeeDashboard/Actions";
import LeaveHistory from "../../../components/EmployeeDashboard/LeaveHistory";
import LeaveRequestForm from "../../../components/EmployeeDashboard/LeaveRequestForm";
import Notification from "../../../components/common/Notification";

import { getMyEmployee, updateEmployee } from "../../../services/employeeService";
import { getLeavesByEmployee, createLeave } from "../../../services/leaveService";
import { useAuth } from "../../../hooks/useAuth";

import type { Employee } from "../../../types/employee";
import type { Leave, LeaveType } from "../../../types/leave";

const EmployeeDashboard: React.FC = () => {
  const { token } = useAuth(); // ✅ ใช้ token จาก AuthContext
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Employee | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof Employee, string>>>({});
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [showLeaveForm, setShowLeaveForm] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState<Leave[]>([]);

  // ✅ โหลดข้อมูลพนักงานจาก token
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    getMyEmployee(token)
      .then(data => setFormData(data))
      .catch(() => showNotification({ type: "error", message: "เกิดข้อผิดพลาดในการโหลดข้อมูล" }))
      .finally(() => setLoading(false));
  }, [token]);

  // ✅ โหลดประวัติการลา
  useEffect(() => {
    if (!formData?.employeeID) return;
    getLeavesByEmployee(formData.employeeID)
      .then(leaves => setLeaveHistory(leaves))
      .catch(() => showNotification({ type: "error", message: "โหลดประวัติการลาไม่สำเร็จ" }));
  }, [formData?.employeeID]);

  // ✅ แสดง Notification
  const showNotification = (notif: { type: "success" | "error"; message: string }) => {
    setNotification(notif);
    setTimeout(() => setNotification(null), 3000);
  };

  // ✅ จัดการแก้ไขฟอร์ม
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setNotification(null);
  };

  // ✅ บันทึกข้อมูลพนักงาน
  const handleSave = async () => {
    if (!formData) return;
    try {
      setLoading(true);
      const updated = await updateEmployee(formData);
      setFormData(updated);
      setIsEditing(false);
      setErrors({});
      showNotification({ type: "success", message: "บันทึกสำเร็จ!" });
    } catch {
      showNotification({ type: "error", message: "เกิดข้อผิดพลาดในการบันทึกข้อมูล" });
    } finally {
      setLoading(false);
    }
  };

  // ✅ ส่งคำขอลา
  const handleLeaveSubmit = async (data: { startDate: string; endDate: string; type: LeaveType }) => {
    if (!formData) return;
    const { employeeID } = formData;

    try {
      const leave = await createLeave({
        employeeID, // ✅ ตอนนี้เป็น number แล้ว
        startDate: data.startDate,
        endDate: data.endDate,
        type: data.type,
      });

      setLeaveHistory(prev => [...prev, leave]);
      showNotification({
        type: "success",
        message: `ส่งคำขอลาเรียบร้อย: ${data.type} ${data.startDate} ถึง ${data.endDate}`,
      });
      setShowLeaveForm(false);
    } catch {
      showNotification({ type: "error", message: "ส่งคำขอลาไม่สำเร็จ" });
    }
  };

  return (
    <div className="dashboard-container">
      <main className="main-content">
        {notification && <Notification type={notification.type} message={notification.message} />}

        <header className="dashboard-header">
          <h1>สวัสดี, {formData?.firstName || "ผู้ใช้งาน"}</h1>
          {loading && <span>กำลังโหลด...</span>}
        </header>

        {/* ปุ่มแท็บ */}
        <div className="tab-buttons">
          <button
            className={activeTab === "profile" ? "active" : ""}
            onClick={() => setActiveTab("profile")}
          >
            ข้อมูลส่วนตัว
          </button>
          <button
            className={activeTab === "leave" ? "active" : ""}
            onClick={() => setActiveTab("leave")}
          >
            ประวัติการลา
          </button>
        </div>

        {/* Content */}
        {activeTab === "profile" && formData && (
          <section className="card no-border personal-info-card">
            <div className="edit-btn-container">
              {!isEditing ? (
                <button onClick={handleEdit} disabled={loading}>แก้ไขข้อมูลของฉัน</button>
              ) : (
                <button onClick={handleSave} disabled={loading}>บันทึก</button>
              )}
            </div>

            <PersonalInfoForm
              data={formData}
              isEditing={isEditing}
              onChange={handleChange}
              errors={errors}
              showNotification={showNotification}
            />
            <WorkInfo
              position={formData.position}
              jobType={formData.jobType}
              totalSales={formData.totalSales}
            />
            <Actions onLeaveRequest={() => setShowLeaveForm(true)} />
          </section>
        )}

        {activeTab === "leave" && <LeaveHistory leaves={leaveHistory} />}

        {showLeaveForm && (
          <LeaveRequestForm
            onSubmit={handleLeaveSubmit}
            onCancel={() => setShowLeaveForm(false)}
            showNotification={showNotification}
          />
        )}
      </main>
    </div>
  );
};

export default EmployeeDashboard;
