import React, { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { Room, RoomStatus } from '../../types/room';
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
  const { rooms, zones, bookings } = useHotel();
  const { hasPermission } = useAuth();

  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Counts
  const availableCount = rooms.filter((r) => r.status === 'AVAILABLE').length;
  const occupiedCount = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const dirtyCount = rooms.filter((r) => r.status === 'DIRTY').length;
  const maintenanceCount = rooms.filter((r) => r.status === 'MAINTENANCE').length;
  const reservedCount = rooms.filter((r) => r.status === 'RESERVED').length;

  const filteredRooms = rooms.filter((room) => {
    // Zone filter
    if (selectedZone !== 'ALL' && room.zoneId !== selectedZone) {
      return false;
    }
    // Status filter
    if (selectedStatus !== 'ALL' && room.status !== selectedStatus) {
      return false;
    }
    // Search query
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Filter and Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        {/* Status Pills */}
        <div className="status-pill-bar" style={{ margin: 0 }}>
          <button
            className={`status-pill ${selectedStatus === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedStatus('ALL')}
          >
            Tất cả ({rooms.length})
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ position: 'relative', width: 240 }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text-dim)' }}
            />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: 36, height: 38 }}
              placeholder="Tìm số phòng, tên khách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {hasPermission('MANAGE_ROOMS') && (
            <button className="btn btn-primary" onClick={onOpenCreateRoom} style={{ height: 38 }}>
              <Plus size={16} />
              <span>Thêm Phòng</span>
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
          Tất cả khu vực
        </button>
        {zones.map((z) => (
          <button
            key={z.id}
            className={`btn btn-sm ${selectedZone === z.id ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedZone(z.id)}
          >
            {z.name}
          </button>
        ))}
      </div>

      {/* Grid */}
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
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-dim)' }}>
          <p style={{ fontSize: 16, fontWeight: 600 }}>Không tìm thấy phòng phù hợp với bộ lọc</p>
        </div>
      )}
    </div>
  );
};
