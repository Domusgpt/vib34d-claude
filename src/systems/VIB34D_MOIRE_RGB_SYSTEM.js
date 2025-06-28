
/**
 * @file VIB34D_MOIRE_RGB_SYSTEM.js
 * @description Implements an advanced multi-layer grid interference system with RGB channel shifting for reactive visual effects.
 */

/**
 * @class VIB34DMoireRGBEngine
 * @description Manages Moiré RGB interference effects, including reactive borders, card effects, and enhanced lattice visualizations.
 */
class VIB34DMoireRGBEngine {
    /**
     * @constructor
     */
    constructor() {
        /** @type {boolean} */
        this.isInitialized = false;
        /** @type {Map<string, object>} */
        this.moireInstances = new Map();
        /** @type {Set<string>} */
        this.activeEffects = new Set();
        
        /** @type {object} */
        this.config = {
            baseGridDensity: 12.0,
            offsetGridDensity: 11.7,
            tertiaryGridDensity: 12.3,
            redOffset: { x: 0.0, y: 0.0 },
            greenOffset: { x: 0.002, y: 0.001 },
            blueOffset: { x: -0.001, y: 0.002 },
            offsetSpeed: 0.5,
            rotationSpeed: 0.2,
            pulseSpeed: 1.0,
            scrollMultiplier: 2.0,
            clickMultiplier: 1.5,
            mouseMultiplier: 1.0,
            interferenceIntensity: 0.8,
            colorSeparation: 0.3,
            borderThickness: 2.0,
            cardBorderIntensity: 1.2,
            cardHoverMultiplier: 1.8,
            cardFocusGlow: 0.5
        };
        
        /** @type {object} */
        this.interactionData = {
            scroll: 0.0,
            click: 0.0,
            mouse: { x: 0.5, y: 0.5 },
            energy: 0.0
        };
        
        console.log('🌈 VIB34D Moiré RGB Engine initialized');
    }
    
    /**
     * @method initialize
     * @description Initializes the Moiré RGB system, setting up shaders, card borders, and interaction tracking.
     */
    initialize() {
        this.setupMoireShaders();
        this.setupCardBorders();
        this.setupInteractionTracking();
        this.setupReactiveElements();
        
        this.isInitialized = true;
        console.log('🌈 Moiré RGB system fully initialized');
    }
    
    /**
     * @method setupMoireShaders
     * @description Sets up WebGL shaders for Moiré effects.
     */
    setupMoireShaders() {
        this.moireFragmentShader = `
            precision mediump float;
            
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform float u_gridDensity;
            uniform float u_offsetDensity;
            uniform float u_tertiaryDensity;
            uniform vec2 u_redOffset;
            uniform vec2 u_greenOffset;
            uniform vec2 u_blueOffset;
            uniform float u_interferenceIntensity;
            uniform float u_colorSeparation;
            uniform float u_interactionEnergy;
            
            float moireGrid(vec2 uv, float density, vec2 offset, float phase) {
                vec2 grid = fract((uv + offset) * density + phase);
                vec2 edges = abs(grid - 0.5);
                float lineWidth = 0.02 + u_interactionEnergy * 0.01;
                return 1.0 - smoothstep(0.0, lineWidth, min(edges.x, edges.y));
            }
            
            vec3 calculateMoireRGB(vec2 uv) {
                float time = u_time * 0.001;
                float basePhase = time * 0.5;
                float baseGrid = moireGrid(uv, u_gridDensity, vec2(0.0), basePhase);
                float offsetPhase = time * 0.7 + u_interactionEnergy * 2.0;
                float offsetGrid = moireGrid(uv, u_offsetDensity, vec2(0.001, -0.0005), offsetPhase);
                float tertiaryPhase = time * 0.3 - u_interactionEnergy * 1.5;
                float tertiaryGrid = moireGrid(uv, u_tertiaryDensity, vec2(-0.0008, 0.0012), tertiaryPhase);
                
                float redChannel = baseGrid * (1.0 + sin(offsetPhase + uv.x * 10.0) * 0.3);
                float greenChannel = offsetGrid * (1.0 + sin(offsetPhase + uv.y * 10.0 + 2.09) * 0.3);
                float blueChannel = tertiaryGrid * (1.0 + sin(offsetPhase + length(uv) * 8.0 + 4.18) * 0.3);
                
                vec2 redUV = uv + u_redOffset * u_colorSeparation;
                vec2 greenUV = uv + u_greenOffset * u_colorSeparation;
                vec2 blueUV = uv + u_blueOffset * u_colorSeparation;
                
                redChannel *= moireGrid(redUV, u_gridDensity * 1.1, u_redOffset, basePhase);
                greenChannel *= moireGrid(greenUV, u_offsetDensity * 0.9, u_greenOffset, offsetPhase);
                blueChannel *= moireGrid(blueUV, u_tertiaryDensity * 1.05, u_blueOffset, tertiaryPhase);
                
                float interference = sin(baseGrid * 6.28) * cos(offsetGrid * 6.28) * sin(tertiaryGrid * 6.28);
                interference *= u_interferenceIntensity;
                
                vec2 mouseInfluence = u_mouse - uv;
                float mouseDist = length(mouseInfluence);
                float mouseEffect = exp(-mouseDist * 3.0) * u_interactionEnergy;
                
                return vec3(
                    redChannel + interference * 0.5 + mouseEffect,
                    greenChannel + interference * 0.3 + mouseEffect * 0.8,
                    blueChannel + interference * 0.7 + mouseEffect * 0.6
                );
            }
            
            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                vec3 moireColor = calculateMoireRGB(uv);
                moireColor = pow(moireColor, vec3(0.8));
                moireColor *= (1.0 + u_interactionEnergy * 0.5);
                gl_FragColor = vec4(moireColor, 0.7 + u_interactionEnergy * 0.3);
            }
        `;
    }
    
    /**
     * @method setupCardBorders
     * @description Sets up reactive card borders with Moiré effects for elements with 'blog-card' class.
     */
    setupCardBorders() {
        const cards = document.querySelectorAll('.blog-card, .content-card, .card');
        
        cards.forEach((card, index) => {
            const moireBorder = document.createElement('div');
            moireBorder.className = 'moire-border';
            moireBorder.id = `moire-border-${index}`;
            
            moireBorder.style.cssText = `
                position: absolute;
                top: -${this.config.borderThickness}px;
                left: -${this.config.borderThickness}px;
                right: -${this.config.borderThickness}px;
                bottom: -${this.config.borderThickness}px;
                pointer-events: none;
                z-index: 1;
                opacity: 0;
                transition: opacity 0.3s ease;
                background: linear-gradient(45deg, 
                    rgba(255, 0, 255, 0.3) 0%,
                    rgba(0, 255, 255, 0.3) 25%,
                    rgba(255, 255, 0, 0.3) 50%,
                    rgba(255, 0, 255, 0.3) 75%,
                    rgba(0, 255, 255, 0.3) 100%);
                background-size: 200% 200%;
                animation: moireShift 3s linear infinite;
                border-radius: inherit;
                filter: blur(1px) contrast(1.2);
            `;
            
            if (getComputedStyle(card).position === 'static') {
                card.style.position = 'relative';
            }
            
            card.appendChild(moireBorder);
            
            this.setupCardInteractions(card, moireBorder, index);
            
            this.moireInstances.set(`card-${index}`, {
                element: moireBorder,
                card: card,
                intensity: 0.0,
                targetIntensity: 0.0,
                isHovered: false,
                isFocused: false
            });
        });
        
        this.addMoireCSS();
    }
    
    /**
     * @method setupCardInteractions
     * @description Sets up interaction handlers for individual cards to trigger Moiré effects.
     * @param {HTMLElement} card - The card element.
     * @param {HTMLElement} moireBorder - The Moiré border element associated with the card.
     * @param {number} index - The index of the card.
     */
    setupCardInteractions(card, moireBorder, index) {
        card.addEventListener('mouseenter', () => {
            const instance = this.moireInstances.get(`card-${index}`);
            if (instance) {
                instance.isHovered = true;
                instance.targetIntensity = this.config.cardBorderIntensity;
                moireBorder.style.opacity = '1';
                moireBorder.style.animationDuration = '1.5s';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const instance = this.moireInstances.get(`card-${index}`);
            if (instance) {
                instance.isHovered = false;
                instance.targetIntensity = instance.isFocused ? 0.5 : 0.0;
                if (!instance.isFocused) {
                    moireBorder.style.opacity = '0';
                }
                moireBorder.style.animationDuration = '3s';
            }
        });
        
        card.addEventListener('focus', () => {
            const instance = this.moireInstances.get(`card-${index}`);
            if (instance) {
                instance.isFocused = true;
                instance.targetIntensity = this.config.cardFocusGlow;
                moireBorder.style.opacity = '0.8';
            }
        });
        
        card.addEventListener('blur', () => {
            const instance = this.moireInstances.get(`card-${index}`);
            if (instance) {
                instance.isFocused = false;
                instance.targetIntensity = instance.isHovered ? this.config.cardBorderIntensity : 0.0;
                if (!instance.isHovered) {
                    moireBorder.style.opacity = '0';
                }
            }
        });
        
        card.addEventListener('click', () => {
            this.triggerMoireFlash(moireBorder);
        });
    }
    
    /**
     * @method addMoireCSS
     * @description Injects CSS animations for Moiré effects into the document head.
     */
    addMoireCSS() {
        if (document.getElementById('moire-rgb-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'moire-rgb-styles';
        style.textContent = `
            @keyframes moireShift {
                0% {
                    background-position: 0% 0%;
                    filter: blur(1px) contrast(1.2) hue-rotate(0deg);
                }
                25% {
                    background-position: 100% 0%;
                    filter: blur(1.5px) contrast(1.4) hue-rotate(90deg);
                }
                50% {
                    background-position: 100% 100%;
                    filter: blur(0.5px) contrast(1.8) hue-rotate(180deg);
                }
                75% {
                    background-position: 0% 100%;
                    filter: blur(2px) contrast(1.0) hue-rotate(270deg);
                }
                100% {
                    background-position: 0% 0%;
                    filter: blur(1px) contrast(1.2) hue-rotate(360deg);
                }
            }
            
            @keyframes moireFlash {
                0% {
                    opacity: 1;
                    transform: scale(1);
                    filter: blur(1px) contrast(1.2) brightness(1);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.05);
                    filter: blur(0px) contrast(2.0) brightness(1.8);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                    filter: blur(1px) contrast(1.2) brightness(1);
                }
            }
            
            .moire-border.flash {
                animation: moireFlash 0.3s ease-out, moireShift 3s linear infinite;
            }
            
            .moire-grid-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                opacity: 0.3;
                background-image: 
                    repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 10px,
                        rgba(255, 0, 255, 0.1) 11px,
                        rgba(255, 0, 255, 0.1) 12px
                    ),
                    repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 10px,
                        rgba(0, 255, 255, 0.1) 11px,
                        rgba(0, 255, 255, 0.1) 12px
                    ),
                    repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 14px,
                        rgba(255, 255, 0, 0.05) 15px,
                        rgba(255, 255, 0, 0.05) 16px
                    );
                animation: moireGridShift 4s linear infinite;
            }
            
            @keyframes moireGridShift {
                0% { transform: translate(0px, 0px) rotate(0deg); }n                25% { transform: translate(1px, -1px) rotate(0.5deg); }n                50% { transform: translate(-1px, 0px) rotate(-0.5deg); }n                75% { transform: translate(0px, 1px) rotate(0.25deg); }n                100% { transform: translate(0px, 0px) rotate(0deg); }n            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * @method setupInteractionTracking
     * @description Sets up global interaction tracking for scroll, mouse, and click events to update Moiré parameters.
     */
    setupInteractionTracking() {
        window.addEventListener('wheel', (e) => {
            const scrollIntensity = Math.min(Math.abs(e.deltaY) / 100, 1.0);
            this.interactionData.scroll = Math.min(1.0, this.interactionData.scroll + scrollIntensity * 0.3);
            this.updateMoireParameters();
        }, { passive: true });
        
        window.addEventListener('mousemove', (e) => {
            this.interactionData.mouse.x = e.clientX / window.innerWidth;
            this.interactionData.mouse.y = e.clientY / window.innerHeight;
            this.updateMoireParameters();
        });
        
        window.addEventListener('click', (e) => {
            this.interactionData.click = 1.0;
            this.updateMoireParameters();
            
            setTimeout(() => {
                this.interactionData.click *= 0.5;
                this.updateMoireParameters();
            }, 200);
        });
        
        setInterval(() => {
            this.interactionData.scroll *= 0.95;
            this.interactionData.click *= 0.9;
            this.updateMoireParameters();
        }, 50);
    }
    
    /**
     * @method setupReactiveElements
     * @description Adds Moiré grid overlays to visualizer canvas elements.
     */
    setupReactiveElements() {
        const visualizers = document.querySelectorAll('canvas[id*="visualizer"]');
        
        visualizers.forEach((visualizer, index) => {
            const overlay = document.createElement('div');
            overlay.className = 'moire-grid-overlay';
            overlay.id = `moire-overlay-${index}`;
            
            const container = visualizer.parentElement;
            if (container && getComputedStyle(container).position === 'static') {
                container.style.position = 'relative';
            }
            
            if (container) {
                container.appendChild(overlay);
            }
        });
    }
    
    /**
     * @method updateMoireParameters
     * @description Calculates total interaction energy and updates Moiré parameters and CSS custom properties.
     */
    updateMoireParameters() {
        this.interactionData.energy = (
            this.interactionData.scroll * this.config.scrollMultiplier +
            this.interactionData.click * this.config.clickMultiplier +
            (this.interactionData.mouse.x + this.interactionData.mouse.y) * this.config.mouseMultiplier * 0.5
        ) / 3.0;
        
        document.documentElement.style.setProperty('--moire-energy', this.interactionData.energy);
        document.documentElement.style.setProperty('--moire-scroll', this.interactionData.scroll);
        document.documentElement.style.setProperty('--moire-click', this.interactionData.click);
        document.documentElement.style.setProperty('--moire-mouse-x', this.interactionData.mouse.x);
        document.documentElement.style.setProperty('--moire-mouse-y', this.interactionData.mouse.y);
        
        this.moireInstances.forEach((instance, key) => {
            this.updateInstanceIntensity(instance);
        });
    }
    
    /**
     * @method updateInstanceIntensity
     * @description Updates the intensity of a single Moiré instance based on interaction energy.
     * @param {object} instance - The Moiré instance object.
     */
    updateInstanceIntensity(instance) {
        const lerpSpeed = 0.1;
        instance.intensity += (instance.targetIntensity - instance.intensity) * lerpSpeed;
        
        const energyInfluence = this.interactionData.energy * 0.5;
        const finalIntensity = Math.min(1.0, instance.intensity + energyInfluence);
        
        if (instance.element) {
            instance.element.style.opacity = finalIntensity;
            const animationSpeed = Math.max(1.0, 3.0 - finalIntensity * 2.0);
            instance.element.style.animationDuration = `${animationSpeed}s`;
        }
    }
    
    /**
     * @method triggerMoireFlash
     * @description Triggers a short Moiré flash animation on an element.
     * @param {HTMLElement} element - The HTML element to apply the flash to.
     */
    triggerMoireFlash(element) {
        element.classList.add('flash');
        setTimeout(() => {
            element.classList.remove('flash');
        }, 300);
    }
    
    /**
     * @method getMoireUniforms
     * @description Returns an object of Moiré-related uniform values for WebGL shaders.
     * @returns {object} Moiré uniform values.
     */
    getMoireUniforms() {
        return {
            u_gridDensity: this.config.baseGridDensity,
            u_offsetDensity: this.config.offsetGridDensity,
            u_tertiaryDensity: this.config.tertiaryGridDensity,
            u_redOffset: [this.config.redOffset.x, this.config.redOffset.y],
            u_greenOffset: [this.config.greenOffset.x, this.config.greenOffset.y],
            u_blueOffset: [this.config.blueOffset.x, this.config.blueOffset.y],
            u_interferenceIntensity: this.config.interferenceIntensity,
            u_colorSeparation: this.config.colorSeparation,
            u_interactionEnergy: this.interactionData.energy
        };
    }
    
    /**
     * @method setEnabled
     * @description Enables or disables Moiré effects.
     * @param {boolean} enabled - True to enable, false to disable.
     */
    setEnabled(enabled) {
        this.moireInstances.forEach((instance) => {
            if (instance.element) {
                instance.element.style.display = enabled ? 'block' : 'none';
            }
        });
        
        const overlays = document.querySelectorAll('.moire-grid-overlay');
        overlays.forEach(overlay => {
            overlay.style.display = enabled ? 'block' : 'none';
        });
    }
    
    /**
     * @method getStatus
     * @description Returns the current status of the Moiré RGB engine.
     * @returns {object} The status object.
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            instances: this.moireInstances.size,
            energy: this.interactionData.energy,
            activeEffects: this.activeEffects.size,
            config: this.config
        };
    }
}

export { VIB34DMoireRGBEngine };
