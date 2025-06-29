/**
 * @file UserEventReactiveCore.js
 * @description INTENSE USER EVENT REACTIVE SYSTEM - Polytopal Visualizer Response Engine
 * Replaces audio reactivity with comprehensive user interaction analysis
 * Maps user events to visual parameters with same intensity as audio system
 */

class UserEventReactiveCore {
    constructor() {
        this.isActive = false;
        this.visualizers = [];
        
        // User interaction analysis data (mirrors audio analysis structure)
        this.analysisData = {
            // Primary interaction bands (replaces bass/mid/high)
            movement: 0,        // Mouse/touch movement intensity (replaces bass)
            velocity: 0,        // Interaction velocity/speed (replaces mid)  
            precision: 0,       // Click/tap precision patterns (replaces high)
            
            // Smoothed values for stable animation
            movementSmooth: 0,
            velocitySmooth: 0,
            precisionSmooth: 0,
            
            // Interaction "pitch" analysis
            dominantPattern: 0,      // Dominant interaction pattern
            patternIntensity: 0,     // Strength of pattern
            interaction: {           // Structured interaction data
                type: 'idle',        // Current interaction type
                intensity: 0,        // Interaction intensity 0-1
                frequency: 0,        // Interaction frequency (events/sec)
                rhythm: 'none',      // Detected rhythm pattern
                inSync: false        // Whether interactions are rhythmic
            }
        };
        
        // Event tracking arrays
        this.eventHistory = [];
        this.velocityHistory = [];
        this.patternHistory = [];
        
        // Interaction pattern mappings (replaces musical notes)
        this.INTERACTION_PATTERNS = {
            'click': 0, 'double-click': 0.083, 'drag': 0.167, 'scroll': 0.25,
            'hover': 0.333, 'key-press': 0.417, 'key-combo': 0.5, 
            'gesture': 0.583, 'multi-touch': 0.667, 'wheel': 0.75,
            'shake': 0.833, 'tilt': 0.917
        };
        
        // State tracking
        this.lastInteraction = {
            type: 'idle',
            timestamp: 0,
            position: { x: 0.5, y: 0.5 },
            intensity: 0
        };
        
        // Interaction state
        this.currentState = {
            mousePos: { x: 0.5, y: 0.5 },
            lastMousePos: { x: 0.5, y: 0.5 },
            mouseVelocity: { x: 0, y: 0 },
            scrollVelocity: 0,
            keyPressCount: 0,
            clickCount: 0,
            isScrolling: false,
            isDragging: false,
            touchCount: 0,
            interactionEnergy: 0
        };
        
        // Timing for rhythm detection
        this.rhythmDetection = {
            lastEventTime: 0,
            intervals: [],
            avgInterval: 0,
            rhythmStrength: 0
        };
        
        console.log('🎮 User Event Reactive Core initialized');
    }
    
    /**
     * Initialize the reactive system and bind event listeners
     */
    initialize(visualizers = []) {
        this.visualizers = visualizers;
        this.setupEventListeners();
        this.startAnalysisLoop();
        this.isActive = true;
        console.log('🎮 User Event Reactive System fully initialized');
    }
    
    /**
     * Setup comprehensive event listeners for all user interactions
     */
    setupEventListeners() {
        // Mouse events - continuous tracking
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e), { passive: true });
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        document.addEventListener('click', (e) => this.handleClick(e));
        document.addEventListener('dblclick', (e) => this.handleDoubleClick(e));
        document.addEventListener('wheel', (e) => this.handleWheel(e), { passive: true });
        
        // Keyboard events - rhythm detection
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Touch events - gesture analysis
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
        
        // Window events - environmental changes
        window.addEventListener('resize', (e) => this.handleResize(e));
        window.addEventListener('focus', (e) => this.handleFocus(e));
        window.addEventListener('blur', (e) => this.handleBlur(e));
        
        // Device orientation (mobile)
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (e) => this.handleDeviceOrientation(e), { passive: true });
        }
        
        console.log('🎮 Event listeners established');
    }
    
    /**
     * Handle mouse movement with velocity analysis
     */
    handleMouseMove(event) {
        const rect = document.documentElement.getBoundingClientRect();
        const newPos = {
            x: event.clientX / window.innerWidth,
            y: event.clientY / window.innerHeight
        };
        
        // Calculate velocity
        const deltaX = newPos.x - this.currentState.mousePos.x;
        const deltaY = newPos.y - this.currentState.mousePos.y;
        const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        this.currentState.lastMousePos = { ...this.currentState.mousePos };
        this.currentState.mousePos = newPos;
        this.currentState.mouseVelocity = { x: deltaX, y: deltaY };
        
        // Register interaction
        this.registerInteraction('mousemove', velocity * 5, newPos);
    }
    
    /**
     * Handle mouse clicks with timing analysis
     */
    handleClick(event) {
        const intensity = 0.8 + Math.random() * 0.2; // Click has high base intensity
        const position = {
            x: event.clientX / window.innerWidth,
            y: event.clientY / window.innerHeight
        };
        
        this.currentState.clickCount++;
        this.registerInteraction('click', intensity, position);
        
        // Detect click rhythm
        this.detectRhythm('click');
    }
    
    /**
     * Handle double clicks
     */
    handleDoubleClick(event) {
        const intensity = 1.0; // Max intensity for double click
        const position = {
            x: event.clientX / window.innerWidth,
            y: event.clientY / window.innerHeight
        };
        
        this.registerInteraction('double-click', intensity, position);
    }
    
    /**
     * Handle mouse wheel/scroll with acceleration analysis
     */
    handleWheel(event) {
        const scrollIntensity = Math.min(Math.abs(event.deltaY) / 100, 1.0);
        this.currentState.scrollVelocity = scrollIntensity;
        this.currentState.isScrolling = true;
        
        const position = {
            x: event.clientX / window.innerWidth,
            y: event.clientY / window.innerHeight
        };
        
        this.registerInteraction('scroll', scrollIntensity, position);
        
        // Reset scrolling flag after delay
        setTimeout(() => {
            this.currentState.isScrolling = false;
            this.currentState.scrollVelocity *= 0.8;
        }, 100);
    }
    
    /**
     * Handle keyboard input with pattern analysis
     */
    handleKeyDown(event) {
        this.currentState.keyPressCount++;
        
        // Calculate intensity based on key type
        let intensity = 0.6;
        if (event.ctrlKey || event.altKey || event.metaKey) intensity += 0.2;
        if (event.shiftKey) intensity += 0.1;
        if (event.code.includes('Arrow')) intensity += 0.1;
        
        this.registerInteraction('key-press', intensity, this.currentState.mousePos);
        this.detectRhythm('keyboard');
    }
    
    /**
     * Handle touch events for mobile gesture analysis
     */
    handleTouchStart(event) {
        this.currentState.touchCount = event.touches.length;
        
        if (event.touches.length > 1) {
            this.registerInteraction('multi-touch', 0.9, this.currentState.mousePos);
        } else {
            this.registerInteraction('touch', 0.7, this.currentState.mousePos);
        }
    }
    
    handleTouchMove(event) {
        if (event.touches.length > 0) {
            const touch = event.touches[0];
            const position = {
                x: touch.clientX / window.innerWidth,
                y: touch.clientY / window.innerHeight
            };
            
            // Calculate touch velocity
            const deltaX = position.x - this.currentState.mousePos.x;
            const deltaY = position.y - this.currentState.mousePos.y;
            const velocity = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            this.currentState.mousePos = position;
            this.registerInteraction('gesture', velocity * 3, position);
        }
    }
    
    /**
     * Handle device orientation changes (mobile tilt)
     */
    handleDeviceOrientation(event) {
        const tiltIntensity = (Math.abs(event.beta) + Math.abs(event.gamma)) / 180;
        this.registerInteraction('tilt', Math.min(tiltIntensity, 1.0), this.currentState.mousePos);
    }
    
    /**
     * Register an interaction event and update analysis data
     */
    registerInteraction(type, intensity, position) {
        const now = performance.now();
        
        // Store interaction
        this.lastInteraction = {
            type,
            timestamp: now,
            position,
            intensity: Math.min(1.0, intensity)
        };
        
        // Add to event history
        this.eventHistory.push({
            type,
            timestamp: now,
            intensity,
            position: { ...position }
        });
        
        // Keep only recent events (last 2 seconds)
        this.eventHistory = this.eventHistory.filter(e => now - e.timestamp < 2000);
        
        // Update interaction energy
        this.currentState.interactionEnergy = Math.min(1.0, 
            this.currentState.interactionEnergy + intensity * 0.3
        );
        
        // Update dominant pattern
        this.updateDominantPattern(type, intensity);
    }
    
    /**
     * Detect rhythmic patterns in user interactions
     */
    detectRhythm(interactionType) {
        const now = performance.now();
        const timeSinceLastEvent = now - this.rhythmDetection.lastEventTime;
        
        if (this.rhythmDetection.lastEventTime > 0 && timeSinceLastEvent < 2000) {
            this.rhythmDetection.intervals.push(timeSinceLastEvent);
            
            // Keep only recent intervals
            if (this.rhythmDetection.intervals.length > 8) {
                this.rhythmDetection.intervals.shift();
            }
            
            // Calculate average interval
            if (this.rhythmDetection.intervals.length >= 3) {
                this.rhythmDetection.avgInterval = 
                    this.rhythmDetection.intervals.reduce((a, b) => a + b) / 
                    this.rhythmDetection.intervals.length;
                
                // Calculate rhythm strength (consistency)
                const variance = this.rhythmDetection.intervals.reduce((sum, interval) => {
                    const diff = interval - this.rhythmDetection.avgInterval;
                    return sum + diff * diff;
                }, 0) / this.rhythmDetection.intervals.length;
                
                // Lower variance = stronger rhythm
                this.rhythmDetection.rhythmStrength = Math.max(0, 1 - (variance / 10000));
            }
        }
        
        this.rhythmDetection.lastEventTime = now;
    }
    
    /**
     * Update dominant interaction pattern
     */
    updateDominantPattern(type, intensity) {
        const patternValue = this.INTERACTION_PATTERNS[type] || 0;
        this.analysisData.dominantPattern = patternValue;
        this.analysisData.patternIntensity = intensity;
        
        // Update interaction analysis
        this.analysisData.interaction = {
            type,
            intensity,
            frequency: this.calculateInteractionFrequency(),
            rhythm: this.rhythmDetection.rhythmStrength > 0.5 ? 'rhythmic' : 'random',
            inSync: this.rhythmDetection.rhythmStrength > 0.7
        };
    }
    
    /**
     * Calculate current interaction frequency (events per second)
     */
    calculateInteractionFrequency() {
        const now = performance.now();
        const recentEvents = this.eventHistory.filter(e => now - e.timestamp < 1000);
        return recentEvents.length; // Events in last second
    }
    
    /**
     * Main analysis loop - replaces audio analysis with user interaction analysis
     */
    calculateInteractionLevels() {
        if (!this.isActive) return;
        
        const now = performance.now();
        
        // Calculate interaction "frequency bands" equivalent to bass/mid/high
        
        // Movement (replaces bass) - large, slow movements
        const recentMovement = this.eventHistory.filter(e => 
            now - e.timestamp < 500 && 
            ['mousemove', 'gesture', 'tilt'].includes(e.type)
        );
        const movementIntensity = recentMovement.reduce((sum, e) => sum + e.intensity, 0) / 
            Math.max(1, recentMovement.length);
        
        // Velocity (replaces mid) - medium speed interactions
        const recentVelocity = this.eventHistory.filter(e => 
            now - e.timestamp < 300 && 
            ['scroll', 'drag', 'gesture'].includes(e.type)
        );
        const velocityIntensity = recentVelocity.reduce((sum, e) => sum + e.intensity, 0) / 
            Math.max(1, recentVelocity.length);
        
        // Precision (replaces high) - quick, precise actions
        const recentPrecision = this.eventHistory.filter(e => 
            now - e.timestamp < 200 && 
            ['click', 'key-press', 'double-click'].includes(e.type)
        );
        const precisionIntensity = recentPrecision.reduce((sum, e) => sum + e.intensity, 0) / 
            Math.max(1, recentPrecision.length);
        
        // Update raw values
        this.analysisData.movement = movementIntensity;
        this.analysisData.velocity = velocityIntensity;
        this.analysisData.precision = precisionIntensity;
        
        // Apply smoothing (same as audio system)
        const alpha = 0.15;
        this.analysisData.movementSmooth = this.analysisData.movementSmooth * (1 - alpha) + 
            this.analysisData.movement * alpha;
        this.analysisData.velocitySmooth = this.analysisData.velocitySmooth * (1 - alpha) + 
            this.analysisData.velocity * alpha;
        this.analysisData.precisionSmooth = this.analysisData.precisionSmooth * (1 - alpha) + 
            this.analysisData.precision * alpha;
        
        // Decay interaction energy
        this.currentState.interactionEnergy *= 0.98;
        
        // Log values occasionally for debugging
        if (Math.random() < 0.01) {
            const interactionInfo = this.analysisData.interaction.frequency > 0 
                ? `Pattern: ${this.analysisData.interaction.type} (${this.analysisData.interaction.frequency} events/sec)` 
                : 'No interaction pattern';
                
            console.log(`Interaction: Movement=${this.analysisData.movementSmooth.toFixed(2)} Velocity=${this.analysisData.velocitySmooth.toFixed(2)} Precision=${this.analysisData.precisionSmooth.toFixed(2)} | ${interactionInfo}`);
        }
    }
    
    /**
     * Start the analysis loop
     */
    startAnalysisLoop() {
        const analysisLoop = () => {
            this.calculateInteractionLevels();
            requestAnimationFrame(analysisLoop);
        };
        requestAnimationFrame(analysisLoop);
    }
    
    /**
     * Get interaction uniforms for WebGL integration (replaces audio uniforms)
     */
    getInteractionUniforms() {
        return {
            u_movementLevel: this.analysisData.movementSmooth,
            u_velocityLevel: this.analysisData.velocitySmooth,
            u_precisionLevel: this.analysisData.precisionSmooth,
            u_interactionEnergy: this.currentState.interactionEnergy,
            u_dominantPattern: this.analysisData.dominantPattern,
            u_patternIntensity: this.analysisData.patternIntensity,
            u_rhythmStrength: this.rhythmDetection.rhythmStrength,
            u_mousePos: [this.currentState.mousePos.x, this.currentState.mousePos.y],
            u_mouseVelocity: [this.currentState.mouseVelocity.x, this.currentState.mouseVelocity.y]
        };
    }
    
    /**
     * Generate parameter mappings (replaces audio parameter mappings)
     */
    generateParameterMappings() {
        const dissonanceFactor = this.analysisData.velocitySmooth * this.analysisData.precisionSmooth * 2.0;
        const energyFactor = (this.analysisData.movementSmooth + this.analysisData.velocitySmooth) * 0.5;
        const transientFactor = Math.max(0, this.analysisData.precisionSmooth - this.lastInteraction.intensity) * 2.0;
        
        // Calculate interaction-based "pitch" parameters
        let interactionHue = 0.5;
        let interactionSaturation = 0.8;
        let interactionBrightness = 0.9;
        let patternOffset = 0;
        
        // Map interaction patterns to visual parameters
        if (this.analysisData.interaction.frequency > 0) {
            // Map interaction type to hue
            interactionHue = this.INTERACTION_PATTERNS[this.analysisData.interaction.type] || 0;
            
            // Adjust saturation based on interaction intensity
            interactionSaturation = 0.5 + this.analysisData.interaction.intensity * 0.5;
            
            // Adjust brightness based on interaction frequency
            const frequencyFactor = Math.max(0, Math.min(1, this.analysisData.interaction.frequency / 10));
            interactionBrightness = 0.7 + frequencyFactor * 0.3;
            
            // Pattern offset based on rhythm consistency
            if (!this.analysisData.interaction.inSync) {
                patternOffset = this.rhythmDetection.rhythmStrength - 0.5; // -0.5 to 0.5
            }
        } else {
            // No interaction detected - use energy-based fallback
            interactionHue = (Date.now() * 0.0001) % 1.0;
            interactionSaturation = 0.5 + energyFactor * 0.5;
            interactionBrightness = 0.7 + this.analysisData.precisionSmooth * 0.3;
        }
        
        return {
            // Core parameters mapped to interaction bands
            morphFactor: {
                factor: this.analysisData.interaction.frequency > 0 
                    ? 0.4 + (this.analysisData.interaction.frequency / 10) * 0.8 + transientFactor * 0.5
                    : 0.8 + this.analysisData.velocitySmooth * 1.8 + transientFactor * 0.7,
                primary: 'interaction',
                secondary: 'transient',
                pulseThreshold: 0.3
            },
            
            dimension: {
                factor: this.analysisData.interaction.frequency > 0
                    ? 3.0 + (this.INTERACTION_PATTERNS[this.analysisData.interaction.type] || 0) * 2.0
                    : 3.65 + this.analysisData.movementSmooth * 0.6 + this.analysisData.velocitySmooth * 0.3,
                primary: 'interaction',
                secondary: 'movement',
                pulseThreshold: 0.4
            },
            
            rotationSpeed: {
                factor: this.analysisData.interaction.frequency > 0
                    ? 0.2 + (this.analysisData.interaction.frequency / 8) * 2.0 + this.analysisData.velocitySmooth * 1.0
                    : 0.8 + this.analysisData.velocitySmooth * 3.0 + this.analysisData.precisionSmooth * 2.0,
                primary: 'interaction',
                secondary: 'velocity',
                pulseThreshold: 0.25
            },
            
            gridDensity: {
                factor: this.analysisData.interaction.frequency > 0
                    ? 4.0 + ((this.analysisData.interaction.frequency % 3) * 3.0) + this.analysisData.movementSmooth * 6.0
                    : 8.5 + this.analysisData.movementSmooth * 2.2 + transientFactor * 0.7,
                primary: 'interaction',
                secondary: 'movement',
                pulseThreshold: 0.4
            },
            
            lineThickness: {
                factor: this.analysisData.interaction.frequency > 0
                    ? 0.05 - ((this.analysisData.interaction.frequency - 2) / 6) * 0.03
                    : 0.05 - this.analysisData.precisionSmooth * 0.02 + this.analysisData.movementSmooth * 0.01,
                primary: 'interaction',
                secondary: 'precision',
                pulseThreshold: 0.5,
                inverse: true
            },
            
            patternIntensity: {
                factor: this.analysisData.interaction.frequency > 0
                    ? 0.7 + Math.abs(patternOffset) * 1.5 + transientFactor * 0.5
                    : 1.3 + this.analysisData.velocitySmooth * 1.5 + transientFactor * 1.1,
                primary: 'pattern',
                secondary: 'transient',
                pulseThreshold: 0.25
            },
            
            colorShift: {
                factor: this.analysisData.interaction.frequency > 0
                    ? patternOffset * 2.0  // -1.0 to 1.0 range
                    : (dissonanceFactor * 1.5) + (energyFactor - 0.1) * 0.8,
                primary: 'pattern',
                secondary: 'energy',
                pulseThreshold: 0.3,
                bipolar: true
            },
            
            // Visual color parameters
            hue: interactionHue,
            saturation: interactionSaturation,
            brightness: interactionBrightness,
            rgbOffset: patternOffset,
            
            // Additional reactive parameters
            interactionEnergy: this.currentState.interactionEnergy,
            rhythmStrength: this.rhythmDetection.rhythmStrength
        };
    }
    
    /**
     * Get current status for debugging
     */
    getStatus() {
        return {
            active: this.isActive,
            recentEvents: this.eventHistory.length,
            interactionEnergy: this.currentState.interactionEnergy,
            dominantPattern: this.analysisData.interaction.type,
            rhythmStrength: this.rhythmDetection.rhythmStrength,
            currentBands: {
                movement: this.analysisData.movementSmooth,
                velocity: this.analysisData.velocitySmooth,
                precision: this.analysisData.precisionSmooth
            }
        };
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserEventReactiveCore;
}

// Global window export
if (typeof window !== 'undefined') {
    window.UserEventReactiveCore = UserEventReactiveCore;
    console.log('🎮 User Event Reactive Core loaded and exported to window');
}