const puppeteer = require('puppeteer');

async function visualTest() {
    console.log('🎨 Running visual test...');
    
    const browser = await puppeteer.launch({ 
        headless: false, 
        devtools: true,
        args: ['--enable-unsafe-swiftshader', '--disable-web-security']
    });
    
    const page = await browser.newPage();
    
    page.on('console', msg => console.log(`[BROWSER] ${msg.text()}`));
    
    try {
        await page.goto('https://domusgpt.github.io/vib34d-gemini/', { waitUntil: 'networkidle0' });
        
        // Wait for system
        await page.waitForFunction(() => window.systemController && window.systemController.isInitialized, { timeout: 15000 });
        
        console.log('📺 Checking canvas rendering...');
        
        // Check if canvases are actually rendering content
        const canvasData = await page.evaluate(() => {
            const canvases = Array.from(document.querySelectorAll('canvas'));
            return canvases.map(canvas => {
                const ctx = canvas.getContext('2d');
                const imageData = ctx.getImageData(0, 0, Math.min(canvas.width, 10), Math.min(canvas.height, 10));
                const pixels = Array.from(imageData.data);
                
                // Check for non-zero pixels (indicating actual rendering)
                const hasContent = pixels.some(pixel => pixel > 0);
                
                return {
                    id: canvas.id,
                    width: canvas.width,
                    height: canvas.height,
                    hasContent,
                    firstPixels: pixels.slice(0, 12) // First 3 pixels RGBA
                };
            });
        });
        
        console.log('Canvas rendering data:', canvasData);
        
        // Force trigger some effects
        console.log('🎭 Testing interactions...');
        
        await page.evaluate(() => {
            // Trigger some parameters
            console.log('Triggering effects...');
            window.homeMaster.setParameter('u_morphFactor', 1.5, 'visualTest');
            window.homeMaster.setParameter('u_gridDensity', 20.0, 'visualTest');
            window.homeMaster.setParameter('u_glitchIntensity', 0.8, 'visualTest');
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if visualizers are animating
        const visualizerStatus = await page.evaluate(() => {
            return {
                visualizerCount: window.systemController.visualizers.size,
                firstVisualizerMethods: window.systemController.visualizers.values().next().value ? Object.getOwnPropertyNames(Object.getPrototypeOf(window.systemController.visualizers.values().next().value)) : [],
                hasAnimationLoop: window.systemController.visualizers.values().next().value ? !!window.systemController.visualizers.values().next().value.render : false
            };
        });
        
        console.log('Visualizer status:', visualizerStatus);
        
        // Simulate card hover
        console.log('🎯 Testing card hover effects...');
        const card = await page.$('.blog-card');
        if (card) {
            await card.hover();
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const hoverState = await page.evaluate(() => {
                const hoveredCard = document.querySelector('.blog-card[data-section-hover="true"]');
                return {
                    hasHoveredCard: !!hoveredCard,
                    inverseCards: document.querySelectorAll('.blog-card[data-inverse="true"]').length
                };
            });
            
            console.log('Hover state:', hoverState);
        }
        
        // Take screenshot
        await page.screenshot({ path: 'visual_test.png', fullPage: true });
        console.log('📸 Screenshot saved as visual_test.png');
        
        console.log('\n🎨 Visual test complete!');
        console.log('💡 Check the browser window and visual_test.png');
        console.log('⏰ Keeping browser open for 30 seconds...');
        
        await new Promise(resolve => setTimeout(resolve, 30000));
        
    } catch (error) {
        console.error('❌ Visual test failed:', error);
    } finally {
        await browser.close();
    }
}

visualTest().catch(console.error);