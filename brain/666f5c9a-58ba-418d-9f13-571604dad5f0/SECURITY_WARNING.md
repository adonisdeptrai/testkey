⚠️ **SECURITY ALERT**

JWT_SECRET trong `server/.env` hiện vẫn là:
```
JWT_SECRET=mysecretkey123
```

## ⚡ BẮT BUỘC: Generate Strong Secret

**Chạy command này và update vào `.env`:**

```bash
# Windows PowerShell (nếu có OpenSSL)
openssl rand -hex 32

# Hoặc dùng Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Copy output và replace vào:**
1. `/.env` → JWT_SECRET
2. `/server/.env` → JWT_SECRET

## 🔐 Production Deployment Checklist

Trước khi deploy production:

- [ ] Generate strong JWT_SECRET (32+ chars)
- [ ] Replace EMAIL_USER với Gmail thật
- [ ] Generate Gmail App Password cho EMAIL_PASS
- [ ] Update CLIENT_URL với domain production
- [ ] Verify MONGO_URI đúng với production DB
- [ ] Test application với production .env
- [ ] Backup sensitive .env files securely (NOT in git)

## ✅ Các Fix Đã Hoàn Thành

1. ✅ Created `.env.example` templates
2. ✅ Fixed `MONGO_URI` variable name (was `mongoURI`)
3. ✅ Fixed `CLIENT_URL` port (3000 → 8080)
4. ✅ Added `CLIENT_URL` to docker-compose.yml
5. ✅ Updated `.gitignore` to exclude .env files
6. ✅ Created `SECURITY.md` documentation

## 🚨 Vẫn Cần Action

**JWT_SECRET phải được thay đổi trước khi deploy production!**

Current secret `mysecretkey123` là WEAK và có thể bị brute-force.
