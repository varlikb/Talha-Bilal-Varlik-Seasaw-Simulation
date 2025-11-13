# Interactive Seesaw Physics Simulator

An interactive physics-based seesaw simulation built with pure JavaScript, HTML, and CSS. Add weights by clicking, remove them with right-click or long-press, and drag them to reposition. Watch the seesaw tilt smoothly with real-time torque calculations and visual feedback.

## Features

- **Interactive Weight Placement**: Click/tap anywhere on the plank to add a weight (1-10 kg randomly)
- **Drag & Drop**: Click and drag weights to reposition them along the plank
- **Remove Weights**: Right-click (desktop) or long-press (mobile) to remove weights
- **Real-time Physics**: Advanced torque calculations with accurate angle scaling
- **Visual Feedback**:
  - Glow effect on plank when balanced
  - Real-time weight and torque display
  - Direction indicator showing tilt direction
  - Smooth drop-in animations for new weights
  - Enhanced visual effects when dragging
- **Sound Effects**: Audio feedback for adding, removing weights, and achieving balance
- **State Persistence**: Automatically saves state to localStorage
- **Reset Function**: Clear all weights with a single button click
- **Mobile Support**: Fully responsive with touch event handling

## How to Use

1. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
2. **Add Weight**: Click/tap anywhere on the plank to drop a weight at that position
3. **Move Weight**: Click and drag any weight to reposition it
4. **Remove Weight**: 
   - Desktop: Right-click on any weight
   - Mobile: Long-press (hold for 0.5 seconds) on any weight
5. **Reset**: Click the "Reset" button to clear all weights

## Technical Details

### Physics Implementation

- **Plank Length**: 400px with pivot at the center
- **Torque Calculation**: 
  - For each weight: `torque = weight × distance_from_center`
  - Special handling for weights near the center pivot (within 12px radius)
  - Total torque per side determines the tilt angle
- **Angle Calculation**: 
  - Formula: `angle = torqueDifference / (100 × ANGLE_SCALE)`
  - `ANGLE_SCALE = 1.0` for better visibility of small differences
  - Maximum angle: ±42°
  - Minimum visible tilt: 2.2° when not balanced
- **Balance Detection**: 
  - Based on displayed torque values (rounded to nearest integer)
  - Seesaw is balanced when displayed torques are equal (difference = 0)
  - When balanced, plank smoothly returns to 0° angle
- **Smooth Animation**: 
  - Normal easing factor: 0.08
  - Faster correction when balanced: 0.15 (for angles < 5°)
  - Uses requestAnimationFrame for 60fps smooth motion

### Key Constants

- `MAX_ANGLE = 42` - Maximum tilt angle in degrees
- `ANGLE_SCALE = 1.0` - Angle scaling factor (lower = more sensitive)
- `MIN_TILT = 2.2` - Minimum visible angle when not balanced
- `WEIGHT_MIN = 1` - Minimum weight value (kg)
- `WEIGHT_MAX = 10` - Maximum weight value (kg)
- `OBJ_RADIUS = 12` - Radius for center pivot overlap detection

### Visual Features

- **Weight Objects**: Blue circular weights with size proportional to weight
- **Balance Glow**: Yellow glow effect on plank when balanced
- **Direction Indicator**: Red arrow showing tilt direction (left/right/neutral)
- **Dragging Effects**: Enhanced visual feedback with scale, glow, and brightness
- **Drop Animation**: Bouncy cubic-bezier animation when weights are added
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens

### Code Structure

- **Main State**: Single app object containing all state (objects, angles, dragging state, etc.)
- **Event Handling**: Separate handlers for mouse and touch events
- **Physics Loop**: Continuous animation loop using requestAnimationFrame
- **State Management**: Automatic localStorage save/load for persistence

## File Structure

- `index.html` - Main HTML structure with UI layout and elements
- `main.js` - Core logic: physics calculations, event handling, rendering, and animation (~560 lines)
- `styles.css` - Complete styling with CSS variables, animations, and responsive design (~520 lines)

## Browser Compatibility

Works in all modern browsers that support:
- CSS Flexbox and Grid
- CSS Custom Properties (variables)
- requestAnimationFrame API
- Web Audio API (for sound effects)
- localStorage API
- Touch Events API (for mobile support)

## Design Decisions

- **Displayed Torque Balance**: Balance detection uses displayed (rounded) torque values to avoid rounding errors
- **Sensitive Angle Scaling**: Lower ANGLE_SCALE ensures even small torque differences are visible
- **Smooth Corrections**: Faster easing when balanced ensures plank quickly returns to level
- **Mobile-First**: Touch events with long-press for deletion (no right-click on mobile)
- **State Persistence**: Automatic save/load so users don't lose their setup
- **Visual Polish**: Multiple shadow layers, glow effects, and smooth transitions throughout

## Mobile Features

- Touch event support for adding and moving weights
- Long-press gesture (500ms) to remove weights
- Responsive layout that adapts to different screen sizes
- Landscape mode optimization
- Prevents default touch behaviors (scrolling, zooming) during interaction

## Future Improvements

- Dark mode support
- Additional visual effects
- More physics options (friction, momentum)
- Custom weight values
- Multiple plank lengths
