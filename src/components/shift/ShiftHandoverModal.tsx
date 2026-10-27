import React, { useState } from 'react';
import { Wallet, ArrowRight, Printer, AlertTriangle, CheckCircle2, Lock, Plus } from 'lucide-react';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { EscposPrinterService } from '../../services/escposPrinter';

export const ShiftHandoverView: React.FC = () => {
  const { currentShift, shifts, closeCurrentShift, openNewShift } = useHotel();
  const { currentUser } = useAuth();

  const [actualCashInput, setActualCashInput] = useState<number>(0);
  const [handoverNotes, setHandoverNotes] = useState('');
  const [newShiftInitialCash, setNewShiftInitialCash] = useState<number>(1500000);

  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShift) return;

    const closed = closeCurrentShift(actualCashInput, handoverNotes);
    EscposPrinterService.printShiftHandover(closed);
  };

  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    openNewShift(newShiftInitialCash);
  };

  const theoreticalCash = currentShift ? currentShift.theoreticalCash : 0;
  const discrepancy = actualCashInput - theoreticalCash;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>Quản Lý Ca Trực & Bàn Giao Két Tiền (Shift Handover)</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Quy trình đối soát tiền mặt chống thất thoát giữa các ca lễ tân và thu ngân
        </p>
      </div>

      {currentShift ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
          {/* Active Shift Stats */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid var(--border-color)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>💵</span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Ca Hiện Tại: {currentShift.shiftCode}</h3>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Lễ tân: <strong style={{ color: '#fff' }}>{currentShift.cashierName}</strong> • Mở lúc: {new Date(currentShift.startTime).toLocaleTimeString('vi-VN')} {new Date(currentShift.startTime).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
              <span className="room-badge AVAILABLE">Đang Hoạt Động</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                <span style={{ color: 'var(--text-muted)' }}>1. Tiền mặt ban đầu trong két (vốn lưu động):</span>
                <span style={{ fontWeight: 700 }}>{currentShift.initialCash.toLocaleString('vi-VN')} đ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                <span style={{ color: '#34d399' }}>2. Tiền mặt thu được trong ca:</span>
                <span style={{ fontWeight: 700, color: '#34d399' }}>+{currentShift.totalCashCollected.toLocaleString('vi-VN')} đ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                <span style={{ color: '#38bdf8' }}>3. Tiền chuyển khoản VietQR:</span>
                <span style={{ fontWeight: 700, color: '#38bdf8' }}>+{currentShift.totalTransferCollected.toLocaleString('vi-VN')} đ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                <span style={{ color: '#fb7185' }}>4. Tiền mặt đã chi ra từ két:</span>
                <span style={{ fontWeight: 700, color: '#fb7185' }}>-{currentShift.totalCashSpent.toLocaleString('vi-VN')} đ</span>
              </div>

              <div style={{ borderTop: '2px solid rgba(255, 255, 255, 0.1)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>SỐ DƯ TIỀN MẶT LÝ THUYẾT:</span>
                <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--gold-400)' }}>
                  {theoreticalCash.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>
          </div>

          {/* Close Shift Form */}
          <form onSubmit={handleCloseShift} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Lock size={17} style={{ color: 'var(--gold-400)' }} />
              Kiểm Đếm & Bàn Giao Ca
            </h3>

            <div className="form-group">
              <label className="form-label">Số tiền mặt thực tế khi đếm két (đ) (*):</label>
              <input
                type="number"
                required
                step="1000"
                min="0"
                className="form-input"
                placeholder="Nhập số tiền thực đếm..."
                value={actualCashInput || ''}
                onChange={(e) => setActualCashInput(Number(e.target.value))}
              />
            </div>

            {/* Discrepancy Box */}
            {actualCashInput > 0 && (
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                  background: discrepancy === 0 ? 'rgba(16, 185, 129, 0.1)' : discrepancy < 0 ? 'rgba(244, 63, 94, 0.1)' : 'rgba(56, 189, 248, 0.1)',
                  border: `1px solid ${discrepancy === 0 ? '#10b981' : discrepancy < 0 ? '#f43f5e' : '#38bdf8'}`,
                }}
              >
                <div style={{ fontSize: 12.5, fontWeight: 700, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Trạng thái đối soát:</span>
                  <span style={{ color: discrepancy === 0 ? '#10b981' : discrepancy < 0 ? '#f43f5e' : '#38bdf8' }}>
                    {discrepancy === 0 ? 'Khớp 100%' : discrepancy < 0 ? `Thiếu ${Math.abs(discrepancy).toLocaleString('vi-VN')} đ` : `Thừa +${discrepancy.toLocaleString('vi-VN')} đ`}
                  </span>
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Ghi chú bàn giao ca:</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Bàn giao chìa khóa, nhắc việc ca sau..."
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}>
              <Printer size={16} /> Đóng Ca & In Biên Bản Giao Ca K80
            </button>
          </form>
        </div>
      ) : (
        /* Open New Shift Form */
        <div style={{ maxWidth: 500, margin: '20px auto', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 30, textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, color: '#fff' }}>Hiện Chưa Có Ca Trực Nào Mở</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            Vui lòng nhập số tiền mặt vốn đầu ca để bắt đầu phiên làm việc mới
          </p>

          <form onSubmit={handleOpenShift}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Vốn tiền mặt đầu ca (vốn trong két) (đ):</label>
              <input
                type="number"
                step="50000"
                min="0"
                required
                className="form-input"
                value={newShiftInitialCash}
                onChange={(e) => setNewShiftInitialCash(Number(e.target.value))}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Plus size={16} /> Bắt Đầu Ca Trực Mới
            </button>
          </form>
        </div>
      )}

      {/* Shift History Table */}
      <div style={{ marginTop: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Lịch Sử Các Ca Đã Đóng</h3>
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Mã Ca</th>
                <th>Lễ Tân</th>
                <th>Bắt Đầu</th>
                <th>Kết Thúc</th>
                <th style={{ textAlign: 'right' }}>Vốn Đầu Ca</th>
                <th style={{ textAlign: 'right' }}>Tiền Mặt Thu</th>
                <th style={{ textAlign: 'right' }}>Chuyển Khoản</th>
                <th style={{ textAlign: 'right' }}>Thực Đếm</th>
                <th style={{ textAlign: 'right' }}>Chênh Lệch</th>
                <th style={{ textAlign: 'center' }}>In Lại</th>
              </tr>
            </thead>
            <tbody>
              {shifts.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.shiftCode}</strong></td>
                  <td>{s.cashierName}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(s.startTime).toLocaleString('vi-VN')}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.endTime ? new Date(s.endTime).toLocaleString('vi-VN') : 'Đang mở'}</td>
                  <td style={{ textAlign: 'right' }}>{s.initialCash.toLocaleString('vi-VN')} đ</td>
                  <td style={{ textAlign: 'right', color: '#34d399' }}>+{s.totalCashCollected.toLocaleString('vi-VN')} đ</td>
                  <td style={{ textAlign: 'right', color: '#38bdf8' }}>+{s.totalTransferCollected.toLocaleString('vi-VN')} đ</td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{s.actualCashCounted ? `${s.actualCashCounted.toLocaleString('vi-VN')} đ` : '-'}</td>
                  <td style={{ textAlign: 'right', color: (s.discrepancy || 0) < 0 ? '#fb7185' : '#34d399', fontWeight: 700 }}>
                    {s.discrepancy !== undefined ? `${(s.discrepancy > 0 ? '+' : '')}${s.discrepancy.toLocaleString('vi-VN')} đ` : '-'}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => EscposPrinterService.printShiftHandover(s)}
                    >
                      <Printer size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
