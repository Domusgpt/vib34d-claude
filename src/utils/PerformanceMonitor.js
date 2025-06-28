
class PerformanceMonitor {
    constructor(config) {
        this.config = config;
        console.log('📊 PerformanceMonitor initialized');
    }

    startMonitoring() {
        console.log('▶️ PerformanceMonitor started');
    }

    stopMonitoring() {
        console.log('⏸️ PerformanceMonitor stopped');
    }
}

export { PerformanceMonitor };
