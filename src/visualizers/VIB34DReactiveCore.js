
// Enhanced VIB34D Reactive Core with User Interaction Parameter Control
class VIB34DReactiveCore {
    constructor(canvas, geometryType = 0, baseColor = [1.0, 0.0, 1.0], instanceType = 'card') {
        this.canvas = canvas;
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.error('WebGL not supported');
            return;
        }
        
        this.geometryType = geometryType;
        this.baseColor = baseColor;
        this.instanceType = instanceType;
        
        // Core state
        this.startTime = Date.now();
        this.interactionState = {
            type: 'idle',
            intensity: 0,
            lastActivity: Date.now(),
            mouseX: 0.5,
            mouseY: 0.5
        };
        
        // Parameters (controlled by user interactions)
        this.params = {
            morphFactor: 0.5,
            gridDensity: 12.0,
            dimension: 3.5,
            glitchIntensity: 0.5,
            rotationSpeed: 0.5,
            interactionIntensity: 0.3,
            baseColor: baseColor,
            geometry: geometryType
        };
        this.paramsDirty = true; // Add dirty flag
        
        // Instance modifiers for variety
        this.instanceModifiers = instanceType === 'board' ? {
            densityMult: 0.6,
            speedMult: 0.3,
            intensity: 0.4
        } : {
            densityMult: 0.8 + Math.random() * 0.4,
            speedMult: 0.5 + Math.random() * 0.3,
            intensity: 0.7 + Math.random() * 0.3
        };
        
        this.initShaders();
        this.initBuffers();
        this.setupInteractions();
        this.resize();
        this.animate();
        
        console.log(`✅ VIB34D Reactive Core initialized for ${instanceType}`);
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
          uniform float u_morphFactor;
          uniform float u_glitchIntensity;
          uniform float u_rotationSpeed;
          uniform float u_dimension;
          uniform float u_gridDensity;
          uniform vec3 u_baseColor;
          uniform float u_interactionIntensity;
          uniform float u_geometry;
          uniform float u_densityMult;
          uniform float u_speedMult;
          uniform float u_instanceIntensity;
          
          // 4D rotation matrices
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
            float w = 2.0 / (2.0 + p.w);
            return vec3(p.x * w, p.y * w, p.z * w);
          }
          
          // Geometry generators
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
          
          float kleinLattice(vec3 p, float gridSize) {
            vec3 q = fract(p * gridSize);
            float u = q.x * 2.0 * 3.14159;
            float v = q.y * 2.0 * 3.14159;
            float x = cos(u) * (3.0 + cos(u/2.0) * sin(v) - sin(u/2.0) * sin(2.0*v));
            float klein = length(vec2(x, q.z)) - 0.1;
            return 1.0 - smoothstep(0.0, 0.05, abs(klein));
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
            float wave = sin(q.x * 2.0) * sin(q.y * 2.0) * sin(q.z * 2.0 + u_time);
            return smoothstep(-0.5, 0.5, wave);
          }
          
          float crystalLattice(vec3 p, float gridSize) {
            vec3 q = fract(p * gridSize) - 0.5;
            float d = max(max(abs(q.x), abs(q.y)), abs(q.z));
            return 1.0 - smoothstep(0.3, 0.5, d);
          }
          
          float getGeometryValue(vec3 p, float gridSize, float geomType) {
            if (geomType < 0.5) return hypercubeLattice(p, gridSize);
            else if (geomType < 1.5) return tetrahedronLattice(p, gridSize);
            else if (geomType < 2.5) return sphereLattice(p, gridSize);
            else if (geomType < 3.5) return torusLattice(p, gridSize);
            else if (geomType < 4.5) return kleinLattice(p, gridSize);
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
            
            // Interaction-driven rotation
            float timeRotation = u_time * 0.2 * u_rotationSpeed * u_speedMult * (1.0 + u_interactionIntensity);
            mat2 rotation = mat2(cos(timeRotation), -sin(timeRotation), sin(timeRotation), cos(timeRotation));
            p.xy = rotation * p.xy;
            p.z = sin(u_time * 0.1) * 0.5;
            
            // Apply 4D transformations
            if (u_dimension > 3.0) {
              float w = sin(length(p) * 3.0 + u_time * 0.3) * (u_dimension - 3.0) * (1.0 + u_interactionIntensity * 0.5);
              vec4 p4d = vec4(p, w);
              
              p4d = rotateXW(timeRotation * 0.31) * p4d;
              p4d = rotateYW(timeRotation * 0.27) * p4d;
              p4d = rotateZW(timeRotation * 0.23) * p4d;
              
              p = project4Dto3D(p4d);
            }
            
            // Dynamic grid density with interaction and instance modifiers
            float dynamicGridDensity = u_gridDensity * u_densityMult * (1.0 + u_interactionIntensity * 0.3);
            
            // Get geometry value
            float lattice = getGeometryValue(p, dynamicGridDensity, u_geometry);
            
            // Glitch effects with interaction
            float glitchAmount = u_glitchIntensity * (0.1 + 0.1 * sin(u_time * 5.0)) * (1.0 + u_interactionIntensity);
            
            vec2 rOffset = vec2(glitchAmount, glitchAmount * 0.5);
            vec2 gOffset = vec2(-glitchAmount * 0.3, glitchAmount * 0.2);
            vec2 bOffset = vec2(glitchAmount * 0.1, -glitchAmount * 0.4);
            
            float r = getGeometryValue(vec3(p.xy + rOffset, p.z), dynamicGridDensity, u_geometry);
            float g = getGeometryValue(vec3(p.xy + gOffset, p.z), dynamicGridDensity, u_geometry);
            float b = getGeometryValue(vec3(p.xy + bOffset, p.z), dynamicGridDensity, u_geometry);
            
            // Colors with instance variation
            vec3 baseColor = vec3(0.02, 0.05, 0.1);
            vec3 latticeColor = u_baseColor * (0.8 + 0.2 * u_interactionIntensity) * u_instanceIntensity;
            
            vec3 color = mix(baseColor, latticeColor, vec3(r, g, b));
            
            // Interaction glow
            color += u_baseColor * 0.1 * (0.5 + 0.5 * sin(u_time * 0.5)) * u_interactionIntensity;
            
            // Vignette
            float vignette = 1.0 - smoothstep(0.4, 1.4, length(uv - vec2(center.x, center.y)));
            color *= vignette;
            
            gl_FragColor = vec4(color, 0.95);
          }
        `;
        
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        this.program = this.createProgram(vertexShader, fragmentShader);
        
        // Get uniform locations
        this.uniforms = {
            resolution: this.gl.getUniformLocation(this.program, 'u_resolution'),
            time: this.gl.getUniformLocation(this.program, 'u_time'),
            mouse: this.gl.getUniformLocation(this.program, 'u_mouse'),
            morphFactor: this.gl.getUniformLocation(this.program, 'u_morphFactor'),
            glitchIntensity: this.gl.getUniformLocation(this.program, 'u_glitchIntensity'),
            rotationSpeed: this.gl.getUniformLocation(this.program, 'u_rotationSpeed'),
            dimension: this.gl.getUniformLocation(this.program, 'u_dimension'),
            gridDensity: this.gl.getUniformLocation(this.program, 'u_gridDensity'),
            baseColor: this.gl.getUniformLocation(this.program, 'u_baseColor'),
            interactionIntensity: this.gl.getUniformLocation(this.program, 'u_interactionIntensity'),
            geometry: this.gl.getUniformLocation(this.program, 'u_geometry'),
            densityMult: this.gl.getUniformLocation(this.program, 'u_densityMult'),
            speedMult: this.gl.getUniformLocation(this.program, 'u_speedMult'),
            instanceIntensity: this.gl.getUniformLocation(this.program, 'u_instanceIntensity')
        };
        
        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
    }
    
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error("Shader error:", this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        return shader;
    }
    
    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error("Program error:", this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }
        return program;
    }
    
    initBuffers() {
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]),
            this.gl.STATIC_DRAW
        );
    }
    
    setupInteractions() {
        // Individual canvas interactions for ecosystem behavior
        this.canvas.addEventListener('mouseenter', () => {
            this.interactionState.intensity = 0.8;
            this.interactionState.type = 'hover';
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.interactionState.intensity = 0.3;
            this.interactionState.type = 'idle';
        });
    }
    
    updateParams(newParams) {
        let changed = false;
        for (const key in newParams) {
            if (this.params[key] !== newParams[key]) {
                this.params[key] = newParams[key];
                changed = true;
            }
        }
        if (changed) {
            this.paramsDirty = true;
        }
    }
    
    updateInteractionState(type, intensity) {
        this.interactionState.type = type;
        this.interactionState.intensity = intensity;
        this.interactionState.lastActivity = Date.now();
    }
    
    resize() {
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;
        
        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    render() {
        this.resize();
        
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        this.gl.useProgram(this.program);
        
        // Update uniforms
        const time = (Date.now() - this.startTime) / 1000;
        
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        this.gl.uniform1f(this.uniforms.time, time);
        this.gl.uniform2f(this.uniforms.mouse, this.interactionState.mouseX, this.interactionState.mouseY);
        this.gl.uniform1f(this.uniforms.morphFactor, this.params.morphFactor);
        this.gl.uniform1f(this.uniforms.glitchIntensity, this.params.glitchIntensity);
        this.gl.uniform1f(this.uniforms.rotationSpeed, this.params.rotationSpeed);
        this.gl.uniform1f(this.uniforms.dimension, this.params.dimension);
        this.gl.uniform1f(this.uniforms.gridDensity, this.params.gridDensity);
        this.gl.uniform3f(this.uniforms.baseColor, this.params.baseColor[0], this.params.baseColor[1], this.params.baseColor[2]);
        this.gl.uniform1f(this.uniforms.interactionIntensity, this.params.interactionIntensity);
        this.gl.uniform1f(this.uniforms.geometry, this.params.geometry);
        this.gl.uniform1f(this.uniforms.densityMult, this.instanceModifiers.densityMult);
        this.gl.uniform1f(this.uniforms.speedMult, this.instanceModifiers.speedMult);
        this.gl.uniform1f(this.uniforms.instanceIntensity, this.instanceModifiers.intensity);
        
        // Bind and draw
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
        
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
    
    animate() {
        if (!this.paramsDirty) {
            requestAnimationFrame(() => this.animate());
            return;
        }
        this.paramsDirty = false;
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}
