import React from "react";
import type { Leave } from "../../types/leave";

interface Props {
  leaves: Leave[];
}

const LeaveHistory: React.FC<Props> = ({ leaves }) => {
  const getStatusLabel = (status: Leave["status"]) => {
    switch (status) {
      case "approved": return { text: "อนุมัติ", class: "status-approved" };
      case "denied": return { text: "ปฏิเสธ", class: "status-denied" };
      default: return { text: "รออนุมัติ", class: "status-pending" };
    }
  };

  return (
    <section className="card leave-history">
      <h2>ประวัติการลา</h2>
      {leaves.length === 0 ? (
        <p>ยังไม่มีคำลาที่ส่ง</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>วันที่เริ่ม</th>
              <th>วันสิ้นสุด</th>
              <th>ประเภท</th>
              <th>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {leaves.map((leave) => {
              const status = getStatusLabel(leave.status);
              return (
                <tr key={leave.leaveID}>
                  <td>{leave.startDate}</td>
                  <td>{leave.endDate}</td>
                  <td>{leave.type}</td>
                  <td className={status.class}>{status.text}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
};

export default LeaveHistory;
