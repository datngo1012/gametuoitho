// Game runner - xử lý việc load và chạy game
import { GameLoader } from './game-loader.js';

class GameRunner {
    constructor() {
        this.gameLoader = new GameLoader();
        this.lib = null;
        this.launcherUtil = null;
        this.gameInfo = null;
        this.isLoaded = false;
    }

    async init() {
        try {
            // Parse URL parameters để lấy thông tin game
            const params = new URLSearchParams(window.location.search);
            const gameFilename = params.get('game');
            const gameName = params.get('name');

            if (!gameFilename) {
                throw new Error('Không tìm thấy thông tin game');
            }

            this.gameInfo = {
                filename: gameFilename,
                name: gameName || this.getGameNameFromFilename(gameFilename),
                settings: this.extractSettingsFromParams(params)
            };

            // Cập nhật title
            document.getElementById('game-title').textContent = `🎮 ${this.gameInfo.name}`;
            
            await this.loadGame();
            
        } catch (error) {
            console.error('Lỗi khởi tạo game:', error);
            this.showError(error.message);
        }
    }

    extractSettingsFromParams(params) {
        const settings = {};
        
        // Các setting mặc định
        const defaultSettings = {
            phone: 'Nokia',
            width: '240', 
            height: '320',
            sound: 'on',
            rotate: 'off',
            forceFullscreen: 'off',
            fontSize: '0',
            dgFormat: '4444'
        };

        // Merge với params từ URL
        for (const [key, value] of params.entries()) {
            if (key !== 'game' && key !== 'name') {
                settings[key] = value;
            }
        }

        return { ...defaultSettings, ...settings };
    }

    getGameNameFromFilename(filename) {
        return filename
            .replace(/\.jar$/i, '')
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());
    }

    updateProgress(progress, text, details = '') {
        const progressBar = document.getElementById('progress-bar');
        const progressText = document.getElementById('progress-text');
        const loadingText = document.getElementById('loading-text');
        const loadingDetails = document.getElementById('loading-details');
        
        if (progressBar) progressBar.style.width = progress + '%';
        if (progressText) progressText.textContent = Math.round(progress) + '%';
        if (loadingText) loadingText.textContent = text;
        if (loadingDetails) loadingDetails.textContent = details;
    }

    async loadGame() {
        try {
            this.updateProgress(10, 'Khởi động máy ảo Java...', 'Đang tải CheerpJ runtime');
            
            // Khởi tạo CheerpJ
            await cheerpjInit({
                enableDebug: false
            });

            this.updateProgress(30, 'Đang tải thư viện game...', 'Tải freej2me-web.jar');
            
            // Load library
            const cheerpjWebRoot = '/app' + location.pathname.replace(/\/[^\/]*$/, '').replace(/\/$/,'');
            this.lib = await cheerpjRunLibrary(cheerpjWebRoot + "/freej2me-web.jar");
            this.launcherUtil = await this.lib.pl.zb3.freej2me.launcher.LauncherUtil;

            await this.launcherUtil.resetTmpDir();

            this.updateProgress(50, 'Đang tải game...', `Tải file ${this.gameInfo.filename}`);
            
            // Load game file - luôn dùng đường dẫn từ /web/games/
            const basePath = window.location.pathname.replace(/\/[^/]*$/, '');
            const gamePath = `${basePath}/games/${this.gameInfo.filename}`;
            const jarBuffer = await this.gameLoader.loadJarFile(gamePath);
            
            this.updateProgress(70, 'Đang cài đặt game...', 'Phân tích và cài đặt JAR file');
            
            // Cài đặt game
            await this.installGame(jarBuffer);
            
            this.updateProgress(90, 'Khởi động game...', 'Khởi tạo giao diện game');
            
            // Khởi động game
            await this.startGame();
            
            this.updateProgress(100, 'Hoàn tất!', 'Game đã sẵn sàng');
            
            // Hiển thị game
            setTimeout(() => {
                this.showGame();
            }, 500);
            
        } catch (error) {
            console.error('Lỗi khi load game:', error);
            this.showError(`Không thể tải game: ${error.message}`);
        }
    }

    async installGame(jarBuffer) {
        const MIDletLoader = await this.lib.org.recompile.mobile.MIDletLoader;
        const File = await this.lib.java.io.File;

        // Tạo file tạm
        const jarFile = await new File(`/files/_tmp/${this.gameInfo.filename}`);
        await this.launcherUtil.copyJar(new Int8Array(jarBuffer), jarFile);

        // Tạo loader
        const loader = await MIDletLoader.getMIDletLoader(jarFile);
        
        // Đảm bảo có app ID
        if (!(await loader.getAppId())) {
            await this.launcherUtil.ensureAppId(loader, this.gameInfo.filename);
        }

        const appId = await loader.getAppId();
        
        // Convert settings to Java HashMap
        const Config = await this.lib.org.recompile.freej2me.Config;
        const defaultSettings = {};
        await this.javaToKv(Config.DEFAULT_SETTINGS, defaultSettings);
        
        const finalSettings = { ...defaultSettings, ...this.gameInfo.settings };
        const jsettings = await this.kvToJava(finalSettings);
        
        // Read properties
        const appProps = {};
        await this.javaToKv(loader.properties, appProps);
        const jappProps = await this.kvToJava(appProps);
        const jsysProps = await this.kvToJava({});

        // Cài đặt game
        await this.launcherUtil.initApp(jarFile, loader, jsettings, jappProps, jsysProps);
        
        this.gameInfo.appId = appId;
    }

    async javaToKv(hashMap, kv) {
        const es = await hashMap.entrySet();
        const esi = await es.iterator();

        while (await esi.hasNext()) {
            const entry = await esi.next();
            const key = await entry.getKey();
            const value = await entry.getValue();
            kv[key] = value;
        }
    }

    async kvToJava(kv) {
        const HashMap = await this.lib.java.util.HashMap;
        const ret = await new HashMap();

        for (const k of Object.keys(kv)) {
            await ret.put(k, kv[k]);
        }

        return ret;
    }

    async startGame() {
        // Tạo URL với app parameter để main.js nhận diện
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set('app', this.gameInfo.appId);
        
        // Cập nhật URL mà không reload trang
        window.history.replaceState({}, '', newUrl);
        
        // Import và khởi chạy main game engine
        await import('./main.js');
        
        this.isLoaded = true;
    }

    showGame() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
    }

    showError(message) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('game-container').style.display = 'none';
        
        const errorDiv = document.getElementById('error');
        const errorMessage = document.getElementById('error-message');
        
        if (errorMessage) {
            errorMessage.textContent = message;
        }
        
        errorDiv.style.display = 'flex';
    }

    // Key handling for mobile controls
    sendKey(key) {
        if (!this.isLoaded) return;
        
        // Send key event to the game
        const event = new KeyboardEvent('keydown', {
            key: key,
            code: key,
            bubbles: true
        });
        
        const canvas = document.getElementById('canvas');
        if (canvas) {
            canvas.dispatchEvent(event);
        }
    }
}

// Global access for mobile controls
window.gameRunner = new GameRunner();

// Start the game when page loads
window.gameRunner.init();