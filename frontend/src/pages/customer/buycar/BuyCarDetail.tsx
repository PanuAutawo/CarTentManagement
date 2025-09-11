import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Row, Col, Card, Typography, Image, Button, Divider, Space, Modal } from "antd";
import { ShoppingCartOutlined, PushpinOutlined } from "@ant-design/icons";

import { carList } from "../../../data/carList";
import { carSellList } from "../../../data/carSellList";

import mainCar from "../../../assets/burCar1/carMain.jpg";
import thumb1 from "../../../assets/burCar1/thumb1.jpg";
import thumb2 from "../../../assets/burCar1/thumb2.jpg";
import thumb3 from "../../../assets/burCar1/thumb3.jpg";
import thumb4 from "../../../assets/burCar1/thumb4.jpg";


const { Title, Paragraph } = Typography;

const BuyCarDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // ✅ เพิ่ม useEffect เพื่อ scroll กลับบนสุดทุกครั้งที่เข้าหน้านี้
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  // useEffect(() => {
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // }, []);
  
  const car = carList.find(c => c.id === Number(id));

  if (!car) {
    return <div>ไม่พบรถที่ต้องการ</div>;
  }

  const [buy, setbuy] = useState(false);
  const [book, setbook] = useState(false);

  return (
    <div style={{ backgroundColor: "#000", minHeight: "100vh", padding: "20px" }}>
      <Row gutter={16}>
      {/* ภาพใหญ่และภาพย่อย */}
      <Col xs={24} md={16}>
        <Card
          bordered={false}
          style={{
            backgroundColor: "#1a1a1a", // ดำอ่อน
            borderRadius: 12,
            border: "2px solid gold",
            transition: "box-shadow 0.3s ease-in-out",
          }}
          onMouseEnter={(e) =>
          (e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 215, 0, 0.4)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
        >
          {/* ภาพใหญ่ */}
          <Image
            src={mainCar}
            alt="car-main"
            style={{
              borderRadius: "12px",
              // border: "2px solid gold", // ขอบทองรอบรูปใหญ่
              marginBottom: "10px",
            }}
          />

          {/* ภาพย่อย 4 รูป */}
          <Row gutter={8}>
            {[thumb1, thumb2, thumb3, thumb4].map((thumb, i) => (
              <Col span={6} key={i}>
                <Image
                  src={thumb}
                  alt={`car-${i}`}
                  style={{
                    borderRadius: "8px",
                    // border: "1px solid gold", // ขอบทองรอบภาพย่อย
                  }}
                />
              </Col>
            ))}
          </Row>
        </Card>
      </Col>

        {/* ข้อมูลด้านขวา */}
        <Col xs={24} md={8}>
          <Card
            bordered={false}
            style={{
            backgroundColor: "#1a1a1a",
            color: "white",
            borderRadius: 12,
            border: "2px solid gold",
            transition: "box-shadow 0.3s ease-in-out",
            }}
            onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 215, 0, 0.4)")
            }
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
      
          >
            <Title level={3} style={{ color: "gold" }}>
              TOYOTA YARIS ATIV 1.2 E ปี 2020
            </Title>
            <Title level={2} style={{ color: "white", marginTop: "-10px" }}>
              ฿ 319,000
            </Title>

            <Divider style={{ borderColor: "rgba(255, 215, 0, 0.3)" }} />

            {/* รายละเอียดรถ */}
            <div style={{ color: "#fff", lineHeight: "1.8em" }}>
              <p>ยี่ห้อ: Toyota</p>
              <p>รุ่น: Yaris Ativ</p>
              <p>ปี: 2020</p>
              <p>เลขไมล์: 50,000 กม.</p>
              <p>เกียร์: ออโต้</p>
              <p>สี: ดำ</p>
            </div>

            <Divider style={{ borderColor: "rgba(255, 215, 0, 0.3)" }} />

            {/* รายละเอียดพนักงาน */}
            <div style={{ color: "#fff", lineHeight: "1.8em" }}>
              <Title level={4} style={{ color: "gold", marginTop: "-10px" }}>
                ติดต่อพนักงาน
              </Title>
              <p>ชื่อ: Lung Tuu</p>
              <p>เบอร์โทร: 09888866</p>
            </div>

            <Divider style={{ borderColor: "rgba(255, 215, 0, 0.3)" }} />

            {/* ปุ่มติดต่อ */}
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button 
                icon={<PushpinOutlined />} 
                block
                style={{
                  backgroundColor: "gold",
                  color: "black",
                  fontWeight: "bold",
                  border: "2px solid gold",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(255, 215, 0, 0.4)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "black";
                  e.currentTarget.style.color = "gold";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "gold";
                  e.currentTarget.style.color = "black";
                }}
                onClick={() => setbook(true)}
              >
                จอง
              </Button>

              <Modal
                open={book}
                afterOpenChange={(open) => setbook(open)}
                onCancel={() => setbook(false)}
                onOk={() => setbook(false)}
              >
                <Title level={3}>ยืนยันคำสั่งการจอง</Title>
              </Modal>

              <Button
                icon={<ShoppingCartOutlined />}
                block 
                style={{
                  backgroundColor: "gold",
                  color: "black",
                  fontWeight: "bold",
                  border: "2px solid gold",
                  borderRadius: "10px",
                  boxShadow: "0 2px 8px rgba(255, 215, 0, 0.4)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "black";
                  e.currentTarget.style.color = "gold";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "gold";
                  e.currentTarget.style.color = "black";
                }}
                onClick={() => setbuy(true)}
              >
                สั่งซื้อ
              </Button>

              <Modal
                open={buy}
                afterOpenChange={(open) => setbuy(open)}
                onCancel={() => setbuy(false)}
                onOk={() => setbuy(false)}
              >
                <Title level={3}>ยืนยันคำสั่งซื้อ</Title>
              </Modal>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* รายละเอียดเพิ่มเติม */}
      <Card
        style={{
          marginTop: "20px",
          backgroundColor: "#1a1a1a",
          color: "white",
          borderRadius: 12,
          border: "2px solid gold",
          transition: "box-shadow 0.3s ease-in-out",
        }}
      onMouseEnter={(e) =>
      (e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 215, 0, 0.4)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
      
      //bordered={false}
      >
        <Title level={4} style={{ color: "gold" }}>
          รายละเอียด
        </Title>
        <Paragraph style={{ color: "#ccc" }}>
          TOYOTA YARIS ATIV 1.2 E ปี 2020<br />
          - สภาพเหมือนป้ายแดง จัดไฟแนนซ์ได้<br />
          - เครื่องยนต์เกียร์ ช่วงล่างแน่น<br />
          - พร้อมรับประกันศูนย์ Toyota
        </Paragraph>
      </Card>
    </div>
  );
};

export default BuyCarDetailPage;
