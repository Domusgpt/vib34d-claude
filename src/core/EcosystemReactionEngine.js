/**
 * @file EcosystemReactionEngine.js
 * @description UNIFIED GEOMETRY WITH COMPLEMENTARY ECOSYSTEM REACTIONS
 * All visualizers share same geometry but have unique colors and reactive behaviors
 */

export class EcosystemReactionEngine {
    constructor() {
        this.isActive = false;
        this.currentGeometry = 0; // Shared across all visualizers
        
        // CONSCIOUSNESS STATE MANAGEMENT
        this.consciousnessState = new Map();
        this.proximityMap = new Map();
        this.reactionChains = new Map();
        
        // COMPLEMENTARY COLOR SYSTEM - All different but harmonious
        this.colorProfiles = {
            card1: { primary: [1.0, 0.0, 1.0], secondary: [0.0, 1.0, 1.0], name: 'magenta-cyan' },      // Magenta-Cyan
            card2: { primary: [0.0, 1.0, 1.0], secondary: [1.0, 1.0, 0.0], name: 'cyan-yellow' },      // Cyan-Yellow  
            card3: { primary: [1.0, 1.0, 0.0], secondary: [1.0, 0.0, 1.0], name: 'yellow-magenta' },   // Yellow-Magenta
            card4: { primary: [0.0, 1.0, 0.0], secondary: [1.0, 0.0, 0.0], name: 'green-red' },        // Green-Red
            card5: { primary: [0.0, 0.0, 1.0], secondary: [1.0, 0.5, 0.0], name: 'blue-orange' },      // Blue-Orange
            card6: { primary: [1.0, 0.0, 0.0], secondary: [0.0, 1.0, 0.0], name: 'red-green' },        // Red-Green
            board: { primary: [0.5, 0.0, 1.0], secondary: [1.0, 1.0, 1.0], name: 'purple-white' }      // Background
        };
        
        // UNIQUE REACTIVE BEHAVIORS - Same geometry, different responses
        this.reactiveBehaviors = {
            card1: { 
                name: 'dominant_amplifier',
                onHover: { intensity: 1.2, morphBoost: 0.3, rotationMultiplier: 1.4 },
                onOthersHover: { dimming: 0.7, morphReduction: -0.1, rotationDamping: 0.8 }
            },
            card2: { 
                name: 'harmonic_resonator',
                onHover: { intensity: 1.0, morphBoost: 0.2, rotationMultiplier: 1.2 },
                onOthersHover: { dimming: 0.8, morphReduction: -0.05, rotationDamping: 0.9 }
            },
            card3: { 
                name: 'subtle_responder',
                onHover: { intensity: 0.9, morphBoost: 0.15, rotationMultiplier: 1.1 },
                onOthersHover: { dimming: 0.85, morphReduction: 0, rotationDamping: 0.95 }
            },
            card4: { 
                name: 'inverse_reactor',
                onHover: { intensity: 1.1, morphBoost: 0.25, rotationMultiplier: 1.3 },
                onOthersHover: { dimming: 0.6, morphReduction: -0.15, rotationDamping: 0.7 }
            },
            card5: { 
                name: 'cascade_propagator',
                onHover: { intensity: 1.0, morphBoost: 0.2, rotationMultiplier: 1.2 },
                onOthersHover: { dimming: 0.75, morphReduction: -0.08, rotationDamping: 0.85 }
            },
            card6: { 
                name: 'tension_releaser',
                onHover: { intensity: 1.15, morphBoost: 0.35, rotationMultiplier: 1.5 },
                onOthersHover: { dimming: 0.65, morphReduction: -0.12, rotationDamping: 0.75 }
            },
            board: {
                name: 'background_coupling',
                onAnyCardHover: { morphShift: 0.1, gridDensityBoost: 2.0, rotationSpeedMultiplier: 1.2 },
                onNoCardHover: { morphShift: 0, gridDensityBoost: 0, rotationSpeedMultiplier: 1.0 }
            }
        };
        
        // PROXIMITY THRESHOLDS FOR INFLUENCE STRENGTH
        this.proximityThresholds = {
            immediate: 150,    // Strong coupling (0.8 influence)
            close: 300,        // Medium coupling (0.4 influence)
            distant: 500       // Weak coupling (0.1 influence)
        };
        
        // TENSION AND RELEASE DYNAMICS
        this.tensionState = {
            global: 0.0,
            cardSpecific: new Map(),
            releaseRate: 0.95,
            buildupRate: 1.05
        };
        
        console.log('🌐 Ecosystem Reaction Engine initialized');
    }
    
    /**
     * Initialize the ecosystem with all visualizers
     */
    async initialize(visualizers) {
        this.visualizers = visualizers;
        
        // Initialize consciousness state for each element
        visualizers.forEach((visualizer, id) => {
            this.consciousnessState.set(id, {
                attention: 0.1,     // Base attention level
                awareness: 0.1,     // Awareness of surroundings
                activity: 0.0,      // Current activity level
                lastInteraction: 0,
                elementId: id
            });
        });
        
        // Calculate proximity relationships
        this.calculateProximityMap();
        
        // Set unified geometry for all visualizers
        this.unifyGeometry(this.currentGeometry);
        
        // Apply complementary color profiles
        this.applyComplementaryColors();
        
        // Setup ecosystem event listeners
        this.setupEcosystemListeners();
        
        // Start consciousness update loop
        this.startConsciousnessLoop();
        
        this.isActive = true;
        console.log('✨ Ecosystem Reaction Engine active with unified geometry');
    }
    
    /**
     * Set unified geometry across all visualizers
     */
    unifyGeometry(geometry) {
        this.currentGeometry = geometry;
        
        console.log(`🔄 UNIFYING GEOMETRY: All visualizers → ${geometry}`);
        
        this.visualizers.forEach((visualizer, id) => {
            if (visualizer.setParameter) {
                visualizer.setParameter('geometry', geometry);
                
                // Apply color profile for this visualizer
                const colorProfile = this.getColorProfileForVisualizer(id);
                if (colorProfile) {
                    visualizer.setParameter('baseColor', colorProfile.primary);
                    if (visualizer.setSecondaryColor) {
                        visualizer.setSecondaryColor(colorProfile.secondary);
                    }
                }
            }
        });
        
        console.log(`✅ All visualizers unified to geometry ${geometry} with unique colors`);
    }
    
    /**
     * Apply complementary color profiles to all visualizers
     */
    applyComplementaryColors() {
        this.visualizers.forEach((visualizer, id) => {
            const colorProfile = this.getColorProfileForVisualizer(id);
            if (colorProfile && visualizer.setParameter) {
                visualizer.setParameter('baseColor', colorProfile.primary);
                
                console.log(`🎨 Applied ${colorProfile.name} to ${id}`);
            }
        });
    }
    
    /**
     * Get color profile for specific visualizer
     */
    getColorProfileForVisualizer(visualizerId) {
        // Map visualizer IDs to color profiles
        if (visualizerId.includes('board')) {
            return this.colorProfiles.board;
        } else if (visualizerId.includes('card-visualizer-1')) {
            return this.colorProfiles.card1;
        } else if (visualizerId.includes('card-visualizer-2')) {
            return this.colorProfiles.card2;
        } else if (visualizerId.includes('card-visualizer-3')) {
            return this.colorProfiles.card3;
        } else if (visualizerId.includes('card-visualizer-4')) {
            return this.colorProfiles.card4;
        } else if (visualizerId.includes('card-visualizer-5')) {
            return this.colorProfiles.card5;
        } else if (visualizerId.includes('card-visualizer-6')) {
            return this.colorProfiles.card6;
        }
        
        // Default to first color profile
        return this.colorProfiles.card1;
    }
    
    /**
     * Calculate proximity relationships between visualizers
     */
    calculateProximityMap() {
        const cards = document.querySelectorAll('.blog-card');
        
        cards.forEach((card1, index1) => {
            const rect1 = card1.getBoundingClientRect();
            const center1 = {
                x: rect1.left + rect1.width / 2,
                y: rect1.top + rect1.height / 2
            };
            
            const proximities = [];
            
            cards.forEach((card2, index2) => {
                if (index1 !== index2) {
                    const rect2 = card2.getBoundingClientRect();
                    const center2 = {
                        x: rect2.left + rect2.width / 2,
                        y: rect2.top + rect2.height / 2
                    };
                    
                    const distance = Math.sqrt(
                        Math.pow(center2.x - center1.x, 2) + 
                        Math.pow(center2.y - center1.y, 2)
                    );
                    
                    let influence = 0;
                    if (distance < this.proximityThresholds.immediate) {
                        influence = 0.8;
                    } else if (distance < this.proximityThresholds.close) {
                        influence = 0.4;
                    } else if (distance < this.proximityThresholds.distant) {
                        influence = 0.1;
                    }
                    
                    proximities.push({
                        targetCard: card2,
                        targetId: `card-visualizer-${index2 + 1}`,
                        distance: distance,
                        influence: influence
                    });
                }
            });
            
            this.proximityMap.set(`card-visualizer-${index1 + 1}`, proximities);
        });
        
        console.log('📍 Proximity map calculated for ecosystem reactions');
    }
    
    /**
     * Setup ecosystem event listeners
     */
    setupEcosystemListeners() {
        const cards = document.querySelectorAll('.blog-card');
        
        cards.forEach((card, index) => {
            const visualizerId = `card-visualizer-${index + 1}`;
            
            // CARD HOVER START - Target Enhancement + Others Inverse
            card.addEventListener('mouseenter', () => {
                this.triggerEcosystemReaction('cardHoverStart', visualizerId, card);
            });
            
            // CARD HOVER END - Release Tension
            card.addEventListener('mouseleave', () => {
                this.triggerEcosystemReaction('cardHoverEnd', visualizerId, card);
            });
            
            // CARD CLICK - Intense Ecosystem Response
            card.addEventListener('click', () => {
                this.triggerEcosystemReaction('cardClick', visualizerId, card);
            });
            
            // CARD DOUBLE CLICK - Maximum Ecosystem Activation
            card.addEventListener('dblclick', () => {
                this.triggerEcosystemReaction('cardDoubleClick', visualizerId, card);
            });
        });
    }
    
    /**
     * Trigger coordinated ecosystem reaction
     */
    triggerEcosystemReaction(eventType, targetVisualizerId, targetElement) {
        console.log(`🌊 ECOSYSTEM REACTION: ${eventType} on ${targetVisualizerId}`);
        
        const targetBehavior = this.getReactiveBehaviorForVisualizer(targetVisualizerId);
        const targetVisualizer = this.visualizers.get(targetVisualizerId);
        
        switch (eventType) {
            case 'cardHoverStart':
                // TARGET ENHANCEMENT
                this.enhanceTargetVisualizer(targetVisualizer, targetBehavior);
                
                // OTHERS INVERSE RESPONSE
                this.applyInverseResponseToOthers(targetVisualizerId);
                
                // BACKGROUND COUPLING
                this.applyBackgroundCoupling('tension');
                
                // UPDATE CONSCIOUSNESS
                this.updateConsciousness(targetVisualizerId, 0.8, 1.0);
                
                break;
                
            case 'cardHoverEnd':
                // RELEASE TENSION - All return to equilibrium
                this.releaseEcosystemTension();
                
                // UPDATE CONSCIOUSNESS
                this.updateConsciousness(targetVisualizerId, 0.1, 0.1);
                
                break;
                
            case 'cardClick':
                // INTENSE TARGET RESPONSE
                this.enhanceTargetVisualizer(targetVisualizer, targetBehavior, 1.5);
                
                // STRONGER INVERSE RESPONSE
                this.applyInverseResponseToOthers(targetVisualizerId, 1.3);
                
                // BACKGROUND SURGE
                this.applyBackgroundCoupling('surge');
                
                break;
                
            case 'cardDoubleClick':
                // MAXIMUM ECOSYSTEM ACTIVATION
                this.triggerMaximumEcosystemActivation(targetVisualizerId);
                
                break;
        }
    }
    
    /**
     * Enhance target visualizer with its specific behavior
     */
    enhanceTargetVisualizer(visualizer, behavior, multiplier = 1.0) {
        if (!visualizer || !behavior) return;
        
        const enhancement = behavior.onHover;
        
        if (visualizer.setParameter) {
            // Apply behavior-specific enhancements
            const currentMorph = visualizer.config?.morphFactor || 0.5;
            const currentRotation = visualizer.config?.rotationSpeed || 0.5;
            
            visualizer.setParameter('morphFactor', currentMorph + (enhancement.morphBoost * multiplier));
            visualizer.setParameter('rotationSpeed', currentRotation * (enhancement.rotationMultiplier * multiplier));
            visualizer.setParameter('interactionIntensity', enhancement.intensity * multiplier);
        }
        
        console.log(`⭐ Enhanced target with ${behavior.name} behavior (${multiplier}x)`);
    }
    
    /**
     * Apply inverse response to all other visualizers
     */
    applyInverseResponseToOthers(targetVisualizerId, multiplier = 1.0) {
        this.visualizers.forEach((visualizer, id) => {
            if (id !== targetVisualizerId && !id.includes('board')) {
                const behavior = this.getReactiveBehaviorForVisualizer(id);
                if (behavior && visualizer.setParameter) {
                    const inverse = behavior.onOthersHover;
                    
                    const currentMorph = visualizer.config?.morphFactor || 0.5;
                    const currentRotation = visualizer.config?.rotationSpeed || 0.5;
                    
                    visualizer.setParameter('morphFactor', currentMorph + (inverse.morphReduction * multiplier));
                    visualizer.setParameter('rotationSpeed', currentRotation * (inverse.rotationDamping * multiplier));
                    visualizer.setParameter('interactionIntensity', inverse.dimming * multiplier);
                }
            }
        });
        
        console.log(`🔄 Applied inverse response to others (${multiplier}x)`);
    }
    
    /**
     * Apply background coupling for tension/release
     */
    applyBackgroundCoupling(type) {
        const boardVisualizer = this.visualizers.get('board-visualizer');
        if (!boardVisualizer) return;
        
        const backgroundBehavior = this.reactiveBehaviors.board;
        
        switch (type) {
            case 'tension':
                const coupling = backgroundBehavior.onAnyCardHover;
                if (boardVisualizer.setParameter) {
                    const currentMorph = boardVisualizer.config?.morphFactor || 0.5;
                    const currentGrid = boardVisualizer.config?.gridDensity || 12.0;
                    const currentRotation = boardVisualizer.config?.rotationSpeed || 0.5;
                    
                    boardVisualizer.setParameter('morphFactor', currentMorph + coupling.morphShift);
                    boardVisualizer.setParameter('gridDensity', currentGrid + coupling.gridDensityBoost);
                    boardVisualizer.setParameter('rotationSpeed', currentRotation * coupling.rotationSpeedMultiplier);
                }
                break;
                
            case 'surge':
                // Intense background response
                this.applyBackgroundCoupling('tension');
                if (boardVisualizer.setParameter) {
                    boardVisualizer.setParameter('glitchIntensity', 0.5);
                    setTimeout(() => {
                        boardVisualizer.setParameter('glitchIntensity', 0.3);
                    }, 300);
                }
                break;
        }
        
        console.log(`🌊 Applied background coupling: ${type}`);
    }
    
    /**
     * Release ecosystem tension - return to equilibrium
     */
    releaseEcosystemTension() {
        console.log('🕊️ Releasing ecosystem tension');
        
        this.visualizers.forEach((visualizer, id) => {
            if (visualizer.setParameter) {
                // Return to base parameters gradually
                const behavior = this.getReactiveBehaviorForVisualizer(id);
                if (behavior) {
                    // Animate back to neutral state
                    this.animateToNeutralState(visualizer, id);
                }
            }
        });
    }
    
    /**
     * Animate visualizer back to neutral state
     */
    animateToNeutralState(visualizer, id) {
        // This would typically use tweening, but for now we'll do instant reset
        if (visualizer.setParameter) {
            if (id.includes('board')) {
                visualizer.setParameter('morphFactor', 0.5);
                visualizer.setParameter('gridDensity', 12.0);
                visualizer.setParameter('rotationSpeed', 0.5);
                visualizer.setParameter('interactionIntensity', 0.0);
            } else {
                visualizer.setParameter('morphFactor', 0.5);
                visualizer.setParameter('rotationSpeed', 0.5);
                visualizer.setParameter('interactionIntensity', 0.0);
            }
        }
    }
    
    /**
     * Get reactive behavior for specific visualizer
     */
    getReactiveBehaviorForVisualizer(visualizerId) {
        if (visualizerId.includes('board')) {
            return this.reactiveBehaviors.board;
        } else if (visualizerId.includes('card-visualizer-1')) {
            return this.reactiveBehaviors.card1;
        } else if (visualizerId.includes('card-visualizer-2')) {
            return this.reactiveBehaviors.card2;
        } else if (visualizerId.includes('card-visualizer-3')) {
            return this.reactiveBehaviors.card3;
        } else if (visualizerId.includes('card-visualizer-4')) {
            return this.reactiveBehaviors.card4;
        } else if (visualizerId.includes('card-visualizer-5')) {
            return this.reactiveBehaviors.card5;
        } else if (visualizerId.includes('card-visualizer-6')) {
            return this.reactiveBehaviors.card6;
        }
        
        return this.reactiveBehaviors.card1; // Default
    }
    
    /**
     * Update consciousness state
     */
    updateConsciousness(elementId, attention, awareness) {
        const consciousness = this.consciousnessState.get(elementId);
        if (consciousness) {
            consciousness.attention = attention;
            consciousness.awareness = awareness;
            consciousness.lastInteraction = performance.now();
            
            // Propagate consciousness to nearby elements
            this.propagateConsciousness(elementId, attention);
        }
    }
    
    /**
     * Propagate consciousness to nearby elements
     */
    propagateConsciousness(sourceId, intensity) {
        const proximities = this.proximityMap.get(sourceId);
        if (proximities) {
            proximities.forEach((proximity) => {
                const targetConsciousness = this.consciousnessState.get(proximity.targetId);
                if (targetConsciousness) {
                    const propagatedIntensity = intensity * proximity.influence;
                    targetConsciousness.awareness = Math.max(targetConsciousness.awareness, propagatedIntensity);
                }
            });
        }
    }
    
    /**
     * Start consciousness update loop
     */
    startConsciousnessLoop() {
        setInterval(() => {
            this.updateConsciousnessDecay();
        }, 50); // 20fps
    }
    
    /**
     * Update consciousness decay over time
     */
    updateConsciousnessDecay() {
        const now = performance.now();
        
        this.consciousnessState.forEach((consciousness, id) => {
            const timeSinceInteraction = now - consciousness.lastInteraction;
            
            // Decay consciousness over time
            if (timeSinceInteraction > 100) {
                consciousness.attention *= 0.98;
                consciousness.awareness *= 0.99;
                consciousness.activity *= 0.95;
                
                // Minimum threshold
                consciousness.attention = Math.max(consciousness.attention, 0.1);
                consciousness.awareness = Math.max(consciousness.awareness, 0.1);
                consciousness.activity = Math.max(consciousness.activity, 0.0);
            }
        });
    }
    
    /**
     * Change geometry for all visualizers
     */
    changeGeometry(newGeometry) {
        console.log(`🔄 CHANGING UNIFIED GEOMETRY: ${this.currentGeometry} → ${newGeometry}`);
        this.unifyGeometry(newGeometry);
    }
    
    /**
     * Trigger maximum ecosystem activation
     */
    triggerMaximumEcosystemActivation(targetId) {
        console.log('💥 MAXIMUM ECOSYSTEM ACTIVATION');
        
        // All visualizers go to maximum intensity
        this.visualizers.forEach((visualizer, id) => {
            if (visualizer.setParameter) {
                visualizer.setParameter('interactionIntensity', 1.0);
                visualizer.setParameter('glitchIntensity', 0.8);
                visualizer.setParameter('morphFactor', 1.0);
                visualizer.setParameter('rotationSpeed', 1.5);
            }
        });
        
        // Return to normal after intense moment
        setTimeout(() => {
            this.releaseEcosystemTension();
        }, 1000);
    }
}