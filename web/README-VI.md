# 🎮 Website Game Tuổi Thơ - FreeJ2ME Web

Đây là phiên bản đã được tùy chỉnh của FreeJ2ME Web để tạo một website game tuổi thơ. Người dùng chỉ cần click vào game trong danh sách để chơi ngay, không cần upload hay cài đặt gì thêm.

## ✨ Tính năng

- 🎯 **Tự động cài đặt**: Game được tự động cài đặt từ thư mục khi load trang
- 🎮 **Chơi ngay**: Không cần upload file hay cấu hình, chỉ cần click và chơi
- 📱 **Hỗ trợ J2ME/Java ME**: Chơi các game Java cổ điển trên trình duyệt
- ⚙️ **Cấu hình linh hoạt**: Tùy chỉnh màn hình, loại điện thoại cho từng game
- 💾 **Lưu tiến độ**: Game data được lưu tự động trong trình duyệt

## 🚀 Cách sử dụng

### Bước 1: Thêm game vào thư mục

Đặt các file game (`.jar` và `.jad` nếu có) vào thư mục `web/games/`

```
web/
  games/
    - game1.jar
    - game1.jad
    - game2.jar
    - ...
```

### Bước 2: Cập nhật danh sách game

Chỉnh sửa file `web/games/list.json`:

```json
[
  {
    "filename": "game1.jar",
    "name": "Tên Game Hiển Thị",
    "jadFile": "game1.jad",
    "icon": null,
    "settings": {
      "phone": "Nokia",
      "width": "240",
      "height": "320",
      "sound": "on"
    }
  },
  {
    "filename": "game2.jar",
    "name": "Game Khác",
    "jadFile": null,
    "settings": {
      "phone": "Standard",
      "width": "176",
      "height": "220"
    }
  }
]
```

### Bước 3: Chạy website

```bash
cd web
python -m http.server 8080
# hoặc dùng bất kỳ web server nào
```

Mở trình duyệt và truy cập `http://localhost:8080`

## ⚙️ Cấu hình game

### Loại điện thoại (phone):
- `Standard` - Chuẩn chung
- `Nokia` - Nokia
- `Motorola` - Motorola  
- `Siemens` - Siemens
- `SonyEricsson` - Sony Ericsson

### Kích thước màn hình phổ biến:
- `128x128` - Màn hình vuông nhỏ
- `128x160` - Nokia cơ bản
- `176x220` - Nokia S40 phổ biến
- `240x320` - QVGA (phổ biến nhất)
- `320x240` - QVGA ngang

### Các tùy chọn khác:
- `sound`: `"on"/"off"` - Bật/tắt âm thanh
- `rotate`: `"on"/"off"` - Xoay màn hình 90 độ
- `fontSize`: `"0"` (auto), `"1"` (nhỏ), `"2"` (trung bình), `"3"` (lớn)
- `forceFullscreen`: `"on"/"off"` - Ép fullscreen
- `dgFormat`: `"444"`, `"4444"`, `"565"`, `"888"`, `"8888"` - Format DirectGraphics

## 🎮 Phím điều khiển

| Phím | Chức năng |
|------|-----------|
| `Esc` | Mở/đóng menu |
| `F1` hoặc `Q` | Phím mềm trái |
| `F2` hoặc `W` | Phím mềm phải |
| `0-9` | Bàn phím số |
| `E` | Phím * |
| `R` | Phím # |
| `↑↓←→` | Di chuyển |
| `Enter` | Nút OK |

## 📝 Lưu ý

- Lần đầu load trang, game sẽ được tự động cài đặt (có thể mất vài giây)
- Game data được lưu trong IndexedDB của trình duyệt
- Nếu xóa cache trình duyệt, tiến độ game sẽ bị mất
- Một số game yêu cầu file `.jad`, nếu không có game có thể không chạy được

## 🛠️ Cấu trúc dự án

```
web/
  ├── index.html              # Trang chủ (danh sách game)
  ├── run.html                # Trang chơi game
  ├── games/                  # Thư mục chứa game
  │   ├── list.json          # Danh sách game
  │   ├── *.jar              # File game
  │   └── *.jad              # File descriptor (optional)
  ├── src/
  │   ├── launcher.js        # Logic khởi chạy
  │   ├── game-loader.js     # Module load game từ thư mục
  │   └── ...
  └── libjs/                  # Thư viện JS
```

## 🔧 Phát triển thêm

Để thêm tính năng mới:

1. Chỉnh sửa `game-loader.js` để thay đổi cách load game
2. Chỉnh sửa `launcher.js` để thay đổi logic cài đặt
3. Chỉnh sửa `index.html` để thay đổi giao diện

## 📄 License

Dựa trên [FreeJ2ME](https://github.com/hex007/freej2me) - GPL-3.0 License

## 🙏 Credits

- FreeJ2ME team - Emulator J2ME tuyệt vời
- CheerpJ - Biên dịch Java sang WebAssembly
- Cộng đồng game thủ Việt Nam 🇻🇳
