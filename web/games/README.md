# 📁 Thư mục Games

Đặt các file JAR của bạn vào đây. Website sẽ tự động quét và hiển thị tất cả các game.

## 🚀 Cách thêm game (TỰ ĐỘNG)

### Bước 1: Copy file JAR
Đặt tất cả file `.jar` (và `.jad` nếu có) vào thư mục này:
```
games/
  ├── game1.jar
  ├── game1.jad (optional)
  ├── game2.jar
  ├── game3.jar
  └── ...
```

### Bước 2: Generate list.json tự động

**Windows:**
```bash
# Cách 1: Double click file
generate-list.bat

# Cách 2: PowerShell (không cần Python/Node)
powershell -ExecutionPolicy Bypass -File generate-list.ps1
```

**Linux/Mac hoặc có Python:**
```bash
python3 generate-list.py
```

**Có Node.js:**
```bash
node generate-list.js
```

### Bước 3: Refresh trang web
Mở lại trang web, tất cả game sẽ tự động load!

---

## ✏️ Cách thêm game (THỦ CÔNG)

Nếu muốn tự chỉnh sửa, edit file `list.json`:

```json
[
  {
    "filename": "game.jar",
    "name": "Tên Game Đẹp",
    "jadFile": "game.jad",
    "icon": null,
    "settings": {
      "phone": "Nokia",
      "width": "240",
      "height": "320",
      "sound": "on"
    }
  }
]
```

## 🎮 Settings phổ biến

### Loại điện thoại:
- `Nokia` - Nokia (phổ biến nhất) ⭐
- `Standard` - Chuẩn chung
- `Motorola` - Motorola
- `Siemens` - Siemens
- `SonyEricsson` - Sony Ericsson

### Kích thước màn hình:
- `240x320` - QVGA (phổ biến nhất) ⭐
- `176x220` - Nokia S40
- `128x160` - Nokia cơ bản
- `320x240` - QVGA ngang
- `128x128` - Màn hình vuông

### Các tùy chọn khác:
- `sound: "on"/"off"` - Âm thanh
- `rotate: "on"/"off"` - Xoay màn hình
- `fontSize: "0"/"1"/"2"/"3"` - Kích thước font
- `queuedPaint: "on"/"off"` - Hữu ích nếu game bị lag

## 📝 Lưu ý

✅ **File JAR**: Bắt buộc
✅ **File JAD**: Optional, nhưng một số game cần
✅ **Icon**: Tự động lấy từ JAR, hoặc để `null`
✅ **Settings**: Mặc định Nokia 240x320 là tốt nhất

## 🔧 Troubleshooting

**Game không chạy?**
1. Thử đổi `phone` thành `Standard`
2. Thử kích thước khác: `176x220` hoặc `128x160`
3. Bật `queuedPaint: "on"` nếu game bị treo

**Lỗi load game?**
1. Kiểm tra file JAR có bị lỗi không
2. Thử tìm file JAD tương ứng
3. Xem console log (F12) để debug

---

💡 **Khuyến nghị**: Dùng script tự động để generate list.json, sau đó chỉnh sửa tên và settings nếu cần!
