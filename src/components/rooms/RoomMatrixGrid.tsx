import React, { useState } from 'react';
import { Search, Plus, Filter, Bed, Users, Clock, AlertCircle, Sparkles } from 'lucide-react';
import { Room } from '../../types/room';
import { RoomCard } from './RoomCard';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';

interface RoomMatrixGridProps {
  onCheckIn: (room: Room) => void;
  onCheckOut: (bookingId: string) => void;
  onAddService: (bookingId: string) => void;
  onChangeRoom: (bookingId: string) => void;
  onOpenCreateRoom: () => void;
}

export const RoomMatrixGrid: React.FC<RoomMatrixGridProps> = ({
  onCheckIn,
  onCheckOut,
  onAddService,
  onChangeRoom,
  onOpenCreateRoom,
}) => {
  const { rooms, zones, bookings, currentShift } = useHotel();
  const { hasPermission } = useAuth();

  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Counts
  const totalRooms = rooms.length;
  const availableCount = rooms.filter((r) => r.status === 'AVAILABLE').length;
  const occupiedCount = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const dirtyCount = rooms.filter((r) => r.status === 'DIRTY').length;
  const maintenanceCount = rooms.filter((r) => r.status === 'MAINTENANCE').length;
  const reservedCount = rooms.filter((r) => r.status === 'RESERVED').length;

  const occupancyRate = totalRooms > 0 ? Math.round((occupiedCount / totalRooms) * 100) : 0;

  const filteredRooms = rooms.filter((room) => {
    if (selectedZone !== 'ALL' && room.zoneId !== selectedZone) {
      return false;
    }
    if (selectedStatus !== 'ALL' && room.status !== selectedStatus) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchRoom = room.roomNumber.toLowerCase().includes(q);
      const activeBooking = bookings.find(
        (b) => b.id === room.currentBookingId && b.status === 'ACTIVE'
      );
      const matchGuest = activeBooking?.customerName.toLowerCase().includes(q);
      return matchRoom || matchGuest;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Executive Quick Stats HUD */}
      <div className="matrix-stats-bar">
        <div className="stat-chip">
          <div>
            <div className="stat-chip-label">TỔNG SỐ PHÒNG</div>
            <div className="stat-chip-val">{totalRooms}</div>
          </div>
          <Bed size={22} style={{ color: 'var(--text-muted)' }} />
        </div>

        <div className="stat-chip" style={{ borderColor: 'rgba(16, 185, 129, 0.3)' }}>
          <div>
            <div className="stat-chip-label" style={{ color: '#34d399' }}>PHÒNG SẴN SÀNG</div>
            <div className="stat-chip-val" style={{ color: '#34d399' }}>{availableCount}</div>
          </div>
          <span className="status-dot available" style={{ width: 12, height: 12 }} />
        </div>

        <div className="stat-chip" style={{ borderColor: 'rgba(244, 63, 94, 0.3)' }}>
          <div>
            <div className="stat-chip-label" style={{ color: '#fb7185' }}>ĐANG CÓ KHÁCH</div>
            <div className="stat-chip-val" style={{ color: '#fb7185' }}>{occupiedCount}</div>
          </div>
          <span className="status-dot occupied" style={{ width: 12, height: 12 }} />
        </div>

        <div className="stat-chip" style={{ borderColor: 'rgba(168, 85, 247, 0.3)' }}>
          <div>
            <div className="stat-chip-label" style={{ color: '#c084fc' }}>CHỜ DỌN BUỒNG</div>
            <div className="stat-chip-val" style={{ color: '#c084fc' }}>{dirtyCount}</div>
          </div>
          <span className="status-dot dirty" style={{ width: 12, height: 12 }} />
        </div>

        <div className="stat-chip" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <div>
            <div className="stat-chip-label" style={{ color: 'var(--gold-400)' }}>CÔNG SUẤT LẤP ĐẦY</div>
            <div className="stat-chip-val" style={{ color: 'var(--gold-400)' }}>{occupancyRate}%</div>
          </div>
          <Sparkles size={22} style={{ color: 'var(--gold-400)' }} />
        </div>
      </div>

      {/* Top Filter and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        {/* Status Pills */}
        <div className="status-pill-bar">
          <button
            className={`status-pill ${selectedStatus === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('ALL')}
          >
            Tất cả ({totalRooms})
          </button>
          <button
            className={`status-pill ${selectedStatus === 'AVAILABLE' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('AVAILABLE')}
          >
            <span className="status-dot available" />
            Trống ({availableCount})
          </button>
          <button
            className={`status-pill ${selectedStatus === 'OCCUPIED' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('OCCUPIED')}
          >
            <span className="status-dot occupied" />
            Đang ở ({occupiedCount})
          </button>
          <button
            className={`status-pill ${selectedStatus === 'DIRTY' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('DIRTY')}
          >
            <span className="status-dot dirty" />
            Chờ dọn ({dirtyCount})
          </button>
          <button
            className={`status-pill ${selectedStatus === 'MAINTENANCE' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('MAINTENANCE')}
          >
            <span className="status-dot maintenance" />
            Bảo trì ({maintenanceCount})
          </button>
          <button
            className={`status-pill ${selectedStatus === 'RESERVED' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('RESERVED')}
          >
            <span className="status-dot reserved" />
            Đặt trước ({reservedCount})
          </button>
        </div>

        {/* Search & Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', width: 250 }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: 14, top: 12, color: 'var(--text-dim)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 40, height: 40 }}
              placeholder="Tìm số phòng, tên khách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {hasPermission('MANAGE_ROOMS') && (
            <button className="btn btn-primary" onClick={onOpenCreateRoom} style={{ height: 40 }}>
              <Plus size={16} />
              <span>Thêm Phòng Mới</span>
            </button>
          )}
        </div>
      </div>

      {/* Zone / Floor Sub-tabs */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
        <button
          className={`btn btn-sm ${selectedZone === 'ALL' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setSelectedZone('ALL')}
        >
          <Filter size={13} />
          Tất cả khu vực ({totalRooms})
        </button>
        {zones.map((z) => {
          const countInZone = rooms.filter((r) => r.zoneId === z.id).length;
          return (
            <button
              key={z.id}
              className={`btn btn-sm ${selectedZone === z.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSelectedZone(z.id)}
            >
              {z.name} ({countInZone})
            </button>
          );
        })}
      </div>

      {/* Room Grid */}
      <div className="room-grid">
        {filteredRooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            onCheckIn={onCheckIn}
            onCheckOut={onCheckOut}
            onAddService={onAddService}
            onChangeRoom={onChangeRoom}
          />
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-muted)' }}>
            Không tìm thấy phòng phù hợp với điều kiện lọc
          </p>
        </div>
      )}
    </div>
  );
};
