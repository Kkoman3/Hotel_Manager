export type BookingType = 'HOURLY' | 'DAILY' | 'OVERNIGHT';

export interface HourlyRateConfig {
  firstBlockHours: number;       // e.g. 1 or 2 hours
  firstBlockPrice: number;       // e.g. 150,000 VND
  nextHourPrice: number;         // e.g. 50,000 VND
  gracePeriodMinutes: number;    // e.g. 15 mins free before next hour
  roundingIntervalMinutes: number; // e.g. 30 mins
}

export interface OvernightRateConfig {
  enabled: boolean;
  checkInFrom: string;           // "21:00"
  checkOutUntil: string;         // "11:00"
  flatPrice: number;             // e.g. 450,000 VND
  earlyCheckInHourlyFee: number; // per hour before checkInFrom
  lateCheckOutHourlyFee: number; // per hour after checkOutUntil
}

export interface DailyRateConfig {
  enabled: boolean;
  checkInTime: string;           // "14:00"
  checkOutTime: string;          // "12:00"
  pricePerDay: number;           // e.g. 700,000 VND
  earlyCheckInHourlyFee: number;
  lateCheckOutHourlyFee: number;
}

export interface SurchargeConfig {
  standardAdultCount: number;
  standardChildCount: number;
  extraAdultFee: number;
  extraChildFee: number;
}

export interface PricingPlan {
  id: string;
  name: string;                  // e.g. "Ngày thường", "Cuối tuần (T6-CN)", "Lễ / Tết"
  roomTypeId: string;            // target room type or "ALL"
  isDefault: boolean;
  applicableDays: number[];      // [0, 1, 2, 3, 4, 5, 6] (0 = Sunday)
  specialDates?: string[];       // ["2026-04-30", "2026-05-01"]
  hourlyRate: HourlyRateConfig;
  overnightRate: OvernightRateConfig;
  dailyRate: DailyRateConfig;
  surcharges: SurchargeConfig;
  createdAt: string;
}
