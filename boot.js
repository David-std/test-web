/* Windows Boot Manager Script with BIOS & F8 Support */
(function () {
  'use strict';

  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  }

  function playKeyClick() {
    initAudio();
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.03);
    } catch (e) {}
  }

  function playBiosBeep() {
    initAudio();
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(950, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {}
  }

  const osList = [
    { title: 'Windows 1.01 (1985)', path: 'win1/index.html' },
    { title: 'Windows 3.11 for Workgroups (1993)', path: 'win31/index.html' },
    { title: 'Windows 95 (1995)', path: 'win95/index.html' },
    { title: 'Windows 98 Second Edition (1998)', path: 'win98/index.html' },
    { title: 'Windows 2000 Professional (2000)', path: 'win2k/index.html' },
    { title: 'Windows XP Professional (2001)', path: 'winxp/index.html' },
    { title: 'Windows Vista Ultimate (2006)', path: 'winvista/index.html' },
    { title: 'Windows 7 Ultimate (2009)', path: 'win7/index.html' },
    { title: 'Windows 8.1 Pro (2013)', path: 'win8/index.html' },
    { title: 'Windows 10 Pro (2015)', path: 'win10/index.html' },
    { title: 'Windows 11 Pro (2021)', path: 'win11/index.html' }
  ];

  let selectedIndex = 3; // Windows 98 SE por defecto
  let secondsLeft = 30;
  let timerId = null;
  let currentScreen = 'boot'; // 'boot' | 'bios' | 'f8'

  const bootScreen = document.getElementById('boot-screen');
  const biosScreen = document.getElementById('bios-screen');
  const f8Screen = document.getElementById('f8-screen');
  const container = document.getElementById('os-list');
  const timerDisplay = document.getElementById('timer-seconds');
  const timerRow = document.getElementById('timer-row');

  // BIOS state
  let biosIndex = 0;
  const biosItems = document.querySelectorAll('.bios-item');
  const biosHelp = document.getElementById('bios-item-help');

  // F8 state
  let f8Index = 0;
  const f8Items = document.querySelectorAll('.f8-item');

  function renderBoot() {
    if (!container) return;
    container.innerHTML = '';

    osList.forEach((os, idx) => {
      const el = document.createElement('div');
      el.className = `os-item ${idx === selectedIndex ? 'selected' : ''}`;
      el.textContent = os.title;

      el.addEventListener('click', () => {
        playKeyClick();
        selectedIndex = idx;
        renderBoot();
        bootSelected();
      });

      el.addEventListener('mouseenter', () => {
        if (selectedIndex !== idx) {
          selectedIndex = idx;
          playKeyClick();
          renderBoot();
        }
      });

      container.appendChild(el);
    });
  }

  function bootSelected() {
    clearInterval(timerId);
    document.body.innerHTML = '';
    const target = osList[selectedIndex].path;
    window.location.href = target;
  }

  function showBios() {
    clearInterval(timerId);
    if (timerRow) timerRow.style.display = 'none';
    currentScreen = 'bios';
    playBiosBeep();
    bootScreen.classList.add('hidden');
    f8Screen.classList.add('hidden');
    biosScreen.classList.remove('hidden');
    updateBiosHighlight();
  }

  function showF8() {
    clearInterval(timerId);
    if (timerRow) timerRow.style.display = 'none';
    currentScreen = 'f8';
    playKeyClick();
    bootScreen.classList.add('hidden');
    biosScreen.classList.add('hidden');
    f8Screen.classList.remove('hidden');
    updateF8Highlight();
  }

  function showBootManager() {
    currentScreen = 'boot';
    playKeyClick();
    biosScreen.classList.add('hidden');
    f8Screen.classList.add('hidden');
    bootScreen.classList.remove('hidden');
    renderBoot();
  }

  function updateBiosHighlight() {
    biosItems.forEach((item, idx) => {
      if (idx === biosIndex) {
        item.classList.add('selected');
        if (biosHelp) biosHelp.textContent = item.dataset.desc || '';
      } else {
        item.classList.remove('selected');
      }
    });
  }

  function updateF8Highlight() {
    f8Items.forEach((item, idx) => {
      if (idx === f8Index) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });
  }

  // Ticker para reloj en pantalla BIOS
  setInterval(() => {
    const now = new Date();
    const timeEl = document.getElementById('bios-live-time');
    const dateEl = document.getElementById('bios-live-date');
    if (timeEl) timeEl.textContent = now.toTimeString().split(' ')[0];
    if (dateEl) dateEl.textContent = `${String(now.getMonth()+1).padStart(2,'0')}/${String(now.getDate()).padStart(2,'0')}/${now.getFullYear()}`;
  }, 1000);

  // Botones interactivos
  const btnBios = document.getElementById('btn-open-bios');
  if (btnBios) btnBios.addEventListener('click', showBios);

  const btnF8 = document.getElementById('btn-open-f8');
  if (btnF8) btnF8.addEventListener('click', showF8);

  const btnBiosExit = document.getElementById('btn-bios-exit');
  if (btnBiosExit) btnBiosExit.addEventListener('click', showBootManager);

  const btnBiosSave = document.getElementById('btn-bios-save');
  if (btnBiosSave) btnBiosSave.addEventListener('click', () => {
    playBiosBeep();
    bootSelected();
  });

  const btnF8Return = document.getElementById('btn-f8-return');
  if (btnF8Return) btnF8Return.addEventListener('click', showBootManager);

  biosItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      playKeyClick();
      biosIndex = idx;
      updateBiosHighlight();
      if (idx === 8) { // Save & Exit
        playBiosBeep();
        bootSelected();
      } else if (idx === 9) { // Exit without saving
        showBootManager();
      }
    });
  });

  f8Items.forEach((item, idx) => {
    item.addEventListener('click', () => {
      playKeyClick();
      f8Index = idx;
      updateF8Highlight();
      const mode = item.dataset.mode;
      if (mode === 'reboot') {
        showBootManager();
      } else {
        bootSelected();
      }
    });
  });

  // Teclado global
  document.addEventListener('keydown', (e) => {
    clearInterval(timerId);
    if (timerRow) timerRow.style.display = 'none';

    if (e.key === 'Delete' || e.key === 'Tab' || e.key === 'F2') {
      e.preventDefault();
      showBios();
      return;
    }

    if (e.key === 'F8') {
      e.preventDefault();
      showF8();
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      showBootManager();
      return;
    }

    if (currentScreen === 'boot') {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        playKeyClick();
        selectedIndex = (selectedIndex - 1 + osList.length) % osList.length;
        renderBoot();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        playKeyClick();
        selectedIndex = (selectedIndex + 1) % osList.length;
        renderBoot();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        bootSelected();
      }
    } else if (currentScreen === 'bios') {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        playKeyClick();
        biosIndex = (biosIndex - 1 + biosItems.length) % biosItems.length;
        updateBiosHighlight();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        playKeyClick();
        biosIndex = (biosIndex + 1) % biosItems.length;
        updateBiosHighlight();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        playKeyClick();
        biosIndex = (biosIndex + 5) % biosItems.length;
        updateBiosHighlight();
      } else if (e.key === 'Enter' || e.key === 'F10') {
        e.preventDefault();
        playBiosBeep();
        if (biosIndex === 9) {
          showBootManager();
        } else {
          bootSelected();
        }
      }
    } else if (currentScreen === 'f8') {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        playKeyClick();
        f8Index = (f8Index - 1 + f8Items.length) % f8Items.length;
        updateF8Highlight();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        playKeyClick();
        f8Index = (f8Index + 1) % f8Items.length;
        updateF8Highlight();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        playKeyClick();
        if (f8Items[f8Index].dataset.mode === 'reboot') {
          showBootManager();
        } else {
          bootSelected();
        }
      }
    }
  });

  // Temporizador de arranque automático
  timerId = setInterval(() => {
    secondsLeft--;
    if (timerDisplay) timerDisplay.textContent = secondsLeft;
    if (secondsLeft <= 0) {
      clearInterval(timerId);
      bootSelected();
    }
  }, 1000);

  renderBoot();
})();
