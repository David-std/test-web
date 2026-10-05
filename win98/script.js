/* Windows 98 Retro Simulator Script */
(function () {
  'use strict';

  let audioCtx = null;
  let soundEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  const RetroAudio = {
    click: function () {
      if (!soundEnabled) return;
      initAudio();
      if (!audioCtx) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.04);
      } catch (e) {}
    },

    startup: function () {
      if (!soundEnabled) return;
      initAudio();
      if (!audioCtx) return;
      try {
        const chords = [
          { freq: 261.63, delay: 0.0, dur: 2.2 },
          { freq: 329.63, delay: 0.1, dur: 2.1 },
          { freq: 392.00, delay: 0.2, dur: 2.0 },
          { freq: 523.25, delay: 0.35, dur: 2.4 },
          { freq: 659.25, delay: 0.5, dur: 2.5 },
          { freq: 783.99, delay: 0.7, dur: 2.8 }
        ];

        chords.forEach(note => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(note.freq, audioCtx.currentTime + note.delay);

          gain.gain.setValueAtTime(0.001, audioCtx.currentTime + note.delay);
          gain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + note.delay + 0.2);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + note.delay + note.dur);

          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(audioCtx.currentTime + note.delay);
          osc.stop(audioCtx.currentTime + note.delay + note.dur);
        });
      } catch (e) {}
    },

    chord: function () {
      if (!soundEnabled) return;
      initAudio();
      if (!audioCtx) return;
      try {
        [440, 554.37, 659.25].forEach(freq => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.35);
        });
      } catch (e) {}
    },

    explosion: function () {
      if (!soundEnabled) return;
      initAudio();
      if (!audioCtx) return;
      try {
        const bufferSize = audioCtx.sampleRate * 0.4;
        const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = audioCtx.createBufferSource();
        noise.buffer = buffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, audioCtx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.4);

        const gain = audioCtx.createGain();
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(audioCtx.destination);
        noise.start();
      } catch (e) {}
    },

    win: function () {
      if (!soundEnabled) return;
      initAudio();
      if (!audioCtx) return;
      try {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, audioCtx.currentTime + idx * 0.12);
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + idx * 0.12 + 0.2);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(audioCtx.currentTime + idx * 0.12);
          osc.stop(audioCtx.currentTime + idx * 0.12 + 0.2);
        });
      } catch (e) {}
    }
  };

  window.addEventListener('click', function onFirstInteraction() {
    RetroAudio.startup();
    window.removeEventListener('click', onFirstInteraction);
  }, { once: true });

  let highestZ = 100;
  const activeWindows = new Map();

  const WindowManager = {
    open: function (appId) {
      RetroAudio.click();
      const winEl = document.getElementById(`win-${appId}`);
      if (!winEl) return;

      winEl.classList.remove('hidden');
      this.bringToFront(winEl);

      let winData = activeWindows.get(appId);
      if (!winData) {
        const tabEl = this.createTaskbarTab(appId, winEl);
        winData = { winElement: winEl, tabElement: tabEl, state: 'normal' };
        activeWindows.set(appId, winData);
      } else {
        winData.state = 'normal';
      }

      this.updateTaskbarState(appId);
    },

    close: function (appId) {
      RetroAudio.click();
      const winEl = document.getElementById(`win-${appId}`);
      if (!winEl) return;

      winEl.classList.add('hidden');
      const winData = activeWindows.get(appId);
      if (winData && winData.tabElement) {
        winData.tabElement.remove();
      }
      activeWindows.delete(appId);
      this.focusTopRemainingWindow();
    },

    minimize: function (appId) {
      RetroAudio.click();
      const winEl = document.getElementById(`win-${appId}`);
      const winData = activeWindows.get(appId);
      if (!winEl || !winData) return;

      winEl.classList.add('hidden');
      winData.state = 'minimized';
      winEl.classList.remove('active');
      if (winData.tabElement) {
        winData.tabElement.classList.remove('active');
      }
      this.focusTopRemainingWindow();
    },

    toggleMinimize: function (appId) {
      const winData = activeWindows.get(appId);
      if (!winData) return;

      const isCurrentActive = winData.winElement.classList.contains('active') && !winData.winElement.classList.contains('hidden');

      if (isCurrentActive) {
        this.minimize(appId);
      } else {
        winData.winElement.classList.remove('hidden');
        winData.state = 'normal';
        this.bringToFront(winData.winElement);
        this.updateTaskbarState(appId);
      }
    },

    maximize: function (appId) {
      RetroAudio.click();
      const winEl = document.getElementById(`win-${appId}`);
      const winData = activeWindows.get(appId);
      if (!winEl) return;

      if (winEl.classList.contains('maximized')) {
        winEl.classList.remove('maximized');
        if (winData) winData.state = 'normal';
      } else {
        winEl.classList.add('maximized');
        if (winData) winData.state = 'maximized';
      }
      this.bringToFront(winEl);
    },

    bringToFront: function (winEl) {
      highestZ += 2;
      winEl.style.zIndex = highestZ;

      document.querySelectorAll('.win98-window').forEach(w => w.classList.remove('active'));
      winEl.classList.add('active');

      const appId = winEl.getAttribute('data-id');
      this.updateTaskbarState(appId);
    },

    createTaskbarTab: function (appId, winEl) {
      const taskbarContainer = document.getElementById('taskbar-windows');
      const tab = document.createElement('div');
      tab.className = 'taskbar-tab active';
      tab.setAttribute('data-id', appId);

      const titleText = winEl.querySelector('.titlebar-text span')?.textContent || appId;
      const iconSvg = winEl.querySelector('.titlebar-icon')?.outerHTML || '';

      tab.innerHTML = `${iconSvg} <span>${titleText}</span>`;

      tab.addEventListener('click', () => {
        this.toggleMinimize(appId);
      });

      taskbarContainer.appendChild(tab);
      return tab;
    },

    updateTaskbarState: function (activeAppId) {
      document.querySelectorAll('.taskbar-tab').forEach(tab => {
        if (tab.getAttribute('data-id') === activeAppId) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
    },

    focusTopRemainingWindow: function () {
      let topWin = null;
      let maxZ = -1;

      document.querySelectorAll('.win98-window:not(.hidden)').forEach(w => {
        const z = parseInt(w.style.zIndex || 0, 10);
        if (z > maxZ) {
          maxZ = z;
          topWin = w;
        }
      });

      if (topWin) {
        this.bringToFront(topWin);
      }
    }
  };

  function setupDraggable(winEl) {
    const titlebar = winEl.querySelector('.window-titlebar');
    if (!titlebar) return;

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    function onPointerDown(e) {
      if (e.target.closest('.win-btn')) return;
      if (winEl.classList.contains('maximized')) return;

      WindowManager.bringToFront(winEl);

      isDragging = true;
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      startX = clientX;
      startY = clientY;
      initialLeft = winEl.offsetLeft;
      initialTop = winEl.offsetTop;

      document.addEventListener('mousemove', onPointerMove);
      document.addEventListener('mouseup', onPointerUp);
      document.addEventListener('touchmove', onPointerMove, { passive: false });
      document.addEventListener('touchend', onPointerUp);
    }

    function onPointerMove(e) {
      if (!isDragging) return;
      if (e.cancelable) e.preventDefault();

      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      const dx = clientX - startX;
      const dy = clientY - startY;

      let newLeft = initialLeft + dx;
      let newTop = initialTop + dy;

      const maxLeft = window.innerWidth - 60;
      const maxTop = window.innerHeight - 60;
      newLeft = Math.max(-winEl.offsetWidth + 80, Math.min(newLeft, maxLeft));
      newTop = Math.max(0, Math.min(newTop, maxTop));

      winEl.style.left = `${newLeft}px`;
      winEl.style.top = `${newTop}px`;
    }

    function onPointerUp() {
      isDragging = false;
      document.removeEventListener('mousemove', onPointerMove);
      document.removeEventListener('mouseup', onPointerUp);
      document.removeEventListener('touchmove', onPointerMove);
      document.removeEventListener('touchend', onPointerUp);
    }

    titlebar.addEventListener('mousedown', onPointerDown);
    titlebar.addEventListener('touchstart', onPointerDown, { passive: true });

    winEl.addEventListener('mousedown', () => {
      WindowManager.bringToFront(winEl);
    });
  }

  document.querySelectorAll('.win98-window').forEach(winEl => {
    const appId = winEl.getAttribute('data-id');
    setupDraggable(winEl);

    const btnMin = winEl.querySelector('.win-btn-minimize');
    if (btnMin) {
      btnMin.addEventListener('click', () => WindowManager.minimize(appId));
    }

    const btnMax = winEl.querySelector('.win-btn-maximize');
    if (btnMax) {
      btnMax.addEventListener('click', () => WindowManager.maximize(appId));
    }

    const btnClose = winEl.querySelector('.win-btn-close');
    if (btnClose) {
      btnClose.addEventListener('click', () => WindowManager.close(appId));
    }
  });

  const desktop = document.getElementById('desktop');
  const desktopIcons = document.querySelectorAll('.desktop-icon');
  const contextMenu = document.getElementById('context-menu');
  const marquee = document.getElementById('selection-marquee');

  desktopIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
      e.stopPropagation();
      desktopIcons.forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
    });

    icon.addEventListener('dblclick', () => {
      const appId = icon.getAttribute('data-app');
      WindowManager.open(appId);
    });

    let lastTap = 0;
    icon.addEventListener('touchend', (e) => {
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTap;
      if (tapLength < 350 && tapLength > 0) {
        const appId = icon.getAttribute('data-app');
        WindowManager.open(appId);
        e.preventDefault();
      }
      lastTap = currentTime;
    });
  });

  let isSelecting = false;
  let marqueeStartX = 0;
  let marqueeStartY = 0;

  desktop.addEventListener('mousedown', (e) => {
    if (e.target.closest('.win98-window') || e.target.closest('.desktop-icon') || e.target.closest('.context-menu') || e.target.closest('.start-menu')) {
      return;
    }

    desktopIcons.forEach(i => i.classList.remove('selected'));
    closeAllMenus();

    isSelecting = true;
    marqueeStartX = e.clientX;
    marqueeStartY = e.clientY;

    marquee.style.left = `${marqueeStartX}px`;
    marquee.style.top = `${marqueeStartY}px`;
    marquee.style.width = '0px';
    marquee.style.height = '0px';
    marquee.classList.remove('hidden');

    function onMouseMove(moveEvent) {
      if (!isSelecting) return;

      const currentX = moveEvent.clientX;
      const currentY = moveEvent.clientY;

      const left = Math.min(marqueeStartX, currentX);
      const top = Math.min(marqueeStartY, currentY);
      const width = Math.abs(currentX - marqueeStartX);
      const height = Math.abs(currentY - marqueeStartY);

      marquee.style.left = `${left}px`;
      marquee.style.top = `${top}px`;
      marquee.style.width = `${width}px`;
      marquee.style.height = `${height}px`;

      const mRect = marquee.getBoundingClientRect();
      desktopIcons.forEach(icon => {
        const iRect = icon.getBoundingClientRect();
        const overlaps = !(
          mRect.right < iRect.left ||
          mRect.left > iRect.right ||
          mRect.bottom < iRect.top ||
          mRect.top > iRect.bottom
        );
        if (overlaps) {
          icon.classList.add('selected');
        } else {
          icon.classList.remove('selected');
        }
      });
    }

    function onMouseUp() {
      isSelecting = false;
      marquee.classList.add('hidden');
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  desktop.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    if (e.target.closest('.win98-window')) return;

    RetroAudio.click();
    closeAllMenus();

    const mouseX = Math.min(e.clientX, window.innerWidth - 160);
    const mouseY = Math.min(e.clientY, window.innerHeight - 120);

    contextMenu.style.left = `${mouseX}px`;
    contextMenu.style.top = `${mouseY}px`;
    contextMenu.classList.remove('hidden');
  });

  document.getElementById('ctx-refresh')?.addEventListener('click', () => {
    RetroAudio.click();
    contextMenu.classList.add('hidden');
    desktop.style.opacity = '0.7';
    setTimeout(() => { desktop.style.opacity = '1'; }, 100);
  });

  document.getElementById('ctx-new-note')?.addEventListener('click', () => {
    RetroAudio.click();
    contextMenu.classList.add('hidden');
    WindowManager.open('notepad');
    const ta = document.getElementById('notepad-textarea');
    if (ta) {
      ta.value = '';
      ta.focus();
    }
  });

  document.getElementById('ctx-properties')?.addEventListener('click', () => {
    RetroAudio.click();
    contextMenu.classList.add('hidden');
    WindowManager.open('display-properties');
  });

  const startButton = document.getElementById('start-button');
  const startMenu = document.getElementById('start-menu');

  startButton.addEventListener('click', (e) => {
    e.stopPropagation();
    RetroAudio.click();
    const isHidden = startMenu.classList.contains('hidden');
    closeAllMenus();
    if (isHidden) {
      startMenu.classList.remove('hidden');
      startButton.classList.add('pressed');
    }
  });

  startMenu.querySelectorAll('.start-item[data-app]').forEach(item => {
    item.addEventListener('click', () => {
      const appId = item.getAttribute('data-app');
      closeAllMenus();
      WindowManager.open(appId);
    });
  });

  document.getElementById('ql-desktop')?.addEventListener('click', () => {
    RetroAudio.click();
    const visibleWindows = document.querySelectorAll('.win98-window:not(.hidden)');
    if (visibleWindows.length > 0) {
      visibleWindows.forEach(w => WindowManager.minimize(w.getAttribute('data-id')));
    } else {
      activeWindows.forEach((data, appId) => WindowManager.open(appId));
    }
  });

  document.getElementById('ql-ie')?.addEventListener('click', () => WindowManager.open('internet-explorer'));
  document.getElementById('ql-mines')?.addEventListener('click', () => WindowManager.open('minesweeper'));

  document.getElementById('start-boot-menu')?.addEventListener('click', () => {
    RetroAudio.click();
    window.location.href = '../index.html';
  });

  document.getElementById('start-shutdown')?.addEventListener('click', () => {
    closeAllMenus();
    RetroAudio.chord();
    document.getElementById('shutdown-dialog').classList.remove('hidden');
  });

  document.getElementById('shutdown-cancel-x')?.addEventListener('click', () => {
    document.getElementById('shutdown-dialog').classList.add('hidden');
  });
  document.getElementById('btn-shutdown-cancel')?.addEventListener('click', () => {
    document.getElementById('shutdown-dialog').classList.add('hidden');
  });

  document.getElementById('btn-shutdown-confirm')?.addEventListener('click', () => {
    document.getElementById('shutdown-dialog').classList.add('hidden');
    const selectedOpt = document.querySelector('input[name="shutdown-opt"]:checked')?.value;

    if (selectedOpt === 'reboot-os' || selectedOpt === 'restart' || selectedOpt === 'dos') {
      window.location.href = '../index.html';
    } else {
      document.getElementById('safe-shutdown-screen').classList.remove('hidden');
    }
  });

  document.getElementById('btn-restart-pc')?.addEventListener('click', () => {
    window.location.href = '../index.html';
  });

  const soundToggleBtn = document.getElementById('tray-sound-toggle');
  soundToggleBtn?.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.title = soundEnabled ? 'Sonido: Activado (Clic para silenciar)' : 'Sonido: Silenciado (Clic para activar)';
    soundToggleBtn.style.opacity = soundEnabled ? '1' : '0.4';
    if (soundEnabled) RetroAudio.click();
  });

  function updateTrayClock() {
    const clockEl = document.getElementById('tray-clock');
    if (!clockEl) return;

    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    clockEl.textContent = `${hours}:${minutes} ${ampm}`;

    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    clockEl.title = now.toLocaleDateString('es-ES', dateOptions);
  }
  updateTrayClock();
  setInterval(updateTrayClock, 1000);

  function closeAllMenus() {
    startMenu.classList.add('hidden');
    startButton.classList.remove('pressed');
    contextMenu.classList.add('hidden');
    document.querySelectorAll('.dropdown-content').forEach(d => d.classList.add('hidden'));
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#start-menu') && !e.target.closest('#start-button')) {
      startMenu.classList.add('hidden');
      startButton.classList.remove('pressed');
    }
    if (!e.target.closest('#context-menu')) {
      contextMenu.classList.add('hidden');
    }
    if (!e.target.closest('.menu-dropdown')) {
      document.querySelectorAll('.dropdown-content').forEach(d => d.classList.add('hidden'));
    }
  });

  const Minesweeper = {
    rows: 9,
    cols: 9,
    minesCount: 10,
    board: [],
    flagsPlaced: 0,
    revealedCount: 0,
    gameOver: false,
    gameStarted: false,
    timer: 0,
    timerInterval: null,

    init: function () {
      this.reset();
      this.setupDOM();
    },

    reset: function () {
      clearInterval(this.timerInterval);
      this.timer = 0;
      this.gameStarted = false;
      this.gameOver = false;
      this.flagsPlaced = 0;
      this.revealedCount = 0;
      this.board = [];

      this.updateTimerDisplay();
      this.updateMineCounterDisplay();
      this.setFace('🙂');

      for (let r = 0; r < this.rows; r++) {
        this.board[r] = [];
        for (let c = 0; c < this.cols; c++) {
          this.board[r][c] = {
            row: r,
            col: c,
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborMines: 0,
            el: null
          };
        }
      }
    },

    setupDOM: function () {
      const boardEl = document.getElementById('minesweeper-board');
      const faceBtn = document.getElementById('minesweeper-face');
      const newGameMenu = document.getElementById('minesweeper-new-game');

      if (!boardEl) return;
      boardEl.innerHTML = '';

      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const cell = this.board[r][c];
          const cellEl = document.createElement('div');
          cellEl.className = 'mine-cell';
          cell.el = cellEl;

          cellEl.addEventListener('mousedown', (e) => {
            if (this.gameOver) return;
            if (e.button === 0 && !cell.isRevealed && !cell.isFlagged) {
              this.setFace('😮');
            }
          });

          cellEl.addEventListener('mouseup', () => {
            if (!this.gameOver) this.setFace('🙂');
          });

          cellEl.addEventListener('click', () => {
            this.handleCellClick(r, c);
          });

          cellEl.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(r, c);
          });

          boardEl.appendChild(cellEl);
        }
      }

      faceBtn?.addEventListener('click', () => {
        RetroAudio.click();
        this.reset();
        this.setupDOM();
      });

      newGameMenu?.addEventListener('click', () => {
        RetroAudio.click();
        this.reset();
        this.setupDOM();
      });
    },

    plantMines: function (firstRow, firstCol) {
      let placed = 0;
      while (placed < this.minesCount) {
        const r = Math.floor(Math.random() * this.rows);
        const c = Math.floor(Math.random() * this.cols);

        const isFirstCell = Math.abs(r - firstRow) <= 1 && Math.abs(c - firstCol) <= 1;
        if (!this.board[r][c].isMine && !isFirstCell) {
          this.board[r][c].isMine = true;
          placed++;
        }
      }

      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (!this.board[r][c].isMine) {
            let count = 0;
            for (let dr = -1; dr <= 1; dr++) {
              for (let dc = -1; dc <= 1; dc++) {
                const nr = r + dr;
                const nc = c + dc;
                if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
                  if (this.board[nr][nc].isMine) count++;
                }
              }
            }
            this.board[r][c].neighborMines = count;
          }
        }
      }
    },

    startTimer: function () {
      this.timerInterval = setInterval(() => {
        this.timer = Math.min(999, this.timer + 1);
        this.updateTimerDisplay();
      }, 1000);
    },

    updateTimerDisplay: function () {
      const el = document.getElementById('mine-timer');
      if (el) el.textContent = String(this.timer).padStart(3, '0');
    },

    updateMineCounterDisplay: function () {
      const el = document.getElementById('mine-counter');
      const remaining = Math.max(0, this.minesCount - this.flagsPlaced);
      if (el) el.textContent = String(remaining).padStart(3, '0');
    },

    setFace: function (emoji) {
      const el = document.getElementById('face-icon');
      if (el) el.textContent = emoji;
    },

    handleCellClick: function (r, c) {
      if (this.gameOver) return;

      const cell = this.board[r][c];
      if (cell.isFlagged || cell.isRevealed) return;

      if (!this.gameStarted) {
        this.gameStarted = true;
        this.plantMines(r, c);
        this.startTimer();
      }

      RetroAudio.click();

      if (cell.isMine) {
        this.gameOver = true;
        clearInterval(this.timerInterval);
        this.setFace('😵');
        RetroAudio.explosion();
        this.revealAllMines(cell);
        return;
      }

      this.revealCell(r, c);

      const totalSafeCells = this.rows * this.cols - this.minesCount;
      if (this.revealedCount === totalSafeCells) {
        this.gameOver = true;
        clearInterval(this.timerInterval);
        this.setFace('😎');
        RetroAudio.win();
      }
    },

    handleRightClick: function (r, c) {
      if (this.gameOver) return;
      const cell = this.board[r][c];
      if (cell.isRevealed) return;

      RetroAudio.click();

      if (!cell.isFlagged) {
        if (this.flagsPlaced < this.minesCount) {
          cell.isFlagged = true;
          cell.el.textContent = '🚩';
          this.flagsPlaced++;
        }
      } else {
        cell.isFlagged = false;
        cell.el.textContent = '';
        this.flagsPlaced--;
      }

      this.updateMineCounterDisplay();
    },

    revealCell: function (r, c) {
      const cell = this.board[r][c];
      if (cell.isRevealed || cell.isFlagged) return;

      cell.isRevealed = true;
      this.revealedCount++;
      cell.el.classList.add('revealed');

      if (cell.neighborMines > 0) {
        cell.el.textContent = cell.neighborMines;
        cell.el.classList.add(`num-${cell.neighborMines}`);
      } else {
        cell.el.textContent = '';
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
              if (!this.board[nr][nc].isRevealed) {
                this.revealCell(nr, nc);
              }
            }
          }
        }
      }
    },

    revealAllMines: function (clickedCell) {
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const cell = this.board[r][c];
          if (cell.isMine) {
            cell.el.classList.add('revealed');
            cell.el.textContent = '💣';
            if (cell === clickedCell) {
              cell.el.classList.add('exploded');
            }
          }
        }
      }
    }
  };

  Minesweeper.init();

  const Solitaire = {
    deck: [],
    drawn: [],
    tableau: [[], [], [], [], [], [], []],

    init: function () {
      const suits = ['♠', '♥', '♦', '♣'];
      const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
      this.deck = [];
      this.drawn = [];
      this.tableau = [[], [], [], [], [], [], []];

      for (let s of suits) {
        for (let i = 0; i < ranks.length; i++) {
          this.deck.push({
            suit: s,
            rank: ranks[i],
            value: i + 1,
            isRed: s === '♥' || s === '♦'
          });
        }
      }
      this.deck.sort(() => Math.random() - 0.5);

      for (let c = 0; c < 7; c++) {
        for (let r = 0; r <= c; r++) {
          const card = this.deck.pop();
          card.faceUp = r === c;
          this.tableau[c].push(card);
        }
      }

      this.render();
    },

    drawCard: function () {
      if (this.deck.length > 0) {
        const c = this.deck.pop();
        c.faceUp = true;
        this.drawn.push(c);
      } else if (this.drawn.length > 0) {
        this.deck = this.drawn.reverse();
        this.deck.forEach(c => c.faceUp = false);
        this.drawn = [];
      }
      RetroAudio.click();
      this.render();
    },

    render: function () {
      const waste = document.getElementById('w98-sol-waste');
      if (waste) {
        waste.innerHTML = '';
        if (this.drawn.length > 0) {
          const top = this.drawn[this.drawn.length - 1];
          waste.appendChild(this.createCardEl(top));
        }
      }

      const tableauEl = document.getElementById('w98-sol-tableau');
      if (tableauEl) {
        tableauEl.innerHTML = '';
        for (let c = 0; c < 7; c++) {
          const colEl = document.createElement('div');
          colEl.style.display = 'flex';
          colEl.style.flexDirection = 'column';
          colEl.style.gap = '8px';
          this.tableau[c].forEach(card => {
            colEl.appendChild(this.createCardEl(card));
          });
          tableauEl.appendChild(colEl);
        }
      }
    },

    createCardEl: function (card) {
      const cardEl = document.createElement('div');
      cardEl.style.width = '44px';
      cardEl.style.height = '62px';
      cardEl.style.borderRadius = '3px';
      cardEl.style.boxSizing = 'border-box';
      if (!card.faceUp) {
        cardEl.style.background = '#000080';
        cardEl.style.border = '2px solid #fff';
      } else {
        cardEl.style.background = '#ffffff';
        cardEl.style.border = '1px solid #808080';
        cardEl.style.color = card.isRed ? '#cc0000' : '#000000';
        cardEl.style.display = 'flex';
        cardEl.style.flexDirection = 'column';
        cardEl.style.justifyContent = 'space-between';
        cardEl.style.padding = '2px 4px';
        cardEl.style.fontSize = '11px';
        cardEl.style.fontWeight = 'bold';
        cardEl.innerHTML = `
          <span>${card.rank}${card.suit}</span>
          <span style="align-self:center; font-size:16px;">${card.suit}</span>
          <span style="align-self:flex-end;">${card.rank}</span>
        `;
      }
      return cardEl;
    }
  };

  Solitaire.init();
  document.getElementById('w98-sol-deck')?.addEventListener('click', () => Solitaire.drawCard());
  document.getElementById('sol-new-game')?.addEventListener('click', () => Solitaire.init());

  const notepadTextarea = document.getElementById('notepad-textarea');
  const notepadStatus = document.getElementById('notepad-status');
  const fileInput = document.getElementById('notepad-file-input');

  function updateNotepadStatus() {
    if (!notepadTextarea || !notepadStatus) return;
    const text = notepadTextarea.value.substr(0, notepadTextarea.selectionStart);
    const lines = text.split('\n');
    const currentLine = lines.length;
    const currentCol = lines[lines.length - 1].length + 1;
    notepadStatus.textContent = `Lín ${currentLine}, Col ${currentCol}`;
  }

  notepadTextarea?.addEventListener('keyup', updateNotepadStatus);
  notepadTextarea?.addEventListener('click', updateNotepadStatus);

  document.getElementById('menu-file')?.addEventListener('click', (e) => {
    e.stopPropagation();
    RetroAudio.click();
    document.getElementById('dropdown-file')?.classList.toggle('hidden');
  });

  document.getElementById('notepad-new')?.addEventListener('click', () => {
    RetroAudio.click();
    document.getElementById('dropdown-file')?.classList.add('hidden');
    if (notepadTextarea) {
      notepadTextarea.value = '';
      updateNotepadStatus();
    }
    document.getElementById('notepad-title').textContent = 'Sin título: Bloc de notas';
  });

  document.getElementById('notepad-open')?.addEventListener('click', () => {
    RetroAudio.click();
    document.getElementById('dropdown-file')?.classList.add('hidden');
    fileInput?.click();
  });

  fileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        if (notepadTextarea) {
          notepadTextarea.value = evt.target.result;
          document.getElementById('notepad-title').textContent = `${file.name}: Bloc de notas`;
          updateNotepadStatus();
        }
      };
      reader.readAsText(file);
    }
  });

  document.getElementById('notepad-save')?.addEventListener('click', () => {
    RetroAudio.click();
    document.getElementById('dropdown-file')?.classList.add('hidden');
    const content = notepadTextarea?.value || '';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'documento_windows98.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  document.getElementById('notepad-exit')?.addEventListener('click', () => {
    document.getElementById('dropdown-file')?.classList.add('hidden');
    WindowManager.close('notepad');
  });

  const ieUrlInput = document.getElementById('ie-url-input');
  const ieGoBtn = document.getElementById('ie-go-btn');
  const ieStatus = document.getElementById('ie-status');
  const ieLogo = document.getElementById('ie-spinning-logo');

  function simulateIeNavigate(url) {
    RetroAudio.click();
    if (ieStatus) ieStatus.textContent = 'Conectando con el sitio web...';
    if (ieLogo) ieLogo.style.animation = 'spin 1s infinite linear';

    setTimeout(() => {
      if (ieStatus) ieStatus.textContent = 'Listo';
      if (ieLogo) ieLogo.style.animation = 'none';
    }, 600);
  }

  ieGoBtn?.addEventListener('click', () => {
    simulateIeNavigate(ieUrlInput?.value || '');
  });

  ieUrlInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      simulateIeNavigate(ieUrlInput.value);
    }
  });

  document.getElementById('ie-refresh')?.addEventListener('click', () => {
    simulateIeNavigate(ieUrlInput?.value || '');
  });

  document.getElementById('ie-home')?.addEventListener('click', () => {
    if (ieUrlInput) ieUrlInput.value = 'http://www.geocities.com/retro-web-98/';
    simulateIeNavigate(ieUrlInput?.value);
  });

  document.getElementById('link-minesweeper-shortcut')?.addEventListener('click', (e) => {
    e.preventDefault();
    WindowManager.open('minesweeper');
  });

  document.getElementById('link-notepad-shortcut')?.addEventListener('click', (e) => {
    e.preventDefault();
    WindowManager.open('notepad');
  });

  let selectedWallpaper = 'teal';
  const crtScreen = document.getElementById('crt-screen');
  const wallpaperOptions = document.querySelectorAll('.wallpaper-option');

  wallpaperOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      RetroAudio.click();
      wallpaperOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      selectedWallpaper = opt.getAttribute('data-wallpaper');

      if (crtScreen) {
        crtScreen.className = `crt-screen wallpaper-${selectedWallpaper} win-inset`;
      }
    });
  });

  function applyWallpaper(wp) {
    desktop.className = `desktop wallpaper-${wp}`;
  }

  document.getElementById('btn-apply-wallpaper')?.addEventListener('click', () => {
    RetroAudio.click();
    applyWallpaper(selectedWallpaper);
    WindowManager.close('display-properties');
  });

  document.getElementById('btn-apply-only-wallpaper')?.addEventListener('click', () => {
    RetroAudio.click();
    applyWallpaper(selectedWallpaper);
  });

  document.getElementById('btn-cancel-wallpaper')?.addEventListener('click', () => {
    WindowManager.close('display-properties');
  });

  document.querySelectorAll('.drive-item').forEach(item => {
    item.addEventListener('dblclick', () => {
      RetroAudio.chord();
      const action = item.getAttribute('data-action');
      if (action === 'drive-a') {
        alert('Disquete 3½ (A:)\nNo hay ningún disco insertado en la unidad A:.\nInserte un disquete e inténtelo de nuevo.');
      } else if (action === 'drive-c') {
        alert('Disco Local (C:)\nCapacidad: 2.1 GB\nEspacio usado: 660 MB\nEspacio libre: 1.44 GB\nSistema de archivos: FAT32');
      } else if (action === 'drive-d') {
        alert('Unidad de CD (D:)\nBandeja vacía. Inserte un CD-ROM de juegos o música.');
      } else if (action === 'panel-control') {
        WindowManager.open('display-properties');
      }
    });
  });

  const sampleDocs = {
    'doc-history': {
      title: 'HISTORIA_WINDOWS_98.txt',
      content: 'Microsoft Windows 98 (nombre en código Memphis)\nLanzamiento: 25 de junio de 1998.\n\nWindows 98 introdujo una integración web completa con Internet Explorer 4/5, soporte avanzado para USB, reproductor de DVD, utilidades como el Liberador de espacio en disco y el convertidor FAT32.'
    },
    'doc-system': {
      title: 'ESPECIFICACIONES.txt',
      content: 'Especificaciones del Sistema:\n- Procesador: Intel Pentium II 300 MHz\n- Memoria RAM: 64 MB SDRAM\n- Tarjeta Gráfica: S3 Trio64V+ (DirectX 6.1)\n- Sistema de archivos: FAT32\n- Sistema operativo: Microsoft Windows 98 Segunda Edición 4.10.2222 A'
    }
  };

  Object.keys(sampleDocs).forEach(docId => {
    document.getElementById(docId)?.addEventListener('dblclick', () => {
      RetroAudio.click();
      const doc = sampleDocs[docId];
      WindowManager.open('notepad');
      if (notepadTextarea) {
        notepadTextarea.value = doc.content;
        document.getElementById('notepad-title').textContent = `${doc.title}: Bloc de notas`;
        updateNotepadStatus();
      }
    });
  });

  document.getElementById('empty-recycle-btn')?.addEventListener('click', () => {
    RetroAudio.click();
    const list = document.getElementById('recycle-list');
    const status = document.getElementById('recycle-status');
    if (list) list.innerHTML = '<div style="padding:10px; color:#888;">La papelera está vacía.</div>';
    if (status) status.textContent = '0 objeto(s)';
  });

  // MS Paint 98 Implementation
  (function initPaint98() {
    const canvas = document.getElementById('paint-98-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const colors28 = [
      '#000000','#808080','#800000','#808000','#008000','#008080','#000080','#800080','#808040','#004040','#0080ff','#004080','#8000ff','#804000',
      '#ffffff','#c0c0c0','#ff0000','#ffff00','#00ff00','#00ffff','#0000ff','#ff00ff','#ffff80','#00ff80','#80ffff','#7f99ff','#ff0080','#ff8040'
    ];

    let currentColor = '#000000';
    let currentTool = 'pencil';
    let isDrawing = false;
    let startX = 0, startY = 0;
    let snapshot = null;

    const palEl = document.getElementById('paint-98-palette');
    if (palEl) {
      colors28.forEach((col, idx) => {
        const d = document.createElement('div');
        d.style.width = '14px';
        d.style.height = '14px';
        d.style.background = col;
        d.style.border = idx === 0 ? '2px inset #000' : '1px solid #777';
        d.style.cursor = 'pointer';
        d.addEventListener('click', () => {
          currentColor = col;
          palEl.querySelectorAll('div').forEach(x => x.style.border = '1px solid #777');
          d.style.border = '2px inset #000';
        });
        palEl.appendChild(d);
      });
    }

    document.querySelectorAll('.paint-tool-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        RetroAudio.click();
        document.querySelectorAll('.paint-tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.dataset.tool;
      });
    });

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: Math.floor((e.clientX - rect.left) * scaleX),
        y: Math.floor((e.clientY - rect.top) * scaleY)
      };
    }

    canvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      const { x, y } = getCoords(e);
      startX = x;
      startY = y;
      snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = currentColor;
      ctx.strokeStyle = currentColor;
      ctx.lineWidth = currentTool === 'brush' ? 4 : 1;

      if (currentTool === 'pencil' || currentTool === 'brush') {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else if (currentTool === 'eraser') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 5, y - 5, 10, 10);
      } else if (currentTool === 'bucket') {
        ctx.fillStyle = currentColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      const { x, y } = getCoords(e);

      if (currentTool === 'pencil' || currentTool === 'brush') {
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (currentTool === 'eraser') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 5, y - 5, 10, 10);
      } else if (currentTool === 'line') {
        ctx.putImageData(snapshot, 0, 0);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (currentTool === 'rect') {
        ctx.putImageData(snapshot, 0, 0);
        ctx.strokeRect(startX, startY, x - startX, y - startY);
      } else if (currentTool === 'spray') {
        for (let i = 0; i < 12; i++) {
          const angle = Math.random() * Math.PI * 2;
          const rad = Math.random() * 8;
          ctx.fillRect(Math.floor(x + Math.cos(angle) * rad), Math.floor(y + Math.sin(angle) * rad), 1, 1);
        }
      }
    });

    window.addEventListener('mouseup', () => { isDrawing = false; });

    document.getElementById('paint-98-clear')?.addEventListener('click', () => {
      RetroAudio.click();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
  })();

  // Windows Media Player 6.4 Implementation
  (function initWMP98() {
    let isPlaying = false;
    let animId = null;
    const canvas = document.getElementById('wmp-spectrum');
    const ctx = canvas?.getContext('2d');
    const timeDisplay = document.getElementById('wmp-time-display');
    const statusText = document.getElementById('wmp-status-text');
    let currentTimeSec = 0;
    let timerInt = null;

    function drawSpectrum() {
      if (!ctx || !canvas) return;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const bars = 24;
      const barWidth = Math.floor(canvas.width / bars) - 2;

      for (let i = 0; i < bars; i++) {
        const height = isPlaying ? Math.floor(Math.random() * 90) + 10 : 2;
        const x = i * (barWidth + 2) + 2;
        const y = canvas.height - height;

        const grad = ctx.createLinearGradient(0, y, 0, canvas.height);
        grad.addColorStop(0, '#00ff00');
        grad.addColorStop(0.7, '#ffff00');
        grad.addColorStop(1, '#ff0000');

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, height);
      }

      if (isPlaying) {
        animId = requestAnimationFrame(drawSpectrum);
      }
    }

    function playCanyonMidi() {
      initAudio();
      if (!audioCtx) return;
      try {
        const notes = [261.63, 329.63, 392.00, 440.00, 523.25];
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        const freq = notes[Math.floor(Math.random() * notes.length)];
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } catch (e) {}
    }

    document.getElementById('wmp-btn-play')?.addEventListener('click', () => {
      RetroAudio.click();
      if (isPlaying) return;
      isPlaying = true;
      if (statusText) statusText.textContent = 'Reproduciendo: canyon.mid';
      drawSpectrum();
      playCanyonMidi();
      timerInt = setInterval(() => {
        currentTimeSec++;
        playCanyonMidi();
        const m = String(Math.floor(currentTimeSec / 60)).padStart(2, '0');
        const s = String(currentTimeSec % 60).padStart(2, '0');
        if (timeDisplay) timeDisplay.textContent = `${m}:${s} / 02:15`;
        const seek = document.getElementById('wmp-seek');
        if (seek) seek.value = Math.min(100, Math.floor((currentTimeSec / 135) * 100));
      }, 1000);
    });

    document.getElementById('wmp-btn-pause')?.addEventListener('click', () => {
      RetroAudio.click();
      isPlaying = false;
      clearInterval(timerInt);
      cancelAnimationFrame(animId);
      if (statusText) statusText.textContent = 'Pausado';
    });

    document.getElementById('wmp-btn-stop')?.addEventListener('click', () => {
      RetroAudio.click();
      isPlaying = false;
      clearInterval(timerInt);
      cancelAnimationFrame(animId);
      currentTimeSec = 0;
      if (timeDisplay) timeDisplay.textContent = '00:00 / 02:15';
      if (statusText) statusText.textContent = 'Detenido';
      drawSpectrum();
      const seek = document.getElementById('wmp-seek');
      if (seek) seek.value = 0;
    });

    drawSpectrum();
  })();

  // Outlook Express 5 Implementation
  (function initOutlook() {
    const emails = {
      'bill': {
        from: 'Bill Gates <billg@microsoft.com>',
        subject: 'Asunto: Bienvenido a Windows 98 SE',
        body: 'Estimado usuario:<br><br>Nos complace presentarte Microsoft Windows 98 Segunda Edición. Con una integración web nativa sin precedentes mediante Internet Explorer 5, DirectX 6.1 y compatibilidad avanzada con puertos USB, tu ordenador está preparado para el próximo milenio.<br><br>Disfruta de la experiencia.<br><br>Atentamente,<br>Bill Gates - Microsoft Corporation'
      },
      'icq': {
        from: 'Mirabilis ICQ <alert@icq.com>',
        subject: 'Asunto: Tu amigo 1048291 se ha conectado',
        body: '¡Hola!<br><br>Tu contacto con UIN 1048291 acaba de conectarse a la red ICQ.<br>Sonido: "Uh-oh!"<br><br>Puedes enviarle un mensaje instantáneo o una solicitud de transferencia de archivos.'
      },
      'y2k': {
        from: 'Microsoft Support <y2k@microsoft.com>',
        subject: 'Asunto: Preparación ante el Efecto 2000 (Y2K)',
        body: 'Boletín de Seguridad Oficial de Microsoft:<br><br>Windows 98 Second Edition ha sido auditado y certificado contra la anomalía de fecha del año 2000 (Y2K). Todos los sistemas de reloj en tiempo real de BIOS y controladores FAT32 interpretarán correctamente los años 2000 y superiores.'
      }
    };

    document.querySelectorAll('.mail-row').forEach(row => {
      row.addEventListener('click', () => {
        RetroAudio.click();
        document.querySelectorAll('.mail-row').forEach(r => {
          r.style.background = '#fff';
          r.style.color = '#000';
          r.classList.remove('selected');
        });
        row.style.background = '#000080';
        row.style.color = '#fff';
        row.classList.add('selected');

        const m = emails[row.dataset.mail];
        if (m) {
          document.getElementById('mail-from').textContent = `De: ${m.from}`;
          document.getElementById('mail-subject').textContent = m.subject;
          document.getElementById('mail-body').innerHTML = m.body;
        }
      });
    });
  })();

  // Internet Explorer 5 Multiple Historical Sites Navigation
  (function initIE5Sites() {
    const urlInput = document.getElementById('ie-url-input');
    const goBtn = document.getElementById('ie-go-btn');
    const viewport = document.getElementById('ie-viewport');
    const windowTitle = document.getElementById('ie-window-title');

    const sites = {
      'yahoo': `
        <div style="text-align:center; margin-bottom:12px;">
          <h1 style="color:#cc0000; font-family:'Times New Roman', serif; font-size:32px; letter-spacing:2px; margin-bottom:4px;">YAHOO!</h1>
          <p style="font-size:12px; color:#555;">What's New - Check Email - Yahoo! Pager</p>
        </div>
        <div style="display:flex; justify-content:center; margin-bottom:16px;">
          <input type="text" placeholder="Buscar en la World Wide Web..." style="padding:4px 8px; width:300px; border:1px solid #777;">
          <button style="padding:4px 12px; margin-left:4px; font-weight:bold; cursor:pointer;">Buscar</button>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; font-size:12px;">
          <div>
            <p><strong style="color:#0000cc;">Artes y Humanidades</strong><br><span style="color:#555;">Literatura, Fotografía, Museos...</span></p>
            <p style="margin-top:8px;"><strong style="color:#0000cc;">Informática e Internet</strong><br><span style="color:#555;">Software, Hardware, Juegos, WWW...</span></p>
          </div>
          <div>
            <p><strong style="color:#0000cc;">Noticias y Medios</strong><br><span style="color:#555;">Titulares mundiales, Periódicos, Clima...</span></p>
            <p style="margin-top:8px;"><strong style="color:#0000cc;">Entretenimiento</strong><br><span style="color:#555;">Cine, Música de los 90, Humor...</span></p>
          </div>
        </div>
      `,
      'google': `
        <div style="text-align:center; padding:30px 10px;">
          <div style="font-family:'Times New Roman', serif; font-size:48px; font-weight:bold; letter-spacing:-1px; margin-bottom:12px;">
            <span style="color:#174ea6;">G</span><span style="color:#ea4335;">o</span><span style="color:#fbbc04;">o</span><span style="color:#174ea6;">g</span><span style="color:#34a853;">l</span><span style="color:#ea4335;">e</span><span style="color:#174ea6; font-size:32px;">!</span>
          </div>
          <p style="font-size:13px; color:#555; margin-bottom:16px;">Search the web using Google! (Beta - Stanford University)</p>
          <div style="margin-bottom:14px;">
            <input type="text" value="Windows 98 Second Edition" style="width:320px; padding:4px 8px; border:1px solid #777;">
          </div>
          <div>
            <button style="padding:4px 12px; cursor:pointer; font-weight:bold;">Google Search</button>
            <button style="padding:4px 12px; cursor:pointer; margin-left:6px;">I'm feeling lucky</button>
          </div>
          <p style="font-size:11px; color:#888; margin-top:20px;">Copyright ©1998 Google Inc.</p>
        </div>
      `,
      'spacejam': `
        <div style="background:#000022; color:#fff; padding:20px; text-align:center; font-family:'Comic Sans MS', sans-serif;">
          <h1 style="color:#ffcc00; text-shadow:2px 2px #ff0000; font-size:32px; margin-bottom:6px;">SPACE JAM</h1>
          <p style="color:#00ffff; font-size:13px; margin-bottom:16px;">WARNER BROS. OFFICIAL 1996 MOVIE SITE</p>
          <div style="display:flex; justify-content:center; gap:14px; flex-wrap:wrap;">
            <div style="border:2px solid #ff00ff; padding:8px 14px; background:#110033; border-radius:10px;">🏀 Michael Jordan</div>
            <div style="border:2px solid #00ff00; padding:8px 14px; background:#110033; border-radius:10px;">🐰 Bugs Bunny</div>
            <div style="border:2px solid #ffcc00; padding:8px 14px; background:#110033; border-radius:10px;">👽 Monstars</div>
            <div style="border:2px solid #00ffff; padding:8px 14px; background:#110033; border-radius:10px;">🎵 Soundtrack (Quad City DJ's)</div>
          </div>
        </div>
      `,
      'msn': `
        <div style="padding:16px;">
          <h1 style="color:#000080; font-size:26px; border-bottom:2px solid #000080; padding-bottom:4px;">MSN.COM 1998</h1>
          <p style="margin:10px 0; font-size:13px;">Microsoft Network - Your gateway to the world wide web.</p>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:12px;">
            <div style="border:1px solid #ccc; padding:8px;">
              <strong>Noticias Principales</strong>
              <p>Windows 98 SE bate récords de distribución en todo el mundo.</p>
            </div>
            <div style="border:1px solid #ccc; padding:8px;">
              <strong>MSN Hotmail</strong>
              <p>Consigue tu cuenta de correo electrónico gratuita de 2 MB.</p>
            </div>
          </div>
        </div>
      `
    };

    function loadURL(rawUrl) {
      const u = rawUrl.toLowerCase();
      RetroAudio.click();
      if (u.includes('google')) {
        viewport.innerHTML = sites.google;
        windowTitle.textContent = 'Google! Beta - Microsoft Internet Explorer';
      } else if (u.includes('spacejam')) {
        viewport.innerHTML = sites.spacejam;
        windowTitle.textContent = 'Space Jam Official 1996 - Microsoft Internet Explorer';
      } else if (u.includes('msn')) {
        viewport.innerHTML = sites.msn;
        windowTitle.textContent = 'MSN.com - Microsoft Internet Explorer';
      } else {
        viewport.innerHTML = sites.yahoo;
        windowTitle.textContent = 'Yahoo! - Microsoft Internet Explorer';
      }
    }

    goBtn?.addEventListener('click', () => loadURL(urlInput.value));
    urlInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') loadURL(urlInput.value);
    });

    document.querySelectorAll('.channel-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        WindowManager.open('internet-explorer');
        const ch = btn.dataset.ch;
        if (ch === 'news') {
          urlInput.value = 'http://www.msn.com/';
        } else if (ch === 'disney') {
          urlInput.value = 'http://www.spacejam.com/';
        } else if (ch === 'sports') {
          urlInput.value = 'http://www.yahoo.com/';
        } else {
          urlInput.value = 'http://www.google.com/';
        }
        loadURL(urlInput.value);
      });
    });

    document.getElementById('btn-close-channel-bar')?.addEventListener('click', () => {
      RetroAudio.click();
      document.getElementById('channel-bar')?.classList.add('hidden');
    });
  })();

  // Run Dialog Handler (Win + R)
  (function initRunDialog() {
    const runInput = document.getElementById('run-dialog-input');
    const runOk = document.getElementById('run-dialog-ok');
    const runCancel = document.getElementById('run-dialog-cancel');

    function executeRun() {
      RetroAudio.click();
      const cmd = runInput.value.trim().toLowerCase();
      WindowManager.close('run');

      if (cmd === 'notepad' || cmd === 'notepad.exe') {
        WindowManager.open('notepad');
      } else if (cmd === 'calc' || cmd === 'calc.exe') {
        alert('Calculadora de Windows:\nPara abrir herramientas aritméticas use los accesorios del sistema.');
      } else if (cmd === 'mspaint' || cmd === 'pbrush' || cmd === 'paint') {
        WindowManager.open('paint');
      } else if (cmd === 'mplayer2' || cmd === 'wmp' || cmd === 'media') {
        WindowManager.open('media-player');
      } else if (cmd === 'msimn' || cmd === 'outlook' || cmd === 'mail') {
        WindowManager.open('outlook');
      } else if (cmd === 'iexplore' || cmd === 'ie') {
        WindowManager.open('internet-explorer');
      } else if (cmd === 'winmine' || cmd === 'mines') {
        WindowManager.open('minesweeper');
      } else {
        alert(`No se puede encontrar el archivo '${cmd}' (o uno de sus componentes). Asegúrese de que la ruta y el nombre de archivo son correctos.`);
      }
    }

    runOk?.addEventListener('click', executeRun);
    runCancel?.addEventListener('click', () => WindowManager.close('run'));
    runInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') executeRun();
    });

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        WindowManager.open('run');
      }
    });
  })();

  // Shutdown and Reboot to Boot Manager
  document.getElementById('start-shutdown')?.addEventListener('click', () => {
    RetroAudio.click();
    document.getElementById('shutdown-dialog')?.classList.remove('hidden');
    document.getElementById('start-menu')?.classList.add('hidden');
  });

  document.getElementById('shutdown-cancel-x')?.addEventListener('click', () => {
    RetroAudio.click();
    document.getElementById('shutdown-dialog')?.classList.add('hidden');
  });

  document.getElementById('btn-shutdown-cancel')?.addEventListener('click', () => {
    RetroAudio.click();
    document.getElementById('shutdown-dialog')?.classList.add('hidden');
  });

  document.getElementById('btn-shutdown-confirm')?.addEventListener('click', () => {
    RetroAudio.click();
    const radios = document.getElementsByName('shutdown-opt');
    let sel = 'restart';
    for (let r of radios) {
      if (r.checked) sel = r.value;
    }
    document.getElementById('shutdown-dialog')?.classList.add('hidden');

    if (sel === 'restart') {
      window.location.href = '../index.html';
    } else if (sel === 'shutdown') {
      document.getElementById('safe-shutdown-screen')?.classList.remove('hidden');
    } else if (sel === 'dos') {
      alert('Iniciando MS-DOS Version 7.10...\nC:\\WINDOWS>');
      window.location.href = '../index.html';
    }
  });

  document.getElementById('btn-restart-pc')?.addEventListener('click', () => {
    window.location.href = '../index.html';
  });

  setTimeout(() => {
    WindowManager.open('internet-explorer');
  }, 300);

})();
