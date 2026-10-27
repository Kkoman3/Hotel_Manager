import React from 'react';
import { X, Check, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface UserSwitchModalProps {
  onClose: () => void;
}

export const UserSwitchModal: React.FC<UserSwitchModalProps> = ({ onClose }) => {
  const { users, currentUser, switchUser } = useAuth();

  const handleSelect = (userId: string) => {
    switchUser(userId);
    onClose();
  };

  const roleDescriptions: Record<string, string> = {
    ADMIN: 'Chủ khách sạn (Toàn quyền quản trị, cấu hình giá, xem P&L, xem audit log)',
    MANAGER: 'Quản lý cơ sở (Tùy biến phòng, thiết lập giá, duyệt hủy, xem doanh thu)',
    RECEPTIONIST: 'Lễ tân thu ngân (Check-in, Check-out, giao ca két tiền. Bị chặn xem P&L)',
    HOUSEKEEPING: 'Tổ buồng phòng (Xem trạng thái, đánh dấu phòng sạch/báo bảo trì)',
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShieldCheck size={20} style={{ color: 'var(--gold-400)' }} />
            <h3>Chuyển Đổi Tài Khoản / Kiểm Thử Phân Quyền</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
            Chọn vai trò nhân viên bên dưới để trải nghiệm các quyền hạn thực tế trong phần mềm:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {users.map((user) => {
              const isCurrent = currentUser?.id === user.id;
              return (
                <div
                  key={user.id}
                  onClick={() => handleSelect(user.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '14px 18px',
                    borderRadius: 10,
                    background: isCurrent ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${isCurrent ? 'var(--gold-400)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <div style={{ fontSize: 28 }}>{user.avatar || '👤'}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <strong style={{ fontSize: 14, color: '#fff' }}>{user.fullName}</strong>
                      <span className={`user-role-tag role-${user.role}`}>{user.role}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                      {roleDescriptions[user.role]}
                    </div>
                  </div>
                  {isCurrent && <Check size={18} style={{ color: 'var(--gold-400)' }} />}
                </div>
              );
            })}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
