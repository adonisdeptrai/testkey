# Cloudflare Tunnel Deployment Guide

## 🎯 Overview

Deploy R4B App trên Ubuntu 22.04 home server với Cloudflare Tunnel (không cần Docker).

**Architecture**:
```
Internet → Cloudflare Tunnel → Ubuntu Server
                                 ├── nginx (Frontend :80)
                                 └── PM2 (Backend :5000)
```

---

## 📋 Prerequisites

- Ubuntu 22.04 VM trên Proxmox
- Cloudflare account (free)
- Domain đã add vào Cloudflare (hoặc dùng subdomain)

---

## 🚀 Part 1: Server Setup

### 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install nginx
sudo apt install -y nginx

# Install PM2 globally
sudo npm install -g pm2

# Install Git
sudo apt install -y git
```

### 2. Clone Repository

```bash
# Clone to /var/www
cd /var/www
sudo git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git app
sudo chown -R $USER:$USER /var/www/app
cd /var/www/app
```

---

## 📦 Part 2: Backend Setup

### 1. Install Backend Dependencies

```bash
cd /var/www/app/server
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
nano .env
```

**Update với Supabase credentials**:
```env
SUPABASE_URL=https://okalizcwyzpwaffrkbey.supabase.co
SUPABASE_SERVICE_KEY=your_actual_service_key
SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
CLIENT_URL=https://your-domain.com
```

### 3. Start Backend with PM2

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js <<EOF
module.exports = {
  apps: [{
    name: 'r4b-backend',
    script: 'index.js',
    cwd: '/var/www/app/server',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 config
pm2 save

# Setup PM2 startup
pm2 startup
# Copy-paste command shown và chạy

# Check status
pm2 status
pm2 logs r4b-backend
```

---

## 🎨 Part 3: Frontend Setup

### 1. Build Frontend

```bash
cd /var/www/app

# Install dependencies
npm install

# Create production .env
cat > .env.production <<EOF
VITE_API_URL=https://api.your-domain.com
EOF

# Build
npm run build
```

### 2. Configure Nginx

```bash
# Create nginx config
sudo nano /etc/nginx/sites-available/r4b-app
```

**Paste config**:
```nginx
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /var/www/app/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API (local proxy)
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/r4b-app /etc/nginx/sites-enabled/

# Remove default
sudo rm /etc/nginx/sites-enabled/default

# Test config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

---

## ☁️ Part 4: Cloudflare Tunnel Setup

### 1. Install Cloudflared

```bash
# Download
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

# Install
sudo dpkg -i cloudflared-linux-amd64.deb

# Verify
cloudflared --version
```

### 2. Authenticate Cloudflare

```bash
cloudflared tunnel login
```

Mở browser, login Cloudflare, chọn domain.

### 3. Create Tunnel

```bash
# Create tunnel
cloudflared tunnel create r4b-app

# Note the Tunnel ID shown
```

### 4. Configure Tunnel

```bash
# Create config directory
sudo mkdir -p /etc/cloudflared

# Create config file
sudo nano /etc/cloudflared/config.yml
```

**Paste config** (replace TUNNEL-ID và domain):
```yaml
tunnel: YOUR-TUNNEL-ID-HERE
credentials-file: /root/.cloudflared/YOUR-TUNNEL-ID-HERE.json

ingress:
  # Main app domain
  - hostname: your-domain.com
    service: http://localhost:80
  
  # API subdomain (optional, if you want separate)
  - hostname: api.your-domain.com
    service: http://localhost:5000
  
  # Catch-all
  - service: http_status:404
```

### 5. Create DNS Records

```bash
# Route domain through tunnel
cloudflared tunnel route dns r4b-app your-domain.com
cloudflared tunnel route dns r4b-app api.your-domain.com
```

### 6. Run Tunnel as Service

```bash
# Install as systemd service
sudo cloudflared service install

# Start service
sudo systemctl start cloudflared

# Enable on boot
sudo systemctl enable cloudflared

# Check status
sudo systemctl status cloudflared

# View logs
sudo journalctl -u cloudflared -f
```

---

## ✅ Part 5: Verification

### 1. Check Services

```bash
# Backend
pm2 status
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:80

# Cloudflare Tunnel
sudo systemctl status cloudflared
```

### 2. Test Public Access

Mở browser: `https://your-domain.com`

---

## 🔄 Part 6: Update & Maintenance

### Update Code

```bash
cd /var/www/app

# Pull latest
git pull

# Update backend
cd server
npm install
pm2 restart r4b-backend

# Update frontend
cd ..
npm install
npm run build

# Reload nginx
sudo systemctl reload nginx
```

### View Logs

```bash
# Backend logs
pm2 logs r4b-backend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Cloudflared logs
sudo journalctl -u cloudflared -f
```

### Monitoring

```bash
# PM2 monitoring
pm2 monit

# System resources
htop
```

---

## 🛡️ Security Best Practices

### 1. Firewall (UFW)

```bash
# Enable firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Only allow SSH (internal network)
sudo ufw allow from 192.168.1.0/24 to any port 22

# Enable
sudo ufw enable
```

**Note**: Không cần mở port 80/443 vì dùng Cloudflare Tunnel!

### 2. Fail2Ban (Optional)

```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
```

---

## 📊 Troubleshooting

### Backend không start
```bash
pm2 logs r4b-backend --lines 100
```

### Cloudflare Tunnel down
```bash
sudo systemctl restart cloudflared
sudo journalctl -u cloudflared -n 50
```

### Nginx errors
```bash
sudo nginx -t
sudo systemctl status nginx
```

---

## 🎯 Final Checklist

- [ ] Backend chạy với PM2: `pm2 status`
- [ ] Frontend build success: `ls /var/www/app/dist`
- [ ] Nginx serving: `curl http://localhost`
- [ ] Cloudflare Tunnel active: `sudo systemctl status cloudflared`
- [ ] Public access working: `https://your-domain.com`
- [ ] TPBank worker running: check system logs

---

**🎉 Done!** App đã live tại `https://your-domain.com` với Cloudflare protection.
