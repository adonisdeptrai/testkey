# Customize Google OAuth Consent Screen

Để hiển thị **"R4bbit"** thay vì `okalizcwyzpwaffrkbey.supabase.co` trong màn hình Google OAuth.

---

## Vấn Đề

Màn hình OAuth consent hiện tại hiển thị:
```
Bạn đang đăng nhập lại vào okalizcwyzpwaffrkbey.supabase.co
```

Trông không chuyên nghiệp và khó nhớ.

---

## Giải Pháp: Update OAuth Consent Screen

### Bước 1: Vào Google Cloud Console

1. **Truy cập:**
   - URL: https://console.cloud.google.com/apis/credentials/consent

2. **Chọn project** nếu có nhiều project

### Bước 2: Edit OAuth Consent Screen

1. Click **EDIT APP** (góc trên)

2. **App Information:**
   - **App name:** `R4bbit` ← Tên này sẽ hiển thị thay vì subdomain
   - **User support email:** `qbuiminh1110@gmail.com`
   - **App logo:** Upload logo R4bbit (optional, PNG 120x120px)

3. **App domain:**
   - **Application home page:** `https://r4bbit-hub.vercel.app`
   - **Privacy policy:** `https://r4bbit-hub.vercel.app/privacy` (tạo page này)
   - **Terms of service:** `https://r4bbit-hub.vercel.app/terms` (optional)

4. **Authorized domains:**
   ```
   r4bbit-hub.vercel.app
   supabase.co
   ```

5. **Developer contact information:**
   - Email: `qbuiminh1110@gmail.com`

6. Click **SAVE AND CONTINUE**

### Bước 3: Configure Scopes (nếu cần)

1. Click **ADD OR REMOVE SCOPES**
2. Select scopes cần thiết:
   - `.../auth/userinfo.email` ✓
   - `.../auth/userinfo.profile` ✓
3. Click **UPDATE** → **SAVE AND CONTINUE**

### Bước 4: Test Users (Development Mode)

Nếu app đang ở **Testing** status:
1. Add test users:
   ```
   qbuiminh1110@gmail.com
   ```
2. Click **SAVE AND CONTINUE**

### Bước 5: Review & Submit

1. Review tất cả settings
2. Click **BACK TO DASHBOARD**

---

## Kết Quả

Sau khi update, OAuth consent screen sẽ hiển thị:

```
Đăng nhập với Google

Bạn đang đăng nhập lại vào
R4bbit  ← Tên mới thay vì subdomain
```

**Cải thiện:**
- ✅ Professional branding
- ✅ User-friendly app name
- ✅ Trust signal (hiển thị tên app thay vì technical URL)

---

## Optional: Tạo Privacy Policy Page

Nếu Google yêu cầu Privacy Policy:

### Tạo Privacy Page trong App

1. **Create file:** `src/pages/Privacy.tsx`

```typescript
export default function Privacy() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Data Collection</h2>
        <p>R4bbit collects the following information via Google OAuth:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Email address</li>
          <li>Profile name</li>
          <li>Profile picture (optional)</li>
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Data Usage</h2>
        <p>Your data is used solely for:</p>
        <ul className="list-disc ml-6 mt-2">
          <li>Account authentication</li>
          <li>Order management</li>
          <li>Service delivery</li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-3">Data Storage</h2>
        <p>All data is securely stored using Supabase infrastructure with industry-standard encryption.</p>
      </section>

      <p className="mt-8 text-sm text-gray-600">
        Last updated: {new Date().toLocaleDateString('vi-VN')}
      </p>
    </div>
  );
}
```

2. **Add route trong App.tsx:**

```typescript
<Route path="/privacy" element={<Privacy />} />
```

3. **Deploy** và URL sẽ là: `https://r4bbit-hub.vercel.app/privacy`

---

## Lưu Ý

### Subdomain Supabase KHÔNG thể đổi

- `okalizcwyzpwaffrkbey.supabase.co` là technical endpoint
- Cần giữ nguyên trong code và Supabase config
- Chỉ **app name** trong OAuth consent screen là có thể custom

### Publishing Status

**Testing mode:**
- Chỉ test users có thể login
- Hiển thị warning "Google hasn't verified this app"

**Production mode:**
- Cần submit verification (có thể mất vài ngày)
- Yêu cầu privacy policy, terms of service
- Remove warning screen

**Recommendation:** Giữ Testing mode cho development, submit verification khi ready production.

---

## Checklist

- [ ] Update app name → "R4bbit"
- [ ] Add app logo (optional)
- [ ] Set homepage URL
- [ ] Create privacy policy page
- [ ] Add authorized domains
- [ ] Add test users (if testing mode)
- [ ] Test OAuth flow → verify new branding

Sau khi apply changes, OAuth consent screen sẽ professional hơn nhiều! ✨
