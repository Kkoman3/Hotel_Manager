import React, { useState } from 'react';
import { X, Plus, Trash2, Coffee } from 'lucide-react';
import { useHotel } from '../../context/HotelContext';

interface AddServiceModalProps {
  bookingId: string;
  onClose: () => void;
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({ bookingId, onClose }) => {
  const { bookings, services, addServiceToBooking, removeServiceFromBooking } = useHotel();
  const booking = bookings.find((b) => b.id === bookingId);
  if (!booking) return null;

  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(1);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedServiceId || quantity <= 0) return;
    addServiceToBooking(bookingId, selectedServiceId, quantity);
    setQuantity(1);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Coffee size={20} style={{ color: 'var(--gold-400)' }} />
            <h3>Minibar & Dịch Vụ - Phòng {booking.roomNumber}</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Add Form */}
          <form onSubmit={handleAdd} style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 20 }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Chọn món / Dịch vụ:</label>
              <select
                className="form-select"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} - {s.salePrice.toLocaleString('vi-VN')} đ / {s.unit} (Còn {s.stockQuantity})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ width: 90 }}>
              <label className="form-label">Số lượng:</label>
              <input
                type="number"
                min="1"
                className="form-input"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ height: 38 }}>
              <Plus size={16} /> Thêm
            </button>
          </form>

          {/* Consumed List */}
          <label className="form-label">Danh sách đã thêm vào phòng:</label>
          {booking.services.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-dim)', fontStyle: 'italic', padding: '12px 0' }}>
              Chưa có dịch vụ nào được gọi.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 220, overflowY: 'auto' }}>
              {booking.services.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 8,
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{item.serviceName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                      {item.unitPrice.toLocaleString('vi-VN')} đ x {item.quantity} = {item.totalPrice.toLocaleString('vi-VN')} đ
                    </div>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => removeServiceFromBooking(bookingId, item.id)}
                    title="Xóa món"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Xong
          </button>
        </div>
      </div>
    </div>
  );
};
