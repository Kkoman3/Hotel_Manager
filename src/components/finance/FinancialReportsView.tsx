import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  Download, 
  Plus, 
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { ReportCalculator } from '../../domain/reportCalculator';
import { Expense } from '../../types/finance';

export const FinancialReportsView: React.FC = () => {
  const { invoices, expenses, rooms, addExpense, currentShift } = useHotel();

  const [periodType, setPeriodType] = useState<'MONTH' | 'QUARTER' | 'YEAR'>('MONTH');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedSubPeriod, setSelectedSubPeriod] = useState<number>(10); // Tháng 10

  // Quick expense form modal
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseCategory, setExpenseCategory] = useState<Expense['category']>('ELECTRICITY');
  const [expenseAmount, setExpenseAmount] = useState<number>(0);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [isCashFromDrawer, setIsCashFromDrawer] = useState(false);

  const report = ReportCalculator.generatePnlReport(
    invoices,
    expenses,
    rooms,
    periodType,
    selectedYear,
    selectedSubPeriod
  );

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseAmount <= 0) return;

    const categoryLabels: Record<Expense['category'], string> = {
      ELECTRICITY: 'Tiền điện EVN',
      WATER: 'Tiền nước sinh hoạt',
      INTERNET: 'Tiền viễn thông / truyền hình',
      SALARY: 'Tiền lương nhân sự',
      RENT: 'Tiền thuê mặt bằng',
      MINIBAR_STOCK: 'Nhập hàng hóa minibar',
      LAUNDRY_EXTERNAL: 'Giặt ủi đồ vải ngoài',
      MAINTENANCE: 'Sửa chữa bảo trì tài sản',
      AMENITIES: 'Vật tư tiêu hao (bàn chải, xà phòng)',
      OTHER: 'Chi phí khác',
    };

    addExpense({
      category: expenseCategory,
      categoryLabel: categoryLabels[expenseCategory],
      amount: expenseAmount,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      description: expenseDesc || categoryLabels[expenseCategory],
      shiftId: isCashFromDrawer && currentShift ? currentShift.id : undefined,
      isOperatingExpense: expenseCategory !== 'MINIBAR_STOCK' && expenseCategory !== 'LAUNDRY_EXTERNAL',
    });

    setExpenseAmount(0);
    setExpenseDesc('');
    setShowExpenseModal(false);
  };

  const handleExportPrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Báo Cáo Tài Chính & Hiệu Quả Kinh Doanh</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Theo dõi Doanh thu thuần, Giá vốn (COGS), Chi phí vận hành (OPEX), Lợi nhuận (P&L) và chỉ số RevPAR
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={() => setShowExpenseModal(true)}>
            <Plus size={15} /> Ghi Nhận Chi Phí
          </button>
          <button className="btn btn-primary" onClick={handleExportPrint}>
            <Download size={15} /> Xuất Báo Cáo
          </button>
        </div>
      </div>

      {/* Period Selector Tabs */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg-card)', padding: '12px 18px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            className={`btn btn-sm ${periodType === 'MONTH' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setPeriodType('MONTH'); setSelectedSubPeriod(10); }}
          >
            Theo Tháng
          </button>
          <button
            className={`btn btn-sm ${periodType === 'QUARTER' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setPeriodType('QUARTER'); setSelectedSubPeriod(4); }}
          >
            Theo Quý
          </button>
          <button
            className={`btn btn-sm ${periodType === 'YEAR' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setPeriodType('YEAR'); setSelectedSubPeriod(1); }}
          >
            Cả Năm
          </button>
        </div>

        <div style={{ height: 20, width: 1, background: 'var(--border-color)' }} />

        {/* Sub-period dropdown */}
        {periodType === 'MONTH' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Chọn tháng:</span>
            <select
              className="form-select"
              style={{ width: 130, height: 34, padding: '4px 10px' }}
              value={selectedSubPeriod}
              onChange={(e) => setSelectedSubPeriod(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>Tháng {m}</option>
              ))}
            </select>
          </div>
        )}

        {periodType === 'QUARTER' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Chọn quý:</span>
            <select
              className="form-select"
              style={{ width: 120, height: 34, padding: '4px 10px' }}
              value={selectedSubPeriod}
              onChange={(e) => setSelectedSubPeriod(Number(e.target.value))}
            >
              <option value={1}>Quý 1</option>
              <option value={2}>Quý 2</option>
              <option value={3}>Quý 3</option>
              <option value={4}>Quý 4</option>
            </select>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Năm:</span>
          <select
            className="form-select"
            style={{ width: 100, height: 34, padding: '4px 10px' }}
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', color: 'var(--gold-400)', fontWeight: 700, fontSize: 14 }}>
          Kỳ báo cáo: {report.periodLabel}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-stat-grid">
        <div className="kpi-stat-card">
          <span className="kpi-title">DOANH THU THUẦN (NET REVENUE)</span>
          <span className="kpi-value" style={{ color: 'var(--gold-400)' }}>
            {report.netRevenue.toLocaleString('vi-VN')} đ
          </span>
          <span className="kpi-sub">{report.totalBookings} lượt hóa đơn trong kỳ</span>
        </div>

        <div className="kpi-stat-card">
          <span className="kpi-title">LỢI NHUẬN GỘP (GROSS PROFIT)</span>
          <span className="kpi-value" style={{ color: '#38bdf8' }}>
            {report.grossProfit.toLocaleString('vi-VN')} đ
          </span>
          <span className="kpi-sub">Đã trừ {report.cogs.toLocaleString('vi-VN')} đ giá vốn</span>
        </div>

        <div className="kpi-stat-card">
          <span className="kpi-title">LỢI NHUẬN RÒNG (NET PROFIT)</span>
          <span className="kpi-value" style={{ color: report.netProfit >= 0 ? '#34d399' : '#fb7185' }}>
            {report.netProfit.toLocaleString('vi-VN')} đ
          </span>
          <span className="kpi-sub">Chi phí vận hành: {report.operatingExpenses.totalOpex.toLocaleString('vi-VN')} đ</span>
        </div>

        <div className="kpi-stat-card">
          <span className="kpi-title">TỶ LỆ LẤP ĐẦY PHÒNG (OCCUPANCY)</span>
          <span className="kpi-value" style={{ color: '#c084fc' }}>
            {report.occupancyRatePercentage}%
          </span>
          <span className="kpi-sub">RevPAR: {report.revPAR.toLocaleString('vi-VN')} đ/phòng</span>
        </div>
      </div>

      {/* P&L Statement Table */}
      <div className="table-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th style={{ width: '60%' }}>KHOẢN MỤC TÀI CHÍNH (P&L STATEMENT)</th>
              <th style={{ textAlign: 'right' }}>SỐ TIỀN (VNĐ)</th>
              <th style={{ textAlign: 'right', width: '20%' }}>TỶ TRỌNG (%)</th>
            </tr>
          </thead>
          <tbody>
            {/* Doanh thu */}
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', fontWeight: 700 }}>
              <td colSpan={3} style={{ color: 'var(--gold-400)' }}>A. TỔNG HỢP DOANH THU</td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 30 }}>1. Doanh thu tiền phòng (Room Revenue)</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{report.roomRevenue.toLocaleString('vi-VN')} đ</td>
              <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                {report.netRevenue > 0 ? ((report.roomRevenue / report.netRevenue) * 100).toFixed(1) : 0}%
              </td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 30 }}>2. Doanh thu Minibar & Dịch vụ (F&B / Laundry)</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{report.serviceRevenue.toLocaleString('vi-VN')} đ</td>
              <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                {report.netRevenue > 0 ? ((report.serviceRevenue / report.netRevenue) * 100).toFixed(1) : 0}%
              </td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 30 }}>3. Phụ thu thêm khách & Phát sinh</td>
              <td style={{ textAlign: 'right', fontWeight: 600 }}>{report.surcharges.toLocaleString('vi-VN')} đ</td>
              <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                {report.netRevenue > 0 ? ((report.surcharges / report.netRevenue) * 100).toFixed(1) : 0}%
              </td>
            </tr>
            {report.discounts > 0 && (
              <tr>
                <td style={{ paddingLeft: 30, color: '#fb7185' }}>(-) Giảm giá & Voucher khuyến mãi</td>
                <td style={{ textAlign: 'right', color: '#fb7185', fontWeight: 600 }}>-{report.discounts.toLocaleString('vi-VN')} đ</td>
                <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>-</td>
              </tr>
            )}
            <tr style={{ fontWeight: 800, background: 'rgba(245, 158, 11, 0.06)' }}>
              <td>= DOANH THU THUẦN (NET REVENUE)</td>
              <td style={{ textAlign: 'right', color: 'var(--gold-400)' }}>{report.netRevenue.toLocaleString('vi-VN')} đ</td>
              <td style={{ textAlign: 'right' }}>100%</td>
            </tr>

            {/* Giá vốn */}
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', fontWeight: 700 }}>
              <td colSpan={3} style={{ color: '#38bdf8' }}>B. GIÁ VỐN HÀNG BÁN (COGS)</td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 30 }}>Tiền hàng Minibar đã tiêu thụ & Thuê giặt là ngoài</td>
              <td style={{ textAlign: 'right', fontWeight: 600, color: '#fb7185' }}>-{report.cogs.toLocaleString('vi-VN')} đ</td>
              <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                {report.netRevenue > 0 ? ((report.cogs / report.netRevenue) * 100).toFixed(1) : 0}%
              </td>
            </tr>
            <tr style={{ fontWeight: 800, background: 'rgba(56, 189, 248, 0.06)' }}>
              <td>= LỢI NHUẬN GỘP (GROSS PROFIT) = [A - B]</td>
              <td style={{ textAlign: 'right', color: '#38bdf8' }}>{report.grossProfit.toLocaleString('vi-VN')} đ</td>
              <td style={{ textAlign: 'right' }}>
                {report.netRevenue > 0 ? ((report.grossProfit / report.netRevenue) * 100).toFixed(1) : 0}%
              </td>
            </tr>

            {/* Chi phí vận hành */}
            <tr style={{ background: 'rgba(255, 255, 255, 0.03)', fontWeight: 700 }}>
              <td colSpan={3} style={{ color: '#fb7185' }}>C. CHI PHÍ VẬN HÀNH (OPERATING EXPENSES - OPEX)</td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 30 }}>1. Tiền điện EVN</td>
              <td style={{ textAlign: 'right' }}>{report.operatingExpenses.electricity.toLocaleString('vi-VN')} đ</td>
              <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>-</td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 30 }}>2. Tiền nước sinh hoạt</td>
              <td style={{ textAlign: 'right' }}>{report.operatingExpenses.water.toLocaleString('vi-VN')} đ</td>
              <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>-</td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 30 }}>3. Tiền lương nhân viên & bảo vệ</td>
              <td style={{ textAlign: 'right' }}>{report.operatingExpenses.salary.toLocaleString('vi-VN')} đ</td>
              <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>-</td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 30 }}>4. Tiền thuê mặt bằng / Tòa nhà</td>
              <td style={{ textAlign: 'right' }}>{report.operatingExpenses.rent.toLocaleString('vi-VN')} đ</td>
              <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>-</td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 30 }}>5. Sửa chữa bảo trì trang thiết bị</td>
              <td style={{ textAlign: 'right' }}>{report.operatingExpenses.maintenance.toLocaleString('vi-VN')} đ</td>
              <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>-</td>
            </tr>
            <tr>
              <td style={{ paddingLeft: 30 }}>6. Chi tiêu vặt tại quầy & Khác</td>
              <td style={{ textAlign: 'right' }}>{report.operatingExpenses.other.toLocaleString('vi-VN')} đ</td>
              <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>-</td>
            </tr>
            <tr style={{ fontWeight: 800, background: 'rgba(244, 63, 94, 0.06)' }}>
              <td>= TỔNG CHI PHÍ VẬN HÀNH (TOTAL OPEX)</td>
              <td style={{ textAlign: 'right', color: '#fb7185' }}>-{report.operatingExpenses.totalOpex.toLocaleString('vi-VN')} đ</td>
              <td style={{ textAlign: 'right' }}>
                {report.netRevenue > 0 ? ((report.operatingExpenses.totalOpex / report.netRevenue) * 100).toFixed(1) : 0}%
              </td>
            </tr>

            {/* Lợi nhuận ròng */}
            <tr style={{ fontWeight: 900, fontSize: 16, background: 'rgba(16, 185, 129, 0.12)' }}>
              <td>LỢI NHUẬN RÒNG CUỐI CÙNG (NET PROFIT)</td>
              <td style={{ textAlign: 'right', color: report.netProfit >= 0 ? '#34d399' : '#fb7185' }}>
                {report.netProfit.toLocaleString('vi-VN')} đ
              </td>
              <td style={{ textAlign: 'right' }}>
                {report.netRevenue > 0 ? ((report.netProfit / report.netRevenue) * 100).toFixed(1) : 0}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="modal-overlay" onClick={() => setShowExpenseModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Ghi Nhận Khoản Chi Mới</h3>
              <button className="modal-close-btn" onClick={() => setShowExpenseModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreateExpense}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Loại chi phí:</label>
                  <select
                    className="form-select"
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as any)}
                  >
                    <option value="ELECTRICITY">Tiền điện EVN</option>
                    <option value="WATER">Tiền nước máy</option>
                    <option value="INTERNET">Tiền mạng Internet</option>
                    <option value="SALARY">Lương nhân viên</option>
                    <option value="RENT">Tiền thuê mặt bằng</option>
                    <option value="MINIBAR_STOCK">Nhập hàng Minibar</option>
                    <option value="LAUNDRY_EXTERNAL">Giặt là thuê ngoài</option>
                    <option value="MAINTENANCE">Sửa chữa phòng ốc</option>
                    <option value="OTHER">Chi tiêu lặt vặt</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Số tiền chi (đ) (*):</label>
                  <input
                    type="number"
                    required
                    step="10000"
                    min="1000"
                    className="form-input"
                    placeholder="Ví dụ: 500000"
                    value={expenseAmount || ''}
                    onChange={(e) => setExpenseAmount(Number(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Diễn giải nội dung chi:</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Lý do chi, số hóa đơn đỏ..."
                    value={expenseDesc}
                    onChange={(e) => setExpenseDesc(e.target.value)}
                  />
                </div>

                {currentShift && (
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', marginTop: 10 }}>
                    <input
                      type="checkbox"
                      checked={isCashFromDrawer}
                      onChange={(e) => setIsCashFromDrawer(e.target.checked)}
                    />
                    <span>Rút tiền mặt trực tiếp từ két ca trực hiện tại ({currentShift.shiftCode})</span>
                  </label>
                )}
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowExpenseModal(false)}>Hủy</button>
                <button type="submit" className="btn btn-primary">Lưu Khoản Chi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
