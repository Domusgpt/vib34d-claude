/**
 * @file VIB34DEnhancedCore.js
 * @description HIGH-FIDELITY 4D POLYTOPAL VISUALIZER
 * Enhanced version with all advanced features from reference implementations
 */

export class VIB34DEnhancedCore {
    constructor(canvas) {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            throw new Error('WebGL not supported');
        }
        
        this.time = 0;
        this.animationId = null;
        this.isActive = false;
        
        // Enhanced configuration system
        this.config = {
            gridDensity: 12.0,
            morphFactor: 0.5,
            dimension: 3.5,
            glitchIntensity: 0.3,
            rotationSpeed: 0.5,
            geometry: 0,
            interactionIntensity: 0.0,
            colorShift: 0.0,
            baseColor: [1.0, 0.0, 1.0]
        };
        
        // Advanced theme configurations
        this.themeConfigs = {
            hypercube: {
                baseColor: [1.0, 0.0, 1.0],
                gridDensity: 12.0,
                morphFactor: 0.5,
                dimension: 3.5,
                glitchIntensity: 0.3,
                rotationSpeed: 0.5,
                geometry: 0
            },
            tetrahedron: {
                baseColor: [0.0, 1.0, 1.0],
                gridDensity: 8.0,
                morphFactor: 0.3,
                dimension: 3.2,
                glitchIntensity: 0.1,
                rotationSpeed: 0.3,
                geometry: 1
            },
            sphere: {
                baseColor: [1.0, 1.0, 0.0],
                gridDensity: 15.0,
                morphFactor: 0.7,
                dimension: 3.8,
                glitchIntensity: 0.2,
                rotationSpeed: 0.4,
                geometry: 2
            },
            torus: {
                baseColor: [0.0, 1.0, 0.0],
                gridDensity: 10.0,
                morphFactor: 0.6,
                dimension: 3.3,
                glitchIntensity: 0.4,
                rotationSpeed: 0.6,
                geometry: 3
            },
            kleinBottle: {
                baseColor: [1.0, 0.5, 0.0],
                gridDensity: 14.0,
                morphFactor: 0.8,
                dimension: 3.7,
                glitchIntensity: 0.5,
                rotationSpeed: 0.7,
                geometry: 4
            },
            fractal: {
                baseColor: [0.5, 0.0, 1.0],
                gridDensity: 20.0,
                morphFactor: 0.9,
                dimension: 3.6,
                glitchIntensity: 0.6,
                rotationSpeed: 0.2,
                geometry: 5
            },
            wave: {
                baseColor: [0.0, 0.5, 1.0],
                gridDensity: 16.0,
                morphFactor: 1.0,
                dimension: 3.9,
                glitchIntensity: 0.1,
                rotationSpeed: 0.8,
                geometry: 6
            },
            crystal: {
                baseColor: [1.0, 0.0, 0.5],
                gridDensity: 18.0,
                morphFactor: 0.4,
                dimension: 4.0,
                glitchIntensity: 0.7,
                rotationSpeed: 0.4,
                geometry: 7
            }
        };
        
        // Advanced mouse interaction system
        this.mouseQuadrantSystem = {
            quadrant1: { // Top-Right - "Active Creation"
                gridModifier: (base, time) => base * (1.1 + Math.sin(time * 0.3) * 0.1),
                morphModifier: (base) => base * 1.2,
                dimensionShift: (base) => base + 0.15,
                rotationBoost: (base) => base * 1.4,
                glitchModifier: (base) => base * 1.3
            },
            quadrant2: { // Top-Left - "Contemplative Focus"  
                gridModifier: (base, time) => base * (0.9 + Math.cos(time * 0.2) * 0.05),
                morphModifier: (base) => base * 0.8,
                dimensionShift: (base) => base - 0.1,
                rotationBoost: (base) => base * 0.7,
                glitchModifier: (base) => base * 0.6
            },
            quadrant3: { // Bottom-Left - "Structural Foundation"
                gridModifier: (base, time) => base * (1.0 + Math.sin(time * 0.1) * 0.03),
                morphModifier: (base) => base * 0.5,
                dimensionShift: (base) => base - 0.2,
                rotationBoost: (base) => base * 0.5,
                glitchModifier: (base) => base * 0.4
            },
            quadrant4: { // Bottom-Right - "Dynamic Flow"
                gridModifier: (base, time) => base * (1.3 + Math.sin(time * 0.4) * 0.2),
                morphModifier: (base) => base * 1.5,
                dimensionShift: (base) => base + 0.3,
                rotationBoost: (base) => base * 1.8,
                glitchModifier: (base) => base * 1.6
            }
        };
        
        this.mouse = { x: 0.5, y: 0.5 };
        this.targetMouse = { x: 0.5, y: 0.5 };
        this.mouseVelocity = { x: 0, y: 0 };
        this.holdDuration = 0;
        this.isMouseDown = false;
        
        this.setupWebGL();
        this.createShaderProgram();
        this.setupBuffers();
        this.setupEventListeners();
    }
    
    setupWebGL() {
        const gl = this.gl;
        
        // Enhanced WebGL configuration
        gl.disable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        
        // Set viewport
        this.resize();
    }
    
    createShaderProgram() {
        const gl = this.gl;
        
        // High-fidelity vertex shader
        const vertexShaderSource = `
            attribute vec4 a_position;
            void main() {
                gl_Position = a_position;
            }
        `;
        
        // Advanced fragment shader with all geometry types
        const fragmentShaderSource = `
            precision highp float;
            
            uniform vec2 u_resolution;
            uniform float u_time;
            uniform vec2 u_mouse;
            uniform float u_gridDensity;
            uniform float u_morphFactor;
            uniform float u_dimension;
            uniform float u_glitchIntensity;
            uniform float u_rotationSpeed;
            uniform float u_geometry;
            uniform float u_interactionIntensity;
            uniform float u_colorShift;
            uniform vec3 u_baseColor;
            
            // 4D rotation matrices
            mat4 rotateXW(float angle) {
                float c = cos(angle);
                float s = sin(angle);
                return mat4(
                    c, 0, 0, -s,
                    0, 1, 0, 0,
                    0, 0, 1, 0,
                    s, 0, 0, c
                );
            }
            
            mat4 rotateYW(float angle) {
                float c = cos(angle);
                float s = sin(angle);
                return mat4(
                    1, 0, 0, 0,
                    0, c, 0, -s,
                    0, 0, 1, 0,
                    0, s, 0, c
                );
            }
            
            mat4 rotateZW(float angle) {
                float c = cos(angle);
                float s = sin(angle);
                return mat4(
                    1, 0, 0, 0,
                    0, 1, 0, 0,
                    0, 0, c, -s,
                    0, 0, s, c
                );
            }
            
            // 4D to 3D projection
            vec3 project4Dto3D(vec4 p) {
                float w = 2.0 / (2.0 + p.w);
                return vec3(p.x * w, p.y * w, p.z * w);
            }
            
            // HSV to RGB conversion
            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }
            
            // Geometry generators with enhanced detail
            float hypercubeLattice(vec3 p, float gridSize) {
                vec3 grid = fract(p * gridSize);
                vec3 edges = 1.0 - smoothstep(0.0, 0.03, abs(grid - 0.5));
                return max(max(edges.x, edges.y), edges.z);
            }
            
            float tetrahedronLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float d1 = length(q);
                float d2 = length(q - vec3(0.5, 0.0, 0.0));
                float d3 = length(q - vec3(0.0, 0.5, 0.0));
                float d4 = length(q - vec3(0.0, 0.0, 0.5));
                return 1.0 - smoothstep(0.0, 0.1, min(min(d1, d2), min(d3, d4)));
            }
            
            float sphereLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float r = length(q);
                return 1.0 - smoothstep(0.2, 0.5, r);
            }
            
            float torusLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float r1 = sqrt(q.x*q.x + q.y*q.y);
                float r2 = sqrt((r1 - 0.3)*(r1 - 0.3) + q.z*q.z);
                return 1.0 - smoothstep(0.0, 0.1, r2);
            }
            
            float kleinBottleLattice(vec3 p, float gridSize) {
                vec3 q = p * gridSize;
                float u = q.x * 0.5;
                float v = q.y * 0.5;
                float x = (2.0 + cos(u/2.0)*sin(v) - sin(u/2.0)*sin(2.0*v)) * cos(u);
                float y = (2.0 + cos(u/2.0)*sin(v) - sin(u/2.0)*sin(2.0*v)) * sin(u);
                float z = sin(u/2.0)*sin(v) + cos(u/2.0)*sin(2.0*v);
                vec3 klein = vec3(x, y, z) * 0.1;
                return 1.0 - smoothstep(0.0, 0.2, length(q - klein));
            }
            
            float fractalLattice(vec3 p, float gridSize) {
                vec3 q = p * gridSize;
                float scale = 1.0;
                float fractal = 0.0;
                for(int i = 0; i < 4; i++) {
                    q = fract(q) - 0.5;
                    fractal += abs(length(q)) / scale;
                    scale *= 2.0;
                    q *= 2.0;
                }
                return 1.0 - smoothstep(0.0, 1.0, fractal);
            }
            
            float waveLattice(vec3 p, float gridSize) {
                vec3 q = p * gridSize;
                float wave = sin(q.x * 2.0 + u_time) * sin(q.y * 2.0 + u_time * 0.7) * sin(q.z * 2.0 + u_time * 0.3);
                return 0.5 + 0.5 * wave;
            }
            
            float crystalLattice(vec3 p, float gridSize) {
                vec3 q = fract(p * gridSize) - 0.5;
                float crystal = max(abs(q.x), max(abs(q.y), abs(q.z)));
                return 1.0 - smoothstep(0.3, 0.5, crystal);
            }
            
            float getGeometryValue(vec3 p, float gridSize, float geomType) {
                if (geomType < 0.5) return hypercubeLattice(p, gridSize);
                else if (geomType < 1.5) return tetrahedronLattice(p, gridSize);
                else if (geomType < 2.5) return sphereLattice(p, gridSize);
                else if (geomType < 3.5) return torusLattice(p, gridSize);
                else if (geomType < 4.5) return kleinBottleLattice(p, gridSize);
                else if (geomType < 5.5) return fractalLattice(p, gridSize);
                else if (geomType < 6.5) return waveLattice(p, gridSize);
                else return crystalLattice(p, gridSize);
            }
            
            void main() {
                vec2 uv = gl_FragCoord.xy / u_resolution.xy;
                float aspectRatio = u_resolution.x / u_resolution.y;
                uv.x *= aspectRatio;
                
                vec2 center = vec2(u_mouse.x * aspectRatio, u_mouse.y);
                vec3 p = vec3(uv - center, 0.0);
                
                // Enhanced interaction-driven rotation
                float timeRotation = u_time * 0.2 * u_rotationSpeed * (1.0 + u_interactionIntensity);
                mat2 rotation = mat2(cos(timeRotation), -sin(timeRotation), sin(timeRotation), cos(timeRotation));
                p.xy = rotation * p.xy;
                p.z = sin(u_time * 0.1) * 0.5;
                
                // Advanced 4D transformations
                if (u_dimension > 3.0) {
                    float w = sin(length(p) * 3.0 + u_time * 0.3) * (u_dimension - 3.0) * (1.0 + u_interactionIntensity * 0.5);
                    vec4 p4d = vec4(p, w);
                    
                    p4d = rotateXW(timeRotation * 0.31) * p4d;
                    p4d = rotateYW(timeRotation * 0.27) * p4d;
                    p4d = rotateZW(timeRotation * 0.23) * p4d;
                    
                    p = project4Dto3D(p4d);
                }
                
                // Dynamic grid density with interaction
                float dynamicGridDensity = u_gridDensity * (1.0 + u_interactionIntensity * 0.3);
                
                // Enhanced glitch effects with RGB separation
                float glitchAmount = u_glitchIntensity * (0.1 + 0.1 * sin(u_time * 5.0)) * (1.0 + u_interactionIntensity);
                
                vec2 rOffset = vec2(glitchAmount, glitchAmount * 0.5);
                vec2 gOffset = vec2(-glitchAmount * 0.3, glitchAmount * 0.2);
                vec2 bOffset = vec2(glitchAmount * 0.1, -glitchAmount * 0.4);
                
                float r = getGeometryValue(vec3(p.xy + rOffset, p.z), dynamicGridDensity, u_geometry);
                float g = getGeometryValue(vec3(p.xy + gOffset, p.z), dynamicGridDensity, u_geometry);
                float b = getGeometryValue(vec3(p.xy + bOffset, p.z), dynamicGridDensity, u_geometry);
                
                // Advanced HSV color system
                float hue = u_colorShift + u_time * 0.1 + length(p) * 0.5 + u_geometry * 45.0;
                float saturation = 0.8 + u_interactionIntensity * 0.2;
                float brightness = 0.9 + u_interactionIntensity * 0.1;
                
                vec3 baseHSV = vec3(hue / 360.0, saturation, brightness);
                vec3 baseRGB = hsv2rgb(baseHSV);
                
                // Mix base color with HSV computed color
                vec3 finalColor = mix(u_baseColor, baseRGB, 0.7);
                
                // Apply RGB channel effects
                finalColor *= vec3(r, g, b);
                
                // Enhanced morphing effects
                float morphInfluence = u_morphFactor * (1.0 + sin(u_time * 0.5) * 0.1);
                finalColor = mix(finalColor, finalColor.zxy, morphInfluence * 0.3);
                
                // Final brightness and contrast enhancement
                finalColor = pow(finalColor, vec3(0.9));
                finalColor *= 1.2;
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;
        
        // Compile shaders
        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        // Create program
        this.program = gl.createProgram();
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
        
        if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
            throw new Error('Shader program failed to link: ' + gl.getProgramInfoLog(this.program));
        }
        
        // Get uniform locations
        this.uniforms = {
            resolution: gl.getUniformLocation(this.program, 'u_resolution'),
            time: gl.getUniformLocation(this.program, 'u_time'),
            mouse: gl.getUniformLocation(this.program, 'u_mouse'),
            gridDensity: gl.getUniformLocation(this.program, 'u_gridDensity'),
            morphFactor: gl.getUniformLocation(this.program, 'u_morphFactor'),
            dimension: gl.getUniformLocation(this.program, 'u_dimension'),
            glitchIntensity: gl.getUniformLocation(this.program, 'u_glitchIntensity'),
            rotationSpeed: gl.getUniformLocation(this.program, 'u_rotationSpeed'),
            geometry: gl.getUniformLocation(this.program, 'u_geometry'),
            interactionIntensity: gl.getUniformLocation(this.program, 'u_interactionIntensity'),
            colorShift: gl.getUniformLocation(this.program, 'u_colorShift'),
            baseColor: gl.getUniformLocation(this.program, 'u_baseColor')
        };
    }
    
    createShader(type, source) {
        const gl = this.gl;
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const error = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error('Shader compilation error: ' + error);
        }
        
        return shader;
    }
    
    setupBuffers() {
        const gl = this.gl;
        
        // Full-screen quad
        const positions = new Float32Array([
            -1.0, -1.0,
             1.0, -1.0,
            -1.0,  1.0,
             1.0,  1.0
        ]);
        
        this.positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        
        this.positionAttribute = gl.getAttribLocation(this.program, 'a_position');
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = 1.0 - (e.clientY - rect.top) / rect.height;
            
            // Calculate velocity
            this.mouseVelocity.x = x - this.targetMouse.x;
            this.mouseVelocity.y = y - this.targetMouse.y;
            
            this.targetMouse.x = x;
            this.targetMouse.y = y;
        });
        
        this.canvas.addEventListener('mousedown', () => {
            this.isMouseDown = true;
            this.holdDuration = 0;
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isMouseDown = false;
        });
        
        window.addEventListener('resize', () => this.resize());
    }
    
    resize() {
        const gl = this.gl;
        const canvas = this.canvas;
        
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    
    updateMouseQuadrantEffects() {
        const x = this.mouse.x;
        const y = this.mouse.y;
        
        let quadrant;
        if (x > 0.5 && y > 0.5) quadrant = this.mouseQuadrantSystem.quadrant1;
        else if (x <= 0.5 && y > 0.5) quadrant = this.mouseQuadrantSystem.quadrant2;
        else if (x <= 0.5 && y <= 0.5) quadrant = this.mouseQuadrantSystem.quadrant3;
        else quadrant = this.mouseQuadrantSystem.quadrant4;
        
        // Apply quadrant effects
        const theme = this.themeConfigs[this.currentTheme] || this.themeConfigs.hypercube;
        
        this.config.gridDensity = quadrant.gridModifier(theme.gridDensity, this.time);
        this.config.morphFactor = quadrant.morphModifier(theme.morphFactor);
        this.config.dimension = quadrant.dimensionShift(theme.dimension);
        this.config.rotationSpeed = quadrant.rotationBoost(theme.rotationSpeed);
        this.config.glitchIntensity = quadrant.glitchModifier(theme.glitchIntensity);
        
        // Calculate interaction intensity based on mouse movement and hold
        const velocity = Math.sqrt(this.mouseVelocity.x * this.mouseVelocity.x + this.mouseVelocity.y * this.mouseVelocity.y);
        const holdFactor = this.isMouseDown ? Math.min(this.holdDuration / 2.0, 1.0) : 0;
        
        this.config.interactionIntensity = Math.min(velocity * 10 + holdFactor, 1.0);
    }
    
    setTheme(themeName) {
        if (this.themeConfigs[themeName]) {
            this.currentTheme = themeName;
            const theme = this.themeConfigs[themeName];
            Object.assign(this.config, theme);
        }
    }
    
    setParameter(name, value) {
        if (this.config.hasOwnProperty(name)) {
            this.config[name] = value;
        }
    }
    
    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.animate();
    }
    
    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    animate() {
        if (!this.isActive) return;
        
        this.time += 0.016; // 60fps
        
        if (this.isMouseDown) {
            this.holdDuration += 0.016;
        }
        
        // Smooth mouse interpolation
        this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.1;
        this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.1;
        
        // Update quadrant effects
        this.updateMouseQuadrantEffects();
        
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    render() {
        const gl = this.gl;
        
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.program);
        
        // Bind position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        gl.enableVertexAttribArray(this.positionAttribute);
        gl.vertexAttribPointer(this.positionAttribute, 2, gl.FLOAT, false, 0, 0);
        
        // Set uniforms
        gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        gl.uniform1f(this.uniforms.time, this.time);
        gl.uniform2f(this.uniforms.mouse, this.mouse.x, this.mouse.y);
        gl.uniform1f(this.uniforms.gridDensity, this.config.gridDensity);
        gl.uniform1f(this.uniforms.morphFactor, this.config.morphFactor);
        gl.uniform1f(this.uniforms.dimension, this.config.dimension);
        gl.uniform1f(this.uniforms.glitchIntensity, this.config.glitchIntensity);
        gl.uniform1f(this.uniforms.rotationSpeed, this.config.rotationSpeed);
        gl.uniform1f(this.uniforms.geometry, this.config.geometry);
        gl.uniform1f(this.uniforms.interactionIntensity, this.config.interactionIntensity);
        gl.uniform1f(this.uniforms.colorShift, this.config.colorShift);
        gl.uniform3f(this.uniforms.baseColor, ...this.config.baseColor);
        
        // Draw
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    
    destroy() {
        this.stop();
        
        const gl = this.gl;
        if (this.program) {
            gl.deleteProgram(this.program);
        }
        if (this.positionBuffer) {
            gl.deleteBuffer(this.positionBuffer);
        }
    }
}