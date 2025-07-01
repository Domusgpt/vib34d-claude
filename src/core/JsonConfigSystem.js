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
            stateMap: null, // Might be deprecated or simplified
            layoutContent: null, // Might be deprecated or simplified
            sections: null // New configuration for sections
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
            // Define all configurations to load, including the new sections.json
            const configPromises = {
                visuals: this.loadConfig('visuals'),
                behavior: this.loadConfig('behavior'),
                stateMap: this.loadConfig('state-map'), // Keep for now, may be refactored
                layoutContent: this.loadConfig('layout-content'), // Keep for now, may be refactored
                sections: this.loadConfig('sections') // Load the new sections config
            };

            const loadedConfigs = {};
            for (const key in configPromises) {
                loadedConfigs[key] = await configPromises[key];
            }

            this.configs = loadedConfigs;
            
            this.isLoaded = true;
            console.log('✅ All configurations loaded successfully:', this.configs);
            
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
                // For optional configs like state-map or layout-content if they become deprecated,
                // we might not want to throw an error. For sections.json, it's essential.
                if (configName === 'sections' || configName === 'visuals' || configName === 'behavior') {
                     throw new Error(`HTTP ${response.status} ${response.statusText} for essential config ${configName}.json`);
                } else {
                    console.warn(`⚠️ Optional config ${configName}.json not found or failed to load (HTTP ${response.status}). Proceeding without it.`);
                    return null; // Return null for optional configs that fail to load
                }
            }
            
            const config = await response.json();
            console.log(`✅ Loaded ${configName}.json`);
            
            return this.validateConfig(configName, config);
            
        } catch (error) {
            // Handle error differently for essential vs optional configs
            if (configName === 'sections' || configName === 'visuals' || configName === 'behavior') {
                console.error(`❌ Failed to load essential config ${configName}.json:`, error);
                throw error; // Re-throw for essential configs
            } else {
                console.warn(`⚠️ Error loading optional config ${configName}.json: ${error.message}. Proceeding without it.`);
                return null; // Return null for optional configs on other errors
            }
        }
    }
    
    /**
     * Validate configuration structure
     * @param {string} configName - Name of the configuration
     * @param {Object} config - Configuration object to validate
     * @returns {Object} Validated configuration
     */
    validateConfig(configName, config) {
        if (config === null) return null; // Skip validation if config failed to load and was optional

        switch (configName) {
            case 'visuals':
                return this.validateVisuals(config);
            case 'behavior':
                return this.validateBehavior(config);
            case 'state-map':
                return this.validateStateMap(config); // Existing validation
            case 'layout-content':
                return this.validateLayoutContent(config); // Existing validation
            case 'sections':
                return this.validateSections(config); // New validation method
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
    
    validateStateMap(config) { // Keep existing, might be used by VIB3HomeMaster initially
        const required = ['states', 'navigation', 'initialState'];
        for (const field of required) {
            if (!config[field]) {
                // This might become a warning if state-map is fully deprecated
                console.warn(`state-map.json missing field: ${field}. This config might be deprecated.`);
                // throw new Error(`state-map.json missing required field: ${field}`);
            }
        }
        return config;
    }
    
    validateLayoutContent(config) { // Keep existing, might be used by VIB3HomeMaster initially
        const required = ['cards', 'components'];
        for (const field of required) {
            if (!config[field]) {
                 // This might become a warning if layout-content is fully deprecated
                console.warn(`layout-content.json missing field: ${field}. This config might be deprecated.`);
                // throw new Error(`layout-content.json missing required field: ${field}`);
            }
        }
        return config;
    }

    /**
     * Validates the structure of sections.json.
     * @param {Object} config - The sections configuration object.
     * @returns {Object} Validated configuration.
     */
    validateSections(config) {
        if (!config.sections || typeof config.sections !== 'object') {
            throw new Error('sections.json missing or invalid "sections" object.');
        }
        if (!config.initialSection || typeof config.initialSection !== 'string') {
            throw new Error('sections.json missing or invalid "initialSection" string.');
        }
        if (!config.sectionOrder || !Array.isArray(config.sectionOrder)) {
            throw new Error('sections.json missing or invalid "sectionOrder" array.');
        }
        if (!config.sections[config.initialSection]) {
            throw new Error(`sections.json: initialSection "${config.initialSection}" not found in sections object.`);
        }
        for (const sectionId of config.sectionOrder) {
            if (!config.sections[sectionId]) {
                throw new Error(`sections.json: sectionOrder item "${sectionId}" not found in sections object.`);
            }
            // Add more detailed validation for each section's structure if needed
            const section = config.sections[sectionId];
            if (!section.id || !section.content || !section.style || !section.transitions) {
                throw new Error(`Section "${sectionId}" is missing required fields (id, content, style, transitions).`);
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