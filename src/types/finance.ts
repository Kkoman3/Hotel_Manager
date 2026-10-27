export interface Expense {
  id: string;
  category: 'ELECTRICITY' | 'WATER' | 'INTERNET' | 'SALARY' | 'RENT' | 'MINIBAR_STOCK' | 'LAUNDRY_EXTERNAL' | 'MAINTENANCE' | 'AMENITIES' | 'OTHER';
  categoryLabel: string;
  amount: number;
  date: string;          // YYYY-MM-DD
  time: string;          // HH:mm
  description: string;
  shiftId?: string;      // if cash drawn from cashier drawer
  createdByUserId: string;
  isOperatingExpense: boolean; // OPEX vs COGS
}

export interface Shift {
  id: string;
  shiftCode: string;
  cashierUserId: string;
  cashierName: string;
  startTime: string;
  endTime?: string;
  initialCash: number;            // Vốn đầu ca trong két
  totalCashCollected: number;     // Tiền mặt thu được trong ca
  totalTransferCollected: number; // Tiền chuyển khoản thu được
  totalCashSpent: number;         // Tiền chi tiêu rút từ két
  theoreticalCash: number;        // Số dư lý thuyết = initial + cashCollected - cashSpent
  actualCashCounted?: number;     // Tiền mặt đếm thực tế khi giao ca
  discrepancy?: number;           // Chênh lệch (thừa/thiếu)
  handoverNotes?: string;
  status: 'OPEN' | 'CLOSED';
}

export interface FinancialSummaryReport {
  periodType: 'MONTH' | 'QUARTER' | 'YEAR';
  periodLabel: string;
  startDate: string;
  endDate: string;
  
  // Doanh thu
  roomRevenue: number;
  serviceRevenue: number;
  surcharges: number;
  discounts: number;
  grossRevenue: number;
  netRevenue: number;

  // Chi phí
  cogs: number;                   // Giá vốn hàng bán (minibar, giặt là)
  grossProfit: number;            // Lợi nhuận gộp

  operatingExpenses: {            // OPEX
    electricity: number;
    water: number;
    rent: number;
    salary: number;
    maintenance: number;
    internet: number;
    amenities: number;
    other: number;
    totalOpex: number;
  };

  operatingProfit: number;        // Lợi nhuận thuần
  netProfit: number;              // Lợi nhuận ròng

  // Chỉ số KPIs
  totalBookings: number;
  occupancyRatePercentage: number;
  averageDailyRate: number;       // ADR
  revPAR: number;                 // RevPAR
}
