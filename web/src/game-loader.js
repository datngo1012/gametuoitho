// Module để tự động load games từ thư mục games/
export class GameLoader {
    constructor() {
        this.games = [];
        this.onProgress = null; // Callback cho progress updates
    }

    // Lấy danh sách games từ list.json
    async loadGamesFromDirectory() {
        try {
            const response = await fetch('games/list.json');
            if (!response.ok) {
                return [];
            }
            
            const gamesList = await response.json();
            this.games = gamesList.map(game => ({
                filename: game.filename,
                name: game.name || this.getGameNameFromFilename(game.filename),
                jarPath: `games/${game.filename}`,
                jadPath: game.jadFile ? `games/${game.jadFile}` : null,
                icon: game.icon || null,
                settings: game.settings || {}
            }));
            
            return this.games;
        } catch (error) {
            console.error('Lỗi khi load danh sách games:', error);
            return [];
        }
    }

    // Lấy tên game từ filename
    getGameNameFromFilename(filename) {
        return filename
            .replace(/\.jar$/i, '')
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    }

    // Tải file JAR và trả về ArrayBuffer
    async loadJarFile(jarPath) {
        const response = await fetch(jarPath);
        if (!response.ok) {
            throw new Error(`Không thể tải file: ${jarPath}`);
        }
        return await response.arrayBuffer();
    }

    // Tải file JAD nếu có
    async loadJadFile(jadPath) {
        if (!jadPath) return null;
        
        try {
            const response = await fetch(jadPath);
            if (!response.ok) return null;
            return await response.arrayBuffer();
        } catch (error) {
            console.warn('Không tải được file JAD:', jadPath);
            return null;
        }
    }
}
