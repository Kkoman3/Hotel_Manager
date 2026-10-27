import React, { useState } from 'react';
import { X, LogIn, Clock, Moon, Calendar, Users, DollarSign, Info } from 'lucide-react';
import { Room } from '../../types/room';
import { BookingType } from '../../types/pricing';
import { useHotel } from '../../context/HotelContext';

interface CheckInModalProps {
  room: Room;
  onClose: () => void;
}

export const CheckInModal: React.FC<CheckInModalProps> = ({ room, onClose }) => {
  const { roomTypes, pricingPlans, checkIn } = useHotel();
  const roomType = roomTypes.find((rt) => rt.id === room.roomTypeId);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [bookingType, setBookingType] = useState<BookingType>('HOURLY');
  const [pricingPlanId, setPricingPlanId] = useState<string>(
    room.customPricingPlanId || roomType?.defaultPricingPlanId || pricingPlans[0]?.id || ''
  );
  const [adultCount, setAdultCount] = useState<number>(roomType?.baseAdults || 2);
  const [childCount, setChildCount] = useState<number>(0);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const selectedPlan = pricingPlans.find((p) => p.id === pricingPlanId) || pricingPlans[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Vui lòng nhập tên khách hàng');
      return;
    }

    checkIn({
      roomId: room.id,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || undefined,
      idCardNumber: idCardNumber.trim() || undefined,
      bookingType,
      adultCount,
      childCount,
      depositAmount,
      pricingPlanId,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🛎️</span>
            <div>
              <h3>Nhận Phòng: {room.roomNumber}</h3>
              <p style={{ fontSize: 12, color: 'var(--gold-400)', margin: 0 }}>
                {roomType?.name}
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body">
            {/* Booking Type Selector */}
            <div className="form-group">
              <label className="form-label">Hình thức thuê:</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div
                  style={{
                    border: `2px solid ${bookingType === 'HOURLY' ? 'var(--gold-400)' : 'var(--border-color)'}`,
                    background: bookingType === 'HOURLY' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setBookingType('HOURLY')}
                >
                  <Clock size={20} style={{ color: bookingType === 'HOURLY' ? 'var(--gold-400)' : 'var(--text-dim)', marginBottom: 4 }} />
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#fff' }}>Theo Giờ</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {selectedPlan?.hourlyRate.firstBlockHours}h đầu: {selectedPlan?.hourlyRate.firstBlockPrice.toLocaleString('vi-VN')} đ
                  </div>
                </div>

                <div
                  style={{
                    border: `2px solid ${bookingType === 'OVERNIGHT' ? 'var(--gold-400)' : 'var(--border-color)'}`,
                    background: bookingType === 'OVERNIGHT' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setBookingType('OVERNIGHT')}
                >
                  <Moon size={20} style={{ color: bookingType === 'OVERNIGHT' ? 'var(--gold-400)' : 'var(--text-dim)', marginBottom: 4 }} />
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#fff' }}>Qua Đêm</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {selectedPlan?.overnightRate.checkInFrom} - {selectedPlan?.overnightRate.checkOutUntil} ({selectedPlan?.overnightRate.flatPrice.toLocaleString('vi-VN')} đ)
                  </div>
                </div>

                <div
                  style={{
                    border: `2px solid ${bookingType === 'DAILY' ? 'var(--gold-400)' : 'var(--border-color)'}`,
                    background: bookingType === 'DAILY' ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 10,
                    padding: '12px 14px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => setBookingType('DAILY')}
                >
                  <Calendar size={20} style={{ color: bookingType === 'DAILY' ? 'var(--gold-400)' : 'var(--text-dim)', marginBottom: 4 }} />
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: '#fff' }}>Theo Ngày (24h)</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {selectedPlan?.dailyRate.pricePerDay.toLocaleString('vi-VN')} đ / ngày
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Plan Selector */}
            <div className="form-group">
              <label className="form-label">Áp dụng Bảng giá:</label>
              <select
                className="form-select"
                value={pricingPlanId}
                onChange={(e) => setPricingPlanId(e.target.value)}
              >
                {pricingPlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Details */}
            <div className="form-grid-2">
              <div className="form-group">
                <label className="form-label">Tên khách hàng (*):</label>
                <input
                  type="text"
                  required
                  autoFocus
                  className="form-input"
                  placeholder="Ví dụ: Nguyễn Văn Nam"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số điện thoại liên hệ:</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="09xx xxx xxx"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Số CCCD / Hộ chiếu:</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Số căn cước"
                  value={idCardNumber}
                  onChange={(e) => setIdCardNumber(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số lượng khách:</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    title="Người lớn"
                    value={adultCount}
                    onChange={(e) => setAdultCount(Number(e.target.value))}
                  />
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    title="Trẻ em"
                    value={childCount}
                    onChange={(e) => setChildCount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tiền cọc trước (nếu có):</label>
                <input
                  type="number"
                  step="10000"
                  className="form-input"
                  placeholder="0 đ"
                  value={depositAmount || ''}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ghi chú đặc biệt:</label>
              <input
                type="text"
                className="form-input"
                placeholder="Yêu cầu thêm gối, dọn phòng lúc mấy giờ..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy Bỏ
            </button>
            <button type="submit" className="btn btn-primary">
              <LogIn size={16} />
              <span>Xác Nhận Nhận Phòng</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
