/**
 * @file SystemController.js
 * @description Main application orchestrator for the VIB34D system
 * Coordinates JsonConfigSystem, HomeMaster, visualizers, and interactions
 */

import { JsonConfigSystem } from './JsonConfigSystem.js';
import { VIB3HomeMaster } from './VIB3HomeMaster.js';
import { AgentAPI } from './AgentAPI.js';
import { VIB34DReactiveCore } from '../visualizers/VIB34DReactiveCore.js';

class SystemController {
    constructor() {
        this.jsonConfigSystem = new JsonConfigSystem();
        this.homeMaster = new VIB3HomeMaster(this.jsonConfigSystem);
        this.agentAPI = null;
        
        this.visualizers = new Map();
        this.interactionCoordinator = null;
        this.reactivityBridge = null;
        
        this.isInitialized = false;
        this.currentState = 'home';
        
        console.log('🎛️ SystemController initialized');
    }
    
    /**
     * Initialize the entire VIB34D system
     */
    async initialize() {
        console.log('🚀 SystemController: Initializing VIB34D system...');
        
        try {
            // Phase 1: Load JSON configurations
            console.log('📁 Phase 1: Loading JSON configurations...');
            await this.jsonConfigSystem.loadAll();
            
            // Phase 2: Initialize HomeMaster with JSON data
            console.log('🏠 Phase 2: Initializing HomeMaster...');
            await this.homeMaster.start();
            
            // Phase 3: Create layout from layout-content.json
            console.log('🎨 Phase 3: Creating layout from JSON...');
            await this.createLayoutFromJSON();
            
            // Phase 4: Initialize visualizers
            console.log('📺 Phase 4: Initializing visualizers...');
            await this.initializeVisualizers();
            
            // Phase 5: Setup interaction system
            console.log('⚡ Phase 5: Setting up interaction system...');
            await this.setupInteractionSystem();
            
            // Phase 6: Initialize Agent API
            console.log('🤖 Phase 6: Initializing Agent API...');
            this.agentAPI = new AgentAPI(this, this.homeMaster, this.jsonConfigSystem);
            
            // Phase 7: Set initial state
            console.log('🌐 Phase 7: Setting initial state...');
            await this.setInitialState();
            
            this.isInitialized = true;
            console.log('✅ SystemController: VIB34D system fully initialized!');
            
            // Emit system ready event
            this.emit('systemReady', { systemController: this });
            
        } catch (error) {
            console.error('❌ SystemController: Initialization failed:', error);
            throw error;
        }
    }
    
    /**
     * Create DOM layout from layout-content.json
     */
    async createLayoutFromJSON() {
        const layoutConfig = this.jsonConfigSystem.getConfig('layoutContent');
        if (!layoutConfig) {
            throw new Error('layout-content.json not loaded');
        }
        
        console.log('🏗️ Creating layout from JSON configuration...');
        
        // Ensure main container exists
        let blogContainer = document.getElementById('blogContainer');
        if (!blogContainer) {
            blogContainer = document.createElement('div');
            blogContainer.id = 'blogContainer';
            blogContainer.className = 'blog-container layout-home';
            document.body.appendChild(blogContainer);
        }
        
        // Create visualizer board if it doesn't exist
        let boardContainer = document.querySelector('.visualizer-board');
        if (!boardContainer) {
            boardContainer = document.createElement('div');
            boardContainer.className = 'visualizer-board';
            
            const boardCanvas = document.createElement('canvas');
            boardCanvas.id = 'board-visualizer';
            boardContainer.appendChild(boardCanvas);
            
            blogContainer.appendChild(boardContainer);
        }
        
        // Create cards from JSON configuration
        this.createCardsFromJSON(layoutConfig.cards, blogContainer);
        
        console.log('✅ Layout created from JSON configuration');
    }
    
    /**
     * Create card elements from JSON configuration
     */
    createCardsFromJSON(cardsConfig, container) {
        // Clear existing cards
        const existingCards = container.querySelectorAll('.blog-card');
        existingCards.forEach(card => card.remove());
        
        cardsConfig.forEach((cardConfig, index) => {
            const card = document.createElement('div');
            card.className = 'blog-card';
            card.id = cardConfig.id;
            
            // Apply position styles from JSON
            Object.assign(card.style, cardConfig.position);
            
            // Create canvas for visualizer
            const canvas = document.createElement('canvas');
            canvas.className = 'card-visualizer';
            canvas.id = `card-visualizer-${index + 1}`;
            canvas.width = 400;
            canvas.height = 300;
            
            // Create content container
            const content = document.createElement('div');
            content.className = 'card-content';
            content.innerHTML = `
                <div class="card-title">${cardConfig.title}</div>
                <div class="card-subtitle">${cardConfig.subtitle}</div>
                <div class="card-description">${cardConfig.content}</div>
            `;
            
            card.appendChild(canvas);
            card.appendChild(content);
            container.appendChild(card);
            
            console.log(`📄 Created card: ${cardConfig.id}`);
        });
    }
    
    /**
     * Initialize all visualizers based on configuration
     */
    async initializeVisualizers() {
        const layoutConfig = this.jsonConfigSystem.getConfig('layoutContent');
        const visualsConfig = this.jsonConfigSystem.getConfig('visuals');
        
        if (!layoutConfig || !visualsConfig) {
            throw new Error('Required configurations not loaded');
        }
        
        // Initialize board visualizer
        const boardCanvas = document.getElementById('board-visualizer');
        if (boardCanvas) {
            const boardViz = new VIB34DReactiveCore(boardCanvas, 0, [1.0, 0.0, 1.0], 'board');
            this.visualizers.set('board-visualizer', boardViz);
            this.homeMaster.registerVisualizer(boardViz);
            console.log('📺 Initialized board visualizer');
        }
        
        // Initialize card visualizers
        layoutConfig.cards.forEach((cardConfig, index) => {
            const canvasId = `card-visualizer-${index + 1}`;
            const canvas = document.getElementById(canvasId);
            
            if (canvas) {
                // Get geometry info from visuals config
                const geometry = visualsConfig.geometries.find(g => g.name === cardConfig.geometry) || visualsConfig.geometries[0];
                const geometryIndex = geometry.id;
                const geometryColor = geometry.baseColor;
                
                const visualizer = new VIB34DReactiveCore(canvas, geometryIndex, geometryColor, 'card');
                this.visualizers.set(canvasId, visualizer);
                this.homeMaster.registerVisualizer(visualizer);
                
                console.log(`📺 Initialized ${canvasId} with ${geometry.name} geometry`);
            }
        });
        
        console.log(`✅ Initialized ${this.visualizers.size} visualizers`);
    }
    
    /**
     * Setup interaction system based on behavior.json
     */
    async setupInteractionSystem() {
        const behaviorConfig = this.jsonConfigSystem.getConfig('behavior');
        const stateMapConfig = this.jsonConfigSystem.getConfig('stateMap');
        
        if (!behaviorConfig || !stateMapConfig) {
            throw new Error('behavior.json or state-map.json not loaded');
        }
        
        console.log('⚡ Setting up JSON-driven interaction system...');
        
        // Setup mouse movement interactions
        this.setupMouseMovementInteraction(behaviorConfig);
        
        // Setup scroll interactions
        this.setupScrollInteraction(behaviorConfig);
        
        // Setup keyboard interactions
        this.setupKeyboardInteractions(stateMapConfig);
        
        // Setup card hover ecosystem reactions
        this.setupCardHoverEcosystem(behaviorConfig);
        
        // Setup state dot navigation
        this.setupStateDotNavigation(stateMapConfig);
        
        console.log('✅ Interaction system configured from JSON');
    }
    
    /**
     * Setup mouse movement interaction from behavior.json
     */
    setupMouseMovementInteraction(behaviorConfig) {
        const mouseBlueprint = behaviorConfig.interactionBlueprints.mouseMoveMorphing;
        if (!mouseBlueprint) return;
        
        document.addEventListener('mousemove', (e) => {
            const mouseX = e.clientX / window.innerWidth;
            const mouseY = e.clientY / window.innerHeight;
            
            // Execute reactions from JSON blueprint
            for (const reaction of mouseBlueprint.reactions) {
                if (reaction.target === 'global') {
                    for (const [param, animation] of Object.entries(reaction.animation)) {
                        if (param === 'u_morphFactor') {
                            // Map mouseX to morphFactor range (0.0 - 1.5)
                            const value = mouseX * 1.5;
                            this.homeMaster.setParameter('u_morphFactor', value, 'mouseMove');
                        }
                        if (param === 'u_dimension') {
                            // Map mouseY to dimension range (3.0 - 4.5)
                            const value = 3.0 + (mouseY * 1.5);
                            this.homeMaster.setParameter('u_dimension', value, 'mouseMove');
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Setup scroll interaction from behavior.json
     */
    setupScrollInteraction(behaviorConfig) {
        const scrollBlueprint = behaviorConfig.interactionBlueprints.scrollGridDensity;
        if (!scrollBlueprint) return;
        
        document.addEventListener('wheel', (e) => {
            const scrollDelta = e.deltaY > 0 ? 1 : -1;
            
            // Execute reactions from JSON blueprint
            for (const reaction of scrollBlueprint.reactions) {
                if (reaction.target === 'global') {
                    const currentDensity = this.homeMaster.getParameter('u_gridDensity') || 12.0;
                    const newDensity = currentDensity + (scrollDelta * 0.5);
                    this.homeMaster.setParameter('u_gridDensity', newDensity, 'scroll');
                }
            }
        });
    }
    
    /**
     * Setup keyboard interactions from state-map.json
     */
    setupKeyboardInteractions(stateMapConfig) {
        document.addEventListener('keydown', (e) => {
            const key = e.key;
            
            // Handle geometry switching (keys 1-5)
            if (['1', '2', '3', '4', '5'].includes(key)) {
                const geometryIndex = parseInt(key) - 1;
                this.homeMaster.setParameter('geometry', geometryIndex, 'keyboard');
                
                // Update color shift from JSON behavior
                const currentShift = this.homeMaster.getParameter('u_colorShift') || 0;
                this.homeMaster.setParameter('u_colorShift', currentShift + 0.2, 'keyboard');
            }
            
            // Handle navigation
            const navigation = stateMapConfig.navigation;
            switch (key) {
                case 'ArrowLeft':
                    this.navigateToState('home');
                    break;
                case 'ArrowRight':
                    this.navigateToState('tech');
                    break;
                case 'ArrowUp':
                    this.navigateToState('research');
                    break;
                case 'ArrowDown':
                    this.navigateToState('media');
                    break;
                case ' ':
                    e.preventDefault();
                    this.cycleToNextState();
                    break;
            }
        });
    }
    
    /**
     * Setup card hover ecosystem from behavior.json
     */
    setupCardHoverEcosystem(behaviorConfig) {
        const hoverBlueprint = behaviorConfig.interactionBlueprints.cardHoverEcosystem;
        if (!hoverBlueprint) return;
        
        document.querySelectorAll('.blog-card').forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                // Execute hover reactions from JSON
                for (const reaction of hoverBlueprint.reactions) {
                    if (reaction.target === 'subject') {
                        // Enhance the hovered card
                        card.setAttribute('data-section-hover', 'true');
                        this.homeMaster.setParameter('u_patternIntensity', 2.5, 'cardHover');
                        this.homeMaster.setParameter('u_glitchIntensity', 0.12, 'cardHover');
                    }
                    if (reaction.target === 'ecosystem') {
                        // Dim other cards
                        document.querySelectorAll('.blog-card').forEach((otherCard, otherIndex) => {
                            if (otherIndex !== index) {
                                otherCard.setAttribute('data-inverse', 'true');
                            }
                        });
                    }
                    if (reaction.target === 'global') {
                        // Global effects
                        this.homeMaster.setParameter('u_audioBass', 0.8, 'cardHover');
                        const currentDensity = this.homeMaster.getParameter('u_gridDensity') || 12.0;
                        this.homeMaster.setParameter('u_gridDensity', currentDensity + 2.0, 'cardHover');
                    }
                }
            });
            
            card.addEventListener('mouseleave', () => {
                // Revert to normal state
                card.removeAttribute('data-section-hover');
                document.querySelectorAll('.blog-card').forEach(otherCard => {
                    otherCard.removeAttribute('data-inverse');
                });
                
                // Reset parameters to defaults
                this.homeMaster.setParameter('u_patternIntensity', 1.3, 'cardLeave');
                this.homeMaster.setParameter('u_glitchIntensity', 0.05, 'cardLeave');
                this.homeMaster.setParameter('u_audioBass', 0.0, 'cardLeave');
            });
        });
    }
    
    /**
     * Setup state dot navigation from state-map.json
     */
    setupStateDotNavigation(stateMapConfig) {
        const stateOrder = stateMapConfig.stateOrder || Object.keys(stateMapConfig.states);
        
        document.querySelectorAll('.state-dot').forEach((dot, index) => {
            const stateName = stateOrder[index];
            if (stateName) {
                dot.addEventListener('click', () => {
                    this.navigateToState(stateName);
                });
                console.log(`🔵 Setup state dot ${index} for ${stateName}`);
            }
        });
    }
    
    /**
     * Set initial state from state-map.json
     */
    async setInitialState() {
        const stateMapConfig = this.jsonConfigSystem.getConfig('stateMap');
        const initialState = stateMapConfig.initialState;
        
        await this.navigateToState(initialState);
        console.log(`🌐 Set initial state: ${initialState}`);
    }
    
    /**
     * Navigate to a specific state
     */
    async navigateToState(stateName) {
        const stateMapConfig = this.jsonConfigSystem.getConfig('stateMap');
        const stateConfig = stateMapConfig.states[stateName];
        
        if (!stateConfig) {
            console.error(`❌ Invalid state: ${stateName}`);
            return false;
        }
        
        console.log(`🌐 Navigating to state: ${stateName}`);
        
        // Update HomeMaster state
        await this.homeMaster.setState(stateName);
        
        // Update layout class
        const blogContainer = document.getElementById('blogContainer');
        if (blogContainer) {
            blogContainer.className = `blog-container ${stateConfig.layoutClass}`;
        }
        
        // Update active dots
        document.querySelectorAll('.state-dot').forEach((dot, index) => {
            dot.classList.remove('active');
        });
        
        const stateOrder = stateMapConfig.stateOrder || Object.keys(stateMapConfig.states);
        const stateIndex = stateOrder.indexOf(stateName);
        if (stateIndex >= 0) {
            const activeDot = document.querySelectorAll('.state-dot')[stateIndex];
            if (activeDot) {
                activeDot.classList.add('active');
            }
        }
        
        this.currentState = stateName;
        return true;
    }
    
    /**
     * Cycle to next state
     */
    cycleToNextState() {
        const stateMapConfig = this.jsonConfigSystem.getConfig('stateMap');
        const stateOrder = stateMapConfig.stateOrder || Object.keys(stateMapConfig.states);
        const currentIndex = stateOrder.indexOf(this.currentState);
        const nextIndex = (currentIndex + 1) % stateOrder.length;
        const nextState = stateOrder[nextIndex];
        
        this.navigateToState(nextState);
    }
    
    /**
     * Handle configuration updates (for hot reloading)
     */
    async handleConfigUpdate(configName, newConfig) {
        console.log(`🔄 SystemController: Handling ${configName} config update`);
        
        switch (configName) {
            case 'visuals':
                // Reinitialize parameters in HomeMaster
                await this.homeMaster.initialize();
                break;
            case 'behavior':
                // Recreate interaction system
                await this.setupInteractionSystem();
                break;
            case 'stateMap':
                // Update navigation and states
                await this.setupKeyboardInteractions(newConfig);
                break;
            case 'layoutContent':
                // Recreate layout
                await this.createLayoutFromJSON();
                await this.initializeVisualizers();
                break;
        }
        
        console.log(`✅ SystemController: ${configName} update complete`);
    }
    
    /**
     * Execute an interaction blueprint
     */
    executeInteraction(blueprint, targetSelector) {
        console.log(`⚡ Executing interaction blueprint on ${targetSelector}`);
        
        for (const reaction of blueprint.reactions) {
            if (reaction.target === 'global') {
                for (const [param, animation] of Object.entries(reaction.animation)) {
                    if (this.homeMaster.getParameter(param) !== undefined) {
                        // Apply animation value
                        const newValue = this.parseAnimationValue(animation.to, param);
                        this.homeMaster.setParameter(param, newValue, 'interaction');
                    }
                }
            }
        }
    }
    
    /**
     * Parse animation values like "+=0.5", "*=1.2", etc.
     */
    parseAnimationValue(animationTo, paramName) {
        const currentValue = this.homeMaster.getParameter(paramName) || 0;
        
        if (typeof animationTo === 'string') {
            if (animationTo.startsWith('+=')) {
                return currentValue + parseFloat(animationTo.substring(2));
            } else if (animationTo.startsWith('*=')) {
                return currentValue * parseFloat(animationTo.substring(2));
            } else if (animationTo.startsWith('-=')) {
                return currentValue - parseFloat(animationTo.substring(2));
            }
        }
        
        return typeof animationTo === 'number' ? animationTo : currentValue;
    }
    
    /**
     * Emit system events
     */
    emit(eventName, data) {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(`vib34d:${eventName}`, { detail: data }));
        }
    }
    
    /**
     * Get system status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            currentState: this.currentState,
            visualizerCount: this.visualizers.size,
            homeMaster: this.homeMaster.getAllParameters(),
            configs: this.jsonConfigSystem.getAllConfigs()
        };
    }
}

export { SystemController };