import React, { useState, useEffect } from "react";
import "../../../components/ManagerDashbord/ManagerStyle.css";
import LeaveApprovalList from "../../../components/ManagerDashbord/LeaveApprovalList";
import EmployeeTable from "../../../components/ManagerDashbord/EmployeeTable";
import Notification from "../../../components/common/Notification";

import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from "../../../services/employeeService";
import { getPendingLeaves, updateLeaveStatus } from "../../../services/leaveService";

import type { Employee } from "../../../types/employee";
import type { Leave } from "../../../types/leave";

const ManagerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("leave");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<Leave[]>([]);

  // ✅ โหลดพนักงานทั้งหมด
  useEffect(() => {
    if (activeTab === "employees") {
      getEmployees()
        .then(setEmployees)
        .catch(() => showNotification({ type: "error", message: "โหลดรายชื่อพนักงานไม่สำเร็จ" }));
    }
  }, [activeTab]);

  // ✅ โหลดคำขอลารออนุมัติ
  useEffect(() => {
    if (activeTab === "leave") {
      getPendingLeaves()
        .then(setLeaveRequests)
        .catch(() => showNotification({ type: "error", message: "โหลดคำขอลาไม่สำเร็จ" }));
    }
  }, [activeTab]);

  // ✅ แจ้งเตือน
  const showNotification = (notif: { type: "success" | "error"; message: string }) => {
    setNotification(notif);
    setTimeout(() => setNotification(null), 3000);
  };

  // ==========================
  // 📌 Employee Handlers
  // ==========================
  const handleSaveEmployee = async (employee: Employee | Omit<Employee, "employeeID">) => {
    try {
      if ("employeeID" in employee && employee.employeeID !== undefined) {
        // update
        const updated = await updateEmployee(employee as Employee);
        setEmployees(prev =>
          prev.map(e => e.employeeID === updated.employeeID ? updated : e)
        );
        showNotification({ type: "success", message: "แก้ไขข้อมูลพนักงานสำเร็จ" });
      } else {
        // add new
        const created = await addEmployee(employee as Omit<Employee, "employeeID">);
        setEmployees(prev => [...prev, created]);
        showNotification({ type: "success", message: "เพิ่มพนักงานใหม่สำเร็จ" });
      }
    } catch {
      showNotification({ type: "error", message: "ไม่สามารถบันทึกข้อมูลพนักงานได้" });
    }
  };

  const handleDeleteEmployee = async (employeeID: number) => {
    try {
      await deleteEmployee(employeeID);
      setEmployees(prev => prev.filter(e => e.employeeID !== employeeID));
      showNotification({ type: "success", message: "ลบพนักงานเรียบร้อย" });
    } catch {
      showNotification({ type: "error", message: "ไม่สามารถลบพนักงานได้" });
    }
  };

  // ==========================
  // 📌 Leave Handlers
  // ==========================
  const handleLeaveAction = async (leaveID: string, action: "approved" | "denied") => {
    try {
      await updateLeaveStatus(leaveID, action);
      setLeaveRequests(prev => prev.filter(l => l.leaveID !== leaveID));
      showNotification({
        type: "success",
        message: action === "approved" ? "อนุมัติคำขอลาเรียบร้อย" : "ปฏิเสธคำขอลาเรียบร้อย",
      });
    } catch {
      showNotification({ type: "error", message: "อัปเดตสถานะคำขอลาไม่สำเร็จ" });
    }
  };

  return (
    <div className="dashboard-container">
      <main className="main-content">
        {notification && <Notification type={notification.type} message={notification.message} />}

        <header className="dashboard-header">
          <h1>แดชบอร์ดผู้จัดการ</h1>
        </header>

        <div className="tab-buttons">
          <button
            className={activeTab === "leave" ? "active" : ""}
            onClick={() => setActiveTab("leave")}
          >
            คำขอลาพนักงาน
          </button>
          <button
            className={activeTab === "employees" ? "active" : ""}
            onClick={() => setActiveTab("employees")}
          >
            รายชื่อพนักงาน
          </button>
        </div>

        {activeTab === "leave" && (
          <LeaveApprovalList
            showNotification={showNotification}
            leaveRequests={leaveRequests}
            onAction={handleLeaveAction}
          />
        )}

        {activeTab === "employees" && (
          <EmployeeTable
            showNotification={showNotification}
            employees={employees}
            onSave={handleSaveEmployee}
            onDelete={handleDeleteEmployee}
          />
        )}
      </main>
    </div>
  );
};

export default ManagerDashboard;
