// import type {InsuranceCardProps, InsuranceDetails, Insurance} from '../interface/Insurance';
// import { SaleContracts } from './SalecontractData';

// export const Insurances: Insurance[] = [
//     {
//         id: "1",
//         planName: "ประกันภัยชั้น 1",
//         price: "10,000 บาท",
//         company: "บริษัท A",
//         repairType: "ซ่อมศูนย์",
//         saleContract_id: {
//             id: SaleContracts[0].id,
//             customer_id: SaleContracts[0].customer_id,
//             status: SaleContracts[0].status,
//             car_sale_id: SaleContracts[0].car_sale_id,
//             employee_id: SaleContracts[0].employee_id
//         }
//     },
//     {
//         id: "2",
//         planName: "ประกันภัยชั้น 1",
//         price: "10,000 บาท",
//         company: "บริษัท A",
//         repairType: "ซ่อมศูนย์",
//         saleContract_id: {
//             id: SaleContracts[0].id,
//             customer_id: SaleContracts[0].customer_id,
//             status: SaleContracts[0].status,
//             car_sale_id: SaleContracts[0].car_sale_id,
//             employee_id: SaleContracts[0].employee_id
//         }
//     }
// ];

// export const InsuranceCardProp: InsuranceCardProps[] = [
//   {
//     planName: "ประกันภัยชั้น 1",
//     price: "10,000 บาท",
//     features: [
//       "ความคุ้มครองอุบัติเหตุ",
//       "ความคุ้มครองไฟไหม้",
//       "ความคุ้มครองน้ำท่วม",
//     ],
//     repairType: "ซ่อมศูนย์",
//     onSelectPlan: () => {},
//   },
//   {
//     planName: "ประกันภัยชั้น 2+",
//     price: "8,000 บาท",
//     features: [
//       "ความคุ้มครองอุบัติเหตุ",
//       "ความคุ้มครองไฟไหม้",
//     ],
//     repairType: "ซ่อมอู่",
//     onSelectPlan: () => {},
//   },
// ];

// export const repairTypeItems = [
//   { value: '1', label: 'ซ่อมอู่' }, // เปลี่ยนเป็น "ซ่อมอู่"
//   { value: '2', label: 'ซ่อมศูนย์' },
// ];

// export const insuranceTypeItems = [
//   { value: '1', label: 'ประกันชั้น 1' },
//   { value: '2', label: 'ประกันชั้น 2+' },
//   { value: '2', label: 'ประกันชั้น 2' },
//   { value: '3', label: 'ประกันชั้น 3+' },
//   { value: '3', label: 'ประกันชั้น 3' },
// ];

// // ข้อมูลตัวอย่างสำหรับแสดงใน Modal
// export const insuranceDetail: InsuranceDetails[] = [
//     {planName: "รู้หมดประกันภัย",
//     description: "แผนประกันนี้ให้ความคุ้มครองที่ครอบคลุมสำหรับรถยนต์ของคุณ ไม่ว่าจะเป็นความเสียหายจากอุบัติเหตุ, การโจรกรรม, หรือภัยธรรมชาติ รวมถึงน้ำท่วมด้วย",
//     features: [
//         "ความคุ้มครองตัวรถยนต์จากอุบัติเหตุ",
//         "ความคุ้มครองบุคคลภายนอก (ทรัพย์สินและร่างกาย)",
//         "ความคุ้มครองน้ำท่วม, ไฟไหม้, และภัยธรรมชาติ",
//         "บริการช่วยเหลือฉุกเฉินตลอด 24 ชั่วโมง",
//         "ไม่ระบุชื่อผู้ขับขี่"]
//     }
// ];