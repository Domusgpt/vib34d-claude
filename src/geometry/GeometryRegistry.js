
class GeometryRegistry {
    constructor(config) {
        this.config = config;
        this.geometries = new Map();
        console.log('📐 GeometryRegistry initialized');
    }

    async getGeometry(type) {
        console.log(`GeometryRegistry: Getting geometry ${type}`);
        return null; // Placeholder
    }
}

export { GeometryRegistry };
