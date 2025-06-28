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
            
            this.emit('systemDestroyed', { timestamp: Date.n