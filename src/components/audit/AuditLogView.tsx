import React from 'react';
import { ShieldAlert, Clock, User, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useAuth();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>Nhật Ký Hệ Thống & Kiểm Soát Thất Thoát (Audit Trail)</h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
          Toàn bộ thao tác nhạy cảm (Đổi giá, Giảm giá, Hủy phòng, Xuất bill, Đóng ca) được ghi nhận bất biến
        </p>
      </div>

      <div className="table-wrapper">
        <table className="modern-table">
          <thead>
            <tr>
              <th style={{ width: 170 }}>Thời Gian</th>
              <th>Nhân Viên</th>
              <th>Vai Trò</th>
              <th>Hành Động</th>
              <th>Chi Tiết Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {auditLogs.map((log) => (
              <tr key={log.id}>
                <td style={{ fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                  {new Date(log.timestamp).toLocaleString('vi-VN')}
                </td>
                <td>
                  <strong style={{ color: '#fff' }}>{log.userName}</strong>
                </td>
                <td>
                  <span className={`user-role-tag role-${log.userRole}`}>{log.userRole}</span>
                </td>
                <td>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 4,
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--gold-400)',
                    }}
                  >
                    {log.action}
                  </span>
                </td>
                <td style={{ fontSize: 13, color: '#e2e8f0' }}>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
