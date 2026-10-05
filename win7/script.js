/* Windows 7 Ultimate Aero Simulator Script */
(function () {
  'use strict';

  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  }

  const Win7Audio = {
    startup: function () {
      initAudio();
      if (!audioCtx) return;
      try {
        const notes = [
          { freq: 523.25, time: 0.0, dur: 2.0 },
          { freq: 659.25, time: 0.15, dur: 2.2 },
          { freq: 783.99, time: 0.3, dur: 2.5 },
          { freq: 987.77, time: 0.5, dur: 2.8 },
          { freq: 1174.66, time: 0.7, dur: 3.2 }
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
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.04);
      } catch (e) {}
    }
  };

  window.addEventListener('click', function playOnce() {
    Win7Audio.startup();
    window.removeEventListener('click', playOnce);
  }, { once: true });

  const clockCanvas = document.getElementById('gadget-clock-canvas');
  if (clockCanvas) {
    const ctx = clockCanvas.getContext('2d');
    const radius = clockCanvas.width / 2;

    function renderClock() {
      ctx.clearRect(0, 0, clockCanvas.width, clockCanvas.height);
      const now = new Date();
      let hr = now.getHours() % 12;
      let min = now.getMinutes();
      let sec = now.getSeconds();

      ctx.beginPath();
      ctx.arc(radius, radius, radius - 4, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();

      for (let n = 1; n <= 12; n++) {
        const a = (n * Math.PI) / 6;
        ctx.rotate(a);
        ctx.translate(0, -radius * 0.78);
        ctx.rotate(-a);
        ctx.fillStyle = '#333';
        ctx.font = '10px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText(n.toString(), radius, radius);
        ctx.rotate(a);
        ctx.translate(0, radius * 0.78);
        ctx.rotate(-a);
      }

      const hrPos = (hr * Math.PI / 6) + (min * Math.PI / (6 * 60));
      drawHand(ctx, hrPos, radius * 0.45, 3, '#111');
      const minPos = (min * Math.PI / 30) + (sec * Math.PI / (30 * 60));
      drawHand(ctx, minPos, radius * 0.7, 2, '#333');
      const secPos = (sec * Math.PI / 30);
      drawHand(ctx, secPos, radius * 0.8, 1, '#0099ff');
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

    setInterval(renderClock, 1000);
    renderClock();
  }

  const cpuFill = document.getElementById('cpu-fill');
  const cpuText = document.getElementById('cpu-pct');
  setInterval(() => {
    const pct = Math.floor(Math.random() * 45 + 15);
    if (cpuFill) cpuFill.style.width = `${pct}%`;
    if (cpuText) cpuText.textContent = `${pct}%`;
  }, 1500);

  function setupDraggable(el, handleSelector) {
    const handle = handleSelector ? el.querySelector(handleSelector) : el;
    if (!handle) return;

    let isDown = false;
    let sx = 0, sy = 0, ox = 0, oy = 0;

    function onDown(e) {
      if (e.target.closest('.aero-btn-ctrl') || e.target.closest('button')) return;
      isDown = true;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);
      sx = clientX;
      sy = clientY;
      ox = el.offsetLeft;
      oy = el.offsetTop;

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
      el.style.left = `${ox + (clientX - sx)}px`;
      el.style.top = `${Math.max(0, oy + (clientY - sy))}px`;
    }

    function onUp() {
      isDown = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onUp);
    }

    handle.addEventListener('mousedown', onDown);
    handle.addEventListener('touchstart', onDown, { passive: true });
  }

  document.querySelectorAll('.aero-window').forEach(w => setupDraggable(w, '.aero-titlebar'));
  const stickyNote = document.getElementById('sticky-note');
  if (stickyNote) setupDraggable(stickyNote, '.sticky-header');

  document.querySelectorAll('.sticky-color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const col = dot.getAttribute('data-col');
      const note = document.getElementById('sticky-note');
      if (note && col) note.style.background = col;
    });
  });

  document.getElementById('sticky-add-btn')?.addEventListener('click', () => {
    Win7Audio.click();
    const note = document.getElementById('sticky-note');
    if (note) {
      const clone = note.cloneNode(true);
      clone.style.top = '120px';
      clone.style.left = '320px';
      setupDraggable(clone, '.sticky-header');
      document.getElementById('win7-desktop')?.appendChild(clone);
    }
  });

  const calcDisplay = document.getElementById('win7-calc-display');
  let cVal = '0';
  let cPrev = null;
  let cOp = null;
  let cReset = false;
  let cMem = 0;

  document.querySelectorAll('.w7-cbtn').forEach(btn => {
    btn.addEventListener('click', () => {
      Win7Audio.click();
      const val = btn.getAttribute('data-val');

      if (!isNaN(val) || val === '.') {
        if (cReset || cVal === '0') {
          cVal = val === '.' ? '0.' : val;
          cReset = false;
        } else {
          cVal += val;
        }
        if (calcDisplay) calcDisplay.value = cVal;
      } else if (val === 'C' || val === 'CE') {
        cVal = '0';
        cPrev = null;
        cOp = null;
        if (calcDisplay) calcDisplay.value = '0';
      } else if (val === '±') {
        cVal = String(parseFloat(cVal) * -1);
        if (calcDisplay) calcDisplay.value = cVal;
      } else if (val === 'MC') {
        cMem = 0;
      } else if (val === 'MR') {
        cVal = String(cMem);
        if (calcDisplay) calcDisplay.value = cVal;
      } else if (val === 'MS') {
        cMem = parseFloat(cVal);
      } else if (val === 'M+') {
        cMem += parseFloat(cVal);
      } else if (val === '=') {
        if (cPrev !== null && cOp) {
          const a = parseFloat(cPrev);
          const b = parseFloat(cVal);
          let res = 0;
          if (cOp === '+') res = a + b;
          if (cOp === '-') res = a - b;
          if (cOp === '*') res = a * b;
          if (cOp === '/') res = b !== 0 ? a / b : 'Error';
          cVal = String(res);
          cPrev = null;
          cOp = null;
          cReset = true;
          if (calcDisplay) calcDisplay.value = cVal;
        }
      } else {
        cPrev = cVal;
        cOp = val;
        cReset = true;
      }
    });
  });

  const paintCanvas = document.getElementById('paint-canvas');
  if (paintCanvas) {
    const pctx = paintCanvas.getContext('2d');
    let isDrawing = false;
    let currentTool = 'pencil';
    let currentColor = '#0284c7';
    let startX = 0, startY = 0;

    document.querySelectorAll('.w7-paint-tool[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.w7-paint-tool[data-tool]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.getAttribute('data-tool');
      });
    });

    document.getElementById('paint-color-picker')?.addEventListener('input', (e) => {
      currentColor = e.target.value;
    });

    document.getElementById('paint-clear-btn')?.addEventListener('click', () => {
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

  const wmpBars = document.getElementById('wmp-bars');
  if (wmpBars) {
    for (let i = 0; i < 24; i++) {
      const bar = document.createElement('div');
      bar.style.width = '10px';
      bar.style.height = '15px';
      bar.style.background = 'linear-gradient(180deg, #38bdf8, #1e3a8a)';
      bar.style.borderRadius = '2px';
      bar.style.transition = 'height 0.12s ease';
      wmpBars.appendChild(bar);
    }

    let isPlaying = false;
    let visTimer = null;
    const playToggle = document.getElementById('wmp-play-toggle');

    playToggle?.addEventListener('click', () => {
      isPlaying = !isPlaying;
      playToggle.textContent = isPlaying ? '⏸' : '▶';
      if (isPlaying) {
        initAudio();
        visTimer = setInterval(() => {
          Array.from(wmpBars.children).forEach(b => {
            const h = Math.floor(Math.random() * 120 + 10);
            b.style.height = `${h}px`;
          });
        }, 120);
      } else {
        clearInterval(visTimer);
        Array.from(wmpBars.children).forEach(b => {
          b.style.height = '15px';
        });
      }
    });
  }

  let topZIndex = 50;

  function openWin(winId) {
    Win7Audio.click();
    const win = document.getElementById(winId);
    if (win) {
      win.classList.remove('hidden');
      win.style.zIndex = ++topZIndex;
    }
    const sup = document.querySelector(`.superbar-item[data-win="${winId}"]`);
    if (sup) sup.classList.add('active');
  }

  function closeWin(winId) {
    Win7Audio.click();
    const win = document.getElementById(winId);
    if (win) win.classList.add('hidden');
    const sup = document.querySelector(`.superbar-item[data-win="${winId}"]`);
    if (sup) sup.classList.remove('active');
  }

  document.querySelectorAll('.win7-icon[data-win]').forEach(icon => {
    icon.addEventListener('dblclick', () => {
      openWin(icon.getAttribute('data-win'));
    });
  });

  document.querySelectorAll('.superbar-item[data-win]').forEach(item => {
    item.addEventListener('click', () => {
      const winId = item.getAttribute('data-win');
      const win = document.getElementById(winId);
      if (win && !win.classList.contains('hidden') && win.style.zIndex == topZIndex) {
        win.classList.add('hidden');
        item.classList.remove('active');
      } else {
        openWin(winId);
      }
    });
  });

  document.querySelectorAll('.aero-btn-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const win = e.target.closest('.aero-window');
      if (win) closeWin(win.id);
    });
  });

  document.querySelectorAll('.aero-btn-min').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const win = e.target.closest('.aero-window');
      if (win) {
        win.classList.add('hidden');
        const sup = document.querySelector(`.superbar-item[data-win="${win.id}"]`);
        if (sup) sup.classList.remove('active');
      }
    });
  });

  document.querySelectorAll('.aero-window').forEach(win => {
    win.addEventListener('mousedown', () => {
      win.style.zIndex = ++topZIndex;
    });
  });

  const orb = document.getElementById('win7-orb');
  const menu = document.getElementById('win7-menu');

  orb?.addEventListener('click', (e) => {
    e.stopPropagation();
    Win7Audio.click();
    menu?.classList.toggle('hidden');
  });

  window.addEventListener('click', () => {
    if (!menu?.classList.contains('hidden')) {
      menu?.classList.add('hidden');
    }
  });

  menu?.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  document.querySelectorAll('.win7-menu-item[data-win]').forEach(item => {
    item.addEventListener('click', () => {
      const winId = item.getAttribute('data-win');
      if (winId) openWin(winId);
      menu?.classList.add('hidden');
    });
  });

  document.getElementById('btn-show-desktop')?.addEventListener('click', () => {
    Win7Audio.click();
    document.querySelectorAll('.aero-window').forEach(w => w.classList.add('hidden'));
    document.querySelectorAll('.superbar-item').forEach(s => s.classList.remove('active'));
  });

  const searchInput = document.getElementById('win7-search-input');
  searchInput?.addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase().trim();
    document.querySelectorAll('#win7-start-list .win7-menu-item').forEach(it => {
      const txt = it.textContent.toLowerCase();
      it.style.display = txt.includes(q) ? 'flex' : 'none';
    });
  });

  const btnArrow = document.getElementById('btn-win7-arrow');
  const shutMenu = document.getElementById('win7-shut-menu');
  btnArrow?.addEventListener('click', (e) => {
    e.stopPropagation();
    shutMenu?.classList.toggle('hidden');
  });

  function performRestart() {
    Win7Audio.click();
    const restartScreen = document.getElementById('win7-restart-screen');
    if (restartScreen) {
      restartScreen.classList.remove('hidden');
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1600);
    } else {
      window.location.href = '../index.html';
    }
  }

  document.getElementById('btn-win7-shut')?.addEventListener('click', performRestart);
  document.getElementById('win7-action-restart')?.addEventListener('click', performRestart);
  document.getElementById('win7-action-shutdown')?.addEventListener('click', performRestart);

  /* Snipping Tool (Herramienta Recortes) */
  const snipCanvas = document.getElementById('snip-canvas');
  let sctx = snipCanvas ? snipCanvas.getContext('2d') : null;
  const snipOverlay = document.getElementById('snip-overlay');
  const snipRect = document.getElementById('snip-rect');
  const snipNewBtn = document.getElementById('snip-new-btn');
  const snipPenBtn = document.getElementById('snip-pen-btn');
  const snipHighlighterBtn = document.getElementById('snip-highlighter-btn');
  const snipClearBtn = document.getElementById('snip-clear-btn');

  let snipTool = 'pen'; // 'pen' | 'highlighter'
  let snipDrawing = false;

  function initSnipDefault() {
    if (!sctx || !snipCanvas) return;
    sctx.fillStyle = '#f8fafc';
    sctx.fillRect(0, 0, snipCanvas.width, snipCanvas.height);
    // Draw sample captured preview
    sctx.fillStyle = '#0284c7';
    sctx.fillRect(20, 20, snipCanvas.width - 40, 30);
    sctx.fillStyle = '#ffffff';
    sctx.font = 'bold 12px Segoe UI';
    sctx.fillText('Captura de pantalla de Windows 7 Ultimate', 30, 40);
    sctx.fillStyle = '#334155';
    sctx.font = '11px Segoe UI';
    sctx.fillText('Utiliza las herramientas superiores para anotar o resaltar con el lápiz.', 30, 80);
    sctx.fillText('Haz clic en "Nuevo" para realizar un nuevo recorte de pantalla.', 30, 105);
  }
  initSnipDefault();

  snipNewBtn?.addEventListener('click', () => {
    Win7Audio.click();
    snipOverlay?.classList.remove('hidden');
  });

  let isSnipping = false;
  let sStartX = 0, sStartY = 0;

  snipOverlay?.addEventListener('mousedown', (e) => {
    isSnipping = true;
    sStartX = e.clientX;
    sStartY = e.clientY;
    if (snipRect) {
      snipRect.style.left = `${sStartX}px`;
      snipRect.style.top = `${sStartY}px`;
      snipRect.style.width = '0px';
      snipRect.style.height = '0px';
      snipRect.style.display = 'block';
    }
  });

  window.addEventListener('mousemove', (e) => {
    if (!isSnipping || !snipRect) return;
    const curX = e.clientX;
    const curY = e.clientY;
    const left = Math.min(sStartX, curX);
    const top = Math.min(sStartY, curY);
    const width = Math.abs(curX - sStartX);
    const height = Math.abs(curY - sStartY);
    snipRect.style.left = `${left}px`;
    snipRect.style.top = `${top}px`;
    snipRect.style.width = `${width}px`;
    snipRect.style.height = `${height}px`;
  });

  window.addEventListener('mouseup', (e) => {
    if (!isSnipping) return;
    isSnipping = false;
    snipOverlay?.classList.add('hidden');
    if (snipRect) snipRect.style.display = 'none';

    // Render new capture in snipCanvas
    if (sctx && snipCanvas) {
      sctx.fillStyle = '#0f172a';
      sctx.fillRect(0, 0, snipCanvas.width, snipCanvas.height);
      const grad = sctx.createLinearGradient(0, 0, snipCanvas.width, snipCanvas.height);
      grad.addColorStop(0, '#024285');
      grad.addColorStop(1, '#001a38');
      sctx.fillStyle = grad;
      sctx.fillRect(2, 2, snipCanvas.width - 4, snipCanvas.height - 4);

      sctx.fillStyle = 'rgba(255,255,255,0.85)';
      sctx.font = 'bold 13px Segoe UI';
      sctx.fillText('Área capturada del escritorio (' + Math.round(e.clientX - sStartX) + ' × ' + Math.round(e.clientY - sStartY) + ' px)', 16, 32);

      sctx.fillStyle = 'rgba(255,255,255,0.6)';
      sctx.font = '11px Segoe UI';
      sctx.fillText('Recorte completado con éxito a las ' + new Date().toLocaleTimeString(), 16, 56);
      sctx.strokeStyle = '#38bdf8';
      sctx.lineWidth = 1;
      sctx.strokeRect(16, 75, snipCanvas.width - 32, 120);
      sctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      sctx.fillRect(16, 75, snipCanvas.width - 32, 120);
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !snipOverlay?.classList.contains('hidden')) {
      isSnipping = false;
      snipOverlay?.classList.add('hidden');
      if (snipRect) snipRect.style.display = 'none';
    }
  });

  snipPenBtn?.addEventListener('click', () => {
    snipTool = 'pen';
    snipPenBtn.style.background = '#e2e8f0';
    if (snipHighlighterBtn) snipHighlighterBtn.style.background = '#fff';
  });

  snipHighlighterBtn?.addEventListener('click', () => {
    snipTool = 'highlighter';
    snipHighlighterBtn.style.background = '#e2e8f0';
    if (snipPenBtn) snipPenBtn.style.background = '#fff';
  });

  snipClearBtn?.addEventListener('click', () => {
    initSnipDefault();
  });

  if (snipCanvas && sctx) {
    snipCanvas.addEventListener('mousedown', (e) => {
      snipDrawing = true;
      sctx.beginPath();
      sctx.moveTo(e.offsetX, e.offsetY);
    });
    snipCanvas.addEventListener('mousemove', (e) => {
      if (!snipDrawing) return;
      if (snipTool === 'pen') {
        sctx.strokeStyle = '#ef4444';
        sctx.lineWidth = 2;
        sctx.lineCap = 'round';
        sctx.lineTo(e.offsetX, e.offsetY);
        sctx.stroke();
      } else {
        sctx.strokeStyle = 'rgba(250, 204, 21, 0.35)';
        sctx.lineWidth = 12;
        sctx.lineCap = 'square';
        sctx.lineTo(e.offsetX, e.offsetY);
        sctx.stroke();
      }
    });
    window.addEventListener('mouseup', () => {
      snipDrawing = false;
    });
  }

  /* Aero Peek Window Thumbnail Preview */
  const peekPopup = document.getElementById('aero-peek-popup');
  const peekTitle = document.getElementById('peek-title');
  const peekContent = document.getElementById('peek-content');

  document.querySelectorAll('.superbar-item[data-win]').forEach(item => {
    item.addEventListener('mouseenter', () => {
      const winId = item.getAttribute('data-win');
      const win = document.getElementById(winId);
      if (win && !win.classList.contains('hidden') && peekPopup) {
        const title = win.querySelector('.aero-titlebar span')?.textContent || 'Ventana';
        if (peekTitle) peekTitle.textContent = title;
        if (peekContent) {
          peekContent.innerHTML = `<strong>${title}</strong><br><span style="color:#64748b; font-size:9px;">Hacer clic para activar</span>`;
        }
        const rect = item.getBoundingClientRect();
        peekPopup.style.left = `${Math.max(10, rect.left - 40)}px`;
        peekPopup.classList.remove('hidden');
      }
    });

    item.addEventListener('mouseleave', () => {
      peekPopup?.classList.add('hidden');
    });
  });

  function updateClock() {
    const el = document.getElementById('win7-clock');
    if (!el) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    el.innerHTML = `${hours}:${minutes} ${ampm}<br><span style="font-size:10px; opacity:0.8;">${now.toLocaleDateString()}</span>`;
  }
  updateClock();
  setInterval(updateClock, 1000);
})();
