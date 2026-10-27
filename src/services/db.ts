import { AuditLogEntry, User } from '../types/auth';
import { Booking, Invoice, ServiceItem } from '../types/booking';
import { Expense, Shift } from '../types/finance';
import { PricingPlan } from '../types/pricing';
import { Amenity, Room, RoomType, Zone } from '../types/room';

const STORAGE_KEY = 'hotel_manager_pms_database_v1';

export interface DatabaseState {
  users: User[];
  currentUser: User | null;
  zones: Zone[];
  roomTypes: RoomType[];
  amenities: Amenity[];
  rooms: Room[];
  pricingPlans: PricingPlan[];
  services: ServiceItem[];
  bookings: Booking[];
  invoices: Invoice[];
  expenses: Expense[];
  shifts: Shift[];
  currentShift: Shift | null;
  auditLogs: AuditLogEntry[];
}

export const INITIAL_USERS: User[] = [
  {
    id: 'user_admin',
    username: 'admin',
    fullName: 'Nguyễn Văn Chủ (Chủ Khách Sạn)',
    role: 'ADMIN',
    phone: '0901234567',
    isActive: true,
    avatar: '👑',
    createdAt: '2026-01-01',
  },
  {
    id: 'user_manager',
    username: 'quanly',
    fullName: 'Trần Thị Thu (Quản Lý Cơ Sở)',
    role: 'MANAGER',
    phone: '0912345678',
    isActive: true,
    avatar: '👔',
    createdAt: '2026-01-15',
  },
  {
    id: 'user_cashier',
    username: 'letan',
    fullName: 'Lê Hoàng Nam (Lễ Tân Ca Sáng)',
    role: 'RECEPTIONIST',
    phone: '0987654321',
    isActive: true,
    avatar: '🛎️',
    createdAt: '2026-02-01',
  },
  {
    id: 'user_housekeeping',
    username: 'buongphong',
    fullName: 'Phạm Thị Lan (Tổ Buồng Phòng)',
    role: 'HOUSEKEEPING',
    phone: '0933221100',
    isActive: true,
    avatar: '🧹',
    createdAt: '2026-02-10',
  },
];

export const INITIAL_ZONES: Zone[] = [
  { id: 'zone_1', name: 'Tầng 1 - Sảnh & Tiêu Chuẩn', order: 1 },
  { id: 'zone_2', name: 'Tầng 2 - Theme Love & VIP', order: 2 },
  { id: 'zone_3', name: 'Tầng 3 - Căn Hộ & Ban Công', order: 3 },
  { id: 'zone_4', name: 'Khu Bungalow Sân Vườn', order: 4 },
];

export const INITIAL_AMENITIES: Amenity[] = [
  { id: 'am_jacuzzi', name: 'Bồn sục Jacuzzi', icon: '🛁' },
  { id: 'am_tantra', name: 'Ghế tình yêu Tantra', icon: '🛋️' },
  { id: 'am_smarttv', name: 'Smart TV 65" 4K', icon: '📺' },
  { id: 'am_balcony', name: 'Ban công ngắm cảnh', icon: '🌅' },
  { id: 'am_kitchen', name: 'Bếp nấu mini', icon: '🍳' },
  { id: 'am_bathtub', name: 'Bồn tắm nằm thảo mộc', icon: '🧴' },
  { id: 'am_ac', name: 'Điều hòa 2 chiều Daikin', icon: '❄️' },
  { id: 'am_fridge', name: 'Tủ lạnh minibar', icon: '🧊' },
];

export const INITIAL_ROOM_TYPES: RoomType[] = [
  {
    id: 'rt_std_single',
    name: 'Phòng Tiêu Chuẩn Đơn (1 Giường 1m6)',
    category: 'STANDARD',
    description: 'Thích hợp cho 1-2 khách nghỉ ngơi tiện lợi, thoáng mát.',
    baseAdults: 2,
    baseChildren: 1,
    maxOccupancy: 3,
    defaultPricingPlanId: 'plan_standard_weekday',
  },
  {
    id: 'rt_vip_theme',
    name: 'Phòng VIP Tình Nhân (Love Theme Romance)',
    category: 'THEME_LOVE',
    description: 'Trang bị ghế Tantra, bồn sục Jacuzzi kính, trần ánh sao lãng mạn.',
    baseAdults: 2,
    baseChildren: 0,
    maxOccupancy: 2,
    defaultPricingPlanId: 'plan_vip_luxury',
  },
  {
    id: 'rt_studio_family',
    name: 'Căn Hộ Studio Gia Đình (Có Bếp)',
    category: 'STUDIO_FAMILY',
    description: 'Gồm 2 giường đôi, bếp nấu ăn gia đình, view sân vườn.',
    baseAdults: 4,
    baseChildren: 2,
    maxOccupancy: 6,
    defaultPricingPlanId: 'plan_family_condo',
  },
  {
    id: 'rt_dorm_bunk',
    name: 'Phòng Tập Thể Giường Tầng (Dorm)',
    category: 'DORM',
    description: 'Phòng 6 giường riêng biệt, tủ đồ thông minh.',
    baseAdults: 6,
    baseChildren: 0,
    maxOccupancy: 6,
    defaultPricingPlanId: 'plan_standard_weekday',
  },
];

export const INITIAL_PRICING_PLANS: PricingPlan[] = [
  {
    id: 'plan_standard_weekday',
    name: 'Bảng Giá Tiêu Chuẩn Ngày Thường (T2 - T5)',
    roomTypeId: 'rt_std_single',
    isDefault: true,
    applicableDays: [1, 2, 3, 4],
    hourlyRate: {
      firstBlockHours: 2,
      firstBlockPrice: 140000,
      nextHourPrice: 40000,
      gracePeriodMinutes: 15,
      roundingIntervalMinutes: 30,
    },
    overnightRate: {
      enabled: true,
      checkInFrom: '21:30',
      checkOutUntil: '11:00',
      flatPrice: 380000,
      earlyCheckInHourlyFee: 40000,
      lateCheckOutHourlyFee: 50000,
    },
    dailyRate: {
      enabled: true,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      pricePerDay: 550000,
      earlyCheckInHourlyFee: 40000,
      lateCheckOutHourlyFee: 50000,
    },
    surcharges: {
      standardAdultCount: 2,
      standardChildCount: 1,
      extraAdultFee: 80000,
      extraChildFee: 40000,
    },
    createdAt: '2026-01-01',
  },
  {
    id: 'plan_vip_luxury',
    name: 'Bảng Giá VIP Romance & Jacuzzi (Đặc Biệt)',
    roomTypeId: 'rt_vip_theme',
    isDefault: false,
    applicableDays: [0, 1, 2, 3, 4, 5, 6],
    hourlyRate: {
      firstBlockHours: 2,
      firstBlockPrice: 260000,
      nextHourPrice: 80000,
      gracePeriodMinutes: 15,
      roundingIntervalMinutes: 30,
    },
    overnightRate: {
      enabled: true,
      checkInFrom: '21:00',
      checkOutUntil: '11:30',
      flatPrice: 650000,
      earlyCheckInHourlyFee: 70000,
      lateCheckOutHourlyFee: 80000,
    },
    dailyRate: {
      enabled: true,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      pricePerDay: 950000,
      earlyCheckInHourlyFee: 80000,
      lateCheckOutHourlyFee: 80000,
    },
    surcharges: {
      standardAdultCount: 2,
      standardChildCount: 0,
      extraAdultFee: 150000,
      extraChildFee: 80000,
    },
    createdAt: '2026-01-01',
  },
  {
    id: 'plan_family_condo',
    name: 'Bảng Giá Căn Hộ Gia Đình Studio',
    roomTypeId: 'rt_studio_family',
    isDefault: false,
    applicableDays: [0, 1, 2, 3, 4, 5, 6],
    hourlyRate: {
      firstBlockHours: 3,
      firstBlockPrice: 450000,
      nextHourPrice: 100000,
      gracePeriodMinutes: 20,
      roundingIntervalMinutes: 30,
    },
    overnightRate: {
      enabled: true,
      checkInFrom: '20:00',
      checkOutUntil: '12:00',
      flatPrice: 1100000,
      earlyCheckInHourlyFee: 90000,
      lateCheckOutHourlyFee: 90000,
    },
    dailyRate: {
      enabled: true,
      checkInTime: '14:00',
      checkOutTime: '12:00',
      pricePerDay: 1600000,
      earlyCheckInHourlyFee: 90000,
      lateCheckOutHourlyFee: 90000,
    },
    surcharges: {
      standardAdultCount: 4,
      standardChildCount: 2,
      extraAdultFee: 120000,
      extraChildFee: 60000,
    },
    createdAt: '2026-01-01',
  },
];

export const INITIAL_SERVICES: ServiceItem[] = [
  { id: 'srv_water', name: 'Nước suối Lavie 500ml', category: 'BEVERAGE', costPrice: 4000, salePrice: 15000, unit: 'chai', stockQuantity: 120 },
  { id: 'srv_redbull', name: 'Bò húc Red Bull Thái', category: 'BEVERAGE', costPrice: 9000, salePrice: 25000, unit: 'lon', stockQuantity: 45 },
  { id: 'srv_coke', name: 'Coca-Cola lon', category: 'BEVERAGE', costPrice: 7000, salePrice: 20000, unit: 'lon', stockQuantity: 60 },
  { id: 'srv_beer', name: 'Bia Heineken Silver', category: 'BEVERAGE', costPrice: 18000, salePrice: 35000, unit: 'lon', stockQuantity: 50 },
  { id: 'srv_noodle', name: 'Mì Hảo Hảo Tôm Chua Cay', category: 'FOOD', costPrice: 4500, salePrice: 20000, unit: 'tô', stockQuantity: 30 },
  { id: 'srv_laundry', name: 'Giặt sấy quần áo lấy ngay', category: 'LAUNDRY', costPrice: 15000, salePrice: 40000, unit: 'kg', stockQuantity: 999 },
];

export const INITIAL_ROOMS: Room[] = [
  // Tầng 1
  {
    id: 'room_101',
    roomNumber: '101',
    zoneId: 'zone_1',
    roomTypeId: 'rt_std_single',
    status: 'AVAILABLE',
    amenityIds: ['am_ac', 'am_smarttv', 'am_fridge'],
    floorLevel: 1,
  },
  {
    id: 'room_102',
    roomNumber: '102',
    zoneId: 'zone_1',
    roomTypeId: 'rt_std_single',
    status: 'OCCUPIED',
    currentBookingId: 'bk_active_102',
    amenityIds: ['am_ac', 'am_smarttv', 'am_fridge'],
    floorLevel: 1,
  },
  {
    id: 'room_103',
    roomNumber: '103',
    zoneId: 'zone_1',
    roomTypeId: 'rt_std_single',
    status: 'DIRTY',
    cleanNotes: 'Khách vừa checkout, cần thay ga gối và khử khuẩn',
    amenityIds: ['am_ac', 'am_fridge'],
    floorLevel: 1,
  },
  // Tầng 2
  {
    id: 'room_201',
    roomNumber: 'VIP-201',
    zoneId: 'zone_2',
    roomTypeId: 'rt_vip_theme',
    status: 'OCCUPIED',
    currentBookingId: 'bk_active_201',
    amenityIds: ['am_jacuzzi', 'am_tantra', 'am_smarttv', 'am_ac', 'am_fridge'],
    floorLevel: 2,
  },
  {
    id: 'room_202',
    roomNumber: 'VIP-202',
    zoneId: 'zone_2',
    roomTypeId: 'rt_vip_theme',
    status: 'AVAILABLE',
    amenityIds: ['am_jacuzzi', 'am_tantra', 'am_smarttv', 'am_ac', 'am_fridge'],
    floorLevel: 2,
  },
  {
    id: 'room_203',
    roomNumber: 'VIP-203',
    zoneId: 'zone_2',
    roomTypeId: 'rt_vip_theme',
    status: 'MAINTENANCE',
    maintenanceReason: 'Bảo trì bồn Jacuzzi bị rò nước gioăng cao su',
    amenityIds: ['am_jacuzzi', 'am_tantra'],
    floorLevel: 2,
  },
  // Tầng 3
  {
    id: 'room_301',
    roomNumber: 'Penthouse-301',
    zoneId: 'zone_3',
    roomTypeId: 'rt_studio_family',
    status: 'AVAILABLE',
    amenityIds: ['am_kitchen', 'am_balcony', 'am_bathtub', 'am_smarttv', 'am_ac'],
    floorLevel: 3,
  },
  {
    id: 'room_302',
    roomNumber: 'Condo-302',
    zoneId: 'zone_3',
    roomTypeId: 'rt_studio_family',
    status: 'RESERVED',
    amenityIds: ['am_kitchen', 'am_balcony', 'am_smarttv', 'am_ac'],
    floorLevel: 3,
  },
  // Bungalow
  {
    id: 'room_401',
    roomNumber: 'Bungalow Hoa Sen',
    zoneId: 'zone_4',
    roomTypeId: 'rt_vip_theme',
    status: 'AVAILABLE',
    amenityIds: ['am_balcony', 'am_bathtub', 'am_smarttv', 'am_ac'],
    floorLevel: 1,
  },
];

// Active Bookings for room 102 and 201
const twoHoursAgo = new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString();
const oneHourAgo = new Date(Date.now() - 1.2 * 60 * 60 * 1000).toISOString();

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk_active_102',
    roomId: 'room_102',
    roomNumber: '102',
    customerName: 'Hoàng Quốc Dũng',
    customerPhone: '0978112233',
    idCardNumber: '001298004123',
    bookingType: 'HOURLY',
    checkInTime: twoHoursAgo,
    adultCount: 2,
    childCount: 0,
    depositAmount: 200000,
    services: [
      { id: 'srv_u_1', serviceId: 'srv_water', serviceName: 'Nước suối Lavie 500ml', quantity: 2, unitPrice: 15000, totalPrice: 30000, addedAt: twoHoursAgo },
      { id: 'srv_u_2', serviceId: 'srv_redbull', serviceName: 'Bò húc Red Bull Thái', quantity: 1, unitPrice: 25000, totalPrice: 25000, addedAt: twoHoursAgo },
    ],
    pricingPlanId: 'plan_standard_weekday',
    status: 'ACTIVE',
    createdByUserId: 'user_cashier',
  },
  {
    id: 'bk_active_201',
    roomId: 'room_201',
    roomNumber: 'VIP-201',
    customerName: 'Đặng Minh Châu',
    customerPhone: '0912998877',
    idCardNumber: '034299001552',
    bookingType: 'HOURLY',
    checkInTime: oneHourAgo,
    adultCount: 2,
    childCount: 0,
    depositAmount: 500000,
    services: [
      { id: 'srv_u_3', serviceId: 'srv_beer', serviceName: 'Bia Heineken Silver', quantity: 2, unitPrice: 35000, totalPrice: 70000, addedAt: oneHourAgo },
    ],
    pricingPlanId: 'plan_vip_luxury',
    status: 'ACTIVE',
    createdByUserId: 'user_cashier',
  },
];

export const INITIAL_CURRENT_SHIFT: Shift = {
  id: 'shift_today_morning',
  shiftCode: 'CA-20261027-01',
  cashierUserId: 'user_cashier',
  cashierName: 'Lê Hoàng Nam',
  startTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  initialCash: 1500000, // 1.5M vốn đầu két
  totalCashCollected: 780000,
  totalTransferCollected: 1250000,
  totalCashSpent: 120000, // Chi tiền đá lạnh và nước
  theoreticalCash: 2160000, // 1.5M + 780k - 120k
  status: 'OPEN',
};

// Past Invoices for reports (Tháng 10, Tháng 9, Tháng 8)
export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_1001',
    invoiceCode: 'HD-20261025-01',
    bookingId: 'bk_old_1',
    roomId: 'room_101',
    roomNumber: '101',
    customerName: 'Trần Văn Mạnh',
    bookingType: 'HOURLY',
    checkInTime: '2026-10-25T10:00:00',
    checkOutTime: '2026-10-25T13:30:00',
    durationFormatted: '3 giờ 30 phút',
    roomAmount: 220000,
    serviceAmount: 45000,
    surchargeAmount: 0,
    discountAmount: 0,
    depositDeducted: 100000,
    totalAmount: 265000,
    paymentMethod: 'CASH',
    shiftId: 'shift_old_1',
    cashierUserId: 'user_cashier',
    cashierName: 'Lê Hoàng Nam',
    createdAt: '2026-10-25T13:35:00',
  },
  {
    id: 'inv_1002',
    invoiceCode: 'HD-20261025-02',
    bookingId: 'bk_old_2',
    roomId: 'room_201',
    roomNumber: 'VIP-201',
    customerName: 'Nguyễn Thành Luân',
    bookingType: 'OVERNIGHT',
    checkInTime: '2026-10-24T22:00:00',
    checkOutTime: '2026-10-25T11:00:00',
    durationFormatted: 'Qua đêm',
    roomAmount: 650000,
    serviceAmount: 120000,
    surchargeAmount: 0,
    discountAmount: 50000,
    discountReason: 'Khách hàng thân thiết',
    depositDeducted: 300000,
    totalAmount: 720000,
    paymentMethod: 'VIETQR_TRANSFER',
    shiftId: 'shift_old_1',
    cashierUserId: 'user_cashier',
    cashierName: 'Lê Hoàng Nam',
    createdAt: '2026-10-25T11:05:00',
  },
  {
    id: 'inv_1003',
    invoiceCode: 'HD-20261026-03',
    bookingId: 'bk_old_3',
    roomId: 'room_301',
    roomNumber: 'Penthouse-301',
    customerName: 'Gia đình chị Thu Hà',
    bookingType: 'DAILY',
    checkInTime: '2026-10-24T14:00:00',
    checkOutTime: '2026-10-26T12:00:00',
    durationFormatted: '2 ngày',
    roomAmount: 3200000,
    serviceAmount: 240000,
    surchargeAmount: 120000,
    discountAmount: 100000,
    depositDeducted: 1000000,
    totalAmount: 3460000,
    paymentMethod: 'VIETQR_TRANSFER',
    shiftId: 'shift_old_2',
    cashierUserId: 'user_manager',
    cashierName: 'Trần Thị Thu',
    createdAt: '2026-10-26T12:15:00',
  },
  // Thêm các hóa đơn tháng 9 và tháng 8
  {
    id: 'inv_0901',
    invoiceCode: 'HD-20260920-01',
    bookingId: 'bk_old_09',
    roomId: 'room_101',
    roomNumber: '101',
    customerName: 'Vũ Đình Toàn',
    bookingType: 'DAILY',
    checkInTime: '2026-09-18T14:00:00',
    checkOutTime: '2026-09-20T12:00:00',
    durationFormatted: '2 ngày',
    roomAmount: 1100000,
    serviceAmount: 85000,
    surchargeAmount: 0,
    discountAmount: 0,
    depositDeducted: 500000,
    totalAmount: 1185000,
    paymentMethod: 'CASH',
    shiftId: 'shift_sep',
    cashierUserId: 'user_cashier',
    cashierName: 'Lê Hoàng Nam',
    createdAt: '2026-09-20T12:05:00',
  },
  {
    id: 'inv_0902',
    invoiceCode: 'HD-20260928-02',
    bookingId: 'bk_old_10',
    roomId: 'room_201',
    roomNumber: 'VIP-201',
    customerName: 'Phạm Đức Duy',
    bookingType: 'DAILY',
    checkInTime: '2026-09-25T14:00:00',
    checkOutTime: '2026-09-28T12:00:00',
    durationFormatted: '3 ngày',
    roomAmount: 2850000,
    serviceAmount: 310000,
    surchargeAmount: 0,
    discountAmount: 150000,
    depositDeducted: 1000000,
    totalAmount: 3010000,
    paymentMethod: 'VIETQR_TRANSFER',
    shiftId: 'shift_sep',
    cashierUserId: 'user_manager',
    cashierName: 'Trần Thị Thu',
    createdAt: '2026-09-28T12:10:00',
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp_01',
    category: 'MINIBAR_STOCK',
    categoryLabel: 'Nhập hàng Minibar đại lý',
    amount: 1850000,
    date: '2026-10-10',
    time: '09:30',
    description: 'Nhập 5 thùng nước Lavie, 3 thùng bò húc, 2 thùng bia',
    createdByUserId: 'user_manager',
    isOperatingExpense: false, // COGS
  },
  {
    id: 'exp_02',
    category: 'LAUNDRY_EXTERNAL',
    categoryLabel: 'Giặt ủi chăn ga gối ngoài',
    amount: 1200000,
    date: '2026-10-15',
    time: '15:00',
    description: 'Thanh toán tiền giặt đồ đợt 1 tháng 10',
    createdByUserId: 'user_manager',
    isOperatingExpense: false, // COGS
  },
  {
    id: 'exp_03',
    category: 'ELECTRICITY',
    categoryLabel: 'Tiền điện EVN',
    amount: 4850000,
    date: '2026-10-05',
    time: '10:00',
    description: 'Hóa đơn tiền điện kỳ tháng 09/2026',
    createdByUserId: 'user_admin',
    isOperatingExpense: true,
  },
  {
    id: 'exp_04',
    category: 'WATER',
    categoryLabel: 'Tiền nước sinh hoạt',
    amount: 820000,
    date: '2026-10-06',
    time: '11:00',
    description: 'Tiền nước máy sinh hoạt khách sạn',
    createdByUserId: 'user_admin',
    isOperatingExpense: true,
  },
  {
    id: 'exp_05',
    category: 'SALARY',
    categoryLabel: 'Lương nhân viên tháng 9',
    amount: 18500000,
    date: '2026-10-05',
    time: '16:00',
    description: 'Lương 2 lễ tân + 1 buồng phòng',
    createdByUserId: 'user_admin',
    isOperatingExpense: true,
  },
  {
    id: 'exp_06',
    category: 'OTHER',
    categoryLabel: 'Chi lặt vặt quầy ca sáng',
    amount: 120000,
    date: '2026-10-27',
    time: '10:15',
    description: 'Mua đá lạnh + túi rác quầy lễ tân',
    shiftId: 'shift_today_morning',
    createdByUserId: 'user_cashier',
    isOperatingExpense: true,
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit_1',
    timestamp: '2026-10-27T08:00:00',
    userId: 'user_cashier',
    userName: 'Lê Hoàng Nam',
    userRole: 'RECEPTIONIST',
    action: 'LOGIN',
    entityType: 'AUTH',
    entityId: 'shift_today_morning',
    details: 'Đăng nhập vào hệ thống và bắt đầu ca sáng',
  },
  {
    id: 'audit_2',
    timestamp: '2026-10-27T08:05:00',
    userId: 'user_cashier',
    userName: 'Lê Hoàng Nam',
    userRole: 'RECEPTIONIST',
    action: 'CHECK_IN',
    entityType: 'BOOKING',
    entityId: 'bk_active_102',
    details: 'Nhận phòng 102 cho khách Hoàng Quốc Dũng - Hình thức theo giờ',
  },
];

export class DatabaseService {
  public static load(): DatabaseState {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load database from localStorage', e);
    }

    const initialState: DatabaseState = {
      users: INITIAL_USERS,
      currentUser: INITIAL_USERS[0], // Default logged in as Admin for full immediate exploration
      zones: INITIAL_ZONES,
      roomTypes: INITIAL_ROOM_TYPES,
      amenities: INITIAL_AMENITIES,
      rooms: INITIAL_ROOMS,
      pricingPlans: INITIAL_PRICING_PLANS,
      services: INITIAL_SERVICES,
      bookings: INITIAL_BOOKINGS,
      invoices: INITIAL_INVOICES,
      expenses: INITIAL_EXPENSES,
      shifts: [INITIAL_CURRENT_SHIFT],
      currentShift: INITIAL_CURRENT_SHIFT,
      auditLogs: INITIAL_AUDIT_LOGS,
    };

    this.save(initialState);
    return initialState;
  }

  public static save(state: DatabaseState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save database to localStorage', e);
    }
  }

  public static resetToDefault(): DatabaseState {
    localStorage.removeItem(STORAGE_KEY);
    return this.load();
  }
}
