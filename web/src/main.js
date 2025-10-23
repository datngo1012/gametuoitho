import { LibMedia } from "../libmedia/libmedia.js";
import { LibMidi, createUnlockingAudioContext } from "../libmidi/libmidi.js";
import { codeMap, KeyRepeatManager } from "./key.js";
import { EventQueue } from "./eventqueue.js";
import { initKbdListeners, setKbdHandler, kbdWidth, kbdHeight } from "./screenKbd.js";

// we need to import natives here, don't use System.loadLibrary
// since CheerpJ fails to load them in firefox and we can't set breakpoints
import canvasFontNatives from "../libjs/libcanvasfont.js";
import canvasGraphicsNatives from "../libjs/libcanvasgraphics.js";
import gles2Natives from "../libjs/libgles2.js";
import jsReferenceNatives from "../libjs/libjsreference.js";
import mediaBridgeNatives from "../libjs/libmediabridge.js";
import midiBridgeNatives from "../libjs/libmidibridge.js";

const evtQueue = new EventQueue();
const sp = new URLSearchParams(location.search);

const cheerpjWebRoot = '/app'+location.pathname.replace(/\/[^/]*$/,'');

let isMobile = sp.get('mobile');

let display = null;
let screenCtx = null;

let fractionScale = sp.get('fractionScale') || (localStorage && localStorage.getItem("pl.zb3.freej2me.fractionScale") === "true");
let scaleSet = false;

const keyRepeatManager = new KeyRepeatManager();

window.evtQueue = evtQueue;

function autoscale() {
    if (!scaleSet) return;

    let screenWidth = window.innerWidth;
    let screenHeight = window.innerHeight;

    if (isMobile) {
        document.getElementById('left-keys').style.display = '';
        document.getElementById('right-keys').style.display = '';

        if (screenWidth > screenHeight) {
            document.body.classList.add('kbd-landscape');
            document.body.classList.remove('kbd-portrait');
            screenWidth = screenWidth - 2*kbdWidth;
        } else {
            document.body.classList.add('kbd-portrait');
            document.body.classList.remove('kbd-landscape');
            screenHeight = screenHeight - kbdHeight;
        }
    }

    let scale = Math.min(
        screenWidth/screenCtx.canvas.width,
        screenHeight/screenCtx.canvas.height
    );

    if (!fractionScale) {
        scale = scale|0;
    }

    display.style.zoom = scale;
}

function setListeners() {
    let mouseDown = false;
    let noMouse = false;

    setKbdHandler((isDown, key) => {
        const symbol = key.startsWith('Digit') ? key.substring(5) : '\x00';
        keyRepeatManager.post(isDown, key, {symbol, ctrlKey: false, shiftKey: false});
    });

    function handleKeyEvent(e) {
        const isDown = e.type === 'keydown';

        if (codeMap[e.code]) {
            keyRepeatManager.post(isDown, e.code, {
                symbol: e.key.length == 1 ? e.key.charCodeAt(0) : '\x00',
                ctrlKey: e.ctrlKey,
                shiftKey: e.shiftKey
            })
        }
        e.preventDefault();
    }

    display.addEventListener('keydown', handleKeyEvent);
    display.addEventListener('keyup', handleKeyEvent);

    keyRepeatManager.register((kind, key, args) => {
        if (kind === 'click') {
            if (key === 'Maximize') {
                fractionScale = !fractionScale;
                localStorage && localStorage.setItem("pl.zb3.freej2me.fractionScale", fractionScale);
                autoscale();
            }
        } else if (codeMap[key]) {
            console.log('queuin event');
            evtQueue.queueEvent({
                kind: kind === 'up' ? 'keyup' : 'keydown',
                args: [codeMap[key], args.symbol, args.ctrlKey, args.shiftKey]
            });
        }
    });

    display.addEventListener('mousedown', async e => {
        display.focus();
        if (noMouse) return;

        evtQueue.queueEvent({
            kind: 'pointerpressed',
            x: e.offsetX / display.currentCSSZoom | 0,
            y: e.offsetY / display.currentCSSZoom | 0,
        });

        mouseDown = true;

        e.preventDefault();
    });

    display.addEventListener('mousemove', async e => {
        if (noMouse) return;
        if (!mouseDown) return;

        evtQueue.queueEvent({
            kind: 'pointerdragged',
            x: e.offsetX / display.currentCSSZoom | 0,
            y: e.offsetY / display.currentCSSZoom | 0,
        });

        e.preventDefault();
    });

    document.addEventListener('mouseup', async e => {
        if (noMouse) return;
        if (!mouseDown) return;

        mouseDown = false;

        evtQueue.queueEvent({
            kind: 'pointerreleased',
            x: (e.pageX - display.offsetLeft) / display.currentCSSZoom | 0,
            y: (e.pageY - display.offsetTop) / display.currentCSSZoom | 0,
        });

        e.preventDefault();
    });


    display.addEventListener('touchstart', async e => {
        display.focus();
        noMouse = true;

        evtQueue.queueEvent({
            kind: 'pointerpressed',
            x: (e.changedTouches[0].pageX - display.offsetLeft) / display.currentCSSZoom | 0,
            y: (e.changedTouches[0].pageY - display.offsetTop) / display.currentCSSZoom | 0,
        });

        e.preventDefault();
    }, {passive: false});

    display.addEventListener('touchmove', async e => {
        noMouse = true;

        evtQueue.queueEvent({
            kind: 'pointerdragged',
            x: (e.changedTouches[0].pageX - display.offsetLeft) / display.currentCSSZoom | 0,
            y: (e.changedTouches[0].pageY - display.offsetTop) / display.currentCSSZoom | 0,
        });

        e.preventDefault();
    }, {passive: false});

    display.addEventListener('touchend', async e => {
        noMouse = true;

        evtQueue.queueEvent({
            kind: 'pointerreleased',
            x: (e.changedTouches[0].pageX - display.offsetLeft) / display.currentCSSZoom | 0,
            y: (e.changedTouches[0].pageY - display.offsetTop) / display.currentCSSZoom | 0,
        });

        e.preventDefault();
    });

    document.addEventListener('mousedown', e => {
        console.log('refocus');
        setTimeout(() => display.focus(), 20);
        ;
    });

    display.addEventListener('blur', e => {
        console.log('refocus');
        // it doesn't work without any timeout
        setTimeout(() => display.focus(), 10);
        ;
    });

    window.addEventListener('resize', autoscale);

    initKbdListeners();
}

function setFaviconFromBuffer(arrayBuffer) {
    const blob = new Blob([arrayBuffer], { type: 'image/png' });

    const reader = new FileReader();
    reader.onload = function() {
        const dataURL = reader.result;

        let link = document.querySelector("link[rel*='icon']");
        if (!link) {
            link = document.createElement('link');
            link.setAttribute('rel', 'icon');
            document.head.appendChild(link);
        }
        link.setAttribute('href', dataURL);
    };
    reader.readAsDataURL(blob);
}

async function ensureAppInstalled(lib, appId) {
    const appFile = await cjFileBlob(appId + "/app.jar");

    if (!appFile) {
        const launcherUtil = await lib.pl.zb3.freej2me.launcher.LauncherUtil;

        await launcherUtil.installFromBundle(cheerpjWebRoot + "/apps/", appId);
    }
}

async function loadGameInfo(appId) {
    try {
        console.log('[loadGameInfo] Loading game info for appId:', appId);
        
        // Try to load from saved file
        const gameInfoBlob = await cjFileBlob("/files/" + appId + "/gameinfo.json");
        if (gameInfoBlob) {
            const gameInfoText = await gameInfoBlob.text();
            const parsed = JSON.parse(gameInfoText);
            console.log('[loadGameInfo] Loaded from saved file:', parsed);
            return parsed;
        }
        
        console.log('[loadGameInfo] No saved file, trying games/list.json');
        
        // Fallback: try to load from games/list.json
        const response = await fetch('games/list.json');
        if (response.ok) {
            const gamesList = await response.json();
            console.log('[loadGameInfo] Games list loaded, count:', gamesList.length);
            
            const gameFromList = gamesList.find(g => {
                if (!g.filename) return false;
                
                const fileNameBase = g.filename.replace(/\.jar$/, '').toLowerCase();
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
                console.log('[loadGameInfo] Found game:', gameFromList.name);
                return {
                    description: gameFromList.description || '',
                    gameplay: gameFromList.gameplay || '',
                    tags: gameFromList.tags || [],
                    genre: gameFromList.genre || [],
                    year: gameFromList.year || 0,
                    rating: gameFromList.rating || 0
                };
            } else {
                console.warn('[loadGameInfo] No match found for appId:', appId);
            }
        } else {
            console.error('[loadGameInfo] Failed to fetch games/list.json');
        }
    } catch (error) {
        console.error('[loadGameInfo] Error:', error);
    }
    
    return null;
}

function displayGameInfo(gameName, gameInfo) {
    console.log('[displayGameInfo] Called with:', gameName, gameInfo);
    
    if (!gameInfo) {
        console.warn('[displayGameInfo] No gameInfo provided');
        return;
    }
    
    // Show info button
    const infoBtn = document.getElementById('info-btn');
    if (infoBtn) {
        infoBtn.style.display = '';
        console.log('[displayGameInfo] Info button shown');
    } else {
        console.warn('[displayGameInfo] Info button not found');
    }
    
    // Fill modal with game info
    const modalGameName = document.getElementById('modal-game-name');
    if (modalGameName) {
        modalGameName.textContent = gameName;
    }
    
    // Tags
    const modalGameTags = document.getElementById('modal-game-tags');
    if (modalGameTags && gameInfo.tags && gameInfo.tags.length > 0) {
        modalGameTags.innerHTML = '';
        gameInfo.tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = 'game-info-tag';
            tagElement.textContent = tag;
            modalGameTags.appendChild(tagElement);
        });
        console.log('[displayGameInfo] Tags added:', gameInfo.tags.length);
    }
    
    // Meta info
    const modalGameMeta = document.getElementById('modal-game-meta');
    if (modalGameMeta) {
        modalGameMeta.innerHTML = '';
        
        if (gameInfo.year) {
            const yearItem = document.createElement('div');
            yearItem.className = 'game-info-meta-item';
            yearItem.innerHTML = `<span>📅</span> <strong>Năm:</strong> ${gameInfo.year}`;
            modalGameMeta.appendChild(yearItem);
        }
        
        if (gameInfo.rating) {
            const ratingItem = document.createElement('div');
            ratingItem.className = 'game-info-meta-item';
            ratingItem.innerHTML = `<span>⭐</span> <strong>Đánh giá:</strong> ${gameInfo.rating}/5`;
            modalGameMeta.appendChild(ratingItem);
        }
        
        if (gameInfo.genre && gameInfo.genre.length > 0) {
            const genreItem = document.createElement('div');
            genreItem.className = 'game-info-meta-item';
            genreItem.innerHTML = `<span>🎭</span> <strong>Thể loại:</strong> ${gameInfo.genre.join(', ')}`;
            modalGameMeta.appendChild(genreItem);
        }
    }
    
    // Description
    const modalDescriptionSection = document.getElementById('modal-description-section');
    const modalGameDescription = document.getElementById('modal-game-description');
    if (modalGameDescription && gameInfo.description) {
        modalGameDescription.textContent = gameInfo.description;
        if (modalDescriptionSection) {
            modalDescriptionSection.style.display = '';
        }
        console.log('[displayGameInfo] Description added');
    } else {
        console.warn('[displayGameInfo] No description or element not found');
    }
    
    // Gameplay
    const modalGameplaySection = document.getElementById('modal-gameplay-section');
    const modalGameGameplay = document.getElementById('modal-game-gameplay');
    if (modalGameGameplay && gameInfo.gameplay) {
        modalGameGameplay.textContent = gameInfo.gameplay;
        if (modalGameplaySection) {
            modalGameplaySection.style.display = '';
        }
        console.log('[displayGameInfo] Gameplay added');
    } else {
        console.warn('[displayGameInfo] No gameplay or element not found');
    }
    
    console.log('[displayGameInfo] Complete');
}

async function init() {
    const loadingText = document.getElementById("loading-text");
    const progressBar = document.getElementById("progress-bar-fill");
    const progressPercentage = document.getElementById("progress-percentage");
    
    function updateProgress(percent, text) {
        if (progressBar) progressBar.style.width = percent + "%";
        if (progressPercentage) progressPercentage.textContent = percent + "%";
        if (loadingText) loadingText.textContent = text;
    }
    
    updateProgress(5, "Đang tải...");

    display = document.getElementById('display');
    screenCtx = display.getContext('2d');

    setListeners();

    updateProgress(15, "Đang khởi tạo âm thanh...");
    
    window.libmidi = new LibMidi(createUnlockingAudioContext());
    await window.libmidi.init();
    window.libmidi.midiPlayer.addEventListener('end-of-media', e => {
        window.evtQueue.queueEvent({kind: 'player-eom', player: e.target});
    })
    window.libmedia = new LibMedia();

    updateProgress(30, "Đang khởi động...");

    await cheerpjInit({
        enableDebug: false,
        natives: {
            ...canvasFontNatives,
            ...canvasGraphicsNatives,
            ...gles2Natives,
            ...jsReferenceNatives,
            ...mediaBridgeNatives,
            ...midiBridgeNatives,
            async Java_pl_zb3_freej2me_bridge_shell_Shell_setTitle(lib, title) {
                document.title = title;
                const gameTitle = document.getElementById('game-title');
                if (gameTitle) gameTitle.textContent = '🎮 ' + title;
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_setIcon(lib, iconBytes) {
                if (iconBytes) {
                    setFaviconFromBuffer(iconBytes.buffer);
                }
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_getScreenCtx(lib) {
                return screenCtx;
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_setCanvasSize(lib, width, height) {
                if (!scaleSet) {
                    const loadingEl = document.getElementById('loading');
                    if (loadingEl) {
                        loadingEl.style.display = 'none';
                    }
                    display.style.display = '';
                    scaleSet = true;
                    display.focus();
                }
                screenCtx.canvas.width = width;
                screenCtx.canvas.height = height;
                autoscale();
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_waitForAndDispatchEvents(lib, listener) {
                const KeyEvent = await lib.pl.zb3.freej2me.bridge.shell.KeyEvent;
                const PointerEvent = await lib.pl.zb3.freej2me.bridge.shell.PointerEvent;

                const evt = await evtQueue.waitForEvent();
                if (evt.kind == 'keydown') {
                    await listener.keyPressed(await new KeyEvent(...evt.args));
                } else if (evt.kind == 'keyup') {
                    await listener.keyReleased(await new KeyEvent(...evt.args));
                } else if (evt.kind == 'pointerpressed') {
                    await listener.pointerPressed(await new PointerEvent(evt.x, evt.y));
                } else if (evt.kind == 'pointerdragged') {
                    await listener.pointerDragged(await new PointerEvent(evt.x, evt.y));
                } else if (evt.kind == 'pointerreleased') {
                    await listener.pointerReleased(await new PointerEvent(evt.x, evt.y));
                } else if (evt.kind == 'player-eom') {
                    await listener.playerEOM(evt.player);
                } else if (evt.kind == 'player-video-frame') {
                    await listener.playerVideoFrame(evt.player);
                }
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_restart(lib) {
                location.reload();
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_exit(lib) {
                location.href = './';
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_sthop(lib) {
                debugger;
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_say(lib, sth) {
                console.log('[say]', sth);
            },
            async Java_pl_zb3_freej2me_bridge_shell_Shell_sayObject(lib, label, obj) {
                debugger;
                console.log('[sayobject]', label, obj);
            }
        }
    });

    updateProgress(50, "Đang tải game...");

    const lib = await cheerpjRunLibrary(cheerpjWebRoot+"/freej2me-web.jar");

    updateProgress(70, "Đang chuẩn bị...");

    const FreeJ2ME = await lib.org.recompile.freej2me.FreeJ2ME;

    let args;
    let currentAppId = null;

    if (sp.get('app')) {
        const app = sp.get('app');
        currentAppId = app;
        await ensureAppInstalled(lib, app);

        args = ['app', sp.get('app')];
        
        // Load and display game info
        updateProgress(75, "Đang tải thông tin game...");
        const gameInfo = await loadGameInfo(app);
        if (gameInfo) {
            // Get game name from files
            const nameBlob = await cjFileBlob("/files/" + app + "/name");
            const gameName = nameBlob ? await nameBlob.text() : app;
            displayGameInfo(gameName, gameInfo);
        }
    } else {
        args = ['jar', cheerpjWebRoot+"/jar/" + (sp.get('jar') || "game.jar")];
    }

    updateProgress(90, "Đang khởi chạy game...");

    FreeJ2ME.main(args).catch(e => {
        e.printStackTrace();
        const loadingEl = document.getElementById('loading');
        if (loadingEl) {
            loadingEl.querySelector('.loading-text').textContent = 'Lỗi :(';
            loadingEl.querySelector('.progress-bar-fill').style.backgroundColor = '#e74c3c';
        }
    });


}

init();