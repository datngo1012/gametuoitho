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

// Hàm tạo HTML page với game player
function generateGamePageWithPlayer(game) {
    const slug = createSlug(game.name);
    const tags = game.tags || [];
    const tagsHTML = tags.map(tag => `<span class="tag">${tag}</span>`).join('\n                        ');
    const tagsJSON = JSON.stringify(tags);
    
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
    
    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Primary Meta Tags -->
    <title>${game.name} - Chơi Game Java Miễn Phí Online</title>
    <meta name="title" content="${game.name} - Chơi Game Java Miễn Phí Online">
    <meta name="description" content="Chơi ${game.name} miễn phí - ${game.description} Chơi ngay trên trình duyệt, không cần tải về.">
    <meta name="keywords" content="${keywords}">
    
    <!-- Open Graph -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://gametuoitho.cc/web/games/pages/${slug}.html">
    <meta property="og:title" content="${game.name} - ${game.description}">
    <meta property="og:description" content="Chơi ${game.name} miễn phí ngay trên trình duyệt">
    <meta property="og:image" content="https://gametuoitho.cc/web/games/icons/${game.id}.png">
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="${game.name} - Game Java">
    <meta property="twitter:description" content="Chơi ${game.name} miễn phí">
    
    <!-- Canonical -->
    <link rel="canonical" href="https://gametuoitho.cc/web/games/pages/${slug}.html">
    
    <!-- Robots -->
    <meta name="robots" content="index, follow">
    
    <!-- JSON-LD -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "VideoGame",
      "name": "${game.name}",
      "description": "${game.description}",
      "genre": ${tagsJSON},
      "gamePlatform": ["Java Mobile", "Web Browser"],
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "VND"
      }
    }
    </script>
    
    <!-- Load Java Emulator Libraries -->
    <script src="../../version14.js"></script>
    <script src="../../loader.js"></script>
    
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .back-link {
            display: inline-block;
            margin: 15px 0;
            color: white;
            text-decoration: none;
            padding: 10px 25px;
            background: rgba(255,255,255,0.2);
            border-radius: 25px;
            transition: all 0.3s ease;
        }
        
        .back-link:hover {
            background: rgba(255,255,255,0.3);
        }
        
        .game-header {
            background: white;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        
        .game-title {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        
        .game-icon {
            width: 80px;
            height: 80px;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        h1 {
            font-size: 2rem;
            color: #667eea;
            margin: 0 0 10px 0;
        }
        
        .game-meta {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .tag {
            background: #667eea;
            color: white;
            padding: 6px 14px;
            border-radius: 15px;
            font-size: 0.85rem;
        }
        
        .game-player {
            background: white;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        #loading-screen {
            padding: 40px;
        }
        
        .loading-icon {
            font-size: 3em;
            margin-bottom: 20px;
            animation: bounce 1s infinite;
        }
        
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
        
        .loading-text {
            font-size: 1.2rem;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .loading-subtext {
            color: #999;
            font-size: 0.9rem;
        }
        
        .progress-bar {
            width: 100%;
            height: 8px;
            background: #f0f0f0;
            border-radius: 10px;
            overflow: hidden;
            margin-top: 20px;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #667eea, #764ba2);
            width: 0%;
            transition: width 0.3s ease;
        }
        
        #game-container {
            display: none;
        }
        
        #game-display {
            margin: 0 auto;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        }
        
        .game-content {
            background: white;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        
        h2 {
            color: #667eea;
            font-size: 1.5rem;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
        }
        
        p {
            line-height: 1.6;
            margin-bottom: 12px;
            color: #555;
        }
        
        .faq-section {
            margin-top: 30px;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 15px;
        }
        
        .faq-section h2 {
            border: none;
        }
        
        .faq-section h3 {
            color: #667eea;
            font-size: 1.1rem;
            margin: 15px 0 8px 0;
        }
        
        @media (max-width: 768px) {
            .game-title {
                flex-direction: column;
                text-align: center;
            }
            h1 {
                font-size: 1.5rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="../../index.html" class="back-link">← Quay lại</a>
        
        <article class="game-header">
            <div class="game-title">
                <img src="../icons/${game.id}.png" alt="${game.name}" class="game-icon" 
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23667eea%22 width=%22100%22 height=%22100%22/%3E%3Ctext x=%2250%22 y=%2250%22 font-size=%2240%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22white%22%3E🎮%3C/text%3E%3C/svg%3E'">
                <div>
                    <h1>${game.name}</h1>
                    <div class="game-meta">
                        ${tagsHTML}
                    </div>
                </div>
            </div>
        </article>
        
        <section class="game-player">
            <div id="loading-screen">
                <div class="loading-icon">🎮</div>
                <div class="loading-text">Đang tải ${game.name}...</div>
                <div class="loading-subtext">Vui lòng đợi trong giây lát</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="progress"></div>
                </div>
            </div>
            <div id="game-container"></div>
        </section>
        
        <main class="game-content">
            <section>
                <h2>Giới thiệu ${game.name}</h2>
                <p><strong>${game.name}</strong> là một trong những game Java kinh điển. ${game.description}</p>
                <p>Game nổi tiếng với lối chơi hấp dẫn và đồ họa đẹp mắt. Đây là cơ hội để bạn quay lại với kỷ niệm tuổi thơ!</p>
            </section>
            
            <section style="margin-top: 30px;">
                <h2>Cách chơi ${game.name}</h2>
                <p>${game.gameplay}</p>
                <p style="margin-top: 10px;">Game phù hợp với mọi lứa tuổi và có thể chơi ngay trên trình duyệt.</p>
            </section>
            
            <section class="faq-section">
                <h2>Câu hỏi thường gặp</h2>
                <h3>❓ ${game.name} là game gì?</h3>
                <p>${game.description}</p>
                
                <h3>❓ Có thể tải ${game.name} về không?</h3>
                <p>Bạn có thể tải file .jar hoặc chơi ngay trên website không cần tải.</p>
                
                <h3>❓ ${game.name} có mất phí không?</h3>
                <p>Hoàn toàn miễn phí 100%!</p>
                
                <h3>❓ Chơi trên máy tính được không?</h3>
                <p>Được! Hỗ trợ cả máy tính, laptop và điện thoại.</p>
            </section>
        </main>
        
        <a href="../../index.html" class="back-link">← Xem tất cả game</a>
    </div>
    
    <script type="module">
        const GAME_ID = '${game.id}';
        const GAME_FILENAME = '${game.filename}';
        const GAME_SETTINGS = ${JSON.stringify(game.settings)};
        
        async function updateProgress(percent, text) {
            const progress = document.getElementById('progress');
            const loadingText = document.querySelector('.loading-text');
            if (progress) progress.style.width = percent + '%';
            if (loadingText && text) loadingText.textContent = text;
        }
        
        async function loadGame() {
            try {
                await updateProgress(10, 'Đang khởi tạo...');
                
                // Init CheerpJ
                await cheerpjInit({ enableDebug: false });
                await updateProgress(30, 'Đang tải thư viện Java...');
                
                // Load freej2me library
                const lib = await cheerpjRunLibrary('/app/web/freej2me-web.jar');
                await updateProgress(50, 'Đang tải ${game.name}...');
                
                // Create display
                const display = await cheerpjCreateDisplay(240, 320);
                await updateProgress(70, 'Đang chuẩn bị giao diện...');
                
                // Setup game container
                const container = document.getElementById('game-container');
                const gameDisplay = document.createElement('div');
                gameDisplay.id = 'game-display';
                gameDisplay.appendChild(display);
                container.appendChild(gameDisplay);
                
                await updateProgress(90, 'Đang khởi động game...');
                
                // Run the game
                const Config = await lib.org.recompile.freej2me.Config;
                if (GAME_SETTINGS.phone) await Config.settings.put('phone', GAME_SETTINGS.phone);
                if (GAME_SETTINGS.width) await Config.settings.put('width', GAME_SETTINGS.width);
                if (GAME_SETTINGS.height) await Config.settings.put('height', GAME_SETTINGS.height);
                
                await cheerpjRunJar('/app/web/freej2me-web.jar', 
                    'pl.zb3.freej2me.midlet.Midlet',
                    '/app/web/games/' + GAME_FILENAME);
                
                await updateProgress(100, 'Hoàn tất!');
                
                // Hide loading, show game
                setTimeout(() => {
                    document.getElementById('loading-screen').style.display = 'none';
                    container.style.display = 'block';
                }, 500);
                
            } catch (error) {
                console.error('Error loading game:', error);
                document.querySelector('.loading-text').textContent = '❌ Lỗi: ' + error.message;
                document.querySelector('.loading-text').style.color = '#e74c3c';
            }
        }
        
        // Auto start game when page loads
        window.addEventListener('load', () => {
            setTimeout(loadGame, 500);
        });
    </script>
</body>
</html>`;
    
    return { slug, html };
}

// Tạo thư mục nếu chưa có
const pagesDir = './web/games/pages';
if (!fs.existsSync(pagesDir)) {
    fs.mkdirSync(pagesDir, { recursive: true });
}

// Generate pages
console.log('🎮 Generating game pages with Java emulator...\n');

const gamePages = [];
let successCount = 0;

gamesData.forEach(game => {
    const { slug, html } = generateGamePageWithPlayer(game);
    const filename = `${slug}.html`;
    const filepath = path.join(pagesDir, filename);
    
    try {
        fs.writeFileSync(filepath, html, 'utf8');
        console.log(`✓ Generated: ${filename}`);
        successCount++;
        
        gamePages.push({
            id: game.id,
            name: game.name,
            slug: slug,
            url: `https://gametuoitho.cc/web/games/pages/${slug}.html`
        });
    } catch (error) {
        console.log(`✗ Failed: ${filename} - ${error.message}`);
    }
});

// Save index
fs.writeFileSync('./web/games/pages-index.json', JSON.stringify(gamePages, null, 2), 'utf8');

console.log(`\n🎉 Success! Generated ${successCount}/${gamesData.length} pages`);
console.log('\n✨ Features:');
console.log('  - Full Java J2ME emulator loaded');
console.log('  - Game runs directly on page');
console.log('  - No iframe needed');
console.log('  - Progress bar during loading');
console.log('  - SEO optimized content');
