import { BookingType, PricingPlan } from '../types/pricing';

export interface PriceCalculationResult {
  durationMinutes: number;
  durationFormatted: string;
  roomBaseAmount: number;
  surchargesAmount: number;
  breakdown: string[];
  totalRoomAmount: number;
}

export class PricingEngine {
  /**
   * Tính toán tiền phòng dựa trên thời điểm vào, ra và bảng giá động
   */
  public static calculateStayPrice(
    checkInTime: string | Date,
    checkOutTime: string | Date,
    bookingType: BookingType,
    plan: PricingPlan,
    adultCount: number = 2,
    childCount: number = 0
  ): PriceCalculationResult {
    const start = new Date(checkInTime);
    const end = new Date(checkOutTime);
    
    // Đảm bảo end >= start
    let diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) diffMs = 0;
    const durationMinutes = Math.floor(diffMs / (1000 * 60));

    // Tính phụ phí người vượt tiêu chuẩn
    const surcharges = this.calculateExtraPersonSurcharges(
      plan,
      adultCount,
      childCount
    );

    let roomBaseAmount = 0;
    const breakdown: string[] = [];

    const durationFormatted = this.formatDuration(durationMinutes);

    switch (bookingType) {
      case 'HOURLY': {
        const hourlyRes = this.calculateHourly(durationMinutes, plan);
        roomBaseAmount = hourlyRes.amount;
        breakdown.push(...hourlyRes.breakdown);
        break;
      }
      case 'OVERNIGHT': {
        const overnightRes = this.calculateOvernight(start, end, plan);
        roomBaseAmount = overnightRes.amount;
        breakdown.push(...overnightRes.breakdown);
        break;
      }
      case 'DAILY': {
        const dailyRes = this.calculateDaily(start, end, plan);
        roomBaseAmount = dailyRes.amount;
        breakdown.push(...dailyRes.breakdown);
        break;
      }
    }

    if (surcharges.amount > 0) {
      breakdown.push(...surcharges.breakdown);
    }

    return {
      durationMinutes,
      durationFormatted,
      roomBaseAmount,
      surchargesAmount: surcharges.amount,
      breakdown,
      totalRoomAmount: roomBaseAmount + surcharges.amount,
    };
  }

  /**
   * Tính tiền theo giờ
   */
  private static calculateHourly(
    durationMinutes: number,
    plan: PricingPlan
  ): { amount: number; breakdown: string[] } {
    const cfg = plan.hourlyRate;
    const breakdown: string[] = [];

    // Tối thiểu tính theo block đầu tiên
    const firstBlockMinutes = cfg.firstBlockHours * 60;
    
    if (durationMinutes <= firstBlockMinutes) {
      breakdown.push(
        `${cfg.firstBlockHours}h đầu tiên: ${cfg.firstBlockPrice.toLocaleString('vi-VN')} đ`
      );
      return { amount: cfg.firstBlockPrice, breakdown };
    }

    // Vượt block đầu
    let amount = cfg.firstBlockPrice;
    breakdown.push(
      `${cfg.firstBlockHours}h đầu: ${cfg.firstBlockPrice.toLocaleString('vi-VN')} đ`
    );

    const extraMinutes = durationMinutes - firstBlockMinutes;
    
    // Trừ phút ân hạn (grace period)
    const effectiveExtraMinutes = Math.max(0, extraMinutes - cfg.gracePeriodMinutes);
    if (effectiveExtraMinutes > 0) {
      // Làm tròn theo interval (ví dụ 30 phút hoặc 60 phút)
      const roundedUnits = Math.ceil(effectiveExtraMinutes / cfg.roundingIntervalMinutes);
      const hoursToCharge = (roundedUnits * cfg.roundingIntervalMinutes) / 60;
      const extraCost = hoursToCharge * cfg.nextHourPrice;

      amount += extraCost;
      breakdown.push(
        `Phát sinh ${hoursToCharge.toFixed(1)}h (+${cfg.nextHourPrice.toLocaleString('vi-VN')} đ/h): ${extraCost.toLocaleString('vi-VN')} đ`
      );
    }

    return { amount, breakdown };
  }

  /**
   * Tính tiền qua đêm
   */
  private static calculateOvernight(
    start: Date,
    end: Date,
    plan: PricingPlan
  ): { amount: number; breakdown: string[] } {
    const cfg = plan.overnightRate;
    const breakdown: string[] = [];
    let amount = cfg.flatPrice;

    breakdown.push(`Gói qua đêm trọn gói: ${cfg.flatPrice.toLocaleString('vi-VN')} đ`);

    // Kiểm tra vào sớm hơn giờ quy định (ví dụ quy định 21h mà vào lúc 19h)
    const [startHour, startMin] = cfg.checkInFrom.split(':').map(Number);
    const expectedStartDate = new Date(start);
    expectedStartDate.setHours(startHour, startMin, 0, 0);

    if (start.getTime() < expectedStartDate.getTime()) {
      const earlyMinutes = Math.floor((expectedStartDate.getTime() - start.getTime()) / (1000 * 60));
      if (earlyMinutes > 15) {
        const earlyHours = Math.ceil(earlyMinutes / 60);
        const earlyFee = earlyHours * cfg.earlyCheckInHourlyFee;
        amount += earlyFee;
        breakdown.push(`Nhận phòng sớm ${earlyHours}h: ${earlyFee.toLocaleString('vi-VN')} đ`);
      }
    }

    // Kiểm tra trả trễ hơn giờ quy định (ví dụ quy định 11h hôm sau mà trả lúc 13h)
    const [endHour, endMin] = cfg.checkOutUntil.split(':').map(Number);
    const expectedEndDate = new Date(end);
    expectedEndDate.setHours(endHour, endMin, 0, 0);

    if (end.getTime() > expectedEndDate.getTime()) {
      const lateMinutes = Math.floor((end.getTime() - expectedEndDate.getTime()) / (1000 * 60));
      if (lateMinutes > 15) {
        const lateHours = Math.ceil(lateMinutes / 60);
        const lateFee = lateHours * cfg.lateCheckOutHourlyFee;
        amount += lateFee;
        breakdown.push(`Trả phòng trễ ${lateHours}h: ${lateFee.toLocaleString('vi-VN')} đ`);
      }
    }

    return { amount, breakdown };
  }

  /**
   * Tính tiền theo ngày
   */
  private static calculateDaily(
    start: Date,
    end: Date,
    plan: PricingPlan
  ): { amount: number; breakdown: string[] } {
    const cfg = plan.dailyRate;
    const breakdown: string[] = [];
    
    const diffHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    // Số ngày tối thiểu là 1
    const days = Math.max(1, Math.ceil(diffHours / 24));
    const baseDaily = days * cfg.pricePerDay;

    breakdown.push(`${days} ngày (${cfg.pricePerDay.toLocaleString('vi-VN')} đ/ngày): ${baseDaily.toLocaleString('vi-VN')} đ`);

    return { amount: baseDaily, breakdown };
  }

  /**
   * Phụ thu thêm khách
   */
  private static calculateExtraPersonSurcharges(
    plan: PricingPlan,
    adultCount: number,
    childCount: number
  ): { amount: number; breakdown: string[] } {
    let amount = 0;
    const breakdown: string[] = [];
    const cfg = plan.surcharges;

    const extraAdults = Math.max(0, adultCount - cfg.standardAdultCount);
    if (extraAdults > 0) {
      const adultSurcharge = extraAdults * cfg.extraAdultFee;
      amount += adultSurcharge;
      breakdown.push(`Phụ thu ${extraAdults} người lớn thêm: ${adultSurcharge.toLocaleString('vi-VN')} đ`);
    }

    const extraChildren = Math.max(0, childCount - cfg.standardChildCount);
    if (extraChildren > 0) {
      const childSurcharge = extraChildren * cfg.extraChildFee;
      amount += childSurcharge;
      breakdown.push(`Phụ thu ${extraChildren} trẻ em thêm: ${childSurcharge.toLocaleString('vi-VN')} đ`);
    }

    return { amount, breakdown };
  }

  /**
   * Định dạng thời gian ở dạng trực quan
   */
  public static formatDuration(totalMinutes: number): string {
    const days = Math.floor(totalMinutes / (24 * 60));
    const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
    const minutes = totalMinutes % 60;

    const parts: string[] = [];
    if (days > 0) parts.push(`${days} ngày`);
    if (hours > 0) parts.push(`${hours} giờ`);
    parts.push(`${minutes} phút`);
    return parts.join(' ');
  }
}
