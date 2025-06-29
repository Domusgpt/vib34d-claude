
// NEOSKEUOMORPHIC HOLOGRAPHIC SYSTEM
import { HolographicVisualizer } from '../visualizers/HolographicVisualizer.js';

class NeoskeuomorphicHolographicSystem {
    constructor() {
        this.visualizers = [];
        this.currentState = 0;
        this.mouseX = 0.5;
        this.mouseY = 0.5;
        this.mouseIntensity = 0.0;
        
        this.scrollAccumulation = 0;
        this.scrollThreshold = 5;
        this.scrollDecay = 0.95;
        this.chaosIntensity = 0.0;
        this.isTransitioning = false;
        
        this.layoutNames = ['HOME', 'TECH', 'MEDIA', 'AUDIO', 'QUANTUM'];
        this.layoutClasses = ['layout-home', 'layout-tech', 'layout-media', 'layout-audio', 'layout-quantum'];
        
        this.initialize();
    }
    
    initialize() {
        console.log('🎨 Initializing Neoskeuomorphic Holographic System...');
        
        const configs = [
            { id: 'board-visualizer', role: 'background', reactivity: 0.5 },
            { id: 'card-visualizer-1', role: 'content', reactivity: 1.0 },
            { id: 'card-visualizer-2', role: 'content', reactivity: 1.1 },
            { id: 'card-visualizer-3', role: 'content', reactivity: 0.9 },
            { id: 'card-visualizer-4', role: 'content', reactivity: 1.2 },
            { id: 'card-visualizer-5', role: 'content', reactivity: 0.8 },
            { id: 'card-visualizer-6', role: 'content', reactivity: 1.0 }
        ];
        
        configs.forEach(config => {
            const visualizer = new HolographicVisualizer(config.id, config.role, config.reactivity);
            this.visualizers.push(visualizer);
        });
        
        this.setupInteractions();
        this.setupStateControls();
        this.setupEnhancedScrolling();
        this.startRenderLoop();
        
        console.log('✅ Neoskeuomorphic Holographic System ready - 13 visualizers with depth layers');
    }
    
    setupInteractions() {
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX / window.innerWidth;
            this.mouseY = 1.0 - (e.clientY / window.innerHeight);
            this.mouseIntensity = Math.min(1.0, Math.sqrt(e.movementX*e.movementX + e.movementY*e.movementY) / 40);
            
            this.visualizers.forEach(viz => {
                viz.updateInteraction(this.mouseX, this.mouseY, this.mouseIntensity);
            });
            
            // Grid overlay effect handled in visualizer shaders
            
            const densityVar = Math.sin(this.mouseX * Math.PI) * Math.sin(this.mouseY * Math.PI) * 2.0;
            this.visualizers.forEach(viz => {
                viz.updateDensity(densityVar);
            });
        });
        
        document.addEventListener('click', (e) => {
            const rect = document.body.getBoundingClientRect();
            const clickX = (e.clientX - rect.left) / rect.width;
            const clickY = 1.0 - ((e.clientY - rect.top) / rect.height);
            
            this.visualizers.forEach(viz => {
                viz.triggerClick(clickX, clickY);
            });
            
            this.createRipple(e.clientX, e.clientY);
        });
        
        document.querySelectorAll('.neomorphic-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            });
            
            card.addEventListener('click', (e) => {
                e.stopPropagation();
                card.classList.add('clicked');
                setTimeout(() => {
                    card.classList.remove('clicked');
                }, 300);
            });
        });
    }
    
    createRipple(x, y) {
        const ripple = document.createElement('div');
        ripple.className = 'interaction-ripple';
        ripple.style.left = (x - 50) + 'px';
        ripple.style.top = (y - 50) + 'px';
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            document.body.removeChild(ripple);
        }, 600);
    }
    
    setupStateControls() {
        document.querySelectorAll('.state-dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                this.snapToState(index);
                this.resetScrollAccumulation();
                
                document.querySelectorAll('.state-dot').forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
            });
        });
    }
    
    setupEnhancedScrolling() {
        let scrollTimeout;
        
        document.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            if (this.isTransitioning) return;
            
            const direction = e.deltaY > 0 ? 1 : -1;
            this.scrollAccumulation += direction;
            
            this.chaosIntensity = Math.min(1.0, Math.abs(this.scrollAccumulation) / this.scrollThreshold);
            
            this.visualizers.forEach(viz => {
                viz.updateChaos(this.chaosIntensity);
            });
            
            this.updateScrollFeedback();
            
            if (Math.abs(this.scrollAccumulation) >= this.scrollThreshold) {
                const newState = (this.currentState + (direction > 0 ? 1 : -1) + 5) % 5;
                this.triggerStateTransition(newState);
            }
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.decayScrollAccumulation();
            }, 100);
        });
    }
    
    updateScrollFeedback() {
        // Visual feedback handled through visualizer chaos intensity
        console.log(`Scroll: ${this.scrollAccumulation.toFixed(1)}/${this.scrollThreshold} | Chaos: ${(this.chaosIntensity * 100).toFixed(0)}%`);
    }
    
    decayScrollAccumulation() {
        this.scrollAccumulation *= this.scrollDecay;
        if (Math.abs(this.scrollAccumulation) < 0.1) {
            this.scrollAccumulation = 0;
            this.chaosIntensity = 0;
            
            this.visualizers.forEach(viz => {
                viz.updateChaos(0);
            });
            
            // Chaos overlay removed via visualizer effects
        }
        
        this.updateScrollFeedback();
        
        if (this.scrollAccumulation !== 0) {
            setTimeout(() => this.decayScrollAccumulation(), 100);
        }
    }
    
    resetScrollAccumulation() {
        this.scrollAccumulation = 0;
        this.chaosIntensity = 0;
        this.visualizers.forEach(viz => {
            viz.updateChaos(0);
        });
        this.updateScrollFeedback();
    }
    
    triggerStateTransition(newState) {
        if (newState === this.currentState || this.isTransitioning) return;
        
        console.log(`🌀 HOLOGRAPHIC TRANSITION TO: ${this.layoutNames[newState]}`);
        
        this.isTransitioning = true;
        this.currentState = newState;
        
        const blogContainer = document.getElementById('blogContainer');
        blogContainer.className = `blog-container ${this.layoutClasses[newState]}`;
        
        this.visualizers.forEach(viz => {
            viz.snapToState(newState);
        });
        
        document.querySelectorAll('.state-dot').forEach(d => d.classList.remove('active'));
        document.querySelectorAll('.state-dot')[newState].classList.add('active');
        
        document.getElementById('current-layout').textContent = this.layoutNames[newState];
        
        this.resetScrollAccumulation();
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 1000);
    }
    
    snapToState(stateIndex) {
        this.triggerStateTransition(stateIndex);
    }
    
    startRenderLoop() {
        const render = () => {
            this.visualizers.forEach(viz => {
                viz.render();
            });
            requestAnimationFrame(render);
        };
        
        render();
        console.log('🎬 Neoskeuomorphic holographic render loop started');
    }
}

export { NeoskeuomorphicHolographicSystem };
