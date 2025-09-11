import React from "react";
import type { Employee } from "../../types/employee";

interface PersonalInfoFormProps {
  data: Employee;
  isEditing: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  errors?: { [key: string]: string };
  showNotification?: (notif: { type: "success" | "error"; message: string }) => void;
}

/** แปลงค่าวันที่จาก ISO/Date/string -> "YYYY-MM-DD" สำหรับ <input type="date"> */
function toDateInputValue(value?: string | Date | null): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;

  if (isNaN(d.getTime())) return "";

  // ปรับ timezone ให้ได้วันที่ท้องถิ่นที่ถูกต้อง แล้วตัด 10 ตัวหน้า
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({
  data,
  isEditing,
  onChange,
  errors,
  showNotification,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification?.({ type: "error", message: "กรุณาเลือกไฟล์รูปภาพ" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showNotification?.({ type: "error", message: "ขนาดไฟล์ต้องไม่เกิน 2MB" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange({
        target: { id: "profileImage", value: reader.result as string },
      } as React.ChangeEvent<HTMLInputElement>);
    };
    reader.readAsDataURL(file);
  };

  const fieldLabels: { [key: string]: string } = {
    firstName: "ชื่อ",
    lastName: "นามสกุล",
    email: "อีเมล",
    phone: "เบอร์โทร",
    address: "ที่อยู่",
    birthday: "วันเกิด",
  };

  /** ทำให้ value ที่ส่งเข้า input ถูกต้องตาม type */
  const getFieldValue = (field: keyof Employee): string => {
    if (field === "birthday") {
      // รองรับทั้ง string ISO, "YYYY-MM-DD" และ Date
      return toDateInputValue(data.birthday as any);
    }
    const v = (data as any)[field];
    return v ?? "";
  };

  /** normalize ค่า sex จาก DB ("Male"/"Female") -> option ("male"/"female") */
  const sexValue = (data.sex ? String(data.sex).toLowerCase() : "male") as "male" | "female" | "other";

  return (
    <section className="card personal-info">
      <h2>ข้อมูลส่วนตัว</h2>
      <div className="personal-info-container">
        <div className="profile-image-container">
          <label htmlFor="profileImage" className="profile-image-label">
            {data.profileImage ? (
              <img src={data.profileImage} alt="Profile" className="profile-image" />
            ) : (
              <div className="profile-placeholder">คลิกเพื่ออัปโหลด</div>
            )}
          </label>
          <input
            id="profileImage"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={!isEditing}
            style={{ display: "none" }}
          />
          <div className="profile-id">ID: {data.employeeID || "-"}</div>
        </div>

        <div className="personal-fields">
          {Object.keys(fieldLabels).map((field) => {
            const key = field as keyof Employee;
            const isBirthday = field === "birthday";
            return (
              <div key={field} className="form-group">
                <label htmlFor={field}>{fieldLabels[field]}</label>
                <input
                  id={field}
                  type={isBirthday ? "date" : "text"}
                  value={getFieldValue(key)}
                  onChange={onChange}
                  disabled={!isEditing}
                />
                {errors?.[field] && <small className="error">{errors[field]}</small>}
              </div>
            );
          })}

          <div className="form-group">
            <label htmlFor="sex">เพศ</label>
            <select id="sex" value={sexValue} onChange={onChange} disabled={!isEditing}>
              <option value="male">ชาย</option>
              <option value="female">หญิง</option>
              <option value="other">อื่น ๆ</option>
            </select>
            {errors?.sex && <small className="error">{errors.sex}</small>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PersonalInfoForm;
