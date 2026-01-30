# Chuyển đổi Authentication sang Supabase API hoàn toàn

Mục tiêu là sử dụng trực tiếp SDK của Supabase trên Frontend cho mọi tác vụ Authentication, thay vì gọi qua các middleware proxy của Backend. Điều này giúp tận dụng tối đa các tính năng bảo mật và session của Supabase.

## User Review Required

> [!IMPORTANT]
> Việc chuyển đổi này sẽ thay đổi cách thức lưu giữ Session. Session sẽ được quản lý trực tiếp bởi Supabase SDK thay vì local JWT token tự quản.
> Chúng ta sẽ cần kích hoạt một Postgres Trigger để tự động tạo bản ghi trong bảng `public.users` khi có user mới đăng ký qua Supabase Auth.

## Proposed Changes

### [Frontend] Auth Layer

#### [MODIFY] [AuthContext.tsx](file:///c:/Users/Adonis/Downloads/App/src/contexts/AuthContext.tsx)
- Thay đổi hàm `login`, `register`, `logout` để sử dụng `supabase.auth`.
- Gỡ bỏ các đoạn mã truyền JWT token thủ công (nếu có) khi trao đổi với Supabase.
- Duy trì việc gọi backend cho các API chức năng khác (products, orders) nhưng sử dụng `supabase.auth.getSession()` để xác thực.

#### [MODIFY] [Auth.tsx](file:///c:/Users/Adonis/Downloads/App/src/pages/Auth.tsx)
- Cập nhật logic xử lý lỗi dựa trên phản hồi trực tiếp từ Supabase SDK.

### [Backend] API Layer

#### [MODIFY] [auth.js](file:///c:/Users/Adonis/Downloads/App/server/routes/auth.js)
- Đánh dấu các route đăng ký/đăng nhập là deprecated hoặc gỡ bỏ nếu không cần thiết.
- Giữ lại route `/me` để đồng bộ dữ liệu mở rộng từ `public.users`.

### [Database] Automation

#### [NEW] [Migration: Sync Users](file:///c:/Users/Adonis/Downloads/App/server/supabase/migrations/999_sync_auth_to_public_users.sql)
- Tạo function và trigger đồng bộ người dùng từ `auth.users` sang `public.users` tự động.

## Verification Plan

### Automated Tests
- Kiểm tra luồng đăng ký mới qua Browser Tool.
- Kiểm tra luồng đăng nhập với email/password.
- Kiểm tra luồng đăng nhập với Google OAuth.

### Manual Verification
- Xác nhận bản ghi được tạo tự động trong bảng `public.users` sau khi đăng ký.
- Xác nhận session được duy trì sau khi tải lại trang.
