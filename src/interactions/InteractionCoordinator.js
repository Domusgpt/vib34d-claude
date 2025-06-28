/**
 * @file InteractionCoordinator.js
 * @description Unified event handling and routing for the VIB34D system, including event capture, gesture recognition, and parameter mapping.
 */

/**
 * @class InteractionCoordinator
 * @description Manages user interactions (mouse, keyboard, touch, scroll), processes them, and emits events for other system components.
 * @extends EventTarget
 */
class InteractionCoordinator extends EventTarget {
    /**
     * @constructor
     * @param {object} [config={}] - Configuration options for the interaction coordinator.
     * @param {VIB3SystemController} config.systemController - Reference to the main system controller.
     * @param {VIB3HomeMaster} config.homeMaster - Reference to the home master module.
     */
    constructor(config = {}) {
        super();
        
        /** @type {object} */
        this.config = {
            eventThrottleMS: 16, // ~60fps
            gestureTimeoutMS: 500,
            debugMode: false,
            enabledInputs: ['mouse', 'keyboard', 'touch', 'scroll'],
            ...config
        };
        
        /** @type {VIB3SystemController} */
        this.systemController = config.systemController;
        /** @type {VIB3HomeMaster} */
        this.homeMaster = config.homeMaster;
        
        /** @type {object} */
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
        
        /** @type {Map<string, Function>} */
        this.throttledEvents = new Map();
        /** @type {Map<string, number>} */
        this.lastEventTimes = new Map();
        
        /** @type {Map<EventTarget, Map<string, Function>>} */
        this.eventListeners = new Map();
        
        /** @type {Map<string, object>} */
        this.gesturePatterns = new Map();
        this.setupGesturePatterns();
        
        /** @type {Map<string, object>} */
        this.parameterMappings = new Map();
        this.setupParameterMappings();
        
        console.log('🎮 InteractionCoordinator created');
    }
    
    /**
     * @method start
     * @description Starts the interaction coordinator, setting up all enabled event listeners.
     * @returns {Promise<void>} A promise that resolves when setup is complete.
     */
    async start() {
        console.log('▶️ Starting InteractionCoordinator...');
        
        try {
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
            
            this.setupWindowEvents();
            
            console.log('✅ InteractionCoordinator started');
            
        } catch (error) {
            console.error('❌ InteractionCoordinator start failed:', error);
            throw error;
        }
    }
    
    /**
     * @method stop
     * @description Stops the interaction coordinator, removing all event listeners.
     * @returns {Promise<void>} A promise that resolves when cleanup is complete.
     */
    async stop() {
        console.log('⏸️ Stopping InteractionCoordinator...');
        
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
     * @method setupMouseEvents
     * @description Sets up mouse event listeners (mousemove, mousedown, mouseup, mouseenter, mouseleave).
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
        
        this.setupHoverEvents();
        
        console.log('🖱️ Mouse events setup complete');
    }
    
    /**
     * @method setupKeyboardEvents
     * @description Sets up keyboard event listeners (keydown, keyup).
     */
    setupKeyboardEvents() {
        const keyDown = (e) => this.handleKeyDown(e);
        const keyUp = (e) => this.handleKeyUp(e);
        
        this.addEventListeners(document, {
            'keydown': keyDown,
            'keyup': keyUp
        });
        
        console.log('⌨️ Keyboard events setup complete');
    }
    
    /**
     * @method setupTouchEvents
     * @description Sets up touch event listeners (touchstart, touchmove, touchend).
     */
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
    
    /**
     * @method setupScrollEvents
     * @description Sets up scroll event listeners (wheel).
     */
    setupScrollEvents() {
        const scroll = this.throttle((e) => {
            this.handleScroll(e);
        }, this.config.eventThrottleMS);
        
        this.addEventListeners(document, {
            'wheel': scroll
        });
        
        console.log('📜 Scroll events setup complete');
    }
    
    /**
     * @method setupWindowEvents
     * @description Sets up window event listeners (resize).
     */
    setupWindowEvents() {
        const resize = this.throttle(() => {
            this.handleResize();
        }, this.config.eventThrottleMS);
        
        this.addEventListeners(window, {
            'resize': resize
        });
        
        console.log('🖼️ Window events setup complete');
    }
    
    /**
     * @method setupHoverEvents
     * @description Sets up hover event listeners for specific elements (e.g., .blog-card).
     */
    setupHoverEvents() {
        document.querySelectorAll('.blog-card').forEach(element => {
            this.addEventListeners(element, {
                'mouseenter': (e) => this.handleMouseEnter(e, element),
                'mouseleave': (e) => this.handleMouseLeave(e, element)
            });
        });
    }
    
    /**
     * @method handleMouseMove
     * @description Handles mouse move events, calculates velocity, and emits an interaction event.
     * @param {MouseEvent} e - The mouse event object.
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
    
    /**
     * @method handleMouseDown
     * @description Handles mouse down events and emits an interaction event.
     * @param {MouseEvent} e - The mouse event object.
     */
    handleMouseDown(e) {
        this.eventState.mouse.isDown = true;
        this.emitInteractionEvent('mouseDown', { button: e.button });
    }
    
    /**
     * @method handleMouseUp
     * @description Handles mouse up events and emits an interaction event.
     * @param {MouseEvent} e - The mouse event object.
     */
    handleMouseUp(e) {
        this.eventState.mouse.isDown = false;
        this.emitInteractionEvent('mouseUp', { button: e.button });
    }
    
    /**
     * @method handleMouseEnter
     * @description Handles mouse enter events for interactive elements and emits an interaction event.
     * @param {MouseEvent} e - The mouse event object.
     * @param {HTMLElement} element - The element that the mouse entered.
     */
    handleMouseEnter(e, element) {
        this.emitInteractionEvent('mouseEnter', { targetId: element ? element.id : null });
    }
    
    /**
     * @method handleMouseLeave
     * @description Handles mouse leave events for interactive elements and emits an interaction event.
     * @param {MouseEvent} e - The mouse event object.
     * @param {HTMLElement} element - The element that the mouse left.
     */
    handleMouseLeave(e, element) {
        this.emitInteractionEvent('mouseLeave', { targetId: element ? element.id : null });
    }
    
    /**
     * @method handleKeyDown
     * @description Handles key down events, tracks pressed keys, and emits an interaction event.
     * @param {KeyboardEvent} e - The keyboard event object.
     */
    handleKeyDown(e) {
        if (!this.eventState.keyboard.keysDown.has(e.key)) {
            this.eventState.keyboard.keysDown.add(e.key);
            this.eventState.keyboard.lastKeyTime = performance.now();
            this.emitInteractionEvent('keyDown', { key: e.key });
        }
    }
    
    /**
     * @method handleKeyUp
     * @description Handles key up events, tracks released keys, and emits an interaction event.
     * @param {KeyboardEvent} e - The keyboard event object.
     */
    handleKeyUp(e) {
        this.eventState.keyboard.keysDown.delete(e.key);
        this.emitInteractionEvent('keyUp', { key: e.key });
    }
    
    /**
     * @method handleTouchStart
     * @description Handles touch start events, tracks touches, and emits an interaction event.
     * @param {TouchEvent} e - The touch event object.
     */
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
    
    /**
     * @method handleTouchMove
     * @description Handles touch move events, updates touch positions, and emits an interaction event.
     * @param {TouchEvent} e - The touch event object.
     */
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
    
    /**
     * @method handleTouchEnd
     * @description Handles touch end events, removes touches, and emits an interaction event.
     * @param {TouchEvent} e - The touch event object.
     */
    handleTouchEnd(e) {
        Array.from(e.changedTouches).forEach(touch => {
            this.eventState.touch.touches.delete(touch.identifier);
        });
        this.emitInteractionEvent('touchEnd', { touches: this.getTouchData(e.touches) });
    }
    
    /**
     * @method handleScroll
     * @description Handles scroll events, calculates velocity and direction, and emits an interaction event.
     * @param {WheelEvent} e - The wheel event object.
     */
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
    
    /**
     * @method handleResize
     * @description Handles window resize events and emits an interaction event.
     */
    handleResize() {
        this.emitInteractionEvent('resize', { 
            width: window.innerWidth, 
            height: window.innerHeight 
        });
    }
    
    /**
     * @method addEventListeners
     * @description Adds multiple event listeners to a target element and stores them for cleanup.
     * @param {EventTarget} target - The target element to add listeners to.
     * @param {object} events - An object where keys are event types and values are listener functions.
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
    
    /**
     * @method throttle
     * @description Creates a throttled version of a function that only runs at most once per specified limit.
     * @param {Function} func - The function to throttle.
     * @param {number} limit - The time limit in milliseconds.
     * @returns {Function} The throttled function.
     */
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
    
    /**
     * @method emitInteractionEvent
     * @description Emits a custom 'interaction' event with detailed data and routes it through the system controller.
     * @param {string} type - The type of interaction (e.g., 'mouseMove', 'keyDown').
     * @param {object} data - The data associated with the interaction.
     */
    emitInteractionEvent(type, data) {
        const event = new CustomEvent('interaction', {
            detail: { type, data, timestamp: performance.now() }
        });
        this.dispatchEvent(event);
        
        if (this.systemController) {
            this.systemController.routeEvent('userInput', { type, data }, 'InteractionCoordinator');
        }
    }
    
    /**
     * @method getTouchData
     * @description Extracts relevant data from a TouchList object.
     * @param {TouchList} touchList - The TouchList object from a TouchEvent.
     * @returns {object[]} An array of simplified touch data objects.
     */
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
     * @method setupGesturePatterns
     * @description Placeholder for setting up gesture recognition patterns.
     */
    setupGesturePatterns() {
        // Define common gesture patterns (e.g., swipe, pinch, double-tap)
        // this.gesturePatterns.set('swipe', { /* pattern definition */ });
    }
    
    /**
     * @method recognizeGesture
     * @description Placeholder for recognizing gestures from event data.
     * @param {object} eventData - The event data to analyze for gestures.
     * @returns {object|null} The recognized gesture and its data, or null if no gesture is recognized.
     */
    recognizeGesture(eventData) {
        return null;
    }
    
    /**
     * @method setupParameterMappings
     * @description Placeholder for defining how raw interaction data maps to visual parameters.
     */
    setupParameterMappings() {
        // Define how raw interaction data maps to visual parameters
        // this.parameterMappings.set('mouseMoveToMorphFactor', { /* mapping logic */ });
    }
    
    /**
     * @method mapParameters
     * @description Placeholder for applying parameter mappings based on interaction data.
     * @param {string} interactionType - The type of interaction.
     * @param {object} interactionData - The data associated with the interaction.
     * @returns {object} An object of visual parameter updates.
     */
    mapParameters(interactionType, interactionData) {
        return {};
    }
}

export { InteractionCoordinator };