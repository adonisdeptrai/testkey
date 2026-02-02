# Cài đặt Agent Skills

Cài đặt bộ kỹ năng (skills) từ `vercel-labs/agent-skills` để mở rộng khả năng của AI agent trong dự án này.

## Proposed Changes

### [Component] Agent Skills
Sử dụng công cụ `skills` CLI để cài đặt bộ kỹ năng chính thức từ Vercel Labs.

#### [NEW] .agent/skills/ (Tự động tạo bởi CLI)
Sau khi chạy lệnh cài đặt, thư mục này sẽ chứa các kỹ năng như:
- `react-best-practices`
- `web-design-guidelines`
- `composition-patterns`
- `vercel-deploy-claimable`

## Verification Plan

### Automated Tests
- Chạy lệnh `cmd /c "npx skills add vercel-labs/agent-skills"` và kiểm tra kết quả trả về.
- Liệt kê thư mục `.agent/skills` để đảm bảo các file `SKILL.md` đã hiện diện.
- Sử dụng công cụ `view_file` để đọc thử nội dung của một `SKILL.md`.

### Manual Verification
- Kiểm tra xem agent có thể nhận diện và sử dụng các kỹ năng mới trong các yêu cầu liên quan (ví dụ: review UI hoặc tối ưu React).
