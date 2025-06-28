
/**
 * INTERACTION COORDINATOR
 * Unified event handling and routing for the VIB34D system
 * 
 * Responsibilities:
 * - Event capture and validation
 * - Gesture recognition and pattern detection
 * - Parameter mapping from user inputs
 * - Event throttling and performance optimization
 * - Ecosystem reaction coordination
 */

class InteractionCoordinator extends EventTarget {
    constructor(config = {}) {
        super();
        
        this.config = {
            eventThrottleMS: 16, // ~60fps
            gestureTimeoutMS: 500,
            debugMode: false,
            enabledInputs: ['mouse', 'keyboard', 'touch', 'scroll'],
            ...config
        };
        
        // References to other systems
        this.systemController = config.systemController;
        this.homeMaster = config.homeMaster;
        
        // Event state tracking
        this.eventState = {
            mouse: {
                x: 0.5,
                y: 0.5,
                isDown: false,
                lastActivity: 0,
                velocity: { x: 0, y: 0 }
            },
            keyboard: {
                keysDown: new Set(),
                lastKeyTime: 0,
                sequences: []
            },
            touch: {
                touches: new Map(),
                gestureState: 'idle'
            },
            scroll: {
                velocity: 0,
                direction: 'idle',
                lastScrollTime: 0
            }
        };
        
        // Throttling management
        this.throttledEvents = new Map();
        this.lastEventTimes = new Map();
        
        // Event listeners storage for cleanup
        this.eventListeners = new Map();
        
        // Gesture patterns
        this.gesturePatterns = new Map();
        this.setupGesturePatterns();
        
        // Parameter mapping configuration
        this.parameterMappings = new Map();
        this.setupParameterMappings();
        
        console.log('🎮 InteractionCoordinator created');
    }
    
    /**
     * LIFECYCLE MANAGEMENT
     */
    
    async start() {
        console.log('▶️ Starting InteractionCoordinator...');
        
        try {
            // Setup event listeners for enabled input types
            if (this.config.enabledInputs.includes('mouse')) {
                this.setupMouseEvents();
            }
            
            if (this.config.enabledInputs.includes('keyboard')) {
                this.setupKeyboardEvents();
            }
            
            if (this.config.enabledInputs.includes('touch')) {
                this.setupTouchEvents();
            }
            
            if (this.config.enabledInputs.includes('scroll')) {
                this.setupScrollEvents();
            }
            
            // Setup window events
            this.setupWindowEvents();
            
            console.log('✅ InteractionCoordinator started');
            
        } catch (error) {
            console.error('❌ InteractionCoordinator start failed:', error);
            throw error;
        }
    }
    
    async stop() {
        console.log('⏸️ Stopping InteractionCoordinator...');
        
        // Remove all event listeners
        for (const [element, listeners] of this.eventListeners) {
            for (const [eventType, listener] of listeners) {
                element.removeEventListener(eventType, listener);
            }
        }
        
        this.eventListeners.clear();
        this.throttledEvents.clear();
        this.lastEventTimes.clear();
        
        console.log('✅ InteractionCoordinator stopped');
    }
    
    /**
     * EVENT SETUP
     */
    
    setupMouseEvents() {
        const mouseMove = this.throttle((e) => {
            this.handleMouseMove(e);
        }, this.config.eventThrottleMS);
        
        const mouseDown = (e) => this.handleMouseDown(e);
        const mouseUp = (e) => this.handleMouseUp(e);
        const mouseEnter = (e) => this.handleMouseEnter(e);
        const mouseLeave = (e) => this.handleMouseLeave(e);
        
        this.addEventListeners(document, {
            'mousemove': mouseMove,
            'mousedown': mouseDown,
            'mouseup': mouseUp
        });
        
        // Setup hover events for interactive elements
        this.setupHoverEvents();
        
        console.log('🖱️ Mouse events setup complete');
    }
    
    setupKeyboardEvents() {
        const keyDown = (e) => this.handleKeyDown(e);
        const keyUp = (e) => this.handleKeyUp(e);
        
        this.addEventListeners(document, {
            'keydown': keyDown,
            'keyup': keyUp
        });
        
        console.log('⌨️ Keyboard events setup complete');
    }
    
    setupTouchEvents() {
        const touchStart = (e) => this.handleTouchStart(e);
        const touchMove = this.throttle((e) => {
            this.handleTouchMove(e);
        }, this.config.eventThrottleMS);
        const touchEnd = (e) => this.handleTouchEnd(e);
        
        this.addEventListeners(document, {
            'touchstart': touchStart,
            'touchmove': touchMove,
            'touchend': touchEnd
        });
        
        console.log('👆 Touch events setup complete');
    }
    
    setupScrollEvents() {
        const scroll = this.throttle((e) => {
            this.handleScroll(e);
        }, this.config.eventThrottleMS);
        
        this.addEventListeners(document, {
            'wheel': scroll
        });
        
        console.log('📜 Scroll events setup complete');
    }
    
    setupWindowEvents() {
        const resize = this.throttle(() => {
            this.handleResize();
        }, this.config.eventThrottleMS);
        
        this.addEventListeners(window, {
            'resize': resize
        });
        
        console.log('🖼️ Window events setup complete');
    }
    
    setupHoverEvents() {
        // Example: Attach hover events to elements with a specific class
        document.querySelectorAll('.blog-card').forEach(element => {
            this.addEventListeners(element, {
                'mouseenter': (e) => this.handleMouseEnter(e, element),
                'mouseleave': (e) => this.handleMouseLeave(e, element)
            });
        });
    }
    
    /**
     * EVENT HANDLERS
     */
    
    handleMouseMove(e) {
        const now = performance.now();
        const deltaTime = now - this.eventState.mouse.lastActivity;
        
        const prevX = this.eventState.mouse.x * window.innerWidth;
        const prevY = (1.0 - this.eventState.mouse.y) * window.innerHeight;
        
        const velocityX = (e.clientX - prevX) / deltaTime;
        const velocityY = (e.clientY - prevY) / deltaTime;
        
        this.eventState.mouse.x = e.clientX / window.innerWidth;
        this.eventState.mouse.y = 1.0 - (e.clientY / window.innerHeight);
        this.eventState.mouse.velocity = { x: velocityX, y: velocityY };
        this.eventState.mouse.lastActivity = now;
        
        this.emitInteractionEvent('mouseMove', { 
            x: this.eventState.mouse.x, 
            y: this.eventState.mouse.y, 
            velocity: this.eventState.mouse.velocity 
        });
    }
    
    handleMouseDown(e) {
        this.eventState.mouse.isDown = true;
        this.emitInteractionEvent('mouseDown', { button: e.button });
    }
    
    handleMouseUp(e) {
        this.eventState.mouse.isDown = false;
        this.emitInteractionEvent('mouseUp', { button: e.button });
    }
    
    handleMouseEnter(e, element) {
        this.emitInteractionEvent('mouseEnter', { targetId: element ? element.id : null });
    }
    
    handleMouseLeave(e, element) {
        this.emitInteractionEvent('mouseLeave', { targetId: element ? element.id : null });
    }
    
    handleKeyDown(e) {
        if (!this.eventState.keyboard.keysDown.has(e.key)) {
            this.eventState.keyboard.keysDown.add(e.key);
            this.eventState.keyboard.lastKeyTime = performance.now();
            this.emitInteractionEvent('keyDown', { key: e.key });
        }
    }
    
    handleKeyUp(e) {
        this.eventState.keyboard.keysDown.delete(e.key);
        this.emitInteractionEvent('keyUp', { key: e.key });
    }
    
    handleTouchStart(e) {
        Array.from(e.touches).forEach(touch => {
            this.eventState.touch.touches.set(touch.identifier, {
                startX: touch.clientX,
                startY: touch.clientY,
                lastX: touch.clientX,
                lastY: touch.clientY,
                timestamp: performance.now()
            });
        });
        this.emitInteractionEvent('touchStart', { touches: this.getTouchData(e.touches) });
    }
    
    handleTouchMove(e) {
        Array.from(e.touches).forEach(touch => {
            const touchData = this.eventState.touch.touches.get(touch.identifier);
            if (touchData) {
                touchData.lastX = touch.clientX;
                touchData.lastY = touch.clientY;
                touchData.timestamp = performance.now();
            }
        });
        this.emitInteractionEvent('touchMove', { touches: this.getTouchData(e.touches) });
    }
    
    handleTouchEnd(e) {
        Array.from(e.changedTouches).forEach(touch => {
            this.eventState.touch.touches.delete(touch.identifier);
        });
        this.emitInteractionEvent('touchEnd', { touches: this.getTouchData(e.touches) });
    }
    
    handleScroll(e) {
        const now = performance.now();
        const deltaTime = now - this.eventState.scroll.lastScrollTime;
        
        this.eventState.scroll.velocity = e.deltaY / deltaTime; // Pixels per ms
        this.eventState.scroll.direction = e.deltaY > 0 ? 'down' : 'up';
        this.eventState.scroll.lastScrollTime = now;
        
        this.emitInteractionEvent('scroll', { 
            deltaY: e.deltaY, 
            velocity: this.eventState.scroll.velocity,
            direction: this.eventState.scroll.direction
        });
    }
    
    handleResize() {
        this.emitInteractionEvent('resize', { 
            width: window.innerWidth, 
            height: window.innerHeight 
        });
    }
    
    /**
     * UTILITIES
     */
    
    addEventListeners(target, events) {
        let listeners = this.eventListeners.get(target);
        if (!listeners) {
            listeners = new Map();
            this.eventListeners.set(target, listeners);
        }
        for (const eventType in events) {
            const listener = events[eventType];
            target.addEventListener(eventType, listener);
            listeners.set(eventType, listener);
        }
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    emitInteractionEvent(type, data) {
        const event = new CustomEvent('interaction', {
            detail: { type, data, timestamp: performance.now() }
        });
        this.dispatchEvent(event);
        
        // Also route through system controller if available
        if (this.systemController) {
            this.systemController.routeEvent('userInput', { type, data }, 'InteractionCoordinator');
        }
    }
    
    getTouchData(touchList) {
        return Array.from(touchList).map(touch => ({
            identifier: touch.identifier,
            clientX: touch.clientX,
            clientY: touch.clientY,
            pageX: touch.pageX,
            pageY: touch.pageY
        }));
    }
    
    /**
     * GESTURE RECOGNITION (Placeholder)
     */
    setupGesturePatterns() {
        // Define common gesture patterns (e.g., swipe, pinch, double-tap)
        // this.gesturePatterns.set('swipe', { /* pattern definition */ });
    }
    
    recognizeGesture(eventData) {
        // Logic to match event data against defined gesture patterns
        // Returns recognized gesture type and associated data
        return null;
    }
    
    /**
     * PARAMETER MAPPING (Placeholder)
     */
    setupParameterMappings() {
        // Define how raw interaction data maps to visual parameters
        // this.parameterMappings.set('mouseMoveToMorphFactor', { /* mapping logic */ });
    }
    
    mapParameters(interactionType, interactionData) {
        // Logic to apply parameter mappings
        // Returns an object of visual parameter updates
        return {};
    }
}

export { InteractionCoordinator };
