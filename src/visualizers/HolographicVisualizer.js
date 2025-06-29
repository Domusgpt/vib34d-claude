
// ENHANCED HOLOGRAPHIC VISUALIZER
class HolographicVisualizer {
    constructor(canvasId, role = 'content', reactivity = 1.0) {
        this.canvas = document.getElementById(canvasId);
        this.role = role; // 'background', 'shadow', 'content', 'highlight', 'accent'
        this.reactivity = reactivity; // 0.5 = subtle, 1.0 = normal, 1.5 = highly reactive
        this.gl = this.canvas.getContext('webgl');
        
        if (!this.gl) {
            console.error(`WebGL not supported for ${canvasId}`);
            return;
        }
        
        // Role-specific parameters
        this.roleParams = {
            'background': { 
                densityMult: 0.4, speedMult: 0.2, colorShift: 0.0, intensity: 0.2,
                mouseReactivity: 0.3, clickReactivity: 0.1 
            },
            'shadow': { 
                densityMult: 0.8, speedMult: 0.3, colorShift: 180.0, intensity: 0.4,
                mouseReactivity: 0.5, clickReactivity: 0.3 
            },
            'content': { 
                densityMult: 1.0 + Math.random() * 0.5, speedMult: 0.6 + Math.random() * 0.3, 
                colorShift: Math.random() * 360, intensity: 0.7 + Math.random() * 0.2,
                mouseReactivity: 1.0, clickReactivity: 0.8 
            },
            'highlight': { 
                densityMult: 1.5, speedMult: 0.8, colorShift: 60.0, intensity: 0.6,
                mouseReactivity: 1.2, clickReactivity: 1.0 
            },
            'accent': { 
                densityMult: 0.6, speedMult: 0.4, colorShift: 300.0, intensity: 0.3,
                mouseReactivity: 1.5, clickReactivity: 1.2 
            }
        }[role] || { densityMult: 1.0, speedMult: 0.5, colorShift: 0.0, intensity: 0.5, mouseReactivity: 1.0, clickReactivity: 0.5 };
        
        // Enhanced state system
        this.currentState = 0;
        this.targetState = 0;
        this.transitionProgress = 1.0;
        this.chaosIntensity = 0.0;
        
        // Mouse interaction
        this.mouseX = 0.5;
        this.mouseY = 0.5;
        this.mouseIntensity = 0.0;
        this.clickIntensity = 0.0;
        this.clickDecay = 0.95;
        
        // Grid density changes
        this.baseDensity = 6.0 + Math.random() * 4.0;
        this.densityVariation = 0.0;
        this.densityTarget = 0.0;
        
        // Enhanced state definitions
        this.states = [
            { // HOME
                geometry: 0.0, density: this.baseDensity, speed: 0.5,
                color: [1.0, 0.0, 1.0], dimension: 3.5,
                name: 'HOME', geometryName: 'Hypercube'
            },
            { // TECH
                geometry: 1.0, density: this.baseDensity * 0.7, speed: 0.3,
                color: [0.0, 1.0, 1.0], dimension: 3.2,
                name: 'TECH', geometryName: 'Tetrahedron'
            },
            { // MEDIA
                geometry: 2.0, density: this.baseDensity * 1.3, speed: 0.8,
                color: [1.0, 1.0, 0.0], dimension: 3.8,
                name: 'MEDIA', geometryName: 'Sphere'
            },
            { // AUDIO
                geometry: 3.0, density: this.baseDensity * 0.9, speed: 0.6,
                color: [0.0, 1.0, 0.0], dimension: 3.6,
                name: 'AUDIO', geometryName: 'Torus'
            },
            { // QUANTUM
                geometry: 6.0, density: this.baseDensity * 1.5, speed: 0.7,
                color: [1.0, 0.0, 0.5], dimension: 3.9,
                name: 'QUANTUM', geometryName: 'Wave'
            }
        ];
        
        this.startTime = Date.now();
        this.initShaders();
        this.initBuffers();
        this.resize();
        this.startRenderLoop();
        
        console.log(`✅ Holographic Visualizer (${role}) - Reactivity: ${reactivity}x`);
    }
    
    initShaders() {
        const vertexShaderSource = `
            attribute vec2 a_position;
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;
        
        const fragmentShaderSource = `
            precision highp float;
            
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform float u_geometry;
            uniform float u_density;
            uniform float u_speed;
            uniform vec3 u_color;
            uniform float u_intensity;
            uniform float u_roleDensity;
            uniform float u_roleSpeed;
            uniform float u_colorShift;
            uniform float u_chaosIntensity;
            uniform float u_mouseIntensity;
            uniform float u_clickIntensity;
            uniform float u_densityVariation;
            
            // Enhanced 4D rotation matrices
            mat4 rotateXW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(c, 0, 0, -s, 0, 1, 0, 0, 0, 0, 1, 0, s, 0, 0, c);
            }
            
            mat4 rotateYW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1, 0, 0, 0, 0, c, 0, -s, 0, 0, 1, 0, 0, s, 0, c);
            }
            
            mat4 rotateZW(float theta) {
                float c = cos(theta);
                float s = sin(theta);
                return mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, c, -s, 0, 0, s, c);
            }
            
            vec3 project4Dto3D(vec4 p) {
                float w = 2.5 / (2.5 + p.w);
                return vec3(p.x * w, p.y * w, p.z * w);
            }
            
            // Enhanced geometric functions with more detail
            float hypercubeLattice(vec3 p, float gridSize) {
                vec3 grid = fract(p * gridSize);
                vec3 edges = 1.0 - smoothstep(0.0, 0.008, abs(grid - 0.5));
                
                // Add corner intersections
                float corners = length(grid - 0.5);
                corners = 1.0 - smoothstep(0.0, 0.1, corners);
                
                return max(max(max(edges.x, edges.y), edges.z), corners * 0.3);
            }
            
            float tetrahedronLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                
                // Tetrahedron vertices
                float d1 = length(q);
                float d2 = length(q - vec3(0.4, 0.0, 0.0));
                float d3 = length(q - vec3(0.0, 0.4, 0.0));
                float d4 = length(q - vec3(0.0, 0.0, 0.4));
                
                float vertices = 1.0 - smoothstep(0.0, 0.04, min(min(d1, d2), min(d3, d4)));
                
                // Edge connections
                float edges = 0.0;
                edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xy) - 0.2)));
                edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.yz) - 0.2)));
                edges = max(edges, 1.0 - smoothstep(0.0, 0.02, abs(length(q.xz) - 0.2)));
                
                return max(vertices, edges * 0.5);
            }
            
            float sphereLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float r = length(q);
                
                // Multiple sphere sizes for detail
                float main = 1.0 - smoothstep(0.05, 0.25, r);
                float detail = 1.0 - smoothstep(0.15, 0.35, r);
                
                return max(main, detail * 0.3);
            }
            
            float torusLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float r1 = length(q.xy);
                float r2 = sqrt((r1 - 0.15)*(r1 - 0.15) + q.z*q.z);
                
                float main = 1.0 - smoothstep(0.0, 0.05, r2);
                
                // Add inner detail
                float inner = 1.0 - smoothstep(0.0, 0.08, abs(r1 - 0.15));
                
                return max(main, inner * 0.4);
            }
            
            float waveLattice(vec3 p, float gridSize) {
                vec3 q = p * gridSize;
                
                // Multiple wave frequencies
                float wave1 = sin(q.x * 1.0 + u_time * u_speed * 0.0005);
                float wave2 = sin(q.y * 1.2 + u_time * u_speed * 0.0007);
                float wave3 = sin(q.z * 0.8 + u_time * u_speed * 0.0003);
                
                float interference = wave1 * wave2 * wave3;
                
                // Add harmonic details
                float harmonics = sin(q.x * 3.0) * sin(q.y * 3.0) * 0.3;
                
                return smoothstep(-0.2, 0.2, interference + harmonics);
            }
            
            float getGeometryValue(vec3 p, float gridSize, float geomType) {
                if (geomType < 0.5) return hypercubeLattice(p, gridSize);
                else if (geomType < 1.5) return tetrahedronLattice(p, gridSize);
                else if (geomType < 2.5) return sphereLattice(p, gridSize);
                else if (geomType < 3.5) return torusLattice(p, gridSize);
                else return waveLattice(p, gridSize);
            }
            
            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }
            
            // Enhanced effect functions
            vec3 rgbGlitch(vec3 color, vec2 uv, float intensity) {
                vec2 offset = vec2(intensity * 0.005, 0.0);
                float r = color.r + sin(uv.y * 30.0 + u_time * 0.001) * intensity * 0.06;
                float g = color.g + sin(uv.y * 28.0 + u_time * 0.0012) * intensity * 0.06;
                float b = color.b + sin(uv.y * 32.0 + u_time * 0.0008) * intensity * 0.06;
                return vec3(r, g, b);
            }
            
            float moirePattern(vec2 uv, float intensity) {
                float freq1 = 12.0 + intensity * 6.0 + u_densityVariation * 3.0;
                float freq2 = 14.0 + intensity * 8.0 + u_densityVariation * 4.0;
                float pattern1 = sin(uv.x * freq1) * sin(uv.y * freq1);
                float pattern2 = sin(uv.x * freq2) * sin(uv.y * freq2);
                return (pattern1 * pattern2) * intensity * 0.15;
            }
            
            // Grid overlay function
            float gridOverlay(vec2 uv, float intensity) {
                vec2 grid = fract(uv * (8.0 + u_densityVariation * 4.0));
                float lines = 0.0;
                lines = max(lines, 1.0 - smoothstep(0.0, 0.02, abs(grid.x - 0.5)));
                lines = max(lines, 1.0 - smoothstep(0.0, 0.02, abs(grid.y - 0.5)));
                return lines * intensity * 0.1;
            }
            
            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                float aspectRatio = u_resolution.x / u_resolution.y;
                uv.x *= aspectRatio;
                uv -= 0.5;
                
                // Enhanced 4D space with mouse reactivity
                float time = u_time * 0.0004 * u_speed * u_roleSpeed;
                
                // Mouse influence on rotation
                float mouseInfluence = u_mouseIntensity * 0.5;
                vec2 mouseOffset = (u_mouse - 0.5) * mouseInfluence;
                
                vec4 p4d = vec4(uv + mouseOffset * 0.1, 
                               sin(time * 0.15), 
                               cos(time * 0.12));
                
                // Enhanced 4D rotations with mouse reactivity
                p4d = rotateXW(time * 0.2 + mouseOffset.y * 0.5) * p4d;
                p4d = rotateYW(time * 0.15 + mouseOffset.x * 0.5) * p4d;
                p4d = rotateZW(time * 0.25 + u_clickIntensity * 0.3) * p4d;
                
                vec3 p = project4Dto3D(p4d);
                
                // Dynamic density with variation
                float roleDensity = (u_density + u_densityVariation) * u_roleDensity;
                
                // Get geometry value
                float lattice = getGeometryValue(p, roleDensity, u_geometry);
                
                // Enhanced coloring with mouse reactivity
                float hue = atan(u_color.g, u_color.r) + u_colorShift * 0.017453 + u_mouseIntensity * 0.2;
                float saturation = 0.8 + lattice * 0.2 + u_clickIntensity * 0.1;
                float brightness = 0.2 + lattice * 0.8 + u_intensity * 0.2 + u_mouseIntensity * 0.15;
                
                vec3 color = hsv2rgb(vec3(hue, saturation, brightness));
                
                // Add enhanced effects
                color += vec3(moirePattern(uv, u_chaosIntensity));
                color += vec3(gridOverlay(uv, u_mouseIntensity));
                color = rgbGlitch(color, uv, u_chaosIntensity);
                
                // Mouse interaction glow
                float mouseDist = length(uv - (u_mouse - 0.5) * vec2(aspectRatio, 1.0));
                float mouseGlow = exp(-mouseDist * 1.5) * u_mouseIntensity * 0.2;
                color += vec3(mouseGlow) * u_color * 0.6;
                
                // Click pulse effect
                float clickPulse = u_clickIntensity * exp(-mouseDist * 2.0) * 0.3;
                color += vec3(clickPulse, clickPulse * 0.5, clickPulse * 1.5);
                
                gl_FragColor = vec4(color, 0.95);
            }
        `;
        
        this.program = this.createProgram(vertexShaderSource, fragmentShaderSource);
        this.uniforms = {
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
            geometry: this.gl.getUniformLocation(this.program, 'u_geometry'),
            density: this.gl.getUniformLocation(this.program, 'u_density'),
            speed: this.gl.getUniformLocation(this.program, 'u_speed'),
            color: this.gl.getUniformLocation(this.program, 'u_color'),
            intensity: this.gl.getUniformLocation(this.program, 'u_intensity'),
            roleDensity: this.gl.getUniformLocation(this.program, 'u_roleDensity'),
            roleSpeed: this.gl.getUniformLocation(this.program, 'u_roleSpeed'),
            colorShift: this.gl.getUniformLocation(this.program, 'u_colorShift'),
            chaosIntensity: this.gl.getUniformLocation(this.program, 'u_chaosIntensity'),
            mouseIntensity: this.gl.getUniformLocation(this.program, 'u_mouseIntensity'),
            clickIntensity: this.gl.getUniformLocation(this.program, 'u_clickIntensity'),
            densityVariation: this.gl.getUniformLocation(this.program, 'u_densityVariation')
        };
    }
    
    createProgram(vertexSource, fragmentSource) {
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource);
        
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Program linking failed:', this.gl.getProgramInfoLog(program));
            return null;
        }
        
        return program;
    }
    
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Shader compilation failed:', this.gl.getShaderInfoLog(shader));
            return null;
        }
        
        return shader;
    }
    
    initBuffers() {
        const positions = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        
        this.buffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
        
        const positionLocation = this.gl.getAttribLocation(this.program, 'a_position');
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0);
    }
    
    resize() {
        this.canvas.width = this.canvas.clientWidth;
        this.canvas.height = this.canvas.clientHeight;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    
    snapToState(stateIndex) {
        if (stateIndex !== this.targetState) {
            this.targetState = stateIndex;
            this.transitionProgress = 0.0;
        }
    }
    
    updateChaos(intensity) {
        this.chaosIntensity = intensity;
    }
    
    updateInteraction(mouseX, mouseY, intensity) {
        this.mouseX = mouseX;
        this.mouseY = mouseY;
        this.mouseIntensity = intensity * this.roleParams.mouseReactivity * this.reactivity;
    }
    
    triggerClick(x, y) {
        this.clickIntensity = Math.min(1.0, this.clickIntensity + this.roleParams.clickReactivity * this.reactivity);
    }
    
    updateDensity(variation) {
        this.densityTarget = variation;
    }
    
    // Interface for HomeMaster compatibility
    updateParams(params) {
        if (params.u_gridDensity !== undefined) {
            this.updateDensity(params.u_gridDensity / 12.0); // Normalize
        }
        if (params.u_morphFactor !== undefined) {
            this.chaosIntensity = params.u_morphFactor * 0.5;
        }
        if (params.u_glitchIntensity !== undefined) {
            this.chaosIntensity = Math.max(this.chaosIntensity, params.u_glitchIntensity);
        }
        if (params.geometry !== undefined) {
            this.changeState(Math.floor(params.geometry) % this.states.length);
        }
    }
    
    render() {
        if (!this.program) return;
        
        this.resize();
        this.gl.useProgram(this.program);
        
        if (this.transitionProgress < 1.0) {
            this.transitionProgress = Math.min(1.0, this.transitionProgress + 0.02);
        }
        
        this.densityVariation += (this.densityTarget - this.densityVariation) * 0.05;
        
        this.clickIntensity *= this.clickDecay;
        
        const currentState = this.states[this.currentState];
        const targetState = this.states[this.targetState];
        const t = this.transitionProgress;
        const smoothT = t * t * (3.0 - 2.0 * t);
        
        const interpolated = {
            geometry: currentState.geometry + (targetState.geometry - currentState.geometry) * smoothT,
            density: currentState.density + (targetState.density - currentState.density) * smoothT,
            speed: currentState.speed + (targetState.speed - currentState.speed) * smoothT,
            color: [
                currentState.color[0] + (targetState.color[0] - currentState.color[0]) * smoothT,
                currentState.color[1] + (targetState.color[1] - currentState.color[1]) * smoothT,
                currentState.color[2] + (targetState.color[2] - currentState.color[2]) * smoothT
            ]
        };
        
        if (this.transitionProgress >= 1.0 && this.currentState !== this.targetState) {
            this.currentState = this.targetState;
        }
        
        const time = Date.now() - this.startTime;
        
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.uniforms.time, time);
        this.gl.uniform2f(this.uniforms.mouse, this.mouseX, this.mouseY);
        this.gl.uniform1f(this.uniforms.geometry, interpolated.geometry);
        this.gl.uniform1f(this.uniforms.density, interpolated.density);
        this.gl.uniform1f(this.uniforms.speed, interpolated.speed);
        this.gl.uniform3fv(this.uniforms.color, new Float32Array(interpolated.color));
        this.gl.uniform1f(this.uniforms.intensity, this.roleParams.intensity);
        this.gl.uniform1f(this.uniforms.roleDensity, this.roleParams.densityMult);
        this.gl.uniform1f(this.uniforms.roleSpeed, this.roleParams.speedMult);
        this.gl.uniform1f(this.uniforms.colorShift, this.roleParams.colorShift);
        this.gl.uniform1f(this.uniforms.chaosIntensity, this.chaosIntensity);
        this.gl.uniform1f(this.uniforms.mouseIntensity, this.mouseIntensity);
        this.gl.uniform1f(this.uniforms.clickIntensity, this.clickIntensity);
        this.gl.uniform1f(this.uniforms.densityVariation, this.densityVariation);
        
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
    
    startRenderLoop() {
        const animate = () => {
            this.render();
            requestAnimationFrame(animate);
        };
        animate();
    }
}

// NEOSKEUOMORPHIC HOLOGRAPHIC SYSTEM
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
            { id: 'background-visualizer', role: 'background', reactivity: 0.5 },
            { id: 'shadow-visualizer', role: 'shadow', reactivity: 0.7 },
            { id: 'card-visualizer-1', role: 'content', reactivity: 1.0 },
            { id: 'highlight-visualizer-1', role: 'highlight', reactivity: 1.2 },
            { id: 'card-visualizer-2', role: 'content', reactivity: 1.1 },
            { id: 'highlight-visualizer-2', role: 'highlight', reactivity: 1.3 },
            { id: 'card-visualizer-3', role: 'content', reactivity: 0.9 },
            { id: 'highlight-visualizer-3', role: 'highlight', reactivity: 1.1 },
            { id: 'card-visualizer-4', role: 'content', reactivity: 1.2 },
            { id: 'highlight-visualizer-4', role: 'highlight', reactivity: 1.4 },
            { id: 'card-visualizer-5', role: 'content', reactivity: 0.8 },
            { id: 'highlight-visualizer-5', role: 'highlight', reactivity: 1.0 },
            { id: 'accent-visualizer', role: 'accent', reactivity: 1.5 }
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
            
            const gridOverlay = document.getElementById('gridOverlay');
            if (this.mouseIntensity > 0.3) {
                gridOverlay.classList.add('active');
            } else {
                gridOverlay.classList.remove('active');
            }
            
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
        const progress = Math.abs(this.scrollAccumulation) / this.scrollThreshold * 100;
        document.getElementById('scrollFill').style.height = `${Math.min(100, progress)}%`;
        
        document.getElementById('scroll-progress').textContent = `${Math.abs(this.scrollAccumulation).toFixed(1)}/${this.scrollThreshold}`;
        document.getElementById('chaos-level').textContent = `${(this.chaosIntensity * 100).toFixed(0)}%`;
        
        const chaosOverlay = document.getElementById('chaosOverlay');
        const gridOverlay = document.getElementById('gridOverlay');
        if (this.chaosIntensity > 0.3) {
            chaosOverlay.classList.add('active');
            gridOverlay.classList.add('active');
        } else {
            chaosOverlay.classList.remove('active');
            if (this.mouseIntensity <= 0.3) {
                gridOverlay.classList.remove('active');
            }
        }
    }
    
    decayScrollAccumulation() {
        this.scrollAccumulation *= this.scrollDecay;
        if (Math.abs(this.scrollAccumulation) < 0.1) {
            this.scrollAccumulation = 0;
            this.chaosIntensity = 0;
            
            this.visualizers.forEach(viz => {
                viz.updateChaos(0);
            });
            
            document.getElementById('chaosOverlay').classList.remove('active');
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
        
        const holoContainer = document.getElementById('holoContainer');
        holoContainer.className = `holographic-container ${this.layoutClasses[newState]}`;
        
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

export { HolographicVisualizer };
