export type UserRole = 'ADMIN' | 'MANAGER' | 'RECEPTIONIST' | 'HOUSEKEEPING';

export type PermissionCode =
  | 'ROOM_VIEW'
  | 'ROOM_EDIT'
  | 'ROOM_STATUS_CHANGE'
  | 'CHECK_IN'
  | 'CHECK_OUT'
  | 'DISCOUNT_APPLY'
  | 'CANCEL_BOOKING'
  | 'CHANGE_PRICE_PLAN'
  | 'VIEW_REVENUE'
  | 'VIEW_FINANCIAL_REPORTS'
  | 'MANAGE_USERS'
  | 'MANAGE_PRICING'
  | 'MANAGE_ROOMS'
  | 'MANAGE_SHIFTS'
  | 'VIEW_AUDIT_LOGS'
  | 'MANAGE_EXPENSES';

export interface User {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  isActive: boolean;
  avatar?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'LOGIN' | 'LOGOUT' | 'CHECK_IN' | 'CHECK_OUT' | 'CANCEL_BOOKING' | 'CHANGE_ROOM' | 'UPDATE_PRICE' | 'APPLY_DISCOUNT' | 'ADD_EXPENSE' | 'CLOSE_SHIFT' | 'CREATE_ROOM' | 'UPDATE_ROOM';
  entityType: 'BOOKING' | 'ROOM' | 'PRICING_PLAN' | 'SHIFT' | 'EXPENSE' | 'AUTH';
  entityId: string;
  details: string;
  oldValues?: any;
  newValues?: any;
}
