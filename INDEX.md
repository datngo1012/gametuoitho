# 📚 TÀI LIỆU DỰ ÁN

## 📖 Tài liệu chính

### Bắt đầu
- **[README.md](./README.md)** - Giới thiệu tổng quan
- **[QUICK-START.md](./QUICK-START.md)** - Hướng dẫn nhanh ⚡
- **[SUMMARY.md](./SUMMARY.md)** - Tóm tắt dự án

### Hướng dẫn chi tiết
- **[web/README-VI.md](./web/README-VI.md)** - Hướng dẫn đầy đủ tiếng Việt 🇻🇳
- **[web/games/HUONG-DAN.md](./web/games/HUONG-DAN.md)** - Hướng dẫn thêm game
- **[DEPLOY.md](./DEPLOY.md)** - Hướng dẫn deploy 🚀

### Phát triển
- **[CHANGELOG.md](./CHANGELOG.md)** - Danh sách thay đổi
- **[TODO.md](./TODO.md)** - Tính năng tương lai
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Hướng dẫn đóng góp

## 🗂️ Cấu trúc tài liệu

```
freej2me-web/
├── README.md                    # 📄 Tổng quan
├── QUICK-START.md               # ⚡ Bắt đầu nhanh
├── SUMMARY.md                   # 📋 Tóm tắt
├── CHANGELOG.md                 # 📝 Thay đổi
├── TODO.md                      # ✅ Todo list
├── CONTRIBUTING.md              # 🤝 Đóng góp
├── DEPLOY.md                    # 🚀 Deploy
├── INDEX.md                     # 📚 Tài liệu này
├── package.json                 # 📦 NPM config
├── start-server.bat             # 🖥️ Windows script
├── .gitattributes              # 🔧 Git config
│
└── web/
    ├── index.html              # 🏠 Trang chủ
    ├── run.html                # 🎮 Trang chơi game
    ├── README-VI.md            # 📖 Hướng dẫn web
    │
    ├── games/                  # 📁 Thư mục game
    │   ├── list.json          # ⭐ Config game
    │   ├── list.json.example  # 📝 Ví dụ
    │   ├── list-popular-games.json.example
    │   ├── README.md          # 📖 Hướng dẫn
    │   ├── HUONG-DAN.md       # 📖 Chi tiết
    │   ├── .gitignore         # 🚫 Git ignore
    │   └── .gitkeep           # 📌 Git keep
    │
    └── src/
        ├── launcher.js        # 🚀 Main logic
        ├── game-loader.js     # 📥 Load game
        ├── main.js
        ├── key.js
        ├── eventqueue.js
        └── screenKbd.js
```

## 🎯 Đọc tài liệu theo mục đích

### Tôi muốn chơi game
1. [QUICK-START.md](./QUICK-START.md) - Setup nhanh
2. [web/games/HUONG-DAN.md](./web/games/HUONG-DAN.md) - Thêm game

### Tôi muốn tạo website game
1. [README.md](./README.md) - Tổng quan
2. [web/README-VI.md](./web/README-VI.md) - Hướng dẫn chi tiết
3. [DEPLOY.md](./DEPLOY.md) - Deploy lên internet

### Tôi muốn phát triển thêm
1. [SUMMARY.md](./SUMMARY.md) - Hiểu cấu trúc
2. [CHANGELOG.md](./CHANGELOG.md) - Xem đã thay đổi gì
3. [TODO.md](./TODO.md) - Các tính năng có thể thêm
4. [CONTRIBUTING.md](./CONTRIBUTING.md) - Quy tắc code

### Tôi muốn đóng góp
1. [CONTRIBUTING.md](./CONTRIBUTING.md) - Hướng dẫn đóng góp
2. [TODO.md](./TODO.md) - Chọn tính năng
3. Fork và code!

## 📝 Ví dụ & Templates

### File config mẫu
- `web/games/list.json.example` - Config cơ bản
- `web/games/list-popular-games.json.example` - Game phổ biến

### Scripts
- `start-server.bat` - Chạy server Windows
- `package.json` - NPM scripts

## 🔧 Tài liệu kỹ thuật

### APIs
- **FreeJ2ME**: Java ME emulator
- **CheerpJ**: Java to WASM compiler
- **WebGL**: 3D graphics
- **Canvas 2D**: 2D graphics
- **IndexedDB**: Storage

### Modules
- `game-loader.js` - Load game từ directory
- `launcher.js` - Initialize và run game
- `main.js` - Game runtime
- `key.js` - Keyboard handling
- `eventqueue.js` - Event management

## 📊 Cheatsheet

### Thêm game
```bash
# 1. Copy file
cp game.jar web/games/

# 2. Edit config
nano web/games/list.json

# 3. Reload browser
```

### Cài đặt phổ biến
```json
{
  "phone": "Nokia",
  "width": "240",
  "height": "320",
  "sound": "on"
}
```

### Deploy nhanh
```bash
# Netlify
cd web && netlify deploy --prod

# GitHub Pages
git push origin main
```

## 🆘 Troubleshooting

| Vấn đề | Xem tài liệu |
|--------|--------------|
| Game không chạy | [web/README-VI.md](./web/README-VI.md) |
| Lỗi CORS | [DEPLOY.md](./DEPLOY.md) |
| Không biết settings | [web/games/HUONG-DAN.md](./web/games/HUONG-DAN.md) |
| Muốn đóng góp | [CONTRIBUTING.md](./CONTRIBUTING.md) |

## 📞 Liên hệ & Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: (thêm nếu có)
- **Discord**: (thêm nếu có)

## 🔗 Links hữu ích

### Tài nguyên J2ME
- [J2ME Documentation](https://docs.oracle.com/javame/)
- [FreeJ2ME GitHub](https://github.com/hex007/freej2me)

### Tools
- [CheerpJ Docs](https://docs.leaningtech.com/cheerpj3)
- [WebGL Tutorial](https://webglfundamentals.org/)

### Game Resources
- Các website download game J2ME
- Emulator khác: J2ME Loader, KEmulator

## 📚 Đọc thêm

- **Blog posts** (nếu có)
- **Video tutorials** (nếu có)
- **Case studies** (nếu có)

---

## 🎓 Học theo từng bước

### Ngày 1: Setup
- [ ] Đọc README.md
- [ ] Chạy QUICK-START.md
- [ ] Thêm game đầu tiên

### Ngày 2: Hiểu rõ
- [ ] Đọc SUMMARY.md
- [ ] Đọc web/README-VI.md
- [ ] Thử các settings khác nhau

### Ngày 3: Deploy
- [ ] Đọc DEPLOY.md
- [ ] Deploy lên Netlify/Vercel
- [ ] Share với bạn bè

### Ngày 4+: Phát triển
- [ ] Đọc CHANGELOG.md
- [ ] Đọc TODO.md
- [ ] Pick một feature và implement!

---

**💡 Tip**: Bookmark trang này để dễ tra cứu!
