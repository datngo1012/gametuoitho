// note that we can only call java stuff if thread not running..
const cheerpjWebRoot = '/app'+location.pathname.replace(/\/$/,'');

// Better default icon using SVG
const emptyIcon = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23667eea'/%3E%3Ctext x='40' y='50' font-family='Arial' font-size='40' text-anchor='middle' fill='white'%3E🎮%3C/text%3E%3C/svg%3E";

let lib = null, launcherUtil = null;
let state = {
    games: [],
    currentGame: null,
    editedGameId: null,
    uploadedJars: 0,
};
let defaultSettings = {};

async function main() {
    const loadingText = document.getElementById("loading-text");
    const progressBar = document.getElementById("progress-bar");
    
    loadingText.textContent = "Đang tải...";
    progressBar.style.width = "10%";
    
    await cheerpjInit({
        enableDebug: false
    });

    loadingText.textContent = "Đang khởi động...";
    progressBar.style.width = "30%";

    lib = await cheerpjRunLibrary(cheerpjWebRoot+"/freej2me-web.jar");

    loadingText.textContent = "Đang tải game...";
    progressBar.style.width = "50%";

    launcherUtil = await lib.pl.zb3.freej2me.launcher.LauncherUtil;

    await launcherUtil.resetTmpDir();

    loadingText.textContent = "Đang tải cấu hình...";
    progressBar.style.width = "70%";

    const Config = await lib.org.recompile.freej2me.Config;
    await javaToKv(Config.DEFAULT_SETTINGS, defaultSettings);

    loadingText.textContent = "Đang chuẩn bị...";
    progressBar.style.width = "90%";

    await reloadUI();

    loadingText.textContent = "Hoàn tất!";
    progressBar.style.width = "100%";

    setTimeout(() => {
        document.getElementById("loading").style.display = "none";
        document.getElementById("main").style.display = "";
    }, 300);

    // Only set onclick if elements exist
    const clearCurrentBtn = document.getElementById("clear-current");
    if (clearCurrentBtn) {
        clearCurrentBtn.onclick = setupAddMode;
    }

    const importDataBtn = document.getElementById("import-data-btn");
    if (importDataBtn) {
        importDataBtn.addEventListener("click", () => {
            document.getElementById("import-data-file").click();
        });
    }

    const importDataFile = document.getElementById("import-data-file");
    if (importDataFile) {
        importDataFile.onchange = doImportData;
    }

    const exportDataBtn = document.getElementById("export-data-btn");
    if (exportDataBtn) {
        exportDataBtn.onclick = doExportData;
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

async function loadGames() {
    const apps = [];

    try {
        // Load game list from JSON file
        const res = await fetch("games/list.json");
        const gamesList = await res.json();
        
        // Convert JSON games to app format
        for (const game of gamesList) {
            const napp = {
                appId: game.id,
                name: game.name,
                filename: game.filename,
                icon: emptyIcon,
                settings: game.settings || { ...defaultSettings },
                appProperties: {},
                systemProperties: {},
                description: game.description || "",
                gameplay: game.gameplay || "",
                genre: game.genre || [],
                tags: game.tags || [],
                year: game.year || "",
                rating: game.rating || 0,
                jarPath: "games/" + game.filename // Path to JAR file in games folder
            };

            // Set icon path - use direct path, browser will handle loading
            if (game.icon) {
                // Use icon from JSON if specified
                napp.icon = game.icon;
            } else if (game.id) {
                // Try default icon path based on game ID
                napp.icon = "games/" + game.id + "/icon.png";
            }

            apps.push(napp);
        }
    } catch (error) {
        console.error("Error loading games from list.json:", error);
    }

    return apps;
}

function fillGamesList(games) {
    const container = document.getElementById("game-list");
    container.innerHTML = "";

    if (!games || games.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🎮</div>
                <div class="empty-state-text">Chưa có game nào</div>
                <div class="empty-state-subtext">Thêm game để bắt đầu chơi!</div>
            </div>
        `;
        return;
    }

    for (const game of games) {
        const item = document.createElement("div");
        item.className = "game-item";

        const link = document.createElement("a");
        // Use app ID for URL parameter
        link.href = "run.html?app=" + game.appId;
        link.addEventListener('pointerdown', e => {
            if (e.pointerType === 'touch') {
                link.href = "run.html?app=" + game.appId + "&mobile=1";
            }
        });

        const icon = document.createElement("img");
        icon.className = "icon";
        icon.src = game.icon;
        icon.alt = game.name;
        // Fallback to empty icon if image fails to load
        icon.onerror = function() {
            this.src = emptyIcon;
        };
        link.appendChild(icon);

        const info = document.createElement("div");
        info.className = "game-info";
        info.textContent = game.name;
        link.appendChild(info);

        // Add tags if available
        if (game.tags && game.tags.length > 0) {
            const tagsContainer = document.createElement("div");
            tagsContainer.className = "game-tags";
            
            game.tags.slice(0, 3).forEach(tag => {
                const tagEl = document.createElement("span");
                tagEl.className = "game-tag";
                tagEl.textContent = tag;
                tagsContainer.appendChild(tagEl);
            });
            
            link.appendChild(tagsContainer);
        }

        // Add rating if available
        if (game.rating) {
            const ratingEl = document.createElement("div");
            ratingEl.className = "game-rating";
            ratingEl.innerHTML = `⭐ ${game.rating.toFixed(1)}`;
            link.appendChild(ratingEl);
        }

        item.appendChild(link);

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

    // document.getElementById("add-edit-text").textContent = "Add new game";

    // document.getElementById("file-input-step").style.display = "";
    // document.getElementById("file-input-loading").style.display = "none";
    // document.getElementById("file-input-jad-step").style.display = "none";
    // document.getElementById("add-manage-step").style.display = "none";

    // document.getElementById("game-file-input").disabled = false;
    // document.getElementById("game-file-input").value = null;

    // document.getElementById("game-file-input").onchange = (e) => {
    //     // read file to arraybuffer
    //     const file = e.target.files[0];
    //     if (file) {
    //         document.getElementById("game-file-input").disabled = true;
    //         document.getElementById("file-input-step").style.display = "none";
    //         document.getElementById("file-input-loading").style.display = "";

    //         const reader = new FileReader();
    //         reader.onload = async () => {
    //             const arrayBuffer = reader.result;
    //             await processGameFile(arrayBuffer, file.name);
    //         };
    //         reader.readAsArrayBuffer(file);
    //     }
    // };
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
