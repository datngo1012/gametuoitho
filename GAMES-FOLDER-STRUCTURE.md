# Cấu trúc thư mục Games mới

## 📁 Cấu trúc thư mục

```
web/
├── games/
│   ├── list.json                    # Danh sách tất cả games
│   ├── CallOfDuty2_240x320.jar      # File JAR của game
│   ├── DiamondRush_240x320.jar
│   ├── Disco_240x320.jar
│   ├── NinjaSchool2_240x320.jar
│   ├── NinjaSchool3_240x320.jar
│   ├── Worms_176x220.jar
│   └── [game-id]/                   # (Optional) Thư mục cho mỗi game
│       └── icon.png                 # Icon của game (nếu có)
└── ...
```

## ✅ Các thay đổi đã thực hiện

### 1. **Bỏ hệ thống config files**
- ❌ Không còn: `/files/[game-id]/config/settings.conf`
- ❌ Không còn: `/files/[game-id]/config/appproperties.conf`
- ❌ Không còn: `/files/[game-id]/config/systemproperties.conf`
- ✅ Tất cả thông tin lấy từ `games/list.json`

### 2. **Đường dẫn game mới**
- ❌ Cũ: Load từ `/app/jar/` hoặc bundle
- ✅ Mới: Load trực tiếp từ `/app/games/[filename].jar`

### 3. **Cấu trúc JSON**
```json
{
  "id": "CallOfDuty2",
  "filename": "CallOfDuty2_240x320.jar",  // Tên file JAR trong games/
  "name": "Call of Duty 2",
  "jadFile": null,
  "settings": {
    "phone": "Nokia",
    "width": "240",
    "height": "320"
  },
  "description": "Mô tả game...",
  "gameplay": "Chi tiết gameplay...",
  "genre": ["shooter", "action", "war"],
  "tags": ["Bắn súng", "Hành động", "Chiến tranh"],
  "year": 2005,
  "rating": 4.7,
  "icon": "games/CallOfDuty2/icon.png"  // (Optional) Đường dẫn icon
}
```

## 🔄 Luồng hoạt động mới

### Khi load trang chủ:
1. Fetch `games/list.json`
2. Parse JSON thành danh sách games
3. Tạo card cho mỗi game với:
   - Icon (từ `icon` field hoặc tự tìm trong `games/[id]/icon.png`)
   - Tên game
   - Tags
   - Rating
4. Link đến: `run.html?app=[game-id]`

### Khi vào chơi game:
1. Lấy `app` parameter từ URL
2. Load `games/list.json` để tìm thông tin game
3. Hiển thị mô tả game (description + tags)
4. Load game từ: `/app/games/[filename].jar`
5. Khởi chạy game với settings từ JSON

## 📝 Các file đã chỉnh sửa

### `web/src/launcher.js`
**Hàm `loadGames()`:**
```javascript
// OLD: Load từ init.zip và config files
// NEW: Load từ games/list.json

// Không còn:
- await fetch("init.zip")
- await cjFileBlob("/files/apps.list")
- readToKv(content, napp[keyName])

// Mới:
- await fetch("games/list.json")
- napp.jarPath = "games/" + game.filename
- Direct load icon từ games/ folder
```

**Hàm `fillGamesList()`:**
```javascript
// OLD: link.href = "run?app=" + game.appId
// NEW: link.href = "run.html?app=" + game.appId
```

### `web/src/main.js`
**Bỏ hàm:**
- `ensureAppInstalled()` - Không cần nữa

**Cập nhật:**
```javascript
// OLD:
args = ['app', sp.get('app')];
await ensureAppInstalled(lib, app);

// NEW:
if (gameInfo.filename) {
    args = ['jar', cheerpjWebRoot + "/games/" + gameInfo.filename];
}
```

## 🚀 Cách thêm game mới

### Bước 1: Đặt file JAR vào thư mục games/
```
cp MyNewGame.jar web/games/MyNewGame_240x320.jar
```

### Bước 2: (Optional) Thêm icon
```
mkdir web/games/MyNewGame/
cp icon.png web/games/MyNewGame/icon.png
```

### Bước 3: Thêm vào list.json
```json
{
  "id": "MyNewGame",
  "filename": "MyNewGame_240x320.jar",
  "name": "My New Game",
  "settings": {
    "phone": "Nokia",
    "width": "240",
    "height": "320"
  },
  "description": "Game mới tuyệt vời...",
  "gameplay": "Cách chơi...",
  "genre": ["action", "adventure"],
  "tags": ["Hành động", "Phiêu lưu"],
  "year": 2024,
  "rating": 4.5,
  "icon": "games/MyNewGame/icon.png"
}
```

### Bước 4: Reload trang
Game sẽ tự động xuất hiện!

## 🎯 Ưu điểm của cấu trúc mới

### 1. **Đơn giản hơn**
- Tất cả games ở 1 folder
- Tất cả thông tin ở 1 file JSON
- Không cần hệ thống config phức tạp

### 2. **Dễ quản lý**
- Thêm game chỉ cần copy JAR + edit JSON
- Xóa game chỉ cần xóa JAR + remove từ JSON
- Update thông tin chỉ cần edit JSON

### 3. **Performance tốt hơn**
- Không cần load init.zip (lớn)
- Không cần parse nhiều config files
- JSON cache được browser

### 4. **Dễ deploy**
- Upload games/ folder lên server
- Không cần build/bundle process
- CDN friendly

### 5. **SEO friendly**
- Tất cả metadata trong JSON
- Dễ generate sitemap
- Dễ thêm structured data

## 🔧 Migration từ hệ thống cũ

Nếu bạn có games từ hệ thống cũ (init.zip):

### Bước 1: Extract init.zip
```bash
unzip init.zip -d temp/
```

### Bước 2: Copy JAR files
```bash
cp temp/**/*.jar web/games/
```

### Bước 3: Parse metadata
Tạo script để parse các config files và tạo `list.json`:
```javascript
// Script để migrate (ví dụ)
const fs = require('fs');
const games = [];

// Đọc apps.list
const appsList = fs.readFileSync('temp/files/apps.list', 'utf8').split('\n');

for (const appId of appsList) {
    const game = {
        id: appId,
        filename: findJarFile(appId), // Custom function
        name: readName(appId),
        settings: parseSettings(appId),
        // ... etc
    };
    games.push(game);
}

fs.writeFileSync('games/list.json', JSON.stringify(games, null, 2));
```

## 📊 Testing

### 1. Test load games
```
Mở: http://localhost/web/
Kiểm tra: Tất cả games hiển thị với tags và rating
```

### 2. Test play game
```
Click vào game
Kiểm tra: 
- Mô tả game hiển thị
- Game load thành công
- Settings đúng (width, height)
```

### 3. Test fallback
```
Xóa list.json tạm thời
Kiểm tra: Không crash, hiển thị empty state
```

## 🐛 Troubleshooting

### Game không load
**Nguyên nhân:** File JAR không tồn tại hoặc path sai
**Giải pháp:** 
1. Kiểm tra file tồn tại: `ls web/games/[filename].jar`
2. Kiểm tra `filename` trong JSON đúng với tên file thật

### Icon không hiển thị
**Nguyên nhân:** Path icon sai hoặc file không tồn tại
**Giải pháp:**
1. Kiểm tra path trong JSON: `"icon": "games/[id]/icon.png"`
2. Hoặc bỏ field `icon` để dùng empty icon

### Settings không đúng
**Nguyên nhân:** Settings trong JSON sai format
**Giải pháp:**
```json
"settings": {
    "phone": "Nokia",        // String
    "width": "240",         // String, không phải number!
    "height": "320"         // String, không phải number!
}
```

### Game không trong danh sách
**Nguyên nhân:** Chưa thêm vào `list.json`
**Giải pháp:** Thêm game object vào array trong JSON

## 📱 Icon Guidelines

### Format
- PNG hoặc JPG
- Kích thước khuyến nghị: 128x128 hoặc 256x256
- Square (vuông)

### Vị trí
```
Option 1: Direct path
"icon": "games/myicon.png"

Option 2: Game folder
"icon": "games/GameID/icon.png"

Option 3: External URL
"icon": "https://example.com/icon.png"

Option 4: Null (dùng empty icon)
"icon": null
```

---

**Lưu ý:** Backup dữ liệu cũ trước khi migrate sang hệ thống mới!
