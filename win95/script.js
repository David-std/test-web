/* Windows 95 Simulator Script */
(function () {
  'use strict';

  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  }

  const W95Audio = {
    startup: function () {
      initAudio();
      if (!audioCtx) return;
      try {
        const chord = [
          { freq: 261.63, dur: 5.5, delay: 0 },
          { freq: 392.00, dur: 5.0, delay: 0.1 },
          { freq: 523.25, dur: 4.8, delay: 0.2 },
          { freq: 659.25, dur: 4.5, delay: 0.35 },
          { freq: 783.99, dur: 4.2, delay: 0.5 },
          { freq: 1046.50, dur: 4.0, delay: 0.7 }
        ];

        chord.forEach(n => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(n.freq, audioCtx.currentTime + n.delay);

          gain.gain.setValueAtTime(0.001, audioCtx.currentTime + n.delay);
          gain.gain.linearRampToValueAtTime(0.09, audioCtx.currentTime + n.delay + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + n.delay + n.dur);

          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(audioCtx.currentTime + n.delay);
          osc.stop(audioCtx.currentTime + n.delay + n.dur);
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
        osc.frequency.setValueAtTime(800, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.03);
      } catch (e) {}
    }
  };

  window.addEventListener('click', function playOnce() {
    W95Audio.startup();
    window.removeEventListener('click', playOnce);
  }, { once: true });

  let highestZ = 100;
  const activeTabs = new Map();

  const WindowManager = {
    open: function (appId) {
      W95Audio.click();
      const win = document.getElementById(`win-${appId}`);
      if (!win) return;
      win.classList.remove('hidden');
      this.bringFront(win);

      if (!activeTabs.has(appId)) {
        const tab = document.createElement('button');
        tab.className = 'w95-task-tab win-outset active';
        tab.setAttribute('data-id', appId);
        const title = win.querySelector('.w95-titlebar span')?.textContent || appId;
        tab.innerHTML = `<span style="font-weight:bold;">${title}</span>`;
        tab.addEventListener('click', () => this.toggle(appId));
        document.getElementById('w95-task-tabs')?.appendChild(tab);
        activeTabs.set(appId, tab);
      }
      this.updateTabs(appId);
    },

    close: function (appId) {
      W95Audio.click();
      const win = document.getElementById(`win-${appId}`);
      if (win) win.classList.add('hidden');
      const tab = activeTabs.get(appId);
      if (tab) tab.remove();
      activeTabs.delete(appId);
    },

    minimize: function (appId) {
      W95Audio.click();
      const win = document.getElementById(`win-${appId}`);
      if (win) {
        win.classList.add('hidden');
        const tab = activeTabs.get(appId);
        if (tab) tab.classList.remove('active');
      }
    },

    toggle: function (appId) {
      const win = document.getElementById(`win-${appId}`);
      if (!win) return;
      if (!win.classList.contains('hidden') && win.style.zIndex == highestZ) {
        this.minimize(appId);
      } else {
        win.classList.remove('hidden');
        this.bringFront(win);
      }
    },

    bringFront: function (win) {
      highestZ += 2;
      win.style.zIndex = highestZ;
      document.querySelectorAll('.w95-titlebar').forEach(t => t.classList.add('inactive'));
      win.querySelector('.w95-titlebar')?.classList.remove('inactive');
      const appId = win.getAttribute('data-id');
      this.updateTabs(appId);
    },

    updateTabs: function (activeId) {
      activeTabs.forEach((tab, id) => {
        if (id === activeId) {
          tab.classList.add('active');
        } else {
          tab.classList.remove('active');
        }
      });
    }
  };

  function setupDraggable(win) {
    const bar = win.querySelector('.w95-titlebar');
    if (!bar) return;

    let isDown = false;
    let sx = 0, sy = 0, ox = 0, oy = 0;

    function onDown(e) {
      if (e.target.closest('.w95-ctrl-btn')) return;
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

  document.querySelectorAll('.w95-window').forEach(setupDraggable);

  document.querySelectorAll('.w95-ctrl-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const win = e.target.closest('.w95-window');
      if (win) WindowManager.close(win.getAttribute('data-id'));
    });
  });

  document.querySelectorAll('.w95-ctrl-min').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const win = e.target.closest('.w95-window');
      if (win) WindowManager.minimize(win.getAttribute('data-id'));
    });
  });

  document.querySelectorAll('.w95-icon[data-app]').forEach(icon => {
    icon.addEventListener('dblclick', () => {
      WindowManager.open(icon.getAttribute('data-app'));
    });
    icon.addEventListener('click', () => {
      document.querySelectorAll('.w95-icon').forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
    });
  });

  const startBtn = document.getElementById('w95-start-btn');
  const startMenu = document.getElementById('w95-start-menu');

  startBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    W95Audio.click();
    startMenu?.classList.toggle('hidden');
    startBtn.classList.toggle('active');
  });

  window.addEventListener('click', () => {
    if (!startMenu?.classList.contains('hidden')) {
      startMenu?.classList.add('hidden');
      startBtn?.classList.remove('active');
    }
  });

  startMenu?.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  const menuProg = document.getElementById('w95-menu-programs');
  const subProg = document.getElementById('w95-submenu-programs');
  let subTimer = null;
  menuProg?.addEventListener('mouseenter', () => {
    clearTimeout(subTimer);
    subProg?.classList.remove('hidden');
  });
  menuProg?.addEventListener('mouseleave', (e) => {
    if (e.relatedTarget && subProg && (e.relatedTarget === subProg || subProg.contains(e.relatedTarget))) return;
    subTimer = setTimeout(() => subProg?.classList.add('hidden'), 180);
  });
  subProg?.addEventListener('mouseenter', () => clearTimeout(subTimer));
  subProg?.addEventListener('mouseleave', () => {
    subTimer = setTimeout(() => subProg?.classList.add('hidden'), 180);
  });

  document.querySelectorAll('.w95-menu-item[data-app]').forEach(item => {
    item.addEventListener('click', () => {
      const appId = item.getAttribute('data-app');
      if (appId) WindowManager.open(appId);
      startMenu?.classList.add('hidden');
      startBtn?.classList.remove('active');
    });
  });

  const shutdownDialog = document.getElementById('w95-shutdown-dialog');
  document.getElementById('w95-menu-shutdown')?.addEventListener('click', () => {
    W95Audio.click();
    shutdownDialog?.classList.remove('hidden');
    startMenu?.classList.add('hidden');
    startBtn?.classList.remove('active');
  });

  document.getElementById('btn-shut-cancel')?.addEventListener('click', () => {
    shutdownDialog?.classList.add('hidden');
  });

  document.getElementById('btn-shut-ok')?.addEventListener('click', () => {
    window.location.href = '../index.html';
  });

  document.getElementById('w95-btn-bold')?.addEventListener('click', () => {
    document.execCommand('bold', false, null);
  });
  document.getElementById('w95-btn-italic')?.addEventListener('click', () => {
    document.execCommand('italic', false, null);
  });
  document.getElementById('w95-btn-under')?.addEventListener('click', () => {
    document.execCommand('underline', false, null);
  });
  document.getElementById('w95-btn-clear')?.addEventListener('click', () => {
    const ed = document.getElementById('w95-wordpad-editor');
    if (ed) ed.innerHTML = '';
  });
  document.getElementById('w95-font-sz')?.addEventListener('change', (e) => {
    document.execCommand('fontSize', false, '4');
    const ed = document.getElementById('w95-wordpad-editor');
    if (ed) ed.style.fontSize = `${e.target.value}px`;
  });
  document.getElementById('w95-font-fam')?.addEventListener('change', (e) => {
    document.execCommand('fontName', false, e.target.value);
  });

  let myCompCurrentView = 'root';
  function renderMyComp() {
    const body = document.getElementById('w95-mycomp-body');
    const title = document.getElementById('w95-mycomp-title');
    if (!body) return;
    body.innerHTML = '';

    if (myCompCurrentView === 'root') {
      if (title) title.textContent = 'My Computer';
      const drives = [
        { id: 'drive-a', name: '3½ Floppy (A:)', icon: 'floppy' },
        { id: 'drive-c', name: 'Hard Disk (C:)', icon: 'harddisk' },
        { id: 'drive-d', name: 'CD-ROM (D:)', icon: 'cdrom' }
      ];

      drives.forEach(d => {
        const item = document.createElement('div');
        item.className = 'w95-drive-item';
        item.innerHTML = `
          <svg viewBox="0 0 32 32" class="w95-img">
            <rect x="4" y="6" width="24" height="20" fill="#c0c0c0" stroke="#000"/>
            <rect x="7" y="10" width="18" height="4" fill="#000"/>
          </svg>
          <span>${d.name}</span>
        `;
        item.addEventListener('dblclick', () => {
          if (d.id === 'drive-c') {
            myCompCurrentView = 'c_drive';
            renderMyComp();
          } else {
            alert(`Device ${d.name} is not ready.`);
          }
        });
        body.appendChild(item);
      });
    } else if (myCompCurrentView === 'c_drive') {
      if (title) title.textContent = 'Hard Disk (C:)';
      const files = [
        { name: 'WINDOWS', isDir: true },
        { name: 'PROGRAM FILES', isDir: true },
        { name: 'COMMAND.COM', isDir: false },
        { name: 'AUTOEXEC.BAT', isDir: false },
        { name: 'CONFIG.SYS', isDir: false }
      ];

      files.forEach(f => {
        const item = document.createElement('div');
        item.className = 'w95-drive-item';
        item.innerHTML = `
          <svg viewBox="0 0 32 32" class="w95-img">
            <rect x="4" y="6" width="24" height="20" fill="${f.isDir ? '#f8e020' : '#fff'}" stroke="#000"/>
          </svg>
          <span>${f.name}</span>
        `;
        item.addEventListener('dblclick', () => {
          if (f.name === 'WINDOWS') {
            myCompCurrentView = 'windows';
            renderMyComp();
          }
        });
        body.appendChild(item);
      });
    } else if (myCompCurrentView === 'windows') {
      if (title) title.textContent = 'C:\\WINDOWS';
      const winApps = [
        { name: 'WORDPAD.EXE', app: 'wordpad' },
        { name: 'SOL.EXE', app: 'solitaire' },
        { name: 'WINMINE.EXE', app: 'mines' }
      ];
      winApps.forEach(w => {
        const item = document.createElement('div');
        item.className = 'w95-drive-item';
        item.innerHTML = `
          <svg viewBox="0 0 32 32" class="w95-img">
            <rect x="4" y="4" width="24" height="24" fill="#fff" stroke="#000"/>
          </svg>
          <span>${w.name}</span>
        `;
        item.addEventListener('dblclick', () => {
          WindowManager.open(w.app);
        });
        body.appendChild(item);
      });
    }
  }

  renderMyComp();
  document.getElementById('mycomp-back-btn')?.addEventListener('click', () => {
    if (myCompCurrentView === 'windows') myCompCurrentView = 'c_drive';
    else if (myCompCurrentView === 'c_drive') myCompCurrentView = 'root';
    renderMyComp();
  });

  const Minesweeper = {
    rows: 9,
    cols: 9,
    mines: 10,
    grid: [],
    timer: 0,
    timerId: null,
    isOver: false,
    started: false,

    init: function () {
      clearInterval(this.timerId);
      this.timer = 0;
      this.isOver = false;
      this.started = false;
      const t = document.getElementById('w95-timer-count');
      if (t) t.textContent = '000';
      const b = document.getElementById('w95-bomb-count');
      if (b) b.textContent = '010';
      const face = document.getElementById('w95-mines-face');
      if (face) face.textContent = '🙂';

      const gridEl = document.getElementById('w95-mines-grid');
      if (!gridEl) return;
      gridEl.innerHTML = '';
      this.grid = [];

      for (let r = 0; r < this.rows; r++) {
        this.grid[r] = [];
        for (let c = 0; c < this.cols; c++) {
          this.grid[r][c] = { isMine: false, revealed: false, flagged: false, count: 0 };
          const cell = document.createElement('div');
          cell.className = 'w95-mine-cell';
          cell.setAttribute('data-r', r);
          cell.setAttribute('data-c', c);

          cell.addEventListener('click', () => this.handleClick(r, c));
          cell.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(r, c);
          });

          gridEl.appendChild(cell);
        }
      }
    },

    placeMines: function (firstR, firstC) {
      let placed = 0;
      while (placed < this.mines) {
        const r = Math.floor(Math.random() * this.rows);
        const c = Math.floor(Math.random() * this.cols);
        if ((r === firstR && c === firstC) || this.grid[r][c].isMine) continue;
        this.grid[r][c].isMine = true;
        placed++;
      }

      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.grid[r][c].isMine) continue;
          let cnt = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr, nc = c + dc;
              if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols && this.grid[nr][nc].isMine) {
                cnt++;
              }
            }
          }
          this.grid[r][c].count = cnt;
        }
      }
    },

    handleClick: function (r, c) {
      if (this.isOver) return;
      const cellData = this.grid[r][c];
      if (cellData.flagged || cellData.revealed) return;

      if (!this.started) {
        this.started = true;
        this.placeMines(r, c);
        this.timerId = setInterval(() => {
          this.timer++;
          const t = document.getElementById('w95-timer-count');
          if (t) t.textContent = String(Math.min(999, this.timer)).padStart(3, '0');
        }, 1000);
      }

      W95Audio.click();

      if (cellData.isMine) {
        this.gameOver(false);
        return;
      }

      this.reveal(r, c);
      this.checkWin();
    },

    handleRightClick: function (r, c) {
      if (this.isOver) return;
      const cellData = this.grid[r][c];
      if (cellData.revealed) return;
      cellData.flagged = !cellData.flagged;
      const cellEl = document.querySelector(`.w95-mine-cell[data-r="${r}"][data-c="${c}"]`);
      if (cellEl) cellEl.textContent = cellData.flagged ? '🚩' : '';
      W95Audio.click();
    },

    reveal: function (r, c) {
      if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return;
      const cellData = this.grid[r][c];
      if (cellData.revealed || cellData.flagged) return;

      cellData.revealed = true;
      const cellEl = document.querySelector(`.w95-mine-cell[data-r="${r}"][data-c="${c}"]`);
      if (cellEl) {
        cellEl.classList.add('revealed');
        if (cellData.count > 0) {
          cellEl.textContent = cellData.count;
          const colors = ['', '#0000ff', '#008000', '#ff0000', '#000080', '#800000', '#008080', '#000000', '#808080'];
          cellEl.style.color = colors[cellData.count] || '#000';
        } else {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              if (dr !== 0 || dc !== 0) this.reveal(r + dr, c + dc);
            }
          }
        }
      }
    },

    gameOver: function (won) {
      this.isOver = true;
      clearInterval(this.timerId);
      const face = document.getElementById('w95-mines-face');
      if (face) face.textContent = won ? '😎' : '😵';

      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.grid[r][c].isMine) {
            const cellEl = document.querySelector(`.w95-mine-cell[data-r="${r}"][data-c="${c}"]`);
            if (cellEl) {
              cellEl.classList.add('revealed');
              cellEl.textContent = '💣';
            }
          }
        }
      }
    },

    checkWin: function () {
      let unrevealedSafe = 0;
      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (!this.grid[r][c].isMine && !this.grid[r][c].revealed) {
            unrevealedSafe++;
          }
        }
      }
      if (unrevealedSafe === 0) {
        this.gameOver(true);
      }
    }
  };

  Minesweeper.init();
  document.getElementById('w95-mines-face')?.addEventListener('click', () => Minesweeper.init());
  document.getElementById('w95-mines-new')?.addEventListener('click', () => Minesweeper.init());

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
      W95Audio.click();
      this.render();
    },

    render: function () {
      const waste = document.getElementById('w95-sol-waste');
      if (waste) {
        waste.innerHTML = '';
        if (this.drawn.length > 0) {
          const top = this.drawn[this.drawn.length - 1];
          waste.appendChild(this.createCardEl(top));
        }
      }

      const tableauEl = document.getElementById('w95-sol-tableau');
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
      if (!card.faceUp) {
        cardEl.className = 'w95-card-pile';
        cardEl.innerHTML = '<div style="width:100%; height:100%; background:#000080; border:2px solid #fff; border-radius:2px;"></div>';
      } else {
        cardEl.className = `w95-card ${card.isRed ? 'red' : 'black'}`;
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
  document.getElementById('w95-sol-deck')?.addEventListener('click', () => Solitaire.drawCard());
  document.getElementById('w95-sol-deal')?.addEventListener('click', () => Solitaire.init());

  const dosInput = document.getElementById('w95-dos-input');
  const dosOutput = document.getElementById('w95-dos-output');
  if (dosInput && dosOutput) {
    dosInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = dosInput.value.trim().toUpperCase();
        dosInput.value = '';
        const echo = document.createElement('p');
        echo.textContent = `C:\\WINDOWS> ${val}`;
        dosOutput.appendChild(echo);

        const resp = document.createElement('p');
        if (val === 'VER') {
          resp.textContent = 'Windows 95. [Version 4.00.950]';
        } else if (val === 'DIR') {
          resp.innerHTML = 'Volume in drive C is WIN95<br>WORDPAD  EXE   212,992 07-11-95<br>SOL      EXE   180,688 07-11-95<br>WINMINE  EXE    27,968 07-11-95<br>COMMAND  COM    92,870 07-11-95';
        } else if (val === 'HELP') {
          resp.textContent = 'Supported commands: DIR, VER, HELP, CLS, ECHO, EXIT';
        } else if (val === 'CLS') {
          dosOutput.innerHTML = '';
          return;
        } else if (val === 'EXIT') {
          WindowManager.close('dos');
          return;
        } else if (val.startsWith('ECHO ')) {
          resp.textContent = val.substring(5);
        } else if (val !== '') {
          resp.textContent = `Bad command or file name`;
        }
        dosOutput.appendChild(resp);
      }
    });
  }

  function updateClock() {
    const el = document.getElementById('w95-clock');
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

  // Paint 95 Implementation with 28 colors
  (function initPaint95() {
    const canvas = document.getElementById('w95-paint-canvas');
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

    const paletteEl = document.getElementById('w95-paint-palette');
    if (paletteEl) {
      colors28.forEach((col, idx) => {
        const box = document.createElement('div');
        box.style.width = '14px';
        box.style.height = '14px';
        box.style.background = col;
        box.style.border = idx === 0 ? '2px inset #000' : '1px solid #777';
        box.style.cursor = 'pointer';
        box.addEventListener('click', () => {
          currentColor = col;
          paletteEl.querySelectorAll('div').forEach(d => d.style.border = '1px solid #777');
          box.style.border = '2px inset #000';
        });
        paletteEl.appendChild(box);
      });
    }

    document.querySelectorAll('.w95-paint-tool').forEach(btn => {
      btn.addEventListener('click', () => {
        W95Audio.click();
        document.querySelectorAll('.w95-paint-tool').forEach(b => b.classList.remove('active'));
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

    window.addEventListener('mouseup', () => {
      isDrawing = false;
    });

    document.getElementById('w95-paint-clear')?.addEventListener('click', () => {
      W95Audio.click();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });
  })();

  // Welcome Tour Tips
  (function initWelcome95() {
    const tips = [
      "To open a program, you just click the Start button, and then point to Programs.",
      "You can minimize all open windows by right-clicking the taskbar and selecting Minimize All Windows.",
      "Windows 95 supports long file names up to 255 characters.",
      "To change your desktop background, right-click on the desktop and click Properties.",
      "To quickly find a file or folder, click the Start button, point to Find, and then click Files or Folders."
    ];
    let tipIdx = 0;
    const textEl = document.getElementById('w95-tip-text');

    document.getElementById('w95-btn-next-tip')?.addEventListener('click', () => {
      W95Audio.click();
      tipIdx = (tipIdx + 1) % tips.length;
      if (textEl) textEl.textContent = tips[tipIdx];
    });

    document.getElementById('w95-btn-close-welcome')?.addEventListener('click', () => {
      WindowManager.close('welcome');
    });
  })();

  // Windows 95 FreeCell Engine
  const FreeCell95 = {
    freeCells: [null, null, null, null],
    foundations: [[], [], [], []],
    cascades: [[], [], [], [], [], [], [], []],
    selected: null,

    init: function () {
      const suits = [
        { name: '♠', isRed: false, foundIdx: 0 },
        { name: '♥', isRed: true, foundIdx: 1 },
        { name: '♦', isRed: true, foundIdx: 2 },
        { name: '♣', isRed: false, foundIdx: 3 }
      ];
      const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

      let deck = [];
      suits.forEach(s => {
        ranks.forEach((r, idx) => {
          deck.push({
            suit: s.name,
            rank: r,
            val: idx + 1,
            isRed: s.isRed,
            foundIdx: s.foundIdx
          });
        });
      });

      deck.sort(() => Math.random() - 0.5);

      this.freeCells = [null, null, null, null];
      this.foundations = [[], [], [], []];
      this.cascades = [[], [], [], [], [], [], [], []];
      this.selected = null;

      let c = 0;
      while (deck.length > 0) {
        this.cascades[c].push(deck.pop());
        c = (c + 1) % 8;
      }

      this.render();
      this.bindEvents();
    },

    bindEvents: function () {
      document.getElementById('fc-menu-new')?.addEventListener('click', () => {
        W95Audio.click();
        this.init();
      });

      for (let i = 0; i < 4; i++) {
        const fEl = document.getElementById(`fc-free-${i}`);
        fEl?.addEventListener('click', () => this.handleFreeCellClick(i));
      }

      for (let i = 0; i < 4; i++) {
        const foundEl = document.getElementById(`fc-found-${i}`);
        foundEl?.addEventListener('click', () => this.handleFoundationClick(i));
      }
    },

    render: function () {
      for (let i = 0; i < 4; i++) {
        const fEl = document.getElementById(`fc-free-${i}`);
        if (!fEl) continue;
        fEl.innerHTML = '';
        const card = this.freeCells[i];
        if (card) {
          const cardEl = this.createCardElement(card);
          if (this.selected && this.selected.type === 'free' && this.selected.idx === i) {
            cardEl.style.outline = '2px solid #ffff00';
          }
          fEl.appendChild(cardEl);
        }
      }

      const suitSymbols = ['♠', '♥', '♦', '♣'];
      for (let i = 0; i < 4; i++) {
        const foundEl = document.getElementById(`fc-found-${i}`);
        if (!foundEl) continue;
        const pile = this.foundations[i];
        if (pile.length > 0) {
          foundEl.innerHTML = '';
          const topCard = pile[pile.length - 1];
          const cardEl = this.createCardElement(topCard);
          cardEl.style.marginTop = '0';
          foundEl.appendChild(cardEl);
        } else {
          foundEl.textContent = suitSymbols[i];
          foundEl.style.color = (i === 1 || i === 2) ? '#ff4444' : '#ffffff';
        }
      }

      const casWrap = document.getElementById('fc-cascades');
      if (!casWrap) return;
      casWrap.innerHTML = '';

      for (let c = 0; c < 8; c++) {
        const colEl = document.createElement('div');
        colEl.className = 'fc-column';
        colEl.style.minHeight = '180px';
        colEl.style.display = 'flex';
        colEl.style.flexDirection = 'column';
        colEl.setAttribute('data-col', c);

        colEl.addEventListener('click', (e) => {
          if (e.target === colEl) {
            this.handleColumnEmptyClick(c);
          }
        });

        const cards = this.cascades[c];
        cards.forEach((card, idx) => {
          const cardEl = this.createCardElement(card);

          if (this.selected && this.selected.type === 'cascade' && this.selected.col === c && this.selected.card === card) {
            cardEl.style.outline = '2px solid #ffff00';
          }

          cardEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleCardClick(c, idx, card);
          });

          cardEl.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.autoMoveToFoundation(card, 'cascade', c);
          });

          colEl.appendChild(cardEl);
        });

        casWrap.appendChild(colEl);
      }
    },

    createCardElement: function (card) {
      const el = document.createElement('div');
      el.className = `fc-card ${card.isRed ? 'red' : ''}`;
      el.innerHTML = `
        <div style="display:flex; justify-content:space-between; line-height:1;">
          <span>${card.rank}</span>
          <span style="font-size:10px;">${card.suit}</span>
        </div>
        <div style="text-align:center; font-size:15px; line-height:1;">${card.suit}</div>
        <div style="display:flex; justify-content:space-between; line-height:1; transform:rotate(180deg);">
          <span>${card.rank}</span>
          <span style="font-size:10px;">${card.suit}</span>
        </div>
      `;
      return el;
    },

    handleCardClick: function (col, idx, card) {
      const colCards = this.cascades[col];
      if (idx !== colCards.length - 1 && !this.selected) return;

      if (!this.selected) {
        W95Audio.click();
        this.selected = { type: 'cascade', col: col, card: card };
        this.render();
      } else {
        const targetCol = col;
        const targetTopCard = colCards[colCards.length - 1];
        if (targetTopCard) {
          if (targetTopCard.val === this.selected.card.val + 1 && targetTopCard.isRed !== this.selected.card.isRed) {
            this.executeMoveToCascade(targetCol);
          } else {
            if (idx === colCards.length - 1) {
              this.selected = { type: 'cascade', col: col, card: card };
              W95Audio.click();
              this.render();
            } else {
              this.selected = null;
              this.render();
            }
          }
        }
      }
    },

    handleColumnEmptyClick: function (col) {
      if (!this.selected) return;
      if (this.cascades[col].length === 0) {
        this.executeMoveToCascade(col);
      }
    },

    handleFreeCellClick: function (idx) {
      if (!this.selected) {
        if (this.freeCells[idx]) {
          W95Audio.click();
          this.selected = { type: 'free', idx: idx, card: this.freeCells[idx] };
          this.render();
        }
      } else {
        if (!this.freeCells[idx]) {
          W95Audio.click();
          this.freeCells[idx] = this.selected.card;
          if (this.selected.type === 'cascade') {
            this.cascades[this.selected.col].pop();
          } else if (this.selected.type === 'free') {
            this.freeCells[this.selected.idx] = null;
          }
          this.selected = null;
          this.render();
          this.checkAutoFoundation();
        } else {
          this.selected = { type: 'free', idx: idx, card: this.freeCells[idx] };
          W95Audio.click();
          this.render();
        }
      }
    },

    handleFoundationClick: function (foundIdx) {
      if (!this.selected) return;
      const card = this.selected.card;
      if (card.foundIdx === foundIdx) {
        const pile = this.foundations[foundIdx];
        const nextVal = pile.length === 0 ? 1 : pile[pile.length - 1].val + 1;
        if (card.val === nextVal) {
          W95Audio.click();
          pile.push(card);
          if (this.selected.type === 'cascade') {
            this.cascades[this.selected.col].pop();
          } else if (this.selected.type === 'free') {
            this.freeCells[this.selected.idx] = null;
          }
          this.selected = null;
          this.render();
          this.checkWin();
        }
      }
    },

    autoMoveToFoundation: function (card, fromType, fromIndex) {
      const foundIdx = card.foundIdx;
      const pile = this.foundations[foundIdx];
      const nextVal = pile.length === 0 ? 1 : pile[pile.length - 1].val + 1;
      if (card.val === nextVal) {
        W95Audio.click();
        pile.push(card);
        if (fromType === 'cascade') {
          this.cascades[fromIndex].pop();
        } else if (fromType === 'free') {
          this.freeCells[fromIndex] = null;
        }
        this.selected = null;
        this.render();
        this.checkWin();
      }
    },

    executeMoveToCascade: function (targetCol) {
      W95Audio.click();
      this.cascades[targetCol].push(this.selected.card);
      if (this.selected.type === 'cascade') {
        this.cascades[this.selected.col].pop();
      } else if (this.selected.type === 'free') {
        this.freeCells[this.selected.idx] = null;
      }
      this.selected = null;
      this.render();
      this.checkAutoFoundation();
    },

    checkAutoFoundation: function () {
      let moved = false;
      for (let c = 0; c < 8; c++) {
        const col = this.cascades[c];
        if (col.length > 0) {
          const top = col[col.length - 1];
          if (top.val === 1) {
            this.foundations[top.foundIdx].push(col.pop());
            moved = true;
          }
        }
      }
      if (moved) {
        this.render();
        this.checkWin();
      }
    },

    checkWin: function () {
      let total = 0;
      for (let i = 0; i < 4; i++) {
        total += this.foundations[i].length;
      }
      if (total === 52) {
        alert("¡Felicitaciones! Has ganado esta partida de FreeCell en Windows 95.");
      }
    }
  };

  FreeCell95.init();

  // Shutdown and Reboot Handlers
  document.getElementById('btn-shut-ok')?.addEventListener('click', () => {
    W95Audio.click();
    const radios = document.getElementsByName('w95-shut-opt');
    let sel = 'reboot';
    for (let r of radios) {
      if (r.checked) sel = r.value;
    }
    document.getElementById('w95-shutdown-dialog')?.classList.add('hidden');

    if (sel === 'reboot') {
      window.location.href = '../index.html';
    } else if (sel === 'shutdown') {
      document.getElementById('w95-safe-screen')?.classList.remove('hidden');
    } else if (sel === 'dos') {
      WindowManager.open('dos');
    }
  });

  document.getElementById('btn-shut-cancel')?.addEventListener('click', () => {
    W95Audio.click();
    document.getElementById('w95-shutdown-dialog')?.classList.add('hidden');
  });

  // FreeCell 95
  (function initFreeCell() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    let freecells = [null, null, null, null];
    let foundations = [[], [], [], []];
    let cascades = [[], [], [], [], [], [], [], []];

    function dealGame() {
      freecells = [null, null, null, null];
      foundations = [[], [], [], []];
      cascades = [[], [], [], [], [], [], [], []];

      let deck = [];
      suits.forEach(s => {
        values.forEach((v, idx) => {
          deck.push({ suit: s, val: v, num: idx + 1, isRed: s === '♥' || s === '♦' });
        });
      });
      deck.sort(() => Math.random() - 0.5);

      deck.forEach((card, i) => {
        cascades[i % 8].push(card);
      });
      render();
    }

    function render() {
      for (let i = 0; i < 4; i++) {
        const el = document.getElementById(`fc-free-${i}`);
        if (!el) continue;
        el.innerHTML = '';
        if (freecells[i]) {
          el.appendChild(createCardEl(freecells[i], 'free', i, 0));
        }
      }
      for (let i = 0; i < 4; i++) {
        const el = document.getElementById(`fc-found-${i}`);
        if (!el) continue;
        el.innerHTML = '';
        if (foundations[i].length > 0) {
          const topCard = foundations[i][foundations[i].length - 1];
          el.appendChild(createCardEl(topCard, 'found', i, 0));
        } else {
          el.textContent = suits[i];
        }
      }
      const casWrap = document.getElementById('fc-cascades');
      if (!casWrap) return;
      casWrap.innerHTML = '';
      for (let i = 0; i < 8; i++) {
        const col = document.createElement('div');
        col.style.display = 'flex';
        col.style.flexDirection = 'column';
        cascades[i].forEach((card, cIdx) => {
          col.appendChild(createCardEl(card, 'cascade', i, cIdx));
        });
        casWrap.appendChild(col);
      }
    }

    function createCardEl(card, loc, col, idx) {
      const el = document.createElement('div');
      el.className = `fc-card ${card.isRed ? 'red' : 'black'}`;
      el.innerHTML = `<span>${card.val}${card.suit}</span><span>${card.suit}</span>`;
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        W95Audio.click();
        handleCardClick(card, loc, col, idx);
      });
      return el;
    }

    function handleCardClick(card, loc, col, idx) {
      for (let f = 0; f < 4; f++) {
        const fPile = foundations[f];
        if (fPile.length === 0 && card.num === 1 && card.suit === suits[f]) {
          moveCard(loc, col, idx, 'found', f);
          return;
        } else if (fPile.length > 0) {
          const top = fPile[fPile.length - 1];
          if (top.suit === card.suit && card.num === top.num + 1) {
            moveCard(loc, col, idx, 'found', f);
            return;
          }
        }
      }
      for (let fc = 0; fc < 4; fc++) {
        if (!freecells[fc]) {
          moveCard(loc, col, idx, 'free', fc);
          return;
        }
      }
    }

    function moveCard(fromLoc, fromCol, fromIdx, toLoc, toCol) {
      let card = null;
      if (fromLoc === 'free') {
        card = freecells[fromCol];
        freecells[fromCol] = null;
      } else if (fromLoc === 'cascade') {
        if (fromIdx === cascades[fromCol].length - 1) {
          card = cascades[fromCol].pop();
        }
      }
      if (!card) return;
      if (toLoc === 'found') {
        foundations[toCol].push(card);
      } else if (toLoc === 'free') {
        freecells[toCol] = card;
      }
      render();
    }

    document.getElementById('fc-menu-new')?.addEventListener('click', () => {
      W95Audio.click();
      dealGame();
    });

    dealGame();
  })();

  // Recycle Bin Implementation
  (function initRecycleBin() {
    let items = [
      { name: 'SETUP.LOG', size: '14 KB', date: '08-24-95' },
      { name: 'DETLOG.TXT', size: '28 KB', date: '08-24-95' }
    ];
    const deskRecycleImg = document.getElementById('w95-desk-recycle-img');
    const itemsContainer = document.getElementById('recycle-items-container');

    function updateRecycleUI() {
      if (!itemsContainer) return;
      itemsContainer.innerHTML = '';
      if (items.length === 0) {
        if (deskRecycleImg) deskRecycleImg.src = '../assets/icons/win95/recycle_empty.png';
        itemsContainer.innerHTML = '<p style="color:#555;">The Recycle Bin is empty.</p>';
      } else {
        if (deskRecycleImg) deskRecycleImg.src = '../assets/icons/win95/recycle_full.png';
        items.forEach(it => {
          const row = document.createElement('div');
          row.style.display = 'flex';
          row.style.gap = '12px';
          row.style.padding = '4px 0';
          row.style.borderBottom = '1px dotted #ccc';
          row.innerHTML = `<span style="font-weight:bold; flex:1;">${it.name}</span><span>${it.size}</span><span>${it.date}</span>`;
          itemsContainer.appendChild(row);
        });
      }
    }

    document.getElementById('recycle-empty-btn')?.addEventListener('click', () => {
      W95Audio.click();
      if (confirm('Are you sure you want to permanently delete these items?')) {
        items = [];
        updateRecycleUI();
      }
    });

    updateRecycleUI();
  })();

  // Display Properties & Wallpaper Switcher
  (function initDisplayProperties() {
    const desktop = document.getElementById('w95-desktop');
    const select = document.getElementById('w95-wallpaper-select');
    const preview = document.getElementById('w95-monitor-preview');

    select?.addEventListener('change', (e) => {
      const val = e.target.value;
      if (preview) {
        if (val === 'clouds') preview.style.background = "url('../assets/win95_clouds.png') center/cover";
        else if (val === 'teal') preview.style.background = "#008080";
        else preview.style.background = "#000080";
      }
    });

    function applyWallpaper() {
      const val = select?.value;
      if (val === 'clouds') {
        desktop.style.background = "var(--w95-bg) url('../assets/win95_clouds.png') center center / cover no-repeat";
      } else if (val === 'teal') {
        desktop.style.background = "#008080";
      } else {
        desktop.style.background = "#000080";
      }
    }

    document.getElementById('btn-prop-apply')?.addEventListener('click', () => {
      W95Audio.click();
      applyWallpaper();
    });

    document.getElementById('btn-prop-ok')?.addEventListener('click', () => {
      W95Audio.click();
      applyWallpaper();
      WindowManager.close('properties');
    });

    document.getElementById('btn-prop-cancel')?.addEventListener('click', () => {
      W95Audio.click();
      WindowManager.close('properties');
    });
  })();

  // Run Dialog
  (function initRunDialog() {
    document.getElementById('btn-run-exec')?.addEventListener('click', () => {
      W95Audio.click();
      const val = (document.getElementById('w95-run-input')?.value || '').toLowerCase().trim();
      WindowManager.close('run');
      if (val === 'wordpad' || val === 'write') WindowManager.open('wordpad');
      else if (val === 'paint' || val === 'pbrush' || val === 'mspaint') WindowManager.open('paint');
      else if (val === 'cmd' || val === 'command' || val === 'dos') WindowManager.open('dos');
      else if (val === 'sol' || val === 'solitaire') WindowManager.open('solitaire');
      else if (val === 'freecell') WindowManager.open('freecell');
      else if (val === 'winmine' || val === 'mines') WindowManager.open('mines');
      else alert(`Cannot find the file '${val}' (or one of its components). Make sure the path and filename are correct.`);
    });

    document.getElementById('btn-run-close')?.addEventListener('click', () => {
      W95Audio.click();
      WindowManager.close('run');
    });
  })();

  // Desktop Context Menu
  (function initContextMenu() {
    const desktop = document.getElementById('w95-desktop');
    const ctx = document.getElementById('w95-context-menu');

    desktop?.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.w95-window') || e.target.closest('.w95-taskbar')) return;
      e.preventDefault();
      W95Audio.click();
      if (ctx) {
        ctx.style.left = `${e.clientX}px`;
        ctx.style.top = `${e.clientY}px`;
        ctx.classList.remove('hidden');
      }
    });

    window.addEventListener('click', () => {
      ctx?.classList.add('hidden');
    });

    document.getElementById('ctx-properties')?.addEventListener('click', () => {
      WindowManager.open('properties');
    });

    document.getElementById('ctx-refresh')?.addEventListener('click', () => {
      W95Audio.click();
      const d = document.getElementById('w95-desktop');
      if (d) {
        d.style.opacity = '0.9';
        setTimeout(() => d.style.opacity = '1', 50);
      }
    });
  })();

  // Tray Clock & Volume
  document.getElementById('w95-tray-vol')?.addEventListener('click', () => {
    W95Audio.click();
    alert('Volume Control: Master Volume 100%');
  });

  document.getElementById('w95-clock')?.addEventListener('click', () => {
    W95Audio.click();
    alert(`Date and Time Properties:\n${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n${new Date().toLocaleTimeString()}`);
  });

  // Re-bind all draggable and control buttons on newly created windows
  document.querySelectorAll('.w95-window').forEach(setupDraggable);
  document.querySelectorAll('.w95-ctrl-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const win = e.target.closest('.w95-window');
      if (win) WindowManager.close(win.getAttribute('data-id'));
    });
  });
  document.querySelectorAll('.w95-ctrl-min').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const win = e.target.closest('.w95-window');
      if (win) WindowManager.minimize(win.getAttribute('data-id'));
    });
  });
  document.querySelectorAll('.w95-menu-item[data-app]').forEach(item => {
    item.addEventListener('click', () => {
      WindowManager.open(item.getAttribute('data-app'));
      startMenu?.classList.add('hidden');
      startBtn?.classList.remove('active');
    });
  });

  const hash = window.location.hash.replace('#', '');
  const query = new URLSearchParams(window.location.search).get('open');
  const targetApp = hash || query;
  if (targetApp) {
    targetApp.split(',').forEach(app => WindowManager.open(app.trim()));
  }
})();

