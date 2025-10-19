# 🤝 Đóng góp vào dự án

Cảm ơn bạn đã quan tâm đến dự án! Mọi đóng góp đều được hoan nghênh.

## 🎯 Cách đóng góp

### 1. Báo lỗi (Bug Report)
Nếu bạn tìm thấy lỗi:
1. Kiểm tra xem đã có issue tương tự chưa
2. Tạo issue mới với:
   - Mô tả chi tiết lỗi
   - Các bước để reproduce
   - Screenshot/video nếu có
   - Browser và OS bạn dùng
   - File JAR gây lỗi (nếu có thể share)

### 2. Đề xuất tính năng (Feature Request)
1. Tạo issue với label `enhancement`
2. Mô tả tính năng mong muốn
3. Giải thích use case
4. Mockup/wireframe nếu có

### 3. Đóng góp code

#### Setup môi trường:
```bash
# Clone repo
git clone https://github.com/USERNAME/freej2me-web.git
cd freej2me-web

# Chạy local server
cd web
python -m http.server 8080
# hoặc
npm start
```

#### Quy trình:
1. **Fork** repo
2. **Clone** fork của bạn
3. Tạo **branch mới** từ `main`:
   ```bash
   git checkout -b feature/ten-tinh-nang
   # hoặc
   git checkout -b fix/ten-loi
   ```
4. **Code** và test kỹ
5. **Commit** với message rõ ràng:
   ```bash
   git commit -m "feat: thêm chức năng search game"
   # hoặc
   git commit -m "fix: sửa lỗi load game không có JAD"
   ```
6. **Push** lên fork của bạn:
   ```bash
   git push origin feature/ten-tinh-nang
   ```
7. Tạo **Pull Request** về repo chính

## 📝 Code Style

### JavaScript
- Dùng ES6+ syntax
- 2 spaces cho indent
- Single quotes cho strings
- Semicolons
- Meaningful variable names

```javascript
// ✅ Good
const gameList = await loadGames();
const gameName = game.name || 'Unknown';

// ❌ Bad
const x = await loadGames();
var n = game.name || "Unknown"
```

### HTML
- Indent 2 spaces
- Lowercase tags và attributes
- Close all tags
- Semantic HTML

```html
<!-- ✅ Good -->
<div class="game-list">
  <article class="game-item">
    <h2>Game Name</h2>
  </article>
</div>

<!-- ❌ Bad -->
<DIV class=gameList>
<div class="game-item">
<h2>Game Name
</DIV>
```

### CSS
- Dùng CSS variables
- Mobile-first approach
- BEM naming nếu có thể
- Group related properties

```css
/* ✅ Good */
.game-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-md);
  background-color: var(--bg-color);
}

/* ❌ Bad */
.game-item {
  background-color: #fff;
  display: flex;
  padding: 10px;
  align-items: center;
}
```

## 🧪 Testing

Trước khi submit PR, test:
- [ ] Website load được
- [ ] Game list hiển thị đúng
- [ ] Click vào game hoạt động
- [ ] Không có console errors
- [ ] Mobile responsive (nếu thay đổi UI)
- [ ] Works trên Chrome, Firefox, Safari

## 📋 Commit Message Convention

Dùng [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>: <description>

[optional body]
```

### Types:
- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Cập nhật documentation
- `style`: Format code (không ảnh hưởng logic)
- `refactor`: Refactor code
- `perf`: Cải thiện performance
- `test`: Thêm/sửa tests
- `chore`: Tasks khác (build, config, etc)

### Examples:
```
feat: thêm search box cho game list
fix: sửa lỗi game không load khi thiếu JAD
docs: cập nhật hướng dẫn deploy
style: format code theo standard
refactor: tách game-loader thành module riêng
perf: lazy load game thumbnails
```

## 🎨 Pull Request Guidelines

### PR Title:
```
feat: Thêm chức năng search game
fix: Sửa lỗi CORS khi load JAR
docs: Cập nhật README với ví dụ mới
```

### PR Description Template:
```markdown
## Mô tả
Mô tả ngắn gọn những gì PR này làm

## Thay đổi
- Thêm X
- Sửa Y
- Xóa Z

## Screenshots
(nếu có thay đổi UI)

## Checklist
- [ ] Code đã được test
- [ ] Không có console errors
- [ ] Documentation đã update (nếu cần)
- [ ] Mobile responsive (nếu thay đổi UI)
```

## 🎯 Các vấn đề dễ bắt đầu

Nếu mới đóng góp, hãy tìm issues với label:
- `good first issue`
- `help wanted`
- `documentation`

## 💡 Ideas cho Contributors

### Frontend:
- Cải thiện UI/UX
- Thêm animations
- Dark mode
- Search/filter
- Game categories

### Backend (nếu thêm):
- API cho game management
- User authentication
- Cloud save
- Leaderboard

### DevOps:
- CI/CD pipeline
- Automated testing
- Docker setup
- Deploy scripts

### Documentation:
- Tutorials
- Video guides
- API documentation
- Translations

## 📞 Liên hệ

- GitHub Issues: [Link]
- Discord: [Link] (nếu có)
- Email: [Email] (nếu muốn)

## 📜 License

Bằng việc đóng góp, bạn đồng ý code sẽ được license dưới GPL-3.0 giống project.

## 🙏 Cảm ơn

Cảm ơn tất cả contributors đã giúp dự án tốt hơn! 🎮

---

**Tip**: Đọc `TODO.md` để xem danh sách tính năng có thể implement!
