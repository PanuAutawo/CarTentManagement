import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const BuyInsurancePage: React.FC = () => {
 

  return (
    <div style={{ padding: '24px', background: '#828385ff', minHeight: '100vh',marginTop:'40px' }}>

        <Title level={2} style={{ color: '#FFD700'}}>ข้อมูลของฉัน</Title>
        <p>เอาไว้แสดงรายละเอียดพนักงาน & การลางาน ฯลฯ ที่เกี่ยวกับตัวผู้จัดการ</p>
        
     
    </div>
  );
};

export default BuyInsurancePage;