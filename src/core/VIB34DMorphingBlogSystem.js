
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
        
        this.setupUserInteractionSystem();
        this.setupLayoutControls();
        this.setupCardInteractions();
        this.startParameterUpdateLoop();
        
        console.log('✅ VIB34D Morphing Blog System ready - 7 visualizers with user interaction control');
    }
    
    setupUserInteractionSystem() {
        console.log('🎮 Setting up user interaction parameter system...');
        
        // MOUSE MOVEMENT - affects morphFactor and dimension
        document.addEventListener('mousemove', (e) => {
            this.interactionState.mouseX = e.clientX / window.innerWidth;
            this.interactionState.mouseY = 1.0 - (e.clientY / window.innerHeight);
            this.interactionState.lastActivity = Date.now();
            
            // Mouse position affects morphFactor (0.0 to 1.5)
            this.globalParams.morphFactor = this.interactionState.mouseX * 1.5;
            
            // Mouse Y position affects dimension (3.0 to 4.5)
            this.globalParams.dimension = 3.0 + (this.interactionState.mouseY * 1.5);
            
            this.updateParameterDisplays();
            this.updateAllVisualizers();
            
            // Update all visualizer mouse positions
            this.visualizers.forEach(viz => {
                viz.interactionState.mouseX = this.interactionState.mouseX;
                viz.interactionState.mouseY = this.interactionState.mouseY;
            });
        });
        
        // CLICK EVENTS - affects rotation speed and interaction intensity
        document.addEventListener('mousedown', (e) => {
            this.interactionState.isClicking = true;
            this.interactionState.isHolding = true;
            this.interactionState.clickCount++;
            
            // Click increases rotation speed temporarily
            this.globalParams.rotationSpeed = Math.min(2.0, 0.5 + (this.interactionState.clickCount * 0.2));
            this.globalParams.interactionIntensity = 1.0;
            
            this.updateParameterDisplays();
            this.updateAllVisualizers();
        });
        
        document.addEventListener('mouseup', (e) => {
            this.interactionState.isClicking = false;
            
            // Gradual return to base rotation speed
            setTimeout(() => {
                this.globalParams.rotationSpeed = Math.max(0.5, this.globalParams.rotationSpeed - 0.1);
                this.globalParams.interactionIntensity = 0.3;
                this.updateParameterDisplays();
                this.updateAllVisualizers();
            }, 200);
        });
        
        // SCROLL EVENTS - affects grid density
        document.addEventListener('wheel', (e) => {
            if (e.target.closest('.blog-card')) {
                // Card-specific scroll (for content)
                return;
            }
            
            e.preventDefault();
            
            this.interactionState.scrollVelocity = Math.abs(e.deltaY) / 100;
            
            // Check if this should trigger layout change
            if (Math.abs(e.deltaY) > 50) {
                this.handleLayoutScroll(e.deltaY > 0 ? 1 : -1);
            } else {
                // Small scroll affects grid density
                const scrollDirection = e.deltaY > 0 ? -1 : 1;
                this.globalParams.gridDensity = Math.max(5.0, Math.min(25.0, 
                    this.globalParams.gridDensity + scrollDirection * 1.0));
                
                this.updateParameterDisplays();
                this.updateAllVisualizers();
            }
        });
        
        // KEYBOARD EVENTS - geometry switching and parameter modulation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case '1': case '2': case '3': case '4':
                case '5': case '6': case '7': case '8':
                    const geometryIndex = parseInt(e.key) - 1;
                    this.switchGeometry(geometryIndex);
                    break;
                case 'ArrowUp':
                    this.globalParams.dimension = Math.min(4.5, this.globalParams.dimension + 0.1);
                    break;
                case 'ArrowDown':
                    this.globalParams.dimension = Math.max(3.0, this.globalParams.dimension - 0.1);
                    break;
                case 'ArrowLeft':
                    this.globalParams.rotationSpeed = Math.max(0.0, this.globalParams.rotationSpeed - 0.1);
                    break;
                case 'ArrowRight':
                    this.globalParams.rotationSpeed = Math.min(2.0, this.globalParams.rotationSpeed + 0.1);
                    break;
                case ' ': // Spacebar
                    e.preventDefault();
                    this.globalParams.glitchIntensity = this.globalParams.glitchIntensity > 0.5 ? 0.1 : 0.9;
                    break;
            }
            
            this.updateParameterDisplays();
            this.updateAllVisualizers();
        });
        
        console.log('✅ User interaction system active - parameters respond to mouse, scroll, click, keys');
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
                
                this.updateParameterDisplays();
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
                
                this.updateParameterDisplays();
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
    
    updateAllVisualizers() {
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
    
    updateParameterDisplays() {
        document.getElementById('morph-display').textContent = this.globalParams.morphFactor.toFixed(2);
        document.getElementById('dimension-display').textContent = this.globalParams.dimension.toFixed(2);
        document.getElementById('glitch-display').textContent = this.globalParams.glitchIntensity.toFixed(2);
        document.getElementById('rotation-display').textContent = this.globalParams.rotationSpeed.toFixed(2);
        document.getElementById('grid-display').textContent = this.globalParams.gridDensity.toFixed(1);
        document.getElementById('interaction-display').textContent = this.globalParams.interactionIntensity.toFixed(2);
    }
    
    startParameterUpdateLoop() {
        // Continuous parameter update loop for smooth transitions
        setInterval(() => {
            this.updateParameterDisplays();
        }, 100);
    }
}
