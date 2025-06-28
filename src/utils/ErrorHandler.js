
class ErrorHandler {
    constructor(config) {
        this.config = config;
        console.log('🚨 ErrorHandler initialized');
    }

    handleError(context, error) {
        console.error(`ErrorHandler: Error in ${context}:`, error);
    }
}

export { ErrorHandler };
