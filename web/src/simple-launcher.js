// Simple launcher - chỉ hiển thị danh sách game mà không load Java VM
import { GameLoader } from './game-loader.js';

class SimpleLauncher {
    constructor() {
        this.gameLoader = new GameLoader();
        this.games = [];
    }

    async init() {
        try {
            // Chỉ cần load danh sách games từ list.json
            this.updateProgress(50, 'Đang tải danh sách game...');
            this.games = await this.gameLoader.loadGamesFromDirectory();
            
            this.updateProgress(100, 'Hoàn tất!');
            
            // Hiển thị giao diện sau một chút delay
            setTimeout(() => {
                this.showMainInterface();
            }, 300);
            
        } catch (error) {
            console.error('Lỗi khởi tạo:', error);
            this.showError('Không thể tải danh sách game');
        }
    }

    updateProgress(progress, text) {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const loadingText = document.querySelector('.loading-text');
        
        if (progressBar) progressBar.style.width = progress + '%';
        if (progressText) progressText.textContent = Math.round(progress) + '%';
        if (loadingText) loadingText.textContent = text;
    }

    showMainInterface() {
        document.getElementById("loading").style.display = "none";
        document.getElementById("main").style.display = "";
        
        this.renderGamesList();
        this.setupSearch();
    }

    showError(message) {
        const loading = document.getElementById("loading");
        loading.innerHTML = `
            <div style="text-align: center; color: #e74c3c;">
                <div style="font-size: 3em; margin-bottom: 15px;">❌</div>
                <div style="font-size: 1.2em; margin-bottom: 10px;">Có lỗi xảy ra</div>
                <div style="font-size: 0.9em; opacity: 0.8;">${message}</div>
                <button onclick="location.reload()" style="
                    margin-top: 20px; 
                    padding: 10px 20px; 
                    background: #fff; 
                    border: none; 
                    border-radius: 8px; 
                    cursor: pointer;
                ">Thử lại</button>
            </div>
        `;
    }

    renderGamesList() {
        const container = document.getElementById("game-list");
        container.innerHTML = "";

        if (this.games.length === 0) {
            this.renderEmptyState(container);
            return;
        }

        // Tạo container grid cho games
        const gridContainer = document.createElement("div");
        gridContainer.className = "games-grid";
        
        this.games.forEach(game => {
            const gameCard = this.createGameCard(game);
            gridContainer.appendChild(gameCard);
        });
        
        container.appendChild(gridContainer);
    }

    renderEmptyState(container) {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "empty-games";
        emptyDiv.innerHTML = `
            <div class="empty-games-icon">🎮</div>
            <h3>Chưa có game nào</h3>
            <p>📁 Thêm file <code>.jar</code> vào thư mục <code>web/games/</code></p>
            <p>📝 Cập nhật file <code>web/games/list.json</code></p>
            <p>🔄 Refresh lại trang</p>
        `;
        container.appendChild(emptyDiv);
    }

    createGameCard(game) {
        const card = document.createElement("div");
        card.className = "game-card";
        card.setAttribute('data-game-name', game.name.toLowerCase());
        
        // Icon container
        const iconDiv = document.createElement("div");
        iconDiv.className = "game-icon";
        
        if (game.icon) {
            const img = document.createElement("img");
            img.src = game.icon.startsWith('http') ? game.icon : `games/${game.icon}`;
            img.alt = game.name;
            img.onerror = () => {
                iconDiv.innerHTML = '🎮';
                iconDiv.classList.add('default-icon');
            };
            iconDiv.appendChild(img);
        } else {
            iconDiv.innerHTML = '🎮';
            iconDiv.classList.add('default-icon');
        }
        
        // Game name
        const nameDiv = document.createElement("div");
        nameDiv.className = "game-name";
        nameDiv.textContent = game.name;
        
        // Play button
        const playButton = document.createElement("button");
        playButton.className = "play-button";
        playButton.innerHTML = '▶️ Chơi';
        playButton.onclick = () => this.playGame(game);
        
        card.appendChild(iconDiv);
        card.appendChild(nameDiv);
        card.appendChild(playButton);
        
        return card;
    }

    async playGame(game) {
        // Chuyển tới trang run với thông tin game
        const params = new URLSearchParams({
            game: game.filename,
            name: game.name
        });
        
        // Thêm settings nếu có
        if (game.settings) {
            Object.keys(game.settings).forEach(key => {
                params.append(key, game.settings[key]);
            });
        }
        
        window.location.href = `run?${params.toString()}`;
    }

    setupSearch() {
        const searchInput = document.getElementById("game-search");
        if (!searchInput) return;
        
        searchInput.addEventListener("input", (e) => {
            this.filterGames(e.target.value.toLowerCase().trim());
        });
    }

    filterGames(searchTerm) {
        const gameCards = document.querySelectorAll(".game-card");
        let visibleCount = 0;
        
        gameCards.forEach(card => {
            const gameName = card.getAttribute('data-game-name');
            const matches = gameName.includes(searchTerm);
            
            if (matches) {
                card.style.display = "flex";
                visibleCount++;
                
                // Highlight search term
                const nameElement = card.querySelector('.game-name');
                const originalName = nameElement.getAttribute('data-original-name') || nameElement.textContent;
                nameElement.setAttribute('data-original-name', originalName);
                
                if (searchTerm) {
                    const regex = new RegExp(`(${searchTerm})`, 'gi');
                    nameElement.innerHTML = originalName.replace(regex, '<span class="highlight">$1</span>');
                } else {
                    nameElement.textContent = originalName;
                }
            } else {
                card.style.display = "none";
            }
        });
        
        // Update search count
        this.updateSearchCount(visibleCount, gameCards.length, searchTerm);
        
        // Show/hide no results message
        this.toggleNoResults(visibleCount === 0 && searchTerm);
    }

    updateSearchCount(visible, total, searchTerm) {
        const searchCount = document.getElementById("search-count");
        if (searchTerm && searchCount) {
            searchCount.style.display = "block";
            searchCount.textContent = `${visible}/${total}`;
        } else if (searchCount) {
            searchCount.style.display = "none";
        }
    }

    toggleNoResults(show) {
        const gameList = document.getElementById("game-list");
        let noResultsDiv = gameList.querySelector(".no-results");
        
        if (show && !noResultsDiv) {
            noResultsDiv = document.createElement("div");
            noResultsDiv.className = "no-results";
            noResultsDiv.innerHTML = `
                <div class="no-results-icon">🔍</div>
                <h3>Không tìm thấy game</h3>
                <p>💡 Thử tìm kiếm với từ khóa khác</p>
            `;
            gameList.appendChild(noResultsDiv);
        } else if (!show && noResultsDiv) {
            noResultsDiv.remove();
        }
    }
}

// Khởi tạo khi trang được load
const launcher = new SimpleLauncher();
launcher.init();