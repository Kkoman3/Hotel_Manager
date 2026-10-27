import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { HotelProvider, useHotel } from './context/HotelContext';
import { Sidebar, ActiveTab } from './components/common/Sidebar';
import { RoomMatrixGrid } from './components/rooms/RoomMatrixGrid';
import { CheckInModal } from './components/booking/CheckInModal';
import { CheckOutModal } from './components/booking/CheckOutModal';
import { AddServiceModal } from './components/booking/AddServiceModal';
import { ChangeRoomModal } from './components/booking/ChangeRoomModal';
import { PricingConfigModal } from './components/pricing/PricingConfigModal';
import { RoomConfigModal } from './components/rooms/RoomConfigModal';
import { ShiftHandoverView } from './components/shift/ShiftHandoverModal';
import { FinancialReportsView } from './components/finance/FinancialReportsView';
import { AuditLogView } from './components/audit/AuditLogView';
import { UserSwitchModal } from './components/auth/UserSwitchModal';
import { Room } from './types/room';
import { RotateCcw, Shield, Clock, Bell, User as UserIcon } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser } = useAuth();
  const { currentShift, resetDatabase } = useHotel();

  const [activeTab, setActiveTab] = useState<ActiveTab>('ROOMS');

  // Modals state
  const [checkInRoom, setCheckInRoom] = useState<Room | null>(null);
  const [checkOutBookingId, setCheckOutBookingId] = useState<string | null>(null);
  const [addServiceBookingId, setAddServiceBookingId] = useState<string | null>(null);
  const [changeRoomBookingId, setChangeRoomBookingId] = useState<string | null>(null);
  const [showUserSwitch, setShowUserSwitch] = useState<boolean>(false);

  const handleResetData = () => {
    if (confirm('Khôi phục dữ liệu mẫu ban đầu của khách sạn? Thao tác này sẽ đặt lại phòng và bảng giá về mặc định.')) {
      resetDatabase();
    }
  };

  return (
    <div className="app-layout">
      {/* Left Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenUserSwitch={() => setShowUserSwitch(true)}
      />

      {/* Main Content Area */}
      <div className="main-wrapper">
        {/* Top Navbar */}
        <header className="top-navbar">
          <div className="page-title">
            <h2>
              {activeTab === 'ROOMS' && 'Sơ Đồ Ma Trận Phòng (Room Grid Matrix)'}
              {activeTab === 'PRICING' && 'Cấu Hình Bảng Giá Động (Dynamic Pricing Plans)'}
              {activeTab === 'ROOM_CONFIG' && 'Tùy Biến Phòng & Mục Đích Sử Dụng'}
              {activeTab === 'SHIFT' && 'Quản Lý Ca Trực & Bàn Giao Két Tiền'}
              {activeTab === 'FINANCE' && 'Báo Cáo Tài Chính P&L (Tháng / Quý / Năm)'}
              {activeTab === 'AUDIT' && 'Nhật Ký Hệ Thống (Audit Logs)'}
              {activeTab === 'USERS' && 'Phân Quyền & Quản Lý Nhân Sự'}
            </h2>
          </div>

          <div className="top-actions">
            {/* Shift indicator */}
            {currentShift ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '5px 12px', borderRadius: 999 }}>
                <Clock size={13} />
                <span>Ca: <strong>{currentShift.shiftCode}</strong> ({currentShift.cashierName})</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', color: '#fde047', padding: '5px 12px', borderRadius: 999 }}>
                <Clock size={13} />
                <span>Chưa có ca trực mở</span>
              </div>
            )}

            {/* Role switch button */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setShowUserSwitch(true)}
              title="Đổi vai trò để thử nghiệm phân quyền"
            >
              <Shield size={14} style={{ color: 'var(--gold-400)' }} />
              <span>{currentUser?.fullName} ({currentUser?.role})</span>
            </button>

            {/* Reset mock database */}
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleResetData}
              title="Khôi phục dữ liệu mẫu ban đầu"
            >
              <RotateCcw size={13} />
              <span>Đặt lại CSDL</span>
            </button>
          </div>
        </header>

        {/* Body View */}
        <main className="content-body">
          {activeTab === 'ROOMS' && (
            <RoomMatrixGrid
              onCheckIn={(room) => setCheckInRoom(room)}
              onCheckOut={(bookingId) => setCheckOutBookingId(bookingId)}
              onAddService={(bookingId) => setAddServiceBookingId(bookingId)}
              onChangeRoom={(bookingId) => setChangeRoomBookingId(bookingId)}
              onOpenCreateRoom={() => setActiveTab('ROOM_CONFIG')}
            />
          )}

          {activeTab === 'PRICING' && <PricingConfigModal />}

          {activeTab === 'ROOM_CONFIG' && <RoomConfigModal />}

          {activeTab === 'SHIFT' && <ShiftHandoverView />}

          {activeTab === 'FINANCE' && <FinancialReportsView />}

          {activeTab === 'AUDIT' && <AuditLogView />}

          {activeTab === 'USERS' && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#fff' }}>Ma Trận Phân Quyền Vai Trò (Role & Permissions Matrix)</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
                Hệ thống kiểm soát chặt chẽ quyền hạn của từng nhóm nhân viên trong khách sạn
              </p>

              <div className="table-wrapper">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Quyền Hạn Hệ Thống</th>
                      <th style={{ textAlign: 'center' }}>Chủ (ADMIN)</th>
                      <th style={{ textAlign: 'center' }}>Quản Lý (MANAGER)</th>
                      <th style={{ textAlign: 'center' }}>Lễ Tân (RECEPTIONIST)</th>
                      <th style={{ textAlign: 'center' }}>Buồng Phòng (HOUSEKEEPING)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Check-in / Check-out / Thu ngân</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                      <td style={{ textAlign: 'center' }}>❌</td>
                    </tr>
                    <tr>
                      <td>Thêm Dịch Vụ & Minibar</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                      <td style={{ textAlign: 'center' }}>❌</td>
                    </tr>
                    <tr>
                      <td>Cập nhật phòng Sạch / Dọn dẹp</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                    </tr>
                    <tr>
                      <td>Áp dụng Giảm giá (%)</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                      <td style={{ textAlign: 'center' }}>Tối đa 5%</td>
                      <td style={{ textAlign: 'center' }}>❌</td>
                    </tr>
                    <tr>
                      <td>Mở / Đóng ca trực & Bàn giao két</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                      <td style={{ textAlign: 'center' }}>❌</td>
                    </tr>
                    <tr>
                      <td>Tùy biến Phòng & Tiện nghi</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                      <td style={{ textAlign: 'center' }}>❌</td>
                      <td style={{ textAlign: 'center' }}>❌</td>
                    </tr>
                    <tr>
                      <td>Thiết lập Bảng giá Động</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                      <td style={{ textAlign: 'center' }}>❌</td>
                      <td style={{ textAlign: 'center' }}>❌</td>
                    </tr>
                    <tr>
                      <td>Xem Báo cáo Doanh thu & Lãi/Lỗ P&L</td>
                      <td style={{ textAlign: 'center' }}>✅ (Toàn bộ)</td>
                      <td style={{ textAlign: 'center' }}>Doanh thu</td>
                      <td style={{ textAlign: 'center' }}>❌</td>
                      <td style={{ textAlign: 'center' }}>❌</td>
                    </tr>
                    <tr>
                      <td>Xem Audit Logs (Chống gian lận)</td>
                      <td style={{ textAlign: 'center' }}>✅</td>
                      <td style={{ textAlign: 'center' }}>❌</td>
                      <td style={{ textAlign: 'center' }}>❌</td>
                      <td style={{ textAlign: 'center' }}>❌</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      {checkInRoom && (
        <CheckInModal
          room={checkInRoom}
          onClose={() => setCheckInRoom(null)}
        />
      )}

      {checkOutBookingId && (
        <CheckOutModal
          bookingId={checkOutBookingId}
          onClose={() => setCheckOutBookingId(null)}
        />
      )}

      {addServiceBookingId && (
        <AddServiceModal
          bookingId={addServiceBookingId}
          onClose={() => setAddServiceBookingId(null)}
        />
      )}

      {changeRoomBookingId && (
        <ChangeRoomModal
          bookingId={changeRoomBookingId}
          onClose={() => setChangeRoomBookingId(null)}
        />
      )}

      {showUserSwitch && (
        <UserSwitchModal onClose={() => setShowUserSwitch(false)} />
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <HotelProvider>
        <AppContent />
      </HotelProvider>
    </AuthProvider>
  );
}

export default App;
