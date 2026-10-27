import React, { useState } from 'react';
import { X, ArrowLeftRight } from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

interface ChangeRoomModalProps {
  bookingId: string;
  onClose: () => void;
}

export const ChangeRoomModal: React.FC<ChangeRoomModalProps> = ({ bookingId, onClose }) => {
  const { bookings, rooms, roomTypes, changeRoom } = useHotel();
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) return null;

  const availableRooms = rooms.filter((r) => r.status === 'AVAILABLE');
  const [targetRoomId, setTargetRoomId] = useState<string>(availableRooms[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoomId) return;
    changeRoom(bookingId, targetRoomId);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ArrowLeftRight size={20} style={{ color: 'var(--gold-400)' }} />
            <h3>Đổi Phòng - Khách {booking.customerName}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{ padding: 12, background: 'rgba(255, 255, 255, 0.03)', borderRadius: 8, marginBottom: 16 }}>
              <div>Phòng hiện tại: <strong style={{ color: '#fff', fontSize: 16 }}>{booking.roomNumber}</strong></div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Thời gian nhận: {new Date(booking.checkInTime).toLocaleString('vi-VN')}</div>
            </div>

            <div className="form-group">
              <label className="form-label">Chọn phòng trống muốn chuyển tới:</label>
              {availableRooms.length === 0 ? (
                <p style={{ color: '#fb7185', fontSize: 13 }}>Hiện tại không còn phòng trống nào để chuyển.</p>
              ) : (
                <select
                  className="form-select"
                  value={targetRoomId}
                  onChange={(e) => setTargetRoomId(e.target.value)}
                >
                  {availableRooms.map((r) => {
                    const rt = roomTypes.find((t) => t.id === r.roomTypeId);
                    return (
                      <option key={r.id} value={r.id}>
                        Phòng {r.roomNumber} ({rt?.name})
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            <p style={{ fontSize: 12, color: 'var(--text-dim)', fontStyle: 'italic' }}>
              * Lưu ý: Sau khi đổi phòng, phòng cũ ({booking.roomNumber}) sẽ tự động chuyển sang trạng thái "Chờ dọn buồng".
            </p>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" disabled={availableRooms.length === 0}>
              Xác Nhận Đổi Phòng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
