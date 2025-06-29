
/**
 * @file VIB34DReactiveCore.js
 * @description Implements the core WebGL visualizer for VIB34D, handling rendering of 4D geometries.
 */

/**
 * @class VIB34DReactiveCore
 * @description Manages a single WebGL visualizer instance, rendering dynamic 4D geometries.
 */
class VIB34DReactiveCore {
    /**
     * @constructor
     * @param {HTMLCanvasElement} canvas - The HTML canvas element to render on.
     * @param {number} [geometryType=0] - The initial geometry type (0-7).
     * @param {number[]} [baseColor=[1.0, 0.0, 1.0]] - The base color for the geometry as an RGB array.
     * @param {string} [instanceType='card'] - The type of visualizer instance ('board' or 'card').
     */
    constructor(canvas, geometryType = 0, baseColor = [1.0, 0.0, 1.0], instanceType = 'card') {
        /** @type {HTMLCanvasElement} */
        this.canvas = canvas;
        /** @type {WebGLRenderingContext} */
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        
        if (!this.gl) {
            console.error('WebGL not supported');
            return;
        }
        
        /** @type {number} */
        this.geometryType = geometryType;
        /** @type {number[]} */
        this.baseColor = baseColor;
        /** @type {string} */
        this.instanceType = instanceType;
        
        /** @type {number} */
        this.startTime = Date.now();
        /** @type {object} */
        this.interactionState = {
            type: 'idle',
            intensity: 0,
            lastActivity: Date.now(),
            mouseX: 0.5,
            mouseY: 0.5
        };
        
        /** @type {object} */
        this.params = {
            morphFactor: 0.7,
            gridDensity: 12.0,
            dimension: 4.0,
            glitchIntensity: 0.05,
            rotationSpeed: 0.5,
            interactionIntensity: 0.3,
            baseColor: baseColor,
            geometry: geometryType,
            lineThickness: 0.03,
            patternIntensity: 1.3,
            colorShift: 0.0,
            audioBass: 0.0,
            audioMid: 0.0,
            audioHigh: 0.0
        };
        /** @type {boolean} */
        this.paramsDirty = true; // Add dirty flag
        
        /** @type {object} */
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
    
    /**
     * @method initShaders
     * @description Initializes WebGL shaders (vertex and fragment) and gets uniform locations.
     */
    initShaders() {
        const vertexShaderSource = `
          attribute vec2 a_position;
          void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
          }
        `;
        
        // Full 4D polytopal visualizer fragment shader
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
          uniform float u_lineThickness;
          uniform float u_patternIntensity;
          uniform float u_colorShift;
          uniform float u_audioBass;
          uniform float u_audioMid;
          uniform float u_audioHigh;
          
          // 4D rotation matrices
          mat4 rotateXW(float angle) {
              float c = cos(angle);
              float s = sin(angle);
              return mat4(
                  c, 0, 0, s,
                  0, 1, 0, 0,
                  0, 0, 1, 0,
                  -s, 0, 0, c
              );
          }
          
          mat4 rotateYZ(float angle) {
              float c = cos(angle);
              float s = sin(angle);
              return mat4(
                  1, 0, 0, 0,
                  0, c, -s, 0,
                  0, s, c, 0,
                  0, 0, 0, 1
              );
          }
          
          mat4 rotateZW(float angle) {
              float c = cos(angle);
              float s = sin(angle);
              return mat4(
                  1, 0, 0, 0,
                  0, 1, 0, 0,
                  0, 0, c, s,
                  0, 0, -s, c
              );
          }
          
          mat4 rotateYW(float angle) {
              float c = cos(angle);
              float s = sin(angle);
              return mat4(
                  1, 0, 0, 0,
                  0, c, 0, s,
                  0, 0, 1, 0,
                  0, -s, 0, c
              );
          }
          
          // 4D to 3D projection
          vec3 project4Dto3D(vec4 p) {
              float viewDistance = 2.5;
              float w_factor = viewDistance / (viewDistance + p.w);
              return p.xyz * w_factor;
          }
          
          // Hypercube lattice
          float hypercubeLattice(vec3 p, float gridDensity) {
              vec3 grid = fract(p * gridDensity);
              vec3 edges = abs(grid - 0.5);
              float thickness = u_lineThickness * (1.0 + u_audioBass * 0.5);
              vec3 lines = smoothstep(0.5 - thickness, 0.5, edges);
              return max(max(lines.x, lines.y), lines.z);
          }
          
          // Tetrahedron lattice
          float tetrahedronLattice(vec3 p, float gridDensity) {
              vec3 q = fract(p * gridDensity) - 0.5;
              float d1 = length(q);
              float d2 = length(q - vec3(0.3, 0.0, 0.0));
              float d3 = length(q - vec3(0.0, 0.3, 0.0));
              float d4 = length(q - vec3(0.0, 0.0, 0.3));
              float vertices = smoothstep(0.0, 0.05, min(min(d1, d2), min(d3, d4)));
              return 1.0 - vertices;
          }
          
          // Sphere lattice
          float sphereLattice(vec3 p, float gridDensity) {
              vec3 q = fract(p * gridDensity) - 0.5;
              float r = length(q);
              return smoothstep(0.2, 0.25, r) - smoothstep(0.25, 0.3, r);
          }
          
          // Torus lattice
          float torusLattice(vec3 p, float gridDensity) {
              vec3 q = fract(p * gridDensity) - 0.5;
              float r1 = length(q.xy);
              float r2 = sqrt((r1 - 0.15)*(r1 - 0.15) + q.z*q.z);
              return smoothstep(0.02, 0.05, r2) - smoothstep(0.05, 0.08, r2);
          }
          
          // Wave lattice
          float waveLattice(vec3 p, float gridDensity) {
              vec3 q = p * gridDensity;
              float wave = sin(q.x + u_time * u_rotationSpeed * 0.001) * 
                          sin(q.y + u_time * u_rotationSpeed * 0.0012) * 
                          sin(q.z + u_time * u_rotationSpeed * 0.0008);
              return smoothstep(-0.2, 0.2, wave);
          }
          
          float getGeometryLattice(vec3 p, float gridDensity, float geometry) {
              if (geometry < 0.5) return hypercubeLattice(p, gridDensity);
              else if (geometry < 1.5) return tetrahedronLattice(p, gridDensity);
              else if (geometry < 2.5) return sphereLattice(p, gridDensity);
              else if (geometry < 3.5) return torusLattice(p, gridDensity);
              else return waveLattice(p, gridDensity);
          }
          
          void main() {
              vec2 uv = gl_FragCoord.xy / u_resolution.xy;
              float aspectRatio = u_resolution.x / u_resolution.y;
              uv.x *= aspectRatio;
              uv -= 0.5;
              
              // 4D space coordinates
              float time = u_time * 0.001 * u_rotationSpeed * u_speedMult;
              vec4 p4d = vec4(uv, sin(time * 0.3), cos(time * 0.2));
              
              // Apply 4D rotations
              p4d = rotateXW(time * 0.5) * p4d;
              p4d = rotateYZ(time * 0.3) * p4d;
              p4d = rotateZW(time * 0.7) * p4d;
              p4d = rotateYW(time * 0.2 + u_morphFactor * 0.5) * p4d;
              
              // Project to 3D
              vec3 p3d = project4Dto3D(p4d);
              
              // Apply morphing between 3D and 4D
              vec3 p = mix(vec3(uv, 0.0), p3d, u_morphFactor);
              
              // Calculate lattice with configurable grid density
              float adjustedDensity = u_gridDensity * u_densityMult;
              float lattice = getGeometryLattice(p, adjustedDensity, u_geometry);
              
              // Add interaction effects
              vec2 mouseOffset = (u_mouse - 0.5) * u_interactionIntensity;
              float mouseDist = length(uv - mouseOffset);
              float mouseEffect = exp(-mouseDist * 3.0) * u_interactionIntensity * 0.3;
              lattice += mouseEffect;
              
              // Color with geometry-specific base color and pattern intensity
              vec3 color = u_baseColor * lattice * u_instanceIntensity * u_patternIntensity;
              
              // Add audio reactivity
              color += vec3(u_audioBass * 0.3, u_audioMid * 0.2, u_audioHigh * 0.4);
              
              // Apply color shift (hue rotation)
              if (abs(u_colorShift) > 0.01) {
                  float shift = u_colorShift * 3.14159;
                  mat3 hueRotation = mat3(
                      cos(shift) + (1.0 - cos(shift)) / 3.0, 
                      (1.0/3.0) * (1.0 - cos(shift)) - sin(shift) * sqrt(1.0/3.0),
                      (1.0/3.0) * (1.0 - cos(shift)) + sin(shift) * sqrt(1.0/3.0),
                      (1.0/3.0) * (1.0 - cos(shift)) + sin(shift) * sqrt(1.0/3.0),
                      cos(shift) + (1.0/3.0) * (1.0 - cos(shift)),
                      (1.0/3.0) * (1.0 - cos(shift)) - sin(shift) * sqrt(1.0/3.0),
                      (1.0/3.0) * (1.0 - cos(shift)) - sin(shift) * sqrt(1.0/3.0),
                      (1.0/3.0) * (1.0 - cos(shift)) + sin(shift) * sqrt(1.0/3.0),
                      cos(shift) + (1.0/3.0) * (1.0 - cos(shift))
                  );
                  color = hueRotation * color;
              }
              
              // Add glitch effects
              if (u_glitchIntensity > 0.01) {
                  float glitch = sin(uv.y * 50.0 + time * 10.0) * u_glitchIntensity * 0.1;
                  color.r += glitch;
                  color.g -= glitch * 0.5;
              }
              
              gl_FragColor = vec4(color, lattice * 0.9);
          }
        `;
        
        console.log('VIB34DReactiveCore: Compiling vertex shader...');
        const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
        console.log('VIB34DReactiveCore: Compiling fragment shader...');
        const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        
        if (!vertexShader || !fragmentShader) {
            console.error('VIB34DReactiveCore: Shader compilation failed. Aborting program creation.');
            return;
        }

        console.log('VIB34DReactiveCore: Linking program...');
        this.program = this.createProgram(vertexShader, fragmentShader);
        
        if (!this.program) {
            console.error('VIB34DReactiveCore: Program linking failed. Aborting uniform setup.');
            return;
        }

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
            instanceIntensity: this.gl.getUniformLocation(this.program, 'u_instanceIntensity'),
            lineThickness: this.gl.getUniformLocation(this.program, 'u_lineThickness'),
            patternIntensity: this.gl.getUniformLocation(this.program, 'u_patternIntensity'),
            colorShift: this.gl.getUniformLocation(this.program, 'u_colorShift'),
            audioBass: this.gl.getUniformLocation(this.program, 'u_audioBass'),
            audioMid: this.gl.getUniformLocation(this.program, 'u_audioMid'),
            audioHigh: this.gl.getUniformLocation(this.program, 'u_audioHigh')
        };
        
        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, 'a_position');
    }
    
    /**
     * @method createShader
     * @description Creates and compiles a WebGL shader.
     * @param {number} type - The type of shader (gl.VERTEX_SHADER or gl.FRAGMENT_SHADER).
     * @param {string} source - The GLSL source code for the shader.
     * @returns {WebGLShader} The compiled shader.
     */
    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error("Shader compilation error:", this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader);
            return null;
        }
        console.log(`VIB34DReactiveCore: ${type === this.gl.VERTEX_SHADER ? 'Vertex' : 'Fragment'} shader compiled successfully.`);
        return shader;
    }
    
    /**
     * @method createProgram
     * @description Creates and links a WebGL program from compiled shaders.
     * @param {WebGLShader} vertexShader - The compiled vertex shader.
     * @param {WebGLShader} fragmentShader - The compiled fragment shader.
     * @returns {WebGLProgram} The linked WebGL program.
     */
    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error("Program linking error:", this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program);
            return null;
        }
        console.log('VIB34DReactiveCore: WebGL program linked successfully.');
        return program;
    }
    
    /**
     * @method initBuffers
     * @description Initializes WebGL buffers for rendering a full-screen quad.
     */
    initBuffers() {
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0]),
            this.gl.STATIC_DRAW
        );
    }
    
    /**
     * @method setupInteractions
     * @description Sets up basic mouse interaction listeners for the canvas.
     */
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
    
    /**
     * @method updateParams
     * @description Updates the visualizer's parameters and marks them as dirty for re-rendering.
     * @param {object} newParams - An object containing new parameter values.
     */
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
    
    /**
     * @method updateInteractionState
     * @description Updates the internal interaction state.
     * @param {string} type - The type of interaction.
     * @param {number} intensity - The intensity of the interaction.
     */
    updateInteractionState(type, intensity) {
        this.interactionState.type = type;
        this.interactionState.intensity = intensity;
        this.interactionState.lastActivity = Date.now();
    }
    
    /**
     * @method resize
     * @description Resizes the canvas to match its display size and updates the WebGL viewport.
     */
    resize() {
        const displayWidth = this.canvas.clientWidth;
        const displayHeight = this.canvas.clientHeight;
        
        if (this.canvas.width !== displayWidth || this.canvas.height !== displayHeight) {
            this.canvas.width = displayWidth;
            this.canvas.height = displayHeight;
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    /**
     * @method render
     * @description Renders a single frame of the visualization.
     */
    render() {
        this.resize();
        
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        this.gl.useProgram(this.program);
        
        // Update uniforms
        const time = (Date.now() - this.startTime) / 1000;
        
        // Update all uniforms for 4D polytopal visualizer
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
        
        // Pass all the JSON parameters to shaders
        this.gl.uniform1f(this.uniforms.lineThickness, this.params.lineThickness || 0.03);
        this.gl.uniform1f(this.uniforms.patternIntensity, this.params.patternIntensity || 1.3);
        this.gl.uniform1f(this.uniforms.colorShift, this.params.colorShift || 0.0);
        this.gl.uniform1f(this.uniforms.audioBass, this.params.audioBass || 0.0);
        this.gl.uniform1f(this.uniforms.audioMid, this.params.audioMid || 0.0);
        this.gl.uniform1f(this.uniforms.audioHigh, this.params.audioHigh || 0.0);
        
        // Bind and draw
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
        
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
    
    /**
     * @method animate
     * @description The main animation loop, requesting a new frame if parameters are dirty.
     */
    animate() {
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}

export { VIB34DReactiveCore };
