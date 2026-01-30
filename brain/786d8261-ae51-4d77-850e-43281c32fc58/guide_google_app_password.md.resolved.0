# Hướng dẫn Cấu hình Google App Password

Để gửi email xác thực mà không cần thuê SMTP server, bạn có thể sử dụng tài khoản Gmail cá nhân thông qua tính năng **App Password**.

## Bước 1: Bật Xác thực 2 bước (2FA)
1. Truy cập [Google Account Security](https://myaccount.google.com/security).
2. Tìm mục **"How you sign in to Google"** (Cách bạn đăng nhập vào Google).
3. Chọn **"2-Step Verification"** (Xác minh 2 bước) và làm theo hướng dẫn để bật (nếu chưa bật).

## Bước 2: Tạo App Password
1. Sau khi bật 2FA, quay lại trang [Security](https://myaccount.google.com/security).
2. Tìm kiếm (hoặc gõ vào ô tìm kiếm trên cùng): **"App passwords"** (Mật khẩu ứng dụng).
3. Đặt tên gợi nhớ cho ứng dụng, ví dụ: `R4B Website`.
4. Nhấn **Create** (Tạo).

## Bước 3: Lấy Mật khẩu
Google sẽ hiển thị một chuỗi ký tự gồm 16 chữ cái (ví dụ: `xxxx xxxx xxxx xxxx`).
> **Lưu ý:** Đây là mật khẩu duy nhất bạn cần. Đừng chia sẻ nó cho ai.

## Bước 4: Cấu hình vào Docker
Cập nhật file `.env` hoặc `docker-compose.yml` của bạn:

```yaml
environment:
  - EMAIL_USER=your-email@gmail.com
  - EMAIL_PASS=xxxx xxxx xxxx xxxx  <-- Dán mật khẩu 16 ký tự vào đây (bỏ khoảng trắng nếu cần, nhưng thường dán nguyên cũng được)
```

## Bước 5: Khởi động lại Server
Chạy lệnh sau để server nhận cấu hình mới:
```bash
docker-compose up -d --build
```
