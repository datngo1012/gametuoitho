// note that we can only call java stuff if thread not running..
const cheerpjWebRoot = '/app'+location.pathname.replace(/\/$/,'');

const emptyIcon = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

let lib = null, launcherUtil = null;
let state = {
    games: [],
    currentGame: null,
    editedGameId: null,
    uploadedJars: 0,
    preloadedGames: [], // Danh sách games từ thư mục
};
let defaultSettings = {};

// Import GameLoader
import { GameLoader } from './game-loader.js';
const gameLoader = new GameLoader();

function updateLoadingProgress(progress, text) {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const loadingText = document.querySelector('.loading-text');
    
    if (progressBar) progressBar.style.width = progress + '%';
    if (progressText) progressText.textContent = Math.round(progress) + '%';
    if (loadingText) loadingText.textContent = text;
}

async function main() {
    updateLoadingProgress(10, 'Đang quét thư mục game...');
    
    // Load danh sách games từ thư mục trước
    state.preloadedGames = await gameLoader.loadGamesFromDirectory();
    
    updateLoadingProgress(25, 'Khởi động máy ảo Java...');
    await cheerpjInit({
        enableDebug: false
    });

    updateLoadingProgress(50, 'Đang tải thư viện...');
    lib = await cheerpjRunLibrary(cheerpjWebRoot+"/freej2me-web.jar");

    updateLoadingProgress(70, 'Khởi tạo hệ thống...');
    launcherUtil = await lib.pl.zb3.freej2me.launcher.LauncherUtil;

    await launcherUtil.resetTmpDir();

    const Config = await lib.org.recompile.freej2me.Config;
    await javaToKv(Config.DEFAULT_SETTINGS, defaultSettings);

    updateLoadingProgress(80, 'Cài đặt game...');
    // Tự động cài đặt các game từ thư mục nếu chưa có
    await autoInstallPreloadedGames();

    updateLoadingProgress(95, 'Hoàn tất...');
    await reloadUI();

    updateLoadingProgress(100, 'Sẵn sàng!');
    setTimeout(() => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("main").style.display = "";
    }, 300);

    document.getElementById("clear-current").onclick = setupAddMode;

    document.getElementById("import-data-btn").addEventListener("click", () => {
        document.getElementById("import-data-file").click();
    });

    document.getElementById("import-data-file").onchange = doImportData;
    document.getElementById("export-data-btn").onclick = doExportData;
    
    // Setup search functionality
    setupGameSearch();
}

function setupGameSearch() {
    const searchInput = document.getElementById("game-search");
    if (!searchInput) return;
    
    searchInput.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        filterGames(searchTerm);
    });
}

function filterGames(searchTerm) {
    const gameItems = document.querySelectorAll(".game-item");
    let visibleCount = 0;
    
    gameItems.forEach(item => {
        const nameElement = item.querySelector(".game-info");
        const originalName = nameElement.getAttribute('data-original-name') || nameElement.textContent;
        const gameName = originalName.toLowerCase();
        const matches = gameName.includes(searchTerm);
        
        if (matches) {
            item.style.display = "flex";
            visibleCount++;
            
            // Highlight search term or restore original
            if (searchTerm) {
                const regex = new RegExp(`(${searchTerm})`, 'gi');
                const highlightedText = originalName.replace(regex, '<span class="highlight">$1</span>');
                nameElement.innerHTML = '▶ ' + highlightedText;
            } else {
                nameElement.textContent = originalName;
                // Re-add the play icon
                nameElement.innerHTML = '';
                nameElement.textContent = originalName;
            }
        } else {
            item.style.display = "none";
        }
    });
    
    // Update search count
    const searchCount = document.getElementById("search-count");
    const totalGames = gameItems.length;
    
    if (searchTerm && searchCount) {
        searchCount.style.display = "block";
        searchCount.textContent = `${visibleCount}/${totalGames}`;
    } else if (searchCount) {
        searchCount.style.display = "none";
    }
    
    // Show "no results" message if no games match
    const gameList = document.getElementById("game-list");
    let noResultsDiv = gameList.querySelector(".no-results");
    
    if (visibleCount === 0 && searchTerm) {
        if (!noResultsDiv) {
            noResultsDiv = document.createElement("div");
            noResultsDiv.className = "no-results";
            noResultsDiv.innerHTML = `
                <div class="no-results-icon">🔍</div>
                <h3>Không tìm thấy game</h3>
                <p>Không có game nào khớp với "<strong>${searchTerm}</strong>"</p>
                <p>💡 Thử tìm kiếm với từ khóa khác</p>
            `;
            gameList.appendChild(noResultsDiv);
        }
    } else if (noResultsDiv) {
        noResultsDiv.remove();
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

// Tự động cài đặt các game từ thư mục
async function autoInstallPreloadedGames() {
    if (state.preloadedGames.length === 0) {
        return;
    }

    // Kiểm tra xem đã có game nào được cài chưa
    const installedAppsBlob = await cjFileBlob("/files/apps.list");
    const installedIds = installedAppsBlob 
        ? (await installedAppsBlob.text()).trim().split("\n").filter(Boolean)
        : [];

    const totalGames = state.preloadedGames.length;
    for (let i = 0; i < totalGames; i++) {
        const game = state.preloadedGames[i];
        try {
            // Tải file JAR
            const progress = 80 + (15 * (i / totalGames));
            updateLoadingProgress(progress, `Đang cài đặt ${game.name}... (${i + 1}/${totalGames})`);
            
            const jarBuffer = await gameLoader.loadJarFile(game.jarPath);
            const jadBuffer = game.jadPath ? await gameLoader.loadJadFile(game.jadPath) : null;

            const MIDletLoader = await lib.org.recompile.mobile.MIDletLoader;
            const File = await lib.java.io.File;

            const jarFile = await new File(
                "/files/_tmp/preload_" + game.filename
            );

            await launcherUtil.copyJar(new Int8Array(jarBuffer), jarFile);

            const loader = await MIDletLoader.getMIDletLoader(jarFile);

            // Nếu có JAD, load nó
            if (jadBuffer) {
                await launcherUtil.augementLoaderWithJAD(loader, new Int8Array(jadBuffer));
            }

            // Đảm bảo có appId
            if (!(await loader.getAppId())) {
                await launcherUtil.ensureAppId(loader, game.filename);
            }

            const appId = await loader.getAppId();

            // Kiểm tra xem game đã được cài chưa
            if (installedIds.includes(appId)) {
                console.log(`Game ${game.name} đã được cài đặt`);
                continue;
            }

            // Merge settings với default
            const gameSettings = {
                ...defaultSettings,
                ...game.settings
            };

            const jsettings = await kvToJava(gameSettings);
            
            // Đọc properties từ loader
            const appProps = {};
            await javaToKv(loader.properties, appProps);
            const jappProps = await kvToJava(appProps);
            const jsysProps = await kvToJava({});

            // Cài đặt game
            await launcherUtil.initApp(jarFile, loader, jsettings, jappProps, jsysProps);
            
            console.log(`Đã cài đặt game: ${game.name}`);
        } catch (error) {
            console.error(`Lỗi khi cài đặt game ${game.name}:`, error);
        }
    }
}

async function loadGames() {
    const apps = [];

    let installedAppsBlob = await cjFileBlob("/files/apps.list");
    if (!installedAppsBlob) {
        const res = await fetch("init.zip");
        const ab = await res.arrayBuffer();
        await launcherUtil.importData(new Int8Array(ab));

        installedAppsBlob = await cjFileBlob("/files/apps.list");
    }

    if (installedAppsBlob) {
        const installedIds = (await installedAppsBlob.text()).trim().split("\n");

        for (const appId of installedIds) {
            const napp = {
                appId,
                name: appId,
                icon: emptyIcon,
                settings: { ...defaultSettings },
                appProperties: {},
                systemProperties: {},
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

function fillGamesList(games) {
    const container = document.getElementById("game-list");
    container.innerHTML = "";

    if (games.length === 0) {
        const emptyDiv = document.createElement("div");
        emptyDiv.className = "empty-games";
        emptyDiv.innerHTML = `
            <div class="empty-games-icon">�</div>
            <h3>Chưa có game nào</h3>
            <p>📁 Thêm file <code>.jar</code> vào thư mục <code>web/games/</code></p>
            <p>📝 Cập nhật file <code>list.json</code></p>
            <p>🔄 Refresh lại trang</p>
        `;
        container.appendChild(emptyDiv);
        return;
    }

    for (const game of games) {
        const item = document.createElement("div");
        item.className = "game-item";

        const link = document.createElement("a");
        link.href = "run?app=" + game.appId;
        link.addEventListener('pointerdown', e => {
            if (e.pointerType === 'touch') {
                link.href = "run?app=" + game.appId + "&mobile=1";
            }
        });

        const icon = document.createElement("div");
        icon.className = "icon";
        
        if (game.icon && game.icon !== emptyIcon) {
            const img = document.createElement("img");
            img.src = game.icon;
            img.style.width = "100%";
            img.style.height = "100%";
            img.style.borderRadius = "10px";
            icon.appendChild(img);
        } else {
            icon.classList.add("default-icon");
        }
        
        link.appendChild(icon);

        const info = document.createElement("div");
        info.className = "game-info";
        info.textContent = game.name;
        info.setAttribute('data-original-name', game.name); // Store original name for search
        link.appendChild(info);

        item.appendChild(link);

        const manageButton = document.createElement("button");
        manageButton.textContent = "Manage";
        manageButton.onclick = () => openEditGame(game);
        item.appendChild(manageButton);

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

    document.getElementById("add-edit-text").textContent = "Add new game";

    document.getElementById("file-input-step").style.display = "";
    document.getElementById("file-input-loading").style.display = "none";
    document.getElementById("file-input-jad-step").style.display = "none";
    document.getElementById("add-manage-step").style.display = "none";

    document.getElementById("game-file-input").disabled = false;
    document.getElementById("game-file-input").value = null;

    document.getElementById("game-file-input").onchange = (e) => {
        // read file to arraybuffer
        const file = e.target.files[0];
        if (file) {
            document.getElementById("game-file-input").disabled = true;
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
    document.getElementById("add-edit-text").textContent = "Edit game";

    setupAddManageGame(gameObj, false);
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

    state.games = await loadGames();
    fillGamesList(state.games);
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

main();
