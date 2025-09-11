import React from "react";
import type { Leave } from "../../types/leave";

interface Props {
  leaveRequests: Leave[];
  showNotification: (notif: { type: "success" | "error"; message: string }) => void;
  onAction: (id: string, action: "approved" | "denied") => void;
}

const LeaveApprovalList: React.FC<Props> = ({ leaveRequests, onAction }) => {
  return (
    <section className="card leave-approval">
      <h2>คำขอลาพนักงานที่รออนุมัติ</h2>
      {leaveRequests.length === 0 ? (
        <p>ไม่มีคำขอลาที่รออนุมัติ</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>รหัสคำขอ</th>
              <th>วันที่เริ่ม</th>
              <th>วันสิ้นสุด</th>
              <th>ประเภท</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.map(leave => (
              <tr key={leave.leaveID}>
                <td>{leave.leaveID}</td>
                <td>{leave.startDate}</td>
                <td>{leave.endDate}</td>
                <td>{leave.type}</td>
                <td>
                  <button className="approve-btn" onClick={() => onAction(leave.leaveID, "approved")}>
                    อนุมัติ
                  </button>
                  <button className="deny-btn" onClick={() => onAction(leave.leaveID, "denied")}>
                    ปฏิเสธ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default LeaveApprovalList;
