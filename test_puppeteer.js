const puppeteer = require('puppeteer');

async function testVIB34DSystem() {
    console.log('🚀 Starting Puppeteer test of VIB34D system...');
    
    const browser = await puppeteer.launch({ 
        headless: false, // Show browser for visual confirmation
        devtools: true,
        args: ['--disable-web-security', '--disable-features=VizDisplayCompositor']
    });
    
    const page = await browser.newPage();
    
    // Enable console logging from the page
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        console.log(`[BROWSER ${type.toUpperCase()}] ${text}`);
    });
    
    // Enable error logging
    page.on('pageerror', error => {
        console.error(`[PAGE ERROR] ${error.message}`);
    });
    
    try {
        console.log('📍 Navigating to VIB34D system...');
        await page.goto('https://domusgpt.github.io/vib34d-gemini/', { 
            waitUntil: 'networkidle0',
            timeout: 30000 
        });
        
        console.log('⏳ Waiting for system initialization...');
        await page.waitForFunction(() => window.systemController && window.systemController.isInitialized, { timeout: 10000 });
        
        // Test 1: Check if system components exist
        console.log('\n🔍 TEST 1: System Component Detection');
        const systemCheck = await page.evaluate(() => {
            return {
                hasSystemController: !!window.systemController,
                hasHomeMaster: !!window.homeMaster,
                hasAgentAPI: !!window.agentAPI,
                canvasCount: document.querySelectorAll('canvas').length,
                boardCanvas: !!document.getElementById('board-visualizer'),
                cardCanvases: document.querySelectorAll('[id^="card-visualizer-"]').length,
                stateDots: document.querySelectorAll('.state-dot').length
            };
        });
        
        console.log('System Components:', systemCheck);
        
        // Test 2: Check WebGL contexts
        console.log('\n🎨 TEST 2: WebGL Context Check');
        const webglCheck = await page.evaluate(() => {
            const canvases = document.querySelectorAll('canvas');
            const webglStatus = [];
            
            canvases.forEach((canvas, index) => {
                const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                webglStatus.push({
                    canvasId: canvas.id,
                    hasWebGL: !!gl,
                    width: canvas.width,
                    height: canvas.height,
                    clientWidth: canvas.clientWidth,
                    clientHeight: canvas.clientHeight
                });
            });
            
            return webglStatus;
        });
        
        console.log('WebGL Status:', webglCheck);
        
        // Test 3: Test parameter updates
        console.log('\n🎛️ TEST 3: Parameter Control Test');
        if (systemCheck.hasHomeMaster) {
            await page.evaluate(() => {
                console.log('Testing parameter updates...');
                window.homeMaster.setParameter('u_morphFactor', 1.2, 'puppeteerTest');
                window.homeMaster.setParameter('u_gridDensity', 20.0, 'puppeteerTest');
                window.homeMaster.setParameter('u_glitchIntensity', 0.8, 'puppeteerTest');
            });
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const parameterValues = await page.evaluate(() => {
                return {
                    morphFactor: window.homeMaster.getParameter('u_morphFactor'),
                    gridDensity: window.homeMaster.getParameter('u_gridDensity'),
                    glitchIntensity: window.homeMaster.getParameter('u_glitchIntensity'),
                    displayValues: {
                        morph: document.getElementById('morph-display')?.textContent,
                        grid: document.getElementById('grid-display')?.textContent,
                        glitch: document.getElementById('glitch-display')?.textContent
                    }
                };
            });
            
            console.log('Parameter Values:', parameterValues);
        }
        
        // Test 4: Test navigation
        console.log('\n🌐 TEST 4: Navigation Test');
        if (systemCheck.hasSystemController) {
            await page.evaluate(() => {
                console.log('Testing navigation...');
                window.systemController.navigateToState('tech');
            });
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const navigationState = await page.evaluate(() => {
                return {
                    currentState: window.systemController.currentState,
                    layoutClass: document.getElementById('blogContainer')?.className,
                    layoutDisplay: document.getElementById('layout-display')?.textContent
                };
            });
            
            console.log('Navigation State:', navigationState);
        }
        
        // Test 5: Test state dot clicks
        console.log('\n🔵 TEST 5: State Dot Click Test');
        const stateDots = await page.$$('.state-dot');
        if (stateDots.length > 1) {
            console.log(`Found ${stateDots.length} state dots, testing click on second dot...`);
            await stateDots[1].click();
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const afterClick = await page.evaluate(() => {
                return {
                    currentState: window.systemController?.currentState,
                    activeDots: document.querySelectorAll('.state-dot.active').length
                };
            });
            
            console.log('After State Dot Click:', afterClick);
        }
        
        // Test 6: Test Agent API
        console.log('\n🤖 TEST 6: Agent API Test');
        if (systemCheck.hasAgentAPI) {
            await page.evaluate(() => {
                console.log('Testing Agent API...');
                window.agentAPI.setMasterParameter('masterIntensity', 0.9);
                window.agentAPI.setGeometry('sphere');
            });
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const agentApiResult = await page.evaluate(() => {
                return {
                    geometryDisplay: document.getElementById('geometry-display')?.textContent,
                    currentGeometry: window.homeMaster?.getParameter('geometry')
                };
            });
            
            console.log('Agent API Result:', agentApiResult);
        }
        
        // Test 7: Visual verification
        console.log('\n📸 TEST 7: Visual Verification');
        await page.screenshot({ 
            path: 'vib34d_test_screenshot.png',
            fullPage: true
        });
        console.log('Screenshot saved as vib34d_test_screenshot.png');
        
        // Test 8: Performance check
        console.log('\n⚡ TEST 8: Performance Check');
        const performanceMetrics = await page.evaluate(() => {
            return {
                visualizerCount: window.systemController?.visualizers?.size || 0,
                parametersCount: Object.keys(window.homeMaster?.getAllParameters() || {}).length,
                configsLoaded: Object.keys(window.systemController?.jsonConfigSystem?.getAllConfigs() || {}).length
            };
        });
        
        console.log('Performance Metrics:', performanceMetrics);
        
        console.log('\n✅ VIB34D System Test Complete!');
        console.log('💡 Check the browser window for visual confirmation of 4D visualizers');
        console.log('📊 Review console logs for system behavior details');
        
        // Keep browser open for manual inspection
        console.log('\n⏸️ Keeping browser open for manual inspection...');
        console.log('🔍 Manually verify:');
        console.log('   - Are canvases showing colorful 4D mathematical patterns?');
        console.log('   - Do parameters update in real-time display?');
        console.log('   - Does mouse movement affect visualizations?');
        console.log('   - Do state dots change layouts when clicked?');
        console.log('\nPress Ctrl+C to close browser and exit');
        
        // Wait indefinitely for manual inspection
        await new Promise(() => {});
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        // Don't auto-close - let user inspect manually
        // await browser.close();
    }
}

// Run the test
testVIB34DSystem().catch(console.error);