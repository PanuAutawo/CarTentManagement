import React, { useState } from "react";
import type { LeaveType } from "../../types/leave";

interface Props {
  onSubmit: (data: { startDate: string; endDate: string; type: LeaveType }) => void;
  onCancel: () => void;
  showNotification: (notif: { type: "success" | "error"; message: string }) => void;
}

const LeaveRequestForm: React.FC<Props> = ({ onSubmit, onCancel, showNotification }) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState<LeaveType>("ลาป่วย");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!startDate || !endDate) {
      showNotification({ type: "error", message: "กรุณากรอกวันที่เริ่มและวันที่สิ้นสุด" });
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      showNotification({ type: "error", message: "วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่ม" });
      return;
    }

    onSubmit({ startDate, endDate, type });
    setStartDate("");
    setEndDate("");
    setType("ลาป่วย");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>ยื่นคำขอลา</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>วันเริ่มลา</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>วันสิ้นสุดลา</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>ประเภทการลา</label>
            <select value={type} onChange={(e) => setType(e.target.value as LeaveType)}>
              <option value="ลาป่วย">ลาป่วย</option>
              <option value="ลากิจ">ลากิจ</option>
              <option value="ลาพักร้อน">ลาพักร้อน</option>
            </select>
          </div>
          <div className="form-group modal-buttons">
            <button type="submit">ส่งคำขอ</button>
            <button type="button" onClick={onCancel}>ยกเลิก</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveRequestForm;
