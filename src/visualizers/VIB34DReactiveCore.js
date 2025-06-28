
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
            morphFactor: 0.5,
            gridDensity: 12.0,
            dimension: 3.5,
            glitchIntensity: 0.5,
            rotationSpeed: 0.5,
            interactionIntensity: 0.3,
            baseColor: baseColor,
            geometry: geometryType
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
        
        // Simplified fragment shader for debugging
        const fragmentShaderSource = `
          precision highp float;
          uniform vec2 u_resolution;
          void main() {
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Solid red color
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
            instanceIntensity: this.gl.getUniformLocation(this.program, 'u_instanceIntensity')
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
        
        // Only update uniforms that are actually used by the simplified shader
        this.gl.uniform2f(this.uniforms.resolution, this.canvas.width, this.canvas.height);
        // this.gl.uniform1f(this.uniforms.time, time);
        // this.gl.uniform2f(this.uniforms.mouse, this.interactionState.mouseX, this.interactionState.mouseY);
        // this.gl.uniform1f(this.uniforms.morphFactor, this.params.morphFactor);
        // this.gl.uniform1f(this.uniforms.glitchIntensity, this.params.glitchIntensity);
        // this.gl.uniform1f(this.uniforms.rotationSpeed, this.params.rotationSpeed);
        // this.gl.uniform1f(this.uniforms.dimension, this.params.dimension);
        // this.gl.uniform1f(this.uniforms.gridDensity, this.params.gridDensity);
        // this.gl.uniform3f(this.uniforms.baseColor, this.params.baseColor[0], this.params.baseColor[1], this.params.baseColor[2]);
        // this.gl.uniform1f(this.uniforms.interactionIntensity, this.params.interactionIntensity);
        // this.gl.uniform1f(this.uniforms.geometry, this.params.geometry);
        // this.gl.uniform1f(this.uniforms.densityMult, this.instanceModifiers.densityMult);
        // this.gl.uniform1f(this.uniforms.speedMult, this.instanceModifiers.speedMult);
        // this.gl.uniform1f(this.uniforms.instanceIntensity, this.instanceModifiers.intensity);
        
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
        if (!this.paramsDirty) {
            requestAnimationFrame(() => this.animate());
            return;
        }
        this.paramsDirty = false;
        this.render();
        requestAnimationFrame(() => this.animate());
    }
}

export { VIB34DReactiveCore };
