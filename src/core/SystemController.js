/**
 * @file SystemController.js
 * @description Main application orchestrator for the VIB34D system
 * Coordinates JsonConfigSystem, HomeMaster, visualizers, and interactions
 */

import { JsonConfigSystem } from './JsonConfigSystem.js';
import { VIB3HomeMaster } from './VIB3HomeMaster.js';
import { AgentAPI } from './AgentAPI.js';
import { VIB34DReactiveCore } from '../visualizers/VIB34DReactiveCore.js';
import { VIB34DEnhancedCore } from '../visualizers/VIB34DEnhancedCore.js';
import { HolographicVisualizer } from '../visualizers/HolographicVisualizer.js';
import { UserEventReactiveCore } from './UserEventReactiveCore.js';
import { EcosystemReactionEngine } from './EcosystemReactionEngine.js';

class SystemController {
    constructor() {
        this.jsonConfigSystem = new JsonConfigSystem();
        this.homeMaster = new VIB3HomeMaster(this.jsonConfigSystem);
        this.agentAPI = null;
        
        this.visualizers = new Map();
        this.interactionCoordinator = null;
        this.reactivityBridge = null;
        
        // USER EVENT REACTIVE SYSTEM
        this.userEventReactive = new UserEventReactiveCore();
        this.lastInteractionData = {};
        this.baseParams = {}; // Store base parameter values from JSON
        this.isReactiveUpdateRunning = false;
        
        // ECOSYSTEM REACTION ENGINE
        this.ecosystemEngine = new EcosystemReactionEngine();
        
        this.isInitialized = false;
        this.currentState = 'home';
        
        console.log('🎛️ SystemController initialized with User Event Reactivity');
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
            
            // Phase 8: Initialize User Event Reactive System
            console.log('🎮 Phase 8: Starting User Event Reactive System...');
            await this.startUserEventReactivity();
            
            // Phase 9: Initialize Ecosystem Reaction Engine  
            console.log('🌐 Phase 9: Starting Ecosystem Reaction Engine...');
            await this.ecosystemEngine.initialize(this.visualizers);
            
            this.isInitialized = true;
            console.log('✅ SystemController: VIB34D system fully initialized with Ecosystem Reactions!');
            
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
        
        // Initialize board visualizer with HIGH-FIDELITY ENHANCED 4D MATHEMATICS
        const boardCanvas = document.getElementById('board-visualizer');
        if (boardCanvas) {
            try {
                const boardViz = new VIB34DEnhancedCore(boardCanvas);
                boardViz.setTheme('hypercube');
                boardViz.start();
                this.visualizers.set('board-visualizer', boardViz);
                this.homeMaster.registerVisualizer(boardViz);
                console.log('🔮 Initialized HIGH-FIDELITY 4D board visualizer');
            } catch (error) {
                console.error('❌ Board visualizer failed, falling back:', error);
                // Fallback to basic visualizer
                const boardViz = new VIB34DReactiveCore(boardCanvas, 0, [1.0, 0.0, 1.0], 'board');
                this.visualizers.set('board-visualizer', boardViz);
                this.homeMaster.registerVisualizer(boardViz);
            }
        }
        
        // Initialize card visualizers with REAL 4D MATHEMATICS + geometry variety
        layoutConfig.cards.forEach((cardConfig, index) => {
            const canvasId = `card-visualizer-${index + 1}`;
            const canvas = document.getElementById(canvasId);
            
            if (canvas) {
                // Get geometry info from visuals config
                const geometry = visualsConfig.geometries.find(g => g.name === cardConfig.geometry) || visualsConfig.geometries[0];
                const geometryIndex = geometry.id;
                const geometryColor = geometry.baseColor;
                
                let visualizer;
                try {
                    // Use enhanced core with high-fidelity features
                    visualizer = new VIB34DEnhancedCore(canvas);
                    visualizer.setTheme(geometry.name);
                    visualizer.setParameter('geometry', geometryIndex);
                    visualizer.setParameter('baseColor', geometryColor);
                    visualizer.start();
                    
                    console.log(`🔮 Enhanced card visualizer: ${canvasId} (${geometry.name})`);
                } catch (error) {
                    console.error(`❌ Enhanced card visualizer failed for ${canvasId}, falling back:`, error);
                    // Fallback to basic visualizer
                    visualizer = new VIB34DReactiveCore(canvas, geometry.id, geometry.baseColor, 'card');
                }
                
                this.visualizers.set(canvasId, visualizer);
                this.homeMaster.registerVisualizer(visualizer);
                
                console.log(`🔮 Initialized 4D MATHEMATICS ${canvasId} with ${geometry.name} geometry`);
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
     * Navigate to a specific state WITH GEOMETRY SHIFTING
     */
    async navigateToState(stateName) {
        const stateMapConfig = this.jsonConfigSystem.getConfig('stateMap');
        const stateConfig = stateMapConfig.states[stateName];
        
        if (!stateConfig) {
            console.error(`❌ Invalid state: ${stateName}`);
            return false;
        }
        
        console.log(`🌐 Navigating to state: ${stateName} with GEOMETRY SHIFT`);
        
        // GEOMETRY +1 SHIFT SYSTEM
        const stateGeometryMap = {
            'home': 0,      // hypercube
            'tech': 1,      // tetrahedron  
            'media': 2,     // sphere
            'innovation': 3, // torus
            'research': 4   // klein bottle
        };
        
        const newGeometry = stateGeometryMap[stateName] || 0;
        const currentGeometry = stateGeometryMap[this.currentState] || 0;
        
        // Only execute transition if geometry actually changes
        if (newGeometry !== currentGeometry) {
            await this.executeGeometryTransition(currentGeometry, newGeometry, stateName);
        }
        
        // Update current state
        this.currentState = stateName;
        
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
     * Start the User Event Reactive System
     */
    async startUserEventReactivity() {
        console.log('🎮 Initializing User Event Reactive System...');
        
        // Store base parameters from JSON
        const visualsConfig = this.jsonConfigSystem.getConfig('visuals');
        if (visualsConfig && visualsConfig.parameters) {
            for (const [paramName, paramConfig] of Object.entries(visualsConfig.parameters)) {
                this.baseParams[paramName] = paramConfig.default;
            }
            console.log('📊 Base parameters stored from visuals.json');
        }
        
        // Initialize the reactive system with all visualizers
        const allVisualizers = Array.from(this.visualizers.values());
        await this.userEventReactive.initialize(allVisualizers);
        
        // Start the main reactive update loop
        this.startReactiveUpdateLoop();
        
        console.log('✅ User Event Reactive System started');
    }
    
    /**
     * Main reactive update loop (replaces audio update loop with user interaction analysis)
     */
    startReactiveUpdateLoop() {
        if (this.isReactiveUpdateRunning) return;
        
        this.isReactiveUpdateRunning = true;
        console.log('🔄 Starting reactive update loop...');
        
        const reactiveUpdateLoop = () => {
            if (!this.isReactiveUpdateRunning || !this.isInitialized) return;
            
            // Get current interaction analysis data
            const interactionData = this.userEventReactive.analysisData;
            const currentState = this.userEventReactive.currentState;
            
            // Generate parameter mappings (same system as audio but for user interactions)
            const parameterMappings = this.generateUserInteractionMappings(interactionData, currentState);
            
            // Calculate effective parameters from base params + interaction modulation
            const effectiveParams = this.calculateEffectiveParameters(parameterMappings);
            
            // Update all visualizers with reactive parameters
            this.updateVisualizersWithReactiveParams(effectiveParams, interactionData, currentState);
            
            // Update UI elements with visual feedback (like audio system slider pulsing)
            this.updateUIWithInteractionFeedback(interactionData, parameterMappings);
            
            // Continue the loop
            requestAnimationFrame(reactiveUpdateLoop);
        };
        
        requestAnimationFrame(reactiveUpdateLoop);
    }
    
    /**
     * Generate parameter mappings for user interactions (replaces audio mappings)
     */
    generateUserInteractionMappings(interactionData, currentState) {
        // Calculate interaction-based factors (replaces audio factors)
        const dissonanceFactor = interactionData.velocitySmooth * interactionData.precisionSmooth * 2.0;
        const energyFactor = (interactionData.movementSmooth + interactionData.velocitySmooth) * 0.5;
        const transientFactor = Math.max(0, interactionData.precisionSmooth - 0.1) * 2.0;
        
        return {
            // Core parameters mapped to user interactions
            u_morphFactor: {
                factor: interactionData.interaction.frequency > 0 
                    ? 0.4 + (interactionData.interaction.frequency / 10) * 0.8 + transientFactor * 0.5
                    : this.baseParams.u_morphFactor + interactionData.velocitySmooth * 0.8 + transientFactor * 0.7,
                primary: 'interaction',
                secondary: 'transient',
                pulseThreshold: 0.3
            },
            
            u_dimension: {
                factor: interactionData.interaction.frequency > 0
                    ? 3.0 + (this.userEventReactive.INTERACTION_PATTERNS[interactionData.interaction.type] || 0) * 2.0
                    : this.baseParams.u_dimension + interactionData.movementSmooth * 0.6 + interactionData.velocitySmooth * 0.3,
                primary: 'interaction',
                secondary: 'movement',
                pulseThreshold: 0.4
            },
            
            u_rotationSpeed: {
                factor: interactionData.interaction.frequency > 0
                    ? 0.2 + (interactionData.interaction.frequency / 8) * 2.0 + interactionData.velocitySmooth * 1.0
                    : this.baseParams.u_rotationSpeed + interactionData.velocitySmooth * 3.0 + interactionData.precisionSmooth * 2.0,
                primary: 'interaction',
                secondary: 'velocity',
                pulseThreshold: 0.25
            },
            
            u_gridDensity: {
                factor: interactionData.interaction.frequency > 0
                    ? 4.0 + ((interactionData.interaction.frequency % 3) * 3.0) + interactionData.movementSmooth * 6.0
                    : this.baseParams.u_gridDensity + interactionData.movementSmooth * 2.2 + transientFactor * 0.7,
                primary: 'interaction',
                secondary: 'movement',
                pulseThreshold: 0.4
            },
            
            u_lineThickness: {
                factor: interactionData.interaction.frequency > 0
                    ? this.baseParams.u_lineThickness * (1.5 - ((interactionData.interaction.frequency - 2) / 6) * 0.8)
                    : this.baseParams.u_lineThickness * (1.5 - interactionData.precisionSmooth * 1.0 + interactionData.movementSmooth * 0.3),
                primary: 'interaction',
                secondary: 'precision',
                pulseThreshold: 0.5,
                inverse: true
            },
            
            u_patternIntensity: {
                factor: this.baseParams.u_patternIntensity * (0.7 + interactionData.velocitySmooth * 1.5 + transientFactor * 1.1),
                primary: 'pattern',
                secondary: 'transient',
                pulseThreshold: 0.25
            },
            
            u_colorShift: {
                factor: (dissonanceFactor * 1.5) + (energyFactor - 0.1) * 0.8,
                primary: 'pattern',
                secondary: 'energy',
                pulseThreshold: 0.3,
                bipolar: true
            }
        };
    }
    
    /**
     * Calculate effective parameters from base params + interaction modulation
     */
    calculateEffectiveParameters(parameterMappings) {
        const effectiveParams = { ...this.baseParams };
        
        for (const [paramName, mapping] of Object.entries(parameterMappings)) {
            if (mapping.additive) {
                effectiveParams[paramName] = this.baseParams[paramName] + mapping.factor;
            } else if (mapping.bipolar) {
                effectiveParams[paramName] = this.baseParams[paramName] + mapping.factor;
            } else {
                effectiveParams[paramName] = mapping.factor;
            }
            
            // Apply parameter limits from visuals.json
            const visualsConfig = this.jsonConfigSystem.getConfig('visuals');
            if (visualsConfig && visualsConfig.parameters && visualsConfig.parameters[paramName]) {
                const paramConfig = visualsConfig.parameters[paramName];
                effectiveParams[paramName] = Math.max(paramConfig.min, 
                    Math.min(paramConfig.max, effectiveParams[paramName]));
            }
        }
        
        // Add user interaction specific parameters
        effectiveParams.movementLevel = this.userEventReactive.analysisData.movementSmooth;
        effectiveParams.velocityLevel = this.userEventReactive.analysisData.velocitySmooth;
        effectiveParams.precisionLevel = this.userEventReactive.analysisData.precisionSmooth;
        effectiveParams.interactionEnergy = this.userEventReactive.currentState.interactionEnergy;
        effectiveParams.rhythmStrength = this.userEventReactive.rhythmDetection.rhythmStrength;
        effectiveParams.mousePos = [
            this.userEventReactive.currentState.mousePos.x,
            this.userEventReactive.currentState.mousePos.y
        ];
        
        return effectiveParams;
    }
    
    /**
     * Update all visualizers with reactive parameters
     */
    updateVisualizersWithReactiveParams(effectiveParams, interactionData, currentState) {
        for (const [id, visualizer] of this.visualizers) {
            if (visualizer && typeof visualizer.updateParams === 'function') {
                visualizer.updateParams(effectiveParams);
            }
        }
        
        // Update HomeMaster with new parameter values for external API access
        for (const [paramName, value] of Object.entries(effectiveParams)) {
            if (this.homeMaster.hasParameter(paramName)) {
                this.homeMaster.setParameter(paramName, value, 'reactive-system');
            }
        }
    }
    
    /**
     * Update UI elements with visual feedback (like audio system slider pulsing)
     */
    updateUIWithInteractionFeedback(interactionData, parameterMappings) {
        // Add visual effects to UI elements based on user interactions
        // This could pulse parameter displays, highlight active controls, etc.
        
        // Update interaction energy indicator
        const energyIndicator = document.querySelector('.interaction-energy-indicator');
        if (energyIndicator) {
            energyIndicator.style.opacity = interactionData.interactionEnergy || 0;
            energyIndicator.style.transform = `scale(${1 + (interactionData.interactionEnergy || 0) * 0.2})`;
        }
        
        // Update rhythm indicator
        const rhythmIndicator = document.querySelector('.rhythm-indicator');
        if (rhythmIndicator) {
            const rhythmStrength = this.userEventReactive.rhythmDetection.rhythmStrength;
            rhythmIndicator.style.opacity = rhythmStrength;
            if (rhythmStrength > 0.7) {
                rhythmIndicator.classList.add('rhythmic');
            } else {
                rhythmIndicator.classList.remove('rhythmic');
            }
        }
        
        // Log interaction data occasionally for debugging
        if (Math.random() < 0.01) {
            const interactionInfo = interactionData.interaction.frequency > 0 
                ? `Pattern: ${interactionData.interaction.type} (${interactionData.interaction.frequency} events/sec)` 
                : 'No interaction pattern';
                
            console.log(`🎮 Reactive: Movement=${interactionData.movementSmooth.toFixed(2)} Velocity=${interactionData.velocitySmooth.toFixed(2)} Precision=${interactionData.precisionSmooth.toFixed(2)} | ${interactionInfo}`);
        }
    }
    
    /**
     * Stop the reactive update loop
     */
    stopReactiveUpdateLoop() {
        this.isReactiveUpdateRunning = false;
        console.log('⏹️ Reactive update loop stopped');
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
     * Execute smooth geometry transition with color and modifier changes
     */
    async executeGeometryTransition(fromGeometry, toGeometry, targetState) {
        console.log(`🔮 GEOMETRY TRANSITION: ${fromGeometry} → ${toGeometry}`);
        
        // PHASE 1: DENSITY COLLAPSE (cards submerse)
        await this.executeTransitionPhase('density_collapse', 400);
        
        // PHASE 2: COLOR FADE TO BLACK
        await this.executeTransitionPhase('color_fade_to_black', 400);
        
        // PHASE 3: UNIFIED GEOMETRY SHIFT (same geometry, different colors/behaviors)
        this.ecosystemEngine.changeGeometry(toGeometry);
        this.updateGlobalColorScheme(targetState);
        this.updateGlobalModifiers(targetState);
        
        // PHASE 4: COLOR BLOOM (new colors emerge)
        await this.executeTransitionPhase('color_bloom', 400);
        
        // PHASE 5: DENSITY EXPANSION (cards emerge)
        await this.executeTransitionPhase('density_expansion', 400);
    }
    
    /**
     * Execute individual transition phase
     */
    async executeTransitionPhase(phaseType, duration) {
        const cards = document.querySelectorAll('.blog-card');
        
        switch (phaseType) {
            case 'density_collapse':
                cards.forEach((card, index) => {
                    const delay = index * 50;
                    setTimeout(() => {
                        card.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
                        card.style.transform = 'scale(0.8) translateZ(-50px)';
                        card.style.opacity = '0.3';
                    }, delay);
                });
                break;
                
            case 'color_fade_to_black':
                document.body.style.transition = `filter ${duration}ms ease`;
                document.body.style.filter = 'brightness(0.2) contrast(0.5) saturate(0)';
                break;
                
            case 'color_bloom':
                document.body.style.transition = `filter ${duration}ms ease`;
                document.body.style.filter = 'brightness(1.2) contrast(1.1) saturate(1.3)';
                setTimeout(() => {
                    document.body.style.filter = '';
                    document.body.style.transition = '';
                }, duration);
                break;
                
            case 'density_expansion':
                cards.forEach((card, index) => {
                    const delay = index * 50;
                    setTimeout(() => {
                        card.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
                        card.style.transform = 'scale(1.0) translateZ(0px)';
                        card.style.opacity = '1.0';
                    }, delay);
                });
                break;
        }
        
        return new Promise(resolve => setTimeout(resolve, duration + 200));
    }
    
    /**
     * Update all visualizers to new geometry
     */
    updateAllVisualizersGeometry(newGeometry) {
        console.log(`🔄 Updating all visualizers to geometry ${newGeometry}`);
        
        this.visualizers.forEach((visualizer, id) => {
            if (visualizer.setParameter) {
                // Enhanced core visualizers
                visualizer.setParameter('geometry', newGeometry);
                
                // Set theme based on geometry
                const themes = ['hypercube', 'tetrahedron', 'sphere', 'torus', 'kleinBottle', 'fractal', 'wave', 'crystal'];
                const theme = themes[newGeometry] || 'hypercube';
                if (visualizer.setTheme) {
                    visualizer.setTheme(theme);
                }
            } else if (visualizer.updateParameters) {
                // Legacy visualizers
                visualizer.updateParameters({ geometry: newGeometry });
            }
        });
    }
    
    /**
     * Update global color scheme based on state
     */
    updateGlobalColorScheme(state) {
        const colorSchemes = {
            home: { primary: '#ff00ff', secondary: '#00ffff', accent: '#ffff00' },
            tech: { primary: '#00ffff', secondary: '#0099ff', accent: '#66ff99' },
            media: { primary: '#ffff00', secondary: '#ff6600', accent: '#ff0099' },
            innovation: { primary: '#00ff00', secondary: '#66ff00', accent: '#00ff99' },
            research: { primary: '#9900ff', secondary: '#ff0066', accent: '#ff9900' }
        };
        
        const scheme = colorSchemes[state] || colorSchemes.home;
        
        // Update CSS custom properties
        document.documentElement.style.setProperty('--primary-color', scheme.primary);
        document.documentElement.style.setProperty('--secondary-color', scheme.secondary);
        document.documentElement.style.setProperty('--accent-color', scheme.accent);
        
        console.log(`🎨 Color scheme updated for ${state}:`, scheme);
    }
    
    /**
     * Update global modifiers based on state
     */
    updateGlobalModifiers(state) {
        const modifierSets = {
            home: { gridDensity: 12.0, morphFactor: 0.5, rotationSpeed: 0.5, glitchIntensity: 0.3 },
            tech: { gridDensity: 8.0, morphFactor: 0.3, rotationSpeed: 0.3, glitchIntensity: 0.1 },
            media: { gridDensity: 15.0, morphFactor: 0.7, rotationSpeed: 0.4, glitchIntensity: 0.2 },
            innovation: { gridDensity: 10.0, morphFactor: 0.6, rotationSpeed: 0.6, glitchIntensity: 0.4 },
            research: { gridDensity: 20.0, morphFactor: 0.9, rotationSpeed: 0.2, glitchIntensity: 0.6 }
        };
        
        const modifiers = modifierSets[state] || modifierSets.home;
        
        // Update all visualizers with new modifiers
        this.visualizers.forEach((visualizer) => {
            if (visualizer.setParameter) {
                Object.entries(modifiers).forEach(([key, value]) => {
                    visualizer.setParameter(key, value);
                });
            }
        });
        
        console.log(`⚙️ Global modifiers updated for ${state}:`, modifiers);
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