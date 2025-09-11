import React from 'react';
import {  Typography } from 'antd';

import { useState, useMemo } from 'react';
import { carList } from '../../../data/carList';
import CarGrid from '../../../components/CarGrid';
import { carRentList } from '../../../data/carRentList';
// FIX: Import 'FilterValues' type from the Filter component
import Filter, { type FilterValues } from '../../../components/BuyRentFillter';
// FIX: Import 'SortOption' type from the Sorter component
import Sorter, { type SortOption } from '../../../components/Sorter';
// FIX: Removed unused 'Button' and 'Link' imports

const conditionOrder = ['ดี', 'ปานกลาง', 'แย่'];

const { Title } = Typography;

const RentCarPage: React.FC = () => {
  const filteredCarsSell = carList.filter((car) =>
    carRentList.some((sellCar) => sellCar.id === car.id)
  );

  const [filters, setFilters] = useState<FilterValues | null>(null);
  const [sortOption, setSortOption] = useState<SortOption | undefined>(
    undefined
  );
  const filteredCars = useMemo(() => {
    let result = filteredCarsSell;

    if (filters) {
      result = result.filter((c) => {
        if (filters.brand && c.brand !== filters.brand) return false;
        if (filters.model && c.model !== filters.model) return false;
        if (filters.priceRange) {
          const p = c.price ?? 0;
          if (p < filters.priceRange[0] || p > filters.priceRange[1]) return false;
        }
        if (filters.yearRange) {
          const y = c.yearManufactured ?? 0;
          if (y < filters.yearRange[0] || y > filters.yearRange[1]) return false;
        }
        if (filters.mileageMax !== null && filters.mileageMax !== undefined) {
          if ((c.mileage ?? 0) > (filters.mileageMax ?? Number.MAX_SAFE_INTEGER)) return false;
        }
        if (filters.isAvailable && !c.status?.includes('available')) return false;
        if (filters.conditions && filters.conditions.length > 0) {
          if (!filters.conditions.includes(c.condition ?? '')) return false;
        }
        if (filters.status && filters.status.length > 0) {
          // สมมติว่า c.status เก็บเป็น string เช่น 'selling' | 'renting' | 'pending'
          const carStatus = Array.isArray(c.status) ? c.status[0] : undefined; // ✅ ดึงค่า index ที่ 1
          if (!filters.status.includes(carStatus ?? '')) return false;
        }
        if (filters.usageRange) {
          const currentYear = new Date().getFullYear();
          const usageAge = currentYear - (c.yearUsed ?? currentYear);
          if (usageAge < filters.usageRange[0] || usageAge > filters.usageRange[1]) return false;
        }
        return true;
      });
    }

    if (sortOption) {
      result = [...result].sort((a, b) => {
        switch (sortOption) {
          case 'priceAsc':
            return (a.price ?? 0) - (b.price ?? 0);
          case 'priceDesc':
            return (b.price ?? 0) - (a.price ?? 0);
          case 'mileageAsc':
            return (a.mileage ?? 0) - (b.mileage ?? 0);
          case 'mileageDesc':
            return (b.mileage ?? 0) - (a.mileage ?? 0);
          case 'condition':
            return (
              conditionOrder.indexOf(a.condition ?? 'แย่') -
              conditionOrder.indexOf(b.condition ?? 'แย่')
            );
          case 'yearUsedAsc':
            return (a.yearUsed ?? 0) - (b.yearUsed ?? 0);
          case 'yearUsedDesc':
            return (b.yearUsed ?? 0) - (a.yearUsed ?? 0);
          default:
            return 0;
        }
      });
    }

    return result;
    // FIX: Added missing dependency 'filteredCarsSell'
  }, [filters, sortOption, filteredCarsSell]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#000", padding: "10px" }}>
    {/* หัวข้อ */}
    <Title
      level={2}
      style={{
      color: "#fff",
      margin: "0 0 20px 0",
      display: "inline-block",
      borderBottom: "3px solid gold", // เส้นขีดใต้ตัวหนังสือ
      paddingBottom: "6px",
      }}
    >
      เลือกรถยนต์ที่คุต้องการเช่า
    </Title>
    {/* Container หลักแบบ Flex */}
    <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
      
{/* ฝั่งซ้าย: ฟิลเตอร์ */}
      <div style={{ width: "300px", flexShrink: 0, paddingTop: "2px" }}>
        <Filter
          carList={carList}
          width={300}
          enabledFilters={['brand', 'model', 'price', 'year']} // เลือกได้ว่าจะให้มี filter อะไรบ้าง
          onApply={(v) => setFilters(v)}
          onClear={() => setFilters(null)}
        />
      </div>

      {/* ฝั่งขวา: Car Grid */}
      <div
        style={{
          flex: 1,
          paddingTop: "20px",
        }}
      >
        <CarGrid cars={filteredCars} detailBasePath="/rentcar-details" />
      </div>
      </div>
    </div>
  );
};

export default RentCarPage;