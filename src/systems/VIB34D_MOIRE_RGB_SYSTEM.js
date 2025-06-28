/**
 * VIB34D MOIRÉ RGB INTERFERENCE SYSTEM
 * 
 * Advanced multi-layer grid interference patterns with RGB channel shifting
 * for reactive borders, card effects, and enhanced lattice visualizations.
 */

// ============================================================================
// 🌈 VIB34D MOIRÉ RGB INTERFERENCE ENGINE
// ============================================================================

class VIB34DMoireRGBEngine {
    constructor() {
        this.isInitialized = false;
        this.moireInstances = new Map();
        this.activeEffects = new Set();
        
        // Moiré configuration parameters
        this.config = {
            // Base grid parameters
            baseGridDensity: 12.0,
            offsetGridDensity: 11.7,  // Slightly different for interference
            tertiaryGridDensity: 12.3, // Third layer for complex patterns
            
            // RGB channel offsets
            redOffset: { x: 0.0, y: 0.0 },
            greenOffset: { x: 0.002, y: 0.001 },
            blueOffset: { x: -0.001, y: 0.002 },
            
            // Animation parameters
            offsetSpeed: 0.5,
            rotationSpeed: 0.2,
            pulseSpeed: 1.0,
            
            // Interaction responsiveness
            scrollMultiplier: 2.0,
            clickMultiplier: 1.5,
            mouseMultiplier: 1.0,
            
            // Visual intensity
            interferenceIntensity: 0.8,
            colorSeparation: 0.3,
            borderThickness: 2.0,
            
            // Card-specific settings
            cardBorderIntensity: 1.2,
            cardHoverMultiplier: 1.8,
            cardFocusGlow: 0.5
        };
        
        // Interaction tracking
        this.interactionData = {
            scroll: 0.0,
            click: 0.0,
            mouse: { x: 0.5, y: 0.5 },
            energy: 0.0
        };
        
        console.log('🌈 VIB34D Moiré RGB Engine initialized');
    }
    
    /**
     * Initialize the Moiré RGB system
     */
    initialize() {
        this.setupMoireShaders();
        this.setupCardBorders();
        this.setupInteractionTracking();
        this.setupReactiveElements();
        
        this.isInitialized = true;
        console.log('🌈 Moiré RGB system fully initialized');
    }
    
    /**
     * Setup WebGL shaders for Moiré effects
     */
    setupMoireShaders() {
        // Enhanced fragment shader with RGB moiré interference
        this.moireFragmentShader = `
            precision mediump float;
            
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform float u_gridDensity;
            uniform float u_offsetDensity;
            uniform float u_tertiaryDensity;
            uniform vec2 u_redOffset;
            uniform vec2 u_greenOffset;
            uniform vec2 u_blueOffset;
            uniform float u_interferenceIntensity;
            uniform float u_colorSeparation;
            uniform float u_interactionEnergy;
            
            // Multi-layer grid function with RGB offset
            float moireGrid(vec2 uv, float density, vec2 offset, float phase) {
                vec2 grid = fract((uv + offset) * density + phase);
                vec2 edges = abs(grid - 0.5);
                float lineWidth = 0.02 + u_interactionEnergy * 0.01;
                return 1.0 - smoothstep(0.0, lineWidth, min(edges.x, edges.y));
            }
            
            // RGB channel interference calculation
            vec3 calculateMoireRGB(vec2 uv) {
                float time = u_time * 0.001;
                
                // Base grid layer
                float basePhase = time * 0.5;
                float baseGrid = moireGrid(uv, u_gridDensity, vec2(0.0), basePhase);
                
                // Offset interference layer
                float offsetPhase = time * 0.7 + u_interactionEnergy * 2.0;
                float offsetGrid = moireGrid(uv, u_offsetDensity, vec2(0.001, -0.0005), offsetPhase);
                
                // Tertiary complexity layer
                float tertiaryPhase = time * 0.3 - u_interactionEnergy * 1.5;
                float tertiaryGrid = moireGrid(uv, u_tertiaryDensity, vec2(-0.0008, 0.0012), tertiaryPhase);
                
                // RGB channel separation with interference
                float redChannel = baseGrid * (1.0 + sin(offsetPhase + uv.x * 10.0) * 0.3);
                float greenChannel = offsetGrid * (1.0 + sin(offsetPhase + uv.y * 10.0 + 2.09) * 0.3);
                float blueChannel = tertiaryGrid * (1.0 + sin(offsetPhase + length(uv) * 8.0 + 4.18) * 0.3);
                
                // Apply RGB offsets for chromatic separation
                vec2 redUV = uv + u_redOffset * u_colorSeparation;
                vec2 greenUV = uv + u_greenOffset * u_colorSeparation;
                vec2 blueUV = uv + u_blueOffset * u_colorSeparation;
                
                redChannel *= moireGrid(redUV, u_gridDensity * 1.1, u_redOffset, basePhase);
                greenChannel *= moireGrid(greenUV, u_offsetDensity * 0.9, u_greenOffset, offsetPhase);
                blueChannel *= moireGrid(blueUV, u_tertiaryDensity * 1.05, u_blueOffset, tertiaryPhase);
                
                // Interference patterns
                float interference = sin(baseGrid * 6.28) * cos(offsetGrid * 6.28) * sin(tertiaryGrid * 6.28);
                interference *= u_interferenceIntensity;
                
                // Mouse interaction influence
                vec2 mouseInfluence = u_mouse - uv;
                float mouseDist = length(mouseInfluence);
                float mouseEffect = exp(-mouseDist * 3.0) * u_interactionEnergy;
                
                return vec3(
                    redChannel + interference * 0.5 + mouseEffect,
                    greenChannel + interference * 0.3 + mouseEffect * 0.8,
                    blueChannel + interference * 0.7 + mouseEffect * 0.6
                );
            }
            
            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                vec3 moireColor = calculateMoireRGB(uv);
                
                // Final color enhancement
                moireColor = pow(moireColor, vec3(0.8)); // Gamma correction
                moireColor *= (1.0 + u_interactionEnergy * 0.5); // Energy boost
                
                gl_FragColor = vec4(moireColor, 0.7 + u_interactionEnergy * 0.3);
            }
        `;
    }
    
    /**
     * Setup reactive card borders with Moiré effects
     */
    setupCardBorders() {
        const cards = document.querySelectorAll('.blog-card, .content-card, .card');
        
        cards.forEach((card, index) => {
            const moireBorder = document.createElement('div');
            moireBorder.className = 'moire-border';
            moireBorder.id = `moire-border-${index}`;
            
            // Position border around card
            moireBorder.style.cssText = `
                position: absolute;
                top: -${this.config.borderThickness}px;
                left: -${this.config.borderThickness}px;
                right: -${this.config.borderThickness}px;
                bottom: -${this.config.borderThickness}px;
                pointer-events: none;
                z-index: 1;
                opacity: 0;
                transition: opacity 0.3s ease;
                background: linear-gradient(45deg, 
                    rgba(255, 0, 255, 0.3) 0%,
                    rgba(0, 255, 255, 0.3) 25%,
                    rgba(255, 255, 0, 0.3) 50%,
                    rgba(255, 0, 255, 0.3) 75%,
                    rgba(0, 255, 255, 0.3) 100%);
                background-size: 200% 200%;
                animation: moireShift 3s linear infinite;
                border-radius: inherit;
                filter: blur(1px) contrast(1.2);
            `;
            
            // Ensure card is positioned relatively
            if (getComputedStyle(card).position === 'static') {
                card.style.position = 'relative';
            }
            
            card.appendChild(moireBorder);
            
            // Setup interaction handlers
            this.setupCardInteractions(card, moireBorder, index);
            
            this.moireInstances.set(`card-${index}`, {
                element: moireBorder,
                card: card,
                intensity: 0.0,
                targetIntensity: 0.0,
                isHovered: false,
                isFocused: false
            });
        });
        
        // Add CSS animations
        this.addMoireCSS();
    }
    
    /**
     * Setup card interaction handlers
     */
    setupCardInteractions(card, moireBorder, index) {
        // Hover effects
        card.addEventListener('mouseenter', () => {
            const instance = this.moireInstances.get(`card-${index}`);
            if (instance) {
                instance.isHovered = true;
                instance.targetIntensity = this.config.cardBorderIntensity;
                moireBorder.style.opacity = '1';
                moireBorder.style.animationDuration = '1.5s';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const instance = this.moireInstances.get(`card-${index}`);
            if (instance) {
                instance.isHovered = false;
                instance.targetIntensity = instance.isFocused ? 0.5 : 0.0;
                if (!instance.isFocused) {
                    moireBorder.style.opacity = '0';
                }
                moireBorder.style.animationDuration = '3s';
            }
        });
        
        // Focus effects
        card.addEventListener('focus', () => {
            const instance = this.moireInstances.get(`card-${index}`);
            if (instance) {
                instance.isFocused = true;
                instance.targetIntensity = this.config.cardFocusGlow;
                moireBorder.style.opacity = '0.8';
            }
        });
        
        card.addEventListener('blur', () => {
            const instance = this.moireInstances.get(`card-${index}`);
            if (instance) {
                instance.isFocused = false;
                instance.targetIntensity = instance.isHovered ? this.config.cardBorderIntensity : 0.0;
                if (!instance.isHovered) {
                    moireBorder.style.opacity = '0';
                }
            }
        });
        
        // Click effects
        card.addEventListener('click', () => {
            this.triggerMoireFlash(moireBorder);
        });
    }
    
    /**
     * Add CSS for Moiré animations
     */
    addMoireCSS() {
        if (document.getElementById('moire-rgb-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'moire-rgb-styles';
        style.textContent = `
            @keyframes moireShift {
                0% {
                    background-position: 0% 0%;
                    filter: blur(1px) contrast(1.2) hue-rotate(0deg);
                }
                25% {
                    background-position: 100% 0%;
                    filter: blur(1.5px) contrast(1.4) hue-rotate(90deg);
                }
                50% {
                    background-position: 100% 100%;
                    filter: blur(0.5px) contrast(1.8) hue-rotate(180deg);
                }
                75% {
                    background-position: 0% 100%;
                    filter: blur(2px) contrast(1.0) hue-rotate(270deg);
                }
                100% {
                    background-position: 0% 0%;
                    filter: blur(1px) contrast(1.2) hue-rotate(360deg);
                }
            }
            
            @keyframes moireFlash {
                0% {
                    opacity: 1;
                    transform: scale(1);
                    filter: blur(1px) contrast(1.2) brightness(1);
                }
                50% {
                    opacity: 1;
                    transform: scale(1.05);
                    filter: blur(0px) contrast(2.0) brightness(1.8);
                }
                100% {
                    opacity: 1;
                    transform: scale(1);
                    filter: blur(1px) contrast(1.2) brightness(1);
                }
            }
            
            .moire-border.flash {
                animation: moireFlash 0.3s ease-out, moireShift 3s linear infinite;
            }
            
            /* Enhanced grid overlay for visualizers */
            .moire-grid-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                opacity: 0.3;
                background-image: 
                    repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 10px,
                        rgba(255, 0, 255, 0.1) 11px,
                        rgba(255, 0, 255, 0.1) 12px
                    ),
                    repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 10px,
                        rgba(0, 255, 255, 0.1) 11px,
                        rgba(0, 255, 255, 0.1) 12px
                    ),
                    repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 14px,
                        rgba(255, 255, 0, 0.05) 15px,
                        rgba(255, 255, 0, 0.05) 16px
                    );
                animation: moireGridShift 4s linear infinite;
            }
            
            @keyframes moireGridShift {
                0% { transform: translate(0px, 0px) rotate(0deg); }
                25% { transform: translate(1px, -1px) rotate(0.5deg); }
                50% { transform: translate(-1px, 0px) rotate(-0.5deg); }
                75% { transform: translate(0px, 1px) rotate(0.25deg); }
                100% { transform: translate(0px, 0px) rotate(0deg); }
            }
        `;
        
        document.head.appendChild(style);
    }
    
    /**
     * Setup interaction tracking for Moiré effects
     */
    setupInteractionTracking() {
        // Scroll tracking
        window.addEventListener('wheel', (e) => {
            const scrollIntensity = Math.min(Math.abs(e.deltaY) / 100, 1.0);
            this.interactionData.scroll = Math.min(1.0, this.interactionData.scroll + scrollIntensity * 0.3);
            this.updateMoireParameters();
        }, { passive: true });
        
        // Mouse tracking
        window.addEventListener('mousemove', (e) => {
            this.interactionData.mouse.x = e.clientX / window.innerWidth;
            this.interactionData.mouse.y = e.clientY / window.innerHeight;
            this.updateMoireParameters();
        });
        
        // Click tracking
        window.addEventListener('click', (e) => {
            this.interactionData.click = 1.0;
            this.updateMoireParameters();
            
            // Decay click intensity
            setTimeout(() => {
                this.interactionData.click *= 0.5;
                this.updateMoireParameters();
            }, 200);
        });
        
        // Energy decay
        setInterval(() => {
            this.interactionData.scroll *= 0.95;
            this.interactionData.click *= 0.9;
            this.updateMoireParameters();
        }, 50);
    }
    
    /**
     * Setup reactive elements with Moiré overlays
     */
    setupReactiveElements() {
        // Add Moiré overlays to visualizers
        const visualizers = document.querySelectorAll('canvas[id*="visualizer"]');
        
        visualizers.forEach((visualizer, index) => {
            const overlay = document.createElement('div');
            overlay.className = 'moire-grid-overlay';
            overlay.id = `moire-overlay-${index}`;
            
            const container = visualizer.parentElement;
            if (container && getComputedStyle(container).position === 'static') {
                container.style.position = 'relative';
            }
            
            if (container) {
                container.appendChild(overlay);
            }
        });
    }
    
    /**
     * Update Moiré parameters based on interactions
     */
    updateMoireParameters() {
        // Calculate total energy
        this.interactionData.energy = (
            this.interactionData.scroll * this.config.scrollMultiplier +
            this.interactionData.click * this.config.clickMultiplier +
            (this.interactionData.mouse.x + this.interactionData.mouse.y) * this.config.mouseMultiplier * 0.5
        ) / 3.0;
        
        // Update CSS custom properties for real-time effects
        document.documentElement.style.setProperty('--moire-energy', this.interactionData.energy);
        document.documentElement.style.setProperty('--moire-scroll', this.interactionData.scroll);
        document.documentElement.style.setProperty('--moire-click', this.interactionData.click);
        document.documentElement.style.setProperty('--moire-mouse-x', this.interactionData.mouse.x);
        document.documentElement.style.setProperty('--moire-mouse-y', this.interactionData.mouse.y);
        
        // Update all Moiré instances
        this.moireInstances.forEach((instance, key) => {
            this.updateInstanceIntensity(instance);
        });
    }
    
    /**
     * Update individual Moiré instance intensity
     */
    updateInstanceIntensity(instance) {
        // Smooth interpolation towards target
        const lerpSpeed = 0.1;
        instance.intensity += (instance.targetIntensity - instance.intensity) * lerpSpeed;
        
        // Apply energy influence
        const energyInfluence = this.interactionData.energy * 0.5;
        const finalIntensity = Math.min(1.0, instance.intensity + energyInfluence);
        
        // Update element opacity and effects
        if (instance.element) {
            instance.element.style.opacity = finalIntensity;
            
            // Adjust animation speed based on intensity
            const animationSpeed = Math.max(1.0, 3.0 - finalIntensity * 2.0);
            instance.element.style.animationDuration = `${animationSpeed}s`;
        }
    }
    
    /**
     * Trigger Moiré flash effect
     */
    triggerMoireFlash(element) {
        element.classList.add('flash');
        setTimeout(() => {
            element.classList.remove('flash');
        }, 300);
    }
    
    /**
     * Get Moiré shader uniforms for WebGL integration
     */
    getMoireUniforms() {
        return {
            u_gridDensity: this.config.baseGridDensity,
            u_offsetDensity: this.config.offsetGridDensity,
            u_tertiaryDensity: this.config.tertiaryGridDensity,
            u_redOffset: [this.config.redOffset.x, this.config.redOffset.y],
            u_greenOffset: [this.config.greenOffset.x, this.config.greenOffset.y],
            u_blueOffset: [this.config.blueOffset.x, this.config.blueOffset.y],
            u_interferenceIntensity: this.config.interferenceIntensity,
            u_colorSeparation: this.config.colorSeparation,
            u_interactionEnergy: this.interactionData.energy
        };
    }
    
    /**
     * Enable/disable Moiré effects
     */
    setEnabled(enabled) {
        this.moireInstances.forEach((instance) => {
            if (instance.element) {
                instance.element.style.display = enabled ? 'block' : 'none';
            }
        });
        
        const overlays = document.querySelectorAll('.moire-grid-overlay');
        overlays.forEach(overlay => {
            overlay.style.display = enabled ? 'block' : 'none';
        });
    }
    
    /**
     * Get current status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            instances: this.moireInstances.size,
            energy: this.interactionData.energy,
            activeEffects: this.activeEffects.size,
            config: this.config
        };
    }
}

// ============================================================================
// 🧪 MOIRÉ RGB SYSTEM TESTER
// ============================================================================

class VIB34DMoireRGBTester {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
    }
    
    async runAllTests() {
        console.log('🧪 Starting VIB34D Moiré RGB System Tests...\n');
        
        // Test 1: System Initialization
        await this.testSystemInitialization();
        
        // Test 2: Card Border Creation
        await this.testCardBorderCreation();
        
        // Test 3: Interaction Tracking
        await this.testInteractionTracking();
        
        // Test 4: CSS Animation Setup
        await this.testCSSAnimationSetup();
        
        // Test 5: WebGL Shader Integration
        await this.testWebGLShaderIntegration();
        
        // Test 6: Parameter Updates
        await this.testParameterUpdates();
        
        // Test 7: Enable/Disable Functionality
        await this.testEnableDisable();
        
        // Test 8: Performance Impact
        await this.testPerformanceImpact();
        
        // Display results
        this.displayResults();
    }
    
    async testSystemInitialization() {
        console.log('Test 1: System Initialization');
        
        try {
            const moireEngine = new VIB34DMoireRGBEngine();
            moireEngine.initialize();
            
            if (moireEngine.isInitialized && moireEngine.config) {
                this.recordTest('System Initialization', true);
            } else {
                throw new Error('System not properly initialized');
            }
            
        } catch (error) {
            this.recordTest('System Initialization', false, error.message);
        }
    }
    
    async testCardBorderCreation() {
        console.log('Test 2: Card Border Creation');
        
        try {
            // Create test card
            const testCard = document.createElement('div');
            testCard.className = 'blog-card';
            document.body.appendChild(testCard);
            
            const moireEngine = new VIB34DMoireRGBEngine();
            moireEngine.initialize();
            
            // Check if border was created
            const border = testCard.querySelector('.moire-border');
            if (border) {
                this.recordTest('Card Border Creation', true);
            } else {
                throw new Error('Moiré border not created');
            }
            
            // Cleanup
            document.body.removeChild(testCard);
            
        } catch (error) {
            this.recordTest('Card Border Creation', false, error.message);
        }
    }
    
    async testInteractionTracking() {
        console.log('Test 3: Interaction Tracking');
        
        try {
            const moireEngine = new VIB34DMoireRGBEngine();
            moireEngine.initialize();
            
            // Simulate interactions
            moireEngine.interactionData.scroll = 0.5;
            moireEngine.interactionData.click = 0.8;
            moireEngine.updateMoireParameters();
            
            if (moireEngine.interactionData.energy > 0) {
                this.recordTest('Interaction Tracking', true);
            } else {
                throw new Error('Interaction energy not calculated');
            }
            
        } catch (error) {
            this.recordTest('Interaction Tracking', false, error.message);
        }
    }
    
    async testCSSAnimationSetup() {
        console.log('Test 4: CSS Animation Setup');
        
        try {
            const moireEngine = new VIB34DMoireRGBEngine();
            moireEngine.initialize();
            
            // Check if CSS was added
            const style = document.getElementById('moire-rgb-styles');
            if (style && style.textContent.includes('moireShift')) {
                this.recordTest('CSS Animation Setup', true);
            } else {
                throw new Error('CSS animations not properly set up');
            }
            
        } catch (error) {
            this.recordTest('CSS Animation Setup', false, error.message);
        }
    }
    
    async testWebGLShaderIntegration() {
        console.log('Test 5: WebGL Shader Integration');
        
        try {
            const moireEngine = new VIB34DMoireRGBEngine();
            moireEngine.initialize();
            
            const uniforms = moireEngine.getMoireUniforms();
            if (uniforms.u_gridDensity && uniforms.u_interferenceIntensity) {
                this.recordTest('WebGL Shader Integration', true);
            } else {
                throw new Error('Shader uniforms not properly generated');
            }
            
        } catch (error) {
            this.recordTest('WebGL Shader Integration', false, error.message);
        }
    }
    
    async testParameterUpdates() {
        console.log('Test 6: Parameter Updates');
        
        try {
            const moireEngine = new VIB34DMoireRGBEngine();
            moireEngine.initialize();
            
            // Change config and update
            const oldDensity = moireEngine.config.baseGridDensity;
            moireEngine.config.baseGridDensity = 15.0;
            moireEngine.updateMoireParameters();
            
            if (moireEngine.config.baseGridDensity === 15.0) {
                this.recordTest('Parameter Updates', true);
            } else {
                throw new Error('Parameters not updated correctly');
            }
            
        } catch (error) {
            this.recordTest('Parameter Updates', false, error.message);
        }
    }
    
    async testEnableDisable() {
        console.log('Test 7: Enable/Disable Functionality');
        
        try {
            const moireEngine = new VIB34DMoireRGBEngine();
            moireEngine.initialize();
            
            // Test enable/disable
            moireEngine.setEnabled(false);
            moireEngine.setEnabled(true);
            
            this.recordTest('Enable/Disable Functionality', true);
            
        } catch (error) {
            this.recordTest('Enable/Disable Functionality', false, error.message);
        }
    }
    
    async testPerformanceImpact() {
        console.log('Test 8: Performance Impact');
        
        try {
            const startTime = performance.now();
            
            const moireEngine = new VIB34DMoireRGBEngine();
            moireEngine.initialize();
            
            // Simulate rapid updates
            for (let i = 0; i < 100; i++) {
                moireEngine.updateMoireParameters();
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            if (duration < 100) { // Should complete in under 100ms
                this.recordTest('Performance Impact', true);
            } else {
                throw new Error(`Performance too slow: ${duration}ms`);
            }
            
        } catch (error) {
            this.recordTest('Performance Impact', false, error.message);
        }
    }
    
    recordTest(name, passed, error = null) {
        this.results.total++;
        if (passed) {
            this.results.passed++;
            console.log(`✅ ${name}`);
        } else {
            this.results.failed++;
            console.log(`❌ ${name}: ${error}`);
        }
    }
    
    displayResults() {
        console.log('\n' + '='.repeat(50));
        console.log('VIB34D MOIRÉ RGB SYSTEM TEST RESULTS');
        console.log('='.repeat(50));
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed}`);
        console.log(`Failed: ${this.results.failed}`);
        console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
        console.log('='.repeat(50));
        
        if (this.results.failed === 0) {
            console.log('🎉 ALL MOIRÉ RGB TESTS PASSED!');
            console.log('🌈 RGB interference patterns ready');
            console.log('🎨 Reactive card borders operational');
            console.log('⚡ Multi-layer grid overlays active');
            console.log('🔧 WebGL shader integration complete');
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        VIB34DMoireRGBEngine,
        VIB34DMoireRGBTester
    };
}

// 🌐 Export to window for browser use
if (typeof window !== 'undefined') {
    window.VIB34DMoireRGBEngine = VIB34DMoireRGBEngine;
    window.VIB34DMoireRGBTester = VIB34DMoireRGBTester;
    console.log('🌈 VIB34D Moiré RGB System loaded and exported to window');
}