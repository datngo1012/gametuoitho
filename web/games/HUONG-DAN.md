# Hướng dẫn thêm game vào website

## Bước 1: Chuẩn bị file game
- Tải file `.jar` của game Java/J2ME
- Nếu có, cũng tải file `.jad` đi kèm

## Bước 2: Đặt file vào thư mục
1. Mở thư mục `web/games/`
2. Copy file `.jar` (và `.jad` nếu có) vào đây

## Bước 3: Cập nhật danh sách game
1. Mở file `web/games/list.json`
2. Thêm thông tin game vào danh sách:

```json
{
  "filename": "tên-file.jar",
  "name": "Tên Game Hiển Thị",
  "jadFile": "tên-file.jad",
  "icon": null,
  "settings": {
    "phone": "Nokia",
    "width": "240",
    "height": "320",
    "sound": "on",
    "rotate": "off"
  }
}
```

## Các tùy chọn settings:

### phone (Loại điện thoại):
- `Standard` - Chuẩn
- `Nokia` - Nokia
- `Motorola` - Motorola
- `Siemens` - Siemens
- `SonyEricsson` - Sony Ericsson

### Kích thước màn hình phổ biến:
- `96x65`
- `128x128`
- `128x160`
- `176x208`
- `176x220` (phổ biến)
- `240x320` (phổ biến)
- `320x240`

### Các tùy chọn khác:
- `sound`: `"on"` hoặc `"off"` - Bật/tắt âm thanh
- `rotate`: `"on"` hoặc `"off"` - Xoay màn hình
- `fontSize`: `"0"` (auto), `"1"` (nhỏ), `"2"` (trung bình), `"3"` (lớn)

## Ví dụ đầy đủ:

```json
[
  {
    "filename": "asphalt2.jar",
    "name": "Asphalt 2",
    "jadFile": "asphalt2.jad",
    "icon": null,
    "settings": {
      "phone": "Nokia",
      "width": "240",
      "height": "320",
      "sound": "on",
      "rotate": "off"
    }
  },
  {
    "filename": "diamond-rush.jar",
    "name": "Diamond Rush",
    "jadFile": null,
    "icon": null,
    "settings": {
      "phone": "Standard",
      "width": "176",
      "height": "220",
      "sound": "on"
    }
  }
]
```

## Bước 4: Test
1. Refresh lại trang web
2. Game sẽ tự động được cài đặt và hiển thị trong danh sách
3. Click vào game để chơi!

## Lưu ý:
- Nếu không có file `.jad`, để `"jadFile": null`
- Icon sẽ tự động lấy từ file JAR
- Lần đầu load có thể mất một chút thời gian để cài đặt game
- Data của game được lưu trong trình duyệt (localStorage)
