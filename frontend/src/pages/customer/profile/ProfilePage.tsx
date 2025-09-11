/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import {
  Card, Avatar, Descriptions, Button, Row, Col, Typography, message,
  Form, Input, DatePicker, Spin, Divider
} from 'antd';
import {
  UserOutlined, EditOutlined, SaveOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import locale from 'antd/es/date-picker/locale/th_TH';
import 'dayjs/locale/th';
import { useAuth } from '../../../hooks/useAuth';

const { Title } = Typography;

interface Customer {
  ID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  Phone: string;
  Birthday: string;
  Password?: string;
}

const CusProfilePage: React.FC = () => {
  const [customerData, setCustomerData] = useState<Customer | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { user, token, logout } = useAuth();

  useEffect(() => {
    const fetchCustomerData = async () => {
      if (!user?.ID || !token) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:8080/admin/customers/${user.ID}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch customer data');
        }

        const data = await response.json();
        // --- แก้ไขจุดที่ 1: จัดการ key ทั้ง Birthday และ birthday ---
        const mappedData: Customer = {
          ID: data.ID,
          FirstName: data.FirstName,
          LastName: data.LastName,
          Email: data.Email,
          Phone: data.Phone,
          Birthday: data.Birthday || data.birthday, // ใช้ค่าตัวใดตัวหนึ่งที่มีอยู่
        };
        setCustomerData(mappedData);
        form.setFieldsValue({
            firstName: mappedData.FirstName,
            lastName: mappedData.LastName,
            email: mappedData.Email,
            phone: mappedData.Phone,
            birthday: mappedData.Birthday ? dayjs(mappedData.Birthday) : null,
        });
      } catch (error) {
        console.error("Error fetching customer data:", error);
        message.error('ไม่สามารถดึงข้อมูลลูกค้าได้');
        logout();
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerData();
  }, [user, token, form, logout]);

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    if (customerData) {
        form.setFieldsValue({
            firstName: customerData.FirstName,
            lastName: customerData.LastName,
            email: customerData.Email,
            phone: customerData.Phone,
            birthday: customerData.Birthday ? dayjs(customerData.Birthday) : null,
        });
    }
  };

  const onFinish = async (values: any) => {
    if (!customerData || !token) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8080/admin/customers/${customerData.ID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: values.firstName,
          last_name: values.lastName,
          email: values.email,
          phone: values.phone,
          birthday: values.birthday.format('YYYY-MM-DD')
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update customer data');
      }

      const updatedData = await response.json();

      // --- แก้ไขจุดที่ 2: จัดการ key ทั้ง Birthday และ birthday หลังการอัปเดต ---
      const mappedUpdatedData: Customer = {
        ID: updatedData.ID,
        FirstName: updatedData.FirstName,
        LastName: updatedData.LastName,
        Email: updatedData.Email,
        Phone: updatedData.Phone,
        Birthday: updatedData.Birthday || updatedData.birthday, // ใช้ค่าตัวใดตัวหนึ่งที่มีอยู่
      };
      
      setCustomerData(mappedUpdatedData);
      setIsEditMode(false);
      message.success('บันทึกข้อมูลสำเร็จ!');
    } catch (error) {
      console.error("Error updating customer data:", error);
      message.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <Row justify="center">
        <Col xs={24} sm={20} md={18} lg={16} xl={12}>
          <Card
            bordered={false}
            style={{ borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }}
          >
            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                    <Title level={4} style={{ marginTop: '20px' }}>กำลังโหลดข้อมูล...</Title>
                </div>
            ) : (
              <Row gutter={[16, 16]} justify="center">
                <Col style={{ textAlign: 'center' }}>
                  <Avatar size={128} icon={<UserOutlined />} style={{ backgroundColor: '#f1d430ff', color: 'black' }} />
                  <Title level={3} style={{ marginTop: '16px' }}>{customerData?.FirstName} {customerData?.LastName}</Title>
                </Col>
                <Col xs={24}>
                  <Divider orientation="left" style={{ borderTopColor: '#f1d430ff' }}>
                    <Title level={5}>ข้อมูลส่วนตัว</Title>
                  </Divider>
                  {isEditMode ? (
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={onFinish}
                    >
                      <Form.Item name="firstName" label="ชื่อ" rules={[{ required: true, message: 'กรุณากรอกชื่อ' }]}>
                        <Input />
                      </Form.Item>
                      <Form.Item name="lastName" label="นามสกุล" rules={[{ required: true, message: 'กรุณากรอกนามสกุล' }]}>
                        <Input />
                      </Form.Item>
                      <Form.Item name="email" label="อีเมล" rules={[{ required: true, message: 'กรุณากรอกอีเมล' }]}>
                        <Input />
                      </Form.Item>
                      <Form.Item name="phone" label="เบอร์โทรศัพท์">
                        <Input />
                      </Form.Item>
                      <Form.Item name="birthday" label="วันเกิด">
                        <DatePicker locale={locale} format="DD MMMM BBBB" style={{ width: '100%' }} />
                      </Form.Item>
                    </Form>
                  ) : (
                    <Descriptions bordered column={1} size="middle" labelStyle={{ fontWeight: 'bold' }}>
                      <Descriptions.Item label="ชื่อ-นามสกุล">{customerData?.FirstName} {customerData?.LastName}</Descriptions.Item>
                      <Descriptions.Item label="อีเมล">{customerData?.Email}</Descriptions.Item>
                      <Descriptions.Item label="เบอร์โทรศัพท์">{customerData?.Phone}</Descriptions.Item>
                      <Descriptions.Item label="วันเกิด">
                        {customerData?.Birthday ? dayjs(customerData.Birthday).locale('th').format('DD MMMM BBBB') : 'N/A'}
                      </Descriptions.Item>
                    </Descriptions>
                  )}
                </Col>
              </Row>
            )}
            <Row justify="end" style={{ marginTop: '32px' }} gutter={16}>
              {isEditMode ? (
                <>
                  <Col><Button icon={<CloseCircleOutlined />} onClick={handleCancel} danger>ยกเลิก</Button></Col>
                  <Col><Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()} style={{ background: '#f1d430ff', color: 'black', border: 'none' }}>บันทึกข้อมูล</Button></Col>
                </>
              ) : (
                <>
                  <Col><Button type="primary" icon={<EditOutlined />} onClick={handleEdit} style={{ background: '#f1d430ff', color: 'black', border: 'none' }}>แก้ไขข้อมูล</Button></Col>
                </>
              )}
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CusProfilePage;