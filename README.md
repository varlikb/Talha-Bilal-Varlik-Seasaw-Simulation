# Interactive Seesaw Simulation

An interactive physics-based seesaw simulation built with pure JavaScript, HTML, and CSS. Add weights by clicking, remove them with right-click, and drag them to different positions. Watch the seesaw tilt smoothly based on real torque calculations.

## Features

- **Interactive Weight Placement**: Click anywhere on the plank to add a weight (1-10 kg randomly)
- **Drag & Drop**: Drag weights to reposition them along the plank
- **Remove Weights**: Right-click on any weight to remove it
- **Real-time Physics**: Accurate torque calculations with smooth animations
- **Visual Feedback**:
  - Direction indicator arrow showing which side is heavier
  - Glow effect when the seesaw is balanced
  - Shake animation when adding new weights
  - Real-time weight and torque display
- **Sound Effects**: Audio feedback for adding, removing weights, and achieving balance
- **Reset Function**: Clear all weights with a single button click

## How to Use

1. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
2. **Add Weight**: Click anywhere on the plank to drop a weight at that position
3. **Move Weight**: Click and drag any weight to reposition it
4. **Remove Weight**: Right-click on any weight to remove it
5. **Reset**: Click the "Reset" button to clear all weights

## Technical Details

### Physics Implementation

- **Plank Length**: 400px with pivot at the center
- **Torque Calculation**: 
  - For each weight: `torque = weight × distance_from_center`
  - Objects overlapping the pivot (within 12px radius) are split proportionally
  - Total torque per side determines the tilt angle
- **Angle Calculation**: 
  - Based on torque difference: `angle = (rightTorque - leftTorque) / (100 × ANGLE_SCALE)`
  - Clamped to ±30° maximum
  - Minimum visible angle of 1.4° when unbalanced for better visual feedback
- **Animation**: Smooth interpolation using requestAnimationFrame with stiffness factor

### Key Features

- **Coordinate System**: Uses local plank coordinates with inverse rotation for accurate click positioning even when tilted
- **Object Radius**: 12px radius for physics calculations, ensuring objects near the pivot contribute correctly
- **Balance Detection**: Torque difference threshold of 10 for balance detection
- **Visual Effects**: 
  - Drop-in animation for new objects
  - Shake effect on plank when adding weights
  - Glow effect when balanced
  - Direction indicator with smooth transitions

## File Structure

- `index.html` - Main HTML structure with audio elements and UI layout
- `main.js` - Core logic: physics calculations, event handling, rendering, and animation
- `styles.css` - Complete styling with CSS variables, animations, and responsive design

## Browser Compatibility

Works in all modern browsers that support:
- CSS Grid and Flexbox
- CSS Custom Properties (variables)
- requestAnimationFrame API
- HTML5 Audio API

## Design Decisions

- **Pixel-based Physics**: Distances measured in pixels for simplicity, with empirical scaling factors
- **Smooth Animation**: Critically-damped style interpolation for natural motion
- **Visual Clarity**: Minimum visible angle ensures even small imbalances are noticeable
- **User Experience**: Sound effects and visual feedback enhance interactivity
- **Accessibility**: ARIA labels and semantic HTML structure

## Future Enhancements

Potential improvements that could be added:
- Weight selector before placement
- Grid/ruler showing distances from center
- Multiple weight presets
- Save/load configurations
- More advanced physics (angular acceleration, damping)
- Mobile touch support optimization
