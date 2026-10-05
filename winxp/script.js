/* Windows XP Simulator Script */
(function () {
  'use strict';

  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  }

  const XpAudio = {
    startup: function () {
      initAudio();
      if (!audioCtx) return;
      try {
        const notes = [
          { freq: 311.13, time: 0.0, dur: 1.8 },
          { freq: 466.16, time: 0.12, dur: 1.8 },
          { freq: 415.30, time: 0.28, dur: 1.6 },
          { freq: 622.25, time: 0.44, dur: 2.2 },
          { freq: 466.16, time: 0.70, dur: 2.4 },
          { freq: 698.46, time: 0.95, dur: 3.0 }
        ];

        notes.forEach(n => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(n.freq, audioCtx.currentTime + n.time);

          gain.gain.setValueAtTime(0.001, audioCtx.currentTime + n.time);
          gain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + n.time + 0.15);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + n.time + n.dur);

          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(audioCtx.currentTime + n.time);
          osc.stop(audioCtx.currentTime + n.time + n.dur);
        });
      } catch (e) {}
    },

    click: function () {
      initAudio();
      if (!audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.03);
      } catch (e) {}
    },

    bumper: function () {
      initAudio();
      if (!audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, audioCtx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      } catch (e) {}
    },

    flipper: function () {
      initAudio();
      if (!audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      } catch (e) {}
    },

    plunger: function () {
      initAudio();
      if (!audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(750, audioCtx.currentTime + 0.14);
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.14);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.14);
      } catch (e) {}
    },

    drain: function () {
      initAudio();
      if (!audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, audioCtx.currentTime);
        osc.frequency.linearRampToValueAtTime(70, audioCtx.currentTime + 0.28);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.28);
      } catch (e) {}
    }
  };

  window.addEventListener('click', function playStartupOnce() {
    XpAudio.startup();
    window.removeEventListener('click', playStartupOnce);
  }, { once: true });

  let highestZ = 100;
  let activeWindowId = null;
  const activeTabs = new Map();

  const WindowManager = {
    open: function (appId) {
      XpAudio.click();
      const win = document.getElementById(`win-${appId}`);
      if (!win) return;
      win.classList.remove('hidden');
      this.bringFront(win);

      if (!activeTabs.has(appId)) {
        const tab = document.createElement('div');
        tab.className = 'xp-task-tab active';
        tab.setAttribute('data-id', appId);
        const title = win.querySelector('.xp-titlebar span')?.textContent || appId;
        tab.innerHTML = `<span style="font-weight:bold;">${title}</span>`;
        tab.addEventListener('click', () => this.toggle(appId));
        document.getElementById('xp-taskbar-tasks')?.appendChild(tab);
        activeTabs.set(appId, tab);
      }
      this.updateTabs(appId);
    },

    close: function (appId) {
      XpAudio.click();
      const win = document.getElementById(`win-${appId}`);
      if (win) win.classList.add('hidden');
      const tab = activeTabs.get(appId);
      if (tab) tab.remove();
      activeTabs.delete(appId);
      if (activeWindowId === appId) activeWindowId = null;
    },

    minimize: function (appId) {
      XpAudio.click();
      const win = document.getElementById(`win-${appId}`);
      if (win) win.classList.add('hidden');
      const tab = activeTabs.get(appId);
      if (tab) tab.classList.remove('active');
      if (activeWindowId === appId) activeWindowId = null;
    },

    toggle: function (appId) {
      const win = document.getElementById(`win-${appId}`);
      if (!win) return;
      if (!win.classList.contains('hidden') && activeWindowId === appId) {
        this.minimize(appId);
      } else {
        win.classList.remove('hidden');
        this.bringFront(win);
      }
    },

    bringFront: function (win) {
      highestZ += 2;
      win.style.zIndex = highestZ;
      document.querySelectorAll('.xp-titlebar').forEach(t => t.classList.add('inactive'));
      win.querySelector('.xp-titlebar')?.classList.remove('inactive');
      const appId = win.getAttribute('data-id');
      activeWindowId = appId;
      this.updateTabs(appId);
    },

    updateTabs: function (activeId) {
      activeTabs.forEach((tab, id) => {
        if (id === activeId) tab.classList.add('active');
        else tab.classList.remove('active');
      });
    }
  };

  function setupDraggable(win) {
    const bar = win.querySelector('.xp-titlebar');
    if (!bar) return;

    let isDown = false;
    let sx = 0, sy = 0, ox = 0, oy = 0;

    function onDown(e) {
      if (e.target.closest('.xp-btn-ctrl')) return;
      WindowManager.bringFront(win);
      isDown = true;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      sx = clientX;
      sy = clientY;
      ox = win.offsetLeft;
      oy = win.offsetTop;

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onUp);
    }

    function onMove(e) {
      if (!isDown) return;
      if (e.cancelable) e.preventDefault();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      win.style.left = `${ox + (clientX - sx)}px`;
      win.style.top = `${Math.max(0, oy + (clientY - sy))}px`;
    }

    function onUp() {
      isDown = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    }

    bar.addEventListener('mousedown', onDown);
    bar.addEventListener('touchstart', onDown, { passive: true });
    win.addEventListener('mousedown', () => WindowManager.bringFront(win));
  }

  document.querySelectorAll('.xp-window').forEach(setupDraggable);

  document.querySelectorAll('.xp-btn-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const win = e.target.closest('.xp-window');
      if (win) WindowManager.close(win.getAttribute('data-id'));
    });
  });

  document.querySelectorAll('.xp-btn-min').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const win = e.target.closest('.xp-window');
      if (win) WindowManager.minimize(win.getAttribute('data-id'));
    });
  });

  document.querySelectorAll('.xp-icon[data-app]').forEach(icon => {
    icon.addEventListener('dblclick', () => {
      WindowManager.open(icon.getAttribute('data-app'));
    });
    icon.addEventListener('click', () => {
      document.querySelectorAll('.xp-icon').forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
    });
  });

  const startBtn = document.getElementById('xp-start-btn');
  const startMenu = document.getElementById('xp-start-menu');

  startBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    XpAudio.click();
    startMenu?.classList.toggle('hidden');
  });

  window.addEventListener('click', () => {
    if (!startMenu?.classList.contains('hidden')) {
      startMenu?.classList.add('hidden');
    }
  });

  startMenu?.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.querySelectorAll('.xp-menu-item-row[data-app]').forEach(row => {
    row.addEventListener('click', () => {
      const appId = row.getAttribute('data-app');
      if (appId) WindowManager.open(appId);
      startMenu?.classList.add('hidden');
    });
  });

  const turnOffModal = document.getElementById('xp-turnoff-modal');
  document.getElementById('xp-menu-shutdown')?.addEventListener('click', () => {
    XpAudio.click();
    turnOffModal?.classList.remove('hidden');
    startMenu?.classList.add('hidden');
  });

  document.getElementById('btn-xp-cancel')?.addEventListener('click', () => {
    turnOffModal?.classList.add('hidden');
  });

  function performRestart() {
    window.location.href = '../index.html';
  }

  document.getElementById('btn-xp-restart')?.addEventListener('click', performRestart);
  document.getElementById('btn-xp-turnoff')?.addEventListener('click', performRestart);
  document.getElementById('btn-xp-standby')?.addEventListener('click', () => {
    turnOffModal?.classList.add('hidden');
  });

  // 3D Pinball for Windows - Space Cadet Arcade Physics Engine
  const SpaceCadetPinball = {
    canvas: null,
    ctx: null,
    animId: null,
    isPaused: false,
    score: 0,
    ballNum: 1,
    ballsLeft: 3,
    gameOver: false,
    particles: [],

    ball: {
      x: 320,
      y: 390,
      vx: 0,
      vy: 0,
      r: 6,
      launched: false,
      inChute: true,
      draining: false
    },

    plunger: {
      compression: 0,
      maxCompression: 35,
      charging: false,
      chargeTimer: null
    },

    flippers: {
      left: {
        pivotX: 95,
        pivotY: 390,
        length: 46,
        restAngle: 0.48,
        upAngle: -0.48,
        angle: 0.48,
        isUp: false,
        speed: 0.28
      },
      right: {
        pivotX: 215,
        pivotY: 390,
        length: 46,
        restAngle: Math.PI - 0.48,
        upAngle: Math.PI + 0.48,
        angle: Math.PI - 0.48,
        isUp: false,
        speed: 0.28
      }
    },

    bumpers: [
      { x: 110, y: 135, r: 21, score: 500, hitTimer: 0, label: '500', color: '#00e1ff' },
      { x: 200, y: 125, r: 21, score: 500, hitTimer: 0, label: '500', color: '#00e1ff' },
      { x: 155, y: 185, r: 23, score: 1000, hitTimer: 0, label: '1000', color: '#ffcc00' }
    ],

    slingshots: [
      { p1: { x: 55, y: 310 }, p2: { x: 88, y: 360 }, p3: { x: 55, y: 360 }, hitTimer: 0 },
      { p1: { x: 255, y: 310 }, p2: { x: 222, y: 360 }, p3: { x: 255, y: 360 }, hitTimer: 0 }
    ],

    rollovers: [
      { x: 120, y: 65, r: 8, lit: false, score: 1500 },
      { x: 155, y: 55, r: 8, lit: false, score: 1500 },
      { x: 190, y: 65, r: 8, lit: false, score: 1500 }
    ],

    init: function () {
      this.canvas = document.getElementById('pinball-canvas');
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.bindControls();
      this.resetGame();
      this.loop();
    },

    bindControls: function () {
      window.addEventListener('keydown', (e) => {
        const win = document.getElementById('win-pinball');
        if (win && win.classList.contains('hidden')) return;

        if (e.key === 'z' || e.key === 'Z' || e.key === 'ArrowLeft') {
          if (!this.flippers.left.isUp) {
            this.flippers.left.isUp = true;
            XpAudio.flipper();
          }
        }
        if (e.key === '/' || e.key === '?' || e.key === 'ArrowRight' || e.key === 'm' || e.key === 'M') {
          if (!this.flippers.right.isUp) {
            this.flippers.right.isUp = true;
            XpAudio.flipper();
          }
        }
        if (e.code === 'Space') {
          e.preventDefault();
          if (this.gameOver) {
            this.resetGame();
          } else if (!this.ball.launched) {
            this.startPlungerCharge();
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        if (e.key === 'z' || e.key === 'Z' || e.key === 'ArrowLeft') {
          this.flippers.left.isUp = false;
        }
        if (e.key === '/' || e.key === '?' || e.key === 'ArrowRight' || e.key === 'm' || e.key === 'M') {
          this.flippers.right.isUp = false;
        }
        if (e.code === 'Space') {
          this.releasePlunger();
        }
      });

      const btnFlipL = document.getElementById('btn-flipper-left');
      const btnFlipR = document.getElementById('btn-flipper-right');
      const btnLaunch = document.getElementById('btn-pinball-launch');

      const pressL = (e) => { e.preventDefault(); this.flippers.left.isUp = true; XpAudio.flipper(); };
      const releaseL = (e) => { e.preventDefault(); this.flippers.left.isUp = false; };
      btnFlipL?.addEventListener('mousedown', pressL);
      btnFlipL?.addEventListener('mouseup', releaseL);
      btnFlipL?.addEventListener('touchstart', pressL, { passive: false });
      btnFlipL?.addEventListener('touchend', releaseL);

      const pressR = (e) => { e.preventDefault(); this.flippers.right.isUp = true; XpAudio.flipper(); };
      const releaseR = (e) => { e.preventDefault(); this.flippers.right.isUp = false; };
      btnFlipR?.addEventListener('mousedown', pressR);
      btnFlipR?.addEventListener('mouseup', releaseR);
      btnFlipR?.addEventListener('touchstart', pressR, { passive: false });
      btnFlipR?.addEventListener('touchend', releaseR);

      const pressPlunge = (e) => {
        e.preventDefault();
        if (this.gameOver) {
          this.resetGame();
        } else if (!this.ball.launched) {
          this.startPlungerCharge();
        }
      };
      const releasePlunge = (e) => { e.preventDefault(); this.releasePlunger(); };
      btnLaunch?.addEventListener('mousedown', pressPlunge);
      btnLaunch?.addEventListener('mouseup', releasePlunge);
      btnLaunch?.addEventListener('touchstart', pressPlunge, { passive: false });
      btnLaunch?.addEventListener('touchend', releasePlunge);

      document.getElementById('pinball-new-game')?.addEventListener('click', () => {
        this.resetGame();
      });

      document.getElementById('pinball-pause-btn')?.addEventListener('click', () => {
        this.isPaused = !this.isPaused;
        const btn = document.getElementById('pinball-pause-btn');
        if (btn) btn.textContent = this.isPaused ? 'Resume' : 'Pause';
      });

      document.getElementById('pinball-help-btn')?.addEventListener('click', () => {
        alert("3D Pinball for Windows - Space Cadet:\n\n• Z o Flecha Izq: Flipper Izquierdo\n• / o Flecha Der: Flipper Derecho\n• Espacio: Cargar y disparar bola con el lanzador\n• Rebota en los 3 bumpers y dianas para ganar ascensos de rango (Cadet -> Ensign -> Lieutenant -> Commander)!");
      });
    },

    startPlungerCharge: function () {
      if (this.plunger.charging || this.ball.launched) return;
      this.plunger.charging = true;
      this.plunger.compression = 0;
      clearInterval(this.plunger.chargeTimer);
      this.plunger.chargeTimer = setInterval(() => {
        if (this.plunger.compression < this.plunger.maxCompression) {
          this.plunger.compression += 2.5;
        }
      }, 35);
    },

    releasePlunger: function () {
      if (!this.plunger.charging) return;
      this.plunger.charging = false;
      clearInterval(this.plunger.chargeTimer);
      if (!this.ball.launched) {
        XpAudio.plunger();
        const power = Math.max(0.4, this.plunger.compression / this.plunger.maxCompression);
        this.ball.vy = -16.5 * power;
        this.ball.vx = (Math.random() - 0.5) * 0.8;
        this.ball.launched = true;
        this.ball.inChute = true;
      }
      this.plunger.compression = 0;
    },

    resetGame: function () {
      this.score = 0;
      this.ballsLeft = 3;
      this.ballNum = 1;
      this.gameOver = false;
      this.isPaused = false;
      this.rollovers.forEach(r => r.lit = false);
      this.particles = [];
      this.resetBall();
      this.updateHUD();
    },

    resetBall: function () {
      this.ball.x = 320;
      this.ball.y = 390;
      this.ball.vx = 0;
      this.ball.vy = 0;
      this.ball.launched = false;
      this.ball.inChute = true;
      this.ball.draining = false;
    },

    addScore: function (pts) {
      this.score += pts;
      this.updateHUD();
    },

    updateHUD: function () {
      const sEl = document.getElementById('pinball-score-val');
      const bEl = document.getElementById('pinball-ball-val');
      const rEl = document.getElementById('pinball-rank-val');
      if (sEl) sEl.textContent = String(this.score).padStart(6, '0');
      if (bEl) bEl.textContent = String(this.ballNum);
      if (rEl) {
        if (this.score < 10000) rEl.textContent = 'CADET';
        else if (this.score < 30000) rEl.textContent = 'ENSIGN';
        else if (this.score < 70000) rEl.textContent = 'LIEUTENANT';
        else if (this.score < 150000) rEl.textContent = 'CAPTAIN';
        else rEl.textContent = 'COMMODORE';
      }
    },

    spawnParticles: function (x, y, color, count) {
      for (let i = 0; i < count; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = Math.random() * 3 + 1;
        this.particles.push({
          x: x,
          y: y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          color: color,
          life: 1.0,
          decay: Math.random() * 0.05 + 0.03
        });
      }
    },

    update: function () {
      if (this.isPaused) return;

      const fl = this.flippers.left;
      const fr = this.flippers.right;
      if (fl.isUp) {
        fl.angle = Math.max(fl.upAngle, fl.angle - fl.speed);
      } else {
        fl.angle = Math.min(fl.restAngle, fl.angle + fl.speed);
      }
      if (fr.isUp) {
        fr.angle = Math.min(fr.upAngle, fr.angle + fr.speed);
      } else {
        fr.angle = Math.max(fr.restAngle, fr.angle - fr.speed);
      }

      this.bumpers.forEach(b => { if (b.hitTimer > 0) b.hitTimer--; });
      this.slingshots.forEach(s => { if (s.hitTimer > 0) s.hitTimer--; });

      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) this.particles.splice(i, 1);
      }

      if (!this.ball.launched) {
        this.ball.x = 320;
        this.ball.y = 390 + this.plunger.compression * 0.6;
        return;
      }

      this.ball.vy += 0.38;
      this.ball.vx *= 0.997;
      this.ball.vy *= 0.997;

      this.ball.x += this.ball.vx;
      this.ball.y += this.ball.vy;

      if (this.ball.inChute) {
        if (this.ball.x + this.ball.r > 334) {
          this.ball.x = 334 - this.ball.r;
          this.ball.vx = -Math.abs(this.ball.vx) * 0.7;
        }
        if (this.ball.y > 100 && this.ball.x - this.ball.r < 305) {
          this.ball.x = 305 + this.ball.r;
          this.ball.vx = Math.abs(this.ball.vx) * 0.7;
        }
        if (this.ball.y < 70 && this.ball.x < 310) {
          this.ball.inChute = false;
          this.ball.vx = -5;
        }
      } else {
        if (this.ball.y > 90 && this.ball.x + this.ball.r > 305) {
          this.ball.x = 305 - this.ball.r;
          this.ball.vx = -Math.abs(this.ball.vx) * 0.75;
        }
      }

      if (this.ball.y - this.ball.r < 18) {
        this.ball.y = 18 + this.ball.r;
        this.ball.vy = Math.abs(this.ball.vy) * 0.75;
      }

      const distTopL = Math.hypot(this.ball.x - 70, this.ball.y - 70);
      if (distTopL > 65 && this.ball.x < 70 && this.ball.y < 70) {
        const nx = (70 - this.ball.x) / distTopL;
        const ny = (70 - this.ball.y) / distTopL;
        this.ball.vx = nx * 5;
        this.ball.vy = ny * 5;
      }

      if (this.ball.x - this.ball.r < 18) {
        this.ball.x = 18 + this.ball.r;
        this.ball.vx = Math.abs(this.ball.vx) * 0.8;
      }

      this.checkLineBounce(18, 300, 95, 390, 0.75);
      this.checkLineBounce(305, 300, 215, 390, 0.75);

      this.bumpers.forEach(b => {
        const dx = this.ball.x - b.x;
        const dy = this.ball.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist < b.r + this.ball.r) {
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);
          this.ball.x = b.x + nx * (b.r + this.ball.r + 1);
          this.ball.y = b.y + ny * (b.r + this.ball.r + 1);
          const speed = Math.max(9, Math.hypot(this.ball.vx, this.ball.vy) * 1.25);
          this.ball.vx = nx * speed;
          this.ball.vy = ny * speed;
          b.hitTimer = 14;
          this.addScore(b.score);
          this.spawnParticles(b.x + nx * b.r, b.y + ny * b.r, b.color, 10);
          XpAudio.bumper();
        }
      });

      this.rollovers.forEach(ro => {
        if (!ro.lit && Math.hypot(this.ball.x - ro.x, this.ball.y - ro.y) < ro.r + this.ball.r) {
          ro.lit = true;
          this.addScore(ro.score);
          this.spawnParticles(ro.x, ro.y, '#00ffcc', 8);
          XpAudio.click();
        }
      });

      this.slingshots.forEach(sl => {
        if (this.checkLineBounce(sl.p1.x, sl.p1.y, sl.p2.x, sl.p2.y, 1.45)) {
          sl.hitTimer = 10;
          this.addScore(300);
          this.spawnParticles(this.ball.x, this.ball.y, '#ff4444', 6);
          XpAudio.bumper();
        }
      });

      this.checkFlipperBounce(fl, true);
      this.checkFlipperBounce(fr, false);

      if (this.ball.y > 445 && !this.ball.draining) {
        this.ball.draining = true;
        XpAudio.drain();
        this.ballsLeft--;
        if (this.ballsLeft > 0) {
          this.ballNum++;
          this.updateHUD();
          this.resetBall();
        } else {
          this.gameOver = true;
          this.updateHUD();
        }
      }
    },

    checkLineBounce: function (x1, y1, x2, y2, restitution) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) return false;

      let t = ((this.ball.x - x1) * dx + (this.ball.y - y1) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
      const projX = x1 + t * dx;
      const projY = y1 + t * dy;

      const dist = Math.hypot(this.ball.x - projX, this.ball.y - projY);
      if (dist < this.ball.r) {
        let nx = -(y2 - y1);
        let ny = (x2 - x1);
        const nlen = Math.hypot(nx, ny);
        nx /= nlen;
        ny /= nlen;

        const dot = (this.ball.x - projX) * nx + (this.ball.y - projY) * ny;
        if (dot < 0) { nx = -nx; ny = -ny; }

        this.ball.x = projX + nx * (this.ball.r + 0.5);
        this.ball.y = projY + ny * (this.ball.r + 0.5);

        const vDotN = this.ball.vx * nx + this.ball.vy * ny;
        if (vDotN < 0) {
          this.ball.vx = (this.ball.vx - (1 + restitution) * vDotN * nx);
          this.ball.vy = (this.ball.vy - (1 + restitution) * vDotN * ny);
        }
        return true;
      }
      return false;
    },

    checkFlipperBounce: function (flipper, isLeft) {
      const tipX = flipper.pivotX + Math.cos(flipper.angle) * flipper.length;
      const tipY = flipper.pivotY + Math.sin(flipper.angle) * flipper.length;

      const hit = this.checkLineBounce(flipper.pivotX, flipper.pivotY, tipX, tipY, 0.7);
      if (hit) {
        if (flipper.isUp) {
          this.ball.vy = -12.5 - Math.random() * 3;
          this.ball.vx += isLeft ? 4.5 : -4.5;
          this.addScore(100);
          this.spawnParticles(this.ball.x, this.ball.y, '#ffffff', 6);
          XpAudio.flipper();
        }
      }
    },

    draw: function () {
      const ctx = this.ctx;
      if (!ctx) return;

      ctx.clearRect(0, 0, 340, 440);

      const bgGrad = ctx.createRadialGradient(160, 160, 20, 160, 200, 250);
      bgGrad.addColorStop(0, '#091c42');
      bgGrad.addColorStop(0.5, '#050f28');
      bgGrad.addColorStop(1, '#020512');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 340, 440);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      const stars = [
        [35, 45], [85, 30], [240, 40], [280, 85], [40, 190], [290, 210],
        [75, 260], [270, 270], [170, 80], [130, 250], [195, 260]
      ];
      stars.forEach(([sx, sy]) => {
        ctx.fillRect(sx, sy, 1.5, 1.5);
      });

      ctx.save();
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = 'rgba(0, 225, 255, 0.35)';
      ctx.textAlign = 'center';
      ctx.fillText('SPACE CADET', 155, 30);
      ctx.font = '8px sans-serif';
      ctx.fillStyle = 'rgba(255, 204, 0, 0.4)';
      ctx.fillText('HYPERSPACE PATROL', 155, 42);
      ctx.restore();

      ctx.strokeStyle = '#2d4580';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(305, 430);
      ctx.lineTo(305, 95);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(170, 95, 135, Math.PI, 0, false);
      ctx.strokeStyle = '#3b5998';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.strokeStyle = '#ffcc00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(18, 300);
      ctx.lineTo(95, 390);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(305, 300);
      ctx.lineTo(215, 390);
      ctx.stroke();

      this.slingshots.forEach(sl => {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sl.p1.x, sl.p1.y);
        ctx.lineTo(sl.p2.x, sl.p2.y);
        ctx.lineTo(sl.p3.x, sl.p3.y);
        ctx.closePath();
        ctx.fillStyle = sl.hitTimer > 0 ? '#ff4444' : '#1e3870';
        ctx.fill();
        ctx.strokeStyle = sl.hitTimer > 0 ? '#ffffff' : '#38bdf8';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      });

      this.rollovers.forEach(ro => {
        ctx.save();
        ctx.beginPath();
        ctx.arc(ro.x, ro.y, ro.r, 0, Math.PI * 2);
        ctx.fillStyle = ro.lit ? '#00ffcc' : '#15254d';
        ctx.fill();
        ctx.strokeStyle = ro.lit ? '#ffffff' : '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        if (ro.lit) {
          ctx.shadowColor = '#00ffcc';
          ctx.shadowBlur = 8;
          ctx.fill();
        }
        ctx.restore();
      });

      this.bumpers.forEach(b => {
        ctx.save();
        const hit = b.hitTimer > 0;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        const bGrad = ctx.createRadialGradient(b.x - 5, b.y - 5, 2, b.x, b.y, b.r);
        if (hit) {
          bGrad.addColorStop(0, '#ffffff');
          bGrad.addColorStop(0.5, b.color);
          bGrad.addColorStop(1, '#ff3b30');
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 18;
        } else {
          bGrad.addColorStop(0, '#ffffff');
          bGrad.addColorStop(0.3, b.color);
          bGrad.addColorStop(1, '#062058');
        }
        ctx.fillStyle = bGrad;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.label, b.x, b.y);
        ctx.restore();
      });

      [this.flippers.left, this.flippers.right].forEach((fl) => {
        const tipX = fl.pivotX + Math.cos(fl.angle) * fl.length;
        const tipY = fl.pivotY + Math.sin(fl.angle) * fl.length;

        ctx.save();
        ctx.beginPath();
        ctx.arc(fl.pivotX, fl.pivotY, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#ffcc00';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        ctx.strokeStyle = fl.isUp ? '#00e1ff' : '#ffffff';
        ctx.shadowColor = fl.isUp ? '#00e1ff' : 'transparent';
        ctx.shadowBlur = fl.isUp ? 10 : 0;
        ctx.moveTo(fl.pivotX, fl.pivotY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#dc2626';
        ctx.moveTo(fl.pivotX, fl.pivotY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();
        ctx.restore();
      });

      ctx.save();
      const plungerTop = 415 + this.plunger.compression * 0.6;
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(320, 440);
      ctx.lineTo(320, plungerTop);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(320, plungerTop - 4, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(this.ball.x, this.ball.y, this.ball.r, 0, Math.PI * 2);
      const ballGrad = ctx.createRadialGradient(
        this.ball.x - 2, this.ball.y - 2, 1,
        this.ball.x, this.ball.y, this.ball.r
      );
      ballGrad.addColorStop(0, '#ffffff');
      ballGrad.addColorStop(0.3, '#cbd5e1');
      ballGrad.addColorStop(0.8, '#64748b');
      ballGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = ballGrad;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.restore();

      this.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      if (this.gameOver) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 5, 20, 0.78)';
        ctx.fillRect(0, 150, 340, 130);
        ctx.fillStyle = '#ff3b30';
        ctx.font = 'bold 22px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff3b30';
        ctx.shadowBlur = 12;
        ctx.fillText('GAME OVER', 170, 200);

        ctx.fillStyle = '#00ffcc';
        ctx.font = '11px sans-serif';
        ctx.shadowBlur = 0;
        ctx.fillText('PULSA ESPACIO PARA REINICIAR', 170, 230);
        ctx.restore();
      }

      if (this.isPaused) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 180, 340, 80);
        ctx.fillStyle = '#ffff00';
        ctx.font = 'bold 18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSADO', 170, 226);
        ctx.restore();
      }
    },

    loop: function () {
      this.update();
      this.draw();
      this.animId = requestAnimationFrame(() => this.loop());
    }
  };

  SpaceCadetPinball.init();

  const paintCanvas = document.getElementById('paint-canvas');
  if (paintCanvas) {
    const pctx = paintCanvas.getContext('2d');
    let isDrawing = false;
    let currentTool = 'pencil';
    let currentColor = '#000000';
    let startX = 0, startY = 0;

    const classic28Colors = [
      '#000000', '#808080', '#800000', '#808000', '#008000', '#008080', '#000080', '#800080', '#808040', '#004040', '#0080ff', '#004080', '#8000ff', '#804000',
      '#ffffff', '#c0c0c0', '#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff', '#ffff80', '#00ff80', '#80ffff', '#7f7fff', '#ff0080', '#ff8040'
    ];

    const palEl = document.getElementById('xp-paint-palette');
    if (palEl) {
      classic28Colors.forEach(c => {
        const sw = document.createElement('div');
        sw.className = 'xp-swatch';
        sw.style.backgroundColor = c;
        if (c === '#000000') sw.classList.add('active');
        sw.addEventListener('click', () => {
          document.querySelectorAll('.xp-swatch').forEach(s => s.classList.remove('active'));
          sw.classList.add('active');
          currentColor = c;
        });
        palEl.appendChild(sw);
      });
    }

    document.querySelectorAll('.xp-tool-btn[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.xp-tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.getAttribute('data-tool');
      });
    });

    document.getElementById('paint-clear')?.addEventListener('click', () => {
      pctx.fillStyle = '#ffffff';
      pctx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
    });

    paintCanvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      startX = e.offsetX;
      startY = e.offsetY;

      if (currentTool === 'fill') {
        pctx.fillStyle = currentColor;
        pctx.fillRect(0, 0, paintCanvas.width, paintCanvas.height);
      } else {
        pctx.beginPath();
        pctx.moveTo(startX, startY);
      }
    });

    paintCanvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      if (currentTool === 'pencil') {
        pctx.strokeStyle = currentColor;
        pctx.lineWidth = 1;
        pctx.lineTo(e.offsetX, e.offsetY);
        pctx.stroke();
      } else if (currentTool === 'brush') {
        pctx.strokeStyle = currentColor;
        pctx.lineWidth = 5;
        pctx.lineCap = 'round';
        pctx.lineTo(e.offsetX, e.offsetY);
        pctx.stroke();
      } else if (currentTool === 'eraser') {
        pctx.strokeStyle = '#ffffff';
        pctx.lineWidth = 10;
        pctx.lineCap = 'square';
        pctx.lineTo(e.offsetX, e.offsetY);
        pctx.stroke();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDrawing) return;
      isDrawing = false;
      if (currentTool === 'line') {
        pctx.strokeStyle = currentColor;
        pctx.lineWidth = 2;
        pctx.beginPath();
        pctx.moveTo(startX, startY);
        pctx.lineTo(e.offsetX, e.offsetY);
        pctx.stroke();
      } else if (currentTool === 'rect') {
        pctx.strokeStyle = currentColor;
        pctx.lineWidth = 2;
        pctx.strokeRect(startX, startY, e.offsetX - startX, e.offsetY - startY);
      } else if (currentTool === 'circle') {
        pctx.strokeStyle = currentColor;
        pctx.lineWidth = 2;
        pctx.beginPath();
        const rx = Math.abs(e.offsetX - startX) / 2;
        const ry = Math.abs(e.offsetY - startY) / 2;
        pctx.ellipse(startX + rx, startY + ry, rx, ry, 0, 0, 2 * Math.PI);
        pctx.stroke();
      }
    });
  }

  const wmpVis = document.getElementById('wmp-vis');
  if (wmpVis) {
    for (let i = 0; i < 20; i++) {
      const bar = document.createElement('div');
      bar.style.flex = '1';
      bar.style.height = '10px';
      bar.style.background = 'linear-gradient(180deg, #ff00ff, #00e1ff)';
      bar.style.borderRadius = '1px';
      bar.style.transition = 'height 0.1s ease';
      wmpVis.appendChild(bar);
    }

    let isPlaying = false;
    let timer = null;
    const playBtn = document.getElementById('xp-wmp-play');

    playBtn?.addEventListener('click', () => {
      isPlaying = !isPlaying;
      playBtn.textContent = isPlaying ? '⏸' : '▶';
      if (isPlaying) {
        initAudio();
        timer = setInterval(() => {
          Array.from(wmpVis.children).forEach(b => {
            const h = Math.floor(Math.random() * 90 + 10);
            b.style.height = `${h}%`;
          });
        }, 120);
      } else {
        clearInterval(timer);
        Array.from(wmpVis.children).forEach(b => {
          b.style.height = '10px';
        });
      }
    });
  }

  document.querySelectorAll('.taskmgr-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.taskmgr-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.getAttribute('data-tab');
      if (tab === 'perf') {
        document.getElementById('taskmgr-perf-panel')?.classList.remove('hidden');
        document.getElementById('taskmgr-procs-panel')?.classList.add('hidden');
      } else {
        document.getElementById('taskmgr-perf-panel')?.classList.add('hidden');
        document.getElementById('taskmgr-procs-panel')?.classList.remove('hidden');
      }
    });
  });

  const cpuPoints = [90, 80, 85, 60, 70, 50, 65, 40, 55];
  setInterval(() => {
    const nextVal = Math.floor(Math.random() * 55 + 25);
    cpuPoints.shift();
    cpuPoints.push(100 - nextVal);

    const poly = document.getElementById('xp-cpu-poly');
    if (poly) {
      const pts = cpuPoints.map((v, i) => `${i * 20},${v}`).join(' ');
      poly.setAttribute('points', pts);
    }
    const num = document.getElementById('xp-cpu-num');
    if (num) num.textContent = `${nextVal}%`;

    const mem = document.getElementById('xp-mem-bar');
    if (mem) {
      const mVal = Math.floor(Math.random() * 10 + 35);
      mem.style.height = `${mVal}%`;
    }
  }, 1000);

  function updateClock() {
    const el = document.getElementById('xp-clock');
    if (!el) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    el.textContent = `${hours}:${minutes} ${ampm}`;
  }
  updateClock();
  setInterval(updateClock, 1000);

  // MSN Messenger 6.0 Implementation with Nudge
  (function initMsnMessenger() {
    const msgInput = document.getElementById('msn-msg-input');
    const sendBtn = document.getElementById('msn-btn-send');
    const nudgeBtn = document.getElementById('msn-btn-nudge');
    const msgBox = document.getElementById('msn-messages-box');
    const msnWin = document.getElementById('win-msn');

    function playMsnAlert() {
      initAudio();
      if (!audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } catch (e) {}
    }

    function playNudgeSound() {
      initAudio();
      if (!audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } catch (e) {}
    }

    function sendMessage() {
      if (!msgInput || !msgBox) return;
      const text = msgInput.value.trim();
      if (!text) return;
      msgInput.value = '';

      const userMsg = document.createElement('div');
      userMsg.style.marginBottom = '4px';
      userMsg.innerHTML = `<strong style="color:#0055ea;">Administrator:</strong> ${text}`;
      msgBox.appendChild(userMsg);
      msgBox.parentElement.scrollTop = msgBox.parentElement.scrollHeight;

      // Simulated buddy reply
      setTimeout(() => {
        playMsnAlert();
        const replies = [
          "¡Genial! Windows XP con tema Luna es el mejor sistema operativo.",
          "¿Has probado el juego 3D Pinball Space Cadet?",
          "¡Mira los nuevos iconos de 32-bit alpha blended que diseñó The Iconfactory!",
          "Estoy escuchando 'Symphony of Spring' en Windows Media Player."
        ];
        const rText = replies[Math.floor(Math.random() * replies.length)];
        const replyEl = document.createElement('div');
        replyEl.style.marginBottom = '4px';
        replyEl.innerHTML = `<strong style="color:#388e3c;">Bill Gates:</strong> ${rText}`;
        msgBox.appendChild(replyEl);
        msgBox.parentElement.scrollTop = msgBox.parentElement.scrollHeight;
      }, 1000);
    }

    sendBtn?.addEventListener('click', sendMessage);
    msgInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });

    nudgeBtn?.addEventListener('click', () => {
      playNudgeSound();
      if (msnWin) {
        msnWin.style.transition = 'transform 0.05s ease';
        let shakes = 6;
        const interval = setInterval(() => {
          const dx = (Math.random() - 0.5) * 16;
          const dy = (Math.random() - 0.5) * 16;
          msnWin.style.transform = `translate(${dx}px, ${dy}px)`;
          shakes--;
          if (shakes <= 0) {
            clearInterval(interval);
            msnWin.style.transform = 'translate(0, 0)';
          }
        }, 50);
      }
      const note = document.createElement('div');
      note.style.color = '#ff9900';
      note.style.fontWeight = 'bold';
      note.style.fontSize = '10px';
      note.textContent = '¡Has enviado un zumbido!';
      msgBox.appendChild(note);
      msgBox.parentElement.scrollTop = msgBox.parentElement.scrollHeight;
    });
  })();

  // Internet Explorer 6 Navigation
  (function initIE6() {
    const urlInput = document.getElementById('xp-ie-url');
    const goBtn = document.getElementById('xp-ie-go');
    const viewport = document.getElementById('xp-ie-viewport');

    function loadSite() {
      XpAudio.click();
      const val = urlInput.value.toLowerCase();
      if (val.includes('google')) {
        viewport.innerHTML = `
          <div style="text-align:center; padding:40px 10px;">
            <div style="font-family:'Times New Roman', serif; font-size:48px; font-weight:bold; margin-bottom:14px;">
              <span style="color:#174ea6;">G</span><span style="color:#ea4335;">o</span><span style="color:#fbbc04;">o</span><span style="color:#174ea6;">g</span><span style="color:#34a853;">l</span><span style="color:#ea4335;">e</span>
            </div>
            <input type="text" value="Windows XP Luna tips" style="width:340px; padding:4px 8px; border:1px solid #7f9db9;">
            <div style="margin-top:12px;">
              <button style="padding:4px 14px; cursor:pointer;">Google Search</button>
              <button style="padding:4px 14px; cursor:pointer; margin-left:6px;">I'm Feeling Lucky</button>
            </div>
          </div>
        `;
      } else {
        viewport.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #003399; padding-bottom:8px; margin-bottom:14px;">
            <div style="font-size:28px; font-weight:bold; color:#003399; font-family:'Segoe UI', sans-serif;">msn<span style="color:#ff3300;">.</span></div>
            <div style="font-size:11px; color:#555;">October 25, 2001 - Windows XP Official Launch</div>
          </div>
          <p style="font-size:13px; line-height:1.6;">Welcome to the official MSN homepage for Windows XP. Enjoy Luna visual styles, fast user switching, and Windows Media Player 9 series.</p>
        `;
      }
    }

    goBtn?.addEventListener('click', loadSite);
    urlInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') loadSite();
    });
  })();

  // Turn Off Computer Dialog Handlers
  document.getElementById('xp-menu-shutdown')?.addEventListener('click', () => {
    XpAudio.click();
    document.getElementById('xp-turnoff-modal')?.classList.remove('hidden');
    document.getElementById('xp-start-menu')?.classList.add('hidden');
  });

  document.getElementById('btn-xp-turnoff')?.addEventListener('click', () => {
    window.location.href = '../index.html';
  });

  document.getElementById('btn-xp-restart')?.addEventListener('click', () => {
    window.location.href = '../index.html';
  });

  document.getElementById('btn-xp-standby')?.addEventListener('click', () => {
    alert('System Entering Stand By...');
    document.getElementById('xp-turnoff-modal')?.classList.add('hidden');
  });

  // Windows XP Recycle Bin Handlers
  const emptyRecycleBtn = document.getElementById('xp-empty-recycle-btn');
  const restoreAllBtn = document.getElementById('xp-restore-all-btn');
  const recycleItems = document.getElementById('xp-recycle-items');
  const recycleIconImg = document.querySelector('.xp-icon[data-app="recycle"] .xp-icon-img');

  emptyRecycleBtn?.addEventListener('click', () => {
    XpAudio.click();
    if (recycleItems) {
      recycleItems.innerHTML = '<div style="color:#666; font-size:11px; padding:12px; text-align:center;">The Recycle Bin is empty.</div>';
    }
    if (recycleIconImg) {
      recycleIconImg.src = '../assets/icons/winxp/recycle_empty.png';
    }
  });

  restoreAllBtn?.addEventListener('click', () => {
    XpAudio.click();
    if (recycleItems) {
      recycleItems.innerHTML = `
        <div class="xp-recycle-row" style="display:flex; align-items:center; gap:8px; padding:4px; border-bottom:1px solid #f0f0f0;">
          <img src="../assets/icons/winxp/notepad.png" width="16" height="16" alt="">
          <span style="font-size:11px; flex:1;">old_notes_2001.txt</span>
          <span style="font-size:10px; color:#888;">C:\\Documents and Settings</span>
        </div>
        <div class="xp-recycle-row" style="display:flex; align-items:center; gap:8px; padding:4px; border-bottom:1px solid #f0f0f0;">
          <img src="../assets/icons/winxp/paint.png" width="16" height="16" alt="">
          <span style="font-size:11px; flex:1;">sketch_draft.bmp</span>
          <span style="font-size:10px; color:#888;">C:\\My Documents</span>
        </div>
      `;
    }
    if (recycleIconImg) {
      recycleIconImg.src = '../assets/icons/winxp/recycle_full.png';
    }
  });

  const hash = window.location.hash.replace('#', '');
  const query = new URLSearchParams(window.location.search).get('open');
  const targetApp = hash || query;
  if (targetApp) {
    targetApp.split(',').forEach(app => {
      const trimmed = app.trim();
      WindowManager.open(trimmed);
      if (trimmed === 'pinball') {
        SpaceCadetPinball.ball.launched = true;
        SpaceCadetPinball.ball.inChute = false;
        SpaceCadetPinball.ball.x = 160;
        SpaceCadetPinball.ball.y = 230;
        SpaceCadetPinball.ball.vx = 2;
        SpaceCadetPinball.ball.vy = -4;
        SpaceCadetPinball.addScore(12500);
      }
    });
  }
})();
