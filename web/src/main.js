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

async function init() {
    document.getElementById("loading").textContent = "Đang tải...";

    display = document.getElementById('display');
    screenCtx = display.getContext('2d');

    setListeners();

    window.libmidi = new LibMidi(createUnlockingAudioContext());
    await window.libmidi.init();
    window.libmidi.midiPlayer.addEventListener('end-of-media', e => {
        window.evtQueue.queueEvent({kind: 'player-eom', player: e.target});
    })
    window.libmedia = new LibMedia();

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
                    // Hide loading screen
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

    document.getElementById("loading").innerHTML = `
        <div class="loading-spinner">
            <div class="loading-icon">🎮</div>
        </div>
        <div class="loading-text">Đang tải thư viện Java...</div>
    `;

    const lib = await cheerpjRunLibrary(cheerpjWebRoot+"/freej2me-web.jar");

    const FreeJ2ME = await lib.org.recompile.freej2me.FreeJ2ME;

    let args;

    if (sp.get('app')) {
        const app = sp.get('app');
        await ensureAppInstalled(lib, app);

        args = ['app', sp.get('app')];
    } else {
        args = ['jar', cheerpjWebRoot+"/jar/" + (sp.get('jar') || "game.jar")];
    }

    FreeJ2ME.main(args).catch(e => {
        e.printStackTrace();
        
        // Show crash message with countdown
        const loadingEl = document.getElementById('loading');
        loadingEl.style.fontSize = '1.2em';
        loadingEl.style.textAlign = 'center';
        loadingEl.style.color = '#ff4444';
        
        let countdown = 5;
        loadingEl.innerHTML = `
            <div style="padding: 20px;">
                <div style="font-size: 3em; margin-bottom: 10px;">💥</div>
                <div style="font-size: 1.5em; font-weight: bold; margin-bottom: 10px;">Game Crashed!</div>
                <div style="font-size: 1em; color: #666; margin-bottom: 20px;">Có lỗi xảy ra khi chạy game</div>
                <div style="font-size: 1em; color: white;">Tự động trở về trang chủ sau <span id="crash-countdown">${countdown}</span>s</div>
                <button id="crash-back-now" style="
                    margin-top: 20px;
                    padding: 10px 30px;
                    font-size: 1em;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border: none;
                    border-radius: 25px;
                    cursor: pointer;
                    font-weight: 600;
                    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
                ">Trở về ngay</button>
            </div>
        `;
        
        // Countdown timer
        const countdownInterval = setInterval(() => {
            countdown--;
            const countdownEl = document.getElementById('crash-countdown');
            if (countdownEl) {
                countdownEl.textContent = countdown;
            }
            
            if (countdown <= 0) {
                clearInterval(countdownInterval);
                window.location.href = './';
            }
        }, 1000);
        
        // Back button
        const backBtn = document.getElementById('crash-back-now');
        if (backBtn) {
            backBtn.onclick = () => {
                clearInterval(countdownInterval);
                window.location.href = './';
            };
        }
    });


}

// Back to home button handler
function setupBackButton() {
    const backButton = document.getElementById('back-to-home');
    if (backButton) {
        backButton.onclick = () => {
            if (confirm('Bạn có muốn thoát game và trở về trang chủ?')) {
                location.href = './';
            }
        };
    }
}

// Game info panel handler
function setupGameInfoPanel() {
    const toggleButton = document.getElementById('game-info-toggle');
    const panel = document.getElementById('game-info-panel');
    
    if (!toggleButton || !panel) return;

    // Toggle panel
    toggleButton.onclick = () => {
        panel.classList.toggle('open');
    };

    // Close panel when clicking outside
    document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !toggleButton.contains(e.target)) {
            panel.classList.remove('open');
        }
    });

    // Load game info from URL params or list.json
    loadGameInfo();
}

// Load game information
async function loadGameInfo() {
    const appId = sp.get('app');
    const jarFile = sp.get('jar');

    try {
        const response = await fetch('games/list.json');
        const games = await response.json();
        
        let gameInfo = null;
        
        if (appId) {
            gameInfo = games.find(g => g.filename.replace('.jar', '') === appId);
        } else if (jarFile) {
            gameInfo = games.find(g => g.filename === jarFile);
        }

        if (gameInfo) {
            updateGameInfo(gameInfo);
        }
    } catch (error) {
        console.log('Could not load game info:', error);
    }
}

// Update game info display
function updateGameInfo(gameInfo) {
    const gameName = document.getElementById('game-name');
    const screenSize = document.getElementById('game-screen-size');
    const phoneType = document.getElementById('game-phone-type');

    if (gameName && gameInfo.name) {
        gameName.textContent = gameInfo.name;
        document.title = gameInfo.name + ' - FreeJ2ME';
    }

    if (screenSize && gameInfo.settings) {
        const width = gameInfo.settings.width || gameInfo.settings.screenWidth || '-';
        const height = gameInfo.settings.height || gameInfo.settings.screenHeight || '-';
        screenSize.textContent = width !== '-' ? `${width}x${height}` : '-';
    }

    if (phoneType && gameInfo.settings && gameInfo.settings.phone) {
        phoneType.textContent = gameInfo.settings.phone;
    }
}

// Initialize UI elements
setupBackButton();
setupGameInfoPanel();

init();