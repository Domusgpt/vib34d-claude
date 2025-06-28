/**
 * @file VIB3SystemController.js
 * @description Top-level coordinator for the entire VIB34D reactive system, managing lifecycle, module coordination, and event routing.
 */

import { VIB3HomeMaster } from './VIB3HomeMaster.js';
import { UnifiedReactivityBridge } from './UnifiedReactivityBridge.js';
import { InteractionCoordinator } from '../interactions/InteractionCoordinator.js';
import { VisualizerPool } from '../managers/VisualizerPool.js';
import { GeometryRegistry } from '../geometry/GeometryRegistry.js';
import { PresetDatabase } from '../presets/PresetDatabase.js';
import { PerformanceMonitor } from '../utils/PerformanceMonitor.js';
import { ErrorHandler } from '../utils/ErrorHandler.js';

/**
 * @class VIB3SystemController
 * @description Orchestrates the VIB34D system, handling initialization, starting, stopping, and destruction of all modules.
 * @extends EventTarget
 */
class VIB3SystemController extends EventTarget {
    /**
     * @constructor
     * @param {object} [config={}] - Configuration options for the system controller.
     */
    constructor(config = {}) {
        super();
        
        /** @type {object} */
        this.config = {
            performanceMode: 'high', // high, balanced, power-saver
            debugMode: false,
            maxVisualizers: 20,
            targetFPS: 60,
            eventThrottleMS: 16, // ~60fps event processing
            ...config
        };
        
        /** @type {boolean} */
        this.isInitialized = false;
        /** @type {boolean} */
        this.isRunning = false;
        /** @type {string} */
        this.systemHealth = 'unknown';
        /** @type {number} */
        this.lastPerformanceCheck = 0;
        
        /** @type {object} */
        this.modules = {
            homeMaster: null,
            reactivityBridge: null,
            interactionCoordinator: null,
            visualizerPool: null,
            geometryRegistry: null,
            presetDatabase: null,
            performanceMonitor: null,
            errorHandler: null
        };
        
        /** @type {Map<string, string[]>} */
        this.eventRouter = new Map();
        this.setupEventRouting();
        
        /** @type {object} */
        this.metrics = {
            frameCount: 0,
            lastFrameTime: 0,
            averageFPS: 0,
            memoryUsage: 0,
            activeVisualizers: 0,
            lastEventTime: 0
        };
        
        console.log('🎛️ VIB3SystemController created with config:', this.config);
    }
    
    /**
     * @method initialize
     * @description Initializes all core modules and validates system integrity.
     * @returns {Promise<VIB3SystemController>} The instance of the system controller.
     */
    async initialize() {
        if (this.isInitialized) {
            console.warn('VIB3SystemController already initialized');
            return this;
        }
        
        console.log('🚀 Initializing VIB3 System...');
        
        try {
            this.modules.homeMaster = new VIB3HomeMaster({
                systemController: this,
                maxVisualizers: this.config.maxVisualizers
            });
            
            this.modules.reactivityBridge = new UnifiedReactivityBridge({
                systemController: this,
                homeMaster: this.modules.homeMaster
            });
            
            this.modules.homeMaster.setReactivityBridge(this.modules.reactivityBridge);

            this.modules.interactionCoordinator = new InteractionCoordinator({
                systemController: this,
                homeMaster: this.modules.homeMaster
            });

            this.modules.visualizerPool = new VisualizerPool({
                systemController: this,
                maxInstances: this.config.maxVisualizers
            });

            this.modules.geometryRegistry = new GeometryRegistry({
                systemController: this
            });

            this.modules.presetDatabase = new PresetDatabase({
                systemController: this
            });

            this.modules.performanceMonitor = new PerformanceMonitor({
                systemController: this,
                targetFPS: this.config.targetFPS
            });

            this.modules.errorHandler = new ErrorHandler({
                systemController: this,
                debugMode: this.config.debugMode
            });
            
            await this.validateSystemIntegrity();
            
            this.isInitialized = true;
            this.systemHealth = 'healthy';
            
            this.emit('systemInitialized', { 
                timestamp: Date.now(),
                modules: Object.keys(this.modules),
                health: this.systemHealth
            });
            
            console.log('✅ VIB3 System initialized successfully');
            return this;
            
        } catch (error) {
            this.systemHealth = 'error';
            this.handleError('SystemInitialization', error);
            throw error;
        }
    }
    
    /**
     * @method start
     * @description Starts the VIB3 system, initiating all active modules and the main loop.
     * @returns {Promise<VIB3SystemController>} The instance of the system controller.
     */
    async start() {
        if (!this.isInitialized) {
            throw new Error('System must be initialized before starting');
        }
        
        if (this.isRunning) {
            console.warn('VIB3SystemController already running');
            return this;
        }
        
        console.log('▶️ Starting VIB3 System...');
        
        try {
            if (this.modules.homeMaster) {
                await this.modules.homeMaster.start();
            }
            
            if (this.modules.reactivityBridge) {
                await this.modules.reactivityBridge.start();
            }
            
            if (this.modules.interactionCoordinator) {
                await this.modules.interactionCoordinator.start();
            }
            
            if (this.modules.visualizerPool) {
                await this.modules.visualizerPool.start();
            }
            
            if (this.modules.performanceMonitor) {
                this.modules.performanceMonitor.startMonitoring();
            }
            
            this.isRunning = true;
            this.startMainLoop();
            
            this.emit('systemStarted', { timestamp: Date.now() });
            
            console.log('✅ VIB3 System started successfully');
            return this;
            
        } catch (error) {
            this.systemHealth = 'error';
            this.handleError('SystemStart', error);
            throw error;
        }
    }
    
    /**
     * @method stop
     * @description Stops the VIB3 system, halting all active modules and the main loop.
     * @returns {Promise<VIB3SystemController>} The instance of the system controller.
     */
    async stop() {
        if (!this.isRunning) {
            console.warn('VIB3SystemController not running');
            return this;
        }
        
        console.log('⏸️ Stopping VIB3 System...');
        
        try {
            this.isRunning = false;
            
            if (this.modules.performanceMonitor) {
                this.modules.performanceMonitor.stopMonitoring();
            }
            
            if (this.modules.interactionCoordinator) {
                await this.modules.interactionCoordinator.stop();
            }
            
            if (this.modules.visualizerPool) {
                await this.modules.visualizerPool.stop();
            }
            
            if (this.modules.reactivityBridge) {
                await this.modules.reactivityBridge.stop();
            }
            
            if (this.modules.homeMaster) {
                await this.modules.homeMaster.stop();
            }
            
            this.emit('systemStopped', { timestamp: Date.now() });
            
            console.log('✅ VIB3 System stopped successfully');
            return this;
            
        } catch (error) {
            this.handleError('SystemStop', error);
            throw error;
        }
    }
    
    /**
     * @method destroy
     * @description Destroys the VIB3 system, cleaning up all resources and modules.
     * @returns {Promise<void>} A promise that resolves when destruction is complete.
     */
    async destroy() {
        console.log('🗑️ Destroying VIB3 System...');
        
        try {
            if (this.isRunning) {
                await this.stop();
            }
            
            for (const [name, module] of Object.entries(this.modules)) {
                if (module && typeof module.destroy === 'function') {
                    await module.destroy();
                }
                this.modules[name] = null;
            }
            
            this.eventRouter.clear();
            
            this.isInitialized = false;
            this.systemHealth = 'destroyed';
            
            this.emit('systemDestroyed', { timestamp: Date.now() });
            
        } catch (error) {
            this.handleError('SystemDestroy', error);
            throw error;
        }
    }
    
    /**
     * @method validateSystemIntegrity
     * @description Validates that all required core modules have been initialized.
     * @returns {Promise<void>} A promise that resolves if integrity is valid, otherwise rejects.
     */
    async validateSystemIntegrity() {
        console.log('🔍 Validating system integrity...');
        
        const requiredModules = ['homeMaster', 'reactivityBridge', 'interactionCoordinator', 'visualizerPool'];
        
        for (const moduleName of requiredModules) {
            if (!this.modules[moduleName]) {
                throw new Error(`Required module '${moduleName}' failed to initialize`);
            }
        }
        
        console.log('✅ System integrity validated');
    }
    
    /**
     * @method setupEventRouting
     * @description Defines the internal event routing table for inter-module communication.
     */
    setupEventRouting() {
        this.eventRouter.set('userInput', ['interactionCoordinator', 'homeMaster']);
        this.eventRouter.set('parameterUpdate', ['homeMaster', 'reactivityBridge', 'visualizerPool']);
        this.eventRouter.set('geometryChange', ['geometryRegistry', 'visualizerPool']);
        this.eventRouter.set('visualizerUpdate', ['visualizerPool', 'performanceMonitor']);
        this.eventRouter.set('systemError', ['errorHandler']);
        this.eventRouter.set('performanceUpdate', ['performanceMonitor']);
    }
    
    /**
     * @method routeEvent
     * @description Routes an event to its registered handlers and emits a system-level event.
     * @param {string} eventType - The type of event to route.
     * @param {object} eventData - The data associated with the event.
     * @param {string} [source='unknown'] - The source module of the event.
     */
    routeEvent(eventType, eventData, source = 'unknown') {
        const routes = this.eventRouter.get(eventType);
        
        if (!routes) {
            console.warn(`No routes defined for event type: ${eventType}`);
            return;
        }
        
        routes.forEach(moduleName => {
            const module = this.modules[moduleName];
            if (module && typeof module.handleEvent === 'function') {
                try {
                    module.handleEvent(eventType, eventData, source);
                } catch (error) {
                    this.handleError(`EventRouting_${moduleName}`, error);
                }
            }
        });
        
        this.emit(eventType, { ...eventData, source, timestamp: Date.now() });
    }
    
    /**
     * @method startMainLoop
     * @description Starts the main animation and system update loop.
     */
    startMainLoop() {
        const loop = () => {
            if (!this.isRunning) return;
            
            try {
                this.updateMetrics();
                this.checkSystemHealth();
                
                requestAnimationFrame(loop);
                
            } catch (error) {
                this.handleError('MainLoop', error);
            }
        };
        
        requestAnimationFrame(loop);
    }
    
    /**
     * @method updateMetrics
     * @description Updates performance metrics such as FPS, memory usage, and active visualizer count.
     */
    updateMetrics() {
        const now = performance.now();
        this.metrics.frameCount++;
        
        if (this.metrics.lastFrameTime > 0) {
            const deltaTime = now - this.metrics.lastFrameTime;
            const currentFPS = 1000 / deltaTime;
            
            this.metrics.averageFPS = this.metrics.averageFPS * 0.9 + currentFPS * 0.1;
        }
        
        this.metrics.lastFrameTime = now;
        
        if (performance.memory) {
            this.metrics.memoryUsage = performance.memory.usedJSHeapSize / 1024 / 1024; // MB
        }
        
        if (this.modules.visualizerPool) {
            this.metrics.activeVisualizers = this.modules.visualizerPool.getActiveCount();
        }
    }
    
    /**
     * @method checkSystemHealth
     * @description Checks the overall health of the system based on performance metrics and emits health change events.
     */
    checkSystemHealth() {
        if (this.metrics.averageFPS < this.config.targetFPS * 0.8) {
            if (this.systemHealth !== 'performance-warning') {
                this.systemHealth = 'performance-warning';
                this.emit('systemHealthChange', { 
                    health: this.systemHealth, 
                    reason: 'Low FPS',
                    fps: this.metrics.averageFPS 
                });
            }
        } else if (this.systemHealth === 'performance-warning') {
            this.systemHealth = 'healthy';
            this.emit('systemHealthChange', { 
                health: this.systemHealth, 
                reason: 'FPS recovered' 
            });
        }
        
        if (this.metrics.memoryUsage > 200) { // 200MB threshold
            if (this.systemHealth !== 'memory-warning') {
                this.systemHealth = 'memory-warning';
                this.emit('systemHealthChange', { 
                    health: this.systemHealth, 
                    reason: 'High memory usage',
                    memory: this.metrics.memoryUsage 
                });
            }
        }
    }
    
    /**
     * @method handleError
     * @description Handles system errors, logs them, and routes them through the error handler module.
     * @param {string} context - The context where the error occurred.
     * @param {Error} error - The error object.
     */
    handleError(context, error) {
        console.error(`VIB3SystemController Error [${context}]:`, error);
        
        if (this.modules.errorHandler) {
            this.modules.errorHandler.handleError(context, error);
        }
        
        this.emit('systemError', { context, error, timestamp: Date.now() });
    }
    
    /**
     * @method withConfig
     * @description Sets or updates system configuration options.
     * @param {object} config - The configuration object.
     * @returns {VIB3SystemController} The instance of the system controller for chaining.
     */
    withConfig(config) {
        Object.assign(this.config, config);
        return this;
    }
    
    /**
     * @method withModule
     * @description Manually sets a module reference.
     * @param {string} name - The name of the module.
     * @param {object} module - The module instance.
     * @returns {VIB3SystemController} The instance of the system controller for chaining.
     */
    withModule(name, module) {
        this.modules[name] = module;
        return this;
    }
    
    /**
     * @method getStatus
     * @description Retrieves the current status of the VIB3 system.
     * @returns {object} An object containing system status, health, and metrics.
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isRunning: this.isRunning,
            health: this.systemHealth,
            metrics: { ...this.metrics },
            modules: Object.keys(this.modules).filter(name => this.modules[name] !== null)
        };
    }
    
    /**
     * @method getModule
     * @description Retrieves a reference to a specific module.
     * @param {string} name - The name of the module to retrieve.
     * @returns {object|null} The module instance or null if not found.
     */
    getModule(name) {
        return this.modules[name];
    }
    
    /**
     * @method setParameter
     * @description Sets a global parameter value through the HomeMaster module.
     * @param {string} name - The name of the parameter.
     * @param {*} value - The value to set.
     * @param {string} [source='api'] - The source of the parameter update.
     * @returns {Promise<void>} A promise that resolves when the parameter is set.
     */
    async setParameter(name, value, source = 'api') {
        if (this.modules.homeMaster) {
            return await this.modules.homeMaster.setParameter(name, value, source);
        }
        throw new Error('HomeMaster not initialized');
    }
    
    /**
     * @method getParameter
     * @description Retrieves a global parameter value from the HomeMaster module.
     * @param {string} name - The name of the parameter.
     * @returns {*} The parameter value.
     */
    getParameter(name) {
        if (this.modules.homeMaster) {
            return this.modules.homeMaster.getParameter(name);
        }
        throw new Error('HomeMaster not initialized');
    }
    
    /**
     * @method setGeometry
     * @description Sets the active geometry for visualizers through the GeometryRegistry and VisualizerPool.
     * @param {string} geometryType - The type of geometry to set.
     * @param {string|null} [instanceId=null] - The ID of a specific visualizer instance, or null for all.
     * @returns {Promise<void>} A promise that resolves when the geometry is set.
     */
    async setGeometry(geometryType, instanceId = null) {
        if (this.modules.geometryRegistry && this.modules.visualizerPool) {
            const geometry = await this.modules.geometryRegistry.getGeometry(geometryType);
            return await this.modules.visualizerPool.setGeometry(geometry, instanceId);
        }
        throw new Error('Geometry systems not initialized');
    }
    
    /**
     * @method loadPreset
     * @description Loads a preset from the PresetDatabase.
     * @param {string} presetName - The name of the preset to load.
     * @returns {Promise<object>} A promise that resolves with the loaded preset data.
     */
    async loadPreset(presetName) {
        if (this.modules.presetDatabase) {
            return await this.modules.presetDatabase.loadPreset(presetName);
        }
        throw new Error('PresetDatabase not initialized');
    }
}

export { VIB3SystemController };
