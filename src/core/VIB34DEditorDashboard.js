
/**
 * @file VIB34DEditorDashboard.js
 * @description Implements the master control panel for the VIB34D system, providing real-time parameter manipulation, preset management, and visual feedback.
 */

/**
 * @class VIB34DEditorDashboard
 * @description Manages the editor dashboard UI, handling parameter controls, presets, and communication with the core VIB34D system.
 */
class VIB34DEditorDashboard {
    /**
     * @constructor
     * @param {string} containerId - The ID of the HTML element to contain the dashboard.
     */
    constructor(containerId) {
        /** @type {HTMLElement} */
        this.container = document.getElementById(containerId);
        /** @type {VIB34DMorphingBlogSystem} */
        this.core = null;
        /** @type {object} */
        this.interactionEngine = null; // Placeholder for interaction engine
        /** @type {object} */
        this.chromaticEngine = null; // Placeholder for chromatic engine
        /** @type {object} */
        this.presets = {};
        /** @type {object} */
        this.callbacks = {};
    }

    /**
     * @method initialize
     * @description Initializes the dashboard with references to core systems, builds the UI, and sets up event listeners.
     * @param {VIB34DMorphingBlogSystem} core - The main VIB34D morphing blog system instance.
     * @param {object} interactionEngine - The interaction engine instance.
     * @param {object} chromaticEngine - The chromatic engine instance.
     */
    initialize(core, interactionEngine, chromaticEngine) {
        this.core = core;
        this.interactionEngine = interactionEngine;
        this.chromaticEngine = chromaticEngine;
        this.buildDashboard();
        this.loadDefaultPresets();
        this.setupEventListeners();
    }

    /**
     * @method buildDashboard
     * @description Constructs the HTML structure of the editor dashboard.
     */
    buildDashboard() {
        const dashboardHTML = `
            <div class="dashboard-header">VIB34D Master Control</div>
            <div class="dashboard-section">
                <div class="dashboard-section-title">Geometry & Projection</div>
                <div class="control-group">
                    <label for="geometry-type">Geometry</label>
                    <select id="geometry-type">
                        <option value="hypercube">Hypercube</option>
                        <option value="hypersphere">Hypersphere</option>
                        <option value="hypertetrahedron">Hypertetrahedron</option>
                        <option value="torus">Torus</option>
                        <option value="klein">Klein Bottle</option>
                        <option value="fractal">Fractal</option>
                        <option value="wave">Wave</option>
                        <option value="crystal">Crystal</option>
                    </select>
                </div>
            </div>
            <div class="dashboard-section">
                <div class="dashboard-section-title">Core Parameters</div>
                <div class="control-group">
                    <label for="dimension">Dimension</label>
                    <input type="range" id="dimension" min="3" max="5" step="0.01" value="4">
                    <span class="param-value">4.00</span>
                </div>
                <div class="control-group">
                    <label for="morphFactor">Morph Factor</label>
                    <input type="range" id="morphFactor" min="0" max="1.5" step="0.01" value="0.7">
                    <span class="param-value">0.70</span>
                </div>
                <div class="control-group">
                    <label for="rotationSpeed">Rotation Speed</label>
                    <input type="range" id="rotationSpeed" min="0" max="3" step="0.01" value="0.5">
                    <span class="param-value">0.50</span>
                </div>
                <div class="control-group">
                    <label for="gridDensity">Grid Density</label>
                    <input type="range" id="gridDensity" min="1" max="25" step="0.1" value="8">
                    <span class="param-value">8.0</span>
                </div>
                <div class="control-group">
                    <label for="lineThickness">Line Thickness</label>
                    <input type="range" id="lineThickness" min="0.002" max="0.1" step="0.001" value="0.03">
                    <span class="param-value">0.030</span>
                </div>
                <div class="control-group">
                    <label for="universeModifier">Universe Modifier</label>
                    <input type="range" id="universeModifier" min="0.3" max="2.5" step="0.01" value="1">
                    <span class="param-value">1.00</span>
                </div>
                <div class="control-group">
                    <label for="patternIntensity">Pattern Intensity</label>
                    <input type="range" id="patternIntensity" min="0" max="3" step="0.01" value="1.3">
                    <span class="param-value">1.30</span>
                </div>
                <div class="control-group">
                    <label for="glitchIntensity">Glitch Intensity</label>
                    <input type="range" id="glitchIntensity" min="0" max="0.15" step="0.001" value="0.02">
                    <span class="param-value">0.020</span>
                </div>
                <div class="control-group">
                    <label for="colorShift">Color Shift</label>
                    <input type="range" id="colorShift" min="-1" max="1" step="0.01" value="0">
                    <span class="param-value">0.00</span>
                </div>
            </div>
            <div class="dashboard-section">
                <div class="dashboard-section-title">Presets</div>
                <div class="preset-buttons">
                    <button class="preset-button" data-preset="hypercube_default">Hypercube</button>
                    <button class="preset-button" data-preset="hypersphere_flow">Hypersphere</button>
                    <button class="preset-button" data-preset="tetrahedron_technical">Tetrahedron</button>
                    <button class="preset-button" data-preset="quantum_wave">Wave</button>
                    <button class="preset-button" data-preset="crystal_lattice">Crystal</button>
                    <button class="preset-button" data-preset="fractal_recursive">Fractal</button>
                    <button class="preset-button" data-preset="torus_flow">Torus</button>
                    <button class="preset-button" data-preset="klein_topology">Klein</button>
                </div>
                <div class="preset-actions">
                    <button id="export-config">Export</button>
                    <input type="file" id="import-config" accept=".json" style="display: none;">
                    <label for="import-config" class="import-label">Import</label>
                </div>
            </div>
        `;
        this.container.innerHTML = dashboardHTML;
    }

    /**
     * @method loadDefaultPresets
     * @description Loads the predefined set of geometry presets.
     */
    loadDefaultPresets() {
        this.presets = {
            hypercube_default: {
                geometryType: 'hypercube',
                dimension: 4.0,
                morphFactor: 0.7,
                gridDensity: 8.0,
                lineThickness: 0.03,
                rotationSpeed: 0.5
            },
            hypersphere_flow: {
                geometryType: 'hypersphere',
                dimension: 3.8,
                morphFactor: 0.9,
                gridDensity: 12.0,
                lineThickness: 0.02,
                rotationSpeed: 0.3
            },
            tetrahedron_technical: {
                geometryType: 'hypertetrahedron',
                dimension: 4.2,
                morphFactor: 0.4,
                gridDensity: 6.0,
                lineThickness: 0.035,
                rotationSpeed: 0.8
            },
            quantum_wave: {
                geometryType: 'wave',
                dimension: 4.5,
                morphFactor: 1.2,
                gridDensity: 20.0,
                lineThickness: 0.015,
                rotationSpeed: 1.5
            },
            crystal_lattice: {
                geometryType: 'crystal',
                dimension: 4.0,
                morphFactor: 0.3,
                gridDensity: 14.0,
                lineThickness: 0.025,
                rotationSpeed: 0.2
            },
            fractal_recursive: {
                geometryType: 'fractal',
                dimension: 4.3,
                morphFactor: 1.0,
                gridDensity: 6.0,
                lineThickness: 0.04,
                rotationSpeed: 1.0
            },
            torus_flow: {
                geometryType: 'torus',
                dimension: 3.9,
                morphFactor: 0.8,
                gridDensity: 10.0,
                lineThickness: 0.025,
                rotationSpeed: 0.6
            },
            klein_topology: {
                geometryType: 'klein',
                dimension: 4.1,
                morphFactor: 1.1,
                gridDensity: 9.0,
                lineThickness: 0.028,
                rotationSpeed: 0.7
            }
        };
    }

    /**
     * @method setupEventListeners
     * @description Sets up event listeners for dashboard controls (sliders, dropdowns, buttons).
     */
    setupEventListeners() {
        this.container.addEventListener('input', (e) => {
            if (e.target.type === 'range') {
                const paramName = e.target.id;
                const value = parseFloat(e.target.value);
                this.updateParameter(paramName, value);
                e.target.nextElementSibling.textContent = value.toFixed(3);
            }
        });

        this.container.addEventListener('change', (e) => {
            if (e.target.id === 'geometry-type') {
                const geometryType = e.target.value;
                this.core.switchGeometry(this.core.geometryNames.indexOf(geometryType));
            }
        });

        this.container.addEventListener('click', (e) => {
            if (e.target.classList.contains('preset-button')) {
                const presetName = e.target.dataset.preset;
                this.applyPreset(presetName);
            }

            if (e.target.id === 'export-config') {
                this.exportConfiguration();
            }
        });

        document.getElementById('import-config').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.importConfiguration(file);
            }
        });
    }

    /**
     * @method applyPreset
     * @description Applies a selected preset to the visualizer parameters.
     * @param {string} name - The name of the preset to apply.
     */
    applyPreset(name) {
        const preset = this.presets[name];
        if (preset) {
            for (const [key, value] of Object.entries(preset)) {
                this.updateParameter(key, value);
                const input = document.getElementById(key);
                if (input) {
                    input.value = value;
                    if (input.type === 'range') {
                        input.nextElementSibling.textContent = value.toFixed(3);
                    }
                }
            }
        }
    }

    /**
     * @method updateParameter
     * @description Updates a single visualizer parameter and notifies callbacks.
     * @param {string} name - The name of the parameter to update.
     * @param {number|string} value - The new value for the parameter.
     */
    updateParameter(name, value) {
        if (this.core) {
            const params = {};
            params[name] = value;
            this.core.updateAllVisualizers(params);
        }
        if (this.callbacks.onParameterUpdate) {
            this.callbacks.onParameterUpdate(name, value, this.getParameters());
        }
    }

    /**
     * @method getParameters
     * @description Retrieves the current values of all parameters from the dashboard UI.
     * @returns {object} An object containing all current parameter values.
     */
    getParameters() {
        const params = {};
        const inputs = this.container.querySelectorAll('input[type="range"], select');
        inputs.forEach(input => {
            params[input.id] = input.value;
        });
        return params;
    }

    /**
     * @method onParameterUpdate
     * @description Registers a callback function to be called when a parameter is updated.
     * @param {function} callback - The callback function.
     */
    onParameterUpdate(callback) {
        this.callbacks.onParameterUpdate = callback;
    }

    /**
     * @method exportConfiguration
     * @description Exports the current dashboard configuration as a JSON file.
     */
    exportConfiguration() {
        const config = this.getParameters();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "vib34d_config.json");
        document.body.appendChild(downloadAnchorNode); // required for firefox
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    }

    /**
     * @method importConfiguration
     * @description Imports a dashboard configuration from a JSON file.
     * @param {File} file - The JSON file to import.
     */
    importConfiguration(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const config = JSON.parse(e.target.result);
                for (const [key, value] of Object.entries(config)) {
                    this.updateParameter(key, value);
                    const input = document.getElementById(key);
                    if (input) {
                        input.value = value;
                        if (input.type === 'range') {
                            input.nextElementSibling.textContent = value.toFixed(3);
                        }
                    }
                }
            } catch (error) {
                console.error("Error parsing config file:", error);
            }
        };
        reader.readAsText(file);
    }

    /**
     * @method show
     * @description Makes the dashboard visible.
     */
    show() {
        this.container.style.display = 'block';
    }

    /**
     * @method hide
     * @description Hides the dashboard.
     */
    hide() {
        this.container.style.display = 'none';
    }
}

export { VIB34DEditorDashboard };
