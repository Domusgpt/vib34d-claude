/**
 * @file JsonConfigSystem.js
 * @description Core configuration loader for the VIB34D system
 * Loads and validates all JSON configuration files
 */

class JsonConfigSystem {
    constructor() {
        this.configs = {
            visuals: null,
            behavior: null,
            stateMap: null,
            layoutContent: null
        };
        
        this.isLoaded = false;
        this.loadPromise = null;
        
        console.log('🔧 JsonConfigSystem initialized');
    }
    
    /**
     * Load all configuration files
     * @returns {Promise<Object>} All loaded configurations
     */
    async loadAll() {
        if (this.loadPromise) {
            return this.loadPromise;
        }
        
        this.loadPromise = this._loadAllConfigs();
        return this.loadPromise;
    }
    
    async _loadAllConfigs() {
        console.log('📁 Loading all JSON configurations...');
        
        try {
            const [visuals, behavior, stateMap, layoutContent] = await Promise.all([
                this.loadConfig('visuals'),
                this.loadConfig('behavior'), 
                this.loadConfig('state-map'),
                this.loadConfig('layout-content')
            ]);
            
            this.configs = {
                visuals,
                behavior,
                stateMap,
                layoutContent
            };
            
            this.isLoaded = true;
            console.log('✅ All configurations loaded successfully');
            
            // Emit config loaded event
            this.emit('configLoaded', this.configs);
            
            return this.configs;
            
        } catch (error) {
            console.error('❌ Failed to load configurations:', error);
            throw error;
        }
    }
    
    /**
     * Load a specific configuration file
     * @param {string} configName - Name of config file (without .json)
     * @returns {Promise<Object>} Parsed configuration
     */
    async loadConfig(configName) {
        const url = `config/${configName}.json`;
        console.log(`📄 Loading ${configName}.json...`);
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const config = await response.json();
            console.log(`✅ Loaded ${configName}.json`);
            
            return this.validateConfig(configName, config);
            
        } catch (error) {
            console.error(`❌ Failed to load ${configName}.json:`, error);
            throw error;
        }
    }
    
    /**
     * Validate configuration structure
     * @param {string} configName - Name of the configuration
     * @param {Object} config - Configuration object to validate
     * @returns {Object} Validated configuration
     */
    validateConfig(configName, config) {
        switch (configName) {
            case 'visuals':
                return this.validateVisuals(config);
            case 'behavior':
                return this.validateBehavior(config);
            case 'state-map':
                return this.validateStateMap(config);
            case 'layout-content':
                return this.validateLayoutContent(config);
            default:
                return config;
        }
    }
    
    validateVisuals(config) {
        const required = ['geometries', 'parameters', 'themes'];
        for (const field of required) {
            if (!config[field]) {
                throw new Error(`visuals.json missing required field: ${field}`);
            }
        }
        return config;
    }
    
    validateBehavior(config) {
        if (!config.interactionBlueprints) {
            throw new Error('behavior.json missing interactionBlueprints');
        }
        return config;
    }
    
    validateStateMap(config) {
        const required = ['states', 'navigation', 'initialState'];
        for (const field of required) {
            if (!config[field]) {
                throw new Error(`state-map.json missing required field: ${field}`);
            }
        }
        return config;
    }
    
    validateLayoutContent(config) {
        const required = ['cards', 'components'];
        for (const field of required) {
            if (!config[field]) {
                throw new Error(`layout-content.json missing required field: ${field}`);
            }
        }
        return config;
    }
    
    /**
     * Get a specific configuration
     * @param {string} configName - Name of configuration to get
     * @returns {Object|null} Configuration object or null if not loaded
     */
    getConfig(configName) {
        return this.configs[configName] || null;
    }
    
    /**
     * Get all configurations
     * @returns {Object} All configuration objects
     */
    getAllConfigs() {
        return this.configs;
    }
    
    /**
     * Hot reload a specific configuration
     * @param {string} configName - Name of config to reload
     * @returns {Promise<Object>} Reloaded configuration
     */
    async reloadConfig(configName) {
        console.log(`🔄 Hot reloading ${configName}.json...`);
        
        try {
            const newConfig = await this.loadConfig(configName);
            this.configs[configName] = newConfig;
            
            // Emit config updated event
            this.emit('configUpdated', { configName, config: newConfig });
            
            return newConfig;
            
        } catch (error) {
            console.error(`❌ Failed to reload ${configName}:`, error);
            throw error;
        }
    }
    
    /**
     * Simple event emitter
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent(`vib34d:${event}`, { detail: data }));
        }
    }
}

export { JsonConfigSystem };