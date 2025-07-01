
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
        console.log('🎨 Initializing Neoskeuomorphic Holographic System (Board Visualizer Manager)...');

        const boardVisualizerConfig = { id: 'board-visualizer', role: 'background', reactivity: 0.5 };

        const canvasElement = document.getElementById(boardVisualizerConfig.id);
        if (canvasElement) {
            const visualizer = new HolographicVisualizer(
                boardVisualizerConfig.id,
                boardVisualizerConfig.role,
                boardVisualizerConfig.reactivity
            );
            this.visualizers.push(visualizer); // Should only contain the board visualizer now
            console.log(`✅ Initialized board visualizer: ${boardVisualizerConfig.id}`);
        } else {
            console.warn(`⚠️ NeoskeuomorphicHolographicSystem: Canvas element '${boardVisualizerConfig.id}' not found. Board visualizer not initialized.`);
        }
        
        this.setupInteractions(); // These interactions will now primarily affect the board visualizer
        this.setupStateControls(); // This might need to be re-evaluated or removed if VIB3HomeMaster handles all state changes
        this.setupEnhancedScrolling(); // This also affects the board visualizer's chaos
        this.startRenderLoop();
        
        console.log(`✅ Neoskeuomorphic Holographic System initialized with ${this.visualizers.length} visualizer(s).`);
    }
    
    setupInteractions() {
        // Mouse move affects the board visualizer for ambient effects
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX / window.innerWidth;
            this.mouseY = 1.0 - (e.clientY / window.innerHeight);
            this.mouseIntensity = Math.min(1.0, Math.sqrt(e.movementX * e.movementX + e.movementY * e.movementY) / 40);
            
            this.visualizers.forEach(viz => { // Should only be board-visualizer
                viz.updateInteraction(this.mouseX, this.mouseY, this.mouseIntensity);
            });
            
            const densityVar = Math.sin(this.mouseX * Math.PI) * Math.sin(this.mouseY * Math.PI) * 2.0;
            this.visualizers.forEach(viz => {
                viz.updateDensity(densityVar);
            });
        });
        
        // Click affects the board visualizer
        document.addEventListener('click', (e) => {
            const rect = document.body.getBoundingClientRect(); // Use body or blowContainer
            const clickX = (e.clientX - rect.left) / rect.width;
            const clickY = 1.0 - ((e.clientY - rect.top) / rect.height);
            
            this.visualizers.forEach(viz => { // Should only be board-visualizer
                viz.triggerClick(clickX, clickY);
            });
            
            // The ripple effect is a global UI effect, can remain if desired
            this.createRipple(e.clientX, e.clientY);
        });
        
        // Card-specific hover/click interactions (querySelectorAll('.neomorphic-card'))
        // are removed from here. They should be handled by SectionManager or
        // InteractionCoordinator if sections have elements classed as 'neomorphic-card'.
        console.log('NeoskeuomorphicHolographicSystem: Card-specific interactions removed from this system.');
    }
    
    createRipple(x, y) {
        // This is a global UI effect, can be kept if desired.
        // Ensure it appends to document.body or a persistent UI layer.
        const ripple = document.createElement('div');
        ripple.className = 'interaction-ripple'; // Ensure this class is defined in global CSS
        ripple.style.left = (x - 25) + 'px'; // Adjusted for typical ripple size
        ripple.style.top = (y - 25) + 'px';
        document.body.appendChild(ripple);
        
        setTimeout(() => {
            if (ripple.parentNode) {
                 ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }
    
    setupStateControls() {
        // This method directly calls this.snapToState(), which calls triggerStateTransition().
        // State changes should ideally be managed centrally by VIB3HomeMaster.
        // SectionManager listens to VIB3HomeMaster.
        // For now, let's assume these dots will eventually call VIB3HomeMaster.setState(sectionId)
        // which will then propagate to SectionManager and then potentially here if needed.
        // Or, this system could listen to 'vib34d:stateChange' from HomeMaster.

        document.querySelectorAll('.state-dot').forEach((dot, index) => {
            dot.addEventListener('click', () => {
                // This is a direct state change, VIB3HomeMaster should be the source of truth.
                // For now, let it call snapToState, which will update the board visualizer's internal state.
                // The actual section change is handled by SectionManager via HomeMaster.
                const stateName = this.layoutNames[index]; // Assuming layoutNames still map to section IDs
                if (stateName) {
                     // This system should react to state changes, not initiate them globally.
                     // However, snapToState updates its own managed visualizers.
                    this.snapToState(index); // 'index' here refers to its internal state mapping.
                    console.log(`NeoskeuomorphicHolographicSystem: State dot click for index ${index} (${stateName}). Board visualizer state updated.`);
                }

                // Visual feedback for dots
                document.querySelectorAll('.state-dot').forEach(d => d.classList.remove('active'));
                dot.classList.add('active');
            });
        });
        console.log('NeoskeuomorphicHolographicSystem: State dot controls setup (note: global state is via HomeMaster).');
    }
    
    setupEnhancedScrolling() {
        // This scrolling primarily affects chaosIntensity for the board visualizer.
        let scrollTimeout;
        
        document.addEventListener('wheel', (e) => {
            // Consider if scroll should be captured globally or only when a specific element is focused.
            // e.preventDefault(); // This might be too aggressive if there's scrollable content in sections.
            
            if (this.isTransitioning) return; // Internal transition state for this system's visualizers
            
            const direction = e.deltaY > 0 ? 1 : -1;
            this.scrollAccumulation += direction * 0.2; // Reduced sensitivity
            this.scrollAccumulation = Math.max(-this.scrollThreshold, Math.min(this.scrollThreshold, this.scrollAccumulation));
            
            this.chaosIntensity = Math.min(1.0, Math.abs(this.scrollAccumulation) / this.scrollThreshold);
            
            this.visualizers.forEach(viz => { // Board visualizer
                viz.updateChaos(this.chaosIntensity);
            });
            
            this.updateScrollFeedback();
            
            // This system should NOT trigger global state/section transitions via scroll.
            // That should be handled by InteractionCoordinator -> HomeMaster -> SectionManager.
            // Commenting out the global state transition part:
            /*
            if (Math.abs(this.scrollAccumulation) >= this.scrollThreshold) {
                const newState = (this.currentState + (direction > 0 ? 1 : -1) + 5) % 5;
                this.triggerStateTransition(newState); // This would change board-visualizer's internal state
            }
            */
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.decayScrollAccumulation();
            }, 150); // Longer decay timeout
        });
    }
    
    updateScrollFeedback() {
        console.log(`NeoskeuomorphicHolographicSystem Scroll: ${this.scrollAccumulation.toFixed(1)}/${this.scrollThreshold} | Chaos: ${(this.chaosIntensity * 100).toFixed(0)}%`);
        // UI elements for scroll feedback (like progress bars) should be updated by a general UI manager if needed.
    }
    
    decayScrollAccumulation() {
        this.scrollAccumulation *= this.scrollDecay;
        if (Math.abs(this.scrollAccumulation) < 0.05) { // Smaller threshold
            this.scrollAccumulation = 0;
            this.chaosIntensity = 0;
            
            this.visualizers.forEach(viz => { // Board visualizer
                viz.updateChaos(0);
            });
        }
        this.updateScrollFeedback();
        
        if (this.scrollAccumulation !== 0) {
            setTimeout(() => this.decayScrollAccumulation(), 100);
        }
    }
    
    resetScrollAccumulation() {
        this.scrollAccumulation = 0;
        this.chaosIntensity = 0;
        this.visualizers.forEach(viz => { // Board visualizer
            viz.updateChaos(0);
        });
        this.updateScrollFeedback();
    }
    
    /**
     * Updates the internal state of visualizers managed by this system.
     * This might be triggered by listening to global state changes from VIB3HomeMaster.
     * @param {number} newStateIndex - The index corresponding to an internal state for its visualizers.
     */
    triggerInternalVisualizerStateChange(newStateIndex) {
        if (newStateIndex === this.currentState || this.isTransitioning) return;

        const stateName = this.layoutNames[newStateIndex] || `State ${newStateIndex}`;
        console.log(`🌀 NeoskeuomorphicHolographicSystem: Updating board visualizer to its internal state '${stateName}' (index ${newStateIndex})`);
        
        this.isTransitioning = true; // Internal flag for this system's visualizer transitions
        this.currentState = newStateIndex; // Tracks the state for this system's visualizers
        
        // The main container class change is handled by SectionManager.
        // const blowContainer = document.getElementById('blowContainer');
        // if (blowContainer && this.layoutClasses[newStateIndex]) {
        //     blowContainer.className = `blow-container ${this.layoutClasses[newStateIndex]}`;
        // }
        
        this.visualizers.forEach(viz => { // Board visualizer
            viz.snapToState(newStateIndex); // Uses HolographicVisualizer's internal states array
        });
        
        // Updating UI dots might be redundant if a global UI manager does this based on HomeMaster state.
        const stateDots = document.querySelectorAll('.state-dot');
        if (stateDots.length > newStateIndex) {
            stateDots.forEach(d => d.classList.remove('active'));
            stateDots[newStateIndex].classList.add('active');
        }
        
        // Updating layout display is also likely global UI.
        // const layoutDisplay = document.getElementById('layout-display');
        // if (layoutDisplay && this.layoutNames[newStateIndex]) {
        //    layoutDisplay.textContent = this.layoutNames[newStateIndex].toUpperCase();
        // }
        
        this.resetScrollAccumulation(); // Reset chaos effect on state change for board
        
        setTimeout(() => {
            this.isTransitioning = false;
        }, 1000); // Duration of visualizer's internal transition
    }

    /**
     * Public method to snap managed visualizers to a state.
     * This should ideally be driven by an event from VIB3HomeMaster.
     * The 'stateIndex' here refers to the internal state mapping of the HolographicVisualizer.
     */
    snapToState(stateIndex) {
        // This method is kept for now. How stateIndex maps to actual section IDs from
        // sections.json needs to be determined if this system is to react to them.
        // For example, SectionManager could emit an event with the active section's
        // visualizerState, and this system could listen and map that to an internal index.
        this.triggerInternalVisualizerStateChange(stateIndex);
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
