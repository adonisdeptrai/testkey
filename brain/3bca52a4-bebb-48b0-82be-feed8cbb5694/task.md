# Bổ Sung Middleware Auth Backend

## Mục tiêu
Tăng cường bảo mật bằng cách áp dụng auth middleware cho các API endpoints nhạy cảm.

---

## Checklist

### Planning
- [x] Phân tích cấu trúc Backend hiện tại
- [x] Xác định các routes cần bảo vệ
- [x] Tạo implementation plan

### Execution
- [x] Tạo `adminAuth` middleware để kiểm tra role admin
- [x] Áp dụng auth cho `products.js` (POST, PUT, DELETE)
- [x] Áp dụng auth cho `orders.js` (GET All, PUT, Verify) 
- [x] Áp dụng auth cho `settings.js` (PUT, POST test-tpbank)
- [x] Cập nhật Dockerfile và docker-compose nếu cần

### Verification
- [x] Test các endpoint có auth được bảo vệ đúng cách
- [x] Test các endpoint public vẫn hoạt động bình thường
