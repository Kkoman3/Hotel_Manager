import React, { useState } from 'react';
import { X, Printer, CheckCircle, QrCode, CreditCard, Banknote, Tag, AlertCircle } from 'lucide-react';
import { Booking, PaymentMethod } from '../../types/booking';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { PricingEngine } from '../../domain/pricingEngine';
import { EscposPrinterService } from '../../services/escposPrinter';

interface CheckOutModalProps {
  bookingId: string;
  onClose: () => void;
}

export const CheckOutModal: React.FC<CheckOutModalProps> = ({ bookingId, onClose }) => {
  const { bookings, pricingPlans, checkOut } = useHotel();
  const { hasPermission } = useAuth();

  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) return null;

  const plan =
    pricingPlans.find((p) => p.id === booking.pricingPlanId) ||
    pricingPlans[0];

  const now = new Date();
  const priceResult = PricingEngine.calculateStayPrice(
    booking.checkInTime,
    now,
    booking.bookingType,
    plan,
    booking.adultCount,
    booking.childCount
  );

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('VIETQR_TRANSFER');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');

  const servicesTotal = booking.services.reduce((sum, s) => sum + s.totalPrice, 0);
  const grossTotal = priceResult.totalRoomAmount + servicesTotal;
  const netBeforeDeposit = Math.max(0, grossTotal - discountAmount);
  const finalPayable = Math.max(0, netBeforeDeposit - (booking.depositAmount || 0));

  // Dynamic VietQR payment URL
  const vietQrUrl = EscposPrinterService.generateVietQRUrl(
    'MB',
    '999988887777',
    'KHACH SAN LUXURY PMS',
    finalPayable,
    `PHONG ${booking.roomNumber}`
  );

  const handleCompleteCheckout = (shouldPrint: boolean) => {
    const invoice = checkOut({
      bookingId: booking.id,
      paymentMethod,
      discountAmount,
      discountReason: discountReason.trim() || undefined,
    });

    if (shouldPrint) {
      EscposPrinterService.printThermalInvoice(invoice);
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 20 }}>🧾</span>
            <div>
              <h3>Thanh Toán & Trả Phòng {booking.roomNumber}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                Khách hàng: <strong style={{ color: '#fff' }}>{booking.customerName}</strong> ({booking.customerPhone || 'Không có SĐT'})
              </p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
            {/* Left: Detailed Billing Breakdown */}
            <div>
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--gold-400)', marginBottom: 10, letterSpacing: 0.5 }}>
                  1. Chi Tiết Tiền Phòng ({priceResult.durationFormatted})
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Thời gian nhận:</span>
                    <span>{new Date(booking.checkInTime).toLocaleString('vi-VN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Thời gian trả:</span>
                    <span>{now.toLocaleString('vi-VN')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                    <span>Gói áp dụng:</span>
                    <span style={{ color: '#fff' }}>{plan?.name}</span>
                  </div>

                  <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.08)', margin: '6px 0' }} />

                  {priceResult.breakdown.map((item, idx) => (
                    <div key={idx} style={{ color: '#cbd5e1', fontSize: 12.5 }}>
                      • {item}
                    </div>
                  ))}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: 4 }}>
                    <span>Tiền phòng:</span>
                    <span style={{ color: 'var(--gold-400)' }}>{priceResult.totalRoomAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>

              {/* Minibar Services */}
              <div style={{ background: 'rgba(0, 0, 0, 0.3)', border: '1px solid var(--border-color)', borderRadius: 10, padding: 16 }}>
                <h4 style={{ fontSize: 13, textTransform: 'uppercase', color: 'var(--gold-400)', marginBottom: 10, letterSpacing: 0.5 }}>
                  2. Dịch Vụ & Minibar ({booking.services.length} món)
                </h4>
                {booking.services.length === 0 ? (
                  <p style={{ fontSize: 12.5, color: 'var(--text-dim)', fontStyle: 'italic' }}>Không có dịch vụ phát sinh</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {booking.services.map((s) => (
                      <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5 }}>
                        <span>{s.serviceName} (x{s.quantity})</span>
                        <span style={{ fontWeight: 600 }}>{s.totalPrice.toLocaleString('vi-VN')} đ</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.08)', margin: '6px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>Tiền dịch vụ:</span>
                      <span>{servicesTotal.toLocaleString('vi-VN')} đ</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Payment, Discounts, and Dynamic VietQR */}
            <div>
              {/* Discounts */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Tag size={14} /> Giảm giá khuyến mãi (đ):
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="number"
                    step="5000"
                    min="0"
                    className="form-input"
                    placeholder="0 đ"
                    value={discountAmount || ''}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  />
                  {hasPermission('DISCOUNT_APPLY') ? (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => setDiscountAmount(Math.round(grossTotal * 0.1))}
                    >
                      Giảm 10%
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="form-group">
                <label className="form-label">Phương thức thanh toán:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button
                    type="button"
                    className={`btn ${paymentMethod === 'VIETQR_TRANSFER' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: 12.5, padding: '8px 10px' }}
                    onClick={() => setPaymentMethod('VIETQR_TRANSFER')}
                  >
                    <QrCode size={15} />
                    <span>VietQR Động</span>
                  </button>
                  <button
                    type="button"
                    className={`btn ${paymentMethod === 'CASH' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: 12.5, padding: '8px 10px' }}
                    onClick={() => setPaymentMethod('CASH')}
                  >
                    <Banknote size={15} />
                    <span>Tiền Mặt</span>
                  </button>
                </div>
              </div>

              {/* Dynamic QR Display if selected */}
              {paymentMethod === 'VIETQR_TRANSFER' && (
                <div style={{ textAlign: 'center', background: '#fff', borderRadius: 10, padding: 12, margin: '14px 0' }}>
                  <div style={{ color: '#000', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                    Quét mã thanh toán: {finalPayable.toLocaleString('vi-VN')} đ
                  </div>
                  <img
                    src={vietQrUrl}
                    alt="VietQR Napas 247"
                    style={{ maxWidth: 170, height: 'auto', borderRadius: 6, display: 'inline-block' }}
                  />
                  <div style={{ color: '#666', fontSize: 11, marginTop: 4 }}>
                    MBBank • STK: 999988887777 • Tự khớp số tiền
                  </div>
                </div>
              )}

              {/* Summary Statement */}
              <div style={{ background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 10, padding: 16, marginTop: 10 }}>
                {booking.depositAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#34d399', marginBottom: 4 }}>
                    <span>Đã trừ tiền cọc:</span>
                    <span>-{booking.depositAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: '#fb7185', marginBottom: 4 }}>
                    <span>Giảm giá:</span>
                    <span>-{discountAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: 6, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>KHÁCH CẦN TRẢ:</span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--gold-400)' }}>
                    {finalPayable.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => handleCompleteCheckout(false)}
          >
            <CheckCircle size={16} />
            <span>Chỉ Trả Phòng (Không In)</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => handleCompleteCheckout(true)}
          >
            <Printer size={16} />
            <span>In Hóa Đơn K80 & Hoàn Tất</span>
          </button>
        </div>
      </div>
    </div>
  );
};
