import React, { createContext, useContext, useState, useEffect } from 'react';
import { PermissionCode, User, UserRole, AuditLogEntry } from '../types/auth';
import { DatabaseService } from '../services/db';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string) => boolean;
  logout: () => void;
  switchUser: (userId: string) => void;
  hasPermission: (permission: PermissionCode) => boolean;
  logAuditAction: (
    action: AuditLogEntry['action'],
    entityType: AuditLogEntry['entityType'],
    entityId: string,
    details: string,
    oldValues?: any,
    newValues?: any
  ) => void;
  auditLogs: AuditLogEntry[];
}

const ROLE_PERMISSIONS: Record<UserRole, PermissionCode[]> = {
  ADMIN: [
    'ROOM_VIEW',
    'ROOM_EDIT',
    'ROOM_STATUS_CHANGE',
    'CHECK_IN',
    'CHECK_OUT',
    'DISCOUNT_APPLY',
    'CANCEL_BOOKING',
    'CHANGE_PRICE_PLAN',
    'VIEW_REVENUE',
    'VIEW_FINANCIAL_REPORTS',
    'MANAGE_USERS',
    'MANAGE_PRICING',
    'MANAGE_ROOMS',
    'MANAGE_SHIFTS',
    'VIEW_AUDIT_LOGS',
    'MANAGE_EXPENSES',
  ],
  MANAGER: [
    'ROOM_VIEW',
    'ROOM_EDIT',
    'ROOM_STATUS_CHANGE',
    'CHECK_IN',
    'CHECK_OUT',
    'DISCOUNT_APPLY',
    'CANCEL_BOOKING',
    'CHANGE_PRICE_PLAN',
    'VIEW_REVENUE',
    'MANAGE_PRICING',
    'MANAGE_ROOMS',
    'MANAGE_SHIFTS',
    'MANAGE_EXPENSES',
  ],
  RECEPTIONIST: [
    'ROOM_VIEW',
    'ROOM_STATUS_CHANGE',
    'CHECK_IN',
    'CHECK_OUT',
    'MANAGE_SHIFTS',
    'MANAGE_EXPENSES',
  ],
  HOUSEKEEPING: [
    'ROOM_VIEW',
    'ROOM_STATUS_CHANGE',
  ],
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState(() => DatabaseService.load());

  useEffect(() => {
    DatabaseService.save(db);
  }, [db]);

  const currentUser = db.currentUser;
  const users = db.users;

  const login = (username: string): boolean => {
    const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase() && u.isActive);
    if (!user) return false;
    
    const newAudit: AuditLogEntry = {
      id: 'audit_' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.fullName,
      userRole: user.role,
      action: 'LOGIN',
      entityType: 'AUTH',
      entityId: user.id,
      details: `${user.fullName} đăng nhập thành công vào hệ thống`,
    };

    setDb((prev) => ({
      ...prev,
      currentUser: user,
      auditLogs: [newAudit, ...prev.auditLogs],
    }));
    return true;
  };

  const logout = () => {
    if (currentUser) {
      const newAudit: AuditLogEntry = {
        id: 'audit_' + Date.now(),
        timestamp: new Date().toISOString(),
        userId: currentUser.id,
        userName: currentUser.fullName,
        userRole: currentUser.role,
        action: 'LOGOUT',
        entityType: 'AUTH',
        entityId: currentUser.id,
        details: `${currentUser.fullName} đăng xuất khỏi hệ thống`,
      };
      setDb((prev) => ({
        ...prev,
        currentUser: null,
        auditLogs: [newAudit, ...prev.auditLogs],
      }));
    }
  };

  const switchUser = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setDb((prev) => ({
        ...prev,
        currentUser: user,
      }));
    }
  };

  const hasPermission = (permission: PermissionCode): boolean => {
    if (!currentUser) return false;
    const permissions = ROLE_PERMISSIONS[currentUser.role] || [];
    return permissions.includes(permission);
  };

  const logAuditAction = (
    action: AuditLogEntry['action'],
    entityType: AuditLogEntry['entityType'],
    entityId: string,
    details: string,
    oldValues?: any,
    newValues?: any
  ) => {
    if (!currentUser) return;
    const newAudit: AuditLogEntry = {
      id: 'audit_' + Date.now() + Math.random().toString(36).substring(2, 5),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
      oldValues,
      newValues,
    };

    setDb((prev) => ({
      ...prev,
      auditLogs: [newAudit, ...prev.auditLogs],
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        switchUser,
        hasPermission,
        logAuditAction,
        auditLogs: db.auditLogs,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
