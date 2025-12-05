// --- Serpent Attack: game.js (actualizado) ---
// ============================================
// SISTEMA RESPONSIVE UNIVERSAL - SERPENT ATTACK
// Funciona en TODOS los dispositivos
// ============================================

function setupResponsiveCanvas() {
    const canvas = document.getElementById('gameCanvas');
    const infoBar = document.getElementById('info-bar');
    const gameScreen = document.getElementById('game-screen');
    const dpad = document.getElementById('dpad-pro');
    
    if (!canvas || !gameScreen) return;
    
    // Dimensiones internas del canvas (lógica del juego)
    const INTERNAL_WIDTH = 400;
    const INTERNAL_HEIGHT = 400;
    
    function getViewportDimensions() {
        // Método más confiable para obtener dimensiones reales
        return {
            width: Math.max(
                document.documentElement.clientWidth,
                window.innerWidth || 0
            ),
            height: Math.max(
                document.documentElement.clientHeight,
                window.innerHeight || 0
            )
        };
    }
    
    function isMobileDevice() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    function updateScale() {
        const viewport = getViewportDimensions();
        const isMobile = isMobileDevice();
        const isLandscape = viewport.width > viewport.height;
        
        console.log('=== RESIZE DEBUG ===');
        console.log('Viewport:', viewport.width, 'x', viewport.height);
        console.log('Mobile:', isMobile, '| Landscape:', isLandscape);
        
        let canvasSize;
        
        if (isMobile) {
            if (isLandscape) {
                // HORIZONTAL: Priorizar altura, dejar espacio a la izquierda para D-Pad
                const maxHeight = viewport.height * 0.85; // 85% de la altura
                const maxWidth = (viewport.width - 150) * 0.9; // Espacio para D-Pad
                canvasSize = Math.min(maxHeight, maxWidth, INTERNAL_WIDTH * 1.5);
            } else {
                // VERTICAL: Priorizar ancho, dejar espacio abajo para D-Pad
                const maxWidth = viewport.width * 0.92;
                const maxHeight = (viewport.height - 180) * 0.9; // Espacio para HUD + D-Pad
                canvasSize = Math.min(maxHeight, maxWidth, INTERNAL_WIDTH * 1.5);
            }
        } else {
            // DESKTOP: Tamaño moderado
            const maxSize = Math.min(viewport.width, viewport.height) * 0.7;
            canvasSize = Math.min(maxSize, INTERNAL_WIDTH * 1.5);
        }
        
        // Asegurar tamaño mínimo y que sea múltiplo de 20 (tileSize)
        canvasSize = Math.max(280, Math.floor(canvasSize / 20) * 20);
        
        // Aplicar al canvas
        canvas.style.width = canvasSize + 'px';
        canvas.style.height = canvasSize + 'px';
        
        // Ajustar info-bar
        if (infoBar) {
            infoBar.style.width = canvasSize + 'px';
        }
        
        // Mostrar/ocultar D-Pad según contexto
        if (dpad) {
            if (isMobile && !gameScreen.classList.contains('hidden')) {
                dpad.style.display = 'block';
                
                // Ajustar posición del D-Pad según orientación
                if (isLandscape) {
                    // En horizontal: esquina inferior izquierda
                    dpad.style.bottom = '15px';
                    dpad.style.left = '15px';
                    dpad.style.right = 'auto';
                    dpad.style.transform = 'none';
                } else {
                    // En vertical: centrado abajo
                    dpad.style.bottom = '20px';
                    dpad.style.left = '50%';
                    dpad.style.right = 'auto';
                    dpad.style.transform = 'translateX(-50%)';
                }
            } else {
                dpad.style.display = 'none';
            }
        }
        
        const scale = (canvasSize / INTERNAL_WIDTH * 100).toFixed(0);
        console.log('Canvas:', canvasSize, 'x', canvasSize, `(${scale}%)`);
        console.log('D-Pad visible:', dpad ? dpad.style.display : 'N/A');
        console.log('===================');
    }
    
    // Ejecutar inmediatamente
    updateScale();
    
    // Listeners múltiples para máxima compatibilidad
    window.addEventListener('resize', updateScale);
    window.addEventListener('orientationchange', () => {
        // Esperar a que complete la rotación
        setTimeout(updateScale, 200);
    });
    
    // Para iOS
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', updateScale);
    }
    
    // Actualizar cuando cambie de pantalla
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                setTimeout(updateScale, 50);
            }
        });
    });
    
    observer.observe(gameScreen, { attributes: true });
    
    return updateScale;
}

// ============================================
// MEJORAS ADICIONALES OPCIONALES
// ============================================

// 3. SOPORTE TÁCTIL PARA MÓVILES (OPCIONAL)
function setupTouchControls() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    let touchStartX = 0;
    let touchStartY = 0;
    const minSwipeDistance = 30; // píxeles mínimos para detectar swipe
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: false });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;
        
        // Determinar dirección del swipe
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Movimiento horizontal
            if (Math.abs(deltaX) > minSwipeDistance) {
                const key = deltaX > 0 ? 'ArrowRight' : 'ArrowLeft';
                simulateKeyPress(key);
            }
        } else {
            // Movimiento vertical
            if (Math.abs(deltaY) > minSwipeDistance) {
                const key = deltaY > 0 ? 'ArrowDown' : 'ArrowUp';
                simulateKeyPress(key);
            }
        }
    }, { passive: false });
    
    function simulateKeyPress(key) {
        const event = new KeyboardEvent('keydown', {
            key: key,
            code: key,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    }
}

// Activar controles táctiles
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupTouchControls);
} else {
    setupTouchControls();
}

// 4. DETECTOR DE DISPOSITIVO (OPCIONAL - para ajustes específicos)
const DeviceInfo = {
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    isTablet: /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent),
    isDesktop: function() { return !this.isMobile && !this.isTablet; },
    
    // Obtener información útil
    getInfo: function() {
        return {
            isMobile: this.isMobile,
            isTablet: this.isTablet,
            isDesktop: this.isDesktop(),
            screenWidth: window.innerWidth,
            screenHeight: window.innerHeight,
            orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
        };
    }
};

// Log de información del dispositivo (opcional)
console.log('Dispositivo:', DeviceInfo.getInfo());

// 5. AJUSTES AUTOMÁTICOS SEGÚN DISPOSITIVO
function applyDeviceSpecificAdjustments() {
    const body = document.body;
    
    if (DeviceInfo.isMobile) {
        body.classList.add('mobile-device');
        // Ajustar tamaño de fuente para móviles
        document.documentElement.style.fontSize = '14px';
    } else if (DeviceInfo.isTablet) {
        body.classList.add('tablet-device');
        document.documentElement.style.fontSize = '15px';
    } else {
        body.classList.add('desktop-device');
        document.documentElement.style.fontSize = '16px';
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyDeviceSpecificAdjustments);
} else {
    applyDeviceSpecificAdjustments();
}

// ============================================
// NOTAS DE USO:
// ============================================
// 1. Agregar este código AL INICIO de tu game.js
// 2. NO modificar canvas.width ni canvas.height (mantener 400x400)
// 3. El escalado es puramente visual via CSS
// 4. La lógica del juego (colisiones, posiciones) NO se ve afectada
// 5. Funciona automáticamente en PC, tablets y móviles
// 0) Ajustes globales — declarar antes de usar
const TOTAL_LEVELS_WANTED = (typeof window !== 'undefined' && typeof window.TOTAL_LEVELS_WANTED === 'number') ? window.TOTAL_LEVELS_WANTED : 20;

// --- 1. CONFIGURACIÓN INICIAL ---
// Elementos de las pantallas
const menuScreen = document.getElementById('menu-screen');
const gameScreen = document.getElementById('game-screen');
const helpScreen = document.getElementById('help-screen');
const exitScreen = document.getElementById('exit-screen');

// Elementos Modales
const modalOverlay = document.getElementById('modal-overlay');
const gameOverModal = document.getElementById('game-over-modal');
const levelUpModal = document.getElementById('level-up-modal');
const settingsModal = document.getElementById('settings-modal');
const restartButton = document.getElementById('restart-button');
const nextLevelButton = document.getElementById('next-level-button');

// Botones del Menú
const startButton = document.getElementById('start-button');
const helpButton = document.getElementById('help-button');
const backButton = document.getElementById('back-button');
const exitButton = document.getElementById('exit-button');
const settingsButton = document.getElementById('settings-button');

// Elementos de Texto
const challengeDescription = document.getElementById('challenge-description');
const highScoreDisplay = document.getElementById('high-score-display');
const scoreDisplay = document.getElementById('score-display');
const timerDisplay = document.getElementById('timer-display');
const levelDisplay = document.getElementById('level-display');

// Settings UI
const settingsMuteBtn = document.getElementById('settings-mute-btn');
const settingsMasterSlider = document.getElementById('settings-master-volume');
const settingsMusicSlider = document.getElementById('settings-music-volume');
const settingsSfxSlider = document.getElementById('settings-sfx-volume');
const settingsSaveBtn = document.getElementById('settings-save-btn');
const settingsCloseBtn = document.getElementById('settings-close-btn');

// Elementos del Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuración del juego
const tileSize = 20;
const gridWidth = Math.floor(canvas.width / tileSize);
const gridHeight = Math.floor(canvas.height / tileSize);

// --- MAPAS INICIALES ---
const level1Map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,1,1,0,1,1,1,1,0,1,0,1,1,1,1,0,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1,0,1],
    [1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,1,0,1,0,1],
    [1,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1],
    [1,0,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1],
    [1,0,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1,1,1,1,1],
    [1,0,1,1,0,1,1,1,1,1,1,1,0,1,0,1,0,0,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const level2Map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,1,1,0,1,1,1,1,0,1,0,1,1,1,1,0,1,1,0,1],
    [1,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,1,0,1],
    [1,0,1,0,1,0,1,1,1,1,1,1,1,0,1,1,0,1,0,1],
    [1,0,1,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,0,1,1,1,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1],
    [1,0,0,0,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1],
    [1,1,1,1,0,1,0,1,0,1,0,1,0,1,1,1,1,1,0,1],
    [1,0,0,1,0,1,0,1,0,1,0,1,0,1,0,0,0,0,0,1],
    [1,0,0,1,0,0,0,0,0,1,0,0,0,1,0,1,1,1,1,1],
    [1,0,1,1,0,1,1,1,1,1,1,1,0,1,0,1,0,0,0,1],
    [1,0,1,0,0,0,0,0,0,0,0,0,0,1,0,1,0,1,0,1],
    [1,0,1,0,1,1,1,1,1,1,1,1,1,1,0,1,0,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

// --- CONFIGURACIÓN DE NIVELES Dinámica ---
let levels = []; // se llenará con generateAndSetupLevels
let currentLabyrinth = null;

// --- GESTOR DE AUDIO --- (AudioManager ligero)
class AudioManager {
    constructor() {
        this.audios = {};
        this.masterVolume = parseFloat(localStorage.getItem('sa_masterVolume')) || 1.0;
        this.musicVolume = parseFloat(localStorage.getItem('sa_musicVolume')) || 0.3;
        this.sfxVolume = parseFloat(localStorage.getItem('sa_sfxVolume')) || 1.0;
        this.muted = localStorage.getItem('sa_muted') === 'true' || false;
        this.currentMusic = null;
    }
    load(name, src, opts = {}) {
        const a = new Audio();
        a.preload = 'auto';
        a.src = src;
        a.loop = !!opts.loop;
        a.volume = (opts.isMusic ? this.musicVolume : this.sfxVolume) * this.masterVolume;
        a.muted = this.muted;
        this.audios[name] = a;
        return a;
    }
    get(name) { return this.audios[name]; }
    async playMusic(name, fadeTime = 300) {
        const next = this.audios[name];
        if (!next) return;
        if (this.currentMusic === name) {
            try { await next.play(); } catch(e) {}
            return;
        }
        if (this.currentMusic && this.audios[this.currentMusic]) {
            await this.fadeOut(this.audios[this.currentMusic], fadeTime);
            try { this.audios[this.currentMusic].pause(); } catch(e){}
        }
        this.currentMusic = name;
        next.loop = true;
        next.currentTime = 0;
        next.volume = this.musicVolume * this.masterVolume;
        next.muted = this.muted;
        try { await next.play(); } catch(e){ console.log('Music play prevented', e); }
        await this.fadeIn(next, fadeTime);
    }
    playSfx(name) {
        const sfx = this.audios[name];
        if (!sfx) return;
        try {
            const clone = sfx.cloneNode(true);
            clone.volume = this.sfxVolume * this.masterVolume;
            clone.muted = this.muted;
            clone.play().catch(()=>{});
        } catch(e) {
            sfx.currentTime = 0;
            sfx.volume = this.sfxVolume * this.masterVolume;
            sfx.muted = this.muted;
            sfx.play().catch(()=>{});
        }
    }
    pause(name){ const a=this.audios[name]; if(a) try{a.pause()}catch(e){} }
    seek(name, t){ const a=this.audios[name]; if(a) try{a.currentTime=t}catch(e){} }
    setMasterVolume(v){ this.masterVolume=Math.max(0,Math.min(1,v)); localStorage.setItem('sa_masterVolume',this.masterVolume); this.applyVolumes(); }
    setMusicVolume(v){ this.musicVolume=Math.max(0,Math.min(1,v)); localStorage.setItem('sa_musicVolume',this.musicVolume); this.applyVolumes(); }
    setSfxVolume(v){ this.sfxVolume=Math.max(0,Math.min(1,v)); localStorage.setItem('sa_sfxVolume',this.sfxVolume); this.applyVolumes(); }
    setMuted(m){ this.muted=!!m; localStorage.setItem('sa_muted',this.muted); this.applyVolumes(); }
    applyVolumes(){
        for(const name in this.audios){
            const a = this.audios[name];
            const isMusic = (name === 'bgMusic');
            try { a.volume = (isMusic ? this.musicVolume : this.sfxVolume) * this.masterVolume; a.muted = this.muted; } catch(e){}
        }
    }
    fadeOut(audioEl, ms=300){
        return new Promise(resolve=>{
            if(!audioEl) return resolve();
            try{
                const start=audioEl.volume; const steps=12; let i=0;
                const iv=setInterval(()=>{ i++; audioEl.volume = Math.max(0, start*(1 - i/steps)); if(i>=steps){ clearInterval(iv); audioEl.volume=0; resolve(); } }, Math.max(10, Math.floor(ms/steps)));
            }catch(e){ resolve(); }
        });
    }
    fadeIn(audioEl, ms=300){
        return new Promise(resolve=>{
            if(!audioEl) return resolve();
            try{
                const target = (audioEl === this.audios['bgMusic']) ? this.musicVolume * this.masterVolume : audioEl.volume;
                const steps = 12; let i=0; audioEl.volume = 0;
                const iv = setInterval(()=>{ i++; audioEl.volume = Math.min(target, target*(i/steps)); if(i>=steps){ clearInterval(iv); audioEl.volume = target; resolve(); } }, Math.max(10, Math.floor(ms/steps)));
            }catch(e){ resolve(); }
        });
    }
}

const audioManager = new AudioManager();
audioManager.load('bgMusic', 'bg_music.mp3', { isMusic: true, loop: true });
audioManager.load('eat', 'eat.mp3', { isMusic: false });
audioManager.load('click', 'click.mp3', { isMusic: false });
audioManager.load('levelup', 'levelup.mp3', { isMusic: false });
audioManager.load('gameover', 'gameover.mp3', { isMusic: false });

function playClickSound(){ try{ audioManager.playSfx('click'); }catch(e){ console.log('click failed', e); } }

// --- CARGA DE IMÁGENES con manejo de errores y timeout ---
const snakeImage = new Image();
const mouseImage = new Image();
const effectImage = new Image();

const wallImages = [];
for (let i = 1; i <= TOTAL_LEVELS_WANTED; i++) {
    const img = new Image();
    const filename = (i === 1) ? 'wall.png' : `wall${i}.png`;
    img._srcFilename = filename;
    img.src = filename;
    wallImages.push(img);
}
snakeImage._srcFilename = 'snake.png';
mouseImage._srcFilename = 'mouse.png';
effectImage._srcFilename = 'effect.png';
snakeImage.src = 'snake.png';
mouseImage.src = 'mouse.png';
effectImage.src = 'effect.png';

const PLACEHOLDER_IMG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';

let imagesLoaded = 0;
const totalImagesToLoad = 3 + wallImages.length;
let imagesFailed = [];
let imagesReady = false;

function markImageLoaded(name){
    imagesLoaded++;
    // console.log(`[Images] Cargada: ${name} (${imagesLoaded}/${totalImagesToLoad})`);
    checkIfAllImagesReady();
}
function markImageError(img, name){
    imagesFailed.push(name);
    console.error(`[Images] Error cargando: ${name} — usando placeholder`);
    try{ img.src = PLACEHOLDER_IMG; }catch(e){}
    imagesLoaded++;
    checkIfAllImagesReady();
}
function checkIfAllImagesReady(){
    if(imagesLoaded >= totalImagesToLoad && !imagesReady){
        imagesReady = true;
        enableGameStartAfterImages();
    }
}
function enableGameStartAfterImages(){
    startButton.disabled = false;
    helpButton.disabled = false;
    exitButton.disabled = false;
    if (typeof settingsButton !== 'undefined' && settingsButton) settingsButton.disabled = false;
    startButton.innerText = "Empezar a Jugar";
    updateChallengeText();
    loadHighScore();
    if (levels.length === 0) generateAndSetupLevels(TOTAL_LEVELS_WANTED);
    initSettingsUI();
    audioManager.applyVolumes();
    if (imagesFailed.length > 0) {
        console.warn('[Images] Algunos recursos fallaron al cargar:', imagesFailed);
    }
}
function attachHandlers(img){
    img.onload = () => markImageLoaded(img._srcFilename || img.src);
    img.onerror = () => markImageError(img, img._srcFilename || img.src);
    // si ya está en caché
    setTimeout(() => {
        if (img.complete) {
            if (img.naturalWidth && img.naturalWidth > 0) {
                // posible que onload ya haya contado; solo en caso de no contar, sumar:
                // no hacemos nada porque onload normalmente dispara
            } else {
                // fallo previo
                markImageError(img, img._srcFilename || img.src);
            }
        }
    }, 0);
}
attachHandlers(snakeImage);
attachHandlers(mouseImage);
attachHandlers(effectImage);
for (const wi of wallImages) attachHandlers(wi);

// safety timeout: no bloquear más de 5s
setTimeout(()=>{
    if (!imagesReady) {
        console.warn('[Images] Timeout de carga alcanzado. Forzando disponibilidad.');
        const allImgs = [snakeImage, mouseImage, effectImage, ...wallImages];
        for (const im of allImgs) {
            if (!im.complete || (im.naturalWidth === 0 && im.src !== PLACEHOLDER_IMG)) {
                try { im.src = PLACEHOLDER_IMG; } catch(e){}
            }
        }
        if (imagesLoaded < totalImagesToLoad) imagesLoaded = totalImagesToLoad;
        checkIfAllImagesReady();
    }
}, 5000);

// --- VARIABLES DEL JUEGO ---
let score = 0;
let snake = { x: 1, y: 1 };
let mouse = { x: 18, y: 18 };
let currentLevel = 1;
let scoreToWin = 5;
let highScore = 0;
const startingTime = 20;
const timeAddedPerMouse = 8;
const bonusTimePerLevel = 20;
let timerInterval;
let timeLeft = 0;
let currentEffect = null;
let mouseMoveCounter = 0;
const mouseMoveSpeed = 3;

// --- LÓGICA DEL MENÚ Y ESTADOS DEL JUEGO ---
startButton.addEventListener('click', () => { playClickSound(); startGame(); });
helpButton.addEventListener('click', () => { playClickSound(); showHelp(); });
backButton.addEventListener('click', () => { playClickSound(); hideHelp(); });
exitButton.addEventListener('click', () => { playClickSound(); exitGame(); });
settingsButton.addEventListener('click', () => {
    playClickSound();
    initSettingsUI();
    modalOverlay.classList.remove('hidden');
    settingsModal.classList.remove('hidden');
});

restartButton.addEventListener('click', () => {
    playClickSound();
    modalOverlay.classList.add('hidden');
    gameOverModal.classList.add('hidden');
    gameScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
    updateChallengeText();
});

nextLevelButton.addEventListener('click', () => {
    playClickSound();
    modalOverlay.classList.add('hidden');
    levelUpModal.classList.add('hidden');

    currentLevel++;
    score = 0;
    scoreToWin += 2;
    timeLeft += bonusTimePerLevel;

    let levelIndex = (currentLevel - 1) % levels.length;
    currentLabyrinth = levels[levelIndex].map;
    snake = { x: levels[levelIndex].startX, y: levels[levelIndex].startY };

    levelDisplay.innerText = `Nivel: ${currentLevel}`;
    scoreDisplay.innerText = `Puntos: ${score}`;
    timerDisplay.innerText = `Tiempo: ${timeLeft}`;

    moveMouse();
    draw();

    audioManager.playMusic('bgMusic').catch(e => console.log(e));

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
});

function startGame() {
    menuScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');

    audioManager.seek('bgMusic', 0);
    audioManager.playMusic('bgMusic').catch(error => console.log("Autoplay prevented:", error));

    resetGame();

    timeLeft = startingTime;
    timerDisplay.innerText = `Tiempo: ${timeLeft}`;
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
}

function showHelp() {
    menuScreen.classList.add('hidden');
    helpScreen.classList.remove('hidden');
}

function hideHelp() {
    helpScreen.classList.add('hidden');
    menuScreen.classList.remove('hidden');
}

function exitGame() {
    menuScreen.classList.add('hidden');
    gameScreen.classList.add('hidden');
    helpScreen.classList.add('hidden');
    exitScreen.classList.remove('hidden');

    audioManager.pause('bgMusic');
    audioManager.seek('bgMusic', 0);

    if (timerInterval) {
        clearInterval(timerInterval);
    }
}

function updateTimer() {
    timeLeft--;
    timerDisplay.innerText = `Tiempo: ${timeLeft}`;

    if (timeLeft <= 0) {
        audioManager.pause('bgMusic');
        audioManager.playSfx('gameover');
        endGame("¡Se acabó el tiempo!");
    }
}

function endGame(message) {
    clearInterval(timerInterval);
    const isNewRecord = saveHighScore();

    audioManager.pause('bgMusic');

    document.getElementById('end-game-message').innerText = message;
    document.getElementById('end-game-stats').innerText = `Alcanzaste el Nivel ${currentLevel}.`;
    if (isNewRecord) {
        document.getElementById('new-record-message').classList.remove('hidden');
    } else {
        document.getElementById('new-record-message').classList.add('hidden');
    }

    modalOverlay.classList.remove('hidden');
    gameOverModal.classList.remove('hidden');
}

function levelUp() {
    clearInterval(timerInterval);

    audioManager.playSfx('levelup');

    document.getElementById('level-up-title').innerText = `¡Nivel ${currentLevel} Superado!`;
    document.getElementById('level-up-bonus').innerText = `¡Recibes +${bonusTimePerLevel} segundos de bono!`;
    document.getElementById('level-up-next').innerText = `Prepárate para el Nivel ${currentLevel + 1}...`;
    modalOverlay.classList.remove('hidden');
    levelUpModal.classList.remove('hidden');
}

// --- 3. LÓGICA DEL JUEGO (MOVIMIENTO Y COLISIÓN) ---
document.addEventListener('keydown', (e) => {
    if (!gameScreen.classList.contains('hidden') && modalOverlay.classList.contains('hidden')) {
        let nextX = snake.x;
        let nextY = snake.y;

        switch (e.key) {
            case 'ArrowUp': nextY--; break;
            case 'ArrowDown': nextY++; break;
            case 'ArrowLeft': nextX--; break;
            case 'ArrowRight': nextX++; break;
            default: return;
        }

        // límites por seguridad
        if (nextX < 0 || nextX >= gridWidth || nextY < 0 || nextY >= gridHeight) return;

        // Colisión con Muros
        if (currentLabyrinth[nextY][nextX] === 1) {
            audioManager.playSfx('gameover');
            endGame("¡Perdiste! Chocaste contra el muro.");
            return;
        }

        snake.x = nextX;
        snake.y = nextY;

        // Colisión con Ratón
        if (snake.x === mouse.x && snake.y === mouse.y) {
            audioManager.playSfx('eat');

            score++;
            timeLeft += timeAddedPerMouse;
            timerDisplay.innerText = `Tiempo: ${timeLeft}`;
            currentEffect = { x: mouse.x, y: mouse.y };

            if (score >= scoreToWin) {
                levelUp();
                return;
            } else {
                scoreDisplay.innerText = `Puntos: ${score}`;
                moveMouse();
            }
        } else {
            mouseMoveCounter++;
            if (mouseMoveCounter >= mouseMoveSpeed) {
                moveMouseAI();
                mouseMoveCounter = 0;
            }
        }

        draw();
    }
});

// --- 4. FUNCIONES DE DIBUJO Y AYUDA ---
function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawLabyrinth();

    if (snake.x >= 0 && snakeImage) ctx.drawImage(snakeImage, snake.x * tileSize, snake.y * tileSize, tileSize, tileSize);
    if (mouse.x >= 0 && mouseImage) ctx.drawImage(mouseImage, mouse.x * tileSize, mouse.y * tileSize, tileSize, tileSize);

    if (currentEffect && effectImage) {
        ctx.drawImage(effectImage, currentEffect.x * tileSize, currentEffect.y * tileSize, tileSize, tileSize);
        currentEffect = null;
    }
}

function drawLabyrinth() {
    const wallIndex = (currentLevel - 1) % wallImages.length;
    const currentWallImage = wallImages[wallIndex];

    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (currentLabyrinth[y][x] === 1) {
                try {
                    ctx.drawImage(currentWallImage, x * tileSize, y * tileSize, tileSize, tileSize);
                } catch (e) {
                    // si la imagen es placeholder o hay error, dibujar rect pequeño
                    ctx.fillStyle = '#444';
                    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                }
            }
        }
    }
}

// --- 5. LÓGICA AUX / MAPAS / RESET ---
function resetGame() {
    score = 0;
    currentLevel = 1;
    scoreToWin = 5;
    mouseMoveCounter = 0;

    // cargar mapas (si no se han generado aún)
    if (levels.length === 0) {
        generateAndSetupLevels(TOTAL_LEVELS_WANTED);
    }

    currentLabyrinth = levels[0].map;
    snake = { x: levels[0].startX, y: levels[0].startY };

    scoreDisplay.innerText = `Puntos: ${score}`;
    levelDisplay.innerText = `Nivel: ${currentLevel}`;

    if (timerInterval) {
        clearInterval(timerInterval);
    }

    moveMouse();
    draw();
}

function moveMouse() {
    let newX, newY;
    let attempts = 0;
    do {
        newX = Math.floor(Math.random() * gridWidth);
        newY = Math.floor(Math.random() * gridHeight);
        attempts++;
        if (attempts > 500) break;
    } while (currentLabyrinth[newY][newX] === 1 || (newX === snake.x && newY === snake.y));

    mouse.x = newX;
    mouse.y = newY;
}

function moveMouseAI() {
    const dx = snake.x - mouse.x;
    const dy = snake.y - mouse.y;
    const distance = Math.abs(dx) + Math.abs(dy);

    if (distance > 5) {
        return;
    }

    let bestMove = { x: 0, y: 0 };
    let bestMoveDistance = distance;

    const moves = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 }
    ];

    for (const move of moves) {
        const nextX = mouse.x + move.x;
        const nextY = mouse.y + move.y;

        if (nextY >= 0 && nextY < gridHeight && nextX >= 0 && nextX < gridWidth) {
             if (currentLabyrinth[nextY][nextX] === 0) {
                const newDx = snake.x - nextX;
                const newDy = snake.y - nextY;
                const newDistance = Math.abs(newDx) + Math.abs(newDy);

                if (newDistance > bestMoveDistance) {
                    bestMoveDistance = newDistance;
                    bestMove = move;
                }
            }
        }
    }

    mouse.x += bestMove.x;
    mouse.y += bestMove.y;
}

// --- 6. PERSISTENCIA / GENERACIÓN DE MAPAS ---
function loadHighScore() {
    const savedScore = localStorage.getItem('serpentAttackHighScore');
    if (savedScore) {
        highScore = parseInt(savedScore);
    }
    highScoreDisplay.innerText = `Tu Récord: Nivel ${highScore}`;
}

function saveHighScore() {
    if (currentLevel > highScore) {
        highScore = currentLevel;
        localStorage.setItem('serpentAttackHighScore', highScore);
        highScoreDisplay.innerText = `Tu Récord: Nivel ${highScore}`;
        return true;
    }
    return false;
}

function generateAndSetupLevels(count) {
    levels = [];
    levels.push({ map: cloneMap(level1Map), startX: 1, startY: 1 });
    if (count > 1) levels.push({ map: cloneMap(level2Map), startX: 1, startY: 1 });

    for (let i = levels.length; i < count; i++) {
        const maze = generateMaze(gridWidth, gridHeight);
        if (maze[1] && maze[1][1] === 1) maze[1][1] = 0;
        levels.push({ map: maze, startX: 1, startY: 1 });
    }
}

function cloneMap(m) {
    return m.map(row => row.slice());
}

function generateMaze(w, h) {
    const grid = [];
    for (let y = 0; y < h; y++) {
        grid[y] = [];
        for (let x = 0; x < w; x++) {
            grid[y][x] = 1;
        }
    }
    const startX = 1, startY = 1;
    grid[startY][startX] = 0;
    const stack = [{ x: startX, y: startY }];
    const neighbors = (cx, cy) => {
        const n = [];
        const deltas = [{ x: 0, y: -2 }, { x: 0, y: 2 }, { x: -2, y: 0 }, { x: 2, y: 0 }];
        for (const d of deltas) {
            const nx = cx + d.x, ny = cy + d.y;
            if (ny > 0 && ny < h - 1 && nx > 0 && nx < w - 1) {
                if (grid[ny][nx] === 1) n.push({ x: nx, y: ny, between: { x: cx + d.x/2, y: cy + d.y/2 } });
            }
        }
        return n;
    };

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const n = neighbors(current.x, current.y);
        if (n.length === 0) {
            stack.pop();
        } else {
            const choice = n[Math.floor(Math.random() * n.length)];
            grid[choice.between.y][choice.between.x] = 0;
            grid[choice.y][choice.x] = 0;
            stack.push({ x: choice.x, y: choice.y });
        }
    }

    for (let x = 0; x < w; x++) { grid[0][x] = 1; grid[h-1][x] = 1; }
    for (let y = 0; y < h; y++) { grid[y][0] = 1; grid[y][w-1] = 1; }

    return grid;
}

// --- 7. SETTINGS UI (con persistencia) ---
function initSettingsUI() {
    settingsMasterSlider.value = Math.round((audioManager.masterVolume || 1) * 100);
    settingsMusicSlider.value = Math.round((audioManager.musicVolume || 0.3) * 100);
    settingsSfxSlider.value = Math.round((audioManager.sfxVolume || 1) * 100);
    settingsMuteBtn.innerText = audioManager.muted ? 'Activar sonido' : 'Silenciar';
    settingsMuteBtn.setAttribute('aria-pressed', audioManager.muted ? 'true' : 'false');
}

settingsMasterSlider.addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10) / 100;
    audioManager.setMasterVolume(v);
});
settingsMusicSlider.addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10) / 100;
    audioManager.setMusicVolume(v);
});
settingsSfxSlider.addEventListener('input', (e) => {
    const v = parseInt(e.target.value, 10) / 100;
    audioManager.setSfxVolume(v);
});
settingsMuteBtn.addEventListener('click', () => {
    audioManager.setMuted(!audioManager.muted);
    settingsMuteBtn.innerText = audioManager.muted ? 'Activar sonido' : 'Silenciar';
    settingsMuteBtn.setAttribute('aria-pressed', audioManager.muted ? 'true' : 'false');
});
settingsSaveBtn.addEventListener('click', () => {
    playClickSound();
    modalOverlay.classList.add('hidden');
    settingsModal.classList.add('hidden');
});
settingsCloseBtn.addEventListener('click', () => {
    playClickSound();
    modalOverlay.classList.add('hidden');
    settingsModal.classList.add('hidden');
});

// Atajo M para mute/unmute
document.addEventListener('keydown', (ev) => {
    if (ev.key.toLowerCase() === 'm') {
        audioManager.setMuted(!audioManager.muted);
        settingsMuteBtn.innerText = audioManager.muted ? 'Activar sonido' : 'Silenciar';
        settingsMuteBtn.setAttribute('aria-pressed', audioManager.muted ? 'true' : 'false');
    }
});

// --- 8. INICIAR/CARGA IMAGENES final ---
// (Los handlers ya habilitan el botón cuando todo está procesado)

// Asegúrate de llamar initSettingsUI si quieres que al cargar la página los controles muestren valores guardados.
// initSettingsUI(); // Llamado automáticamente cuando imagesReady se logra.

/* Fin de game.js */


/* =================================================
      D-PAD NES REAL – ZONAS TÁCTILES INVISIBLES
   ================================================= */
(function () {

    const dpad = document.getElementById("dpad-nes");
    if (!dpad) return;

    let isTouchingDpad = false;

    const zones = dpad.querySelectorAll(".touch-zone");

    function dirToKey(dir) {
        return {
            up: "ArrowUp",
            down: "ArrowDown",
            left: "ArrowLeft",
            right: "ArrowRight"
        }[dir];
    }

    function fireKey(dir) {
        const key = dirToKey(dir);
        if (!key) return;

        document.dispatchEvent(new KeyboardEvent("keydown", {
            key,
            bubbles: true
        }));
    }

    function press(e) {
        e.preventDefault();
        const dir = e.currentTarget.dataset.dir;
        isTouchingDpad = true;
        fireKey(dir);
    }

    function release(e) {
        e.preventDefault();
        setTimeout(() => { isTouchingDpad = false; }, 80);
    }

    zones.forEach(z => {
        z.addEventListener("touchstart", press, { passive: false });
        z.addEventListener("touchend", release, { passive: false });
    });

    /* BLOQUEA SWIPE SI SE TOCA EL D-PAD */
    const canvas = document.getElementById("gameCanvas");

    ["touchstart", "touchmove", "touchend"].forEach(ev => {
        canvas.addEventListener(ev, e => {
            if (isTouchingDpad) e.stopImmediatePropagation();
        }, true);
    });

})();
/* ==== CONTROL TÁCTIL PROFESIONAL ==== */
(function () {
    const pad = document.getElementById("dpad-pro");
    if (!pad) return;

    const btns = pad.querySelectorAll(".btn");
    let touching = false;

    function dirToKey(d) {
        return { up: "ArrowUp", down: "ArrowDown", left: "ArrowLeft", right: "ArrowRight" }[d];
    }

    function fire(dir) {
        let k = dirToKey(dir);
        document.dispatchEvent(new KeyboardEvent("keydown", { key: k, bubbles: true }));
    }

    btns.forEach(btn => {
        btn.addEventListener("touchstart", e => {
            e.preventDefault();
            touching = true;
            fire(btn.dataset.dir);
        }, { passive: false });

        btn.addEventListener("touchend", () => touching = false);
        btn.addEventListener("touchcancel", () => touching = false);
    });

    // Bloquea swipe cuando se toca el D-Pad
    const canvas = document.getElementById("gameCanvas");

    ["touchstart","touchmove","touchend"].forEach(ev => {
        canvas.addEventListener(ev, e => {
            if (touching) e.stopImmediatePropagation();
        }, true);
    });
})();

/* FIX DEL ERROR updateChallengeText */
function updateChallengeText() {
    // Puedes poner algo aquí si algún día lo necesitas.
}

/* ==== MOSTRAR / OCULTAR D-PAD SEGÚN LA PANTALLA ==== */

function actualizarDpad() {
    const dpad = document.getElementById("dpad-pro");
    const game = document.getElementById("game-screen");

    if (!dpad || !game) return;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (!game.classList.contains("hidden") && isMobile) {
        dpad.style.display = "block";
    } else {
        dpad.style.display = "none";
    }
}

function actualizarDpad() {
    const dpad = document.getElementById("dpad-pro");
    const game = document.getElementById("game-screen");

    if (!dpad || !game) return;

    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (!game.classList.contains("hidden") && isMobile) {
        dpad.style.display = "block";
    } else {
        dpad.style.display = "none";
    }
}

document.addEventListener("DOMContentLoaded", actualizarDpad);
document.addEventListener("click", actualizarDpad);
document.addEventListener("touchstart", actualizarDpad);
window.addEventListener("orientationchange", actualizarDpad);



