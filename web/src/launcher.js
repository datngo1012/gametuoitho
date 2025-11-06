// note that we can only call java stuff if thread not running..
import { getCurrentLanguage, t, getLocalizedGameData } from './translations.js';

const cheerpjWebRoot = '/app';

const emptyIcon = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

let lib = null, launcherUtil = null;
let state = {
    games: [],
    uploadedGames: [],
    currentGame: null,
    editedGameId: null,
    uploadedJars: 0,
    lastLoader: null,
};
let defaultSettings = {};
let isGamesLoaded = false;

async function initializeLibraries() {
    if (lib) return; // Already initialized
    
    const loadingDiv = document.getElementById("game-list-loading");
    const loadingText = loadingDiv?.querySelector('.loading-text');
    const progressBar = document.getElementById("game-progress-bar");
    
    if (loadingText) loadingText.textContent = t('loadingLibraries');
    if (progressBar) progressBar.style.width = "10%";
    
    await cheerpjInit({
        enableDebug: false
    });

    if (loadingText) loadingText.textContent = t('loadingStartup');
    if (progressBar) progressBar.style.width = "30%";

    lib = await cheerpjRunLibrary(cheerpjWebRoot+"/freej2me-web.jar");

    if (loadingText) loadingText.textContent = t('loadingConfig');
    if (progressBar) progressBar.style.width = "50%";

    launcherUtil = await lib.pl.zb3.freej2me.launcher.LauncherUtil;

    await launcherUtil.resetTmpDir();

    if (loadingText) loadingText.textContent = t('loadingGameConfig');
    if (progressBar) progressBar.style.width = "70%";

    const Config = await lib.org.recompile.freej2me.Config;
    await javaToKv(Config.DEFAULT_SETTINGS, defaultSettings);
}

async function loadGamesUI() {
    if (isGamesLoaded) return;
    
    const loadingDiv = document.getElementById("game-list-loading");
    const contentDiv = document.getElementById("game-list-content");
    const addGameSection = document.getElementById("add-game-section");
    
    try {
        await initializeLibraries();
        
        const loadingText = loadingDiv?.querySelector('.loading-text');
        const progressBar = document.getElementById("game-progress-bar");
        
        if (loadingText) loadingText.textContent = t('loadingGameList');
        if (progressBar) progressBar.style.width = "90%";
        
        await reloadUI();
        
        if (loadingText) loadingText.textContent = t('loadingComplete');
        if (progressBar) progressBar.style.width = "100%";
        
        setTimeout(() => {
            if (loadingDiv) loadingDiv.style.display = "none";
            if (contentDiv) contentDiv.style.display = "block";
            if (addGameSection) addGameSection.style.display = "block";
            isGamesLoaded = true;
        }, 300);
        
    } catch (error) {
        console.error("Error loading games:", error);
        const loadingText = loadingDiv?.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = t('loadingError');
            loadingText.style.color = "var(--error)";
        }
    }
}

async function ensureLibrariesLoaded() {
    if (!isGamesLoaded) {
        await loadGamesUI();
    }
}

async function main() {
    // Show main content immediately
    document.getElementById("main").style.display = "";
    
    // Trigger event to let comment system know main is visible
    window.dispatchEvent(new CustomEvent('mainContentLoaded'));
    
    // Load games immediately instead of waiting for scroll
    loadGamesUI();

    const clearCurrentBtn = document.getElementById("clear-current");
    if (clearCurrentBtn) {
        clearCurrentBtn.onclick = async () => {
            await ensureLibrariesLoaded();
            setupAddMode();
        };
    }

    // Data management buttons (optional - only if they exist)
    const importDataBtn = document.getElementById("import-data-btn");
    if (importDataBtn) {
        importDataBtn.addEventListener("click", async () => {
            await ensureLibrariesLoaded();
            document.getElementById("import-data-file").click();
        });
    }

    const importDataFile = document.getElementById("import-data-file");
    if (importDataFile) {
        importDataFile.onchange = async (e) => {
            await ensureLibrariesLoaded();
            doImportData(e);
        };
    }

    const exportDataBtn = document.getElementById("export-data-btn");
    if (exportDataBtn) {
        exportDataBtn.onclick = async () => {
            await ensureLibrariesLoaded();
            doExportData();
        };
    }
    
    // Setup file input for adding games
    const gameFileInput = document.getElementById("game-file-input");
    if (gameFileInput) {
        gameFileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                await ensureLibrariesLoaded();
                
                gameFileInput.disabled = true;
                document.getElementById("file-input-step").style.display = "none";
                document.getElementById("file-input-loading").style.display = "";

                const reader = new FileReader();
                reader.onload = async () => {
                    const arrayBuffer = reader.result;
                    await processGameFile(arrayBuffer, file.name);
                };
                reader.readAsArrayBuffer(file);
            }
        };
    }
}

async function maybeReadCheerpJFileText(path) {
    const blob = await cjFileBlob(path);
    if (blob) {
        return await blob.text();
    }
}

async function getDataUrlFromBlob(blob) {
    const reader = new FileReader();

    const promise = new Promise((r) => {
        reader.onload = function () {
            r(reader.result);
        };
    });

    reader.readAsDataURL(blob);
    return await promise;
}

function readToKv(txt, kv) {
    for (const line of txt.trim().split("\n")) {
        const parts = line.split(/\s*:\s*/);
        if (parts.length == 2) {
            kv[parts[0]] = parts[1];
        }
    }
}

async function javaToKv(hashMap, kv) {
    const es = await hashMap.entrySet();
    const esi = await es.iterator();

    while (await esi.hasNext()) {
        const entry = await esi.next();
        const key = await entry.getKey();
        const value = await entry.getValue();

        kv[key] = value;
    }
}

async function kvToJava(kv) {
    const HashMap = await lib.java.util.HashMap;
    const ret = await new HashMap();

    for (const k of Object.keys(kv)) {
        await ret.put(k, kv[k]);
    }

    return ret;
}

async function loadGamesFromJson() {
    try {
        const response = await fetch('games/list.json');
        if (!response.ok) {
            console.error('Failed to load games/list.json');
            return [];
        }
        const gamesList = await response.json();
        
        // Check if current page is diamond-rush.html
        const currentPath = window.location.pathname;
        const isDiamondRushPage = currentPath.includes('diamond-rush') || currentPath.includes('diamond-rush.html');
        
        if (isDiamondRushPage) {
            // Filter to only include Diamond Rush game
            const diamondRushGames = gamesList.filter(game => {
                const gameName = game.name.toLowerCase();
                return gameName.includes('diamond') && gameName.includes('rush');
            });
            console.log('Diamond Rush page detected, filtering to Diamond Rush games only:', diamondRushGames);
            return diamondRushGames;
        }
        
        return gamesList;
    } catch (error) {
        console.error('Error loading games list:', error);
        return [];
    }
}

async function installGameFromJson(gameInfo) {
    try {
        const MIDletLoader = await lib.org.recompile.mobile.MIDletLoader;
        const File = await lib.java.io.File;

        // Load JAR file
        const jarResponse = await fetch('games/' + gameInfo.filename);
        if (!jarResponse.ok) {
            console.error('Failed to load game:', gameInfo.filename);
            return null;
        }
        const jarArrayBuffer = await jarResponse.arrayBuffer();

        // Create temp JAR file
        const jarFile = await new File("/files/_tmp/" + Date.now() + ".jar");
        await launcherUtil.copyJar(new Int8Array(jarArrayBuffer), jarFile);

        // Load the JAR
        const loader = await MIDletLoader.getMIDletLoader(jarFile);

        // Load JAD file if specified
        if (gameInfo.jadFile) {
            try {
                const jadResponse = await fetch('games/' + gameInfo.jadFile);
                if (jadResponse.ok) {
                    const jadArrayBuffer = await jadResponse.arrayBuffer();
                    await launcherUtil.augementLoaderWithJAD(
                        loader,
                        new Int8Array(jadArrayBuffer)
                    );
                }
            } catch (error) {
                console.warn('Failed to load JAD file for', gameInfo.name, error);
            }
        }

        // Ensure app has an ID
        await launcherUtil.ensureAppId(loader, gameInfo.filename);
        const appId = await loader.getAppId();
        
        // Set name
        if (gameInfo.name) {
            loader.name = gameInfo.name;
        }

        // Get icon
        const iconBytes = await loader.getIconBytes();

        // Prepare settings
        const settings = { ...defaultSettings };
        if (gameInfo.settings) {
            if (gameInfo.settings.phone) settings.phone = gameInfo.settings.phone;
            if (gameInfo.settings.width) settings.width = gameInfo.settings.width;
            if (gameInfo.settings.height) settings.height = gameInfo.settings.height;
        }

        // Get app properties from loader
        const appProperties = {};
        await javaToKv(loader.properties, appProperties);

        // Convert to Java objects
        const jsettings = await kvToJava(settings);
        const jappProps = await kvToJava(appProperties);
        const jsysProps = await kvToJava({});

        // Install the game
        await launcherUtil.initApp(jarFile, loader, jsettings, jappProps, jsysProps);

        // Save game info to a file for later retrieval
        const gameInfoJson = JSON.stringify({
            description: gameInfo.description || '',
            gameplay: gameInfo.gameplay || '',
            tags: gameInfo.tags || [],
            genre: gameInfo.genre || [],
            year: gameInfo.year || 0,
            rating: gameInfo.rating || 0
        });
        
        try {
            const File = await lib.java.io.File;
            const FileOutputStream = await lib.java.io.FileOutputStream;
            const gameInfoFile = await new File("/files/" + appId + "/gameinfo.json");
            const fos = await new FileOutputStream(gameInfoFile);
            const gameInfoBytes = new TextEncoder().encode(gameInfoJson);
            await fos.write(gameInfoBytes);
            await fos.close();
        } catch (error) {
            console.warn('Failed to save gameinfo.json for', appId, error);
        }

        // Clean up
        await loader.close();

        return {
            appId: appId,
            name: gameInfo.name || appId,
            icon: iconBytes ? await getDataUrlFromBlob(new Blob([iconBytes])) : emptyIcon,
            settings: settings,
            appProperties: appProperties,
            systemProperties: {},
            gameInfo: {
                description: gameInfo.description || '',
                gameplay: gameInfo.gameplay || '',
                tags: gameInfo.tags || [],
                genre: gameInfo.genre || [],
                year: gameInfo.year || 0,
                rating: gameInfo.rating || 0
            }
        };
    } catch (error) {
        console.error('Error installing game:', gameInfo.name, error);
        return null;
    }
}

async function findMissingGames(gamesList, installedApps) {
    const missingGames = [];
    
    for (const gameInfo of gamesList) {
        // Check if this game is already installed
        const isInstalled = installedApps.find(app => {
            if (!gameInfo.id) return false;
            const appIdLower = app.appId.toLowerCase();
            const gameIdLower = gameInfo.name.toLowerCase();
            return appIdLower === gameIdLower || appIdLower.includes(gameIdLower) || gameIdLower.includes(appIdLower);
        });
        
        if (!isInstalled) {
            console.log(`Game ${gameInfo.name} not found in IndexedDB, will install`);
            missingGames.push(gameInfo);
        }
    }
    
    return missingGames;
}

async function loadGames() {
    const apps = [];
    const gamesList = await loadGamesFromJson(); // Load for reference

    // Check if games are already installed
    let installedAppsBlob = await cjFileBlob("/files/apps.list");
    
    if (!installedAppsBlob) {
        // No games installed, load from games/list.json and install them
        if (gamesList.length > 0) {
            // Update loading text
            const loadingText = document.getElementById("loading-text");
            const progressBar = document.getElementById("progress-bar");
            
            for (let i = 0; i < gamesList.length; i++) {
                const gameInfo = gamesList[i];
                if (loadingText) {
                    loadingText.textContent = `Đang cài đặt game ${i + 1}/${gamesList.length}: ${gameInfo.name}`;
                }
                if (progressBar) {
                    const progress = 50 + (40 * (i + 1) / gamesList.length);
                    progressBar.style.width = progress + "%";
                }
                
                const installedGame = await installGameFromJson(gameInfo);
                if (installedGame) {
                    apps.push(installedGame);
                }
            }
            
            // Reload apps list after installation
            installedAppsBlob = await cjFileBlob("/files/apps.list");
        }
    } else {
        // Games are already installed, check if any new games are missing
        const tempApps = [];
        const installedIds = (await installedAppsBlob.text()).trim().split("\n");
        
        for (const appId of installedIds) {
            tempApps.push({ appId });
        }
        
        // Find games that are in list.json but not in IndexedDB
        const missingGames = await findMissingGames(gamesList, tempApps);
        
        if (missingGames.length > 0) {
            const loadingText = document.getElementById("loading-text");
            const progressBar = document.getElementById("progress-bar");
            
            console.log(`Found ${missingGames.length} missing games, installing...`);
            
            for (let i = 0; i < missingGames.length; i++) {
                const gameInfo = missingGames[i];
                
                if (loadingText) {
                    loadingText.textContent = `Đang cài game mới ${i + 1}/${missingGames.length}: ${gameInfo.name}`;
                }
                if (progressBar) {
                    const progress = 50 + (40 * (i + 1) / missingGames.length);
                    progressBar.style.width = progress + "%";
                }
                
                console.log(`Installing missing game: ${gameInfo.name}`);
                const installedGame = await installGameFromJson(gameInfo);
                if (installedGame) {
                    apps.push(installedGame);
                }
            }
            
            // Reload apps list after installation
            installedAppsBlob = await cjFileBlob("/files/apps.list");
        }
    }
    
    // Load installed games
    if (installedAppsBlob) {
        const installedIds = (await installedAppsBlob.text()).trim().split("\n");

        for (const appId of installedIds) {
            // Skip if already loaded during installation
            if (apps.some(app => app.appId === appId)) {
                continue;
            }

            const napp = {
                appId,
                name: appId,
                icon: emptyIcon,
                settings: { ...defaultSettings },
                appProperties: {},
                systemProperties: {},
                gameInfo: null,
            };

            const name = await maybeReadCheerpJFileText("/files/" + appId + "/name");
            if (name) napp.name = name;

            const iconBlob = await cjFileBlob("/files/" + appId + "/icon");
            if (iconBlob) {
                const dataUrl = await getDataUrlFromBlob(iconBlob);
                if (dataUrl) {
                    napp.icon = dataUrl;
                }
            }

            // Load game info from saved file
            const gameInfoText = await maybeReadCheerpJFileText("/files/" + appId + "/gameinfo.json");
            if (gameInfoText) {
                try {
                    napp.gameInfo = JSON.parse(gameInfoText);
                    console.log('Loaded gameInfo from file for', appId, napp.gameInfo);
                } catch (error) {
                    console.warn('Failed to parse gameinfo.json for', appId);
                }
            }

            // If no saved game info, try to find it in the list
            if (!napp.gameInfo && gamesList.length > 0) {
                console.log('Trying to find gameInfo in list for appId:', appId);
                const gameFromList = gamesList.find(g => {
                    // Try multiple matching strategies
                    if (!g.filename) return false;
                    
                    const fileNameBase = g.name.replace(/\.jar$/, '').toLowerCase();
                    const appIdLower = appId.toLowerCase();
                    
                    // Direct match
                    if (fileNameBase === appIdLower) return true;
                    
                    // Check if filename contains appId
                    if (fileNameBase.includes(appIdLower)) return true;
                    
                    // Check if appId contains filename base
                    if (appIdLower.includes(fileNameBase)) return true;
                    
                    // Check by id field
                    if (g.id && g.id.toLowerCase() === appIdLower) return true;
                    
                    return false;
                });
                
                if (gameFromList) {
                    console.log('Found game in list:', gameFromList.name);
                    napp.gameInfo = {
                        description: gameFromList.description || '',
                        gameplay: gameFromList.gameplay || '',
                        tags: gameFromList.tags || [],
                        genre: gameFromList.genre || [],
                        year: gameFromList.year || 0,
                        rating: gameFromList.rating || 0
                    };
                } else {
                    console.warn('No match found for appId:', appId);
                }
            }

            for (const [fname, keyName] of [
                ["/files/" + appId + "/config/settings.conf", "settings"],
                ["/files/" + appId + "/config/appproperties.conf", "appProperties"],
                ["/files/" + appId + "/config/systemproperties.conf", "systemProperties"],
            ]) {
                const content = await maybeReadCheerpJFileText(fname);
                if (content) {
                    readToKv(content, napp[keyName]);
                }
            }

            apps.push(napp);
        }
    }

    return apps;
}

function fillGamesList(games, uploadedGames = []) {
    const container = document.getElementById("game-list");
    container.innerHTML = "";
    
    const uploadedContainer = document.getElementById("uploaded-game-list");
    uploadedContainer.innerHTML = "";
    
    const uploadedSection = document.getElementById("uploaded-games-section");
    
    // Store games globally for language change re-rendering
    window.currentGames = games;
    window.uploadedGames = uploadedGames;
    
    // Add single-game class if only one game total
    const totalGames = games.length + uploadedGames.length;
    if (totalGames === 1) {
        container.classList.add('single-game');
    } else {
        container.classList.remove('single-game');
    }

    // Show or hide uploaded games section
    if (uploadedGames.length > 0) {
        uploadedSection.style.display = "";
        renderGames(uploadedGames, uploadedContainer, true);
    } else {
        uploadedSection.style.display = "none";
    }

    if (games.length === 0 && uploadedGames.length === 0) {
        // Show empty state
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";
        
        // Check if this is diamond-rush page
        const currentPath = window.location.pathname;
        const isDiamondRushPage = currentPath.includes('diamond-rush') || currentPath.includes('diamond-rush.html');
        
        if (isDiamondRushPage) {
            emptyState.innerHTML = `
                <div class="empty-state-icon">💎</div>
                <div class="empty-state-text">Không tìm thấy Diamond Rush</div>
                <div class="empty-state-subtext">Vui lòng kiểm tra file games/list.json có chứa game Diamond Rush</div>
            `;
        } else {
            emptyState.innerHTML = `
                <div class="empty-state-icon">🎮</div>
                <div class="empty-state-text">Chưa có game nào</div>
                <div class="empty-state-subtext">Vui lòng kiểm tra file games/list.json hoặc tải game lên</div>
            `;
        }
        
        container.appendChild(emptyState);
        return;
    }

    // Setup search functionality
    setupGameSearch(games.concat(uploadedGames));
    
    // Render pre-installed games
    if (games.length > 0) {
        renderGames(games, container, false);
    }
}

function renderGames(games, container, isUploaded) {
    for (const game of games) {
        // Apply localization to game data
        const localizedGame = {
            ...game,
            gameInfo: game.gameInfo ? getLocalizedGameData(game.gameInfo) : null
        };

        const item = document.createElement("div");
        item.className = "game-item";

        const link = document.createElement("a");
        link.href = "run?app=" + localizedGame.appId;
        link.addEventListener('pointerdown', e => {
            if (e.pointerType === 'touch') {
                link.href = "run?app=" + localizedGame.appId + "&mobile=1";
            }
        });

        const icon = document.createElement("img");
        icon.className = "icon";
        icon.src = localizedGame.icon;
        link.appendChild(icon);

        const info = document.createElement("div");
        info.className = "game-info";
        info.textContent = localizedGame.gameInfo?.name || localizedGame.name;
        link.appendChild(info);

        // Add tags if available
        if (localizedGame.gameInfo && localizedGame.gameInfo.tags && localizedGame.gameInfo.tags.length > 0) {
            const tagsContainer = document.createElement("div");
            tagsContainer.className = "game-tags";
            
            localizedGame.gameInfo.tags.forEach(tag => {
                const tagElement = document.createElement("span");
                tagElement.className = "game-tag";
                tagElement.textContent = tag;
                tagsContainer.appendChild(tagElement);
            });
            
            link.appendChild(tagsContainer);
        }

        item.appendChild(link);

        // Add game info section below the link
        if (localizedGame.gameInfo) {
            const gameInfoSection = document.createElement("div");
            gameInfoSection.className = "game-details";
            
            // Description
            if (localizedGame.gameInfo.description) {
                const descElement = document.createElement("p");
                descElement.className = "game-description";
                descElement.textContent = localizedGame.gameInfo.description;
                gameInfoSection.appendChild(descElement);
            }
            
            // Gameplay
            if (localizedGame.gameInfo.gameplay) {
                const gameplayElement = document.createElement("p");
                gameplayElement.className = "game-gameplay";
                gameplayElement.innerHTML = `<strong>🎯 ${t('gameplayLabel')}:</strong> ${localizedGame.gameInfo.gameplay}`;
                gameInfoSection.appendChild(gameplayElement);
            }
            
            // Metadata (genre, year, rating)
            const metaInfo = [];
            if (game.gameInfo.genre && game.gameInfo.genre.length > 0) {
                metaInfo.push(`<span class="game-meta-item">📂 ${game.gameInfo.genre.join(', ')}</span>`);
            }
            if (game.gameInfo.year) {
                metaInfo.push(`<span class="game-meta-item">📅 ${game.gameInfo.year}</span>`);
            }
            if (game.gameInfo.rating) {
                const stars = '⭐'.repeat(Math.round(game.gameInfo.rating));
                metaInfo.push(`<span class="game-meta-item">${stars} (${game.gameInfo.rating}/5)</span>`);
            }
            
            if (metaInfo.length > 0) {
                const metaElement = document.createElement("div");
                metaElement.className = "game-meta";
                metaElement.innerHTML = metaInfo.join(' • ');
                gameInfoSection.appendChild(metaElement);
            }
            
            item.appendChild(gameInfoSection);
        }

        // Add manage button for uploaded games
        if (isUploaded) {
            const manageBtn = document.createElement("button");
            manageBtn.className = "manage-button";
            manageBtn.textContent = "⚙️ Quản lý";
            manageBtn.onclick = (e) => {
                e.preventDefault();
                openEditGame(game);
            };
            item.appendChild(manageBtn);
        }

        container.appendChild(item);
    }
}

function setupAddMode() {
    if (!confirmDiscard()) {
        return;
    }
    state.currentGame = {
        icon: emptyIcon,
        settings: { ...defaultSettings },
        appProperties: {},
        systemProperties: {},
    };

    document.getElementById("add-edit-text").textContent = "➕ Thêm game mới";

    document.getElementById("file-input-step").style.display = "";
    document.getElementById("file-input-loading").style.display = "none";
    document.getElementById("file-input-jad-step").style.display = "none";
    document.getElementById("add-manage-step").style.display = "none";

    document.getElementById("game-file-input").disabled = false;
    document.getElementById("game-file-input").value = null;
}

async function processGameFile(fileBuffer, fileName) {
    const MIDletLoader = await lib.org.recompile.mobile.MIDletLoader;
    const File = await lib.java.io.File;

    const jarFile = await new File(
        "/files/_tmp/" + state.uploadedJars++ + ".jar"
    );

    await launcherUtil.copyJar(new Int8Array(fileBuffer), jarFile);
    state.currentGame.jarFile = jarFile;

    const AnalyserUtil = await lib.pl.zb3.freej2me.launcher.AnalyserUtil;
    const analysisResult = await AnalyserUtil.analyseFile(jarFile, fileName);
    fillGuessedSettings(analysisResult, state.currentGame);

    if (state.lastLoader) {
        await state.lastLoader.close();
    }
    const loader = await MIDletLoader.getMIDletLoader(jarFile);
    state.lastLoader = loader;

    if (!(await loader.getAppId())) {
        document.getElementById("file-input-step").style.display = "";
        document.getElementById("file-input-loading").style.display = "none";
        document.getElementById("file-input-jad-step").style.display = "";
        document.getElementById("upload-descriptor-file-input").value = null;

        document.getElementById("upload-descriptor-file-input").onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                document.getElementById("file-input-step").style.display = "none";
                document.getElementById("file-input-jad-step").style.display = "none";
                document.getElementById("file-input-loading").style.display = "";

                const reader = new FileReader();
                reader.onload = async () => {
                    const arrayBuffer = reader.result;
                    await launcherUtil.augementLoaderWithJAD(
                        loader,
                        new Int8Array(arrayBuffer)
                    );

                    if (await loader.getAppId()) {
                        setupNewGameManage(loader);
                    }
                };
                reader.readAsArrayBuffer(file);
            }
        };

        document.getElementById('continue-without-jad').onclick = () => {
            continueWithoutJAD(loader, fileName);
        };
    } else {
        setupNewGameManage(loader);
    }
}

function fillGuessedSettings(analysisResult, app) {
    if (analysisResult.screenWidth !== -1) {
        app.settings.width = analysisResult.screenWidth + '';
        app.settings.height = analysisResult.screenHeight + '';
    }

    if (analysisResult.phoneType) {
        app.settings.phone = analysisResult.phoneType;
    }
}

async function continueWithoutJAD(loader, origName) {
    // if we're here then need fallback name
    await launcherUtil.ensureAppId(loader, origName);
    loader.name = await loader.getAppId();

    setupNewGameManage(loader);
}

async function setupNewGameManage(loader) {
    state.currentGame.appId = await loader.getAppId();
    state.currentGame.name = loader.name || state.currentGame.appId;
    const iconBytes = await loader.getIconBytes();
    state.currentGame.icon = iconBytes
        ? await getDataUrlFromBlob(new Blob([iconBytes]))
        : emptyIcon;

    await javaToKv(loader.properties, state.currentGame.appProperties);

    setupAddManageGame(state.currentGame, true);
}

async function setupAddManageGame(app, isAdding) {
    document.getElementById("file-input-step").style.display = "none";
    document.getElementById("file-input-jad-step").style.display = "none";
    document.getElementById("file-input-loading").style.display = "none";
    document.getElementById("add-manage-step").style.display = "";

    const previewIcon = document.querySelector(".preview-icon");
    previewIcon.src = app.icon || emptyIcon;

    const previewName = document.querySelector(".preview-name");
    previewName.textContent = app.name;

    const previewControls = document.getElementById("preview-controls");
    previewControls.style.display = isAdding ? "none" : "";
    if (!isAdding) {
        document.getElementById("uninstall-btn").disabled = false;
        document.getElementById("uninstall-btn").onclick = (e) => {
            if (!confirm("Do you want to uninstall " + app.name + "?")) {
                return;
            }

            document.getElementById("uninstall-btn").disabled = true;
            doUninstallGame(app.appId);
        };

        document.getElementById("wipe-data-btn").disabled = false;
        document.getElementById("wipe-data-btn").onclick = (e) => {
            if (!confirm("Do you want wipe " + app.name + " rms storage?")) {
                return;
            }

            document.getElementById("wipe-data-btn").disabled = true;
            doWipeData(app.appId);
        };
    }

    const jadFileInput = document.getElementById("aux-jad-file-input");
    jadFileInput.value = null;
    jadFileInput.onchange = handleOptionalJadFileUpload;

    const phoneType = document.getElementById("phoneType");
    phoneType.value = app.settings.phone;

    const screenSize = document.getElementById("screenSize");

    const sizeStr = `${app.settings.width}x${app.settings.height}`;
    if ([...screenSize.options].some((opt) => opt.value === sizeStr)) {
        screenSize.value = sizeStr;
    } else {
        screenSize.value = "custom";
    }
    document.getElementById("customWidth").value = app.settings.width;
    document.getElementById("customHeight").value = app.settings.height;
    screenSize.onchange = adjustScreenSizeInput;
    adjustScreenSizeInput();

    const fontSize = document.getElementById("fontSize");
    if (app.settings.fontSize) {
        fontSize.value = app.settings.fontSize;
    }

    const dgFormat = document.getElementById("dgFormat");
    if (app.settings.dgFormat) {
        dgFormat.value = app.settings.dgFormat;
    }

    document.querySelector('input[name="enableSound"]').checked = app.settings.sound === "on";
    document.querySelector('input[name="rotate"]').checked = app.settings.rotate === "on";
    document.querySelector('input[name="forceFullscreen"]').checked = app.settings.forceFullscreen === "on";
    document.querySelector('input[name="textureDisableFilter"]').checked = app.settings.textureDisableFilter === "on";
    document.querySelector('input[name="queuedPaint"]').checked = app.settings.queuedPaint === "on";

    const appPropsTextarea = document.getElementById("editAppProps");
    appPropsTextarea.value = Object.entries(app.appProperties || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");

    const sysPropsTextarea = document.getElementById("editSysProps");
    sysPropsTextarea.value = Object.entries(app.systemProperties || {})
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");

    document.getElementById("add-save-button").disabled = false;
    document.getElementById("add-save-button").textContent = isAdding ? "Add game" : "Save game";
    document.getElementById("add-save-button").onclick = doAddSaveGame;
}

function adjustScreenSizeInput() {
    document.getElementById("edit-custom-size-inputs").style.display =
        document.getElementById("screenSize").value === "custom" ? "" : "none";
}

function handleOptionalJadFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    document.getElementById("add-manage-step").style.display = "none";
    document.getElementById("file-input-loading").style.display = "";

    // read as text?
    const reader = new FileReader();
    reader.onload = async () => {
        // this won't affect the name/id
        readToKv(reader.result, state.currentGame.appProperties);

        const appPropsTextarea = document.getElementById("editAppProps");
        appPropsTextarea.value = Object.entries(
            state.currentGame.appProperties || {}
        )
            .map(([key, value]) => `${key}: ${value}`)
            .join("\n");
    };
    reader.onloadend = () => {
        document.getElementById("add-manage-step").style.display = "";
        document.getElementById("file-input-loading").style.display = "none";
    };
    reader.readAsText(file);
}

async function doAddSaveGame() {
    document.getElementById("add-save-button").disabled = true;

    readUI(state.currentGame);

    const jsettings = await kvToJava(state.currentGame.settings);
    const jappProps = await kvToJava(state.currentGame.appProperties);
    const jsysProps = await kvToJava(state.currentGame.systemProperties);

    if (state.currentGame.jarFile) {
        // new game
        await launcherUtil.initApp(
            state.currentGame.jarFile,
            state.lastLoader, // loader with added properties, for name..
            jsettings,
            jappProps,
            jsysProps
        );
    } else {
        await launcherUtil.saveApp(
            state.currentGame.appId,
            jsettings,
            jappProps,
            jsysProps
        );
    }

    reloadUI();
}

function readUI(targetGameObj) {
    targetGameObj.settings.phone = document.getElementById("phoneType").value;

    const screenSize = document.getElementById("screenSize").value;
    if (screenSize === "custom") {
        targetGameObj.settings.width = document.getElementById("customWidth").value;
        targetGameObj.settings.height = document.getElementById("customHeight").value;
    } else {
        const [width, height] = screenSize.split("x");
        targetGameObj.settings.width = width;
        targetGameObj.settings.height = height;
    }

    targetGameObj.settings.fontSize = document.getElementById("fontSize").value;
    targetGameObj.settings.dgFormat = document.getElementById("dgFormat").value;

    targetGameObj.settings.sound = document.querySelector('input[name="enableSound"]').checked ? "on" : "off";
    targetGameObj.settings.rotate = document.querySelector('input[name="rotate"]').checked ? "on" : "off";
    targetGameObj.settings.forceFullscreen = document.querySelector('input[name="forceFullscreen"]').checked ? "on" : "off";
    targetGameObj.settings.textureDisableFilter = document.querySelector('input[name="textureDisableFilter"]').checked ? "on" : "off";
    targetGameObj.settings.queuedPaint = document.querySelector('input[name="queuedPaint"]').checked ? "on" : "off";

    readToKv(document.getElementById("editAppProps").value, targetGameObj.appProperties);
    readToKv(document.getElementById("editSysProps").value, targetGameObj.systemProperties);
}

function openEditGame(gameObj) {
    if (!confirmDiscard()) {
        return;
    }
    state.currentGame = gameObj;
    document.getElementById("add-edit-text").textContent = "✏️ Chỉnh sửa game";

    setupAddManageGame(gameObj, false);
    
    // Scroll to the add-game section
    document.querySelector('.add-game-section').scrollIntoView({ behavior: 'smooth' });
}

function confirmDiscard() {
    if (state.currentGame != null && (state.currentGame.jarFile || state.currentGame.appId)) {
        if (!confirm("Discard changes?")) {
            return false;
        }
    }

    return true;
}

async function reloadUI() {
    state.currentGame = null;

    const allGames = await loadGames();
    
    // Separate uploaded games from pre-installed games
    const preInstalledGameIds = (await loadGamesFromJson()).map(g => g.name.toLowerCase());
    
    state.games = [];
    state.uploadedGames = [];
    
    // Check if current page is diamond-rush.html
    const currentPath = window.location.pathname;
    const isDiamondRushPage = currentPath.includes('diamond-rush') || currentPath.includes('diamond-rush.html');
    
    for (const game of allGames) {
        const gameNameLower = game.name.toLowerCase();
        const isPreInstalled = preInstalledGameIds.some(pid => 
            gameNameLower.includes(pid) || pid.includes(gameNameLower)
        );
        
        // If this is Diamond Rush page, only show Diamond Rush games
        if (isDiamondRushPage) {
            const isDiamondRush = gameNameLower.includes('diamond') && gameNameLower.includes('rush');
            if (!isDiamondRush) {
                continue; // Skip non-Diamond Rush games
            }
        }
        
        if (isPreInstalled) {
            state.games.push(game);
        } else {
            state.uploadedGames.push(game);
        }
    }
    
    fillGamesList(state.games, state.uploadedGames);
    setupAddMode();
}

async function doUninstallGame(appId) {
    await launcherUtil.uninstallApp(appId);
    await reloadUI();
}

async function doWipeData(appId) {
    await launcherUtil.wipeAppData(appId);
    document.getElementById("wipe-data-btn").disabled = false;
}

function doImportData(e) {
    if (e.target.files.length > 0) {
        document.getElementById("import-data-btn").disabled = true;

        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const arrayBuffer = reader.result;
                await launcherUtil.importData(new Int8Array(arrayBuffer));
                await reloadUI();
            } catch (error) {
                console.error("Error importing data:", error);
            }
        };
        reader.onloadend = () => {
            document.getElementById("import-data-btn").disabled = false;
        };
        reader.readAsArrayBuffer(file);
    }
}

async function doExportData() {
    try {
        const exportedData = await launcherUtil.exportData();
        const blob = new Blob([exportedData.buffer], { type: "application/zip" });

        const objectURL = URL.createObjectURL(blob);
        const downloadLink = document.getElementById("export-data-link");

        downloadLink.href = objectURL;
        downloadLink.click();
        setTimeout(() => URL.revokeObjectURL(objectURL), 1000);
    } catch (error) {
        console.error("Error exporting data:", error);
        alert("Error exporting data");
    }
}

function setupGameSearch(games) {
    const searchInput = document.getElementById("game-search");
    const searchResultCount = document.getElementById("search-result-count");
    const gameList = document.getElementById("game-list");
    
    if (!searchInput) return;
    
    // Check if this is diamond-rush page and hide search if only one game
    const currentPath = window.location.pathname;
    const isDiamondRushPage = currentPath.includes('diamond-rush') || currentPath.includes('diamond-rush.html');
    
    if (isDiamondRushPage && games.length <= 1) {
        // Hide search container on Diamond Rush page if there's only one game
        const searchContainer = searchInput.closest('.search-container') || searchInput.closest('.game-info-container');
        if (searchContainer) {
            searchContainer.style.display = 'none';
        }
        return;
    }
    
    // Remove old event listeners
    const newSearchInput = searchInput.cloneNode(true);
    searchInput.parentNode.replaceChild(newSearchInput, searchInput);
    
    newSearchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        filterGames(searchTerm, games, gameList, searchResultCount);
    });
    
    // Initial count
    updateSearchCount(games.length, games.length, searchResultCount);
}

function filterGames(searchTerm, games, gameList, searchResultCount) {
    const gameItems = gameList.querySelectorAll(".game-item");
    let visibleCount = 0;
    
    if (!searchTerm) {
        // Show all games
        gameItems.forEach(item => {
            item.classList.remove("hidden");
        });
        visibleCount = games.length;
    } else {
        // Filter games
        gameItems.forEach((item, index) => {
            const game = games[index];
            if (!game) return;
            
            const searchableText = [
                game.name,
                game.gameInfo?.description,
                game.gameInfo?.gameplay,
                ...(game.gameInfo?.tags || []),
                ...(game.gameInfo?.genre || [])
            ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
            
            if (searchableText.includes(searchTerm)) {
                item.classList.remove("hidden");
                visibleCount++;
            } else {
                item.classList.add("hidden");
            }
        });
    }
    
    updateSearchCount(visibleCount, games.length, searchResultCount);
    
    // Show "no results" message if needed
    showNoResultsMessage(visibleCount, gameList);
}

function updateSearchCount(visibleCount, totalCount, searchResultCount) {
    if (!searchResultCount) return;
    
    if (visibleCount === totalCount) {
        searchResultCount.textContent = t('searchShowingAll', { count: totalCount });
    } else {
        searchResultCount.textContent = t('searchResults', { found: visibleCount, total: totalCount });
    }
}

function showNoResultsMessage(visibleCount, gameList) {
    // Remove existing no results message
    const existingMessage = gameList.querySelector(".no-results-message");
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Show message if no results
    if (visibleCount === 0) {
        const noResultsDiv = document.createElement("div");
        noResultsDiv.className = "no-results-message";
        noResultsDiv.innerHTML = `
            <span class="emoji">😔</span>
            <div>${t('noGamesFound')}</div>
            <div style="margin-top: 8px; font-size: 14px;">${t('tryDifferentSearch')}</div>
        `;
        gameList.appendChild(noResultsDiv);
    }
}

// Listen for language changes and re-render games
window.addEventListener('languageChanged', () => {
    const gameList = document.getElementById('game-list');
    if (gameList && window.currentGames) {
        gameList.innerHTML = '';
        renderGames(window.currentGames, gameList, false);
    }
    
    const uploadedList = document.getElementById('uploaded-game-list');
    if (uploadedList && window.uploadedGames) {
        uploadedList.innerHTML = '';
        renderGames(window.uploadedGames, uploadedList, true);
    }
    
    // Update search count if search is active
    const searchInput = document.getElementById('game-search');
    if (searchInput && searchInput.value.trim()) {
        const searchTerm = searchInput.value.trim();
        const searchResultCount = document.getElementById('search-result-count');
        const allGames = (window.currentGames || []).concat(window.uploadedGames || []);
        filterGames(searchTerm, allGames, gameList, searchResultCount);
    }
});

main();
