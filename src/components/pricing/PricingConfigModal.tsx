import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, DollarSign, Clock, Moon, Calendar, Users } from 'lucide-react';
import { PricingPlan } from '../../types/pricing';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';

export const PricingConfigModal: React.FC = () => {
  const { pricingPlans, roomTypes, createOrUpdatePricingPlan, deletePricingPlan } = useHotel();
  const { hasPermission } = useAuth();

  const [selectedPlanId, setSelectedPlanId] = useState<string>(pricingPlans[0]?.id || '');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Edit form state
  const activePlan = pricingPlans.find((p) => p.id === selectedPlanId) || pricingPlans[0];

  const [formName, setFormName] = useState('');
  const [formRoomTypeId, setFormRoomTypeId] = useState('ALL');
  // Hourly
  const [firstBlockHours, setFirstBlockHours] = useState(2);
  const [firstBlockPrice, setFirstBlockPrice] = useState(140000);
  const [nextHourPrice, setNextHourPrice] = useState(40000);
  const [gracePeriodMinutes, setGracePeriodMinutes] = useState(15);
  // Overnight
  const [overnightEnabled, setOvernightEnabled] = useState(true);
  const [checkInFrom, setCheckInFrom] = useState('21:30');
  const [checkOutUntil, setCheckOutUntil] = useState('11:00');
  const [overnightPrice, setOvernightPrice] = useState(380000);
  const [earlyCheckInFee, setEarlyCheckInFee] = useState(40000);
  const [lateCheckOutFee, setLateCheckOutFee] = useState(50000);
  // Daily
  const [dailyPrice, setDailyPrice] = useState(550000);
  const [dailyCheckIn, setDailyCheckIn] = useState('14:00');
  const [dailyCheckOut, setDailyCheckOut] = useState('12:00');
  // Surcharges
  const [standardAdults, setStandardAdults] = useState(2);
  const [extraAdultFee, setExtraAdultFee] = useState(80000);
  const [extraChildFee, setExtraChildFee] = useState(40000);

  const startEdit = (plan: PricingPlan) => {
    setSelectedPlanId(plan.id);
    setFormName(plan.name);
    setFormRoomTypeId(plan.roomTypeId);
    setFirstBlockHours(plan.hourlyRate.firstBlockHours);
    setFirstBlockPrice(plan.hourlyRate.firstBlockPrice);
    setNextHourPrice(plan.hourlyRate.nextHourPrice);
    setGracePeriodMinutes(plan.hourlyRate.gracePeriodMinutes);

    setOvernightEnabled(plan.overnightRate.enabled);
    setCheckInFrom(plan.overnightRate.checkInFrom);
    setCheckOutUntil(plan.overnightRate.checkOutUntil);
    setOvernightPrice(plan.overnightRate.flatPrice);
    setEarlyCheckInFee(plan.overnightRate.earlyCheckInHourlyFee);
    setLateCheckOutFee(plan.overnightRate.lateCheckOutHourlyFee);

    setDailyPrice(plan.dailyRate.pricePerDay);
    setDailyCheckIn(plan.dailyRate.checkInTime);
    setDailyCheckOut(plan.dailyRate.checkOutTime);

    setStandardAdults(plan.surcharges.standardAdultCount);
    setExtraAdultFee(plan.surcharges.extraAdultFee);
    setExtraChildFee(plan.surcharges.extraChildFee);

    setIsEditing(true);
  };

  const startNew = () => {
    setSelectedPlanId('');
    setFormName('Bảng giá mới');
    setFormRoomTypeId(roomTypes[0]?.id || 'ALL');
    setFirstBlockHours(2);
    setFirstBlockPrice(150000);
    setNextHourPrice(50000);
    setGracePeriodMinutes(15);

    setOvernightEnabled(true);
    setCheckInFrom('21:00');
    setCheckOutUntil('11:00');
    setOvernightPrice(400000);
    setEarlyCheckInFee(50000);
    setLateCheckOutFee(50000);

    setDailyPrice(600000);
    setDailyCheckIn('14:00');
    setDailyCheckOut('12:00');

    setStandardAdults(2);
    setExtraAdultFee(100000);
    setExtraChildFee(50000);

    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newPlan: PricingPlan = {
      id: selectedPlanId || 'plan_' + Date.now(),
      name: formName,
      roomTypeId: formRoomTypeId,
      isDefault: false,
      applicableDays: [0, 1, 2, 3, 4, 5, 6],
      hourlyRate: {
        firstBlockHours,
        firstBlockPrice,
        nextHourPrice,
        gracePeriodMinutes,
        roundingIntervalMinutes: 30,
      },
      overnightRate: {
        enabled: overnightEnabled,
        checkInFrom,
        checkOutUntil,
        flatPrice: overnightPrice,
        earlyCheckInHourlyFee: earlyCheckInFee,
        lateCheckOutHourlyFee: lateCheckOutFee,
      },
      dailyRate: {
        enabled: true,
        checkInTime: dailyCheckIn,
        checkOutTime: dailyCheckOut,
        pricePerDay: dailyPrice,
        earlyCheckInHourlyFee: earlyCheckInFee,
        lateCheckOutHourlyFee: lateCheckOutFee,
      },
      surcharges: {
        standardAdultCount: standardAdults,
        standardChildCount: 0,
        extraAdultFee,
        extraChildFee,
      },
      createdAt: new Date().toISOString(),
    };

    createOrUpdatePricingPlan(newPlan);
    setIsEditing(false);
    setSelectedPlanId(newPlan.id);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Thiết Lập Bảng Giá Động (Dynamic Pricing)</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Tự do cấu hình block giờ đầu, lũy tiến, khung giờ qua đêm và phụ thu (Không fix cứng trong mã nguồn)
          </p>
        </div>

        {hasPermission('MANAGE_PRICING') && !isEditing && (
          <button className="btn btn-primary" onClick={startNew}>
            <Plus size={16} />
            <span>Tạo Bảng Giá Mới</span>
          </button>
        )}
      </div>

      {!isEditing ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 20 }}>
          {pricingPlans.map((plan) => {
            const rt = roomTypes.find((t) => t.id === plan.roomTypeId);
            return (
              <div
                key={plan.id}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  boxShadow: 'var(--shadow-sm)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>{plan.name}</h3>
                    <p style={{ fontSize: 12, color: 'var(--gold-400)', marginTop: 2 }}>
                      Áp dụng: {rt?.name || 'Tất cả các loại phòng'}
                    </p>
                  </div>
                  {hasPermission('MANAGE_PRICING') && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => startEdit(plan)}>
                        <Edit2 size={13} /> Sửa
                      </button>
                      {pricingPlans.length > 1 && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => {
                            if (confirm(`Xóa bảng giá "${plan.name}"?`)) {
                              deletePricingPlan(plan.id);
                            }
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Rates Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 10, borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                      <Clock size={14} style={{ color: 'var(--gold-400)' }} />
                      Thuê Theo Giờ:
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      • {plan.hourlyRate.firstBlockHours}h đầu: <strong style={{ color: '#fff' }}>{plan.hourlyRate.firstBlockPrice.toLocaleString('vi-VN')} đ</strong><br/>
                      • Mỗi giờ tiếp theo: <strong style={{ color: '#fff' }}>+{plan.hourlyRate.nextHourPrice.toLocaleString('vi-VN')} đ</strong>/h (Miễn phí {plan.hourlyRate.gracePeriodMinutes}p đầu)
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 10, borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                      <Moon size={14} style={{ color: '#a855f7' }} />
                      Thuê Qua Đêm:
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      • Khung giờ: {plan.overnightRate.checkInFrom} - {plan.overnightRate.checkOutUntil}<br/>
                      • Giá trọn gói: <strong style={{ color: '#fff' }}>{plan.overnightRate.flatPrice.toLocaleString('vi-VN')} đ</strong><br/>
                      • Phụ thu vào sớm/trả trễ: +{plan.overnightRate.earlyCheckInHourlyFee.toLocaleString('vi-VN')} đ/h
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 10, borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                      <Calendar size={14} style={{ color: '#3b82f6' }} />
                      Thuê Theo Ngày (24h):
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      • Giá ngày: <strong style={{ color: '#fff' }}>{plan.dailyRate.pricePerDay.toLocaleString('vi-VN')} đ</strong> (Checkin {plan.dailyRate.checkInTime} - Checkout {plan.dailyRate.checkOutTime})
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: 10, borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                      <Users size={14} style={{ color: '#10b981' }} />
                      Phụ Thu Thêm Khách:
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                      • Tiêu chuẩn: {plan.surcharges.standardAdultCount} người lớn | Thêm người: +{plan.surcharges.extraAdultFee.toLocaleString('vi-VN')} đ/người
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Edit Form */
        <form onSubmit={handleSave} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold-400)' }}>
              {selectedPlanId ? 'Chỉnh Sửa Bảng Giá' : 'Tạo Bảng Giá Mới'}
            </h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
              Hủy Bỏ
            </button>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Tên bảng giá:</label>
              <input
                type="text"
                required
                className="form-input"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Áp dụng cho loại phòng:</label>
              <select
                className="form-select"
                value={formRoomTypeId}
                onChange={(e) => setFormRoomTypeId(e.target.value)}
              >
                <option value="ALL">Áp dụng tất cả các phòng</option>
                {roomTypes.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: Hourly */}
          <div style={{ margin: '20px 0', padding: 16, background: 'rgba(0, 0, 0, 0.25)', borderRadius: 10 }}>
            <h4 style={{ fontSize: 14, color: 'var(--gold-400)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={16} /> Cấu Hình Tính Giá Theo Giờ:
            </h4>
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Số giờ block đầu (tiếng):</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  className="form-input"
                  value={firstBlockHours}
                  onChange={(e) => setFirstBlockHours(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Giá block đầu (đ):</label>
                <input
                  type="number"
                  step="10000"
                  className="form-input"
                  value={firstBlockPrice}
                  onChange={(e) => setFirstBlockPrice(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Giá mỗi giờ phát sinh sau (đ/h):</label>
                <input
                  type="number"
                  step="5000"
                  className="form-input"
                  value={nextHourPrice}
                  onChange={(e) => setNextHourPrice(Number(e.target.value))}
                />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Số phút ân hạn (Grace Period miễn phí):</label>
              <input
                type="number"
                min="0"
                max="60"
                style={{ maxWidth: 200 }}
                className="form-input"
                value={gracePeriodMinutes}
                onChange={(e) => setGracePeriodMinutes(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Section: Overnight */}
          <div style={{ margin: '20px 0', padding: 16, background: 'rgba(0, 0, 0, 0.25)', borderRadius: 10 }}>
            <h4 style={{ fontSize: 14, color: '#a855f7', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Moon size={16} /> Cấu Hình Thuê Qua Đêm:
            </h4>
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Nhận phòng từ mấy giờ:</label>
                <input
                  type="time"
                  className="form-input"
                  value={checkInFrom}
                  onChange={(e) => setCheckInFrom(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Trả phòng trước mấy giờ sáng:</label>
                <input
                  type="time"
                  className="form-input"
                  value={checkOutUntil}
                  onChange={(e) => setCheckOutUntil(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Giá trọn gói qua đêm (đ):</label>
                <input
                  type="number"
                  step="10000"
                  className="form-input"
                  value={overnightPrice}
                  onChange={(e) => setOvernightPrice(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          {/* Section: Daily & Surcharges */}
          <div style={{ margin: '20px 0', padding: 16, background: 'rgba(0, 0, 0, 0.25)', borderRadius: 10 }}>
            <h4 style={{ fontSize: 14, color: '#3b82f6', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Calendar size={16} /> Giá Thuê Ngày & Phụ Thu:
            </h4>
            <div className="form-grid-3">
              <div className="form-group">
                <label className="form-label">Giá thuê theo ngày (24h):</label>
                <input
                  type="number"
                  step="10000"
                  className="form-input"
                  value={dailyPrice}
                  onChange={(e) => setDailyPrice(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phụ thu thêm người lớn (đ/người):</label>
                <input
                  type="number"
                  step="10000"
                  className="form-input"
                  value={extraAdultFee}
                  onChange={(e) => setExtraAdultFee(Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phụ thu thêm trẻ em (đ/bé):</label>
                <input
                  type="number"
                  step="10000"
                  className="form-input"
                  value={extraChildFee}
                  onChange={(e) => setExtraChildFee(Number(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} /> Lưu Cấu Hình Bảng Giá
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
