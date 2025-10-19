# 🎮 HƯỚNG DẪN NHANH

## Cài đặt và chạy

### 1️⃣ Thêm game
```
web/games/
  ├── game1.jar
  ├── game1.jad (optional)
  ├── game2.jar
  └── list.json
```

### 2️⃣ Cấu hình list.json
```json
[
  {
    "filename": "game1.jar",
    "name": "Tên Game",
    "jadFile": "game1.jad",
    "settings": {
      "phone": "Nokia",
      "width": "240",
      "height": "320",
      "sound": "on"
    }
  }
]
```

### 3️⃣ Chạy server
Windows:
```
start-server.bat
```

Linux/Mac:
```bash
cd web
python3 -m http.server 8080
```

### 4️⃣ Mở trình duyệt
```
http://localhost:8080
```

## ⚡ Quick Tips

✅ **Game phổ biến dùng**: Nokia, 240x320
✅ **Không có .jad**: Để `"jadFile": null`
✅ **Game bị lỗi**: Thử đổi `phone` và `width/height`
✅ **Game lag**: Bật `"queuedPaint": "on"`

## 🎯 Các game nên thử

- Asphalt 2 → Nokia, 240x320
- Diamond Rush → Standard, 176x220
- Bounce → Nokia, 128x160
- Super Mario → Standard, 240x320
- Contra → Nokia, 176x220

## 🐛 Gặp lỗi?

1. Xem Console (F12) để check lỗi
2. Thử xóa cache trình duyệt
3. Kiểm tra file .jar có đúng không
4. Thử setting khác cho game

## 📞 Liên hệ & Hỗ trợ

Mở issue trên GitHub hoặc tham gia cộng đồng!
