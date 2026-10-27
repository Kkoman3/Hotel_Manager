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
  CheckCircle2
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

  // Calculate live estimate for Occupied room
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
      case 'MAINTENANCE': return 'Đang Sửa Chữa';
      case 'RESERVED': return 'Đã Đặt Trước';
    }
  };

  return (
    <div className={`room-card state-${room.status}`}>
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

      <div className="room-type-title">
        <span>{roomType?.name || 'Phòng Tiêu Chuẩn'}</span>
      </div>

      {/* Guest Live Box if Occupied */}
      {room.status === 'OCCUPIED' && activeBooking && (
        <div className="guest-live-box">
          <div className="guest-name-row">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <UserIcon size={14} style={{ color: 'var(--text-muted)' }} />
              {activeBooking.customerName}
            </span>
            <span className="live-timer">
              <span className="pulse-dot" />
              <Clock size={12} />
              {liveDurationFormatted}
            </span>
          </div>

          <div style={{ fontSize: '11.5px', color: 'var(--text-dim)', marginBottom: 4 }}>
            Hình thức: {activeBooking.bookingType === 'HOURLY' ? 'Theo giờ' : activeBooking.bookingType === 'OVERNIGHT' ? 'Qua đêm' : 'Theo ngày'}
            {activeBooking.services.length > 0 && ` • ${activeBooking.services.length} dịch vụ`}
          </div>

          <div className="live-price-est">
            <span>Tạm tính hiện tại:</span>
            <strong>{livePriceEstimate.toLocaleString('vi-VN')} đ</strong>
          </div>
        </div>
      )}

      {/* Dirty notes if dirty */}
      {room.status === 'DIRTY' && (
        <div style={{ background: 'rgba(168, 85, 247, 0.1)', border: '1px solid rgba(168, 85, 247, 0.25)', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 12, color: '#d8b4fe' }}>
          <strong>Lưu ý dọn:</strong> {room.cleanNotes || 'Cần thay chăn ga gối & lau sàn khử khuẩn'}
        </div>
      )}

      {/* Maintenance notes */}
      {room.status === 'MAINTENANCE' && (
        <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.25)', borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 12, color: '#fde047' }}>
          <strong>Sự cố:</strong> {room.maintenanceReason || 'Đang bảo trì thiết bị'}
        </div>
      )}

      {/* Amenities Tags */}
      <div className="amenities-tag-bar">
        {roomAmenities.slice(0, 4).map((a) => (
          <span key={a.id} className="amenity-chip">
            <span>{a.icon}</span>
            <span>{a.name}</span>
          </span>
        ))}
      </div>

      {/* Card Footer Actions */}
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
              title="Thêm đồ uống / dịch vụ minibar"
              onClick={() => onAddService(activeBooking.id)}
            >
              <Coffee size={15} />
            </button>
            <button
              className="btn btn-secondary btn-sm"
              title="Chuyển khách sang phòng khác"
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
            <span>Khách Đến Nhận Phòng</span>
          </button>
        )}
      </div>
    </div>
  );
};
