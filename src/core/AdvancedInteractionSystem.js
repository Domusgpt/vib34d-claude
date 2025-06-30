/**
 * @file AdvancedInteractionSystem.js
 * @description SOPHISTICATED INTERACTION ECOSYSTEM
 * Implements impossible dimensional properties, ecosystem reactions, and vaporwave effects
 */

export class AdvancedInteractionSystem {
    constructor() {
        this.isActive = false;
        this.currentState = 'home';
        this.isTransitioning = false;
        
        // ECOSYSTEM STATE MANAGEMENT
        this.ecosystemState = {
            focusedCard: null,
            globalEnergy: 0.0,
            sectionFocus: -1,
            scrollMomentum: 0.0,
            realityTear: 0.0,
            dimensionalShift: 0.0
        };
        
        // ADVANCED SCROLL TRACKING
        this.scrollState = {
            velocity: 0,
            direction: 0,
            history: [],
            lastY: 0,
            isScrolling: false,
            accumulator: 0
        };
        
        // CARD INTERACTION STATES
        this.cardStates = new Map();
        
        // IMPOSSIBLE DIMENSIONAL PROPERTIES
        this.dimensionalProps = {
            quaternion: { w: 1, x: 0, y: 0, z: 0 },
            hyperRotation: { xw: 0, yw: 0, zw: 0 },
            wProjection: 0,
            glitchPhase: 0,
            morphingFactor: 0
        };
        
        // LAYOUT CONFIGURATIONS
        this.layoutClasses = ['layout-home', 'layout-tech', 'layout-media', 'layout-innovation', 'layout-research'];
        this.layoutNames = ['HOME', 'TECH', 'MEDIA', 'INNOVATION', 'RESEARCH'];
        
        // VAPORWAVE GLITCH SYSTEM
        this.glitchSystem = {
            chromaShift: { r: 0, g: 0, b: 0 },
            scanlines: 0,
            interference: 0,
            rgbSeparation: 0,
            datamosh: 0
        };
        
        console.log('🌀 Advanced Interaction System initialized');
    }
    
    /**
     * Initialize the advanced interaction system
     */
    async initialize() {
        this.setupAdvancedEventListeners();
        this.setupCardEcosystem();
        this.setupDimensionalTransforms();
        this.startEcosystemLoop();
        
        this.isActive = true;
        console.log('✨ Advanced Interaction System active');
    }
    
    /**
     * Setup sophisticated event listeners with ecosystem coordination
     */
    setupAdvancedEventListeners() {
        // ADVANCED SCROLL SYSTEM - Intense Visual Effects
        let scrollTimeout;
        window.addEventListener('scroll', (e) => {
            const currentScrollY = window.scrollY;
            const instantVelocity = Math.abs(currentScrollY - this.scrollState.lastY);
            
            // Track velocity history for smoother effects
            this.scrollState.history.push(instantVelocity);
            if (this.scrollState.history.length > 10) this.scrollState.history.shift();
            
            const avgVelocity = this.scrollState.history.reduce((a, b) => a + b, 0) / this.scrollState.history.length;
            
            this.scrollState.velocity = avgVelocity;
            this.scrollState.direction = currentScrollY > this.scrollState.lastY ? 1 : -1;
            this.scrollState.isScrolling = true;
            this.scrollState.accumulator += Math.abs(instantVelocity);
            
            // INTENSE VISUAL EFFECTS FROM SCROLLING
            this.triggerScrollVisualEffects(avgVelocity);
            
            // LAYOUT CYCLING WITH VAPORWAVE EFFECTS
            if (this.scrollState.accumulator > 200) {
                this.triggerLayoutCycle();
                this.scrollState.accumulator = 0;
            }
            
            this.scrollState.lastY = currentScrollY;
            
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                this.scrollState.isScrolling = false;
                this.scrollState.velocity *= 0.9;
            }, 150);
        }, { passive: true });
        
        // WHEEL EVENTS - Rapid Visual Cycling
        window.addEventListener('wheel', (e) => {
            const wheelIntensity = Math.abs(e.deltaY) / 100;
            
            // Cause visualizers to lose rotation speed and morph
            this.triggerWheelMorphEffect(wheelIntensity);
            
            // Intense visual effects
            this.ecosystemState.realityTear = Math.min(wheelIntensity * 0.5, 1.0);
            this.dimensionalProps.glitchPhase += wheelIntensity * 0.1;
            
            // Update all visualizers immediately
            this.updateAllVisualizersWithIntensity(wheelIntensity);
        }, { passive: true });
        
        // DOUBLE-CLICK CARD ENLARGEMENT
        document.addEventListener('dblclick', (e) => {
            const card = e.target.closest('.blog-card');
            if (card) {
                this.triggerCardEnlargement(card);
            }
        });
        
        // ESCAPE KEY - Return to normal view
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.returnToNormalView();
            }
        });
    }
    
    /**
     * Setup card ecosystem with sophisticated reactions
     */
    setupCardEcosystem() {
        const cards = document.querySelectorAll('.blog-card');
        
        cards.forEach((card, index) => {
            // Initialize card state
            this.cardStates.set(card.id, {
                index: index,
                originalTransform: '',
                isEnlarged: false,
                dimensionalOffset: { x: 0, y: 0, z: 0, w: 0 },
                glitchState: { active: false, intensity: 0 },
                morphState: { factor: 0, target: 0 }
            });
            
            // SOPHISTICATED HOVER ECOSYSTEM REACTIONS
            card.addEventListener('mouseenter', () => {
                this.triggerCardEcosystemReaction(card, index, 'focus');
            });
            
            card.addEventListener('mouseleave', () => {
                this.triggerCardEcosystemReaction(card, index, 'unfocus');
            });
            
            // SMOOTH DRAG SCROLLING ON CARD CONTENT
            const content = card.querySelector('.card-content');
            if (content) {
                this.setupSmoothDragScrolling(content);
            }
        });
    }
    
    /**
     * Setup impossible dimensional transformations
     */
    setupDimensionalTransforms() {
        // Update CSS custom properties for 4D effects
        setInterval(() => {
            this.updateDimensionalProperties();
        }, 16); // 60fps
    }
    
    /**
     * Trigger sophisticated card ecosystem reactions
     */
    triggerCardEcosystemReaction(focusedCard, focusedIndex, type) {
        const allCards = document.querySelectorAll('.blog-card');
        
        if (type === 'focus') {
            // FOCUSED CARD - Impossible dimensional enhancement
            focusedCard.setAttribute('data-section-hover', 'true');
            
            const cardState = this.cardStates.get(focusedCard.id);
            cardState.dimensionalOffset.w = 0.3; // 4D offset
            cardState.glitchState.active = true;
            cardState.glitchState.intensity = 0.7;
            
            // ALL OTHER CARDS - Coordinated inverse reaction
            allCards.forEach((card, index) => {
                if (index !== focusedIndex) {
                    card.setAttribute('data-inverse', 'true');
                    
                    const otherState = this.cardStates.get(card.id);
                    otherState.dimensionalOffset.w = -0.1; // Recede into 4D space
                    otherState.morphState.target = 0.3;
                    
                    // Apply smooth transformation
                    this.applyCardTransformation(card, otherState);
                }
            });
            
            // GLOBAL ECOSYSTEM RESPONSE
            this.ecosystemState.focusedCard = focusedCard;
            this.ecosystemState.sectionFocus = focusedIndex;
            this.ecosystemState.globalEnergy = 1.0;
            this.ecosystemState.dimensionalShift = 0.5;
            
            // Update CSS variables for system-wide effects
            document.documentElement.style.setProperty('--section-focus', focusedIndex);
            document.documentElement.style.setProperty('--global-energy', '1.0');
            document.documentElement.style.setProperty('--reality-tear', this.ecosystemState.realityTear);
            
        } else if (type === 'unfocus') {
            // RETURN TO EQUILIBRIUM
            focusedCard.removeAttribute('data-section-hover');
            
            allCards.forEach((card) => {
                card.removeAttribute('data-inverse');
                const cardState = this.cardStates.get(card.id);
                if (cardState) {
                    cardState.dimensionalOffset.w = 0;
                    cardState.glitchState.active = false;
                    cardState.morphState.target = 0;
                    this.applyCardTransformation(card, cardState);
                }
            });
            
            this.ecosystemState.focusedCard = null;
            this.ecosystemState.sectionFocus = -1;
            this.ecosystemState.globalEnergy *= 0.7;
            this.ecosystemState.dimensionalShift *= 0.8;
        }
        
        // Update all visualizers with new ecosystem state
        this.updateAllVisualizersWithEcosystem();
    }
    
    /**
     * Apply impossible dimensional transformations to cards
     */
    applyCardTransformation(card, cardState) {
        const { dimensionalOffset, glitchState, morphState } = cardState;
        
        // IMPOSSIBLE DIMENSIONAL PROPERTIES
        const scale = 1.0 + dimensionalOffset.w * 0.1;
        const rotateX = dimensionalOffset.w * 15; // Impossible rotation
        const rotateY = dimensionalOffset.w * 8;
        const translateZ = dimensionalOffset.w * 30;
        
        // GLITCH EFFECTS
        const glitchX = glitchState.active ? (Math.random() - 0.5) * glitchState.intensity * 5 : 0;
        const glitchY = glitchState.active ? (Math.random() - 0.5) * glitchState.intensity * 3 : 0;
        
        // SMOOTH MORPHING
        const morphSkew = morphState.factor * 2;
        
        const transform = `
            translate3d(${glitchX}px, ${glitchY}px, ${translateZ}px)
            rotateX(${rotateX}deg)
            rotateY(${rotateY}deg)
            scale(${scale})
            skew(${morphSkew}deg)
        `;
        
        card.style.transform = transform;
        card.style.filter = glitchState.active ? 
            `hue-rotate(${glitchState.intensity * 60}deg) saturate(${1 + glitchState.intensity})` : '';
        
        // Animate morphing factor
        if (cardState.morphState.factor !== cardState.morphState.target) {
            cardState.morphState.factor += (cardState.morphState.target - cardState.morphState.factor) * 0.1;
        }
    }
    
    /**
     * Trigger intense scroll visual effects
     */
    triggerScrollVisualEffects(velocity) {
        // VAPORWAVE GLITCH EFFECTS
        const intensity = Math.min(velocity * 0.02, 1.0);
        
        this.glitchSystem.rgbSeparation = intensity * 5;
        this.glitchSystem.interference = intensity * 0.3;
        this.glitchSystem.scanlines = intensity;
        
        // CHROMATIC ABERRATION
        this.glitchSystem.chromaShift.r = Math.sin(performance.now() * 0.01) * intensity * 2;
        this.glitchSystem.chromaShift.g = Math.cos(performance.now() * 0.013) * intensity * 1.5;
        this.glitchSystem.chromaShift.b = Math.sin(performance.now() * 0.017) * intensity * 2.5;
        
        // Apply to body for global effect
        document.body.style.filter = `
            hue-rotate(${this.glitchSystem.chromaShift.r * 30}deg)
            contrast(${1 + intensity * 0.3})
            saturate(${1 + intensity * 0.5})
        `;
        
        // CSS variables for shader effects
        document.documentElement.style.setProperty('--scroll-momentum', velocity);
        document.documentElement.style.setProperty('--glitch-intensity', intensity);
        document.documentElement.style.setProperty('--rgb-separation', this.glitchSystem.rgbSeparation);
    }
    
    /**
     * Trigger wheel-based morph effects
     */
    triggerWheelMorphEffect(intensity) {
        // All visualizers lose rotation speed and morph
        const allCards = document.querySelectorAll('.blog-card');
        
        allCards.forEach((card) => {
            const cardState = this.cardStates.get(card.id);
            if (cardState) {
                // Temporary morph spike
                cardState.morphState.target = intensity;
                cardState.dimensionalOffset.w = intensity * 0.2;
                this.applyCardTransformation(card, cardState);
                
                // Return to normal after brief moment
                setTimeout(() => {
                    cardState.morphState.target = 0;
                    cardState.dimensionalOffset.w = 0;
                }, 300);
            }
        });
        
        // Global dimensional shift
        this.dimensionalProps.morphingFactor = intensity;
        this.ecosystemState.realityTear = intensity;
    }
    
    /**
     * Trigger layout cycling with vaporwave effects
     */
    triggerLayoutCycle() {
        if (this.isTransitioning) return;
        
        const currentIndex = this.layoutClasses.indexOf(document.getElementById('blogContainer').className.split(' ')[1]);
        const newIndex = (currentIndex + 1) % this.layoutClasses.length;
        
        console.log(`🎭 VAPORWAVE LAYOUT TRANSITION: ${this.layoutNames[newIndex]}`);
        
        this.isTransitioning = true;
        
        // INTENSE VISUAL TRANSITION
        this.triggerGlobalGlitchTransition(() => {
            const blogContainer = document.getElementById('blogContainer');
            blogContainer.className = `blog-container ${this.layoutClasses[newIndex]}`;
            
            // Update ecosystem state
            this.ecosystemState.globalEnergy = 1.5;
            this.ecosystemState.realityTear = 1.0;
            
            setTimeout(() => {
                this.isTransitioning = false;
                this.ecosystemState.realityTear *= 0.8;
            }, 1000);
        });
    }
    
    /**
     * Trigger card enlargement with other cards moving away
     */
    triggerCardEnlargement(card) {
        const cardState = this.cardStates.get(card.id);
        if (!cardState) return;
        
        if (cardState.isEnlarged) {
            this.returnToNormalView();
            return;
        }
        
        // ENLARGE TARGET CARD
        cardState.isEnlarged = true;
        card.style.transform = `
            scale(1.5) 
            translateZ(100px) 
            rotateY(5deg) 
            rotateX(2deg)
        `;
        card.style.zIndex = '1000';
        card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        
        // PUSH OTHER CARDS AWAY
        const allCards = document.querySelectorAll('.blog-card');
        allCards.forEach((otherCard, index) => {
            if (otherCard !== card) {
                const angle = (index * 45) + Math.random() * 30;
                const distance = 150 + Math.random() * 100;
                
                const offsetX = Math.cos(angle * Math.PI / 180) * distance;
                const offsetY = Math.sin(angle * Math.PI / 180) * distance;
                
                otherCard.style.transform = `
                    translate3d(${offsetX}px, ${offsetY}px, -50px)
                    scale(0.7)
                    rotateY(${(Math.random() - 0.5) * 20}deg)
                `;
                otherCard.style.opacity = '0.4';
                otherCard.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            }
        });
    }
    
    /**
     * Return all cards to normal view
     */
    returnToNormalView() {
        const allCards = document.querySelectorAll('.blog-card');
        
        allCards.forEach((card) => {
            const cardState = this.cardStates.get(card.id);
            if (cardState) {
                cardState.isEnlarged = false;
            }
            
            card.style.transform = '';
            card.style.zIndex = '';
            card.style.opacity = '';
            card.style.transition = 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        });
        
        // Reset ecosystem state
        this.ecosystemState.globalEnergy = 0.3;
        this.ecosystemState.realityTear = 0;
    }
    
    /**
     * Setup smooth drag scrolling with snap-back
     */
    setupSmoothDragScrolling(content) {
        let isDragging = false;
        let startY = 0;
        let scrollTop = 0;
        let originalScrollTop = 0;
        
        content.addEventListener('mousedown', (e) => {
            isDragging = true;
            startY = e.pageY - content.offsetTop;
            scrollTop = content.scrollTop;
            originalScrollTop = scrollTop;
            content.style.cursor = 'grabbing';
            content.style.userSelect = 'none';
        });
        
        content.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            e.preventDefault();
            const y = e.pageY - content.offsetTop;
            const walk = (y - startY) * 2;
            content.scrollTop = scrollTop - walk;
        });
        
        content.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                content.style.cursor = '';
                content.style.userSelect = '';
                
                // SNAP-BACK TO ORIGINAL POSITION
                const targetScroll = originalScrollTop;
                this.smoothScrollTo(content, targetScroll, 600);
            }
        });
        
        content.addEventListener('mouseleave', () => {
            if (isDragging) {
                isDragging = false;
                content.style.cursor = '';
                content.style.userSelect = '';
                
                // SNAP-BACK TO ORIGINAL POSITION
                const targetScroll = originalScrollTop;
                this.smoothScrollTo(content, targetScroll, 600);
            }
        });
    }
    
    /**
     * Smooth scroll animation with easing
     */
    smoothScrollTo(element, target, duration) {
        const start = element.scrollTop;
        const change = target - start;
        const startTime = performance.now();
        
        const animateScroll = (currentTime) => {
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            
            // Cubic bezier easing
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            element.scrollTop = start + change * easeOut;
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };
        
        requestAnimationFrame(animateScroll);
    }
    
    /**
     * Update dimensional properties for impossible effects
     */
    updateDimensionalProperties() {
        const time = performance.now() * 0.001;
        
        // 4D HYPERROTATION
        this.dimensionalProps.hyperRotation.xw += 0.01 * this.ecosystemState.globalEnergy;
        this.dimensionalProps.hyperRotation.yw += 0.013 * this.ecosystemState.globalEnergy;
        this.dimensionalProps.hyperRotation.zw += 0.007 * this.ecosystemState.globalEnergy;
        
        // W-DIMENSION PROJECTION
        this.dimensionalProps.wProjection = Math.sin(time * 0.5) * this.ecosystemState.dimensionalShift;
        
        // GLITCH PHASE EVOLUTION
        this.dimensionalProps.glitchPhase += 0.05 * this.ecosystemState.realityTear;
        
        // Update CSS variables for global effects
        document.documentElement.style.setProperty('--hyperrotation-xw', this.dimensionalProps.hyperRotation.xw);
        document.documentElement.style.setProperty('--hyperrotation-yw', this.dimensionalProps.hyperRotation.yw);
        document.documentElement.style.setProperty('--w-projection', this.dimensionalProps.wProjection);
        document.documentElement.style.setProperty('--glitch-phase', this.dimensionalProps.glitchPhase);
    }
    
    /**
     * Trigger global glitch transition effect
     */
    triggerGlobalGlitchTransition(callback) {
        // INTENSE GLITCH BUILDUP
        let glitchIntensity = 0;
        const glitchInterval = setInterval(() => {
            glitchIntensity += 0.1;
            
            document.body.style.filter = `
                hue-rotate(${Math.random() * 360}deg)
                contrast(${1 + glitchIntensity})
                saturate(${1 + glitchIntensity * 2})
                brightness(${1 + Math.random() * glitchIntensity})
            `;
            
            if (glitchIntensity >= 1.0) {
                clearInterval(glitchInterval);
                
                // PEAK GLITCH MOMENT - Execute transition
                document.body.style.filter = 'contrast(3) saturate(0) brightness(2)';
                
                setTimeout(() => {
                    callback();
                    
                    // RETURN TO NORMAL
                    document.body.style.transition = 'filter 0.5s ease';
                    document.body.style.filter = '';
                    
                    setTimeout(() => {
                        document.body.style.transition = '';
                    }, 500);
                }, 100);
            }
        }, 50);
    }
    
    /**
     * Start the ecosystem update loop
     */
    startEcosystemLoop() {
        setInterval(() => {
            this.updateEcosystemDecay();
            this.updateCardAnimations();
        }, 16); // 60fps
    }
    
    /**
     * Update ecosystem decay for smooth transitions
     */
    updateEcosystemDecay() {
        // Gradual decay to calm state
        this.ecosystemState.globalEnergy *= 0.995;
        this.ecosystemState.realityTear *= 0.99;
        this.ecosystemState.dimensionalShift *= 0.998;
        this.ecosystemState.scrollMomentum *= 0.95;
        
        // Reset body filter when energy is low
        if (this.ecosystemState.globalEnergy < 0.1) {
            document.body.style.filter = '';
        }
    }
    
    /**
     * Update card animations continuously
     */
    updateCardAnimations() {
        this.cardStates.forEach((cardState, cardId) => {
            const card = document.getElementById(cardId);
            if (card && (cardState.glitchState.active || cardState.morphState.factor > 0)) {
                this.applyCardTransformation(card, cardState);
            }
        });
    }
    
    /**
     * Update all visualizers with ecosystem state
     */
    updateAllVisualizersWithEcosystem() {
        // This will be called by SystemController to update visualizers
        if (window.systemController) {
            window.systemController.updateVisualizersWithEcosystem(this.ecosystemState);
        }
    }
    
    /**
     * Update all visualizers with intensity
     */
    updateAllVisualizersWithIntensity(intensity) {
        if (window.systemController) {
            window.systemController.updateVisualizersWithIntensity(intensity);
        }
    }
}