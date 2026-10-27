import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2, Building2, Tag, Check, Sparkles } from 'lucide-react';
import { Room } from '../../types/room';
import { useHotel } from '../../context/HotelContext';
import { useAuth } from '../../context/AuthContext';

export const RoomConfigModal: React.FC = () => {
  const { rooms, zones, roomTypes, amenities, pricingPlans, createOrUpdateRoom } = useHotel();
  const { hasPermission } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState<string>('');

  const [roomNumber, setRoomNumber] = useState('');
  const [zoneId, setZoneId] = useState(zones[0]?.id || '');
  const [roomTypeId, setRoomTypeId] = useState(roomTypes[0]?.id || '');
  const [floorLevel, setFloorLevel] = useState(1);
  const [customPricingPlanId, setCustomPricingPlanId] = useState('');
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);

  const startNewRoom = () => {
    setEditingRoomId('');
    setRoomNumber('');
    setZoneId(zones[0]?.id || '');
    setRoomTypeId(roomTypes[0]?.id || '');
    setFloorLevel(1);
    setCustomPricingPlanId('');
    setSelectedAmenityIds(['am_ac', 'am_smarttv']);
    setIsEditing(true);
  };

  const startEditRoom = (room: Room) => {
    setEditingRoomId(room.id);
    setRoomNumber(room.roomNumber);
    setZoneId(room.zoneId);
    setRoomTypeId(room.roomTypeId);
    setFloorLevel(room.floorLevel);
    setCustomPricingPlanId(room.customPricingPlanId || '');
    setSelectedAmenityIds([...room.amenityIds]);
    setIsEditing(true);
  };

  const toggleAmenity = (id: string) => {
    setSelectedAmenityIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomNumber.trim()) return;

    const targetId = editingRoomId || 'room_' + Date.now();
    const existing = rooms.find((r) => r.id === targetId);

    const newRoom: Room = {
      id: targetId,
      roomNumber: roomNumber.trim(),
      zoneId,
      roomTypeId,
      floorLevel,
      status: existing ? existing.status : 'AVAILABLE',
      currentBookingId: existing?.currentBookingId,
      customPricingPlanId: customPricingPlanId || undefined,
      amenityIds: selectedAmenityIds,
    };

    createOrUpdateRoom(newRoom);
    setIsEditing(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Tùy Biến Phòng & Cơ Sở Vật Chất (Room Customization)</h2>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Quản lý số phòng, gắn mục đích sử dụng (Theme Romance, VIP Jacuzzi, Căn hộ gia đình) và tiện nghi
          </p>
        </div>

        {hasPermission('MANAGE_ROOMS') && !isEditing && (
          <button className="btn btn-primary" onClick={startNewRoom}>
            <Plus size={16} />
            <span>Thêm Phòng Mới</span>
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Số Phòng</th>
                <th>Khu Vực / Tầng</th>
                <th>Loại Hình & Mục Đích</th>
                <th>Tiện Nghi Đính Kèm</th>
                <th>Bảng Giá Gắn Kèm</th>
                <th style={{ textAlign: 'center' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                const zone = zones.find((z) => z.id === room.zoneId);
                const rt = roomTypes.find((t) => t.id === room.roomTypeId);
                const roomAmenities = amenities.filter((a) => room.amenityIds.includes(a.id));
                const customPlan = pricingPlans.find((p) => p.id === room.customPricingPlanId);

                return (
                  <tr key={room.id}>
                    <td>
                      <strong style={{ fontSize: 16, color: '#fff' }}>{room.roomNumber}</strong>
                    </td>
                    <td>{zone?.name || `Tầng ${room.floorLevel}`}</td>
                    <td>
                      <span style={{ color: 'var(--gold-400)', fontWeight: 600 }}>{rt?.name}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {roomAmenities.map((a) => (
                          <span key={a.id} className="amenity-chip">
                            {a.icon} {a.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: customPlan ? 'var(--gold-400)' : 'var(--text-dim)' }}>
                        {customPlan ? customPlan.name : 'Mặc định theo loại phòng'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {hasPermission('MANAGE_ROOMS') && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => startEditRoom(room)}
                        >
                          <Edit2 size={13} /> Sửa
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Edit Form */
        <form onSubmit={handleSave} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--border-color)', paddingBottom: 14 }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: 'var(--gold-400)' }}>
              {editingRoomId ? 'Chỉnh Sửa Thông Tin Phòng' : 'Thêm Phòng Mới'}
            </h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsEditing(false)}>
              Hủy
            </button>
          </div>

          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label">Tên / Số phòng (*):</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="Ví dụ: 105, VIP-03, Bungalow-B"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Khu vực / Tòa nhà:</label>
              <select
                className="form-select"
                value={zoneId}
                onChange={(e) => setZoneId(e.target.value)}
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id}>
                    {z.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Mục đích & Loại phòng:</label>
              <select
                className="form-select"
                value={roomTypeId}
                onChange={(e) => setRoomTypeId(e.target.value)}
              >
                {roomTypes.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Tầng lầu:</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={floorLevel}
                onChange={(e) => setFloorLevel(Number(e.target.value))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Gắn bảng giá riêng (tùy chọn):</label>
              <select
                className="form-select"
                value={customPricingPlanId}
                onChange={(e) => setCustomPricingPlanId(e.target.value)}
              >
                <option value="">Theo mặc định loại phòng</option>
                {pricingPlans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amenities Checklist */}
          <div className="form-group">
            <label className="form-label">Tiện nghi trang bị trong phòng:</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginTop: 8 }}>
              {amenities.map((a) => {
                const isChecked = selectedAmenityIds.includes(a.id);
                return (
                  <div
                    key={a.id}
                    onClick={() => toggleAmenity(a.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '10px 14px',
                      background: isChecked ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isChecked ? 'var(--gold-400)' : 'var(--border-color)'}`,
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: 13,
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{a.icon}</span>
                    <span style={{ flex: 1, color: isChecked ? '#fff' : 'var(--text-muted)' }}>{a.name}</span>
                    {isChecked && <Check size={14} style={{ color: 'var(--gold-400)' }} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} /> Lưu Thông Tin Phòng
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
