import { BookingType } from './pricing';

export interface ServiceItem {
  id: string;
  name: string;
  category: 'MINIBAR' | 'BEVERAGE' | 'FOOD' | 'LAUNDRY' | 'OTHER';
  costPrice: number;     // Giá vốn nhập hàng
  salePrice: number;     // Giá bán cho khách
  unit: string;          // "chai", "lon", "gói", "bộ"
  stockQuantity: number;
}

export interface BookingServiceUsage {
  id: string;
  serviceId: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  addedAt: string;
}

export interface Booking {
  id: string;
  roomId: string;
  roomNumber: string;
  customerName: string;
  customerPhone?: string;
  idCardNumber?: string;
  bookingType: BookingType;
  checkInTime: string;          // ISO string
  expectedCheckOutTime?: string;
  actualCheckOutTime?: string;
  adultCount: number;
  childCount: number;
  depositAmount: number;
  services: BookingServiceUsage[];
  pricingPlanId: string;
  notes?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdByUserId: string;
}

export type PaymentMethod = 'CASH' | 'VIETQR_TRANSFER' | 'CARD';

export interface Invoice {
  id: string;
  invoiceCode: string;
  bookingId: string;
  roomId: string;
  roomNumber: string;
  customerName: string;
  bookingType: BookingType;
  checkInTime: string;
  checkOutTime: string;
  durationFormatted: string;
  roomAmount: number;
  serviceAmount: number;
  surchargeAmount: number;
  discountAmount: number;
  discountReason?: string;
  depositDeducted: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  shiftId: string;
  cashierUserId: string;
  cashierName: string;
  createdAt: string;
}
