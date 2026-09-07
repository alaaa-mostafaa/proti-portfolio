// Initialize Lucide Icons for premium modern iconography
document.addEventListener('DOMContentLoaded', () => {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  initScrollNavbar();
  initScrollReveal();
  initActiveNavLinkOnScroll();
  initFlowerAnimation();
  initGameScene();
  initCubeRotation();
  // Must run after initGameScene so charSprite and bubble elements are ready
  initSwatchDialogues();
  initKbdNav();
  initAudioSystem();

  // Attach global click sound listener for interactive buttons and cards
  document.addEventListener('click', (e) => {
    if (e.target.closest('.swatch-card, .btn, .nav-link, button, .modal-close, .modal-tab')) {
      playClickSound();
    }
  });
});

/**
 * Global Click Sound Effect Player
 */
function playClickSound() {
  try {
    const clickAudio = new Audio('./sounds/click.mp3');
    clickAudio.volume = 0.45;
    clickAudio.play().catch(() => {});
  } catch (e) {}
}
window.playClickSound = playClickSound;

let bgAudio = null;
let isPausedForVideo = false;

window.pauseBgMusicForVideo = function () {
  isPausedForVideo = true;
  if (bgAudio) {
    bgAudio.pause();
  }
};

window.resumeBgMusicAfterVideo = function () {
  isPausedForVideo = false;
  if (bgAudio) {
    bgAudio.play().catch(() => {});
  }
};

/**
 * Background Audio System (30s loop, played by default, paused only for NASA video)
 */
function initAudioSystem() {
  try {
    bgAudio = new Audio('./sounds/bg.mp3');
    bgAudio.loop = true;
    bgAudio.volume = 0.28;

    // 30-second continuous looping logic
    bgAudio.addEventListener('timeupdate', () => {
      if (bgAudio.currentTime >= 30) {
        bgAudio.currentTime = 0;
      }
    });

    bgAudio.addEventListener('ended', () => {
      bgAudio.currentTime = 0;
      bgAudio.play().catch(() => {});
    });
  } catch (e) {}

  // Ensure NASA video is explicitly paused and muted on initial page load
  const vid = document.getElementById('ns-video');
  if (vid) {
    vid.pause();
    vid.muted = true;
  }

  // Attempt immediate playback on page load with zero clicks required
  if (bgAudio && !isPausedForVideo) {
    bgAudio.play().catch(() => {
      // If browser autoplay policy blocks initial unmuted audio, start on any mouse movement, scroll, touch, or keypress
      const startAudio = () => {
        if (bgAudio && !isPausedForVideo) {
          bgAudio.play().catch(() => {});
        }
        ['click', 'touchstart', 'pointerdown', 'mousemove', 'scroll', 'keydown'].forEach(evt => {
          window.removeEventListener(evt, startAudio);
        });
      };

      ['click', 'touchstart', 'pointerdown', 'mousemove', 'scroll', 'keydown'].forEach(evt => {
        window.addEventListener(evt, startAudio, { once: true });
      });
    });
  }
}

/**
 * Keyboard Arrow Key Navigation & Visual Hint Feedback
 */
function initKbdNav() {
  const keyUp = document.getElementById('kbd-key-up');
  const keyDown = document.getElementById('kbd-key-down');

  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      if (keyUp) keyUp.classList.add('pressed');
      window.scrollBy({ top: -80, behavior: 'smooth' });
    } else if (e.key === 'ArrowDown') {
      if (keyDown) keyDown.classList.add('pressed');
      window.scrollBy({ top: 80, behavior: 'smooth' });
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp' && keyUp) keyUp.classList.remove('pressed');
    if (e.key === 'ArrowDown' && keyDown) keyDown.classList.remove('pressed');
  });

  if (keyUp) {
    keyUp.addEventListener('click', (e) => {
      e.stopPropagation();
      window.scrollBy({ top: -140, behavior: 'smooth' });
    });
  }
  if (keyDown) {
    keyDown.addEventListener('click', (e) => {
      e.stopPropagation();
      window.scrollBy({ top: 140, behavior: 'smooth' });
    });
  }
}

/**
 * Precise midway stair dialogue (No darkness overlay).
 * Triggers when the character is vertically midway near each swatch card.
 */
function initSwatchDialogues() {
  const bubble = document.getElementById('speech-bubble');
  const charSprite = document.getElementById('char-sprite');
  if (!bubble) return;

  const dialogueMap = {
    'swatch-nasa': [
      'Oh! These were<br>the creative days!<br>We WON our first<br>hackathon!<br>Click to open!',
      '3 sleepless nights,<br>1 wild idea, and<br>a NASA badge!<br>Click to view!'
    ],
    'swatch-acl': [
      'A full university<br>on ONE platform!<br>Built from scratch!<br>Click to open!',
      'Students, profs,<br>grades — I built<br>ALL of it!<br>Click to view!'
    ],
    'swatch-bach': [
      '9 failures,<br>553 training runs...<br>worth every sec!<br>Click to read!',
      'My proudest work!<br>Deep learning &<br>research!<br>Click to open!'
    ],
    'swatch-spring': [
      'Spring Boot +<br>Kafka + Docker!<br>Built at Ejada!<br>Click to open!',
      'Microservices +<br>event streaming!<br>Enterprise arch!<br>Click to view!'
    ]
  };

  const rotationIndex = {};
  let currentActiveSwatch = null;

  // Tight threshold: character must be vertically within ~160px of the swatch center
  const PROXIMITY_PX = 160;

  window._swatchProximityCheck = function(charPageY) {
    const swatchIds = ['swatch-nasa', 'swatch-acl', 'swatch-bach', 'swatch-spring'];
    let closestId = null;
    let closestDist = Infinity;

    swatchIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const swatchMidY = rect.top + window.scrollY + rect.height / 2;
      const dist = Math.abs(charPageY - swatchMidY);
      if (dist < closestDist) {
        closestDist = dist;
        closestId = id;
      }
    });

    if (closestDist < PROXIMITY_PX && closestId) {
      if (currentActiveSwatch !== closestId) {
        // Clear beat/pulse on previous swatch cards
        document.querySelectorAll('.swatch-card').forEach(el => {
          el.classList.remove('card-pulse');
        });

        currentActiveSwatch = closestId;
        const activeCard = document.getElementById(closestId);
        if (activeCard) {
          activeCard.classList.add('card-pulse');
        }

        const lines = dialogueMap[closestId];
        if (lines) {
          if (!rotationIndex[closestId]) rotationIndex[closestId] = 0;
          const text = lines[rotationIndex[closestId] % lines.length];
          rotationIndex[closestId]++;

          bubble.innerHTML = text;
          bubble.classList.add('visible');

          if (charSprite) {
            charSprite.classList.remove('anim-walk-down', 'anim-walk-up', 'anim-wave');
            void charSprite.offsetWidth;
            charSprite.classList.add('anim-wave');
          }
        }
      }
    } else {
      if (currentActiveSwatch !== null) {
        currentActiveSwatch = null;
        document.querySelectorAll('.swatch-card').forEach(el => {
          el.classList.remove('card-pulse');
        });
        bubble.classList.remove('visible');
        if (charSprite) charSprite.classList.remove('anim-wave');
      }
    }
  };
}

/**
 * Handle background flower animation loop
 */
function initFlowerAnimation() {
  const flowerLayer = document.getElementById('flower-layer');
  if (!flowerLayer) return;

  const totalFrames = 8;
  let currentFrame = 1;

  // Pre-load images to avoid flickering
  const cachedImages = [];
  for (let i = 1; i <= totalFrames; i++) {
    const img = new Image();
    img.src = `./assets/hero/flower${i}.png`;
    cachedImages.push(img);
  }

  // Set initial frame immediately
  flowerLayer.style.backgroundImage = `url('./assets/hero/flower1.png')`;

  // Animation interval: 120ms per frame
  setInterval(() => {
    flowerLayer.style.backgroundImage = `url('./assets/hero/flower${currentFrame}.png')`;
    currentFrame = (currentFrame % totalFrames) + 1;
  }, 120);
}

/**
 * Handle glassmorphism navbar backdrop addition on scroll
 */
function initScrollNavbar() {
  const navbar = document.getElementById('main-nav');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll);
  // Trigger once initially to check start position
  handleScroll();
}

/**
 * Trigger smooth fade-in reveal animations using IntersectionObserver
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Once animated, we don't need to observe it anymore
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(element => {
      revealObserver.observe(element);
    });
  } else {
    // Fallback if IntersectionObserver isn't supported
    revealElements.forEach(element => {
      element.classList.add('revealed');
    });
  }
}

/**
 * Update the active navigation link based on which section is currently on screen
 */
function initActiveNavLinkOnScroll() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const handleActiveLink = () => {
    let currentId = '';
    const scrollPosition = window.scrollY + 200; // offset for triggers

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }
  };

  window.addEventListener('scroll', handleActiveLink);
  handleActiveLink();
}

/* ==========================================================================
   NASA MODAL — open / close / screen switching
   ========================================================================== */

window.openNasaModal = function () {
  const modal = document.getElementById('nasa-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  nasaGoTo(1);

  // Pause background music while NASA video plays
  if (window.pauseBgMusicForVideo) {
    window.pauseBgMusicForVideo();
  }

  // Start video from beginning and unmute
  const vid = document.getElementById('ns-video');
  if (vid) {
    vid.currentTime = 0;
    vid.muted = false;
    vid.play().catch(err => {
      console.log("Audio play blocked: ", err);
    });
  }
};

window.closeNasaModal = function () {
  const modal = document.getElementById('nasa-modal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
  // Pause video so it doesn't run in background
  const vid = document.getElementById('ns-video');
  if (vid) vid.pause();

  // Resume background music after NASA video modal closes
  if (window.resumeBgMusicAfterVideo) {
    window.resumeBgMusicAfterVideo();
  }
};

window.nasaGoTo = function (screen) {
  const s1 = document.getElementById('nasa-screen-1');
  const s2 = document.getElementById('nasa-screen-2');
  if (!s1 || !s2) return;

  const vid = document.getElementById('ns-video');

  if (screen === 2) {
    s1.style.display = 'none';
    s2.style.display = 'flex';
    // Mute video on screen 2
    if (vid) vid.muted = true;
    // trigger staggered skill animations
    setTimeout(() => s2.classList.add('screen-2-active'), 50);
  } else {
    s2.style.display = 'none';
    s2.classList.remove('screen-2-active');
    s1.style.display = 'flex';
    // Unmute video when returning to screen 1
    if (vid) {
      vid.muted = false;
      vid.play().catch(err => console.log("Audio play blocked: ", err));
    }
  }
};

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    window.closeNasaModal();
    window.closeAclModal();
    window.closeBachModal();
    if (window.closeBankModal) window.closeBankModal();
  }
});

/* ==========================================================================
   BACHELOR'S THESIS MODAL — open / close / typing animation
   ========================================================================== */

window.openBachModal = function () {
  const modal = document.getElementById('bach-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';

  // Fetch stats.json
  fetch('./stats.json')
    .then(r => r.json())
    .then(data => {
      const fc = document.getElementById('fail-count');
      const tr = document.getElementById('total-runs');
      const th = document.getElementById('time-hours');
      if (fc) fc.textContent = data['fail-count'] ?? '9';
      if (tr) tr.textContent = data['total-runs'] ?? '553';
      if (th) th.textContent = (data['time-hours'] ?? '12.4') + 'h';
    })
    .catch(() => {
      const fc = document.getElementById('fail-count');
      const tr = document.getElementById('total-runs');
      const th = document.getElementById('time-hours');
      if (fc) fc.textContent = '9';
      if (tr) tr.textContent = '553';
      if (th) th.textContent = '12.4h';
    });

  // Start log animation
  startLogAnimation();
};

window.closeBachModal = function () {
  const modal = document.getElementById('bach-modal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
  stopLogAnimation();
};

let logInterval = null;
function startLogAnimation() {
  const codeBox = document.getElementById('code-content');
  const terminal = document.querySelector('.bm-terminal');
  const progress = document.getElementById('code-progress');
  if (!codeBox) return;
  codeBox.innerHTML = '';
  if (progress) progress.style.width = '0%';

  fetch('./assets/code-sample.txt')
    .then(r => r.text())
    .then(text => {
      const lines = text.split('\n');
      let currentLine = 0;

      if (logInterval) clearInterval(logInterval);

      logInterval = setInterval(() => {
        if (currentLine < lines.length) {
          const raw = lines[currentLine];
          // Colour-code by keyword
          const span = document.createElement('div');
          span.className = 'bm-log-line';
          if (/FAILED/i.test(raw)) {
            span.classList.add('fail');
          } else if (/PASSED/i.test(raw)) {
            span.classList.add('pass');
          } else if (/WARN|Error/i.test(raw)) {
            span.classList.add('warn');
          }
          span.textContent = raw;
          codeBox.appendChild(span);

          // Auto-scroll the terminal wrapper
          if (terminal) terminal.scrollTop = terminal.scrollHeight;

          // Update progress
          if (progress) {
            progress.style.width = `${((currentLine + 1) / lines.length) * 100}%`;
          }
          currentLine++;
        } else {
          clearInterval(logInterval);
          setTimeout(() => {
            if (modalIsOpen('bach-modal')) startLogAnimation();
          }, 3000);
        }
      }, 70);
    });
}

function stopLogAnimation() {
  if (logInterval) {
    clearInterval(logInterval);
    logInterval = null;
  }
}

function modalIsOpen(id) {
  const modal = document.getElementById(id);
  return modal && modal.style.display === 'flex';
}


/* ==========================================================================
   ACL MODAL — open / close / screen switching
   ========================================================================== */

window.openAclModal = function () {
  const modal = document.getElementById('acl-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  aclGoTo(1);
};

window.closeAclModal = function () {
  const modal = document.getElementById('acl-modal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
  // reset animation states so they replay next open
  const s1 = document.getElementById('acl-screen-1');
  const s2 = document.getElementById('acl-screen-2');
  if (s1) s1.classList.remove('acl-s1-active');
  if (s2) s2.classList.remove('acl-s2-active');
};

window.aclGoTo = function (screen) {
  const s1 = document.getElementById('acl-screen-1');
  const s2 = document.getElementById('acl-screen-2');
  if (!s1 || !s2) return;

  if (screen === 2) {
    s1.style.display = 'none';
    s1.classList.remove('acl-s1-active');
    s2.style.display = 'flex';
    // trigger staggered tool stack animations
    setTimeout(() => s2.classList.add('acl-s2-active'), 50);
  } else {
    s2.style.display = 'none';
    s2.classList.remove('acl-s2-active');
    s1.style.display = 'flex';
    // trigger cascading feature image animations
    setTimeout(() => s1.classList.add('acl-s1-active'), 50);
  }
};

/* ==========================================================================
   BACHELOR'S THESIS MODAL — screen switching
   ========================================================================== */

window.bachGoTo = function (screenIndex) {
  for (let i = 1; i <= 4; i++) {
    const screen = document.getElementById(`bach-screen-${i}`);
    if (screen) {
      if (i === screenIndex) {
        screen.style.display = 'flex';
        setTimeout(() => screen.classList.add('bs-s2-active'), 50);
      } else {
        screen.style.display = 'none';
        screen.classList.remove('bs-s2-active');
      }
    }
  }
};

/* ==========================================================================
   BANK MODAL (SPRING BANK / EJADA)
   ========================================================================== */

window.openBankModal = function () {
  const modal = document.getElementById('bank-modal');
  if (!modal) return;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  window.bankGoTo(1);
};

window.closeBankModal = function () {
  const modal = document.getElementById('bank-modal');
  if (!modal) return;
  modal.style.display = 'none';
  document.body.style.overflow = '';
};

window.bankGoTo = function (screenIndex) {
  for (let i = 1; i <= 3; i++) {
    const screen = document.getElementById(`bank-screen-${i}`);
    if (screen) {
      if (i === screenIndex) {
        screen.style.display = 'flex';
        setTimeout(() => screen.classList.add('bank-active'), 50);
      } else {
        screen.style.display = 'none';
        screen.classList.remove('bank-active');
      }
    }
  }
};

/**
 * Handle hero scroll frame-by-frame blending animation with parallax transforms
 */
function initHeroScrollAnimation() {
  const frames = document.querySelectorAll('.hero-bg-frame');
  if (frames.length === 0) return;

  const handleScroll = () => {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    const scrollY = window.scrollY;
    const heroHeight = heroSection.offsetHeight || window.innerHeight;

    // Calculate normalized scroll progress (transition finishes faster, within 33% of hero height)
    const animationLimit = heroHeight * 0.33;
    const progress = Math.max(0, Math.min(1, scrollY / animationLimit));

    // Reset all opacities to 0
    let opacities = [0, 0, 0, 0];

    // Distribute progress across the 4 frames (3 transition intervals)
    if (progress <= 0.33) {
      const t = progress / 0.33;
      opacities[0] = 1 - t;
      opacities[1] = t;
    } else if (progress <= 0.66) {
      const t = (progress - 0.33) / 0.33;
      opacities[1] = 1 - t;
      opacities[2] = t;
    } else {
      const t = (progress - 0.66) / 0.34;
      opacities[2] = 1 - t;
      opacities[3] = t;
    }

    // Apply computed opacities and subtle depth transforms
    frames.forEach((frame, idx) => {
      frame.style.opacity = opacities[idx];

      // Dynamic scaling and translation matching the scroll progress
      const scale = 1 + progress * 0.08; // zooms in up to 8%
      const translateY = progress * 45;  // shifts background down up to 45px for parallax effect

      frame.style.transform = `scale(${scale}) translateY(${translateY}px)`;
    });
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  // Initial call to set active/inactive frames at the start position
  handleScroll();
}

/* ==========================================================================
   GAME SCENE — multi-section stair line (Hero + Section 2 Zigzag) + walking char
   ========================================================================== */
function initGameScene() {
  const canvas = document.getElementById('stair-canvas');
  const projCanvas = document.getElementById('projects-stair-canvas');
  const gtkCanvas = document.getElementById('gtk-stair-canvas');
  if (!canvas) return;

  const TREAD = 45;   // horizontal run per step (px)
  const RISER = 28;   // vertical drop per step  (px)
  const PAD_X = 75;   // side margin
  const PAD_Y = 240;  // top margin in hero

  let heroStairPoints = [];
  let projStairPoints = [];
  let gtkStairPoints = [];
  let allStairPoints = [];

  function computeHeroStairs(W, H) {
    heroStairPoints = [];
    const leftX = PAD_X;
    const midX = Math.round(W / 2); // center of screen = connector column
    const maxSteps = Math.floor(Math.min(
      (W - PAD_X * 2) / TREAD,
      (H - PAD_Y) / RISER
    ));
    const numSteps = Math.max(4, maxSteps);

    let x = PAD_X;
    let y = PAD_Y;
    heroStairPoints.push({ x, y, dir: 'right' });

    for (let i = 0; i < numSteps; i++) {
      x += TREAD;
      heroStairPoints.push({ x, y, dir: 'right' });
      y += RISER;
      heroStairPoints.push({ x, y, dir: 'right' });
    }

    // Horizontal connector: run right to screen center
    heroStairPoints.push({ x: midX, y, dir: 'right' });
    // Vertical connector: drop straight down to canvas bottom at center
    heroStairPoints.push({ x: midX, y: H, dir: 'down' });
  }

  function computeProjStairs(W, H) {
    projStairPoints = [];
    const leftX = PAD_X;
    const rightX = Math.max(leftX + TREAD * 4, W - PAD_X);
    const midX = Math.round(W / 2); // must match hero connector column
    // Inner turn-around boundaries — keep steps clear of the 320px swatch cards
    const SWATCH_PAD = 360;
    const innerLeft = leftX + SWATCH_PAD;
    const innerRight = rightX - SWATCH_PAD;
    const heroSection = document.getElementById('hero');
    const heroOffset = heroSection ? heroSection.offsetHeight : 800;

    // Entry point at section boundary — vertical drop from hero lands here at center
    let x = midX;
    let y = 0;
    projStairPoints.push({ x, y: heroOffset + y, dir: 'right' });

    // Horizontal bridge: run right from center to rightX before zigzagging down
    x = rightX;
    projStairPoints.push({ x, y: heroOffset + y, dir: 'right' });

    // Segment 1: Right → Left
    while (x > innerLeft + TREAD) {
      x -= TREAD;
      projStairPoints.push({ x, y: heroOffset + y, dir: 'left' });
      y += RISER;
      projStairPoints.push({ x, y: heroOffset + y, dir: 'left' });
    }

    // Segment 2: Left → Right
    while (x < innerRight - TREAD) {
      x += TREAD;
      projStairPoints.push({ x, y: heroOffset + y, dir: 'right' });
      y += RISER;
      projStairPoints.push({ x, y: heroOffset + y, dir: 'right' });
    }

    // Segment 3: Right → Left
    while (x > innerLeft + TREAD) {
      x -= TREAD;
      projStairPoints.push({ x, y: heroOffset + y, dir: 'left' });
      y += RISER;
      projStairPoints.push({ x, y: heroOffset + y, dir: 'left' });
    }

    // Segment 4: Left → Right
    while (x < innerRight - TREAD) {
      x += TREAD;
      projStairPoints.push({ x, y: heroOffset + y, dir: 'right' });
      y += RISER;
      projStairPoints.push({ x, y: heroOffset + y, dir: 'right' });
    }

    // Segment 5: Right → Left (steps down from top right to bottom left)
    while (x > innerLeft + TREAD) {
      x -= TREAD;
      projStairPoints.push({ x, y: heroOffset + y, dir: 'left' });
      y += RISER;
      projStairPoints.push({ x, y: heroOffset + y, dir: 'left' });
    }
  }

  function drawHeroCanvas() {
    const W = canvas.width = canvas.offsetWidth;
    const H = canvas.height = canvas.offsetHeight;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    computeHeroStairs(W, H);
    if (heroStairPoints.length < 2) return;

    ctx.strokeStyle = 'rgba(192, 57, 43, 0.6)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';

    ctx.beginPath();
    ctx.moveTo(heroStairPoints[0].x, heroStairPoints[0].y);
    for (let i = 1; i < heroStairPoints.length; i++) {
      ctx.lineTo(heroStairPoints[i].x, heroStairPoints[i].y);
    }
    ctx.stroke();
  }

  function drawProjCanvas() {
    if (!projCanvas) return;
    const W = projCanvas.width = projCanvas.offsetWidth;
    const H = projCanvas.height = projCanvas.offsetHeight;
    const ctx = projCanvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    computeProjStairs(W, H);
    if (projStairPoints.length < 2) return;

    ctx.strokeStyle = 'rgba(192, 57, 43, 0.6)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';

    const heroSection = document.getElementById('hero');
    const heroOffset = heroSection ? heroSection.offsetHeight : 800;

    ctx.beginPath();
    ctx.moveTo(projStairPoints[0].x, projStairPoints[0].y - heroOffset);
    for (let i = 1; i < projStairPoints.length; i++) {
      ctx.lineTo(projStairPoints[i].x, projStairPoints[i].y - heroOffset);
    }
    ctx.stroke();
  }

  // Arc-length tables — declared early so buildArcLengths() can initialize them
  // even when called from updateAllPoints() on first load.
  let segLengths = [];   // length of each segment
  let cumLengths = [];   // cumulative total up to each point
  let totalLength = 0;

  function updateAllPoints() {
    drawHeroCanvas();
    drawProjCanvas();
    allStairPoints = [...heroStairPoints, ...projStairPoints];
    buildArcLengths();
  }

  updateAllPoints();
  window.addEventListener('resize', updateAllPoints);

  // ── Character elements ────────────────────────────────────────────────────
  const charWrap = document.getElementById('char-wrap');
  const charSprite = document.getElementById('char-sprite');
  const bubble = document.getElementById('speech-bubble');
  if (!charWrap || !charSprite || !bubble) return;

  let lastScrollY = window.scrollY;
  let walkTimer = null;
  let isWalking = false;
  let waveTimeout = null;

  // Pre-compute cumulative arc-lengths for each segment so the character
  // can walk horizontal and vertical connector segments, not just stair steps.

  function buildArcLengths() {
    segLengths = [];
    cumLengths = [0];
    totalLength = 0;
    for (let i = 0; i < allStairPoints.length - 1; i++) {
      const p0 = allStairPoints[i];
      const p1 = allStairPoints[i + 1];
      const dx = p1.x - p0.x;
      const dy = p1.y - p0.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      segLengths.push(len);
      totalLength += len;
      cumLengths.push(totalLength);
    }
  }

  function positionChar(scrollY) {
    if (allStairPoints.length < 2) return;

    const firstPt = allStairPoints[0];
    const lastPt = allStairPoints[allStairPoints.length - 1];

    // Anchor the character ~48% down from the viewport top — keeps it centred
    // and avoids visible lag when the user scrolls quickly.
    const VIEWPORT_OFFSET = window.innerHeight * 0.48;
    const centerTarget = Math.max(firstPt.y, Math.min(lastPt.y, scrollY + VIEWPORT_OFFSET));

    // At initial load / top of page (scrollY < 300), start character higher up near top step
    let targetY;
    if (scrollY < 300) {
      const blend = Math.max(0, scrollY / 300);
      targetY = firstPt.y + blend * (centerTarget - firstPt.y);
    } else {
      targetY = centerTarget;
    }

    // Find the first segment whose END y-coordinate meets or exceeds targetY.
    // Y-based lookup: stays in sync with scroll speed by definition.
    let idx = 0;
    for (let i = 0; i < allStairPoints.length - 1; i++) {
      if (allStairPoints[i + 1].y >= targetY) {
        idx = i;
        break;
      }
      idx = i;
    }

    const p0 = allStairPoints[idx];
    const p1 = allStairPoints[Math.min(idx + 1, allStairPoints.length - 1)];

    // Interpolate within the segment (frac stays 0 for flat tread segments)
    let frac = 0;
    const dy = p1.y - p0.y;
    if (dy > 0) {
      frac = Math.max(0, Math.min(1, (targetY - p0.y) / dy));
    }

    const cx = p0.x + (p1.x - p0.x) * frac;
    const cy = p0.y + (p1.y - p0.y) * frac;

    charWrap.style.left = `${cx - 67.5}px`;
    charWrap.style.top = `${cy - 160}px`;

    // Sprite direction
    if (p0.dir === 'left') {
      charSprite.style.transform = 'scaleX(-1)';
    } else {
      charSprite.style.transform = 'scaleX(1)';
    }
  }

  positionChar(0);

  // ── Hover → wave + bubble ─────────────────────────────────────────────────
  function playWave() {
    if (isWalking) return;
    clearTimeout(waveTimeout);

    charSprite.classList.remove('anim-walk-down', 'anim-walk-up', 'anim-wave');
    void charSprite.offsetWidth;
    charSprite.classList.add('anim-wave');
    bubble.classList.add('visible');

    waveTimeout = setTimeout(() => {
      charSprite.classList.remove('anim-wave');
      bubble.classList.remove('visible');
    }, 2200);
  }

  charWrap.addEventListener('mouseenter', playWave);
  charWrap.addEventListener('focus', playWave);

  // Flash bubble on load
  setTimeout(() => {
    if (!isWalking) {
      bubble.classList.add('visible');
      setTimeout(() => bubble.classList.remove('visible'), 2800);
    }
  }, 1200);

  // ── Scroll → walk along all stair points ──────────────────────────────────
  let scrollDirection = 'down';

  function onScroll() {
    const delta = window.scrollY - lastScrollY;
    if (Math.abs(delta) >= 2) {
      scrollDirection = delta > 0 ? 'down' : 'up';
      lastScrollY = window.scrollY;
    }

    const goingDown = (scrollDirection === 'down');

    clearTimeout(walkTimer);
    charSprite.classList.remove('anim-wave', 'anim-walk-down', 'anim-walk-up');
    void charSprite.offsetWidth;
    charSprite.classList.add(goingDown ? 'anim-walk-down' : 'anim-walk-up');
    isWalking = true;

    positionChar(window.scrollY);

    // Fire proximity dialogue check using the character's current page Y
    if (typeof window._swatchProximityCheck === 'function') {
      const VIEWPORT_OFFSET = window.innerHeight * 0.48;
      const charPageY = window.scrollY + VIEWPORT_OFFSET;
      window._swatchProximityCheck(charPageY);
    }

    walkTimer = setTimeout(() => {
      charSprite.classList.remove('anim-walk-down', 'anim-walk-up');
      isWalking = false;
    }, 350);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
}

/* ==========================================================================
   CUBE ON SHELF — scroll-driven rotation
   Scrolling down → cube slowly rotates counter-clockwise (up)
   Scrolling up   → cube eases back toward 0°
   ========================================================================== */
function initCubeRotation() {
  const cube = document.getElementById('cube-on-shelf');
  const cubeLeft = document.getElementById('cube-left');
  const cubeRight = document.getElementById('cube-right');
  const labelLayer = document.getElementById('label-layer');
  const rulerLayer = document.getElementById('ruler-layer');
  const pencilLayer = document.getElementById('pencil-layer');
  const stickyLeft = document.getElementById('sticky-left');
  const stickyMiddle = document.getElementById('sticky-middle');
  const stickyRight = document.getElementById('sticky-right');

  const heroSection = document.getElementById('hero');
  if (!heroSection) return;

  const MAX_ROTATION = 18; // degrees at full scroll-down

  function onCubeScroll() {
    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
    if (window.scrollY > heroBottom) return;

    const heroH = heroSection.offsetHeight || window.innerHeight;
    const progress = Math.max(0, Math.min(1, window.scrollY / (heroH * 0.65)));

    // Center cube — counter-clockwise (up)
    if (cube) cube.style.transform = `rotate(${progress * MAX_ROTATION * -1}deg)`;
    // Left cube    — counter-clockwise (left and up, pivots bottom-right)
    if (cubeLeft) cubeLeft.style.transform = `rotate(${progress * MAX_ROTATION * -1}deg)`;
    // Right cube   — clockwise (right and up, pivots bottom-left)
    if (cubeRight) cubeRight.style.transform = `rotate(${progress * MAX_ROTATION}deg)`;
    // Label layer  — swings down (translates down and rotates clockwise)
    if (labelLayer) labelLayer.style.transform = `translateY(${progress * 25}px) rotate(${progress * 12}deg)`;

    // Ruler layer  — moves visibly up and left
    if (rulerLayer) rulerLayer.style.transform = `translate(${progress * -95}px, ${progress * -110}px) rotate(${progress * -15}deg)`;
    // Pencil layer — moves visibly up and right
    if (pencilLayer) pencilLayer.style.transform = `translate(${progress * 95}px, ${progress * -110}px) rotate(${progress * 15}deg)`;

    // Sticky note middle — moves straight up
    if (stickyMiddle) stickyMiddle.style.transform = `translateY(${progress * -55}px)`;
    // Sticky note left   — moves up and left
    if (stickyLeft) stickyLeft.style.transform = `translate(${progress * -45}px, ${progress * -55}px) rotate(${progress * -8}deg)`;
    // Sticky note right  — moves up and right
    if (stickyRight) stickyRight.style.transform = `translate(${progress * 45}px, ${progress * -55}px) rotate(${progress * 8}deg)`;
  }

  window.addEventListener('scroll', onCubeScroll, { passive: true });
  onCubeScroll();
}
