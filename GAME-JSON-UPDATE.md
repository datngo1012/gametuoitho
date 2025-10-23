# Cập nhật hệ thống Game với JSON và Tags

## 📝 Các thay đổi đã thực hiện

### 1. File `web/games/list.json`
- ✅ Đã cập nhật tất cả games với cấu trúc mới
- ✅ Thêm `id` cho mỗi game
- ✅ Thêm `genre` (array) - các thể loại game
- ✅ Thêm `tags` (array) - các tag tiếng Việt hiển thị
- ✅ Thêm `year` - năm phát hành
- ✅ Thêm `rating` - đánh giá từ 1-5 sao
- ✅ Giữ nguyên `description` và `gameplay` chi tiết

### 2. File `web/src/launcher.js`
**Thay đổi hàm `loadGames()`:**
- ❌ Bỏ: `await fetch("init.zip")` 
- ✅ Thêm: `await fetch("games/list.json")`
- ✅ Load danh sách game từ JSON thay vì ZIP
- ✅ Parse và convert sang format app
- ✅ Có fallback nếu JSON load lỗi

**Thay đổi hàm `fillGamesList()`:**
- ✅ Hiển thị tags cho mỗi game (tối đa 3 tags)
- ✅ Hiển thị rating với icon ⭐
- ✅ Thêm alt text cho icon (SEO friendly)

### 3. File `web/index.html`
**CSS mới:**
```css
.game-tags - Container cho tags
.game-tag - Mỗi tag với gradient background
.game-rating - Hiển thị rating với màu vàng
```

### 4. File `web/src/main.js`
**Thêm 2 hàm mới:**
- `loadGameInfo(appId)` - Load thông tin game từ JSON
- `showGameDescription(gameInfo)` - Hiển thị mô tả game khi loading

**Cập nhật:**
- ✅ Load và hiển thị mô tả game khi vào chơi
- ✅ Hiển thị tags trong màn hình loading

### 5. File `web/run.html`
**CSS mới:**
```css
.game-description - Box mô tả game
.desc-tags - Tags trong mô tả
.desc-tag - Style cho từng tag
```

## 🎮 Cấu trúc Game JSON

```json
{
  "id": "GameID",
  "filename": "GameFile.jar",
  "name": "Tên Game",
  "jadFile": null,
  "settings": {
    "phone": "Nokia",
    "width": "240",
    "height": "320"
  },
  "description": "Mô tả ngắn gọn về game...",
  "gameplay": "Mô tả chi tiết gameplay...",
  "genre": ["genre1", "genre2", "genre3"],
  "tags": ["Tag 1", "Tag 2", "Tag 3"],
  "year": 2008,
  "rating": 4.8
}
```

## 📊 Genres đã sử dụng

| Genre Code | Tiếng Việt | Sử dụng |
|------------|------------|---------|
| shooter | Bắn súng | Call of Duty 2 |
| action | Hành động | Nhiều game |
| war | Chiến tranh | Call of Duty 2 |
| adventure | Phiêu lưu | Diamond Rush, Ninja School |
| puzzle | Giải đố | Diamond Rush |
| platform | Platform | Diamond Rush |
| rhythm | Nhịp điệu | Disco |
| music | Âm nhạc | Disco |
| casual | Giải trí | Disco |
| rpg | Nhập vai | Ninja School 2, 3 |
| strategy | Chiến lược | Worms |
| turnbased | Theo lượt | Worms |
| comedy | Hài hước | Worms |

## 🎯 Tính năng mới

### 1. Hiển thị Tags trên Card Game
- Tags xuất hiện dưới tên game
- Gradient background đẹp mắt
- Responsive trên mobile
- Tối đa 3 tags hiển thị

### 2. Hiển thị Rating
- Icon ⭐ với số điểm (0.0 - 5.0)
- Màu vàng nổi bật
- Giúp người dùng chọn game hay

### 3. Mô tả Game khi Loading
- Hiển thị trong màn hình loading
- Có tên game, mô tả và tags
- Background trắng, dễ đọc
- Tự động ẩn khi game bắt đầu

## 📱 Responsive Design

### Desktop
- Tags hiển thị đầy đủ
- Rating rõ ràng
- Mô tả game rộng rãi

### Mobile
- Tags thu nhỏ
- Mô tả game responsive 90% width
- Font size điều chỉnh phù hợp

## 🚀 Hướng dẫn thêm Game mới

1. **Thêm vào `games/list.json`:**
```json
{
  "id": "TenGameMoi",
  "filename": "TenGameMoi_240x320.jar",
  "name": "Tên Game Mới",
  "jadFile": null,
  "settings": {
    "phone": "Nokia",
    "width": "240",
    "height": "320"
  },
  "description": "Mô tả ngắn về game này...",
  "gameplay": "Chi tiết cách chơi...",
  "genre": ["action", "adventure"],
  "tags": ["Hành động", "Phiêu lưu", "3D"],
  "year": 2024,
  "rating": 4.5
}
```

2. **Đặt file JAR vào thư mục phù hợp**

3. **Reload trang** - Game sẽ tự động xuất hiện!

## ⚡ Performance

- JSON nhẹ hơn ZIP rất nhiều
- Load nhanh hơn
- Dễ cache
- Dễ cập nhật

## 🔧 Troubleshooting

### Lỗi: Games không load
**Giải pháp:** Kiểm tra `games/list.json` có đúng format JSON

### Lỗi: Tags không hiển thị
**Giải pháp:** Đảm bảo CSS đã được load đầy đủ trong `index.html`

### Lỗi: Mô tả không hiển thị khi vào game
**Giải pháp:** 
1. Kiểm tra game có `id` trong JSON
2. Kiểm tra CSS `.game-description` trong `run.html`
3. Xem console để debug

## 📈 SEO Benefits

- ✅ Alt text cho images
- ✅ Structured data sẵn sàng từ JSON
- ✅ Rich content với description
- ✅ Tags giúp categorization tốt hơn

## 🎨 Customization

### Đổi màu Tags
Sửa trong `web/index.html`:
```css
.game-tag {
  background: linear-gradient(135deg, #YOUR_COLOR1 0%, #YOUR_COLOR2 100%);
}
```

### Thay đổi số Tags hiển thị
Sửa trong `web/src/launcher.js`:
```javascript
game.tags.slice(0, 3) // Đổi 3 thành số khác
```

### Đổi style Rating
Sửa trong `web/index.html`:
```css
.game-rating {
  color: #YOUR_COLOR;
}
```

---

**Lưu ý quan trọng:** 
- Backup `init.zip` cũ nếu cần rollback
- Test trên nhiều trình duyệt
- Kiểm tra responsive trên mobile thật
