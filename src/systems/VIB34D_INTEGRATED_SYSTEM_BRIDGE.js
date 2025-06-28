
import { VIB34DMoireRGBEngine } from './VIB34D_MOIRE_RGB_SYSTEM.js';
import { VIB3ChromaticIntegration } from './VIB34D_INTEGRATED_CHROMATIC.js';
import { VIB34DEditorDashboard } from '../core/VIB34DEditorDashboard.js';

class VIB34DIntegratedSystemBridge {
    constructor() {
        this.isInitialized = false;
        this.elements = new Map();
        this.interactionEngine = null;
        this.moireEngine = null;
        this.chromaticIntegration = null;
        this.dashboard = null;
        this.relationships = new Map();
        
        // Master state tracking
        this.masterState = {
            globalEnergy: 0.0,
            lastInteraction: Date.now(),
            activeElements: new Set(),
            relationshipChains: []
        };
        
        // Configuration
        this.config = {
            // Relationship processing
            maxRelationshipDepth: 3,
            relationshipDecay: 0.9,
            energyThreshold: 0.1,
            
            // Interaction mapping
            interactionMappings: {
                scroll: 'u_audioBass',    // Phase 5 mapping
                click: 'u_audioMid',      // Phase 5 mapping  
                mouse: 'u_audioHigh'      // Phase 5 mapping
            },
            
            // Moiré integration
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
     * Initialize the complete integrated system
     */
    async initialize() {
        console.log('🚀 Initializing VIB34D Integrated System...');
        
        try {
            // Initialize Moiré RGB Engine
            this.moireEngine = new VIB34DMoireRGBEngine();
            this.moireEngine.initialize();

            // Initialize Chromatic Integration
            this.chromaticIntegration = new VIB3ChromaticIntegration(window.vib34dSystem, this);

            // Initialize Editor Dashboard
            this.dashboard = new VIB34DEditorDashboard('vib34d-editor-container');
            this.dashboard.initialize(window.vib34dSystem, this, this.chromaticIntegration);
            this.dashboard.show();
            
            this.isInitialized = true;
            console.log('✅ VIB34D Integrated System fully operational');
            
        } catch (error) {
            console.error('❌ Failed to initialize integrated system:', error);
            throw error;
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        VIB34DIntegratedSystemBridge
    };
}

// Export to window for browser use
if (typeof window !== 'undefined') {
    window.VIB34DIntegratedSystemBridge = VIB34DIntegratedSystemBridge;
    console.log('🌉 VIB34D Integrated System Bridge loaded and exported to window');
}
