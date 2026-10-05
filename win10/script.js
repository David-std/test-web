/* Windows 10 Pro Script */
(function () {
  'use strict';

  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  }

  function playSound(type = 'click') {
    initAudio();
    if (!audioCtx) return;
    try {
      if (type === 'start') {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.18);
      } else {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(650, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.03);
      }
    } catch (e) {}
  }

  let topZIndex = 100;
  const startBtn = document.getElementById('w10-start-btn');
  const startMenu = document.getElementById('w10-start-menu');
  const powerBtn = document.getElementById('w10-power-btn');
  const powerMenu = document.getElementById('w10-power-menu');
  const actionCenterBtn = document.getElementById('w10-action-center-btn');
  const actionCenter = document.getElementById('w10-action-center');

  startBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    playSound('start');
    startMenu?.classList.toggle('hidden');
    actionCenter?.classList.remove('open');
  });

  powerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    playSound();
    powerMenu?.classList.toggle('hidden');
  });

  actionCenterBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    playSound();
    actionCenter?.classList.toggle('open');
    startMenu?.classList.add('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#w10-start-menu') && !e.target.closest('#w10-start-btn')) {
      startMenu?.classList.add('hidden');
      powerMenu?.classList.add('hidden');
    }
    if (!e.target.closest('#w10-action-center') && !e.target.closest('#w10-action-center-btn')) {
      actionCenter?.classList.remove('open');
    }
  });

  function performRestart() {
    playSound('start');
    const restartScreen = document.getElementById('w10-restart-screen');
    if (restartScreen) {
      restartScreen.classList.remove('hidden');
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1600);
    } else {
      window.location.href = '../index.html';
    }
  }

  document.getElementById('w10-action-restart')?.addEventListener('click', performRestart);
  document.getElementById('w10-action-shutdown')?.addEventListener('click', performRestart);
  document.getElementById('w10-action-sleep')?.addEventListener('click', () => {
    powerMenu?.classList.add('hidden');
  });

  function updateTaskbarActiveStates() {
    document.querySelectorAll('.w10-task-item').forEach(item => {
      const winId = item.getAttribute('data-win');
      if (!winId) return;
      const win = document.getElementById(winId);
      if (win && !win.classList.contains('hidden')) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  function openWindow(winId) {
    playSound();
    startMenu?.classList.add('hidden');
    const win = document.getElementById(winId);
    if (win) {
      if (win.classList.contains('hidden')) {
        win.classList.remove('hidden');
      }
      win.style.zIndex = ++topZIndex;
      updateTaskbarActiveStates();
    }
  }

  function toggleWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    if (win.classList.contains('hidden')) {
      openWindow(winId);
    } else if (parseInt(win.style.zIndex || '100', 10) === topZIndex) {
      win.classList.add('hidden');
      updateTaskbarActiveStates();
    } else {
      win.style.zIndex = ++topZIndex;
      updateTaskbarActiveStates();
    }
  }

  document.querySelectorAll('.w10-task-item').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const winId = btn.getAttribute('data-win');
      if (winId) toggleWindow(winId);
    });
  });

  document.querySelectorAll('.w10-icon[data-win]').forEach(el => {
    el.addEventListener('click', () => {
      const winId = el.getAttribute('data-win');
      if (winId) openWindow(winId);
    });
  });

  document.querySelectorAll('.start-app-row[data-win]').forEach(el => {
    el.addEventListener('click', () => {
      const winId = el.getAttribute('data-win');
      if (winId) openWindow(winId);
    });
  });

  document.querySelectorAll('.tile-10[data-win]').forEach(el => {
    el.addEventListener('click', () => {
      const winId = el.getAttribute('data-win');
      if (winId) openWindow(winId);
    });
  });

  document.querySelectorAll('.w10-ctrl-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      playSound();
      const win = e.target.closest('.w10-window');
      if (win) {
        win.classList.add('hidden');
        updateTaskbarActiveStates();
      }
    });
  });

  document.querySelectorAll('.w10-ctrl-min').forEach(btn => {
    btn.addEventListener('click', (e) => {
      playSound();
      const win = e.target.closest('.w10-window');
      if (win) {
        win.classList.add('hidden');
        updateTaskbarActiveStates();
      }
    });
  });

  document.querySelectorAll('.w10-ctrl-max').forEach(btn => {
    btn.addEventListener('click', (e) => {
      playSound();
      const win = e.target.closest('.w10-window');
      if (win) {
        if (win.getAttribute('data-maximized') === 'true') {
          win.style.top = win.getAttribute('data-prev-top') || '60px';
          win.style.left = win.getAttribute('data-prev-left') || '150px';
          win.style.width = win.getAttribute('data-prev-width') || '640px';
          win.style.height = win.getAttribute('data-prev-height') || '420px';
          win.removeAttribute('data-maximized');
        } else {
          win.setAttribute('data-prev-top', win.style.top);
          win.setAttribute('data-prev-left', win.style.left);
          win.setAttribute('data-prev-width', win.style.width);
          win.setAttribute('data-prev-height', win.style.height);
          win.style.top = '0px';
          win.style.left = '0px';
          win.style.width = '100vw';
          win.style.height = 'calc(100vh - 40px)';
          win.setAttribute('data-maximized', 'true');
        }
      }
    });
  });

  document.querySelectorAll('.w10-window').forEach(win => {
    win.addEventListener('mousedown', () => {
      win.style.zIndex = ++topZIndex;
      updateTaskbarActiveStates();
    });

    const handle = win.querySelector('.w10-titlebar');
    if (!handle) return;

    let isDown = false;
    let sx = 0, sy = 0, ox = 0, oy = 0;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('.w10-controls')) return;
      if (win.getAttribute('data-maximized') === 'true') return;
      isDown = true;
      sx = e.clientX;
      sy = e.clientY;
      ox = win.offsetLeft;
      oy = win.offsetTop;

      function onMove(ev) {
        if (!isDown) return;
        win.style.left = `${ox + (ev.clientX - sx)}px`;
        win.style.top = `${Math.max(0, oy + (ev.clientY - sy))}px`;
      }

      function onUp() {
        isDown = false;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  });

  document.getElementById('w10-show-desktop')?.addEventListener('click', () => {
    playSound();
    document.querySelectorAll('.w10-window').forEach(w => w.classList.add('hidden'));
    updateTaskbarActiveStates();
  });

  function updateClock() {
    const el = document.getElementById('w10-clock');
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

  /* Calculadora de Windows 10 */
  let calcCurrent = '0';
  let calcPrevious = null;
  let calcOp = null;
  let calcResetOnNext = false;

  const calcMainEl = document.getElementById('w10-calc-main');
  const calcHistEl = document.getElementById('w10-calc-history');

  function updateCalcDisplay() {
    if (calcMainEl) calcMainEl.textContent = calcCurrent;
    if (calcHistEl) {
      if (calcPrevious !== null && calcOp) {
        const symbolMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
        calcHistEl.textContent = `${calcPrevious} ${symbolMap[calcOp] || calcOp}`;
      } else {
        calcHistEl.textContent = '';
      }
    }
  }

  function executeCalcOp(a, b, op) {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '*': return a * b;
      case '/': return b !== 0 ? a / b : 'Error';
      default: return b;
    }
  }

  document.querySelectorAll('.w10-cbtn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound();
      const val = btn.getAttribute('data-val');
      const act = btn.getAttribute('data-act');

      if (val !== null && !act) {
        if (calcCurrent === '0' || calcResetOnNext) {
          calcCurrent = val;
          calcResetOnNext = false;
        } else {
          calcCurrent += val;
        }
      } else if (act === 'dot') {
        if (calcResetOnNext) {
          calcCurrent = '0.';
          calcResetOnNext = false;
        } else if (!calcCurrent.includes('.')) {
          calcCurrent += '.';
        }
      } else if (act === 'c') {
        calcCurrent = '0';
        calcPrevious = null;
        calcOp = null;
        calcResetOnNext = false;
      } else if (act === 'ce') {
        calcCurrent = '0';
      } else if (act === 'back') {
        if (!calcResetOnNext && calcCurrent.length > 1) {
          calcCurrent = calcCurrent.slice(0, -1);
        } else {
          calcCurrent = '0';
        }
      } else if (act === 'neg') {
        if (calcCurrent !== '0') {
          calcCurrent = String(-parseFloat(calcCurrent));
        }
      } else if (act === 'sqrt') {
        const num = parseFloat(calcCurrent);
        calcCurrent = num >= 0 ? String(Math.sqrt(num)) : 'Error';
        calcResetOnNext = true;
      } else if (act === 'sqr') {
        const num = parseFloat(calcCurrent);
        calcCurrent = String(num * num);
        calcResetOnNext = true;
      } else if (act === 'recip') {
        const num = parseFloat(calcCurrent);
        calcCurrent = num !== 0 ? String(1 / num) : 'Error';
        calcResetOnNext = true;
      } else if (act === 'percent') {
        const num = parseFloat(calcCurrent);
        calcCurrent = String(num / 100);
        calcResetOnNext = true;
      } else if (act === 'op') {
        const opVal = btn.getAttribute('data-val');
        if (calcOp && !calcResetOnNext) {
          const res = executeCalcOp(parseFloat(calcPrevious), parseFloat(calcCurrent), calcOp);
          calcCurrent = String(res);
          calcPrevious = res;
        } else {
          calcPrevious = parseFloat(calcCurrent);
        }
        calcOp = opVal;
        calcResetOnNext = true;
      } else if (act === 'eq') {
        if (calcOp && calcPrevious !== null) {
          const res = executeCalcOp(parseFloat(calcPrevious), parseFloat(calcCurrent), calcOp);
          if (calcHistEl) calcHistEl.textContent = `${calcPrevious} ${calcOp} ${calcCurrent} =`;
          calcCurrent = String(res);
          calcPrevious = null;
          calcOp = null;
          calcResetOnNext = true;
          if (calcMainEl) calcMainEl.textContent = calcCurrent;
          return;
        }
      }
      updateCalcDisplay();
    });
  });

  /* Administrador de tareas de Windows 10 */
  document.querySelectorAll('.w10-tm-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound();
      document.querySelectorAll('.w10-tm-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.w10-tm-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      if (targetId) {
        document.getElementById(targetId)?.classList.add('active');
      }
    });
  });

  document.querySelectorAll('.w10-proc-row').forEach(row => {
    row.addEventListener('click', () => {
      document.querySelectorAll('.w10-proc-row').forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');
    });
  });

  document.getElementById('tm-end-task-btn')?.addEventListener('click', () => {
    const selected = document.querySelector('.w10-proc-row.selected');
    if (selected) {
      playSound();
      selected.remove();
    }
  });

  /* Gráfico de rendimiento de CPU en tiempo real */
  const polyline = document.getElementById('w10-cpu-polyline');
  const cpuPctText = document.getElementById('perf-cpu-pct');
  const cpuTitlePct = document.getElementById('perf-cpu-title-pct');
  const cpuExplorer = document.getElementById('tm-cpu-explorer');
  const cpuEdge = document.getElementById('tm-cpu-edge');
  const cpuTm = document.getElementById('tm-cpu-tm');
  const uptimeEl = document.getElementById('w10-uptime');

  const historyPoints = Array(30).fill(140);
  let totalSeconds = 85;

  function updatePerf() {
    const cpuUsage = Math.floor(8 + Math.random() * 22);
    if (cpuPctText) cpuPctText.textContent = `${cpuUsage}% 3.20 GHz`;
    if (cpuTitlePct) cpuTitlePct.textContent = `% de utilización: ${cpuUsage}%`;
    if (cpuExplorer) cpuExplorer.textContent = `${(0.8 + Math.random() * 1.5).toFixed(1)} %`;
    if (cpuEdge) cpuEdge.textContent = `${(1.5 + Math.random() * 2.8).toFixed(1)} %`;
    if (cpuTm) cpuTm.textContent = `${(0.5 + Math.random() * 0.9).toFixed(1)} %`;

    totalSeconds++;
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    if (uptimeEl) uptimeEl.textContent = `${hrs}:${mins}:${secs}`;

    const yVal = 150 - (cpuUsage / 100) * 130;
    historyPoints.shift();
    historyPoints.push(yVal);

    if (polyline) {
      const step = 360 / (historyPoints.length - 1);
      const pts = historyPoints.map((y, idx) => `${Math.round(idx * step)},${Math.round(y)}`).join(' ');
      polyline.setAttribute('points', pts);
    }
  }

  setInterval(updatePerf, 1200);

  /* Bloc de notas cursor */
  const npText = document.getElementById('w10-np-input');
  const npLineCol = document.getElementById('np-line-col');
  if (npText && npLineCol) {
    npText.addEventListener('keyup', () => {
      const text = npText.value.substr(0, npText.selectionStart);
      const lines = text.split('\n');
      npLineCol.textContent = `Lín. ${lines.length}, Col. ${lines[lines.length - 1].length + 1}`;
    });
  }

  /* Centro de actividades */
  document.getElementById('action-center-clear')?.addEventListener('click', () => {
    playSound();
    const container = document.getElementById('notif-container');
    if (container) {
      container.innerHTML = '<div style="color:#94a3b8; text-align:center; padding:24px;">No hay notificaciones nuevas.</div>';
    }
  });

  document.querySelectorAll('.action-center-toggles .toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound();
      btn.classList.toggle('active');
    });
  });

  /* Microsoft Edge búsqueda Bing */
  const bingInput = document.getElementById('bing-input');
  const bingBtn = document.getElementById('bing-search-btn');
  function doBingSearch() {
    if (!bingInput) return;
    const query = bingInput.value.trim();
    if (!query) return;
    playSound();
    const url = document.getElementById('edge-address');
    if (url) url.value = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    const feed = document.querySelector('.w10-news-feed');
    if (feed) {
      feed.innerHTML = `
        <div class="w10-news-card" style="grid-column: span 2;">
          <span class="w10-badge" style="background:#0078d7;">Resultados de Bing</span>
          <strong>Resultados para: "${query}"</strong>
          <p style="margin-top:6px;">Se encontraron aproximadamente 1,420,000 resultados en 0.28 segundos.</p>
          <ul style="padding-left:18px; margin-top:8px; line-height:1.6; color:#475569;">
            <li>Documentación oficial de Microsoft sobre ${query}</li>
            <li>Guía rápida y novedades destacadas en Windows 10</li>
            <li>Soporte técnico y foros de la comunidad de desarrolladores</li>
          </ul>
        </div>
      `;
    }
  }

  bingBtn?.addEventListener('click', doBingSearch);
  bingInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doBingSearch();
  });

  /* Búsqueda en barra de tareas (Cortana) */
  const searchField = document.getElementById('w10-search-field');
  searchField?.addEventListener('input', () => {
    const val = searchField.value.toLowerCase().trim();
    if (val.length > 0) {
      startMenu?.classList.remove('hidden');
      document.querySelectorAll('.start-app-row').forEach(row => {
        const text = row.textContent?.toLowerCase() || '';
        row.style.display = text.includes(val) ? 'flex' : 'none';
      });
    } else {
      document.querySelectorAll('.start-app-row').forEach(row => {
        row.style.display = 'flex';
      });
    }
  });

  /* Botones con data-win adicionales (Riel de inicio y Action Center) */
  document.querySelectorAll('.start-rail-btn[data-win], .toggle-btn[data-win]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const winId = btn.getAttribute('data-win');
      if (winId) openWindow(winId);
    });
  });

  /* Configuración de Windows 10: Tema y Actualizaciones */
  const btnDark = document.getElementById('btn-theme-dark');
  const btnLight = document.getElementById('btn-theme-light');
  btnDark?.addEventListener('click', () => {
    playSound();
    document.body.classList.remove('w10-light-mode');
    btnDark.classList.add('active');
    btnLight?.classList.remove('active');
  });

  btnLight?.addEventListener('click', () => {
    playSound();
    document.body.classList.add('w10-light-mode');
    btnLight.classList.add('active');
    btnDark?.classList.remove('active');
  });

  const btnCheckUpdates = document.getElementById('btn-check-updates');
  const updateStatus = document.getElementById('w10-update-status');
  btnCheckUpdates?.addEventListener('click', () => {
    playSound();
    if (!updateStatus) return;
    updateStatus.textContent = 'Buscando actualizaciones en línea...';
    btnCheckUpdates.setAttribute('disabled', 'true');
    setTimeout(() => {
      updateStatus.textContent = '✔ Tu equipo está al día. Última comprobación: ' + new Date().toLocaleTimeString();
      btnCheckUpdates.removeAttribute('disabled');
    }, 1200);
  });

  /* Papelera de reciclaje Windows 10 */
  const w10EmptyRecycleBtn = document.getElementById('w10-empty-recycle-btn');
  const w10RestoreRecycleBtn = document.getElementById('w10-restore-recycle-btn');
  const w10RecycleTable = document.getElementById('w10-recycle-table');
  const w10RecycleImg = document.getElementById('w10-recycle-img');

  w10EmptyRecycleBtn?.addEventListener('click', () => {
    playSound();
    if (w10RecycleTable) {
      w10RecycleTable.innerHTML = '<div style="color:#64748b; font-size:12px; padding:24px; text-align:center;">Esta carpeta está vacía.</div>';
    }
    if (w10RecycleImg) {
      w10RecycleImg.src = '../assets/icons/win10/recycle_empty.png';
    }
  });

  w10RestoreRecycleBtn?.addEventListener('click', () => {
    playSound();
    if (w10RecycleTable) {
      w10RecycleTable.innerHTML = `
        <div style="display:grid; grid-template-columns:2fr 2fr 1fr; padding:6px; border-bottom:1px solid #e2e8f0; font-size:11px; font-weight:600; color:#64748b;">
          <span>Nombre</span>
          <span>Ubicación original</span>
          <span style="text-align:right;">Tamaño</span>
        </div>
        <div class="w10-recycle-item" style="display:grid; grid-template-columns:2fr 2fr 1fr; padding:8px 6px; border-bottom:1px solid #f1f5f9; font-size:11px;">
          <span>📄 Presentacion_Proyecto_v1.pptx</span>
          <span style="color:#64748b;">C:\\Users\\Usuario\\Documents</span>
          <span style="text-align:right;">2,450 KB</span>
        </div>
        <div class="w10-recycle-item" style="display:grid; grid-template-columns:2fr 2fr 1fr; padding:8px 6px; border-bottom:1px solid #f1f5f9; font-size:11px;">
          <span>📊 Analisis_Financiero_Borrador.xlsx</span>
          <span style="color:#64748b;">C:\\Users\\Usuario\\Desktop</span>
          <span style="text-align:right;">890 KB</span>
        </div>
      `;
    }
    if (w10RecycleImg) {
      w10RecycleImg.src = '../assets/icons/win10/recycle_full.png';
    }
  });

})();

