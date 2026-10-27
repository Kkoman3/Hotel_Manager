import React from 'react';
import { 
  LayoutGrid, 
  DollarSign, 
  Building2, 
  Wallet, 
  BarChart3, 
  ShieldAlert, 
  Users, 
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useHotel } from '../../context/HotelContext';

export type ActiveTab = 'ROOMS' | 'PRICING' | 'ROOM_CONFIG' | 'SHIFT' | 'FINANCE' | 'AUDIT' | 'USERS';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenUserSwitch: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, onOpenUserSwitch }) => {
  const { currentUser, hasPermission } = useAuth();
  const { rooms, currentShift } = useHotel();

  const occupiedCount = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const dirtyCount = rooms.filter((r) => r.status === 'DIRTY').length;

  return (
    <aside className="sidebar">
      <div className="brand-header">
        <div className="brand-icon">🏨</div>
        <div className="brand-text">
          <h1>LUXURY PMS</h1>
          <p>Hotel & Motel Manager</p>
        </div>
      </div>

      <nav className="nav-menu">
        <button
          className={`nav-item ${activeTab === 'ROOMS' ? 'active' : ''}`}
          onClick={() => setActiveTab('ROOMS')}
        >
          <LayoutGrid size={18} />
          <span>Sơ đồ phòng</span>
          {occupiedCount > 0 && (
            <span className="nav-badge" style={{ background: 'rgba(244, 63, 94, 0.2)', color: '#fb7185' }}>
              {occupiedCount} đang ở
            </span>
          )}
        </button>

        <button
          className={`nav-item ${activeTab === 'PRICING' ? 'active' : ''}`}
          onClick={() => setActiveTab('PRICING')}
        >
          <DollarSign size={18} />
          <span>Bảng giá Động</span>
          <span className="nav-badge" style={{ color: 'var(--gold-400)' }}>
            <Sparkles size={11} style={{ marginRight: 3, verticalAlign: -1 }} />
            Tùy biến
          </span>
        </button>

        <button
          className={`nav-item ${activeTab === 'ROOM_CONFIG' ? 'active' : ''}`}
          onClick={() => setActiveTab('ROOM_CONFIG')}
        >
          <Building2 size={18} />
          <span>Tùy biến Phòng</span>
          <span className="nav-badge">{rooms.length} phòng</span>
        </button>

        <button
          className={`nav-item ${activeTab === 'SHIFT' ? 'active' : ''}`}
          onClick={() => setActiveTab('SHIFT')}
        >
          <Wallet size={18} />
          <span>Giao ca & Két tiền</span>
          {currentShift ? (
            <span className="nav-badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
              Ca mở
            </span>
          ) : (
            <span className="nav-badge" style={{ color: '#94a3b8' }}>Chưa mở</span>
          )}
        </button>

        <button
          className={`nav-item ${activeTab === 'FINANCE' ? 'active' : ''}`}
          onClick={() => setActiveTab('FINANCE')}
        >
          <BarChart3 size={18} />
          <span>Báo cáo Tài chính</span>
        </button>

        {hasPermission('VIEW_AUDIT_LOGS') && (
          <button
            className={`nav-item ${activeTab === 'AUDIT' ? 'active' : ''}`}
            onClick={() => setActiveTab('AUDIT')}
          >
            <ShieldAlert size={18} />
            <span>Audit Log Chống Thất Thoát</span>
          </button>
        )}

        {hasPermission('MANAGE_USERS') && (
          <button
            className={`nav-item ${activeTab === 'USERS' ? 'active' : ''}`}
            onClick={() => setActiveTab('USERS')}
          >
            <Users size={18} />
            <span>Phân quyền Nhân viên</span>
          </button>
        )}
      </nav>

      {/* User Switcher Footer */}
      {currentUser && (
        <div className="user-profile-badge" onClick={onOpenUserSwitch} title="Nhấp để đổi tài khoản / kiểm tra phân quyền">
          <div className="user-avatar">{currentUser.avatar || '👤'}</div>
          <div className="user-info">
            <div className="user-name">{currentUser.fullName}</div>
            <div className={`user-role-tag role-${currentUser.role}`}>{currentUser.role}</div>
          </div>
          <LogOut size={15} style={{ color: 'var(--text-dim)' }} />
        </div>
      )}
    </aside>
  );
};
