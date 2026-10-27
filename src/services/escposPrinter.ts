import { Invoice } from '../types/booking';
import { Shift } from '../types/finance';

export class EscposPrinterService {
  /**
   * Tạo chuỗi URL thanh toán VietQR động theo chuẩn Napas 247
   * Cho phép khách quét mã là tự động điền đúng số tiền và nội dung chuyển khoản!
   */
  public static generateVietQRUrl(
    bankId: string = 'MB', // MBBank, VCB, TCB, ACB, v.v.
    accountNo: string = '999988887777',
    accountName: string = 'KHACH SAN LUXURY PMS',
    amount: number = 0,
    memo: string = ''
  ): string {
    const encodedName = encodeURIComponent(accountName);
    const encodedMemo = encodeURIComponent(memo);
    return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png?amount=${amount}&addInfo=${encodedMemo}&accountName=${encodedName}`;
  }

  /**
   * Mở cửa sổ in bill nhiệt K80 chuẩn trình duyệt / desktop
   */
  public static printThermalInvoice(invoice: Invoice, hotelName: string = 'LUXURY BOUTIQUE HOTEL & MOTEL', hotelAddress: string = '123 Đường Ven Biển, TP. Đà Nẵng', hotelHotline: string = '0901.234.567'): void {
    const printWindow = window.open('', '_blank', 'width=380,height=600');
    if (!printWindow) return;

    const qrUrl = this.generateVietQRUrl('MB', '999988887777', 'KHACH SAN LUXURY PMS', invoice.totalAmount, invoice.invoiceCode);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>In Hóa Đơn - ${invoice.invoiceCode}</title>
        <style>
          @page { size: 80mm auto; margin: 0; }
          body {
            font-family: 'Courier New', Courier, monospace, sans-serif;
            font-size: 13px;
            color: #000;
            width: 76mm;
            margin: 2mm auto;
            padding: 2mm;
            line-height: 1.35;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
          .double-divider { border-bottom: 2px solid #000; margin: 6px 0; }
          .row { display: flex; justify-content: space-between; margin: 3px 0; }
          .big-text { font-size: 16px; font-weight: bold; }
          .qr-box { text-align: center; margin: 8px 0; }
          .qr-box img { max-width: 140px; height: auto; }
          @media print {
            body { width: 76mm; margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="center bold big-text">${hotelName}</div>
        <div class="center" style="font-size: 11px;">${hotelAddress}</div>
        <div class="center" style="font-size: 11px;">Hotline: ${hotelHotline}</div>
        
        <div class="double-divider"></div>
        <div class="center bold big-text">HÓA ĐƠN THANH TOÁN</div>
        <div class="center">Mã HĐ: ${invoice.invoiceCode}</div>
        <div class="center">Ngày: ${new Date(invoice.createdAt).toLocaleString('vi-VN')}</div>
        <div class="divider"></div>

        <div class="row"><span>Phòng:</span><span class="bold big-text">${invoice.roomNumber}</span></div>
        <div class="row"><span>Khách hàng:</span><span class="bold">${invoice.customerName}</span></div>
        <div class="row"><span>Loại thuê:</span><span>${invoice.bookingType === 'HOURLY' ? 'Theo giờ' : invoice.bookingType === 'OVERNIGHT' ? 'Qua đêm' : 'Theo ngày'}</span></div>
        <div class="row"><span>Thời gian ở:</span><span>${invoice.durationFormatted}</span></div>
        <div class="row"><span>Vào:</span><span>${new Date(invoice.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${new Date(invoice.checkInTime).toLocaleDateString('vi-VN')}</span></div>
        <div class="row"><span>Ra:</span><span>${new Date(invoice.checkOutTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${new Date(invoice.checkOutTime).toLocaleDateString('vi-VN')}</span></div>
        
        <div class="divider"></div>
        <div class="row"><span>Tiền phòng:</span><span class="bold">${invoice.roomAmount.toLocaleString('vi-VN')} đ</span></div>
        ${invoice.serviceAmount > 0 ? `<div class="row"><span>Dịch vụ & Minibar:</span><span>+${invoice.serviceAmount.toLocaleString('vi-VN')} đ</span></div>` : ''}
        ${invoice.surchargeAmount > 0 ? `<div class="row"><span>Phụ phí thêm người:</span><span>+${invoice.surchargeAmount.toLocaleString('vi-VN')} đ</span></div>` : ''}
        ${invoice.discountAmount > 0 ? `<div class="row"><span>Giảm giá khuyến mãi:</span><span>-${invoice.discountAmount.toLocaleString('vi-VN')} đ</span></div>` : ''}
        ${invoice.depositDeducted > 0 ? `<div class="row"><span>Đã trừ tiền cọc:</span><span>-${invoice.depositDeducted.toLocaleString('vi-VN')} đ</span></div>` : ''}

        <div class="double-divider"></div>
        <div class="row big-text">
          <span>TỔNG CỘNG:</span>
          <span>${invoice.totalAmount.toLocaleString('vi-VN')} đ</span>
        </div>
        <div class="row">
          <span>Phương thức:</span>
          <span class="bold">${invoice.paymentMethod === 'CASH' ? 'Tiền mặt' : invoice.paymentMethod === 'VIETQR_TRANSFER' ? 'Chuyển khoản VietQR' : 'Quẹt thẻ'}</span>
        </div>
        
        ${invoice.paymentMethod === 'VIETQR_TRANSFER' ? `
          <div class="qr-box">
            <div style="font-size: 11px; margin-bottom: 4px;">Quét mã VietQR để thanh toán:</div>
            <img src="${qrUrl}" alt="VietQR" />
          </div>
        ` : ''}

        <div class="divider"></div>
        <div class="center" style="font-size: 11px;">Thu ngân: ${invoice.cashierName}</div>
        <div class="center" style="margin-top: 6px; font-style: italic;">Cảm ơn quý khách & Hẹn gặp lại!</div>

        <div class="no-print" style="margin-top: 15px; text-align: center;">
          <button onclick="window.print()" style="padding: 8px 16px; font-size: 14px; background: #000; color: #fff; border: none; cursor: pointer; border-radius: 4px;">In Hóa Đơn (Print)</button>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  /**
   * In biên bản bàn giao ca trực (Shift Handover Slip)
   */
  public static printShiftHandover(shift: Shift): void {
    const printWindow = window.open('', '_blank', 'width=380,height=600');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Biên Bản Giao Ca - ${shift.shiftCode}</title>
        <style>
          body { font-family: monospace; font-size: 13px; width: 76mm; margin: 2mm auto; line-height: 1.3; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .divider { border-bottom: 1px dashed #000; margin: 6px 0; }
          .double-divider { border-bottom: 2px solid #000; margin: 6px 0; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; }
          .big { font-size: 15px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="center bold big">BIÊN BẢN BÀN GIAO CA</div>
        <div class="center">Mã ca: ${shift.shiftCode}</div>
        <div class="center">Lễ tân: ${shift.cashierName}</div>
        <div class="center">Bắt đầu: ${new Date(shift.startTime).toLocaleString('vi-VN')}</div>
        <div class="center">Kết thúc: ${shift.endTime ? new Date(shift.endTime).toLocaleString('vi-VN') : 'Đang mở'}</div>
        <div class="double-divider"></div>

        <div class="row"><span>1. Vốn đầu ca (két):</span><span class="bold">${shift.initialCash.toLocaleString('vi-VN')} đ</span></div>
        <div class="row"><span>2. Tiền mặt thu được:</span><span class="bold">+${shift.totalCashCollected.toLocaleString('vi-VN')} đ</span></div>
        <div class="row"><span>3. Chuyển khoản VietQR:</span><span>+${shift.totalTransferCollected.toLocaleString('vi-VN')} đ</span></div>
        <div class="row"><span>4. Tiền mặt chi ra:</span><span>-${shift.totalCashSpent.toLocaleString('vi-VN')} đ</span></div>

        <div class="divider"></div>
        <div class="row big">
          <span>TIỀN KÉT LÝ THUYẾT:</span>
          <span>${shift.theoreticalCash.toLocaleString('vi-VN')} đ</span>
        </div>
        ${shift.actualCashCounted !== undefined ? `
          <div class="row big" style="color: blue;">
            <span>TIỀN THỰC ĐẾM:</span>
            <span>${shift.actualCashCounted.toLocaleString('vi-VN')} đ</span>
          </div>
          <div class="row bold" style="color: ${shift.discrepancy && shift.discrepancy < 0 ? 'red' : 'green'};">
            <span>CHÊNH LỆCH:</span>
            <span>${(shift.discrepancy || 0) > 0 ? '+' : ''}${(shift.discrepancy || 0).toLocaleString('vi-VN')} đ</span>
          </div>
        ` : ''}

        <div class="double-divider"></div>
        <div style="margin-top: 15px; display: flex; justify-content: space-between;">
          <div class="center" style="font-size: 11px;">
            Người bàn giao<br/><br/><br/>
            (Ký và ghi rõ họ tên)
          </div>
          <div class="center" style="font-size: 11px;">
            Người nhận bàn giao<br/><br/><br/>
            (Ký và ghi rõ họ tên)
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }
}
