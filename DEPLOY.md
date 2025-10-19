# 🚀 HƯỚNG DẪN DEPLOY

## Deploy lên Server

### 1. Deploy lên GitHub Pages (Miễn phí)

#### Bước 1: Push code lên GitHub
```bash
git init
git add .
git commit -m "Initial commit - Website game tuổi thơ"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main
```

#### Bước 2: Enable GitHub Pages
1. Vào repo → Settings → Pages
2. Source: chọn branch `main` và folder `/web`
3. Save
4. Website sẽ có tại: `https://USERNAME.github.io/REPO/`

⚠️ **Lưu ý**: File game (.jar, .jad) nên host ở CDN riêng vì GitHub có giới hạn file size 100MB.

### 2. Deploy lên Netlify (Miễn phí)

#### Deploy thủ công:
1. Vào https://app.netlify.com/
2. Drag & drop thư mục `web/`
3. Xong! Website đã live

#### Deploy tự động:
```bash
npm install -g netlify-cli
cd web
netlify deploy --prod
```

**netlify.toml** (tạo file này trong thư mục web):
```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
```

### 3. Deploy lên Vercel (Miễn phí)

```bash
npm install -g vercel
cd web
vercel --prod
```

**vercel.json**:
```json
{
  "cleanUrls": true,
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### 4. Deploy lên VPS/Shared Hosting

#### Upload file:
1. FTP/SFTP tất cả file trong `web/` lên server
2. Đảm bảo server hỗ trợ static file hosting

#### Nginx config:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/web;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Enable CORS for game files
    location /games/ {
        add_header Access-Control-Allow-Origin *;
    }

    # Cache game files
    location ~* \.(jar|jad)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache (.htaccess):
```apache
# Enable CORS
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
</IfModule>

# Cache game files
<FilesMatch "\.(jar|jad)$">
    Header set Cache-Control "max-age=2592000, public"
</FilesMatch>

# Gzip compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### 5. Deploy bằng Docker

**Dockerfile**:
```dockerfile
FROM nginx:alpine

COPY web/ /usr/share/nginx/html/

# Nginx config
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ =404; \
    } \
    location /games/ { \
        add_header Access-Control-Allow-Origin *; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
```

**Build và run**:
```bash
docker build -t game-tuoi-tho .
docker run -d -p 8080:80 game-tuoi-tho
```

**docker-compose.yml**:
```yaml
version: '3'
services:
  web:
    build: .
    ports:
      - "8080:80"
    volumes:
      - ./web:/usr/share/nginx/html
    restart: unless-stopped
```

## Tối ưu cho Production

### 1. Host game files trên CDN

Nếu có nhiều game (>100MB), nên host file JAR trên CDN:

```json
// list.json
[
  {
    "filename": "game.jar",
    "jarUrl": "https://cdn.example.com/games/game.jar",
    "name": "Game Name"
  }
]
```

Sửa `game-loader.js`:
```javascript
async loadJarFile(jarPath, jarUrl) {
    const url = jarUrl || jarPath;
    const response = await fetch(url);
    //...
}
```

### 2. Enable caching

**Headers cần set**:
```
Cache-Control: max-age=31536000, immutable (cho file .jar, .jad)
Cache-Control: no-cache (cho index.html, list.json)
```

### 3. Compress files

Nén file JAR trước khi upload (nếu chưa nén):
```bash
# File JAR đã là file nén (.zip) nên không cần nén thêm
# Nhưng có thể bật gzip compression ở server
```

### 4. Optimize loading

Trong `list.json`, sắp xếp game phổ biến lên đầu:
```json
[
  {"filename": "popular-game.jar", "preload": true},
  {"filename": "other-game.jar"}
]
```

## Monitoring & Analytics

### Google Analytics

Thêm vào `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

### Track game plays

Trong `launcher.js`, thêm:
```javascript
function trackGamePlay(gameName) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'game_play', {
            'game_name': gameName
        });
    }
}
```

## Security

### 1. HTTPS
Luôn dùng HTTPS, đặc biệt khi dùng CheerpJ

### 2. CSP Headers
```
Content-Security-Policy: default-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://cjrtnc.leaningtech.com;
```

### 3. Rate Limiting
Giới hạn số request để tránh abuse:
```nginx
limit_req_zone $binary_remote_addr zone=games:10m rate=10r/s;

location /games/ {
    limit_req zone=games burst=20;
}
```

## Troubleshooting

### CORS Error
- Đảm bảo server có header `Access-Control-Allow-Origin: *`
- Kiểm tra file có public access

### 404 Not Found
- Check đường dẫn file trong `list.json`
- Đảm bảo file đã upload đúng thư mục

### Game không load
- Xem Console (F12) để check lỗi
- Kiểm tra file JAR có corrupt không
- Thử settings khác

### Slow Loading
- Enable CDN
- Enable caching
- Compress responses
- Reduce game file size

## Cost Estimate

| Platform | Free Tier | Bandwidth | Storage |
|----------|-----------|-----------|---------|
| GitHub Pages | ✅ | 100GB/month | 1GB |
| Netlify | ✅ | 100GB/month | Unlimited |
| Vercel | ✅ | 100GB/month | Unlimited |
| Cloudflare Pages | ✅ | Unlimited | 25GB |

**Khuyến nghị**: Netlify hoặc Vercel cho dễ deploy + unlimited storage

## Maintenance

### Thêm game mới:
1. Upload file JAR vào `games/`
2. Update `list.json`
3. Push/deploy

### Update settings:
1. Sửa `list.json`
2. User clear cache hoặc hard refresh (Ctrl+F5)

### Backup:
```bash
# Backup game data (nếu có backend)
# Browser data được lưu local, không cần backup server-side
```

## Support

Nếu gặp vấn đề khi deploy, check:
- [ ] Server logs
- [ ] Browser console
- [ ] Network tab trong DevTools
- [ ] File permissions (755 cho folder, 644 cho file)

---

🎉 **Chúc bạn deploy thành công!**
