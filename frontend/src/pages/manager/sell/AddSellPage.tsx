import { useState, useMemo } from 'react';
import { carList } from '../../../data/carList';
import CarGrid from '../../../components/CarGrid';
import { carSellList } from '../../../data/carSellList';

import Filter, { type FilterValues } from '../../../components/Filter';
// FIX: Import 'SortOption' type from the Sorter component
import Sorter, { type SortOption } from '../../../components/Sorter';

const conditionOrder = ['ดี', 'ปานกลาง', 'แย่'];
const AddSellPage = () => {
  const filteredCarsNotSell = carList.filter(
    car => !carSellList.some(sellCar => sellCar.id === car.id)
  );

    const [filters, setFilters] = useState<FilterValues | null>(null);
    const [sortOption, setSortOption] = useState<SortOption | undefined>(
      undefined
    );
  
    const filteredCars = useMemo(() => {
      let result = filteredCarsNotSell;
  
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
      // FIX: Added missing dependency 'filteredCarsNotSell' to the array
    }, [filters, sortOption, filteredCarsNotSell]);

  return (
    <div style={{ display: 'Flex', width: '100%', marginTop: 5, padding: 10 }}>
      <div style={{ zIndex: 2 }}>
        <Filter
          carList={carList}
          width={300}
          onApply={(v) => setFilters(v)}
          onClear={() => setFilters(null)}
        />
      </div>
      <div style={{ marginLeft: 280, marginTop: 45 ,width:'100%'}}>
        <div style={{ height: 80, display: 'Flex', alignItems: 'center', position: 'fixed', width: '100%', backgroundColor: '#FFD700', zIndex: 10, padding: 20 }}>
          <h2 style={{color:'black'}}>เลือกรถยนต์ที่จะวางขาย</h2>
          <div style={{ marginRight: 300, marginLeft: 'auto' }}>
            <Sorter value={sortOption} onChange={setSortOption} />
          </div>
        </div>
        <div style={{ paddingTop: 80, paddingLeft: 30 }}>
          <CarGrid
            cars={filteredCars}
            sellBasePath="/add-sell"
          />
        </div>
      </div>
    </div>
  );
};

export default AddSellPage;