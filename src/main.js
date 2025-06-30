
import { SystemController } from './core/SystemController.js';

// Global error handler for better debugging
window.onerror = function(message, source, lineno, colno, error) {
    console.error("🚨 GLOBAL ERROR:", {
        message: message,
        source: source,
        line: lineno,
        column: colno,
        error: error,
        stack: error ? error.stack : 'No stack trace'
    });
    return false; // Allow default error handling to show in console
};

window.addEventListener('unhandledrejection', (event) => {
    console.error("Unhandled Promise Rejection:", event.reason);
});

// Initialize when page loads
window.addEventListener('load', async () => {
    console.log('🚀 Initializing VIB34D JSON-Driven System...');
    
    try {
        // Initialize the new JSON-driven SystemController
        const systemController = new SystemController();
        await systemController.initialize();
        
        // Make globally accessible for debugging and agent control
        window.systemController = systemController;
        window.homeMaster = systemController.homeMaster;
        
        console.log('✅ VIB34D System fully operational!');
        console.log('🤖 Access via: window.agentAPI, window.systemController, window.homeMaster');
        
    } catch (error) {
        console.error('❌ VIB34D System initialization failed:', error);
        
        // Show error to user
        document.body.innerHTML = `
            <div style="background: #000; color: #ff0000; padding: 20px; font-family: monospace;">
                <h2>🚨 VIB34D System Error</h2>
                <p>Failed to initialize the JSON-driven system:</p>
                <pre>${error.message}</pre>
                <p>Check browser console for details.</p>
            </div>
        `;
    }
});
