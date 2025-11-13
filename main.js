// seesaw physics simulation
  // TODO: refactor take notes add more comments to see what u did
  (function() {
    // plank length - not used anymore, we get it from DOM
    const MAX_ANGLE = 42;
    let ANGLE_SCALE = 5.5; // feels good
    const MIN_TILT = 2.2;
    const WEIGHT_MIN = 1;
    const WEIGHT_MAX = 10;
    const OBJ_RADIUS = 12;
  
  // pull dom from html
  let seesawRoot = document.getElementById('seesaw');
  let plank = document.getElementById('plank');
  let objectsLayer = document.getElementById('objectsLayer');
  var leftWeightEl = document.getElementById('leftWeight');
  var rightWeightEl = document.getElementById('rightWeight');
  let leftTorqueEl = document.getElementById('leftTorque'), 
      rightTorqueEl = document.getElementById('rightTorque');
  const tiltAngleEl = document.getElementById('tiltAngle');
  const nextWeightEl = document.getElementById('nextWeight');
  var directionArrow = document.getElementById('directionIndicator');
  const resetBtn = document.getElementById('resetBtn');

  var audioCtx; // audio context for sound effects maybe delete this part
  
  // main app state - prefacot into class ?
  var app = {
    objects: [],
    targetAngle: 0,
    currentAngle: 0,
    nextId: 0,
    nextWeight: null,
    dragging: false,
    draggedId: null,
    balanceSoundPlayed: true,  // spam prevent
    longPressTimer: null,  // mobile long press
    longPressTriggered: false
  };

  // prevent and put a bound
  function clamp(val, min, max) {
    if(val < min) return min;
    if(val > max) return max;
    return val;
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function pickNextWeight() {
    app.nextWeight = randInt(WEIGHT_MIN, WEIGHT_MAX);
    updateNextWeightDisplay();
  }

  function updateNextWeightDisplay() {
    if(!nextWeightEl) return;
    if(app.nextWeight == null) {
      nextWeightEl.textContent = '-- kg';
    } else {
      nextWeightEl.textContent = app.nextWeight + ' kg';
    }
  }

  // since the plank rotates, we need to account for that
  // now  works with touch events for mobile
  function getClickPosition(e) {
    const rect = plank.getBoundingClientRect();
    let cx = rect.left + rect.width / 2;
    let cy = rect.top + rect.height / 2;
    
    // check if touch or mouse event
    let clientX = e.clientX;
    let clientY = e.clientY;
    if(e.touches && e.touches[0]) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    }
    
    var dx = clientX - cx,
        dy = clientY - cy;
    
    // rotate the coordinates back based on current angle
    let angle = (-app.currentAngle * Math.PI) / 180;
    var localX = dx * Math.cos(angle) - dy * Math.sin(angle);
    
    // use actual plank width from DOM - fixes responsive bug
    const actualPlankWidth = rect.width;
    return clamp(localX, -actualPlankWidth / 2, actualPlankWidth / 2);
  }

  // audio setup maybe delete bc dont work on safari
  function setupAudio() {
    if(audioCtx) return; 
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) {
      // doesnt work on some browsers (safari)
      console.log('Audio not supported');
    }
  }

  // generates a beep using web audio API - xd
  function beep(freq, dur, wave, vol) {
    if(!audioCtx) return;
    
    let osc = audioCtx.createOscillator();
    let gain = audioCtx.createGain();
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.value = freq;
    osc.type = wave || 'sine';
    
    const now = audioCtx.currentTime;
    gain.gain.setValueAtTime(vol || 0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + dur);
    
    osc.start(now);
    osc.stop(now + dur);
  }

  // sound effects 
  function playSound(type) {
    if(!audioCtx) setupAudio();
    
    if(type === 'add') {
      // two-tone ascending sound
      beep(520, 0.12, 'sine', 0.2);
      setTimeout(() => beep(620, 0.08, 'sine', 0.15), 50);
    }
    else if(type === 'remove') {
      // descending tone
      beep(420, 0.1, 'sine', 0.18);
      setTimeout(function() { beep(320, 0.12, 'sine', 0.15); }, 50);
    }
    else if(type === 'balance') {
      // happy triple when balanced
      beep(680, 0.15, 'sine', 0.2);
      setTimeout(() => { beep(880, 0.15, 'sine', 0.18); }, 80);
      setTimeout(() => { beep(1040, 0.2, 'sine', 0.15); }, 160);
    }
  }

  // local storage to save state
  function saveToStorage() {
    let data = { 
      objects: app.objects, 
      nextId: app.nextId,
      nextWeight: app.nextWeight
    };
    try {
      localStorage.setItem('seesawState', JSON.stringify(data));
    } catch(e) {
      console.error('save failed', e);
    }
  }

  // load saved state on start
  function loadFromStorage() {
    var saved = localStorage.getItem('seesawState');
    if(!saved) return;
    
    try {
      let data = JSON.parse(saved);
      if(data.objects) app.objects = data.objects;
      if(data.nextId) app.nextId = data.nextId;
      if(typeof data.nextWeight === 'number') app.nextWeight = data.nextWeight;
    } catch(e) {
      console.error('load failed', e);
    }
  }

  // reset
  function reset() {
    app.objects = [];
    app.nextId = 0;
    app.targetAngle = 0;
    pickNextWeight();
    saveToStorage();
    draw();
    playSound('remove');
  }

  // adds a new object to the plank
  function addObj(x, weight) {
    let w;
    if(typeof weight === 'number') {
      w = weight;
    } else {
      if(app.nextWeight == null) {
        pickNextWeight();
      }
      w = app.nextWeight;
    }
    
    const newObj = {
      id: app.nextId++,
      x: x, // we are equaling this x with eventlistener to the localx on getClickPosition
      weight: w
    };
    app.objects.push(newObj);
    
    playSound('add');
    
    pickNextWeight();
    
    draw();
  }

  // remove an object - maybe use filter() ?
  function removeObj(id) {
    // filter out the object with this id we dont get the given id obj to the filtered list and we changing thhe list with new filterede
    var filtered = [];
    for(let i = 0; i < app.objects.length; i++) {
      if(app.objects[i].id !== id) {
        filtered.push(app.objects[i]);
      }
    }
    app.objects = filtered;
    playSound('remove');
    draw();
  }

  // update object position during drag - should be smoother !
  function moveObj(id, newX) {
    let obj = null;
    for(var i = 0; i < app.objects.length; i++) {
      if(app.objects[i].id === id) {
        obj = app.objects[i];
        break;
      }
    }
    
    if(obj) {
      obj.x = newX;
      // update visual position - use actual plank width bc
      var el = objectsLayer.querySelector('[data-id="' + id + '"]');
      if(el) {
        const actualPlankWidth = plank.getBoundingClientRect().width;
        el.style.left = (actualPlankWidth/2 + newX) + 'px';
      }
    }
  }

  // redraws all objects on the plank
  function draw() {
    objectsLayer.innerHTML = ''; // clear everything
    
    // get actual plank width for positioning
    const actualPlankWidth = plank.getBoundingClientRect().width;
    
    // create DOM elements for each object
    for(let i = 0; i < app.objects.length; i++) {
      var obj = app.objects[i];
      const div = document.createElement('div');
      div.className = 'object';
      div.dataset.id = obj.id;
      div.style.left = (actualPlankWidth/2 + obj.x) + 'px';
      const baseSize = 26;
      const sizeMultiplier = 2.6;
      const size = baseSize + obj.weight * sizeMultiplier;
      div.style.width = size + 'px';
      div.style.height = size + 'px';
      div.style.top = (-size * 0.75) + 'px';
      div.style.fontSize = Math.max(12, size * 0.28) + 'px';
      div.title = obj.weight + ' kg';
      div.textContent = obj.weight;
      objectsLayer.appendChild(div);
    }
    
    updatePhysics();
    saveToStorage();
  }

  // calculates torque upd angle
  // physic part
  function updatePhysics() {
    let leftT = 0, rightT = 0;
    var leftW = 0, rightW = 0;

    for(var i = 0; i < app.objects.length; i++) {
      const obj = app.objects[i];
      let x = obj.x, 
          w = obj.weight;
      var absX = Math.abs(x);
      
      // special case: objects that overlap the center pivot
      // need to split their weight/torque contribution
      if(absX < OBJ_RADIUS) {
        let ratio = (x + OBJ_RADIUS) / (2 * OBJ_RADIUS);
        var rightPart = w * ratio;
        let leftPart = w - rightPart;
        
        rightT += rightPart * (ratio * OBJ_RADIUS / 2);
        leftT += leftPart * ((1-ratio) * OBJ_RADIUS / 2);
        rightW += rightPart;
        leftW += leftPart;
      } else {
        // normal case -
        if(x < 0) {
          leftT += w * absX;
          leftW += w;
        } else {
          rightT += w * absX;
          rightW += w;
        }
      }
    }

    // update the display
    leftWeightEl.textContent = leftW.toFixed(1) + ' kg';
    rightWeightEl.textContent = rightW.toFixed(1) + ' kg';
    leftTorqueEl.textContent = Math.round(leftT / 100);
    rightTorqueEl.textContent = Math.round(rightT / 100);
    
    // calculate the target angle based on torque difference
    var diff = rightT - leftT;
    let raw = diff / (100 * ANGLE_SCALE);
    var target = clamp(raw, -MAX_ANGLE, MAX_ANGLE);

    // if balanced let angle be 0
    // threshold 100 for better ux - we divide torque by 100 for improving ux
    // example: real torque 3300 vs 3380, diff=80
    // displayed: 33 vs 34 (divided and rounded)
    // even if displayed values close, we still call it balanced for smooth feel
    const BALANCE_THRESHOLD = 100; 
    let balanced = Math.abs(diff) < BALANCE_THRESHOLD;
    
    if(balanced) {
      target = 0; 
    } else {
      // dif not baalnced show little angle
      if(Math.abs(target) < MIN_TILT) {
        target = diff > 0 ? MIN_TILT : -MIN_TILT;
      }
    }
    app.targetAngle = target;
    if(balanced) {
      seesawRoot.classList.add('balanced');
      // play sound only once when achieving balance should remove
      if(!app.balanceSoundPlayed) {
        playSound('balance');
        app.balanceSoundPlayed = true;
      }
    } else {
      seesawRoot.classList.remove('balanced');
      app.balanceSoundPlayed = false;
    }

    // uarrow indicator updt
    directionArrow.className = 'direction-indicator';
    if(balanced) {
      directionArrow.classList.add('neutral');
    } else if(diff > 0) {
      directionArrow.classList.add('to-right');
    } else {
      directionArrow.classList.add('to-left');
    }
  }

  // animation loop - 
  function tick() {
    var diff = app.targetAngle - app.currentAngle;

    // smooth easing towards target angle
    // 0.08 is the easing factor - tried different values, this feels natural
    if(Math.abs(diff) > 0.01) {
      app.currentAngle += diff * 0.08;
    } else {
      app.currentAngle = app.targetAngle;
    }

    plank.style.transform = 'rotate(' + app.currentAngle + 'deg)';
    if(tiltAngleEl) {
      tiltAngleEl.textContent = app.currentAngle.toFixed(1) + '°';
    }
    requestAnimationFrame(tick);
  }

  // add object when clicking plank
  function onPlankClick(e) {
    // dont add object if clicking on existing object doesnt work sometimes
    if(e.target.classList.contains('object')) return;
    addObj(getClickPosition(e));
  }

  // for mobile - tap to add objects
  function onPlankTap(e) {
    if(e.target.classList.contains('object')) return;
    e.preventDefault();
    addObj(getClickPosition(e));
  }

  function onObjectClick(e) {
    const target = e.target.closest('.object');
    if(!target) return;
    
    e.stopPropagation();
    let id = parseInt(target.dataset.id);
    
    if(e.type === 'contextmenu') {
      // right click removes object
      e.preventDefault();
      removeObj(id);
    } 
    else if(e.type === 'mousedown' && e.button === 0) {
      // left click starts dragging
      app.dragging = true;
      app.draggedId = id;
      target.classList.add('dragging');
      document.body.style.cursor = 'grabbing';
    }
  }

  // drag handler 
  function onMouseMove(e) {
    if(!app.dragging || app.draggedId === null) return;
    
    let x = getClickPosition(e);
    moveObj(app.draggedId, x);
    updatePhysics();
  }

  function onMouseUp() {
    if(!app.dragging) return;
    
    const el = objectsLayer.querySelector('[data-id="' + app.draggedId + '"]');
    if(el) el.classList.remove('dragging');
    
    app.dragging = false;
    app.draggedId = null;
    document.body.style.cursor = '';
    draw();
  }

  // mobile touch handlers for responsive 
  // lonng press fixed
  function onTouchStart(e) {
    const target = e.target.closest('.object');
    if(!target) return;
    
    e.preventDefault(); // prevent scroll 
    let id = parseInt(target.dataset.id);
    
    app.longPressTriggered = false;
    
    // start long press timer for delete bc we cant make it work with touch or right click like on web
    app.longPressTimer = setTimeout(function() {
      app.longPressTriggered = true;
      removeObj(id);
      // vibrate ? maybe delete
      if(navigator.vibrate) navigator.vibrate(50);
    }, 500);
    
    app.dragging = true;
    app.draggedId = id;
    target.classList.add('dragging');
  }

  function onTouchMove(e) {
    if(!app.dragging || app.draggedId === null) return;

    if(app.longPressTimer) {
      clearTimeout(app.longPressTimer);
      app.longPressTimer = null;
    }
    
    e.preventDefault();
    let x = getClickPosition(e);
    moveObj(app.draggedId, x);
    updatePhysics();
  }

  function onTouchEnd(e) {
    // clear -
    if(app.longPressTimer) {
      clearTimeout(app.longPressTimer);
      app.longPressTimer = null;
    }
    
    // if long press was triggered dont drag
    if(app.longPressTriggered) {
      app.dragging = false;
      app.draggedId = null;
      app.longPressTriggered = false;
      return;
    }
    
    if(!app.dragging) return;
    
    e.preventDefault();
    const el = objectsLayer.querySelector('[data-id="' + app.draggedId + '"]');
    if(el) el.classList.remove('dragging');
    
    app.dragging = false;
    app.draggedId = null;
    draw();
  }

  // initialization
  function init() {
    loadFromStorage();
    
    // mouse event listeners
    plank.addEventListener('click', onPlankClick);
    objectsLayer.addEventListener('contextmenu', onObjectClick);
    objectsLayer.addEventListener('mousedown', onObjectClick);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    resetBtn.addEventListener('click', reset);
    
    // touch event listeners 
    plank.addEventListener('touchstart', onPlankTap, { passive: false });
    objectsLayer.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: false });
    
    // handle window resize 
    let resizeTimeout;
    window.addEventListener('resize', function() {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(function() {
        draw(); // redraw with new plank size
      }, 250);
    });
    
    // audio context needs user interaction to initialize (browser policy)
    document.addEventListener('click', function() {
      if(!audioCtx) setupAudio();
    }, { once: true });
    
    //  try init audio on first touch for mobile
    document.addEventListener('touchstart', function() {
      if(!audioCtx) setupAudio();
    }, { once: true });
    
    draw();
    if(app.nextWeight == null) {
      pickNextWeight();
    } else {
      updateNextWeightDisplay();
    }
    requestAnimationFrame(tick);
  }

  // start when dom ready
  if(document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
