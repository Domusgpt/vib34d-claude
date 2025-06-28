// INTEGRATED MORPHING BLOG SYSTEM WITH USER INTERACTION PARAMETERS
class VIB34DMorphingBlogSystem {
    constructor() {
        this.visualizers = [];
        this.currentState = 0;
        this.currentGeometry = 0;
        this.isTransitioning = false;
        
        // Global parameters (driven by user interactions)
        this.globalParams = {
            morphFactor: 0.5,
            dimension: 3.5,
            glitchIntensity: 0.5,
            rotationSpeed: 0.5,
            gridDensity: 12.0,
            interactionIntensity: 0.3
        };
        
        // User interaction state
        this.interactionState = {
            mouseX: 0.5,
            mouseY: 0.5,
            isClicking: false,
            isHolding: false,
            scrollVelocity: 0,
            lastActivity: Date.now(),
            hoverIntensity: 0,
            clickCount: 0
        };
        
        this.layoutNames = ['HOME', 'TECH', 'MEDIA', 'INNOVATION', 'RESEARCH'];
        this.layoutClasses = ['layout-home', 'layout-tech', 'layout-media', 'layout-innovation', 'layout-research'];
        this.geometryNames = ['hypercube', 'tetrahedron', 'sphere', 'torus', 'klein', 'fractal', 'wave', 'crystal'];
        
        // Geometry configurations
        this.geometryColors = [
            [1.0, 0.0, 1.0],    // Hypercube - Magenta
            [0.0, 1.0, 1.0],    // Tetrahedron - Cyan
            [1.0, 1.0, 0.0],    // Sphere - Yellow
            [0.0, 1.0, 0.0],    // Torus - Green
            [1.0, 0.5, 0.0],    // Klein - Orange
            [0.5, 0.0, 1.0],    // Fractal - Purple
            [1.0, 0.0, 0.5],    // Wave - Pink
            [0.0, 1.0, 0.5]     // Crystal - Mint
        ];
        
        this.initialize();
    }
    
    initialize() {
        console.log('🎨 Initializing VIB34D Morphing Blog System...');
        
        // Create board visualizer
        const boardViz = new VIB34DReactiveCore(
            document.getElementById('board-visualizer'),
            this.currentGeometry,
            this.geometryColors[this.currentGeometry],
            'board'
        );
        this.visualizers.push(boardViz);
        
        // Create card visualizers
        for (let i = 1; i <= 6; i++) {
            const cardViz = new VIB34DReactiveCore(
                document.getElementById(`card-visualizer-${i}`),
                this.currentGeometry,
                this.geometryColors[this.currentGeometry],
                'card'
            );
            this.visualizers.push(cardViz);
        }
        
        this.setupLayoutControls();
        this.setupCardInteractions();
        
        console.log('✅ VIB34D Morphing Blog System ready - 7 visualizers with user interaction control');
    }
    
    setupCardInteractions() {
        // Enhanced card hover effects with ecosystem reactions
        document.querySelectorAll('.blog-card').forEach((card, index) => {
            card.addEventListener('mouseenter', () => {
                // Section hover enlargement
                card.setAttribute('data-section-hover', 'true');
                
                // Set inverse effect on other cards
                document.querySelectorAll('.blog-card').forEach((otherCard, otherIndex) => {
                    if (otherIndex !== index) {
                        otherCard.setAttribute('data-inverse', 'true');
                    }
                });
                
                // Boost glitch intensity for hovered card
                this.globalParams.glitchIntensity = 0.8;
                this.globalParams.interactionIntensity = 0.9;
                
                // Update CSS variables
                document.documentElement.style.setProperty('--section-focus', index);
                document.documentElement.style.setProperty('--global-energy', '1.0');
                
                this.updateAllVisualizers();
            });
            
            card.addEventListener('mouseleave', () => {
                // Remove section hover
                card.removeAttribute('data-section-hover');
                
                // Remove inverse effect from all cards
                document.querySelectorAll('.blog-card').forEach(otherCard => {
                    otherCard.removeAttribute('data-inverse');
                });
                
                // Return to normal glitch levels
                this.globalParams.glitchIntensity = 0.5;
                this.globalParams.interactionIntensity = 0.3;
                
                // Reset CSS variables
                document.documentElement.style.setProperty('--section-focus', '0');
                document.documentElement.style.setProperty('--global-energy', '0.5');
                
                this.updateAllVisualizers();
            });
        });
    }
    
    setupLayoutControls() {
        document.querySelectorAll('.state-dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.triggerLayoutTransition(index);
                
                document.querySelectorAll('.state-dot').forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
            });
        });
    }
    
    handleLayoutScroll(direction) {
        if (this.isTransitioning) return;
        
        const newState = (this.currentState + direction + 5) % 5;
        this.triggerLayoutTransition(newState);
    }
    
    triggerLayoutTransition(newState) {
        if (newState === this.currentState || this.isTransitioning) return;
        
        console.log(`🎭 MORPHING BLOG TRANSITION TO: ${this.layoutNames[newState]}`);
        
        this.isTransitioning = true;
        this.currentState = newState;
        
        // Change layout class
        const blogContainer = document.getElementById('blogContainer');
        blogContainer.className = `blog-container ${this.layoutClasses[newState]}`;
        
        // Update parameter displays
        document.getElementById('layout-display').textContent = this.layoutNames[newState];
        
        // Enhanced visualizer reactions during transition
        this.globalParams.interactionIntensity = 1.5;
        this.globalParams.rotationSpeed = Math.min(2.0, this.globalParams.rotationSpeed + 0.3);
        this.updateAllVisualizers();
        
        // Return to normal after transition
        setTimeout(() => {
            this.isTransitioning = false;
            this.globalParams.interactionIntensity = 0.3;
            this.globalParams.rotationSpeed = Math.max(0.5, this.globalParams.rotationSpeed - 0.3);
            this.updateAllVisualizers();
        }, 800);
    }
    
    switchGeometry(geometryIndex) {
        this.currentGeometry = geometryIndex;
        const geometryName = this.geometryNames[geometryIndex];
        const geometryColor = this.geometryColors[geometryIndex];
        
        console.log(`🔄 Switching to geometry: ${geometryName} (${geometryIndex})`);
        
        // Update all visualizers to new geometry
        this.visualizers.forEach(visualizer => {
            visualizer.params.geometry = geometryIndex;
            visualizer.params.baseColor = geometryColor;
        });
        
        // Update parameter display
        document.getElementById('geometry-display').textContent = geometryName;
        
        // Brief boost to show the change
        this.globalParams.interactionIntensity = 1.0;
        this.updateAllVisualizers();
        
        setTimeout(() => {
            this.globalParams.interactionIntensity = 0.3;
            this.updateAllVisualizers();
        }, 300);
    }
    
    updateAllVisualizers(newParams = {}) {
        // Update global parameters
        Object.assign(this.globalParams, newParams);

        // Update all visualizers with current global parameters
        this.visualizers.forEach(visualizer => {
            visualizer.updateParams(this.globalParams);
        });
        
        // Update CSS variables for UI feedback
        document.documentElement.style.setProperty('--morph-factor', this.globalParams.morphFactor);
        document.documentElement.style.setProperty('--dimension-value', this.globalParams.dimension);
        document.documentElement.style.setProperty('--glitch-intensity', this.globalParams.glitchIntensity);
        document.documentElement.style.setProperty('--rotation-speed', this.globalParams.rotationSpeed);
        document.documentElement.style.setProperty('--grid-density', this.globalParams.gridDensity);
        document.documentElement.style.setProperty('--interaction-intensity', this.globalParams.interactionIntensity);
    }
}