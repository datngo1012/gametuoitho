// Script để tự động generate list.json từ tất cả file JAR trong thư mục
// Chạy: node generate-list.js

const fs = require('fs');
const path = require('path');

const gamesDir = __dirname;

// Đọc tất cả file trong thư mục
const files = fs.readdirSync(gamesDir);

// Filter chỉ lấy file .jar
const jarFiles = files.filter(file => file.toLowerCase().endsWith('.jar'));

// Tạo danh sách games
const gamesList = jarFiles.map(jarFile => {
    const baseName = jarFile.replace(/\.jar$/i, '');
    const jadFile = baseName + '.jad';
    const hasJad = fs.existsSync(path.join(gamesDir, jadFile));
    
    // Tạo tên đẹp từ filename
    const gameName = baseName
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
        .replace(/\d+/g, match => ' ' + match)
        .trim();
    
    return {
        filename: jarFile,
        name: gameName,
        jadFile: hasJad ? jadFile : null,
        icon: null,
        settings: {
            phone: "Nokia",
            width: "240",
            height: "320",
            sound: "on"
        }
    };
});

// Sort theo tên
gamesList.sort((a, b) => a.name.localeCompare(b.name));

// Ghi vào list.json
const output = JSON.stringify(gamesList, null, 2);
fs.writeFileSync(path.join(gamesDir, 'list.json'), output, 'utf8');

console.log(`✅ Đã tạo list.json với ${gamesList.length} games:`);
gamesList.forEach((game, index) => {
    console.log(`${index + 1}. ${game.name} (${game.filename})`);
});
