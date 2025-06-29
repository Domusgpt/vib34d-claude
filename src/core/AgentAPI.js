/**
 * @file AgentAPI.js
 * @description External API for agent-based control of the VIB34D system
 * Provides methods for external scripts and coding agents to control the system
 */

class AgentAPI {
    constructor(systemController, homeMaster, jsonConfigSystem) {
        this.systemController = systemController;
        this.homeMaster = homeMaster;
        this.jsonConfigSystem = jsonConfigSystem;
        
        // Make globally available
        if (typeof window !== 'undefined') {
            window.agentAPI = this;
        }
        
        console.log('🤖 AgentAPI initialized and exposed globally');
    }
    
    /**
     * Get complete current state of the application
     * @returns {Object} Complete application state
     */
    getState() {
        return {
            currentState: this.homeMaster.getCurrentState(),
            parameters: this.homeMaster.getAllParameters(),
            configs: this.jsonConfigSystem.getAllConfigs(),
            timestamp: Date.now()
        };
    }
    
    /**
     * Navigate to a specific application state
     * @param {string} stateId - ID of the state to navigate to
     * @returns {Promise<boolean>} Success status
     */
    async navigateTo(stateId) {
        console.log(`🧭 Agent API: Navigating to state '${stateId}'`);
        
        try {
            const stateMap = this.jsonConfigSystem.getConfig('stateMap');
            if (!stateMap || !stateMap.states[stateId]) {
                throw new Error(`State '${stateId}' not found in state-map.json`);
            }
            
            await this.systemController.navigateToState(stateId);
            return true;
            
        } catch (error) {
            console.error(`❌ Agent API: Failed to navigate to '${stateId}':`, error);
            return false;
        }
    }
    
    /**
     * Update a configuration file with new data
     * @param {string} configName - Name of config file ('visuals', 'behavior', etc.)
     * @param {Object} newConfig - New configuration data
     * @returns {Promise<boolean>} Success status
     */
    async updateConfig(configName, newConfig) {
        console.log(`📝 Agent API: Updating ${configName}.json`);
        
        try {
            // Validate the new config
            const validatedConfig = this.jsonConfigSystem.validateConfig(configName, newConfig);
            
            // Update the config system
            this.jsonConfigSystem.configs[configName] = validatedConfig;
            
            // Trigger system update
            await this.systemController.handleConfigUpdate(configName, validatedConfig);
            
            console.log(`✅ Agent API: Successfully updated ${configName}.json`);
            return true;
            
        } catch (error) {
            console.error(`❌ Agent API: Failed to update ${configName}:`, error);
            return false;
        }
    }
    
    /**
     * Set a master parameter that affects multiple system parameters
     * @param {string} masterParam - Name of master parameter
     * @param {number} value - New value for the parameter
     * @returns {boolean} Success status
     */
    setMasterParameter(masterParam, value) {
        console.log(`🎛️ Agent API: Setting master parameter '${masterParam}' to ${value}`);
        
        try {
            const behavior = this.jsonConfigSystem.getConfig('behavior');
            const masterMaps = behavior?.masterParameterMaps;
            
            if (!masterMaps || !masterMaps[masterParam]) {
                console.warn(`⚠️ Master parameter '${masterParam}' not found in behavior.json`);
                return false;
            }
            
            // Apply the master parameter mapping
            const mapping = masterMaps[masterParam];
            for (const [param, operation] of Object.entries(mapping)) {
                const newValue = this.applyOperation(
                    this.homeMaster.getParameter(param) || 0,
                    operation,
                    value
                );
                
                this.homeMaster.setParameter(param, newValue, 'agentAPI');
            }
            
            return true;
            
        } catch (error) {
            console.error(`❌ Agent API: Failed to set master parameter '${masterParam}':`, error);
            return false;
        }
    }
    
    /**
     * Set a specific system parameter
     * @param {string} param - Parameter name (e.g., 'u_gridDensity')
     * @param {number} value - New parameter value
     * @returns {boolean} Success status
     */
    setParameter(param, value) {
        console.log(`🎚️ Agent API: Setting parameter '${param}' to ${value}`);
        
        try {
            this.homeMaster.setParameter(param, value, 'agentAPI');
            return true;
            
        } catch (error) {
            console.error(`❌ Agent API: Failed to set parameter '${param}':`, error);
            return false;
        }
    }
    
    /**
     * Get current value of a parameter
     * @param {string} param - Parameter name
     * @returns {number|null} Current parameter value
     */
    getParameter(param) {
        return this.homeMaster.getParameter(param);
    }
    
    /**
     * Switch to a specific geometry
     * @param {string|number} geometry - Geometry name or index
     * @returns {boolean} Success status
     */
    setGeometry(geometry) {
        console.log(`🔺 Agent API: Setting geometry to '${geometry}'`);
        
        try {
            const visuals = this.jsonConfigSystem.getConfig('visuals');
            let geometryIndex;
            
            if (typeof geometry === 'string') {
                const geom = visuals.geometries.find(g => g.name === geometry);
                if (!geom) {
                    throw new Error(`Geometry '${geometry}' not found`);
                }
                geometryIndex = geom.id;
            } else {
                geometryIndex = geometry;
            }
            
            this.homeMaster.setParameter('geometry', geometryIndex, 'agentAPI');
            return true;
            
        } catch (error) {
            console.error(`❌ Agent API: Failed to set geometry '${geometry}':`, error);
            return false;
        }
    }
    
    /**
     * Export complete system state as downloadable JSON
     * @returns {Object} Complete exportable system state
     */
    exportSystemState() {
        console.log('📦 Agent API: Exporting system state');
        
        const exportData = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            state: this.getState(),
            configs: this.jsonConfigSystem.getAllConfigs()
        };
        
        // Create downloadable blob
        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `vib34d-export-${Date.now()}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        
        return exportData;
    }
    
    /**
     * Trigger a specific interaction blueprint
     * @param {string} blueprintName - Name of interaction blueprint
     * @param {string} target - Target selector for the interaction
     * @returns {boolean} Success status
     */
    triggerInteraction(blueprintName, target = 'global') {
        console.log(`⚡ Agent API: Triggering interaction '${blueprintName}' on '${target}'`);
        
        try {
            const behavior = this.jsonConfigSystem.getConfig('behavior');
            const blueprint = behavior?.interactionBlueprints?.[blueprintName];
            
            if (!blueprint) {
                throw new Error(`Interaction blueprint '${blueprintName}' not found`);
            }
            
            // Execute the interaction through the system controller
            this.systemController.executeInteraction(blueprint, target);
            return true;
            
        } catch (error) {
            console.error(`❌ Agent API: Failed to trigger interaction '${blueprintName}':`, error);
            return false;
        }
    }
    
    /**
     * Get available geometries
     * @returns {Array} List of available geometries
     */
    getAvailableGeometries() {
        const visuals = this.jsonConfigSystem.getConfig('visuals');
        return visuals?.geometries || [];
    }
    
    /**
     * Get available states
     * @returns {Array} List of available application states
     */
    getAvailableStates() {
        const stateMap = this.jsonConfigSystem.getConfig('stateMap');
        return Object.keys(stateMap?.states || {});
    }
    
    /**
     * Apply mathematical operation to a value
     * @private
     */
    applyOperation(currentValue, operation, inputValue) {
        if (typeof operation === 'string') {
            if (operation.startsWith('*=')) {
                return currentValue * parseFloat(operation.substring(2));
            } else if (operation.startsWith('+=')) {
                return currentValue + parseFloat(operation.substring(2));
            } else if (operation.startsWith('-=')) {
                return currentValue - parseFloat(operation.substring(2));
            } else if (operation === 'initial') {
                return inputValue;
            }
        }
        return inputValue;
    }
}

export { AgentAPI };