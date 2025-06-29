
/**
 * @file VIB34DMorphingBlogSystem.js
 * @description Manages the overall VIB34D morphing blog system, including visualizers, layouts, and global parameters.
 */

import { VIB34DReactiveCore } from '../visualizers/VIB34DReactiveCore.js';

/**
 * @class VIB34DMorphingBlogSystem
 * @description Orchestrates the various components of the VIB34D system, handling visualizer creation, layout transitions, and global parameter management.
 */
class VIB34DMorphingBlogSystem {
    /**
     * @constructor
     */
    constructor() {
        /** @type {VIB34DReactiveCore[]} */
        this.visualizers = [];
        /** @type {number} */
        this.currentState = 0;
        /** @type {number} */
        this.currentGeometry = 0;
        /** @type {boolean} */
        this.isTransitioning = false;
        
        /** @type {object} */
        this.globalParams = {
            morphFactor: 0.5,
            dimension: 3.5,
            glitchIntensity: 0.5,
            rotationSpeed: 0.5,
            gridDensity: 12.0,
            interactionIntensity: 0.3
        };
        
        /** @type {object} */
        this.interactionState = {
            mouseX: 0.5,
            mouseY: 0.5,
            isClicking: false,
            isHolding: false,
            scrollVelocity: 0,
            lastActivity: Date.now(),
            hoverIntensity: 0,
            clickCount: 0
        };
        
        /** @type {string[]} */
        this.layoutNames = ['HOME', 'TECH', 'MEDIA', 'INNOVATION', 'RESEARCH'];
        /** @type {string[]} */
        this.layoutClasses = ['layout-home', 'layout-tech', 'layout-media', 'layout-innovation', 'layout-research'];
        /** @type {string[]} */
        this.geometryNames = ['hypercube', 'tetrahedron', 'sphere', 'torus', 'klein', 'fractal', 'wave', 'crystal'];
        
        /** @type {number[][]} */
        this.geometryColors = [
            [1.0, 0.0, 1.0],    // Hypercube - Magenta
            [0.0, 1.0, 1.0],    // Tetrahedron - Cyan
            [1.0, 1.0, 0.0],    // Sphere - Yellow
            [0.0, 1.0, 0.0],    // Torus - Green
            [1.0, 0.5, 0.0],    // Klein - Orange
            [0.5, 0.0, 1.0],    // Fractal - Purple
            [1.0, 0.0, 0.5],    // Wave - Pink
            [0.0, 1.0, 0.5]     // Crystal - Mint
        ];
        
        this.initialize();
    }
    
    /**
     * @method initialize
     * @description Initializes the visualizers and sets up event listeners.
     */
    initialize() {
        console.log('🎨 Initializing VIB34D Morphing Blog System...');
        
        // Create board visualizer
        const boardViz = new VIB34DReactiveCore(
            document.getElementById('board-visualizer'),
            this.currentGeometry,
            this.geometryColors[this.currentGeometry],
            'board'
        );
        this.visualizers.push(boardViz);
        
        // Create card visualizers
        for (let i = 1; i <= 6; i++) {
            const cardViz = new VIB34DReactiveCore(
                document.getElementById(`card-visualizer-${i}`),
                this.currentGeometry,
                this.geometryColors[this.currentGeometry],
                'card'
            );
            this.visualizers.push(cardViz);
        }
        
        this.setupLayoutControls();
        this.setupCardInteractions();
        this.initInteractionListeners();
        
        console.log('✅ VIB34D Morphing Blog System ready - 7 visualizers with user interaction control');
    }
    
    /**
     * @method initInteractionListeners
     * @description Sets up event listeners for interactions from the InteractionCoordinator.
     */
    initInteractionListeners() {
        document.addEventListener('interaction', (e) => {
            const { type, data } = e.detail;
            switch (type) {
                case 'mouseMove':
                    this.globalParams.morphFactor = data.x * 1.5;
                    this.globalParams.dimension = 3.0 + (data.y * 1.5);
                    break;
                case 'mouseDown':
                    this.interactionState.isClicking = true;
                    this.interactionState.isHolding = true;
                    this.interactionState.clickCount++;
                    this.globalParams.rotationSpeed = Math.min(2.0, 0.5 + (this.interactionState.clickCount * 0.2));
                    this.globalParams.interactionIntensity = 1.0;
                    break;
                case 'mouseUp':
                    this.interactionState.isClicking = false;
                    setTimeout(() => {
                        this.globalParams.rotationSpeed = Math.max(0.5, this.globalParams.rotationSpeed - 0.1);
                        this.globalParams.interactionIntensity = 0.3;
                    }, 200);
                    break;
                case 'scroll':
                    if (Math.abs(data.deltaY) > 50) {
                        this.handleLayoutScroll(data.deltaY > 0 ? 1 : -1);
                    } else {
                        const scrollDirection = data.deltaY > 0 ? -1 : 1;
                        this.globalParams.gridDensity = Math.max(5.0, Math.min(25.0, 
                            this.globalParams.gridDensity + scrollDirection * 1.0));
                    }
                    break;
                case 'keyDown':
                    switch(data.key) {
                        case '1': case '2': case '3': case '4':
                        case '5': case '6': case '7': case '8':
                            const geometryIndex = parseInt(data.key) - 1;
                            this.switchGeometry(geometryIndex);
                            break;
                        case 'ArrowUp':
                            this.globalParams.dimension = Math.min(4.5, this.globalParams.dimension + 0.1);
                            break;
                        case 'ArrowDown':
                            this.globalParams.dimension = Math.max(3.0, this.globalParams.dimension - 0.1);
                            break;
                        case 'ArrowLeft':
                            this.globalParams.rotationSpeed = Math.max(0.0, this.globalParams.rotationSpeed - 0.1);
                            break;
                        case 'ArrowRight':
                            this.globalParams.rotationSpeed = Math.min(2.0, this.globalParams.rotationSpeed + 0.1);
                            break;
                        case ' ': // Spacebar
                            this.globalParams.glitchIntensity = this.globalParams.glitchIntensity > 0.5 ? 0.1 : 0.9;
                            break;
                    }
                    break;
            }
            this.updateAllVisualizers();
        });
    }
    
    /**
     * @method setupCardInteractions
     * @description Sets up mouse enter/leave event listeners for blog cards to trigger visual reactions.
     */
    setupCardInteractions() {
        document.querySelectorAll('.blog-card').forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                card.setAttribute('data-section-hover', 'true');
                document.querySelectorAll('.blog-card').forEach((otherCard, otherIndex) => {
                    if (otherIndex !== index) {
                        otherCard.setAttribute('data-inverse', 'true');
                    }
                });
                this.globalParams.glitchIntensity = 0.8;
                this.globalParams.interactionIntensity = 0.9;
                document.documentElement.style.setProperty('--section-focus', index);
                document.documentElement.style.setProperty('--global-energy', '1.0');
                this.updateAllVisualizers();
            });
            
            card.addEventListener('mouseleave', () => {
                card.removeAttribute('data-section-hover');
                document.querySelectorAll('.blog-card').forEach(otherCard => {
                    otherCard.removeAttribute('data-inverse');
                });
                this.globalParams.glitchIntensity = 0.5;
                this.globalParams.interactionIntensity = 0.3;
                document.documentElement.style.setProperty('--section-focus', '0');
                document.documentElement.style.setProperty('--global-energy', '0.5');
                this.updateAllVisualizers();
            });
        });
    }
    
    /**
     * @method setupLayoutControls
     * @description Sets up click event listeners for layout control dots.
     */
    setupLayoutControls() {
        document.querySelectorAll('.state-dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.triggerLayoutTransition(index);
                document.querySelectorAll('.state-dot').forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
            });
        });
    }
    
    /**
     * @method handleLayoutScroll
     * @description Handles scroll events to trigger layout transitions.
     * @param {number} direction - The direction of the scroll (1 for down, -1 for up).
     */
    handleLayoutScroll(direction) {
        if (this.isTransitioning) return;
        const newState = (this.currentState + direction + 5) % 5;
        this.triggerLayoutTransition(newState);
    }
    
    /**
     * @method triggerLayoutTransition
     * @description Initiates a transition to a new layout state.
     * @param {number} newState - The index of the new layout state.
     */
    triggerLayoutTransition(newState) {
        if (newState === this.currentState || this.isTransitioning) return;
        console.log(`🎭 MORPHING BLOG TRANSITION TO: ${this.layoutNames[newState]}`);
        this.isTransitioning = true;
        this.currentState = newState;
        const blogContainer = document.getElementById('blogContainer');
        blogContainer.className = `blog-container ${this.layoutClasses[newState]}`;
        const layoutDisplay = document.getElementById('layout-display');
        if (layoutDisplay) layoutDisplay.textContent = this.layoutNames[newState];
        this.globalParams.interactionIntensity = 1.5;
        this.globalParams.rotationSpeed = Math.min(2.0, this.globalParams.rotationSpeed + 0.3);
        this.updateAllVisualizers();
        setTimeout(() => {
            this.isTransitioning = false;
            this.globalParams.interactionIntensity = 0.3;
            this.globalParams.rotationSpeed = Math.max(0.5, this.globalParams.rotationSpeed - 0.3);
            this.updateAllVisualizers();
        }, 800);
    }
    
    /**
     * @method switchGeometry
     * @description Switches the active geometry for all visualizers.
     * @param {number} geometryIndex - The index of the new geometry.
     */
    switchGeometry(geometryIndex) {
        this.currentGeometry = geometryIndex;
        const geometryName = this.geometryNames[geometryIndex];
        const geometryColor = this.geometryColors[geometryIndex];
        console.log(`🔄 Switching to geometry: ${geometryName} (${geometryIndex})`);
        this.visualizers.forEach(visualizer => {
            visualizer.params.geometry = geometryIndex;
            visualizer.params.baseColor = geometryColor;
        });
        const geometryDisplay = document.getElementById('geometry-display');
        if (geometryDisplay) geometryDisplay.textContent = geometryName;
        this.globalParams.interactionIntensity = 1.0;
        this.updateAllVisualizers();
        setTimeout(() => {
            this.globalParams.interactionIntensity = 0.3;
            this.updateAllVisualizers();
        }, 300);
    }
    
    /**
     * @method updateAllVisualizers
     * @description Updates all visualizer instances with the current global parameters and updates CSS variables.
     * @param {object} [newParams={}] - Optional new parameters to merge with global parameters.
     */
    updateAllVisualizers(newParams = {}) {
        Object.assign(this.globalParams, newParams);
        this.visualizers.forEach(visualizer => {
            visualizer.updateParams(this.globalParams);
        });
        document.documentElement.style.setProperty('--morph-factor', this.globalParams.morphFactor);
        document.documentElement.style.setProperty('--dimension-value', this.globalParams.dimension);
        document.documentElement.style.setProperty('--glitch-intensity', this.globalParams.glitchIntensity);
        document.documentElement.style.setProperty('--rotation-speed', this.globalParams.rotationSpeed);
        document.documentElement.style.setProperty('--grid-density', this.globalParams.gridDensity);
        document.documentElement.style.setProperty('--interaction-intensity', this.globalParams.interactionIntensity);
    }
}

export { VIB34DMorphingBlogSystem };
