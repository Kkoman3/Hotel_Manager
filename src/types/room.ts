export type RoomStatus = 'AVAILABLE' | 'OCCUPIED' | 'DIRTY' | 'MAINTENANCE' | 'RESERVED';

export interface Zone {
  id: string;
  name: string;        // e.g. "Tầng 1", "Tầng 2", "Khu Bungalow Sân Vườn", "Tòa VIP"
  order: number;
}

export interface Amenity {
  id: string;
  name: string;        // e.g. "Bồn sục Jacuzzi", "Ghế Tantra", "Smart TV 75\"", "View Biển", "Ban công", "Bếp nấu"
  icon: string;
  category?: string;
}

export interface RoomType {
  id: string;
  name: string;        // e.g. "Phòng Tiêu Chuẩn Đơn", "Phòng Tình Nhân Love Theme", "VIP Penthouse", "Studio Gia Đình", "Dorm Giường Tầng"
  category: 'STANDARD' | 'THEME_LOVE' | 'VIP' | 'STUDIO_FAMILY' | 'DORM';
  description: string;
  baseAdults: number;
  baseChildren: number;
  maxOccupancy: number;
  defaultPricingPlanId: string;
  image?: string;
}

export interface Room {
  id: string;
  roomNumber: string;  // e.g. "101", "VIP-01", "Bungalow-A"
  zoneId: string;
  roomTypeId: string;
  status: RoomStatus;
  currentBookingId?: string;
  customPricingPlanId?: string; // override specific to this room if desired
  amenityIds: string[];
  cleanNotes?: string;
  maintenanceReason?: string;
  floorLevel: number;
}
