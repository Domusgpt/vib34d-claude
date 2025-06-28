import { VIB34DIntegratedSystemBridge } from './systems/VIB34D_INTEGRATED_SYSTEM_BRIDGE.js';

// Initialize when page loads
window.addEventListener('load', async () => {
    console.log('🚀 Initializing VIB34D Morphing Blog Integration...');
    const bridge = new VIB34DIntegratedSystemBridge();
    await bridge.initialize();
    window.vib34dBridge = bridge;
});