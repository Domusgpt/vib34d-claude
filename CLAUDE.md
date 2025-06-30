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

## 🤖 CLAUDE GITHUB ACTIONS CONFIGURATION

### Full Access Permissions
Claude has been granted maximum GitHub permissions via GitHub Actions:

- ✅ **Contents**: Read/Write all files, create branches, merge PRs
- ✅ **Pull Requests**: Create, review, merge, close PRs  
- ✅ **Issues**: Create, label, assign, close issues
- ✅ **Actions**: Trigger workflows, modify workflow files
- ✅ **Pages**: Deploy to GitHub Pages automatically
- ✅ **Deployments**: Manage deployment environments

### Environment Variables
The system uses comprehensive environment variables for configuration:

- **Development**: `VIB34D_ENV`, `NODE_ENV`, `DEBUG`, `LOG_LEVEL`
- **Features**: `ENABLE_USER_REACTIVITY`, `ENABLE_4D_MATHEMATICS`, `ENABLE_JSON_CONFIG`
- **Performance**: `RENDER_FPS`, `ANALYSIS_FPS`, `MAX_VISUALIZERS`
- **Interaction**: `MOUSE_SENSITIVITY`, `SCROLL_SENSITIVITY`, `TOUCH_SENSITIVITY`
- **WebGL**: `WEBGL_CONTEXT`, `SHADER_PRECISION`, `CANVAS_MAX_WIDTH/HEIGHT`

See `.env.example` for full configuration options.

### Claude Agent Commands
Use these commands in issues/PRs to trigger Claude actions:

```
@claude implement new geometry type for dodecahedron
@claude fix the user interaction responsiveness issue
@claude optimize the WebGL shader performance
@claude add new preset configurations to visuals.json
@claude deploy the latest changes to GitHub Pages
@claude refactor the SystemController architecture
```

### Workflows Available
- `claude.yml` - Basic Claude interactions (30min timeout)
- `claude-full-access.yml` - Extended capabilities (120min timeout, 50 turns)

## 🚀 YOLO AGENT MODE ACTIVATED

I will now integrate the JSON system with the existing visualizers without fucking this up. The goal: A fully reactive, JSON-driven 4D visualization system where every parameter and interaction is controlled by configuration files, not hardcoded values.