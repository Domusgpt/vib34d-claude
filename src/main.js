
import { VIB34DIntegratedSystemBridge } from './systems/VIB34D_INTEGRATED_SYSTEM_BRIDGE.js';
import { NeoskeuomorphicHolographicSystem } from './core/NeoskeuomorphicHolographicSystem.js';

// Global error handler for better debugging
window.onerror = function(message, source, lineno, colno, error) {
    console.error("Global Error:", { message, source, lineno, colno, error });
    return true; // Prevent default error handling
};

window.addEventListener('unhandledrejection', (event) => {
    console.error("Unhandled Promise Rejection:", event.reason);
});

// Initialize when page loads
window.addEventListener('load', async () => {
    console.log('🚀 Initializing VIB34D Morphing Blog Integration...');
    // debugger; // Uncomment to pause execution in browser dev tools
    const system = new NeoskeuomorphicHolographicSystem(); // Initialize the new system
    window.neoskeuomorphicSystem = system; // Make it globally accessible for debugging

    const bridge = new VIB34DIntegratedSystemBridge();
    await bridge.initialize();
    window.vib34dBridge = bridge;
});
