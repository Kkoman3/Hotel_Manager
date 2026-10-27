import React, { useState, useEffect } from 'react';
import { 
  LogIn, 
  LogOut, 
  Coffee, 
  ArrowLeftRight, 
  Sparkles, 
  Wrench, 
  Clock, 
  User as UserIcon,
  CheckCircle2,
  Users
} from 'lucide-react';
import { Room } from '../../types/room';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';
import { PricingEngine } from '../../domain/pricingEngine';

interface RoomCardProps {
  room: Room;
  onCheckIn: (room: Room) => void;
  onCheckOut: (bookingId: string) => void;
  onAddService: (bookingId: string) => void;
  onChangeRoom: (bookingId: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onCheckIn,
  onCheckOut,
  onAddService,
  onChangeRoom,
}) => {
  const { zones, roomTypes, amenities, bookings, pricingPlans, setRoomStatus } = useHotel();
  const { hasPermission } = useAuth();

  const zone = zones.find((z) => z.id === room.zoneId);
  const roomType = roomTypes.find((rt) => rt.id === room.roomTypeId);
  const activeBooking = bookings.find(
    (b) => b.id === room.currentBookingId && b.status === 'ACTIVE'
  );

  // Live timer for Occupied rooms
  const [, setTick] = useState(0);

  useEffect(() => {
    if (room.status !== 'OCCUPIED' || !activeBooking) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [room.status, activeBooking]);

  // Live price calculation
  let liveDurationFormatted = '';
  let livePriceEstimate = 0;

  if (room.status === 'OCCUPIED' && activeBooking) {
    const plan =
      pricingPlans.find((p) => p.id === activeBooking.pricingPlanId) ||
      pricingPlans[0];

    const calculation = PricingEngine.calculateStayPrice(
      activeBooking.checkInTime,
      new Date(),
      activeBooking.bookingType,
      plan,
      activeBooking.adultCount,
      activeBooking.childCount
    );

    liveDurationFormatted = calculation.durationFormatted;
    const servicesTotal = activeBooking.services.reduce((sum, s) => sum + s.totalPrice, 0);
    livePriceEstimate = calculation.totalRoomAmount + servicesTotal;
  }

  const roomAmenities = amenities.filter((a) => room.amenityIds.includes(a.id));

  const getStatusLabel = () => {
    switch (room.status) {
      case 'AVAILABLE': return 'Phòng Trống';
      case 'OCCUPIED': return 'Đang Có Khách';
      case 'DIRTY': return 'Chờ Dọn Buồng';
      case 'MAINTENANCE': return 'Đang Bảo Trì';
      case 'RESERVED': return 'Đã Đặt Trước';
    }
  };

  const defaultPlan = pricingPlans.find((p) => p.id === roomType?.defaultPricingPlanId) || pricingPlans[0];

  return (
    <div className={`room-card state-${room.status}`}>
      {/* Top Header */}
      <div className="room-header">
        <div className="room-number-wrap">
          <span className="room-number">{room.roomNumber}</span>
          <span className="room-zone-tag">{zone?.name || `Tầng ${room.floorLevel}`}</span>
        </div>
        <span className={`room-badge ${room.status}`}>
          <span className={`status-dot ${room.status.toLowerCase()}`} />
          {getStatusLabel()}
        </span>
      </div>

      {/* Room Type and Capacity */}
      <div className="room-type-title">
        <Sparkles size={14} style={{ color: 'var(--gold-400)', flexShrink: 0 }} />
        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {roomType?.name || 'Phòng Tiêu Chuẩn'}
        </span>
      </div>

      {/* Guest Live Box if Occupied */}
      {room.status === 'OCCUPIED' && activeBooking ? (
        <div className="guest-live-box">
          <div className="guest-name-row">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(244, 63, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>
                👤
              </div>
              <span style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {activeBooking.customerName}
              </span>
            </span>
            <span className="live-timer">
              <span className="pulse-dot" />
              <Clock size={12} />
              {liveDurationFormatted}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: 4 }}>
            <span>
              {activeBooking.bookingType === 'HOURLY' ? '⚡ Thuê theo giờ' : activeBooking.bookingType === 'OVERNIGHT' ? '🌙 Thuê qua đêm' : '📅 Thuê theo ngày'}
            </span>
            {activeBooking.services.length > 0 && (
              <span style={{ color: '#38bdf8' }}>+{activeBooking.services.length} món minibar</span>
            )}
          </div>

          <div className="live-price-est">
            <span>Tạm tính tiền phòng + DV:</span>
            <strong>{livePriceEstimate.toLocaleString('vi-VN')} đ</strong>
          </div>
        </div>
      ) : room.status === 'AVAILABLE' ? (
        /* Price Preview for Available Room */
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-glass)', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Giá tham khảo ({defaultPlan?.hourlyRate.firstBlockHours}h đầu):</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#34d399', fontFamily: 'var(--font-mono)' }}>
              {defaultPlan?.hourlyRate.firstBlockPrice.toLocaleString('vi-VN')} đ
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, fontSize: 11.5, color: 'var(--text-dim)' }}>
            <span>Đêm: {defaultPlan?.overnightRate.flatPrice.toLocaleString('vi-VN')} đ</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Users size={12} /> Tối đa {roomType?.maxOccupancy || 2} khách
            </span>
          </div>
        </div>
      ) : room.status === 'DIRTY' ? (
        /* Dirty Note */
        <div style={{ background: 'rgba(168, 85, 247, 0.08)', border: '1px solid rgba(168, 85, 247, 0.3)', borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 12.5, color: '#d8b4fe' }}>
          <div style={{ fontWeight: 700, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>🧹</span> Cần Buồng Phòng Dọn Dẹp
          </div>
          <div style={{ color: 'var(--text-muted)' }}>{room.cleanNotes || 'Khách vừa checkout, cần khử khuẩn & thay ga gối'}</div>
        </div>
      ) : room.status === 'MAINTENANCE' ? (
        /* Maintenance Note */
        <div style={{ background: 'rgba(234, 179, 8, 0.08)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 12.5, color: '#fde047' }}>
          <div style={{ fontWeight: 700, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span>⚠️</span> Đang Bảo Trì Trang Thiết Bị
          </div>
          <div style={{ color: 'var(--text-muted)' }}>{room.maintenanceReason || 'Bảo trì điều hòa / thiết bị vệ sinh'}</div>
        </div>
      ) : null}

      {/* Amenities Tags */}
      <div className="amenities-tag-bar">
        {roomAmenities.slice(0, 4).map((a) => (
          <span key={a.id} className="amenity-chip">
            <span>{a.icon}</span>
            <span>{a.name}</span>
          </span>
        ))}
      </div>

      {/* Card Action Footer */}
      <div className="room-card-footer">
        {room.status === 'AVAILABLE' && (
          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => onCheckIn(room)}
          >
            <LogIn size={15} />
            <span>Nhận Phòng Ngay</span>
          </button>
        )}

        {room.status === 'OCCUPIED' && activeBooking && (
          <>
            <button
              className="btn btn-primary"
              style={{ flex: 2 }}
              onClick={() => onCheckOut(activeBooking.id)}
            >
              <LogOut size={15} />
              <span>Trả Phòng</span>
            </button>
            <button
              className="btn btn-secondary btn-sm"
              title="Gọi thêm minibar / nước ngọt / đồ ăn"
              onClick={() => onAddService(activeBooking.id)}
            >
              <Coffee size={15} />
            </button>
            <button
              className="btn btn-secondary btn-sm"
              title="Chuyển sang phòng khác"
              onClick={() => onChangeRoom(activeBooking.id)}
            >
              <ArrowLeftRight size={15} />
            </button>
          </>
        )}

        {room.status === 'DIRTY' && (
          <button
            className="btn btn-success"
            style={{ width: '100%' }}
            onClick={() => setRoomStatus(room.id, 'AVAILABLE')}
          >
            <Sparkles size={15} />
            <span>Đã Dọn Xong (Sạch)</span>
          </button>
        )}

        {room.status === 'MAINTENANCE' && (
          <button
            className="btn btn-secondary"
            style={{ width: '100%' }}
            onClick={() => setRoomStatus(room.id, 'AVAILABLE')}
          >
            <Wrench size={15} />
            <span>Hoàn Tất Sửa Chữa</span>
          </button>
        )}

        {room.status === 'RESERVED' && (
          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            onClick={() => onCheckIn(room)}
          >
            <CheckCircle2 size={15} />
            <span>Nhận Phòng Đặt Trước</span>
          </button>
        )}
      </div>
    </div>
  );
};
