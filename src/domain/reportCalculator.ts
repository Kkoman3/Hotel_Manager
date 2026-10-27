import { Invoice } from '../types/booking';
import { Expense, FinancialSummaryReport } from '../types/finance';
import { Room } from '../types/room';

export class ReportCalculator {
  /**
   * Tính toán Báo cáo Tài chính P&L cho Tháng, Quý, hoặc Năm
   */
  public static generatePnlReport(
    invoices: Invoice[],
    expenses: Expense[],
    rooms: Room[],
    periodType: 'MONTH' | 'QUARTER' | 'YEAR',
    year: number,
    subPeriod: number // Tháng 1-12 hoặc Quý 1-4
  ): FinancialSummaryReport {
    // Xác định thời gian bắt đầu và kết thúc của kỳ báo cáo
    let startDate: Date;
    let endDate: Date;
    let periodLabel = '';

    if (periodType === 'MONTH') {
      startDate = new Date(year, subPeriod - 1, 1, 0, 0, 0);
      endDate = new Date(year, subPeriod, 0, 23, 59, 59);
      periodLabel = `Tháng ${subPeriod}/${year}`;
    } else if (periodType === 'QUARTER') {
      const startMonth = (subPeriod - 1) * 3;
      startDate = new Date(year, startMonth, 1, 0, 0, 0);
      endDate = new Date(year, startMonth + 3, 0, 23, 59, 59);
      periodLabel = `Quý ${subPeriod}/${year}`;
    } else {
      startDate = new Date(year, 0, 1, 0, 0, 0);
      endDate = new Date(year, 11, 31, 23, 59, 59);
      periodLabel = `Năm ${year}`;
    }

    // Lọc hóa đơn trong kỳ
    const filteredInvoices = invoices.filter((inv) => {
      const invDate = new Date(inv.createdAt);
      return invDate >= startDate && invDate <= endDate;
    });

    // Lọc chi phí trong kỳ
    const filteredExpenses = expenses.filter((exp) => {
      const expDate = new Date(`${exp.date}T${exp.time || '00:00'}`);
      return expDate >= startDate && expDate <= endDate;
    });

    // Doanh thu
    let roomRevenue = 0;
    let serviceRevenue = 0;
    let surcharges = 0;
    let discounts = 0;

    for (const inv of filteredInvoices) {
      roomRevenue += inv.roomAmount || 0;
      serviceRevenue += inv.serviceAmount || 0;
      surcharges += inv.surchargeAmount || 0;
      discounts += inv.discountAmount || 0;
    }

    const grossRevenue = roomRevenue + serviceRevenue + surcharges;
    const netRevenue = grossRevenue - discounts;

    // Chi phí vốn (COGS)
    let cogs = 0;
    const operatingExpenses = {
      electricity: 0,
      water: 0,
      rent: 0,
      salary: 0,
      maintenance: 0,
      internet: 0,
      amenities: 0,
      other: 0,
      totalOpex: 0,
    };

    for (const exp of filteredExpenses) {
      if (!exp.isOperatingExpense || exp.category === 'MINIBAR_STOCK' || exp.category === 'LAUNDRY_EXTERNAL') {
        cogs += exp.amount;
      } else {
        switch (exp.category) {
          case 'ELECTRICITY':
            operatingExpenses.electricity += exp.amount;
            break;
          case 'WATER':
            operatingExpenses.water += exp.amount;
            break;
          case 'RENT':
            operatingExpenses.rent += exp.amount;
            break;
          case 'SALARY':
            operatingExpenses.salary += exp.amount;
            break;
          case 'MAINTENANCE':
            operatingExpenses.maintenance += exp.amount;
            break;
          case 'INTERNET':
            operatingExpenses.internet += exp.amount;
            break;
          case 'AMENITIES':
            operatingExpenses.amenities += exp.amount;
            break;
          default:
            operatingExpenses.other += exp.amount;
            break;
        }
      }
    }

    operatingExpenses.totalOpex =
      operatingExpenses.electricity +
      operatingExpenses.water +
      operatingExpenses.rent +
      operatingExpenses.salary +
      operatingExpenses.maintenance +
      operatingExpenses.internet +
      operatingExpenses.amenities +
      operatingExpenses.other;

    const grossProfit = netRevenue - cogs;
    const operatingProfit = grossProfit - operatingExpenses.totalOpex;
    const netProfit = operatingProfit; // Chưa trừ thuế TNDN

    // KPIs:
    const totalBookings = filteredInvoices.length;
    const daysInPeriod = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    const totalAvailableRoomNights = Math.max(1, rooms.length * daysInPeriod);

    // Tỷ lệ lấp đầy ước tính dựa trên lượt phòng bán
    const occupancyRatePercentage = Math.min(
      100,
      Math.round((totalBookings / totalAvailableRoomNights) * 100 * 1.5) // weighted estimate
    );

    const averageDailyRate = totalBookings > 0 ? Math.round(roomRevenue / totalBookings) : 0;
    const revPAR = Math.round(roomRevenue / totalAvailableRoomNights);

    return {
      periodType,
      periodLabel,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      roomRevenue,
      serviceRevenue,
      surcharges,
      discounts,
      grossRevenue,
      netRevenue,
      cogs,
      grossProfit,
      operatingExpenses,
      operatingProfit,
      netProfit,
      totalBookings,
      occupancyRatePercentage,
      averageDailyRate,
      revPAR,
    };
  }
}
