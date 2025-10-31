# Hướng dẫn Setup Comment System với Supabase

## Bước 1: Tạo Project trên Supabase

1. Truy cập [https://supabase.com](https://supabase.com)
2. Đăng ký/Đăng nhập tài khoản
3. Tạo project mới (chọn region gần nhất với người dùng của bạn)
4. Đợi project được khởi tạo (khoảng 2-3 phút)

## Bước 2: Tạo Database Schema

1. Vào project vừa tạo
2. Click vào **SQL Editor** ở sidebar bên trái
3. Click **New Query**
4. Copy toàn bộ nội dung file `supabase-schema.sql` và paste vào editor
5. Click **Run** để thực thi script
6. Kiểm tra trong **Table Editor** để xác nhận các bảng đã được tạo:
   - `comments`
   - `comment_reactions`
   - View: `comments_with_stats`

## Bước 3: Lấy API Keys

1. Vào **Settings** > **API** trong sidebar
2. Copy 2 giá trị sau:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Bước 4: Cấu hình trong Code

Mở file `web/src/commentService.js` và thay thế:

```javascript
const SUPABASE_URL = 'YOUR_SUPABASE_URL'; // Thay bằng Project URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Thay bằng anon key
```

Ví dụ:
```javascript
const SUPABASE_URL = 'https://abcdefgh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDU0MzY4MDAsImV4cCI6MTk2MTAxMjgwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
```

## Bước 5: Test chức năng

1. Mở trang web trong browser
2. Nhập tên để đăng nhập vào hệ thống comment
3. Thử các chức năng:
   - ✅ Thêm bình luận mới
   - ✅ Trả lời bình luận
   - ✅ Thêm reactions (👍❤️😂😮😢😠)
   - ✅ Xem thời gian bình luận
   - ✅ Đăng xuất và đăng nhập lại

## Bước 6: Kiểm tra dữ liệu trong Supabase

1. Vào **Table Editor** trong Supabase
2. Click vào bảng `comments` để xem các bình luận
3. Click vào bảng `comment_reactions` để xem các reactions

## Các tính năng đã implement

### 1. User Management
- ✅ Đăng nhập bằng tên (lưu vào localStorage)
- ✅ Logout và xóa session
- ✅ Tự động ghi nhớ user khi quay lại

### 2. Comments
- ✅ Hiển thị danh sách bình luận (sắp xếp mới nhất trước)
- ✅ Thêm bình luận mới
- ✅ Trả lời bình luận (nested replies)
- ✅ Hiển thị thời gian tương đối (vừa xong, 5 phút trước, 2 giờ trước...)
- ✅ Character counter (max 1000 ký tự)

### 3. Reactions
- ✅ 6 loại reactions: Like 👍, Love ❤️, Haha 😂, Wow 😮, Sad 😢, Angry 😠
- ✅ Toggle reaction (click lại để bỏ)
- ✅ Đếm số lượng mỗi reaction
- ✅ Highlight reaction của user hiện tại

### 4. UI/UX
- ✅ Responsive design (mobile & desktop)
- ✅ Dark/Light theme support
- ✅ Neumorphism design matching với theme hiện tại
- ✅ Loading states
- ✅ Toast notifications
- ✅ Smooth animations

## Cấu trúc Database

### Table: comments
```
id: UUID (Primary Key)
parent_id: UUID (Foreign Key -> comments.id) - null cho top-level comments
username: VARCHAR(100)
content: TEXT
created_at: TIMESTAMP
updated_at: TIMESTAMP
is_deleted: BOOLEAN
```

### Table: comment_reactions
```
id: UUID (Primary Key)
comment_id: UUID (Foreign Key -> comments.id)
username: VARCHAR(100)
reaction_type: VARCHAR(20) - like|love|haha|wow|sad|angry
created_at: TIMESTAMP
UNIQUE(comment_id, username, reaction_type)
```

### View: comments_with_stats
Tự động tính toán:
- Số lượng mỗi loại reaction
- Số lượng replies
- Giúp query nhanh hơn khi load comments

## Tối ưu hóa Performance

1. **Indexes**: Đã tạo indexes cho các trường thường query:
   - `parent_id` - để tìm replies nhanh
   - `created_at` - để sort theo thời gian
   - `comment_id` - trong bảng reactions

2. **View với stats**: Sử dụng view `comments_with_stats` để giảm số lượng query

3. **Pagination**: Đã implement limit/offset cho việc load comments (mặc định 50)

## Security

1. **Row Level Security (RLS)**: Đã enable cho cả 2 bảng
2. **Policies**:
   - Public có thể đọc và tạo comments/reactions
   - Chỉ hiển thị comments chưa bị xóa
3. **Input validation**:
   - Username: 2-100 ký tự
   - Content: 1-1000 ký tự
   - Reaction type: chỉ 6 loại được định nghĩa

## Troubleshooting

### Lỗi "Failed to fetch"
- Kiểm tra SUPABASE_URL và SUPABASE_ANON_KEY
- Kiểm tra CORS settings trong Supabase (mặc định đã cho phép all origins)

### Lỗi "Permission denied"
- Kiểm tra RLS policies đã được tạo đúng
- Đảm bảo đã chạy đầy đủ SQL script

### Comments không hiển thị
- Mở DevTools > Console để xem lỗi
- Kiểm tra Network tab để xem API responses
- Verify data trong Table Editor của Supabase

## Mở rộng trong tương lai

Có thể thêm các tính năng:
- [ ] Edit/Delete comment (với quyền owner)
- [ ] Report spam/abuse
- [ ] Like/Dislike thay vì reactions
- [ ] Pagination với infinite scroll
- [ ] Real-time updates với Supabase Realtime
- [ ] Rich text editor (bold, italic, links)
- [ ] Upload images/GIFs
- [ ] Mention users (@username)
- [ ] Email notifications
