import React, { createContext, useContext, useState, useEffect } from 'react';
import { Booking, BookingServiceUsage, Invoice, PaymentMethod, ServiceItem } from '../types/booking';
import { Expense, Shift } from '../types/finance';
import { BookingType, PricingPlan } from '../types/pricing';
import { Amenity, Room, RoomStatus, RoomType, Zone } from '../types/room';
import { DatabaseService, DatabaseState } from '../services/db';
import { PricingEngine } from '../domain/pricingEngine';
import { useAuth } from './AuthContext';

interface HotelContextType {
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
  
  // Actions
  checkIn: (params: {
    roomId: string;
    customerName: string;
    customerPhone?: string;
    idCardNumber?: string;
    bookingType: BookingType;
    adultCount: number;
    childCount: number;
    depositAmount: number;
    pricingPlanId: string;
    notes?: string;
  }) => Booking;

  checkOut: (params: {
    bookingId: string;
    paymentMethod: PaymentMethod;
    discountAmount: number;
    discountReason?: string;
  }) => Invoice;

  addServiceToBooking: (bookingId: string, serviceId: string, quantity: number) => void;
  removeServiceFromBooking: (bookingId: string, usageId: string) => void;
  changeRoom: (bookingId: string, newRoomId: string) => void;
  setRoomStatus: (roomId: string, status: RoomStatus, notes?: string) => void;
  
  // Customization & Config
  createOrUpdateRoom: (room: Room) => void;
  createOrUpdatePricingPlan: (plan: PricingPlan) => void;
  deletePricingPlan: (planId: string) => void;
  createOrUpdateRoomType: (roomType: RoomType) => void;
  
  // Finance & Shift
  addExpense: (expense: Omit<Expense, 'id' | 'createdByUserId'>) => void;
  closeCurrentShift: (actualCashCounted: number, handoverNotes?: string) => Shift;
  openNewShift: (initialCash: number) => Shift;

  resetDatabase: () => void;
}

const HotelContext = createContext<HotelContextType | undefined>(undefined);

export const HotelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<DatabaseState>(() => DatabaseService.load());
  const { currentUser, logAuditAction } = useAuth();

  useEffect(() => {
    DatabaseService.save(db);
  }, [db]);

  const checkIn = (params: {
    roomId: string;
    customerName: string;
    customerPhone?: string;
    idCardNumber?: string;
    bookingType: BookingType;
    adultCount: number;
    childCount: number;
    depositAmount: number;
    pricingPlanId: string;
    notes?: string;
  }): Booking => {
    const room = db.rooms.find((r) => r.id === params.roomId);
    if (!room) throw new Error('Không tìm thấy phòng');

    const newBookingId = 'bk_' + Date.now();
    const newBooking: Booking = {
      id: newBookingId,
      roomId: room.id,
      roomNumber: room.roomNumber,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      idCardNumber: params.idCardNumber,
      bookingType: params.bookingType,
      checkInTime: new Date().toISOString(),
      adultCount: params.adultCount,
      childCount: params.childCount,
      depositAmount: params.depositAmount,
      services: [],
      pricingPlanId: params.pricingPlanId,
      notes: params.notes,
      status: 'ACTIVE',
      createdByUserId: currentUser?.id || 'unknown',
    };

    const updatedRooms = db.rooms.map((r) =>
      r.id === params.roomId
        ? { ...r, status: 'OCCUPIED' as RoomStatus, currentBookingId: newBookingId }
        : r
    );

    // Ghi nhận tiền cọc vào ca nếu có
    let updatedShift = db.currentShift;
    if (params.depositAmount > 0 && updatedShift) {
      updatedShift = {
        ...updatedShift,
        totalCashCollected: updatedShift.totalCashCollected + params.depositAmount,
        theoreticalCash: updatedShift.theoreticalCash + params.depositAmount,
      };
    }

    setDb((prev) => ({
      ...prev,
      rooms: updatedRooms,
      bookings: [newBooking, ...prev.bookings],
      currentShift: updatedShift,
    }));

    logAuditAction(
      'CHECK_IN',
      'BOOKING',
      newBookingId,
      `Nhận phòng ${room.roomNumber} cho khách ${params.customerName} (${params.bookingType})`
    );

    return newBooking;
  };

  const checkOut = (params: {
    bookingId: string;
    paymentMethod: PaymentMethod;
    discountAmount: number;
    discountReason?: string;
  }): Invoice => {
    const booking = db.bookings.find((b) => b.id === params.bookingId);
    if (!booking) throw new Error('Không tìm thấy thông tin đặt phòng');

    const room = db.rooms.find((r) => r.id === booking.roomId);
    const plan =
      db.pricingPlans.find((p) => p.id === booking.pricingPlanId) ||
      db.pricingPlans[0];

    const checkOutTime = new Date();
    const priceRes = PricingEngine.calculateStayPrice(
      booking.checkInTime,
      checkOutTime,
      booking.bookingType,
      plan,
      booking.adultCount,
      booking.childCount
    );

    // Tính tiền dịch vụ
    const serviceAmount = booking.services.reduce((sum, s) => sum + s.totalPrice, 0);
    const subTotal = priceRes.totalRoomAmount + serviceAmount - params.discountAmount;
    const finalPayment = Math.max(0, subTotal - (booking.depositAmount || 0));

    const invoiceId = 'inv_' + Date.now();
    const invoiceCode = `HD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

    const newInvoice: Invoice = {
      id: invoiceId,
      invoiceCode,
      bookingId: booking.id,
      roomId: booking.roomId,
      roomNumber: booking.roomNumber,
      customerName: booking.customerName,
      bookingType: booking.bookingType,
      checkInTime: booking.checkInTime,
      checkOutTime: checkOutTime.toISOString(),
      durationFormatted: priceRes.durationFormatted,
      roomAmount: priceRes.roomBaseAmount,
      serviceAmount,
      surchargeAmount: priceRes.surchargesAmount,
      discountAmount: params.discountAmount,
      discountReason: params.discountReason,
      depositDeducted: booking.depositAmount || 0,
      totalAmount: finalPayment,
      paymentMethod: params.paymentMethod,
      shiftId: db.currentShift?.id || 'none',
      cashierUserId: currentUser?.id || 'unknown',
      cashierName: currentUser?.fullName || 'Lễ tân',
      createdAt: checkOutTime.toISOString(),
    };

    // Cập nhật trạng thái phòng -> DIRTY (Chờ dọn dẹp)
    const updatedRooms = db.rooms.map((r) =>
      r.id === booking.roomId
        ? { ...r, status: 'DIRTY' as RoomStatus, currentBookingId: undefined, cleanNotes: 'Khách vừa trả phòng lúc ' + checkOutTime.toLocaleTimeString('vi-VN') }
        : r
    );

    // Cập nhật booking -> COMPLETED
    const updatedBookings = db.bookings.map((b) =>
      b.id === booking.id
        ? { ...b, status: 'COMPLETED' as const, actualCheckOutTime: checkOutTime.toISOString() }
        : b
    );

    // Cập nhật ca thu ngân
    let updatedShift = db.currentShift;
    if (updatedShift) {
      if (params.paymentMethod === 'CASH') {
        updatedShift = {
          ...updatedShift,
          totalCashCollected: updatedShift.totalCashCollected + finalPayment,
          theoreticalCash: updatedShift.theoreticalCash + finalPayment,
        };
      } else {
        updatedShift = {
          ...updatedShift,
          totalTransferCollected: updatedShift.totalTransferCollected + finalPayment,
        };
      }
    }

    setDb((prev) => ({
      ...prev,
      rooms: updatedRooms,
      bookings: updatedBookings,
      invoices: [newInvoice, ...prev.invoices],
      currentShift: updatedShift,
    }));

    logAuditAction(
      'CHECK_OUT',
      'BOOKING',
      booking.id,
      `Trả phòng ${booking.roomNumber} - Hóa đơn ${invoiceCode} - Tổng: ${finalPayment.toLocaleString('vi-VN')} đ (${params.paymentMethod})`
    );

    return newInvoice;
  };

  const addServiceToBooking = (bookingId: string, serviceId: string, quantity: number) => {
    const service = db.services.find((s) => s.id === serviceId);
    if (!service) return;

    const newUsage: BookingServiceUsage = {
      id: 'srv_u_' + Date.now(),
      serviceId: service.id,
      serviceName: service.name,
      quantity,
      unitPrice: service.salePrice,
      totalPrice: service.salePrice * quantity,
      addedAt: new Date().toISOString(),
    };

    const updatedBookings = db.bookings.map((b) => {
      if (b.id !== bookingId) return b;
      return {
        ...b,
        services: [...b.services, newUsage],
      };
    });

    setDb((prev) => ({
      ...prev,
      bookings: updatedBookings,
    }));
  };

  const removeServiceFromBooking = (bookingId: string, usageId: string) => {
    const updatedBookings = db.bookings.map((b) => {
      if (b.id !== bookingId) return b;
      return {
        ...b,
        services: b.services.filter((s) => s.id !== usageId),
      };
    });

    setDb((prev) => ({
      ...prev,
      bookings: updatedBookings,
    }));
  };

  const changeRoom = (bookingId: string, newRoomId: string) => {
    const booking = db.bookings.find((b) => b.id === bookingId);
    const newRoom = db.rooms.find((r) => r.id === newRoomId);
    if (!booking || !newRoom || newRoom.status !== 'AVAILABLE') return;

    const oldRoomId = booking.roomId;
    const oldRoomNumber = booking.roomNumber;

    const updatedRooms = db.rooms.map((r) => {
      if (r.id === oldRoomId) {
        return { ...r, status: 'DIRTY' as RoomStatus, currentBookingId: undefined, cleanNotes: 'Khách chuyển sang phòng ' + newRoom.roomNumber };
      }
      if (r.id === newRoomId) {
        return { ...r, status: 'OCCUPIED' as RoomStatus, currentBookingId: bookingId };
      }
      return r;
    });

    const updatedBookings = db.bookings.map((b) =>
      b.id === bookingId
        ? { ...b, roomId: newRoom.id, roomNumber: newRoom.roomNumber }
        : b
    );

    setDb((prev) => ({
      ...prev,
      rooms: updatedRooms,
      bookings: updatedBookings,
    }));

    logAuditAction(
      'CHANGE_ROOM',
      'BOOKING',
      bookingId,
      `Đổi phòng từ ${oldRoomNumber} sang ${newRoom.roomNumber}`
    );
  };

  const setRoomStatus = (roomId: string, status: RoomStatus, notes?: string) => {
    const updatedRooms = db.rooms.map((r) => {
      if (r.id !== roomId) return r;
      return {
        ...r,
        status,
        cleanNotes: status === 'DIRTY' ? notes || r.cleanNotes : undefined,
        maintenanceReason: status === 'MAINTENANCE' ? notes || r.maintenanceReason : undefined,
        currentBookingId: status === 'AVAILABLE' ? undefined : r.currentBookingId,
      };
    });

    setDb((prev) => ({
      ...prev,
      rooms: updatedRooms,
    }));
  };

  const createOrUpdateRoom = (room: Room) => {
    const exists = db.rooms.some((r) => r.id === room.id);
    const updatedRooms = exists
      ? db.rooms.map((r) => (r.id === room.id ? room : r))
      : [...db.rooms, room];

    setDb((prev) => ({
      ...prev,
      rooms: updatedRooms,
    }));

    logAuditAction(
      exists ? 'UPDATE_ROOM' : 'CREATE_ROOM',
      'ROOM',
      room.id,
      `${exists ? 'Cập nhật' : 'Thêm mới'} phòng ${room.roomNumber}`
    );
  };

  const createOrUpdatePricingPlan = (plan: PricingPlan) => {
    const exists = db.pricingPlans.some((p) => p.id === plan.id);
    const updatedPlans = exists
      ? db.pricingPlans.map((p) => (p.id === plan.id ? plan : p))
      : [...db.pricingPlans, plan];

    setDb((prev) => ({
      ...prev,
      pricingPlans: updatedPlans,
    }));

    logAuditAction(
      'UPDATE_PRICE',
      'PRICING_PLAN',
      plan.id,
      `${exists ? 'Cập nhật' : 'Thêm mới'} bảng giá: ${plan.name}`
    );
  };

  const deletePricingPlan = (planId: string) => {
    setDb((prev) => ({
      ...prev,
      pricingPlans: prev.pricingPlans.filter((p) => p.id !== planId),
    }));
  };

  const createOrUpdateRoomType = (roomType: RoomType) => {
    const exists = db.roomTypes.some((rt) => rt.id === roomType.id);
    const updatedTypes = exists
      ? db.roomTypes.map((rt) => (rt.id === roomType.id ? roomType : rt))
      : [...db.roomTypes, roomType];

    setDb((prev) => ({
      ...prev,
      roomTypes: updatedTypes,
    }));
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'createdByUserId'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: 'exp_' + Date.now(),
      createdByUserId: currentUser?.id || 'unknown',
    };

    let updatedShift = db.currentShift;
    // Nếu khoản chi này rút từ quầy ca trực hiện tại
    if (newExpense.shiftId && updatedShift) {
      updatedShift = {
        ...updatedShift,
        totalCashSpent: updatedShift.totalCashSpent + newExpense.amount,
        theoreticalCash: updatedShift.theoreticalCash - newExpense.amount,
      };
    }

    setDb((prev) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
      currentShift: updatedShift,
    }));

    logAuditAction(
      'ADD_EXPENSE',
      'EXPENSE',
      newExpense.id,
      `Chi tiêu: ${newExpense.categoryLabel} - ${newExpense.amount.toLocaleString('vi-VN')} đ`
    );
  };

  const closeCurrentShift = (actualCashCounted: number, handoverNotes?: string): Shift => {
    if (!db.currentShift) throw new Error('Không có ca trực nào đang mở');

    const closedTime = new Date().toISOString();
    const discrepancy = actualCashCounted - db.currentShift.theoreticalCash;

    const closedShift: Shift = {
      ...db.currentShift,
      endTime: closedTime,
      actualCashCounted,
      discrepancy,
      handoverNotes,
      status: 'CLOSED',
    };

    setDb((prev) => ({
      ...prev,
      shifts: prev.shifts.map((s) => (s.id === closedShift.id ? closedShift : s)),
      currentShift: null,
    }));

    logAuditAction(
      'CLOSE_SHIFT',
      'SHIFT',
      closedShift.id,
      `Đóng ca trực ${closedShift.shiftCode} - Thực tế: ${actualCashCounted.toLocaleString('vi-VN')} đ (Lệch: ${discrepancy.toLocaleString('vi-VN')} đ)`
    );

    return closedShift;
  };

  const openNewShift = (initialCash: number): Shift => {
    const newShiftCode = `CA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${db.shifts.length + 1}`;
    const newShift: Shift = {
      id: 'shift_' + Date.now(),
      shiftCode: newShiftCode,
      cashierUserId: currentUser?.id || 'unknown',
      cashierName: currentUser?.fullName || 'Lễ tân',
      startTime: new Date().toISOString(),
      initialCash,
      totalCashCollected: 0,
      totalTransferCollected: 0,
      totalCashSpent: 0,
      theoreticalCash: initialCash,
      status: 'OPEN',
    };

    setDb((prev) => ({
      ...prev,
      shifts: [newShift, ...prev.shifts],
      currentShift: newShift,
    }));

    return newShift;
  };

  const resetDatabase = () => {
    const defaultDb = DatabaseService.resetToDefault();
    setDb(defaultDb);
  };

  return (
    <HotelContext.Provider
      value={{
        zones: db.zones,
        roomTypes: db.roomTypes,
        amenities: db.amenities,
        rooms: db.rooms,
        pricingPlans: db.pricingPlans,
        services: db.services,
        bookings: db.bookings,
        invoices: db.invoices,
        expenses: db.expenses,
        shifts: db.shifts,
        currentShift: db.currentShift,
        checkIn,
        checkOut,
        addServiceToBooking,
        removeServiceFromBooking,
        changeRoom,
        setRoomStatus,
        createOrUpdateRoom,
        createOrUpdatePricingPlan,
        deletePricingPlan,
        createOrUpdateRoomType,
        addExpense,
        closeCurrentShift,
        openNewShift,
        resetDatabase,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotel = () => {
  const context = useContext(HotelContext);
  if (!context) throw new Error('useHotel must be used within a HotelProvider');
  return context;
};
