# CLAUDE.md - VIB34D JSON-DRIVEN SYSTEM

## 🚨 CRITICAL - DO NOT FORGET

**THIS IS THE REAL VIB34D ARCHITECTURE - NOT HARDCODED PARAMS!**

### The VIB34D system is a **FULLY JSON-DRIVEN POLYTONAL VISUALIZER** with:

1. **4 Core JSON Config Files** (in `/config/`):
   - `visuals.json` - All geometries, themes, shader parameters with ranges
   - `behavior.json` - Complex interaction blueprints with ecosystem reactions
   - `state-map.json` - Application states and navigation
   - `layout-content.json` - UI structure and card content

2. **Sophisticated Interaction Physics**:
   - **Relational Targeting**: `subject`, `parent`, `siblings`, `ecosystem`, `global`
   - **Animation Properties**: `to`, `curve`, `duration`, `delay`, `direction`
   - **Ecosystem Reactions**: Hover one card → entire system reacts with coordinated animations

3. **17 Master Parameters** (ALL defined in visuals.json):
   - `u_dimension` (3.0-5.0) - Controls 4D-ness
   - `u_morphFactor` (0.0-1.5) - Blends geometric states
   - `u_gridDensity` (1.0-25.0) - Lattice pattern density
   - `u_rotationSpeed` (0.0-3.0) - 4D rotation animation speed
   - Plus 13 more ALL WITH RANGES AND DEFAULTS IN JSON

4. **Agent API** for external control:
   ```javascript
   agentAPI.setMasterParameter('masterIntensity', 0.8)
   agentAPI.navigateTo('tech')
   agentAPI.setGeometry('hypercube')
   agentAPI.updateConfig('visuals', newConfig) // Hot reload!
   ```

5. **Core Architecture Files**:
   - `JsonConfigSystem.js` - Loads all JSON configs
   - `AgentAPI.js` - External control interface
   - `VIB34DReactiveCore.js` - WebGL visualizer with 4D lattice math
   - `SystemController.js` - Main orchestrator (needs to be created)
   - `HomeMaster.js` - Single source of truth for parameters

## 🎯 CURRENT STATE

- ✅ JSON config files created
- ✅ JsonConfigSystem implemented
- ✅ AgentAPI implemented
- ✅ 4D polytopal shader mathematics restored
- ❌ SystemController needs to be created
- ❌ HomeMaster needs real implementation
- ❌ InteractionCoordinator needs to parse behavior.json
- ❌ Everything needs to read from JSON not hardcoded values

## 🔥 KEY INSIGHT

The system is NOT about hardcoded `morphFactor = 0.5`. It's about:

```json
"mouseMoveMorphing": {
  "trigger": "onMouseMove",
  "reactions": [{
    "target": "global",
    "animation": {
      "u_morphFactor": { "to": "map(mouseX, 0, 1, 0.0, 1.5)", "curve": "linear", "duration": 100 }
    }
  }]
}
```

**EVERYTHING** is declarative in JSON. The JavaScript just reads and executes these blueprints.

## 📍 Working Directory
`/mnt/c/Users/millz/!!prime!!VIB34D-STYLE-Claude/`

## 🚀 YOLO AGENT MODE ACTIVATED

I will now integrate the JSON system with the existing visualizers without fucking this up. The goal: A fully reactive, JSON-driven 4D visualization system where every parameter and interaction is controlled by configuration files, not hardcoded values.