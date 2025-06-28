/**
 * @file VIB34D_INTEGRATED_SYSTEM_BRIDGE.js
 * @description Connects the Editor Dashboard, Interaction System, and Moiré RGB System, creating a relational, reactive UI system where everything responds to everything.
 */

import { VIB34DMoireRGBEngine } from './VIB34D_MOIRE_RGB_SYSTEM.js';
import { VIB3ChromaticIntegration } from './VIB34D_INTEGRATED_CHROMATIC.js';
import { VIB34DEditorDashboard } from '../core/VIB34DEditorDashboard.js';
import { VIB34DMorphingBlogSystem } from '../core/VIB34DMorphingBlogSystem.js';
import { VIB3SystemController } from '../core/VIB3SystemController.js';
import { InteractionCoordinator } from '../interactions/InteractionCoordinator.js';

/**
 * @class VIB34DIntegratedSystemBridge
 * @description The central bridge orchestrating communication and data flow between all major VIB34D subsystems.
 */
class VIB34DIntegratedSystemBridge {
    /**
     * @constructor
     */
    constructor() {
        /** @type {boolean} */
        this.isInitialized = false;
        /** @type {Map<string, object>} */
        this.elements = new Map();
        /** @type {object} */
        this.interactionEngine = null;
        /** @type {VIB34DMoireRGBEngine} */
        this.moireEngine = null;
        /** @type {VIB3ChromaticIntegration} */
        this.chromaticIntegration = null;
        /** @type {VIB34DEditorDashboard} */
        this.dashboard = null;
        /** @type {Map<string, object>} */
        this.relationships = new Map();
        
        /** @type {object} */
        this.masterState = {
            globalEnergy: 0.0,
            lastInteraction: Date.now(),
            activeElements: new Set(),
            relationshipChains: []
        };
        
        /** @type {object} */
        this.config = {
            maxRelationshipDepth: 3,
            relationshipDecay: 0.9,
            energyThreshold: 0.1,
            interactionMappings: {
                scroll: 'u_audioBass',
                click: 'u_audioMid',
                mouse: 'u_audioHigh'
            },
            moireEffectTypes: {
                button: 'cardBorder',
                card: 'cardBorder', 
                nav: 'gridOverlay',
                header: 'waveDistortion',
                background: 'fullMoire',
                section: 'subtleMoire',
                overlay: 'intenseMoire',
                accent: 'pulseMoire'
            }
        };
        
        console.log('🌉 VIB34D Integrated System Bridge initialized');
    }
    
    /**
     * @method initialize
     * @description Initializes all major VIB34D subsystems and sets up their interconnections.
     */
    async initialize() {
        console.log('🚀 Initializing VIB34D Integrated System...');
        
        try {
            // Initialize core systems
            this.systemController = new VIB3SystemController();
            this.interactionCoordinator = new InteractionCoordinator({ systemController: this.systemController });
            
            // Initialize Morphing Blog System
            this.morphingBlogSystem = new VIB34DMorphingBlogSystem();

            // Initialize Moiré RGB Engine
            // this.moireEngine = new VIB34DMoireRGBEngine();
            // this.moireEngine.initialize();

            // Initialize Chromatic Integration
            // this.chromaticIntegration = new VIB3ChromaticIntegration(this.morphingBlogSystem, this);

            // Initialize Editor Dashboard
            this.dashboard = new VIB34DEditorDashboard('vib34d-editor-container');
            this.dashboard.initialize(this.morphingBlogSystem, this, this.chromaticIntegration);
            this.dashboard.show();
            
            this.isInitialized = true;
            console.log('✅ VIB34D Integrated System fully operational');
            
        } catch (error) {
            console.error('❌ Failed to initialize integrated system:', error);
            throw error;
        }
    }
}

export { VIB34DIntegratedSystemBridge };