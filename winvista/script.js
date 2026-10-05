/* Windows Vista Ultimate Aero Simulator Script */
(function () {
  'use strict';

  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  }

  const VistaAudio = {
    startup: function () {
      initAudio();
      if (!audioCtx) return;
      try {
        const notes = [
          { freq: 523.25, time: 0.0, dur: 2.5 },
          { freq: 659.25, time: 0.15, dur: 2.8 },
          { freq: 783.99, time: 0.35, dur: 3.0 },
          { freq: 1046.50, time: 0.55, dur: 3.5 }
        ];

        notes.forEach(n => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(n.freq, audioCtx.currentTime + n.time);

          gain.gain.setValueAtTime(0.001, audioCtx.currentTime + n.time);
          gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + n.time + 0.1);
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
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.03);
      } catch (e) {}
    }
  };

  window.addEventListener('click', function playOnce() {
    VistaAudio.startup();
    window.removeEventListener('click', playOnce);
  }, { once: true });

  const clockCanvas = document.getElementById('vista-clock-canvas');
  if (clockCanvas) {
    const ctx = clockCanvas.getContext('2d');
    const radius = clockCanvas.width / 2;

    function renderClock() {
      ctx.clearRect(0, 0, clockCanvas.width, clockCanvas.height);
      const now = new Date();
      let hr = now.getHours() % 12;
      let min = now.getMinutes();
      let sec = now.getSeconds();
      let ms = now.getMilliseconds();

      ctx.beginPath();
      ctx.arc(radius, radius, radius - 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(15, 25, 40, 0.85)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      for (let n = 1; n <= 12; n++) {
        const a = (n * Math.PI) / 6;
        ctx.rotate(a);
        ctx.translate(0, -radius * 0.78);
        ctx.rotate(-a);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Segoe UI';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.toString(), radius, radius);
        ctx.rotate(a);
        ctx.translate(0, radius * 0.78);
        ctx.rotate(-a);
      }

      const hrPos = (hr * Math.PI / 6) + (min * Math.PI / (6 * 60));
      drawHand(ctx, hrPos, radius * 0.48, 2.5, '#ffffff');

      const minPos = (min * Math.PI / 30) + (sec * Math.PI / (30 * 60));
      drawHand(ctx, minPos, radius * 0.72, 1.8, '#38bdf8');

      const smoothSec = sec + (ms / 1000);
      const secPos = (smoothSec * Math.PI / 30);
      drawHand(ctx, secPos, radius * 0.82, 1, '#f59e0b');

      requestAnimationFrame(renderClock);
    }

    function drawHand(context, pos, len, width, col) {
      context.beginPath();
      context.lineWidth = width;
      context.lineCap = 'round';
      context.strokeStyle = col;
      context.moveTo(radius, radius);
      context.lineTo(radius + len * Math.sin(pos), radius - len * Math.cos(pos));
      context.stroke();
    }

    requestAnimationFrame(renderClock);
  }

  setInterval(() => {
    const cpuPct = Math.floor(Math.random() * 45 + 15);
    const ramPct = Math.floor(Math.random() * 20 + 38);

    const cpuAngle = -120 + (cpuPct / 100) * 240;
    const ramAngle = -120 + (ramPct / 100) * 240;

    const cpuNeedle = document.getElementById('vista-cpu-needle');
    if (cpuNeedle) cpuNeedle.setAttribute('transform', `rotate(${cpuAngle} 25 25)`);
    const cpuText = document.getElementById('vista-cpu-text');
    if (cpuText) cpuText.textContent = `CPU ${cpuPct}%`;

    const ramNeedle = document.getElementById('vista-ram-needle');
    if (ramNeedle) ramNeedle.setAttribute('transform', `rotate(${ramAngle} 25 25)`);
    const ramText = document.getElementById('vista-ram-text');
    if (ramText) ramText.textContent = `RAM ${ramPct}%`;
  }, 1200);

  const samplePictures = [
    {
      title: 'Desert Landscape.jpg',
      svg: `<svg viewBox="0 0 400 250" style="width:100%; height:100%; border-radius:4px;"><defs><linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0284c7"/><stop offset="100%" stop-color="#f59e0b"/></linearGradient></defs><rect width="400" height="250" fill="url(#sky1)"/><circle cx="320" cy="80" r="35" fill="#fef08a"/><polygon points="0,250 120,130 250,250" fill="#b45309"/><polygon points="180,250 300,100 400,250" fill="#9a3412"/><path d="M0 200 Q 150 160 400 220 L 400 250 L 0 250 Z" fill="#d97706"/></svg>`
    },
    {
      title: 'Hydrangeas.jpg',
      svg: `<svg viewBox="0 0 400 250" style="width:100%; height:100%; border-radius:4px;"><rect width="400" height="250" fill="#065f46"/><circle cx="160" cy="120" r="60" fill="#3b82f6" opacity="0.9"/><circle cx="240" cy="110" r="65" fill="#8b5cf6" opacity="0.9"/><circle cx="200" cy="160" r="55" fill="#ec4899" opacity="0.85"/><circle cx="140" cy="150" r="10" fill="#fff" opacity="0.7"/><circle cx="250" cy="120" r="10" fill="#fff" opacity="0.7"/></svg>`
    },
    {
      title: 'Jellyfish.jpg',
      svg: `<svg viewBox="0 0 400 250" style="width:100%; height:100%; border-radius:4px;"><rect width="400" height="250" fill="#050814"/><ellipse cx="200" cy="90" rx="70" ry="50" fill="#f43f5e" opacity="0.8"/><ellipse cx="200" cy="85" rx="50" ry="30" fill="#fda4af" opacity="0.6"/><path d="M160 130 Q 150 200 170 240 M180 130 Q 190 210 180 245 M200 135 Q 210 190 200 240 M220 130 Q 210 200 230 245 M240 130 Q 250 190 230 235" stroke="#f43f5e" stroke-width="3" fill="none" opacity="0.75"/></svg>`
    },
    {
      title: 'Lighthouse.jpg',
      svg: `<svg viewBox="0 0 400 250" style="width:100%; height:100%; border-radius:4px;"><rect width="400" height="250" fill="#0f172a"/><polygon points="260,110 0,60 0,160" fill="#fef08a" opacity="0.45"/><polygon points="250,220 270,220 265,110 255,110" fill="#e2e8f0"/><rect x="252" y="140" width="16" height="20" fill="#dc2626"/><rect x="253" y="180" width="14" height="20" fill="#dc2626"/><circle cx="260" cy="110" r="8" fill="#facc15"/><rect y="210" width="400" height="40" fill="#0284c7"/></svg>`
    }
  ];

  let currentPicIdx = 0;
  let currentZoom = 1.0;
  let currentRot = 0;
  let slideTimer = null;

  function renderGalleryPicture() {
    const mainView = document.getElementById('gallery-main-view');
    const titleEl = document.getElementById('gallery-pic-title');
    const pic = samplePictures[currentPicIdx];
    if (mainView && pic) {
      mainView.innerHTML = pic.svg;
      mainView.style.transform = `scale(${currentZoom}) rotate(${currentRot}deg)`;
    }
    if (titleEl && pic) {
      titleEl.textContent = pic.title;
    }
  }

  renderGalleryPicture();

  document.getElementById('btn-gallery-next')?.addEventListener('click', () => {
    VistaAudio.click();
    currentPicIdx = (currentPicIdx + 1) % samplePictures.length;
    renderGalleryPicture();
  });

  document.getElementById('btn-gallery-prev')?.addEventListener('click', () => {
    VistaAudio.click();
    currentPicIdx = (currentPicIdx - 1 + samplePictures.length) % samplePictures.length;
    renderGalleryPicture();
  });

  document.getElementById('btn-gallery-zoom-in')?.addEventListener('click', () => {
    currentZoom = Math.min(2.0, currentZoom + 0.2);
    renderGalleryPicture();
  });

  document.getElementById('btn-gallery-zoom-out')?.addEventListener('click', () => {
    currentZoom = Math.max(0.6, currentZoom - 0.2);
    renderGalleryPicture();
  });

  document.getElementById('btn-gallery-rot-r')?.addEventListener('click', () => {
    currentRot = (currentRot + 90) % 360;
    renderGalleryPicture();
  });

  document.getElementById('btn-gallery-rot-l')?.addEventListener('click', () => {
    currentRot = (currentRot - 90 + 360) % 360;
    renderGalleryPicture();
  });

  document.getElementById('btn-gallery-play')?.addEventListener('click', () => {
    VistaAudio.click();
    if (slideTimer) {
      clearInterval(slideTimer);
      slideTimer = null;
      document.getElementById('btn-gallery-play').textContent = '▶';
    } else {
      document.getElementById('btn-gallery-play').textContent = '⏸';
      slideTimer = setInterval(() => {
        currentPicIdx = (currentPicIdx + 1) % samplePictures.length;
        renderGalleryPicture();
      }, 2000);
    }
  });

  let slideBoxIdx = 0;
  setInterval(() => {
    slideBoxIdx = (slideBoxIdx + 1) % samplePictures.length;
    const box = document.getElementById('vista-slideshow-box');
    if (box) box.innerHTML = samplePictures[slideBoxIdx].svg;
  }, 4000);

  document.querySelectorAll('.mc-item').forEach(item => {
    item.addEventListener('click', () => {
      VistaAudio.click();
      document.querySelectorAll('.mc-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  let highestZ = 100;
  const activeTabs = new Map();

  function bringFront(win) {
    highestZ += 2;
    win.style.zIndex = highestZ;
    document.querySelectorAll('.vista-titlebar').forEach(t => t.classList.add('inactive'));
    win.querySelector('.vista-titlebar')?.classList.remove('inactive');
    const winId = win.id;
    activeTabs.forEach((tab, id) => {
      if (id === winId) tab.classList.add('active');
      else tab.classList.remove('active');
    });
  }

  function openWindow(winId) {
    VistaAudio.click();
    const win = document.getElementById(winId);
    if (!win) return;
    win.classList.remove('hidden');
    bringFront(win);

    if (!activeTabs.has(winId)) {
      const tab = document.createElement('div');
      tab.className = 'vista-tab active';
      tab.setAttribute('data-id', winId);
      const title = win.querySelector('.vista-titlebar span')?.textContent || winId;
      tab.innerHTML = `<span style="font-weight:600;">${title}</span>`;
      tab.addEventListener('click', () => {
        if (!win.classList.contains('hidden') && win.style.zIndex == highestZ) {
          win.classList.add('hidden');
          tab.classList.remove('active');
        } else {
          win.classList.remove('hidden');
          bringFront(win);
        }
      });
      document.getElementById('vista-tabs')?.appendChild(tab);
      activeTabs.set(winId, tab);
    }
  }

  function closeWindow(winId) {
    VistaAudio.click();
    const win = document.getElementById(winId);
    if (win) win.classList.add('hidden');
    const tab = activeTabs.get(winId);
    if (tab) tab.remove();
    activeTabs.delete(winId);
  }

  document.querySelectorAll('.vista-icon[data-win]').forEach(icon => {
    icon.addEventListener('dblclick', () => {
      openWindow(icon.getAttribute('data-win'));
    });
    icon.addEventListener('click', () => {
      document.querySelectorAll('.vista-icon').forEach(i => i.style.background = 'transparent');
      icon.style.background = 'rgba(255,255,255,0.2)';
    });
  });

  document.querySelectorAll('.vista-ctrl-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const win = e.target.closest('.vista-window');
      if (win) closeWindow(win.id);
    });
  });

  document.querySelectorAll('.vista-ctrl-min').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const win = e.target.closest('.vista-window');
      if (win) {
        win.classList.add('hidden');
        const tab = activeTabs.get(win.id);
        if (tab) tab.classList.remove('active');
      }
    });
  });

  function setupDraggable(win) {
    const bar = win.querySelector('.vista-titlebar');
    if (!bar) return;

    let isDown = false;
    let sx = 0, sy = 0, ox = 0, oy = 0;

    function onDown(e) {
      if (e.target.closest('.vista-ctrl-btn')) return;
      bringFront(win);
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
    win.addEventListener('mousedown', () => bringFront(win));
  }

  document.querySelectorAll('.vista-window').forEach(setupDraggable);

  const startOrb = document.getElementById('vista-orb');
  const startMenu = document.getElementById('vista-start-menu');

  startOrb?.addEventListener('click', (e) => {
    e.stopPropagation();
    VistaAudio.click();
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

  document.querySelectorAll('.vista-menu-item[data-win]').forEach(item => {
    item.addEventListener('click', () => {
      const winId = item.getAttribute('data-win');
      if (winId) openWindow(winId);
      startMenu?.classList.add('hidden');
    });
  });

  const searchInput = document.getElementById('vista-search-input');
  searchInput?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    document.querySelectorAll('#vista-menu-programs-list .vista-menu-item').forEach(it => {
      const txt = it.textContent.toLowerCase();
      it.style.display = txt.includes(q) ? 'flex' : 'none';
    });
  });

  const shutDialog = document.getElementById('vista-shutdown-dialog');
  document.getElementById('vista-power-btn')?.addEventListener('click', () => {
    VistaAudio.click();
    shutDialog?.classList.remove('hidden');
    startMenu?.classList.add('hidden');
  });

  document.getElementById('btn-vista-shut-cancel')?.addEventListener('click', () => {
    shutDialog?.classList.add('hidden');
  });

  document.getElementById('btn-vista-shut-ok')?.addEventListener('click', () => {
    window.location.href = '../index.html';
  });

  function updateClock() {
    const el = document.getElementById('vista-clock');
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

  // Flip 3D Implementation
  (function initFlip3D() {
    const flipBtn = document.getElementById('btn-flip-3d');
    const flipModal = document.getElementById('vista-flip3d-modal');
    const closeBtn = document.getElementById('btn-flip3d-close');
    const cards = document.querySelectorAll('.flip-card');
    let activeCard = 0;

    function cycleCards() {
      VistaAudio.click();
      activeCard = (activeCard + 1) % cards.length;
      cards.forEach((c, idx) => {
        const offset = (idx - activeCard + cards.length) % cards.length;
        const z = 80 - offset * 80;
        const x = -offset * 50;
        const y = -offset * 20;
        c.style.transform = `rotateY(-30deg) translateZ(${z}px) translateX(${x}px) translateY(${y}px)`;
        c.style.opacity = offset === 0 ? '1' : '0.75';
      });
    }

    flipBtn?.addEventListener('click', () => {
      VistaAudio.click();
      flipModal?.classList.remove('hidden');
    });

    closeBtn?.addEventListener('click', () => {
      flipModal?.classList.add('hidden');
    });

    flipModal?.addEventListener('click', (e) => {
      if (e.target.closest('.flip-card')) {
        cycleCards();
      } else if (e.target === flipModal) {
        flipModal.classList.add('hidden');
      }
    });

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.altKey) && e.key === 'Tab') {
        e.preventDefault();
        if (flipModal?.classList.contains('hidden')) {
          flipModal.classList.remove('hidden');
        } else {
          cycleCards();
        }
      }
    });
  })();

  // User Account Control (UAC) Prompt
  (function initUAC() {
    const uacModal = document.getElementById('vista-uac-modal');
    document.getElementById('btn-uac-continue')?.addEventListener('click', () => {
      VistaAudio.click();
      uacModal?.classList.add('hidden');
    });
    document.getElementById('btn-uac-cancel')?.addEventListener('click', () => {
      VistaAudio.click();
      uacModal?.classList.add('hidden');
    });
  })();

  // Media Center item selection
  document.querySelectorAll('.mc-item').forEach(item => {
    item.addEventListener('click', () => {
      VistaAudio.click();
      document.querySelectorAll('.mc-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
})();
