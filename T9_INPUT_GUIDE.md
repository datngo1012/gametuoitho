# Hướng dẫn sử dụng T9 Input Mode

## Tổng quan
Tính năng T9 Input cho phép bạn nhập chữ cái trên thiết bị di động hoặc bàn phím giống như điện thoại cổ điển.

## Cách sử dụng

### 1. Chuyển đổi chế độ
- **Nhấn phím `#` (NumpadDivide hoặc NumpadHash)** để chuyển đổi giữa:
  - **Chế độ số (123)**: Phím số hoạt động bình thường
  - **Chế độ chữ (ABC)**: Phím số nhập ký tự chữ cái theo kiểu T9

### 2. Nhập chữ trong chế độ ABC

Mỗi phím số tương ứng với một nhóm ký tự. Nhấn phím nhiều lần để cycle qua các ký tự:

| Phím | Các ký tự |
|------|-----------|
| **0** | `space` `0` |
| **1** | `. , ? ! ' " 1 - ( )` |
| **2** | `a b c 2` |
| **3** | `d e f 3` |
| **4** | `g h i 4` |
| **5** | `j k l 5` |
| **6** | `m n o 6` |
| **7** | `p q r s 7` |
| **8** | `t u v 8` |
| **9** | `w x y z 9` |

### 3. Ví dụ nhập chữ "hello"

1. Nhấn `#` để chuyển sang chế độ ABC
2. Nhấn `4` hai lần → `h`
3. Đợi 1 giây hoặc nhấn phím khác
4. Nhấn `3` hai lần → `e`
5. Nhấn `5` ba lần → `l`
6. Nhấn `5` ba lần → `l`
7. Nhấn `6` ba lần → `o`

### 4. Tính năng

- **Auto-confirm**: Sau 1 giây không nhấn phím, ký tự tự động được xác nhận
- **Preview mode**: Bạn sẽ thấy ký tự đang chọn trước khi nó được gửi vào game
- **Indicator**: Góc phải trên cùng hiển thị chế độ hiện tại (ABC/123)
- **Linh hoạt**: Nhấn phím khác sẽ tự động xác nhận ký tự trước đó

## Kỹ thuật Implementation

### File `key.js`
- **Class `T9InputManager`**: Quản lý logic nhập T9
  - `toggleInputMode()`: Chuyển đổi giữa numeric/text
  - `handleDigitPress(digit)`: Xử lý khi nhấn phím số
  - `confirmCurrentChar()`: Xác nhận ký tự hiện tại
  - Timeout: 1000ms để auto-confirm

### File `main.js`
- Tích hợp T9InputManager
- Xử lý phím `#` để toggle mode
- Hiển thị indicator trên UI
- Gửi ký tự vào event queue của game

## Lợi ích

✅ Cho phép nhập tên nhân vật, tin nhắn trong game J2ME  
✅ Hoạt động trên cả bàn phím máy tính và mobile  
✅ Tương thích với các game yêu cầu nhập text  
✅ UI/UX tương tự điện thoại Nokia cổ điển  

## Troubleshooting

**Q: Phím số không nhập chữ?**  
A: Kiểm tra xem đã bật chế độ ABC chưa (nhấn phím `#`)

**Q: Làm sao biết đang ở chế độ nào?**  
A: Xem indicator ở góc phải trên cùng màn hình (ABC/123)

**Q: Ký tự bị lặp?**  
A: Đợi 1 giây sau mỗi ký tự hoặc nhấn phím khác để auto-confirm

---
**Tác giả**: datngo1012  
**Ngày tạo**: November 8, 2025  
**Version**: 1.0
