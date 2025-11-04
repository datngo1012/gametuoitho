const fs = require('fs');
const path = require('path');

// Đọc danh sách game
const gamesData = JSON.parse(fs.readFileSync('./web/games/list.json', 'utf8'));

// Hàm tạo slug
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

// Thu thập tất cả các thể loại
const categoriesMap = new Map();
gamesData.forEach(game => {
    if (game.tags) {
        game.tags.forEach(tag => {
            if (!categoriesMap.has(tag)) {
                categoriesMap.set(tag, []);
            }
            categoriesMap.get(tag).push({
                ...game,
                slug: createSlug(game.name)
            });
        });
    }
});

// Hàm tạo trang category
function generateCategoryPage(categoryName, games) {
    const slug = createSlug(categoryName);
    const gameCount = games.length;
    
    const gamesHTML = games.map(game => `
            <div class="game-card">
                <a href="../games/pages/${game.slug}.html" class="game-link">
                    <div class="game-icon-wrapper">
                        <img src="../games/icons/${game.id}.png" alt="${game.name}" class="game-icon" 
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23667eea%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2250%22 font-size=%2240%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22white%22%3E🎮%3C/text%3E%3C/svg%3E'">
                    </div>
                    <h3 class="game-name">${game.name}</h3>
                    <p class="game-desc">${game.description}</p>
                    <div class="game-tags">
                        ${game.tags.map(t => `<span class="tag">${t}</span>`).join(' ')}
                    </div>
                </a>
            </div>`).join('\n');
    
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>Game ${categoryName} Java - Tải Miễn Phí ${gameCount}+ Game ${categoryName}</title>
    <meta name="title" content="Game ${categoryName} Java - Tải Miễn Phí ${gameCount}+ Game ${categoryName}">
    <meta name="description" content="Chơi ${gameCount}+ game ${categoryName} Java cổ điển miễn phí ngay trên trình duyệt. Bộ sưu tập game ${categoryName} hay nhất thời kỳ Java Mobile.">
    <meta name="keywords" content="game ${categoryName}, game ${categoryName} java, tải game ${categoryName}, chơi game ${categoryName} online, game ${categoryName} miễn phí, game ${categoryName} nokia">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://gametuoitho.cc/web/categories/${slug}.html">
    <meta property="og:title" content="Game ${categoryName} Java - ${gameCount}+ Game Miễn Phí">
    <meta property="og:description" content="Bộ sưu tập ${gameCount}+ game ${categoryName} Java cổ điển. Chơi miễn phí ngay trên trình duyệt.">
    <meta property="og:image" content="https://gametuoitho.cc/preview.jpg">
    <meta property="og:locale" content="vi_VN">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://gametuoitho.cc/web/categories/${slug}.html">
    <meta property="twitter:title" content="Game ${categoryName} Java - ${gameCount}+ Game Miễn Phí">
    <meta property="twitter:description" content="Chơi game ${categoryName} Java miễn phí">
    <meta property="twitter:image" content="https://gametuoitho.cc/preview.jpg">
    
    <!-- Canonical -->
    <link rel="canonical" href="https://gametuoitho.cc/web/categories/${slug}.html">
    
    <!-- Robots -->
    <meta name="robots" content="index, follow">
    
    <!-- JSON-LD Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Game ${categoryName}",
      "description": "Bộ sưu tập ${gameCount} game ${categoryName} Java cổ điển",
      "url": "https://gametuoitho.cc/web/categories/${slug}.html",
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": ${gameCount},
        "itemListElement": ${JSON.stringify(games.slice(0, 10).map((game, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "VideoGame",
                "name": game.name,
                "url": `https://gametuoitho.cc/web/games/pages/${game.slug}.html`,
                "description": game.description,
                "genre": game.tags
            }
        })), null, 8)}
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        h1 {
            font-size: 2.5rem;
            color: #667eea;
            margin-bottom: 15px;
        }
        
        .subtitle {
            font-size: 1.2rem;
            color: #666;
        }
        
        .breadcrumb {
            display: inline-block;
            margin: 20px 0;
            padding: 12px 24px;
            background: rgba(255,255,255,0.2);
            border-radius: 30px;
        }
        
        .breadcrumb a {
            color: white;
            text-decoration: none;
            margin: 0 5px;
        }
        
        .breadcrumb a:hover {
            text-decoration: underline;
        }
        
        .games-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }
        
        .game-card {
            background: white;
            border-radius: 20px;
            padding: 25px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            transition: all 0.3s ease;
        }
        
        .game-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .game-link {
            text-decoration: none;
            color: inherit;
            display: block;
        }
        
        .game-icon-wrapper {
            width: 100%;
            aspect-ratio: 1;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .game-icon {
            max-width: 80px;
            max-height: 80px;
            border-radius: 15px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.15);
        }
        
        .game-name {
            font-size: 1.25rem;
            color: #333;
            margin-bottom: 10px;
        }
        
        .game-desc {
            font-size: 0.95rem;
            color: #666;
            line-height: 1.5;
            margin-bottom: 12px;
        }
        
        .game-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .tag {
            background: #e0e7ff;
            color: #667eea;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 500;
        }
        
        .info-section {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        
        .info-section h2 {
            color: #667eea;
            font-size: 1.8rem;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 3px solid #667eea;
        }
        
        .info-section p {
            font-size: 1.1rem;
            line-height: 1.8;
            color: #555;
            margin-bottom: 15px;
        }
        
        .categories-nav {
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        
        .categories-nav h3 {
            color: #667eea;
            font-size: 1.3rem;
            margin-bottom: 15px;
        }
        
        .category-links {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
        }
        
        .category-link {
            background: #f0f0f0;
            color: #333;
            padding: 10px 20px;
            border-radius: 20px;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s ease;
        }
        
        .category-link:hover {
            background: #667eea;
            color: white;
        }
        
        @media (max-width: 768px) {
            h1 {
                font-size: 1.8rem;
            }
            
            .header, .info-section, .categories-nav {
                padding: 25px;
            }
            
            .games-grid {
                grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
                gap: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="breadcrumb">
            <a href="../index.html">🏠 Trang chủ</a> / 
            <span>Game ${categoryName}</span>
        </div>
        
        <header class="header">
            <h1>🎮 Game ${categoryName} Java</h1>
            <p class="subtitle">Bộ sưu tập ${gameCount} game ${categoryName} cổ điển hay nhất</p>
        </header>
        
        <main>
            <section class="games-grid">
                ${gamesHTML}
            </section>
            
            <article class="info-section">
                <h2>Về Game ${categoryName}</h2>
                <p>Khám phá bộ sưu tập <strong>${gameCount} game ${categoryName}</strong> Java cổ điển tuyệt vời nhất. Tất cả đều được tối ưu để chơi miễn phí ngay trên trình duyệt web của bạn, không cần tải về hay cài đặt.</p>
                <p>Đây là những tựa game ${categoryName} kinh điển từ thời kỳ hoàng kim của Java Mobile, đã gắn liền với tuổi thơ của hàng triệu game thủ Việt Nam. Bạn có thể chơi ngay trên máy tính, laptop hoặc điện thoại thông minh.</p>
                <p><strong>Tại sao nên chơi game ${categoryName} trên Game Tuổi Thơ?</strong></p>
                <ul style="padding-left: 30px; margin-top: 15px; line-height: 2;">
                    <li>✓ Hoàn toàn miễn phí, không quảng cáo</li>
                    <li>✓ Chơi ngay trên trình duyệt, không cần tải về</li>
                    <li>✓ Đồ họa và gameplay giống y hệt phiên bản gốc</li>
                    <li>✓ Hỗ trợ đầy đủ trên mọi thiết bị</li>
                    <li>✓ Tự động lưu tiến trình game</li>
                </ul>
            </article>
        </main>
        
        <aside class="categories-nav">
            <h3>Khám phá thêm thể loại khác</h3>
            <div class="category-links">
                <a href="../index.html" class="category-link">🎮 Tất cả game</a>
            </div>
        </aside>
    </div>
</body>
</html>`;
    
    return { slug, html, gameCount };
}

// Tạo thư mục categories
const categoriesDir = './web/categories';
if (!fs.existsSync(categoriesDir)) {
    fs.mkdirSync(categoriesDir, { recursive: true });
}

// Sinh file HTML cho mỗi category
const categoryPages = [];
categoriesMap.forEach((games, categoryName) => {
    const { slug, html, gameCount } = generateCategoryPage(categoryName, games);
    const filename = `${slug}.html`;
    const filepath = path.join(categoriesDir, filename);
    
    fs.writeFileSync(filepath, html, 'utf8');
    console.log(`✓ Created category: ${categoryName} (${gameCount} games) -> ${filename}`);
    
    categoryPages.push({
        name: categoryName,
        slug: slug,
        url: `https://gametuoitho.cc/web/categories/${slug}.html`,
        gameCount: gameCount
    });
});

// Lưu danh sách categories
fs.writeFileSync('./web/categories/categories-index.json', JSON.stringify(categoryPages, null, 2), 'utf8');
console.log('\n✓ Generated categories-index.json');

// Cập nhật sitemap với các trang category
const currentSitemap = fs.readFileSync('./web/sitemap.xml', 'utf8');
const categoryUrls = categoryPages.map(cat => `  <url>
    <loc>${cat.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');

// Thêm category URLs vào sitemap
const updatedSitemap = currentSitemap.replace('</urlset>', `\n  <!-- Trang danh mục thể loại -->\n${categoryUrls}\n\n</urlset>`);
fs.writeFileSync('./web/sitemap.xml', updatedSitemap, 'utf8');
console.log('✓ Updated sitemap.xml with category pages');

// Cập nhật các trang category để link qua lại
console.log('\n🔗 Updating category cross-links...');
categoryPages.forEach(currentCat => {
    const filepath = path.join(categoriesDir, `${currentCat.slug}.html`);
    let html = fs.readFileSync(filepath, 'utf8');
    
    // Tạo links cho các category khác
    const otherCategories = categoryPages
        .filter(cat => cat.slug !== currentCat.slug)
        .map(cat => `<a href="${cat.slug}.html" class="category-link">${cat.name} (${cat.gameCount})</a>`)
        .join('\n                ');
    
    html = html.replace(
        '<a href="../index.html" class="category-link">🎮 Tất cả game</a>',
        `<a href="../index.html" class="category-link">🎮 Tất cả game</a>\n                ${otherCategories}`
    );
    
    fs.writeFileSync(filepath, html, 'utf8');
});

console.log(`\n🎉 Successfully generated ${categoryPages.length} category pages!`);
console.log('\nCategories created:');
categoryPages.forEach(cat => {
    console.log(`  - ${cat.name}: ${cat.gameCount} games`);
});
