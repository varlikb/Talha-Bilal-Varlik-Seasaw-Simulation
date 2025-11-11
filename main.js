(() => {
  // --- Constants ---
  const PLANK_LENGTH_PX = 400;
  const MAX_ANGLE_DEG = 30;
  const ANGLE_SCALE = 6.5; // Lower divisor => more visible tilt
  const MIN_VISIBLE_ANGLE = 1.4; // Ensure slight tilt when unbalanced
  const OBJECT_RADIUS_PX = 12; // Visual radius of weight circle for pivot calculation

  // --- DOM Elements ---
  const plank = document.getElementById('plank');
  const objectsLayer = document.getElementById('objectsLayer');
  const leftWeightEl = document.getElementById('leftWeight');
  const rightWeightEl = document.getElementById('rightWeight');
  const leftTorqueEl = document.getElementById('leftTorque');
  const rightTorqueEl = document.getElementById('rightTorque');
  const directionIndicator = document.getElementById('directionIndicator');
  const resetBtn = document.getElementById('resetBtn');
  const seesawRoot = document.getElementById('seesaw');
  
  // --- Audio Elements ---
  const addSound = document.getElementById('addSound');
  const removeSound = document.getElementById('removeSound');
  const balanceSound = document.getElementById('balanceSound');

  // --- Simulation State ---
  const state = {
    items: [],
    targetAngleDeg: 0,
    currentAngleDeg: 0,
    nextId: 0,
    dragState: null,
    balancedSoundPlayed: false,
  };

  // --- Utility Functions ---
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  
  function playSound(soundElement) {
    soundElement.currentTime = 0;
    soundElement.play().catch(e => console.error("Could not play sound:", e));
  }

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  function getLocalXFromClick(event) {
    const rect = plank.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;
    const theta = (-state.currentAngleDeg * Math.PI) / 180; // Inverse rotation
    const localX = dx * Math.cos(theta) - dy * Math.sin(theta);
    return clamp(localX, -PLANK_LENGTH_PX / 2, PLANK_LENGTH_PX / 2);
  }

  // --- State Management ---
  function clearState() {
    state.items = [];
    state.targetAngleDeg = 0;
    renderObjects();
    recomputePhysics();
  }

  // --- Object Management ---
  function addObjectAtLocalX(xFromCenterPx, weightKg = null) {
    if (weightKg === null) weightKg = randomInt(1, 10);
    const id = state.nextId++;
    state.items.push({ xFromCenterPx, weightKg, id });
    
    renderObjects();
    recomputePhysics();
    
    // Play effects
    playSound(addSound);
    plank.classList.add('shake');
    plank.style.setProperty('--current-angle', `${state.currentAngleDeg}deg`);
    setTimeout(() => plank.classList.remove('shake'), 500);
  }

  function removeObject(id) {
    state.items = state.items.filter(item => item.id !== id);
    renderObjects();
    recomputePhysics();
    playSound(removeSound);
  }
  
  // --- Rendering ---
  function renderObjects() {
    objectsLayer.innerHTML = '';
    for (const item of state.items) {
      const el = document.createElement('div');
      el.className = 'object';
      el.dataset.id = item.id;
      el.style.left = `${PLANK_LENGTH_PX / 2 + item.xFromCenterPx}px`;
      el.title = `${item.weightKg} kg (Right-click to remove)`;
      el.textContent = String(item.weightKg);
      objectsLayer.appendChild(el);
    }
  }

  function updateObjectPosition(id, xFromCenterPx) {
    const item = state.items.find(it => it.id === id);
    if(item) item.xFromCenterPx = xFromCenterPx;
    
    const el = objectsLayer.querySelector(`[data-id="${id}"]`);
    if (el) el.style.left = `${PLANK_LENGTH_PX / 2 + xFromCenterPx}px`;
  }

  // --- Physics Calculation ---
  function recomputePhysics() {
    let leftTorque = 0;
    let rightTorque = 0;
    let leftWeight = 0;
    let rightWeight = 0;

    for (const item of state.items) {
      const x = item.xFromCenterPx;
      const absX = Math.abs(x);

      // Detailed handling for objects overlapping the pivot
      if (absX < OBJECT_RADIUS_PX) {
        const r = OBJECT_RADIUS_PX;
        const proportionRight = (x + r) / (2 * r);
        const proportionLeft = 1 - proportionRight;

        const leftPartWeight = item.weightKg * proportionLeft;
        const rightPartWeight = item.weightKg * proportionRight;

        // Approximate lever arms for the overlapping parts
        leftTorque += leftPartWeight * (proportionLeft * r);
        rightTorque += rightPartWeight * (proportionRight * r);
        
        leftWeight += leftPartWeight;
        rightWeight += rightPartWeight;
      } else {
        // Standard case: object is fully on one side
        const contribution = item.weightKg * absX;
        if (x < 0) {
          leftTorque += contribution;
          leftWeight += item.weightKg;
        } else {
          rightTorque += contribution;
          rightWeight += item.weightKg;
        }
      }
    }

    // Update HUD display
    leftWeightEl.textContent = `${leftWeight.toFixed(1)} kg`;
    rightWeightEl.textContent = `${rightWeight.toFixed(1)} kg`;
    leftTorqueEl.textContent = Math.round(leftTorque / 100).toString();
    rightTorqueEl.textContent = Math.round(rightTorque / 100).toString();

    // Calculate angle based on torque difference
    const torqueDiff = rightTorque - leftTorque;
    const rawAngle = torqueDiff / (100 * ANGLE_SCALE);
    let targetAngle = clamp(rawAngle, -MAX_ANGLE_DEG, MAX_ANGLE_DEG);

    // Ensure a minimal visible angle if there is any torque difference
    if (torqueDiff !== 0 && Math.abs(targetAngle) < MIN_VISIBLE_ANGLE) {
      targetAngle = MIN_VISIBLE_ANGLE * Math.sign(torqueDiff);
    }
    state.targetAngleDeg = targetAngle;

    // Update UI based on balance state
    updateDirectionIndicator(torqueDiff);
    
    // Check for balance to play sound and add glow effect
    const balanceThreshold = 10; // Torque difference must be very small
    if (Math.abs(torqueDiff) < balanceThreshold) {
      seesawRoot.classList.add('balanced');
      if (!state.balancedSoundPlayed) {
        playSound(balanceSound);
        state.balancedSoundPlayed = true; // Play sound only once per balance event
      }
    } else {
      seesawRoot.classList.remove('balanced');
      state.balancedSoundPlayed = false;
    }
  }

  function updateDirectionIndicator(torqueDiff) {
    directionIndicator.classList.remove('to-left', 'to-right', 'neutral');
    const threshold = 10;
    if (Math.abs(torqueDiff) < threshold) {
      directionIndicator.classList.add('neutral');
    } else if (torqueDiff > 0) { // Right side is heavier
      directionIndicator.classList.add('to-right');
    } else { // Left side is heavier
      directionIndicator.classList.add('to-left');
    }
  }

  // --- Animation Loop ---
  function animate() {
    const stiffness = 0.08; // Controls the smoothness of the animation
    const delta = state.targetAngleDeg - state.currentAngleDeg;

    if (Math.abs(delta) > 0.01) {
      state.currentAngleDeg += delta * stiffness;
    } else {
      state.currentAngleDeg = state.targetAngleDeg;
    }

    plank.style.transform = `rotate(${state.currentAngleDeg}deg)`;
    requestAnimationFrame(animate);
  }

  // --- Event Handlers ---
  function handlePlankClick(event) {
    // Do not add an object if clicking on an existing one
    if (event.target.classList.contains('object')) return;
    addObjectAtLocalX(getLocalXFromClick(event));
  }

  function handleObjectInteraction(event) {
    event.stopPropagation();
    const id = parseInt(event.target.dataset.id, 10);
    if (isNaN(id)) return;

    if (event.type === 'contextmenu') {
      event.preventDefault();
      removeObject(id);
    } else if (event.type === 'mousedown' && event.button === 0) {
      state.dragState = { id };
      document.body.style.cursor = 'grabbing';
    }
  }
  
  function handleMouseMove(event) {
    if (!state.dragState) return;
    const localX = getLocalXFromClick(event);
    updateObjectPosition(state.dragState.id, localX);
    recomputePhysics();
  }

  function handleMouseUp() {
    if (state.dragState) {
      state.dragState = null;
      document.body.style.cursor = '';
      recomputePhysics(); // Recalculate physics on drop
    }
  }

  // --- Initialization ---
  function init() {
    plank.addEventListener('click', handlePlankClick);
    plank.addEventListener('contextmenu', e => e.preventDefault());
    objectsLayer.addEventListener('mousedown', handleObjectInteraction);
    objectsLayer.addEventListener('contextmenu', handleObjectInteraction);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    resetBtn.addEventListener('click', clearState);

    recomputePhysics();
    requestAnimationFrame(animate);
  }

  window.addEventListener('DOMContentLoaded', init);
})();