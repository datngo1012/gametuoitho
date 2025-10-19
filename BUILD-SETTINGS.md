# ⚙️ BUILD SETTINGS - Hướng dẫn chi tiết

## 📋 Bảng tóm tắt Build Settings

| Nền tảng | Base Directory | Build Command | Publish/Output Directory | Node Version |
|----------|---------------|---------------|--------------------------|--------------|
| **Netlify** | `/` | *(để trống)* | `web` | - |
| **Vercel** | `/` | *(để trống)* | `web` | - |
| **GitHub Pages** | `/` | - | `web` | - |
| **Cloudflare Pages** | `/` | *(để trống)* | `web` | - |
| **Render** | `/` | *(để trống)* | `web` | - |

---

## 🎯 Chi tiết từng nền tảng

### 1️⃣ NETLIFY

#### Option A: Cấu hình qua Web UI

1. Vào **Site settings** → **Build & deploy** → **Build settings**
2. Điền như sau:

```
Base directory: 
(Để trống hoặc gõ "/" - vì file ở root)

Build command: 
(Để trống - vì là static site, không cần build)

Publish directory: 
web
(Thư mục chứa file HTML/JS)

Functions directory:
(Để trống - không dùng serverless functions)
```

3. **Environment variables**: Không cần thiết lập gì

#### Option B: Dùng file netlify.toml (Khuyến nghị)

File `netlify.toml` đã được tạo sẵn ở root project:

```toml
[build]
  publish = "web"
  command = ""

[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
```

**Ưu điểm**: 
- ✅ Tự động áp dụng khi deploy
- ✅ Có CORS headers
- ✅ Cache control cho game files

---

### 2️⃣ VERCEL

#### Option A: Cấu hình qua Web UI

1. Vào **Project Settings** → **Build & Output Settings**
2. Điền như sau:

```
Framework Preset: Other
(Chọn "Other" vì không dùng framework)

Build Command:
(Để trống)

Output Directory:
web

Install Command:
(Để trống)

Development Command:
(Để trống)
```

3. **Root Directory**: Để mặc định `/`

#### Option B: Dùng file vercel.json (Khuyến nghị)

File `vercel.json` đã được tạo sẵn:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "web/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/web/$1"
    }
  ]
}
```

**Lưu ý Vercel**:
- Khi deploy, URL sẽ là: `your-project.vercel.app`
- Vercel tự động detect static site

---

### 3️⃣ GITHUB PAGES

#### Option A: Deploy thủ công (Settings)

1. Vào **Settings** → **Pages**
2. Cấu hình:

```
Source: Deploy from a branch

Branch: main
(Chọn branch chứa code)

Folder: /web
(Chọn thư mục /web)
```

3. Click **Save** → GitHub sẽ tự động deploy
4. Website sẽ live tại: `https://USERNAME.github.io/REPO/`

#### Option B: GitHub Actions (Tự động - Khuyến nghị)

1. Vào **Settings** → **Pages**
2. Source: chọn **GitHub Actions**
3. File workflow đã tạo sẵn: `.github/workflows/deploy-pages.yml`

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]

jobs:
  deploy:
    steps:
      - uses: actions/checkout@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './web'
      - uses: actions/deploy-pages@v4
```

**Lợi ích**:
- ✅ Tự động deploy khi push code
- ✅ Có history và rollback
- ✅ Nhanh hơn manual deploy

**Permissions cần thiết** (đã có sẵn trong workflow):
```yaml
permissions:
  contents: read
  pages: write
  id-token: write
```

---

### 4️⃣ CLOUDFLARE PAGES

1. Kết nối GitHub repo
2. Cấu hình build:

```
Production branch: main

Framework preset: None
(Chọn "None" - static site)

Build command:
(Để trống)

Build output directory: web

Root directory (advanced):
(Để trống - dùng root)

Environment variables:
(Không cần)
```

3. Click **Save and Deploy**

**URL**: `your-project.pages.dev`

---

### 5️⃣ RENDER (Static Site)

1. Chọn **New** → **Static Site**
2. Cấu hình:

```
Build Command:
(Để trống)

Publish directory: web

Auto-Deploy: Yes
```

---

### 6️⃣ FIREBASE HOSTING

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

2. Khi hỏi:
```
What do you want to use as your public directory? 
→ web

Configure as a single-page app? 
→ No

Set up automatic builds and deploys with GitHub? 
→ Yes (nếu muốn)
```

3. Deploy:
```bash
firebase deploy
```

---

## 🔧 VPS/Cloud Server (Nginx/Apache)

### Apache (.htaccess)

File `.htaccess` đã được tạo trong `web/.htaccess`:

```apache
# Enable CORS
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
</IfModule>

# Cache game files
<FilesMatch "\.(jar|jad)$">
    Header set Cache-Control "max-age=31536000, public"
</FilesMatch>
```

**Upload**:
1. FTP/SFTP file lên server
2. Đảm bảo `.htaccess` trong thư mục `web/`
3. Apache sẽ tự động áp dụng

### Nginx

File `nginx.conf` đã được tạo:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/game-tuoi-tho/web;
    index index.html;
    
    location /games/ {
        add_header Access-Control-Allow-Origin "*";
        expires 1y;
    }
}
```

**Cài đặt**:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/game-tuoi-tho
sudo ln -s /etc/nginx/sites-available/game-tuoi-tho /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 🐳 DOCKER

### Build và chạy

File `Dockerfile` và `docker-compose.yml` đã được tạo:

```bash
# Build image
docker build -t game-tuoi-tho .

# Run container
docker run -d -p 8080:80 game-tuoi-tho

# Hoặc dùng docker-compose
docker-compose up -d
```

Truy cập: `http://localhost:8080`

---

## ❓ FAQ - Câu hỏi thường gặp

### Q: Tại sao Build Command để trống?
**A**: Vì đây là **static site** (HTML/CSS/JS thuần), không cần build process. File đã sẵn sàng để deploy.

### Q: Tại sao chọn thư mục `web`?
**A**: Tất cả file website (HTML, JS, games) nằm trong thư mục `web/`, không phải ở root.

### Q: Có cần Node.js không?
**A**: **Không**. Project này không dùng npm/Node.js. Chỉ cần static file hosting.

### Q: Environment variables cần thiết lập gì?
**A**: **Không cần** environment variables gì cả.

### Q: Deploy lên subdomain được không?
**A**: **Được**. Chỉ cần update domain settings trong platform.

### Q: Cần SSL certificate không?
**A**: **Netlify/Vercel/GitHub Pages** tự động cung cấp SSL miễn phí. VPS cần setup Let's Encrypt.

---

## ✅ Checklist trước khi Deploy

- [ ] Tất cả game files (.jar) đã có trong `web/games/`
- [ ] File `web/games/list.json` đã cập nhật đầy đủ
- [ ] Test local bằng Live Server hoặc `python -m http.server`
- [ ] Kiểm tra Console (F12) không có lỗi
- [ ] File size không quá giới hạn nền tảng (Netlify: 100MB/file)
- [ ] CORS headers được cấu hình (nếu dùng VPS)

---

## 🎯 Khuyến nghị nền tảng

| Nhu cầu | Nền tảng khuyến nghị | Lý do |
|---------|---------------------|-------|
| **Dễ nhất** | Netlify | Kéo thả thư mục `web/` là xong |
| **Nhanh nhất** | Vercel | Deploy tự động, CDN toàn cầu |
| **Miễn phí nhất** | GitHub Pages | Unlimited bandwidth cho public repo |
| **Nhiều game** | Cloudflare Pages | Không giới hạn file size |
| **Kiểm soát tối đa** | VPS + Nginx | Tự quản lý mọi thứ |

---

## 📞 Hỗ trợ

Nếu gặp vấn đề khi deploy:
1. Check build logs trong platform
2. Xem Browser Console (F12)
3. Verify file paths trong `list.json`
4. Test CORS headers: https://www.test-cors.org/

**Happy deploying! 🚀**
