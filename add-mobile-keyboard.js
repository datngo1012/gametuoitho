const fs = require('fs');
const path = require('path');

// Read game list
const gamesData = JSON.parse(fs.readFileSync('./web/games/list.json', 'utf8'));

// Mobile keyboard CSS
const keyboardCSS = `
        /* Mobile Virtual Keyboard */
        .keypad-part {
            position: fixed;
            z-index: 1000;
            display: none; /* Hidden by default, shown on mobile */
        }
        
        #left-keys {
            left: 0;
            bottom: 0;
            background: rgba(20, 20, 30, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 0 20px 0 0;
            padding: 15px;
        }
        
        #right-keys {
            right: 0;
            bottom: 0;
            background: rgba(20, 20, 30, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px 0 0 0;
            padding: 15px;
        }
        
        .key-grid {
            display: grid;
            gap: 8px;
        }
        
        .left-grid {
            grid-template-columns: repeat(3, 60px);
            grid-template-rows: repeat(4, 60px);
        }
        
        .right-grid {
            grid-template-columns: repeat(3, 60px);
            grid-template-rows: repeat(3, 60px);
        }
        
        .key {
            background: linear-gradient(145deg, #4a4a6a, #2a2a3a);
            border: 2px solid rgba(102, 126, 234, 0.3);
            border-radius: 12px;
            color: white;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            transition: all 0.15s ease;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
        }
        
        .key:active, .key.active {
            background: linear-gradient(145deg, #667eea, #764ba2);
            transform: scale(0.95);
            box-shadow: inset 0 2px 10px rgba(0,0,0,0.3);
        }
        
        .key span {
            font-size: 10px;
            font-weight: normal;
            color: rgba(255,255,255,0.6);
            margin-top: 2px;
        }
        
        .arrow-key {
            font-size: 24px;
        }
        
        .ok-key {
            background: linear-gradient(145deg, #667eea, #764ba2);
            font-size: 16px;
        }
        
        .small-key {
            font-size: 14px;
            padding: 5px;
        }
        
        /* Show keyboard on mobile/tablet */
        @media (max-width: 1024px) {
            .keypad-part {
                display: block !important;
            }
            
            .game-player {
                margin-bottom: 280px; /* Space for keyboards */
            }
        }
        
        @media (max-width: 768px) {
            .left-grid, .right-grid {
                grid-template-columns: repeat(3, 50px);
            }
            
            .left-grid {
                grid-template-rows: repeat(4, 50px);
            }
            
            .right-grid {
                grid-template-rows: repeat(3, 50px);
            }
            
            .key {
                font-size: 16px;
            }
            
            #left-keys, #right-keys {
                padding: 10px;
            }
        }
`;

// Mobile keyboard HTML
const keyboardHTML = `
    <!-- Mobile Virtual Keyboard -->
    <div id="left-keys" class="keypad-part">
        <div class="key-grid left-grid">
            <button data-key="Digit1" class="key">1</button>
            <button data-key="Digit2" class="key">2 <span>ABC</span></button>
            <button data-key="Digit3" class="key">3 <span>DEF</span></button>
            <button data-key="Digit4" class="key">4 <span>GHI</span></button>
            <button data-key="Digit5" class="key">5 <span>JKL</span></button>
            <button data-key="Digit6" class="key">6 <span>MNO</span></button>
            <button data-key="Digit7" class="key">7 <span>PQRS</span></button>
            <button data-key="Digit8" class="key">8 <span>TUV</span></button>
            <button data-key="Digit9" class="key">9 <span>WXYZ</span></button>
            <button data-key="NumpadAsterisk" class="key">*</button>
            <button data-key="Digit0" class="key">0 <span>+</span></button>
            <button data-key="NumpadDivide" class="key">#</button>
        </div>
    </div>
    <div id="right-keys" class="keypad-part">
         <div class="key-grid right-grid">
            <button data-key="F1" class="key">L</button>
            <button data-key="ArrowUp" class="key arrow-key" aria-label="Up">↑</button>
            <button data-key="F2" class="key">R</button>
            <button data-key="ArrowLeft" class="key arrow-key" aria-label="Left">←</button>
            <button data-key="Enter" class="key ok-key">OK</button>
            <button data-key="ArrowRight" class="key arrow-key" aria-label="Right">→</button>
            <button data-key="Escape" class="key small-key small-key-left">Esc</button>
            <button data-key="ArrowDown" class="key arrow-key" aria-label="Down">↓</button>
            <button data-key="Maximize" class="key small-key small-key-right" aria-label="Maximize">⛶</button>
        </div>
    </div>
`;

// JavaScript initialization code
const keyboardJS = `
        // Initialize mobile keyboard
        import { initKbdListeners, setKbdHandler } from '../../src/screenKbd.js';
        
        // Setup keyboard handler
        function handleVirtualKey(isDown, keyCode) {
            const event = new KeyboardEvent(isDown ? 'keydown' : 'keyup', {
                code: keyCode,
                key: keyCode,
                bubbles: true,
                cancelable: true
            });
            
            // Dispatch to the game display
            const gameDisplay = document.getElementById('game-display');
            if (gameDisplay) {
                const canvas = gameDisplay.querySelector('canvas');
                if (canvas) {
                    canvas.dispatchEvent(event);
                } else {
                    gameDisplay.dispatchEvent(event);
                }
            } else {
                document.dispatchEvent(event);
            }
        }
        
        // Initialize keyboard after game loads
        const checkGameLoaded = setInterval(() => {
            const gameDisplay = document.getElementById('game-display');
            if (gameDisplay) {
                clearInterval(checkGameLoaded);
                initKbdListeners();
                setKbdHandler(handleVirtualKey);
                console.log('✅ Mobile keyboard initialized');
            }
        }, 500);
`;

console.log('🎮 Adding mobile virtual keyboard to game pages...\n');

let successCount = 0;

gamesData.games.forEach(game => {
    const filename = game.id + '.html';
    const filepath = path.join('./web/games/pages', filename);
    
    if (!fs.existsSync(filepath)) {
        console.log(`⚠️  File not found: ${filename}`);
        return;
    }
    
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Check if keyboard already added
    if (content.includes('Mobile Virtual Keyboard')) {
        console.log(`⏭️  ${game.name}: Already has keyboard, skipping`);
        return;
    }
    
    // Add keyboard CSS before </style>
    content = content.replace('</style>', keyboardCSS + '\n    </style>');
    
    // Add keyboard HTML before </body>
    content = content.replace('</body>', keyboardHTML + '\n</body>');
    
    // Add keyboard JS initialization in the loadGame function
    // Find the line with "loadGame().catch" and add keyboard init code before it
    const loadGameCallMatch = content.match(/(loadGame\(\)\.catch)/);
    if (loadGameCallMatch) {
        content = content.replace(
            loadGameCallMatch[0],
            keyboardJS + '\n        ' + loadGameCallMatch[0]
        );
    } else {
        // If pattern not found, try to add before </script> at the end
        const lastScriptMatch = content.match(/(<\/script>\s*<\/body>)/);
        if (lastScriptMatch) {
            content = content.replace(
                lastScriptMatch[0],
                keyboardJS + '\n    </script>\n</body>'
            );
        }
    }
    
    // Save the updated file
    fs.writeFileSync(filepath, content, 'utf8');
    successCount++;
    console.log(`✅ ${game.name}: Added mobile keyboard`);
});

console.log(`\n🎉 Success! Added mobile keyboard to ${successCount}/${gamesData.games.length} pages`);
console.log('\n📱 Features:');
console.log('   - Virtual D-pad and action buttons');
console.log('   - Number keypad (0-9, *, #)');
console.log('   - Soft keys (L, R)');
console.log('   - Automatically shown on mobile devices');
console.log('   - Touch-optimized with visual feedback');
console.log('\n💡 Tip: Test on mobile device or use browser dev tools mobile emulation');
