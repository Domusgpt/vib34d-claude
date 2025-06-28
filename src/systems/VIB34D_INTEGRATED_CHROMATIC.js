/**
 * VIB34D INTEGRATED CHROMATIC SYSTEM
 * Combines the complete VIB34D visualization system with chromatic emergence
 * 
 * This integration brings together:
 * - User interaction reactivity (scroll, click, mouse)
 * - 8 geometric themes with full parameter control
 * - Chromatic emergence through translucent layer blending
 * - Dynamic color mixing (yellow+blue=green, etc.)
 */

import { VIB34DInteractionEngine, VIB34DCore, VIB34DMultiInstance } from './VIB34D_COMPLETE_SYSTEM.js';
import { VIB34DChromaticEngine, VIB34DCoreChromatic, VIB34DMultiInstanceChromatic } from './VIB34D_CHROMATIC_SYSTEM.js';

// ============================================================================
// 🎨 INTEGRATED VIB34D CORE WITH CHROMATIC SYSTEM
// ============================================================================

class VIB34DIntegratedCore extends VIB34DCoreChromatic {
    constructor(canvas, options = {}) {
        super(canvas, options);
        
        // Override shader generation to include both systems
        this.enhanceShaderIntegration();
    }
    
    enhanceShaderIntegration() {
        // Extend the base geometry shaders with chromatic functions
        Object.keys(this.geometryShaders).forEach(geometry => {
            const baseShader = this.geometryShaders[geometry];
            this.geometryShaders[geometry] = this.wrapShaderWithChromatic(baseShader);
        });
    }
    
    wrapShaderWithChromatic(baseShader) {
        return `
            ${baseShader}
            
            // Enhanced with chromatic emergence
            float calculateChromaticLattice(vec3 p) {
                float baseLattice = calculateLattice(p);
                
                // Apply chromatic modulation based on position
                vec2 chromaCoord = p.xy * u_spectralSpread + p.z * 0.5;
                float chromaMod = sin(chromaCoord.x * 3.14159) * cos(chromaCoord.y * 3.14159);
                
                return baseLattice * (0.8 + 0.2 * chromaMod);
            }
        `;
    }
    
    getVertexShader() {
        return `
            precision highp float;
            attribute vec3 position;
            uniform mat4 projectionMatrix;
            uniform mat4 viewMatrix;
            uniform mat4 modelMatrix;
            
            varying vec3 vPosition;
            varying float vDepth;
            
            void main() {
                vPosition = position;
                vec4 mvPosition = viewMatrix * modelMatrix * vec4(position, 1.0);
                vDepth = -mvPosition.z;
                gl_Position = projectionMatrix * mvPosition;
            }
        `;
    }
    
    getFragmentShader() {
        // Use the enhanced chromatic fragment shader
        return this.getEnhancedFragmentShader();
    }
}

// ============================================================================
// 🎮 INTEGRATED MULTI-INSTANCE MANAGER
// ============================================================================

class VIB34DIntegratedMultiInstance extends VIB34DMultiInstanceChromatic {
    constructor(container, sectionKey, options = {}) {
        super(container, sectionKey, options);
        
        // Additional integration features
        this.setupInteractionSync();
        this.setupChromaticDebugger();
    }
    
    createInstances() {
        // Create chromatic-enhanced instances
        Object.entries(this.config.instanceTemplates).forEach(([role, template]) => {
            const canvas = document.createElement('canvas');
            canvas.className = `vib34d-instance vib34d-${role}`;
            
            // Enhanced styling for chromatic blending with interaction hints
            canvas.style.cssText = `
                position: absolute;
                top: 0; left: 0; 
                width: 100%; height: 100%;
                opacity: ${template.opacity};
                z-index: ${template.zIndex};
                pointer-events: none;
                mix-blend-mode: ${this.getBlendModeForRole(role)};
                transition: opacity 0.3s ease, filter 0.2s ease;
            `;
            
            this.container.appendChild(canvas);
            
            // Use integrated chromatic core
            const instance = new VIB34DIntegratedCore(canvas, {
                instanceId: `${this.sectionKey}-${role}`,
                role: template.role,
                modifier: template.modifier,
                geometry: this.config.geometryType,
                chromaticEngine: this.chromaticEngine,
                interactionEngine: this.interactionEngine
            });
            
            this.instances.set(role, instance);
        });
    }
    
    setupInteractionSync() {
        // Sync interaction events with chromatic changes
        this.container.addEventListener('mousemove', (e) => {
            const rect = this.container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            // Update CSS custom properties for real-time effects
            this.container.style.setProperty('--mouse-x', x);
            this.container.style.setProperty('--mouse-y', y);
            
            // Apply position-based hue rotation
            const hueRotation = (x - 0.5) * 60; // -30 to +30 degrees
            this.container.style.setProperty('--position-hue', `${hueRotation}deg`);
        });
    }
    
    setupChromaticDebugger() {
        // Add debug overlay for color emergence visualization
        if (this.config.debug) {
            const debugOverlay = document.createElement('div');
            debugOverlay.className = 'vib34d-chromatic-debug';
            debugOverlay.style.cssText = `
                position: absolute;
                top: 10px; right: 10px;
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 10px;
                font-family: monospace;
                font-size: 12px;
                z-index: 1000;
                pointer-events: none;
            `;
            
            this.container.appendChild(debugOverlay);
            this.debugOverlay = debugOverlay;
        }
    }
    
    updateFromInteraction(interactionData) {
        super.updateFromInteraction(interactionData);
        
        // Update debug overlay if present
        if (this.debugOverlay) {
            const emergentColor = this.getEmergentColorAt(0.5, 0.5);
            this.debugOverlay.innerHTML = `
                <div>Interaction Energy: ${interactionData.energy.toFixed(2)}</div>
                <div>Chromatic Shift: ${(interactionData.mouse.smoothed * 30).toFixed(1)}°</div>
                <div>Emergent Color: rgb(${Math.round(emergentColor.r * 255)}, ${Math.round(emergentColor.g * 255)}, ${Math.round(emergentColor.b * 255)})</div>
                <div>Active Geometry: ${this.config.geometryType}</div>
            `;
        }
    }
}

// ============================================================================
// 🏠 VIB3 HOME MASTER INTEGRATION
// ============================================================================

class VIB3ChromaticIntegration {
    constructor(blogSystem, reactivityBridge) {
        this.blogSystem = blogSystem;
        this.reactivityBridge = reactivityBridge;
        this.interactionEngine = new VIB34DInteractionEngine();
        this.chromaticEngine = new VIB34DChromaticEngine();
        
        // Multi-instance managers for each section
        this.sectionManagers = new Map();
        
        this.setupIntegration();
    }
    
    setupIntegration() {
        // Listen for section changes from VIB3HomeMaster
        this.homeMaster.on('sectionChange', (sectionData) => {
            this.transitionToSection(sectionData);
        });
        
        // Update chromatic system from reactivity bridge
        this.reactivityBridge.on('interactionUpdate', (data) => {
            this.updateChromatic(data);
        });
        
        // Animation loop
        this.animate();
    }
    
    initializeSection(sectionKey, container) {
        // Get geometry configuration for this section
        const geometryConfig = this.getGeometryForSection(sectionKey);
        
        const manager = new VIB34DIntegratedMultiInstance(container, sectionKey, {
            geometryType: geometryConfig.geometry,
            instanceTemplates: {
                background: {
                    role: 'background',
                    opacity: 0.3,
                    zIndex: 1,
                    modifier: 0.7
                },
                content: {
                    role: 'content',
                    opacity: 0.5,
                    zIndex: 2,
                    modifier: 1.0
                },
                accent: {
                    role: 'accent',
                    opacity: 0.4,
                    zIndex: 3,
                    modifier: 1.3
                }
            },
            interactionEngine: this.interactionEngine,
            chromaticEngine: this.chromaticEngine,
            debug: false
        });
        
        this.sectionManagers.set(sectionKey, manager);
        manager.start();
        
        return manager;
    }
    
    getGeometryForSection(sectionKey) {
        // Map sections to geometries with specific parameters
        const sectionGeometryMap = {
            'home': { geometry: 'hypercube', params: { gridDensity: 12.0, morphFactor: 0.7 }},
            'tech': { geometry: 'tetrahedron', params: { gridDensity: 8.0, morphFactor: 0.5 }},
            'research': { geometry: 'wave', params: { gridDensity: 15.0, morphFactor: 0.9 }},
            'media': { geometry: 'sphere', params: { gridDensity: 10.0, morphFactor: 0.6 }},
            'innovation': { geometry: 'fractal', params: { gridDensity: 20.0, morphFactor: 1.2 }},
            'context': { geometry: 'crystal', params: { gridDensity: 9.0, morphFactor: 0.8 }},
            'torus': { geometry: 'torus', params: { gridDensity: 11.0, morphFactor: 0.75 }},
            'klein': { geometry: 'klein', params: { gridDensity: 7.0, morphFactor: 0.85 }}
        };
        
        return sectionGeometryMap[sectionKey] || sectionGeometryMap['home'];
    }
    
    transitionToSection(sectionData) {
        const { sectionKey, container } = sectionData;
        
        // Get or create manager for this section
        let manager = this.sectionManagers.get(sectionKey);
        if (!manager && container) {
            manager = this.initializeSection(sectionKey, container);
        }
        
        // Deactivate all other sections
        this.sectionManagers.forEach((mgr, key) => {
            if (key !== sectionKey) {
                mgr.setActive(false);
            }
        });
        
        // Activate current section
        if (manager) {
            manager.setActive(true);
            
            // Apply section-specific parameters
            const config = this.getGeometryForSection(sectionKey);
            manager.instances.forEach(instance => {
                instance.updateParameters(config.params);
            });
        }
    }
    
    updateChromatic(interactionData) {
        // Update engines
        this.interactionEngine.updateInteractionData(interactionData);
        const processedData = this.interactionEngine.getProcessedData();
        
        // Update all active managers
        this.sectionManagers.forEach((manager, key) => {
            if (manager.isActive) {
                manager.updateFromInteraction(processedData);
            }
        });
    }
    
    animate() {
        // Get latest interaction data
        const interactionData = this.interactionEngine.getProcessedData();
        
        // Update chromatic engine
        this.chromaticEngine.update(interactionData);
        
        // Update all active instances
        this.sectionManagers.forEach(manager => {
            if (manager.isActive) {
                manager.updateFromInteraction(interactionData);
            }
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// ============================================================================
// 🎨 ENHANCED CSS STYLES FOR CHROMATIC INTEGRATION
// ============================================================================

const CHROMATIC_STYLES = `
<style>
/* Chromatic blend modes and effects */
.vib34d-instance {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: opacity, filter, transform;
}

/* Dynamic hue rotation based on mouse position */
.vib34d-background {
    filter: saturate(1.2) hue-rotate(calc(var(--chromatic-shift, 0deg) + var(--position-hue, 0deg)));
}

.vib34d-content {
    filter: contrast(1.1) brightness(1.05) hue-rotate(var(--position-hue, 0deg));
}

.vib34d-accent {
    filter: saturate(1.3) contrast(1.2) hue-rotate(calc(var(--chromatic-shift, 0deg) * -1));
    animation: chromaticPulse 4s ease-in-out infinite;
}

/* Enhanced chromatic pulse animation */
@keyframes chromaticPulse {
    0%, 100% { 
        filter: saturate(1.3) contrast(1.2) hue-rotate(0deg);
        transform: scale(1);
    }
    25% { 
        filter: saturate(1.4) contrast(1.25) hue-rotate(10deg);
        transform: scale(1.02);
    }
    50% { 
        filter: saturate(1.5) contrast(1.3) hue-rotate(-10deg);
        transform: scale(1);
    }
    75% {
        filter: saturate(1.4) contrast(1.25) hue-rotate(5deg);
        transform: scale(0.98);
    }
}

/* Interaction-based effects */
.vib34d-container:hover .vib34d-instance {
    filter: brightness(1.1);
}

.vib34d-container:active .vib34d-accent {
    animation-duration: 2s;
}

/* Chromatic emergence indicators */
.chromatic-emergence-active .vib34d-content {
    mix-blend-mode: screen;
    opacity: 0.6;
}

.chromatic-emergence-active .vib34d-accent {
    mix-blend-mode: color-dodge;
    opacity: 0.5;
}

/* Debug overlay styling */
.vib34d-chromatic-debug {
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255,255,255,0.2);
    border-radius: 4px;
    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.vib34d-chromatic-debug div {
    margin: 2px 0;
}
</style>
`;

// Export the integrated system
export { 
    VIB34DIntegratedCore,
    VIB34DIntegratedMultiInstance,
    VIB3ChromaticIntegration,
    CHROMATIC_STYLES
};