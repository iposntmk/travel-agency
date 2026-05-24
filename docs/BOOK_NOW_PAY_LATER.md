# Book Now - Pay Later Policy

**Khẩu hiệu chính:** **"Book Now - Pay Later"**

## Nguyên tắc cốt lõi
- Khách hàng chỉ cần đặt chỗ trước để giữ vị trí.
- Không yêu cầu thanh toán trước (deposit hoặc full payment).
- Thanh toán / Tip sẽ thực hiện **sau**:
  - Khi gặp Tour Guide
  - Hoặc tại văn phòng agency

## Áp dụng cho:
- Tất cả tour trả phí (Self-operated & Partner)
- Free Walking Tour / Free Cycling Tour (khách tip guide sau tour)

## Lợi ích
- Tạo niềm tin mạnh mẽ với khách quốc tế
- Giảm rào cản booking
- Phù hợp với khách Châu Âu, Úc và khách lần đầu đến Việt Nam

## Technical Design
- Không tích hợp Payment Gateway ở giai đoạn này
- Collection `bookings` có field `paymentMethod` và `paymentStatus`
- Inquiry mới tạo booking với status `Pending`; sales/ops xác nhận thì chuyển `Confirmed - Pay Later`
- Lifecycle chuẩn: `Pending → Confirmed - Pay Later → Confirmed - Paid → Completed | Cancelled`
- Thiết kế DB và UI theo cách dễ dàng thêm Payment Step sau này (modular)
- Booking submit và payment webhook tương lai phải idempotent để tránh booking/thanh toán trùng
- Mọi thay đổi trạng thái booking phải ghi audit trail
