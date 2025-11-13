# Polished Seesaw Simulation

An interactive physics-based seesaw simulation built with pure JavaScript, HTML, and CSS. Add colorful blocks by clicking, remove them with right-click, and drag them to reposition. Watch the seesaw tilt smoothly with improved physics calculations that make even small weight differences visible.

## Features

- **Interactive Block Placement**: Click anywhere on the plank to drop a colorful block (2-10 kg randomly)
- **Drag & Drop**: Click and drag blocks to reposition them along the plank
- **Dynamic Sliding**: Blocks automatically slide toward the lower side when the seesaw tilts
- **Remove Blocks**: Right-click on any block to remove it
- **Real-time Physics**: Advanced torque calculations with improved angle scaling
- **Visual Feedback**:
  - Glow effect on pivot when the seesaw is balanced
  - Real-time weight and torque display
  - Smooth drop-in animations for new blocks
  - Shadow effects for depth perception
- **Sound Effects**: Audio feedback for adding, removing blocks, and achieving balance
- **Reset Function**: Clear all blocks with a single button click

## How to Use

1. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
2. **Add Block**: Click anywhere on the plank to drop a block at that position
3. **Move Block**: Click and drag any block to reposition it
4. **Remove Block**: Right-click on any block to remove it
5. **Reset**: Click the "Reset" button to clear all blocks

## Technical Details

### Physics Implementation

- **Plank Length**: 400px with pivot at the center
- **Torque Calculation**: 
  - For each block: `torque = weight × distance_from_center`
  - Total torque per side determines the tilt angle
- **Improved Angle Calculation**: 
  - Uses power function scaling (`normalized^0.7`) for better visibility
  - Small torque differences are more visible (minimum 1.5° angle)
  - Large torque differences scale proportionally up to ±35° maximum
  - Formula: `angle = sign(torqueDiff) × min((|torqueDiff| / TORQUE_SCALE)^0.7 × MAX_ANGLE, MAX_ANGLE)`
- **Smooth Animation**: 
  - Adaptive stiffness: faster response for large changes (0.15), smoother for small (0.08)
  - Easing function reduces speed as target is approached
  - Uses requestAnimationFrame for 60fps smooth motion
- **Dynamic Sliding**: Blocks automatically slide based on plank angle with configurable sensitivity

### Key Features

- **Colorful Blocks**: Three different color themes for visual variety
- **Balance Detection**: Torque difference threshold of 50 for balance detection
- **Visual Polish**: 
  - Drop-in animation for new blocks
  - Shadow effects on blocks and seesaw
  - Glow effect on pivot when balanced
  - Smooth transitions throughout
- **Code Efficiency**: Under 300 lines of JavaScript for easy understanding and modification

## File Structure

- `index.html` - Main HTML structure with audio elements, Google Fonts, and UI layout
- `main.js` - Core logic: physics calculations, event handling, rendering, and animation (235 lines)
- `styles.css` - Complete styling with CSS variables, animations, and modern design

## Browser Compatibility

Works in all modern browsers that support:
- CSS Grid and Flexbox
- CSS Custom Properties (variables)
- requestAnimationFrame API
- HTML5 Audio API
- SVG graphics

## Design Decisions

- **Improved Angle Scaling**: Power function ensures small differences are visible while large differences scale appropriately
- **Adaptive Animation**: Different stiffness values for large vs small changes create more natural motion
- **Visual Clarity**: Minimum visible angle (1.5°) ensures even subtle imbalances are noticeable
- **Dynamic Physics**: Blocks slide naturally when the seesaw tilts, adding realism
- **Code Simplicity**: Kept under 300 lines for educational purposes and easy maintenance
- **Modern UI**: Clean design with gradients, shadows, and smooth animations

## Physics Improvements

The latest version includes significant improvements to angle calculation:

1. **Better Visibility**: Small torque differences now produce visible angles (minimum 1.5°)
2. **Proportional Scaling**: Large differences scale better using power function (exponent 0.7)
3. **Smoother Animation**: Adaptive stiffness and easing create more natural motion
4. **Maximum Angle**: Increased to 35° for better visual range

These changes ensure the seesaw responds appropriately to both small and large weight differences, making the simulation more intuitive and visually satisfying.
