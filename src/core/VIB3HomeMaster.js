
/**
 * @file VIB3HomeMaster.js
 * @description Central parameter authority for the VIB34D system
 * Single source of truth for all visual parameters, loaded from JSON configurations
 */

class VIB3HomeMaster {
    constructor(jsonConfigSystem) {
        this.jsonConfigSystem = jsonConfigSystem;
        this.parameters = new Map();
        this.parameterRanges = new Map();
        this.currentState = 'home';
        this.visualizers = new Set();
        this.reactivityBridge = null;
        
        // Parameter change listeners
        this.listeners = new Map();
        
        console.log('🏠 VIB3HomeMaster initialized as parameter authority');
    }

    /**
     * Initialize parameters from JSON configuration
     */
    async initialize() {
        console.log('🔧 Initializing VIB3HomeMaster with JSON configuration...');
        
        const configs = await this.jsonConfigSystem.loadAll();
        const visuals = configs.visuals;
        
        // Load all parameters with their defaults and ranges
        for (const [paramName, paramConfig] of Object.entries(visuals.parameters)) {
            this.parameters.set(paramName, paramConfig.default);
            this.parameterRanges.set(paramName, {
                min: paramConfig.min,
                max: paramConfig.max,
                default: paramConfig.default,
                description: paramConfig.description
            });
        }
        
        // Set initial state
        const stateMap = configs.stateMap;
        this.currentState = stateMap.initialState;
        
        console.log(`✅ VIB3HomeMaster loaded ${this.parameters.size} parameters from JSON`);
        console.log(`📍 Initial state: ${this.currentState}`);
    }

    /**
     * Set a parameter value with validation and range clamping
     * @param {string} name - Parameter name
     * @param {number} value - Parameter value 
     * @param {string} source - Source of the change (e.g., 'user', 'agentAPI', 'interaction')
     */
    async setParameter(name, value, source = 'unknown') {
        // Validate parameter exists
        if (!this.parameters.has(name)) {
            console.warn(`⚠️ VIB3HomeMaster: Unknown parameter '${name}'`);
            return false;
        }
        
        // Clamp to valid range
        const range = this.parameterRanges.get(name);
        if (range && typeof value === 'number') {
            if (range.min !== undefined && range.max !== undefined) {
                value = Math.max(range.min, Math.min(range.max, value));
            }
        }
        
        const oldValue = this.parameters.get(name);
        this.parameters.set(name, value);
        
        console.log(`🎛️ VIB3HomeMaster: ${name} = ${value} (from ${source})`);
        
        // Notify all listeners
        this.notifyParameterChange(name, value, oldValue, source);
        
        // Update all registered visualizers
        this.updateVisualizers();
        
        return true;
    }

    /**
     * Get current parameter value
     * @param {string} name - Parameter name
     * @returns {*} Parameter value or undefined
     */
    getParameter(name) {
        return this.parameters.get(name);
    }

    /**
     * Get all current parameters as object
     * @returns {Object} All parameters
     */
    getAllParameters() {
        return Object.fromEntries(this.parameters);
    }

    /**
     * Get parameter range information
     * @param {string} name - Parameter name
     * @returns {Object} Range info with min, max, default, description
     */
    getParameterRange(name) {
        return this.parameterRanges.get(name);
    }

    /**
     * Get all parameter ranges
     * @returns {Object} All parameter ranges
     */
    getAllParameterRanges() {
        return Object.fromEntries(this.parameterRanges);
    }

    /**
     * Set current application state
     * @param {string} stateName - Name of the state to set
     */
    async setState(stateName) {
        const stateMap = this.jsonConfigSystem.getConfig('stateMap');
        if (!stateMap || !stateMap.states[stateName]) {
            console.error(`❌ VIB3HomeMaster: Invalid state '${stateName}'`);
            return false;
        }
        
        const oldState = this.currentState;
        this.currentState = stateName;
        
        console.log(`🌐 VIB3HomeMaster: State changed ${oldState} → ${stateName}`);
        
        // Update layout display
        const layoutDisplay = document.getElementById('layout-display');
        if (layoutDisplay) {
            layoutDisplay.textContent = stateName.toUpperCase();
        }
        
        // Notify state change
        this.notifyStateChange(stateName, oldState);
        
        return true;
    }

    /**
     * Get current application state
     * @returns {string} Current state name
     */
    getCurrentState() {
        return this.currentState;
    }

    /**
     * Register a visualizer to receive parameter updates
     * @param {Object} visualizer - Visualizer instance with updateParams method
     */
    registerVisualizer(visualizer) {
        this.visualizers.add(visualizer);
        console.log(`📺 VIB3HomeMaster: Registered visualizer (${this.visualizers.size} total)`);
        
        // Send current parameters to new visualizer
        if (visualizer.updateParams) {
            visualizer.updateParams(this.getAllParameters());
        }
    }

    /**
     * Unregister a visualizer
     * @param {Object} visualizer - Visualizer instance to remove
     */
    unregisterVisualizer(visualizer) {
        this.visualizers.delete(visualizer);
        console.log(`📺 VIB3HomeMaster: Unregistered visualizer (${this.visualizers.size} remaining)`);
    }

    /**
     * Update all registered visualizers with current parameters
     */
    updateVisualizers() {
        const params = this.getAllParameters();
        
        for (const visualizer of this.visualizers) {
            if (visualizer.updateParams) {
                visualizer.updateParams(params);
            }
        }
    }

    /**
     * Set the reactivity bridge for CSS synchronization
     * @param {Object} bridge - UnifiedReactivityBridge instance
     */
    setReactivityBridge(bridge) {
        this.reactivityBridge = bridge;
        console.log('🌉 VIB3HomeMaster: ReactivityBridge connected');
    }

    /**
     * Add parameter change listener
     * @param {string} paramName - Parameter to listen for (or '*' for all)
     * @param {Function} callback - Callback function (paramName, newValue, oldValue, source) => void
     */
    addParameterListener(paramName, callback) {
        if (!this.listeners.has(paramName)) {
            this.listeners.set(paramName, new Set());
        }
        this.listeners.get(paramName).add(callback);
    }

    /**
     * Remove parameter change listener
     * @param {string} paramName - Parameter name
     * @param {Function} callback - Callback function to remove
     */
    removeParameterListener(paramName, callback) {
        const paramListeners = this.listeners.get(paramName);
        if (paramListeners) {
            paramListeners.delete(callback);
        }
    }

    /**
     * Notify all listeners of parameter change
     * @private
     */
    notifyParameterChange(paramName, newValue, oldValue, source) {
        // Notify specific parameter listeners
        const paramListeners = this.listeners.get(paramName);
        if (paramListeners) {
            for (const callback of paramListeners) {
                try {
                    callback(paramName, newValue, oldValue, source);
                } catch (error) {
                    console.error('❌ VIB3HomeMaster: Listener error:', error);
                }
            }
        }
        
        // Notify global listeners
        const globalListeners = this.listeners.get('*');
        if (globalListeners) {
            for (const callback of globalListeners) {
                try {
                    callback(paramName, newValue, oldValue, source);
                } catch (error) {
                    console.error('❌ VIB3HomeMaster: Global listener error:', error);
                }
            }
        }
        
        // Update reactivity bridge for CSS sync
        if (this.reactivityBridge) {
            this.reactivityBridge.updateParameter(paramName, newValue);
        }
        
        // Update parameter display in UI
        this.updateParameterDisplay(paramName, newValue);
    }

    /**
     * Notify state change
     * @private
     */
    notifyStateChange(newState, oldState) {
        // Emit state change event
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('vib34d:stateChange', {
                detail: { newState, oldState, homeMaster: this }
            }));
        }
    }

    async start() {
        await this.initialize();
        console.log('▶️ VIB3HomeMaster started with JSON configuration');
    }

    async stop() {
        this.visualizers.clear();
        this.listeners.clear();
        console.log('⏸️ VIB3HomeMaster stopped');
    }

    /**
     * Update parameter display in the UI
     * @param {string} paramName - Parameter name
     * @param {*} value - Parameter value
     */
    updateParameterDisplay(paramName, value) {
        const displayMappings = {
            'u_morphFactor': 'morph-display',
            'u_dimension': 'dimension-display', 
            'u_glitchIntensity': 'glitch-display',
            'u_rotationSpeed': 'rotation-display',
            'u_gridDensity': 'grid-display',
            'u_interactionIntensity': 'interaction-display',
            'geometry': 'geometry-display'
        };
        
        const displayId = displayMappings[paramName];
        if (!displayId) return;
        
        const displayElement = document.getElementById(displayId);
        if (!displayElement) return;
        
        let displayValue = value;
        
        // Format values appropriately
        if (paramName === 'geometry') {
            const geometryNames = ['hypercube', 'tetrahedron', 'sphere', 'torus', 'wave'];
            displayValue = geometryNames[Math.floor(value)] || 'unknown';
        } else if (typeof value === 'number') {
            displayValue = value.toFixed(2);
        }
        
        displayElement.textContent = displayValue;
    }

    async destroy() {
        await this.stop();
        console.log('🗑️ VIB3HomeMaster destroyed');
    }
}

export { VIB3HomeMaster };
