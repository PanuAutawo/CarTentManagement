// src/pages/customer/inspection/InspectionCreatePage.tsx
import React, { useState, useEffect } from 'react';
import {
    Button, Space, Row, Col, Input, Typography, Divider, message, Spin
} from 'antd';
import { CarOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import utc from 'dayjs/plugin/utc';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';

import CustomDatePicker from '../../../components/datetimepicker';
import InspectionCard from '../../../components/PickupCarCard';
import { timeOptions } from '../../../data/data';

dayjs.locale('th');
dayjs.extend(utc);

const { Title, Text } = Typography;

// Corrected interface to match the backend response
interface CarSystem {
    ID: number;
    system_name: string;
}

interface InspectionAppointmentResponse {
    ID: number;
    note: string;
    date_time: string;
    SalesContractID: number;
    inspection_status: string;
    InspectionSystem: { CarSystem: { system_name: string } }[];
}

const InspectionCreatePage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const editingId = searchParams.get('id');
    const [bookedTimes, setBookedTimes] = useState<string[]>([]);
    const [carSystems, setCarSystems] = useState<CarSystem[]>([]);
    const { user, token } = useAuth();
    const [loading, setLoading] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [contractNumber, setContractNumber] = useState('');
    const [messageText, setMessageText] = useState('');
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
    const [selectedTime, setSelectedTime] = useState<string | null>(null);
    const [selectedSystemNames, setSelectedSystemNames] = useState<string[]>([]);
    const [isSaveDisabled, setIsSaveDisabled] = useState(true);

    const inputStyle = {
        backgroundColor: '#424242',
        color: 'white',
        borderColor: '#888'
    };

    const disabledInputStyle = {
        ...inputStyle,
        backgroundColor: '#383838',
        color: '#a0a0a0',
        cursor: 'not-allowed',
    };

    // State to store all appointments to prevent refetching
    const [allAppointments, setAllAppointments] = useState<InspectionAppointmentResponse[]>([]);

    // Fetch inspection systems from the backend
    useEffect(() => {
        const fetchCarSystems = async () => {
            try {
                const response = await fetch('http://localhost:8080/car-systems');
                if (response.ok) {
                    const data = await response.json();
                    setCarSystems(data);
                } else {
                    message.error('ไม่สามารถดึงข้อมูลรายการตรวจสภาพได้');
                }
            } catch {
                message.error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
            }
        };
        fetchCarSystems();
    }, []);

    // Fetch all appointments once on component mount
    useEffect(() => {
        const fetchAllAppointments = async () => {
            try {
                const response = await fetch('http://localhost:8080/inspection-appointments');
                if (response.ok) {
                    const data = await response.json();
                    setAllAppointments(data);
                }
            } catch (error) {
                console.error('Failed to fetch all appointments:', error);
            }
        };
        fetchAllAppointments();
    }, []);


    // --- vvvvv --- START: โค้ดที่แก้ไข --- vvvvv ---
    // Effect to filter booked times based on the selected date and current time
    useEffect(() => {
        if (selectedDate && allAppointments.length > 0) {
            const formattedDate = selectedDate.format('YYYY-MM-DD');

            // 1. Get all booked time slots for the selected date (including duplicates)
            const allBookedTimesForDate = allAppointments
                .filter(booking =>
                    dayjs(booking.date_time).format('YYYY-MM-DD') === formattedDate &&
                    booking.inspection_status !== 'ยกเลิก' &&
                    booking.ID !== Number(editingId)
                )
                .map(booking => dayjs.utc(booking.date_time).format('HH:mm'));

            // 2. Count the occurrences of each time slot
            const timeSlotCounts = allBookedTimesForDate.reduce((acc, time) => {
                acc[time] = (acc[time] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            // 3. Find time slots that are booked 3 or more times
            const fullyBookedTimes = Object.keys(timeSlotCounts).filter(time => timeSlotCounts[time] >= 3);

            // Logic to handle past times for the current day
            const now = dayjs();
            const isToday = selectedDate.isSame(now, 'day');
            
            let pastTimes: string[] = [];
            if (isToday) {
                const currentHour = now.hour();
                
                if (currentHour >= 12) {
                    pastTimes = timeOptions;
                } else {
                    pastTimes = timeOptions.filter(time => {
                        const timeSlotHour = parseInt(time.split(':')[0], 10);
                        return timeSlotHour <= currentHour;
                    });
                }
            }
            
            // 4. Combine fully booked times with past times
            const unavailableTimes = [...new Set([...fullyBookedTimes, ...pastTimes])];
            setBookedTimes(unavailableTimes);

            // If the currently selected time becomes unavailable, clear it
            if (selectedTime && unavailableTimes.includes(selectedTime)) {
                setSelectedTime(null);
            }
        }
    }, [selectedDate, allAppointments, editingId, selectedTime]);
    // --- ^^^^^ --- END: จบส่วนที่แก้ไข --- ^^^^^ ---

    // Effect to fetch booking details for editing
    useEffect(() => {
        const fetchBookingDetails = async () => {
            if (editingId && user && token) {
                setLoading(true);
                try {
                    const response = await fetch(`http://localhost:8080/inspection-appointments/${editingId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (response.ok) {
                        const data: InspectionAppointmentResponse = await response.json();
                        setContractNumber(String(data.SalesContractID) || '');
                        setMessageText(data.note || '');
                        setSelectedDate(dayjs(data.date_time));
                        setSelectedTime(dayjs.utc(data.date_time).format('HH:mm'));
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        setSelectedSystemNames(data.InspectionSystem.map((item: any) => item.CarSystem.system_name));
                    } else {
                        message.error('ไม่สามารถดึงข้อมูลการนัดหมายเพื่อแก้ไขได้');
                        navigate('/inspection-car');
                    }
                } catch (error) {
                    console.error('Failed to fetch booking details:', error);
                    message.error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchBookingDetails();
    }, [editingId, user, token, navigate]);

    useEffect(() => {
        const currentCustomerString = localStorage.getItem('currentCustomer');
        if (currentCustomerString) {
            try {
                const currentCustomer = JSON.parse(currentCustomerString);
                setFirstName(currentCustomer.FirstName);
                setLastName(currentCustomer.LastName);
            } catch {
                message.error('ข้อมูลใน localStorage ไม่ถูกต้อง');
                navigate('/login');
            }
        } else {
            message.warning('ไม่พบข้อมูลผู้ใช้ กรุณาเข้าสู่ระบบ');
            navigate('/login');
        }
    }, [navigate]);

    useEffect(() => {
        const isInfoMissing = !firstName || !lastName || !contractNumber || !selectedDate || !selectedTime;
        const isSystemSelected = selectedSystemNames.length > 0;
        setIsSaveDisabled(isInfoMissing || !isSystemSelected);
    }, [firstName, lastName, contractNumber, selectedDate, selectedTime, selectedSystemNames]);

    const handleSystemSelect = (label: string) => {
        setSelectedSystemNames(prev =>
            prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
        );
    };

    const handleSave = async () => {
        if (!user || !token) {
            message.error('กรุณาเข้าสู่ระบบก่อนทำการนัดหมาย');
            navigate('/login');
            return;
        }

        const salesContractID = parseInt(contractNumber);
        if (isNaN(salesContractID)) {
             message.error('กรุณากรอกหมายเลขสัญญาซื้อขายเป็นตัวเลข');
             return;
        }

        const carSystemIDs = selectedSystemNames.map(name => {
            const system = carSystems.find(s => s.system_name === name);
            return system ? system.ID : undefined;
        }).filter(id => id !== undefined);

        const newAppointmentData = {
            CustomerID: user.ID,
            note: messageText,
            date_time: dayjs(selectedDate).format('YYYY-MM-DD') + 'T' + selectedTime + ':00Z',
            SalesContractID: salesContractID,
            inspection_status: "กำลังดำเนินการ",
            CarSystemIDs: carSystemIDs,
        };

        const method = editingId ? 'PUT' : 'POST';
        const url = editingId ? `http://localhost:8080/inspection-appointments/${editingId}` : 'http://localhost:8080/inspection-appointments';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(newAppointmentData),
            });

            if (response.ok) {
                message.success(editingId ? 'แก้ไขการนัดหมายสำเร็จ!' : 'สร้างการนัดหมายสำเร็จ!');
                navigate('/inspection-car');
            } else {
                const errorData = await response.json();
                message.error(`เกิดข้อผิดพลาด: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Failed to create/update inspection appointment:', error);
            message.error('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
        }
    };

    const handleCancel = () => {
        navigate('/inspection-car');
    };

    const disabledDate = (current: Dayjs): boolean => {
        const now = dayjs();
        if (current && current.isBefore(now, 'day')) {
            return true;
        }
        if (now.hour() >= 12 && current && current.isSame(now, 'day')) {
            return true;
        }
        return false;
    };
    const customCss = `
        .ant-input::placeholder {
            color: #a9a9a9 !important;
        }
    `;

    if (loading) {
        return (
            <div style={{ textAlign: 'center', marginTop: '100px' }}>
                <Spin size="large" />
                <p style={{ color: 'white', marginTop: '20px' }}>กำลังดึงข้อมูล...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '24px 48px' }}>
            <style>{customCss}</style>
            <div style={{ minHeight: 'calc(100vh - 180px)', padding: 24 }}>
                <Row justify="center">
                    <Col xs={24} sm={22} md={20} lg={18} xl={16}>
                        <Title level={2} style={{ color: 'white' }}>{editingId ? 'แก้ไข' : 'สร้าง'}การนัดหมายตรวจสภาพรถยนต์</Title>
                        <Divider style={{ borderColor: '#424242' }} />

                        <Title level={4} style={{ color: '#f1d430ff' }}>ข้อมูลลูกค้า</Title>
                        <Row align="middle" gutter={[16, 20]} style={{ marginBottom: '40px' }}>
                            <Col xs={24} sm={8} style={{ textAlign: 'left' }}><Text style={{ color: 'white' }}>ชื่อ</Text></Col>
                            <Col xs={24} sm={16}><Input placeholder="ชื่อ" value={firstName} style={disabledInputStyle} disabled /></Col>

                            <Col xs={24} sm={8} style={{ textAlign: 'left' }}><Text style={{ color: 'white' }}>นามสกุล</Text></Col>
                            <Col xs={24} sm={16}><Input placeholder="นามสกุล" value={lastName} style={disabledInputStyle} disabled /></Col>

                            <Col xs={24} sm={8} style={{ textAlign: 'left' }}><Text style={{ color: 'white' }}>หมายเลขสัญญาซื้อขาย</Text></Col>
                            <Col xs={24} sm={16}><Input placeholder="กรอกหมายเลขสัญญา" value={contractNumber} onChange={e => setContractNumber(e.target.value)} style={inputStyle} /></Col>

                            <Col xs={24} sm={8} style={{ textAlign: 'left' }}><Text style={{ color: 'white' }}>ข้อความแจ้งช่าง (ถ้ามี)</Text></Col>
                            <Col xs={24} sm={16}><Input.TextArea placeholder="รายละเอียดเพิ่มเติม" value={messageText} onChange={e => setMessageText(e.target.value)} style={inputStyle} /></Col>
                        </Row>

                        <Title level={4} style={{ color: 'white' }}>เลือกวันเวลานัดหมาย</Title>
                        <div style={{ background: '#4A4A4A', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', marginBottom: '40px' }}>
                            <CustomDatePicker
                                selectedDate={selectedDate}
                                setSelectedDate={setSelectedDate as (date: Dayjs) => void}
                                disabledDate={disabledDate}
                            />
                            <div style={{ padding: '24px' }}>
                                <Row gutter={[16, 16]}>
                                    {timeOptions.map((time, index) => {
                                        const isUnavailable = bookedTimes.includes(time);
                                        const isSelected = selectedTime === time;

                                        return (
                                            <Col xs={12} sm={8} md={6} key={index}>
                                                <Button
                                                    disabled={isUnavailable}
                                                    style={{
                                                        width: '100%',
                                                        height: '50px',
                                                        background: isSelected ? '#f1d430ff' : 'transparent',
                                                        color: isSelected ? 'black' : isUnavailable ? '#888' : 'white',
                                                        borderColor: isSelected ? '#f1d430ff' : isUnavailable ? '#555' : '#ddd',
                                                        borderRadius: '6px',
                                                        cursor: isUnavailable ? 'not-allowed' : 'pointer',
                                                    }}
                                                    onClick={() => setSelectedTime(time)}
                                                >
                                                    {time}
                                                </Button>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </div>
                        </div>

                        <Title level={4} style={{ color: 'white' }}>เลือกรายการที่ต้องการตรวจ</Title>
                        <div style={{ background: '#4A4A4A', padding: '24px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}>
                            <Row gutter={[16, 16]}>
                                {carSystems.map(system => (
                                    <Col xs={12} sm={8} md={6} key={system.ID}>
                                        <InspectionCard
                                            label={system.system_name}
                                            iconType={<CarOutlined />}
                                            isSelected={selectedSystemNames.includes(system.system_name)}
                                            onSelect={() => handleSystemSelect(system.system_name)}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </div>

                        <Row justify="center" style={{ marginTop: '60px' }}>
                            <Space size="middle">
                                <Button
                                    disabled={isSaveDisabled}
                                    style={{
                                        width: '120px',
                                        height: '40px',
                                        background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                                        color: 'black',
                                        border: 'none',
                                        fontWeight: 'bold',
                                        cursor: isSaveDisabled ? 'not-allowed' : 'pointer',
                                    }}
                                    onClick={handleSave}
                                >
                                    บันทึก
                                </Button>
                                <Button
                                    type="default"
                                    style={{
                                        width: '120px',
                                        height: '40px',
                                        background: 'transparent',
                                        borderColor: '#888',
                                        color: '#888'
                                    }}
                                    onClick={handleCancel}
                                >
                                    ยกเลิก
                                </Button>
                            </Space>
                        </Row>
                    </Col>
                </Row>
            </div>
        </div>
    );
};
export default InspectionCreatePage;