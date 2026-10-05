/* Windows 8.1 Simulator Script */
(function () {
  'use strict';

  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  }

  function playWin8Click() {
    initAudio();
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.03);
    } catch (e) {}
  }

  const startScreen = document.getElementById('w8-start-screen');
  const desktop = document.getElementById('w8-desktop');
  const startBtn = document.getElementById('w8-start-btn');
  let isStartOpen = false;

  function toggleStart(open) {
    playWin8Click();
    isStartOpen = typeof open === 'boolean' ? open : !isStartOpen;
    if (isStartOpen) {
      startScreen?.classList.add('active');
      desktop?.classList.add('scaled-down');
    } else {
      startScreen?.classList.remove('active');
      desktop?.classList.remove('scaled-down');
      document.getElementById('w8-power-popup')?.classList.add('hidden');
    }
  }

  startBtn?.addEventListener('click', () => toggleStart());
  document.getElementById('tile-desktop')?.addEventListener('click', () => toggleStart(false));

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isStartOpen) {
      toggleStart(false);
    }
  });

  const powerIcon = document.getElementById('w8-power-icon');
  const powerPopup = document.getElementById('w8-power-popup');

  powerIcon?.addEventListener('click', (e) => {
    e.stopPropagation();
    playWin8Click();
    powerPopup?.classList.toggle('hidden');
  });

  window.addEventListener('click', () => {
    powerPopup?.classList.add('hidden');
  });

  function performRestart() {
    playWin8Click();
    const restartScreen = document.getElementById('w8-restart-screen');
    if (restartScreen) {
      restartScreen.classList.remove('hidden');
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1500);
    } else {
      window.location.href = '../index.html';
    }
  }

  document.getElementById('w8-action-restart')?.addEventListener('click', performRestart);
  document.getElementById('w8-action-shutdown')?.addEventListener('click', performRestart);
  document.getElementById('w8-action-sleep')?.addEventListener('click', () => {
    toggleStart(false);
  });

  let topZ = 100;
  const activeTabs = new Map();

  function openWin(winId) {
    playWin8Click();
    toggleStart(false);
    const win = document.getElementById(winId);
    if (!win) return;
    win.classList.remove('hidden');
    win.style.zIndex = ++topZ;

    const dynamicBar = document.getElementById('w8-taskbar-dynamic');
    if (!activeTabs.has(winId) && dynamicBar) {
      const tab = document.createElement('button');
      tab.className = 'w8-tab-btn active';
      tab.setAttribute('data-id', winId);
      const title = win.querySelector('.w8-titlebar span')?.textContent || winId;
      tab.textContent = title;

      tab.addEventListener('click', () => {
        if (!win.classList.contains('hidden') && win.style.zIndex == topZ) {
          win.classList.add('hidden');
          tab.classList.remove('active');
        } else {
          win.classList.remove('hidden');
          win.style.zIndex = ++topZ;
          updateTaskTabs(winId);
        }
      });

      dynamicBar.appendChild(tab);
      activeTabs.set(winId, tab);
    }
    updateTaskTabs(winId);
  }

  function closeWin(winId) {
    playWin8Click();
    const win = document.getElementById(winId);
    if (win) win.classList.add('hidden');
    const tab = activeTabs.get(winId);
    if (tab) tab.remove();
    activeTabs.delete(winId);
  }

  function updateTaskTabs(activeId) {
    activeTabs.forEach((tab, id) => {
      if (id === activeId) tab.classList.add('active');
      else tab.classList.remove('active');
    });
  }

  document.querySelectorAll('.w8-icon[data-win]').forEach(icon => {
    icon.addEventListener('dblclick', () => {
      openWin(icon.getAttribute('data-win'));
    });
  });

  document.querySelectorAll('.w8-task-item[data-win]').forEach(item => {
    item.addEventListener('click', () => {
      openWin(item.getAttribute('data-win'));
    });
  });

  document.querySelectorAll('.metro-tile[data-win]').forEach(tile => {
    tile.addEventListener('click', () => {
      openWin(tile.getAttribute('data-win'));
    });
  });

  document.querySelectorAll('.w8-ctrl-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const win = e.target.closest('.w8-window');
      if (win) closeWin(win.id);
    });
  });

  document.querySelectorAll('.w8-ctrl-min').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const win = e.target.closest('.w8-window');
      if (win) {
        win.classList.add('hidden');
        const tab = activeTabs.get(win.id);
        if (tab) tab.classList.remove('active');
      }
    });
  });

  document.querySelectorAll('.w8-window').forEach(win => {
    win.addEventListener('mousedown', () => {
      win.style.zIndex = ++topZ;
      updateTaskTabs(win.id);
    });
  });

  const calcDisplay = document.getElementById('w8-calc-display');
  let cVal = '0';
  let cPrev = null;
  let cOp = null;
  let cReset = false;

  document.querySelectorAll('.w8-btn-c').forEach(btn => {
    btn.addEventListener('click', () => {
      playWin8Click();
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

  function setupDraggable(win) {
    const bar = win.querySelector('.w8-titlebar');
    if (!bar) return;

    let isDown = false;
    let sx = 0, sy = 0, ox = 0, oy = 0;

    function onDown(e) {
      if (e.target.closest('.w8-ctrl-btn')) return;
      win.style.zIndex = ++topZ;
      updateTaskTabs(win.id);
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
  }

  document.querySelectorAll('.w8-window').forEach(setupDraggable);

  const charmsBar = document.getElementById('w8-charms-bar');
  const charmsTime = document.getElementById('w8-charms-time');

  document.addEventListener('mousemove', (e) => {
    if (e.clientX >= window.innerWidth - 12) {
      charmsBar?.classList.add('active');
      charmsTime?.classList.remove('hidden');
    } else if (e.clientX < window.innerWidth - 100) {
      charmsBar?.classList.remove('active');
      charmsTime?.classList.add('hidden');
    }
  });

  document.getElementById('charm-start')?.addEventListener('click', () => {
    toggleStart();
    charmsBar?.classList.remove('active');
    charmsTime?.classList.add('hidden');
  });

  document.getElementById('charm-search')?.addEventListener('click', () => {
    toggleStart(true);
    charmsBar?.classList.remove('active');
    charmsTime?.classList.add('hidden');
  });

  document.getElementById('charm-settings')?.addEventListener('click', () => {
    powerPopup?.classList.toggle('hidden');
  });

  /* Metro Weather App */
  const weatherApp = document.getElementById('w8-app-weather');
  const weatherBack = document.getElementById('w8-weather-back');
  const weatherTile = document.getElementById('tile-weather');

  const cityData = {
    madrid: { name: 'Madrid, España', temp: '21°', cond: 'Cielo despejado', range: 'Máx: 24° · Mín: 14° · Sensación 22°', hum: '48%', wind: '14 km/h NE', uv: '5 (Moderado)', baro: '1018 hPa' },
    barcelona: { name: 'Barcelona, España', temp: '23°', cond: 'Brisa marina y sol', range: 'Máx: 25° · Mín: 17° · Sensación 24°', hum: '58%', wind: '18 km/h E', uv: '6 (Alto)', baro: '1015 hPa' },
    buenosaires: { name: 'Buenos Aires, Argentina', temp: '18°', cond: 'Parcialmente nublado', range: 'Máx: 20° · Mín: 11° · Sensación 18°', hum: '62%', wind: '10 km/h SE', uv: '4 (Moderado)', baro: '1020 hPa' },
    mexico: { name: 'Ciudad de México, México', temp: '20°', cond: 'Templado y agradable', range: 'Máx: 23° · Mín: 9° · Sensación 21°', hum: '38%', wind: '8 km/h N', uv: '7 (Muy Alto)', baro: '1022 hPa' }
  };

  weatherTile?.addEventListener('click', () => {
    playWin8Click();
    weatherApp?.classList.remove('hidden');
  });

  weatherBack?.addEventListener('click', () => {
    playWin8Click();
    weatherApp?.classList.add('hidden');
  });

  document.querySelectorAll('.metro-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playWin8Click();
      document.querySelectorAll('.metro-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const c = btn.getAttribute('data-city');
      const d = cityData[c];
      if (d) {
        const elTemp = document.getElementById('weather-temp');
        const elCity = document.getElementById('weather-city');
        const elCond = document.getElementById('weather-cond');
        const elRange = document.getElementById('weather-range');
        const elHum = document.getElementById('w-humidity');
        const elWind = document.getElementById('w-wind');
        const elUv = document.getElementById('w-uv');
        const elBaro = document.getElementById('w-baro');
        if (elTemp) elTemp.textContent = d.temp;
        if (elCity) elCity.textContent = d.name;
        if (elCond) elCond.textContent = d.cond;
        if (elRange) elRange.textContent = d.range;
        if (elHum) elHum.textContent = d.hum;
        if (elWind) elWind.textContent = d.wind;
        if (elUv) elUv.textContent = d.uv;
        if (elBaro) elBaro.textContent = d.baro;
      }
    });
  });

  /* Metro Windows Store App */
  const storeApp = document.getElementById('w8-app-store');
  const storeBack = document.getElementById('w8-store-back');
  const storeTile = document.querySelector('.tile-store');

  storeTile?.addEventListener('click', () => {
    playWin8Click();
    storeApp?.classList.remove('hidden');
  });

  storeBack?.addEventListener('click', () => {
    playWin8Click();
    storeApp?.classList.add('hidden');
  });

  /* Metro Mail App */
  const mailApp = document.getElementById('w8-app-mail');
  const mailBack = document.getElementById('w8-mail-back');
  const mailTile = document.getElementById('tile-mail');
  mailTile?.addEventListener('click', () => {
    playWin8Click();
    mailApp?.classList.remove('hidden');
  });
  mailBack?.addEventListener('click', () => {
    playWin8Click();
    mailApp?.classList.add('hidden');
  });

  /* Metro Photos App */
  const photosApp = document.getElementById('w8-app-photos');
  const photosBack = document.getElementById('w8-photos-back');
  const photosTile = document.getElementById('tile-photos');
  photosTile?.addEventListener('click', () => {
    playWin8Click();
    photosApp?.classList.remove('hidden');
  });
  photosBack?.addEventListener('click', () => {
    playWin8Click();
    photosApp?.classList.add('hidden');
  });

  /* Metro News App */
  const newsApp = document.getElementById('w8-app-news');
  const newsBack = document.getElementById('w8-news-back');
  const newsTile = document.getElementById('tile-news');
  newsTile?.addEventListener('click', () => {
    playWin8Click();
    newsApp?.classList.remove('hidden');
  });
  newsBack?.addEventListener('click', () => {
    playWin8Click();
    newsApp?.classList.add('hidden');
  });

  /* Settings Charm Flyout */
  const settingsFlyout = document.getElementById('w8-settings-charm-flyout');
  const settingsClose = document.getElementById('w8-settings-close');
  document.getElementById('charm-settings')?.addEventListener('click', () => {
    playWin8Click();
    settingsFlyout?.classList.remove('hidden');
    charmsBar?.classList.remove('active');
  });
  settingsClose?.addEventListener('click', () => {
    playWin8Click();
    settingsFlyout?.classList.add('hidden');
  });
  document.getElementById('w8-charm-power-btn')?.addEventListener('click', () => {
    playWin8Click();
    settingsFlyout?.classList.add('hidden');
    powerPopup?.classList.toggle('hidden');
  });

  /* Recycle Bin Handlers */
  const w8EmptyBtn = document.getElementById('w8-btn-empty-recycle');
  const w8RestoreBtn = document.getElementById('w8-btn-restore-recycle');
  const w8RecycleList = document.getElementById('w8-recycle-list');
  const w8RecycleImg = document.getElementById('w8-recycle-img');

  w8EmptyBtn?.addEventListener('click', () => {
    playWin8Click();
    if (w8RecycleList) {
      w8RecycleList.innerHTML = '<div style="color:#666; font-size:12px; padding:16px; text-align:center;">La papelera de reciclaje está vacía.</div>';
    }
    if (w8RecycleImg) {
      w8RecycleImg.src = '../assets/icons/win8/recycle_empty.png';
    }
  });

  w8RestoreBtn?.addEventListener('click', () => {
    playWin8Click();
    if (w8RecycleList) {
      w8RecycleList.innerHTML = `
        <div style="display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid #eee; font-size:12px;">
          <span>📄 Documento_antiguo.docx</span>
          <span style="margin-left:auto; color:#888; font-size:11px;">14 KB</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; padding:6px 0; border-bottom:1px solid #eee; font-size:12px;">
          <span>🖼 Captura_pantalla.png</span>
          <span style="margin-left:auto; color:#888; font-size:11px;">120 KB</span>
        </div>
      `;
    }
    if (w8RecycleImg) {
      w8RecycleImg.src = '../assets/icons/win8/recycle_full.png';
    }
  });

  /* Periodic Live Tile Flip Animations */
  setInterval(() => {
    const tilesToFlip = document.querySelectorAll('.tile-weather, .tile-mail');
    tilesToFlip.forEach(tile => {
      tile.classList.add('flipping');
      setTimeout(() => tile.classList.remove('flipping'), 600);
    });
  }, 7000);

  function updateClock() {
    const el = document.getElementById('w8-clock');
    const huge = document.getElementById('w8-huge-clock');
    const hDate = document.getElementById('w8-huge-date');
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;

    if (el) el.innerHTML = `${h12}:${minutes} ${ampm}<br><span style="font-size:10px; opacity:0.8;">${now.toLocaleDateString()}</span>`;
    if (huge) huge.textContent = `${hours}:${minutes}`;
    if (hDate) hDate.textContent = now.toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' });
  }
  updateClock();
  setInterval(updateClock, 1000);

  const hash = window.location.hash.replace('#', '');
  if (hash === 'start') {
    toggleStart(true);
  } else if (hash) {
    hash.split(',').forEach(winId => openWin(winId.trim()));
  }
})();
