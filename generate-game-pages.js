const fs = require('fs');
const path = require('path');

// Đọc danh sách game
const gamesData = JSON.parse(fs.readFileSync('./web/games/list.json', 'utf8'));

// Hàm tạo slug từ tên game
function createSlug(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

// Hàm tạo nội dung HTML cho mỗi game
function generateGamePage(game) {
    const slug = createSlug(game.name);
    const tags = game.tags || [];
    const tagsHTML = tags.map(tag => `<span class="tag">${tag}</span>`).join('\n                        ');
    const tagsJSON = JSON.stringify(tags);
    
    // Keywords cho SEO
    const keywords = [
        game.name,
        `tải game ${game.name}`,
        `chơi ${game.name} online`,
        `game ${game.name} java`,
        `${game.name} miễn phí`,
        ...tags.map(t => `game ${t.toLowerCase()}`),
        'game java',
        'game tuổi thơ',
        'game nokia'
    ].join(', ');
    
    // Tạo features từ gameplay
    const features = [
        `Chơi ${game.name} miễn phí ngay trên trình duyệt`,
        'Không cần tải về, không cần cài đặt',
        'Đồ họa giống y hệt phiên bản gốc',
        'Hỗ trợ chơi trên máy tính và điện thoại',
        'Lưu tiến trình game tự động',
        'Hoàn toàn miễn phí, không quảng cáo làm phiền'
    ];
    
    const featuresHTML = features.map(f => `<li>${f}</li>`).join('\n                    ');
    
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${game.name} - Tải Game Java Miễn Phí | Chơi Ngay Trên Trình Duyệt</title>
    <meta name="title" content="${game.name} - Tải Game Java Miễn Phí | Chơi Ngay Trên Trình Duyệt">
    <meta name="description" content="Chơi ${game.name} miễn phí - ${game.description} Tải game java ${game.name} hoặc chơi ngay trên trình duyệt, không cần cài đặt.">
    <meta name="keywords" content="${keywords}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://gametuoitho.cc/web/games/pages/${slug}.html">
    <meta property="og:title" content="${game.name} - ${game.description}">
    <meta property="og:description" content="Chơi ${game.name} miễn phí ngay trên trình duyệt. ${game.gameplay}">
    <meta property="og:image" content="https://gametuoitho.cc/web/games/icons/${game.id}.png">
    <meta property="og:locale" content="vi_VN">
    <meta property="og:site_name" content="Game Tuổi Thơ">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://gametuoitho.cc/web/games/pages/${slug}.html">
    <meta property="twitter:title" content="${game.name} - Game Java Cổ Điển">
    <meta property="twitter:description" content="Chơi ${game.name} miễn phí ngay trên trình duyệt">
    <meta property="twitter:image" content="https://gametuoitho.cc/web/games/icons/${game.id}.png">
    
    <!-- Canonical -->
    <link rel="canonical" href="https://gametuoitho.cc/web/games/pages/${slug}.html">
    
    <!-- Robots -->
    <meta name="robots" content="index, follow">
    <meta name="googlebot" content="index, follow">
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "VideoGame",
      "name": "${game.name}",
      "description": "${game.description}",
      "genre": ${tagsJSON},
      "gamePlatform": ["Java Mobile", "Web Browser"],
      "operatingSystem": "Web Browser",
      "applicationCategory": "Game",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "VND",
        "availability": "https://schema.org/InStock"
      },
      "inLanguage": "vi-VN",
      "url": "https://gametuoitho.cc/web/games/pages/${slug}.html",
      "playMode": "SinglePlayer",
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "ratingCount": "1000"
      }
    }
    </script>
    
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .game-header {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        
        .game-title {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .game-icon {
            width: 100px;
            height: 100px;
            border-radius: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        h1 {
            font-size: 2.5rem;
            color: #667eea;
            margin: 0;
        }
        
        .game-meta {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
            margin-top: 15px;
        }
        
        .tag {
            background: #667eea;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
            font-weight: 500;
        }
        
        .game-content {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        
        h2 {
            color: #667eea;
            font-size: 1.8rem;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }
        
        .description, .gameplay, .features {
            margin-bottom: 30px;
        }
        
        p {
            font-size: 1.1rem;
            margin-bottom: 15px;
            color: #555;
        }
        
        .features ul, .gameplay ul {
            list-style: none;
            padding: 0;
        }
        
        .features li {
            padding: 12px 0;
            padding-left: 30px;
            position: relative;
            font-size: 1.05rem;
        }
        
        .features li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
            font-size: 1.3rem;
        }
        
        .gameplay ul li {
            margin-bottom: 10px;
            padding-left: 5px;
        }
        
        .play-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 18px 50px;
            border-radius: 50px;
            text-decoration: none;
            font-size: 1.2rem;
            font-weight: bold;
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
            margin: 20px 0;
        }
        
        .play-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 8px 30px rgba(102, 126, 234, 0.6);
        }
        
        .cta-section {
            text-align: center;
            padding: 30px 0;
        }
        
        .related-games {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        
        .back-link {
            display: inline-block;
            margin: 20px 0;
            color: white;
            text-decoration: none;
            font-size: 1.1rem;
            padding: 12px 30px;
            background: rgba(255,255,255,0.2);
            border-radius: 30px;
            transition: all 0.3s ease;
        }
        
        .back-link:hover {
            background: rgba(255,255,255,0.3);
        }
        
        .faq-section {
            margin-top: 40px;
            background: #f8f9fa;
            padding: 25px;
            border-radius: 15px;
        }
        
        .faq-section h2 {
            border: none;
        }
        
        .faq-section h3 {
            color: #667eea;
            font-size: 1.2rem;
            margin-bottom: 10px;
            margin-top: 20px;
        }
        
        @media (max-width: 768px) {
            h1 {
                font-size: 1.8rem;
            }
            
            .game-title {
                flex-direction: column;
                text-align: center;
            }
            
            .game-header, .game-content, .related-games {
                padding: 25px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="../../index.html" class="back-link">← Quay lại danh sách game</a>
        
        <article class="game-header">
            <div class="game-title">
                <img src="../icons/${game.id}.png" alt="${game.name} Game Icon" class="game-icon" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23667eea%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2250%22 font-size=%2240%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22white%22%3E🎮%3C/text%3E%3C/svg%3E'">
                <div>
                    <h1>${game.name}</h1>
                    <div class="game-meta">
                        ${tagsHTML}
                    </div>
                </div>
            </div>
        </article>
        
        <main class="game-content">
            <section class="description">
                <h2>Giới thiệu ${game.name}</h2>
                <p><strong>${game.name}</strong> là một trong những game Java kinh điển mà nhiều người yêu thích. ${game.description}</p>
                <p>Game nổi tiếng với lối chơi hấp dẫn, đồ họa đẹp mắt và gameplay gây nghiện. Đây là cơ hội để bạn quay lại với những kỷ niệm tuổi thơ tuyệt vời!</p>
            </section>
            
            <section class="gameplay">
                <h2>Cách chơi ${game.name}</h2>
                <p>${game.gameplay}</p>
                <p style="margin-top: 15px;">Game phù hợp với mọi lứa tuổi và có thể chơi trực tiếp trên trình duyệt mà không cần cài đặt gì thêm.</p>
            </section>
            
            <section class="features">
                <h2>Tính năng nổi bật</h2>
                <ul>
                    ${featuresHTML}
                </ul>
            </section>
            
            <div class="cta-section">
                <a href="../../run.html?app=${game.id}" class="play-button">🎮 Chơi ngay ${game.name}</a>
                <p style="margin-top: 15px; color: #888;">Không cần tải về - Chơi ngay trên trình duyệt</p>
            </div>
            
            <section style="margin-top: 40px;">
                <h2>Tại sao nên chơi ${game.name}?</h2>
                <p>${game.name} không chỉ là một trò chơi giải trí đơn thuần, mà còn là một phần kỷ niệm tuổi thơ của hàng triệu game thủ Việt Nam. Game giúp bạn giải trí, thư giãn sau những giờ làm việc căng thẳng.</p>
                <p>Với phiên bản online này, bạn có thể <strong>chơi ${game.name} miễn phí</strong> ngay trên trình duyệt mà không cần phải tải về hay cài đặt bất cứ thứ gì. Hãy quay trở lại với kỷ niệm đẹp đẽ của tuổi thơ!</p>
            </section>
            
            <section class="faq-section">
                <h2>Câu hỏi thường gặp về ${game.name}</h2>
                <div style="margin-top: 20px;">
                    <h3>❓ ${game.name} là game gì?</h3>
                    <p>${game.description}</p>
                    
                    <h3>❓ Có thể tải ${game.name} về điện thoại không?</h3>
                    <p>Có, bạn có thể tải file .jar của ${game.name} để chơi trên điện thoại Java, hoặc chơi ngay trên website không cần tải.</p>
                    
                    <h3>❓ ${game.name} có mất phí không?</h3>
                    <p>Hoàn toàn miễn phí! Bạn có thể chơi ${game.name} miễn phí 100% trên website của chúng tôi.</p>
                    
                    <h3>❓ Chơi ${game.name} trên máy tính được không?</h3>
                    <p>Được! Website hỗ trợ chơi game trực tiếp trên máy tính, laptop, và cả điện thoại thông minh.</p>
                    
                    <h3>❓ Cách tải game ${game.name} về máy?</h3>
                    <p>Bạn không cần tải về! Chỉ cần click vào nút "Chơi ngay" và game sẽ chạy trực tiếp trên trình duyệt của bạn.</p>
                </div>
            </section>
        </main>
        
        <aside class="related-games">
            <h2>Game liên quan</h2>
            <p>Nếu bạn thích ${game.name}, hãy thử các game khác:</p>
            <ul style="list-style: none; padding: 0; margin-top: 20px;">
                <li style="margin-bottom: 15px;">
                    <a href="../../index.html#games" style="color: #667eea; text-decoration: none; font-size: 1.1rem; font-weight: 500;">🎮 Xem tất cả game Java</a>
                </li>
            </ul>
        </aside>
        
        <a href="../../index.html" class="back-link" style="margin-top: 30px;">← Xem tất cả game</a>
    </div>
</body>
</html>`;
    
    return { slug, html };
}

// Tạo thư mục pages nếu chưa có
const pagesDir = './web/games/pages';
if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
}

// Sinh file HTML cho mỗi game
const gamePages = [];
gamesData.forEach(game => {
    const { slug, html } = generateGamePage(game);
    const filename = `${slug}.html`;
    const filepath = path.join(pagesDir, filename);
    
    fs.writeFileSync(filepath, html, 'utf8');
    console.log(`✓ Created: ${filename}`);
    
    gamePages.push({
        id: game.id,
        name: game.name,
        slug: slug,
        url: `https://gametuoitho.cc/web/games/pages/${slug}.html`,
        tags: game.tags || []
    });
});

// Lưu danh sách các trang đã tạo
fs.writeFileSync('./web/games/pages-index.json', JSON.stringify(gamePages, null, 2), 'utf8');
console.log('\n✓ Generated pages-index.json');

// Cập nhật sitemap.xml
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  
  <!-- Trang chủ -->
  <url>
    <loc>https://gametuoitho.cc/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Trang danh sách game -->
  <url>
    <loc>https://gametuoitho.cc/web/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Trang chơi game -->
  <url>
    <loc>https://gametuoitho.cc/web/run.html</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Các trang game riêng biệt -->
${gamePages.map(game => `  <url>
    <loc>${game.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`).join('\n')}

</urlset>
`;

fs.writeFileSync('./web/sitemap.xml', sitemap, 'utf8');
console.log('✓ Updated sitemap.xml');

console.log(`\n🎉 Successfully generated ${gamePages.length} game pages!`);
console.log('\nNext steps for SEO:');
console.log('1. Submit sitemap to Google Search Console');
console.log('2. Submit sitemap to Bing Webmaster Tools');
console.log('3. Share game pages on social media');
console.log('4. Create backlinks from other gaming websites');
