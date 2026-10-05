/* Windows 3.11 Simulator Script */
(function () {
  'use strict';

  let audioCtx = null;

  function playWin31Click() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.04);
    } catch (e) {}
  }

  let zCounter = 10;
  function bringFront(win) {
    zCounter += 2;
    win.style.zIndex = zCounter;
    document.querySelectorAll('.w31-titlebar').forEach(t => t.classList.add('inactive'));
    win.querySelector('.w31-titlebar')?.classList.remove('inactive');
  }

  function setupDraggable(win) {
    const bar = win.querySelector('.w31-titlebar');
    if (!bar) return;

    let isDown = false;
    let sx = 0, sy = 0, ox = 0, oy = 0;

    function onDown(e) {
      if (e.target.closest('.w31-btn') || e.target.closest('.w31-sysmenu')) return;
      bringFront(win);
      if (win.classList.contains('maximized')) return;
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

  document.querySelectorAll('.w31-window').forEach(setupDraggable);

  const minDock = document.getElementById('w31-minimized-dock');

  function minimizeWindow(win) {
    playWin31Click();
    win.classList.add('hidden');
    const winId = win.id;
    const title = win.getAttribute('data-title') || winId;

    let icon = document.querySelector(`.w31-minimized-icon[data-target="${winId}"]`);
    if (!icon) {
      icon = document.createElement('div');
      icon.className = 'w31-minimized-icon';
      icon.setAttribute('data-target', winId);
      const iconMap = {
        'win-progman': '../assets/icons/win31/progman.png',
        'win-solitaire': '../assets/icons/win31/solitaire.png',
        'win-mines': '../assets/icons/win31/minesweeper.png',
        'win-pbrush': '../assets/icons/win31/pbrush.png',
        'win-calc': '../assets/icons/win31/calc.png',
        'win-fileman': '../assets/icons/win31/winfile.png',
        'win-notepad': '../assets/icons/win31/notepad.png',
        'win-dos': '../assets/icons/win98/dos.png'
      };
      const iconSrc = iconMap[winId] || '../assets/icons/win31/progman.png';
      icon.innerHTML = `
        <img class="min-svg" src="${iconSrc}" alt="${title}">
        <div class="w31-minimized-label">${title}</div>
      `;

      icon.addEventListener('click', () => {
        document.querySelectorAll('.w31-minimized-icon').forEach(i => i.classList.remove('selected'));
        icon.classList.add('selected');
      });

      icon.addEventListener('dblclick', () => {
        restoreWindow(winId);
      });

      minDock?.appendChild(icon);
    }
  }

  function restoreWindow(winId) {
    playWin31Click();
    const win = document.getElementById(winId);
    if (win) {
      win.classList.remove('hidden');
      bringFront(win);
    }
    const icon = document.querySelector(`.w31-minimized-icon[data-target="${winId}"]`);
    if (icon) icon.remove();
  }

  document.querySelectorAll('.w31-btn-min').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const win = e.target.closest('.w31-window');
      if (win) minimizeWindow(win);
    });
  });

  document.querySelectorAll('.w31-btn-max').forEach(btn => {
    btn.addEventListener('click', (e) => {
      playWin31Click();
      const win = e.target.closest('.w31-window');
      if (win) {
        win.classList.toggle('maximized');
        bringFront(win);
      }
    });
  });

  document.querySelectorAll('.w31-sysmenu').forEach(box => {
    box.addEventListener('dblclick', (e) => {
      playWin31Click();
      const win = e.target.closest('.w31-window');
      if (win && win.id !== 'win-progman') {
        win.classList.add('hidden');
      } else if (win && win.id === 'win-progman') {
        document.getElementById('w31-exit-dialog')?.classList.remove('hidden');
      }
    });
  });

  document.querySelectorAll('.prog-item[data-win]').forEach(item => {
    item.addEventListener('dblclick', () => {
      playWin31Click();
      const target = item.getAttribute('data-win');
      if (target) {
        const win = document.getElementById(target);
        if (win) {
          win.classList.remove('hidden');
          bringFront(win);
        }
        const icon = document.querySelector(`.w31-minimized-icon[data-target="${target}"]`);
        if (icon) icon.remove();
      }
    });
  });

  const exitDialog = document.getElementById('w31-exit-dialog');
  document.getElementById('prog-exit')?.addEventListener('dblclick', () => {
    exitDialog?.classList.remove('hidden');
  });

  document.getElementById('progman-file-menu')?.addEventListener('click', () => {
    exitDialog?.classList.remove('hidden');
  });

  document.getElementById('progman-help-menu')?.addEventListener('click', () => {
    alert('Windows 3.11 Help:\nDouble-click icons to run programs.\nClick minimize (▼) to dock icons to desktop.\nDouble-click desktop icons to restore.');
  });

  document.getElementById('w31-btn-exit-cancel')?.addEventListener('click', () => {
    exitDialog?.classList.add('hidden');
  });

  document.getElementById('w31-btn-exit-ok')?.addEventListener('click', () => {
    window.location.href = '../index.html';
  });

  const calcDisplay = document.getElementById('calc-display');
  let currentVal = '0';
  let prevVal = null;
  let currentOp = null;
  let resetDisplay = false;

  document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playWin31Click();
      const val = btn.textContent;

      if (!isNaN(val) || val === '.') {
        if (resetDisplay || currentVal === '0') {
          currentVal = val === '.' ? '0.' : val;
          resetDisplay = false;
        } else {
          currentVal += val;
        }
        if (calcDisplay) calcDisplay.textContent = currentVal;
      } else if (val === 'C') {
        currentVal = '0';
        prevVal = null;
        currentOp = null;
        if (calcDisplay) calcDisplay.textContent = currentVal;
      } else if (val === '=') {
        if (prevVal !== null && currentOp) {
          const a = parseFloat(prevVal);
          const b = parseFloat(currentVal);
          let res = 0;
          if (currentOp === '+') res = a + b;
          if (currentOp === '-') res = a - b;
          if (currentOp === '*') res = a * b;
          if (currentOp === '/') res = b !== 0 ? a / b : 'Error';
          currentVal = String(res);
          prevVal = null;
          currentOp = null;
          resetDisplay = true;
          if (calcDisplay) calcDisplay.textContent = currentVal;
        }
      } else {
        prevVal = currentVal;
        currentOp = val;
        resetDisplay = true;
      }
    });
  });

  const pbrushCanvas = document.getElementById('pbrush-canvas');
  if (pbrushCanvas) {
    const pctx = pbrushCanvas.getContext('2d');
    let isDrawing = false;
    let currentTool = 'pencil';
    let currentColor = '#000000';
    let startX = 0, startY = 0;

    const vgaColors = [
      '#000000', '#800000', '#008000', '#808000', '#000080', '#800080', '#008080', '#c0c0c0',
      '#808080', '#ff0000', '#00ff00', '#ffff00', '#0000ff', '#ff00ff', '#00ffff', '#ffffff'
    ];

    const palEl = document.getElementById('pbrush-palette');
    if (palEl) {
      vgaColors.forEach(c => {
        const sw = document.createElement('div');
        sw.className = 'pbrush-color-swatch';
        sw.style.backgroundColor = c;
        if (c === '#000000') sw.classList.add('active');
        sw.addEventListener('click', () => {
          document.querySelectorAll('.pbrush-color-swatch').forEach(s => s.classList.remove('active'));
          sw.classList.add('active');
          currentColor = c;
        });
        palEl.appendChild(sw);
      });
    }

    document.querySelectorAll('.pbrush-tool-btn[data-tool]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.pbrush-tool-btn[data-tool]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentTool = btn.getAttribute('data-tool');
      });
    });

    document.getElementById('pbrush-clear-btn')?.addEventListener('click', () => {
      pctx.fillStyle = '#ffffff';
      pctx.fillRect(0, 0, pbrushCanvas.width, pbrushCanvas.height);
    });

    pbrushCanvas.addEventListener('mousedown', (e) => {
      isDrawing = true;
      startX = e.offsetX;
      startY = e.offsetY;

      if (currentTool === 'bucket') {
        pctx.fillStyle = currentColor;
        pctx.fillRect(0, 0, pbrushCanvas.width, pbrushCanvas.height);
      } else {
        pctx.beginPath();
        pctx.moveTo(startX, startY);
      }
    });

    pbrushCanvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      if (currentTool === 'pencil') {
        pctx.strokeStyle = currentColor;
        pctx.lineWidth = 1;
        pctx.lineTo(e.offsetX, e.offsetY);
        pctx.stroke();
      } else if (currentTool === 'brush') {
        pctx.strokeStyle = currentColor;
        pctx.lineWidth = 4;
        pctx.lineCap = 'round';
        pctx.lineTo(e.offsetX, e.offsetY);
        pctx.stroke();
      } else if (currentTool === 'eraser') {
        pctx.strokeStyle = '#ffffff';
        pctx.lineWidth = 8;
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
      }
    });
  }

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
      const timerEl = document.getElementById('mines-timer-count');
      if (timerEl) timerEl.textContent = '000';
      const bombEl = document.getElementById('mines-bomb-count');
      if (bombEl) bombEl.textContent = '010';
      const faceBtn = document.getElementById('mines-face-btn');
      if (faceBtn) faceBtn.textContent = '🙂';

      const gridEl = document.getElementById('mines-grid');
      if (!gridEl) return;
      gridEl.innerHTML = '';
      this.grid = [];

      for (let r = 0; r < this.rows; r++) {
        this.grid[r] = [];
        for (let c = 0; c < this.cols; c++) {
          this.grid[r][c] = { isMine: false, revealed: false, flagged: false, count: 0 };
          const cell = document.createElement('div');
          cell.className = 'mines-cell';
          cell.setAttribute('data-r', r);
          cell.setAttribute('data-c', c);

          cell.addEventListener('mousedown', (e) => {
            if (this.isOver) return;
            if (faceBtn) faceBtn.textContent = '😮';
          });

          cell.addEventListener('click', (e) => {
            if (faceBtn && !this.isOver) faceBtn.textContent = '🙂';
            this.handleClick(r, c);
          });

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
          const t = document.getElementById('mines-timer-count');
          if (t) t.textContent = String(Math.min(999, this.timer)).padStart(3, '0');
        }, 1000);
      }

      playWin31Click();

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
      const cellEl = document.querySelector(`.mines-cell[data-r="${r}"][data-c="${c}"]`);
      if (cellEl) cellEl.textContent = cellData.flagged ? '🚩' : '';
      playWin31Click();
    },

    reveal: function (r, c) {
      if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return;
      const cellData = this.grid[r][c];
      if (cellData.revealed || cellData.flagged) return;

      cellData.revealed = true;
      const cellEl = document.querySelector(`.mines-cell[data-r="${r}"][data-c="${c}"]`);
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
      const faceBtn = document.getElementById('mines-face-btn');
      if (faceBtn) faceBtn.textContent = won ? '😎' : '😵';

      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.grid[r][c].isMine) {
            const cellEl = document.querySelector(`.mines-cell[data-r="${r}"][data-c="${c}"]`);
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
  document.getElementById('mines-face-btn')?.addEventListener('click', () => Minesweeper.init());
  document.getElementById('mines-menu-new')?.addEventListener('click', () => Minesweeper.init());

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
      playWin31Click();
      this.render();
    },

    render: function () {
      const wastePile = document.getElementById('sol-waste');
      if (wastePile) {
        wastePile.innerHTML = '';
        if (this.drawn.length > 0) {
          const top = this.drawn[this.drawn.length - 1];
          wastePile.appendChild(this.createCardEl(top));
        }
      }

      const tableauEl = document.getElementById('sol-tableau');
      if (tableauEl) {
        tableauEl.innerHTML = '';
        for (let c = 0; c < 7; c++) {
          const colEl = document.createElement('div');
          colEl.className = 'tableau-col';
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
        cardEl.className = 'card-pile';
        cardEl.innerHTML = '<div class="card-back-pattern"></div>';
      } else {
        cardEl.className = `playing-card ${card.isRed ? 'card-red' : 'card-black'}`;
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
  document.getElementById('sol-deck')?.addEventListener('click', () => Solitaire.drawCard());
  document.getElementById('sol-menu-deal')?.addEventListener('click', () => Solitaire.init());

  const dosInput = document.getElementById('w31-dos-input');
  const dosOutput = document.getElementById('w31-dos-output');
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
          resp.textContent = 'MS-DOS Version 6.22';
        } else if (val === 'DIR') {
          resp.innerHTML = 'Volume in drive C is MS-DOS_622<br>PROGMAN  EXE   115,312 11-01-93<br>SOL      EXE   180,688 11-01-93<br>WINMINE  EXE    27,968 11-01-93<br>PBRUSH   EXE   183,168 11-01-93<br>CALC     EXE    43,072 11-01-93<br>NOTEPAD  EXE    32,736 11-01-93<br>WIN      COM     4,220 11-01-93';
        } else if (val === 'HELP') {
          resp.textContent = 'Supported commands: DIR, VER, HELP, CLS, DATE, EXIT';
        } else if (val === 'CLS') {
          dosOutput.innerHTML = '';
          return;
        } else if (val === 'DATE') {
          resp.textContent = `Current date is ${new Date().toLocaleDateString()}`;
        } else if (val === 'EXIT') {
          document.getElementById('win-dos')?.classList.add('hidden');
          return;
        } else if (val !== '') {
          resp.textContent = `Bad command or file name`;
        }
        dosOutput.appendChild(resp);
      }
    });
  }

  // Windows 3.1 Tada.wav Web Audio Synthesizer
  function playTadaSound() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (!audioCtx) return;
    try {
      const notes = [
        { f: 523.25, start: 0.0, dur: 0.18 }, // C5
        { f: 659.25, start: 0.15, dur: 0.18 }, // E5
        { f: 783.99, start: 0.30, dur: 0.55 }, // G5
        { f: 1046.50, start: 0.30, dur: 0.55 } // C6
      ];
      notes.forEach(n => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, audioCtx.currentTime + n.start);
        gain.gain.setValueAtTime(0.09, audioCtx.currentTime + n.start);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + n.start + n.dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + n.start);
        osc.stop(audioCtx.currentTime + n.start + n.dur);
      });
    } catch (e) {}
  }

  window.addEventListener('click', function onInitTada() {
    playTadaSound();
    window.removeEventListener('click', onInitTada);
  }, { once: true });

  // Manejador de salida y reinicio a Boot Manager
  document.getElementById('prog-exit')?.addEventListener('click', () => {
    playWin31Click();
    document.getElementById('w31-exit-dialog')?.classList.remove('hidden');
  });

  document.getElementById('progman-file-menu')?.addEventListener('click', () => {
    playWin31Click();
  });

  document.getElementById('w31-btn-exit-ok')?.addEventListener('click', () => {
    const radios = document.getElementsByName('w31-exit-opt');
    let sel = 'reboot';
    for (let r of radios) {
      if (r.checked) sel = r.value;
    }
    if (sel === 'reboot') {
      window.location.href = '../index.html';
    } else {
      document.getElementById('w31-exit-dialog')?.classList.add('hidden');
      document.getElementById('win-dos')?.classList.remove('hidden');
      bringFront(document.getElementById('win-dos'));
    }
  });

  // File Manager Executables launch
  document.querySelectorAll('#win-fileman tbody tr').forEach(row => {
    row.style.cursor = 'pointer';
    row.addEventListener('dblclick', () => {
      const name = row.children[0]?.textContent.trim();
      playWin31Click();
      if (name === 'SOL.EXE') {
        const w = document.getElementById('win-solitaire');
        w?.classList.remove('hidden');
        if (w) bringFront(w);
      } else if (name === 'WINMINE.EXE') {
        const w = document.getElementById('win-mines');
        w?.classList.remove('hidden');
        if (w) bringFront(w);
      } else if (name === 'PBRUSH.EXE') {
        const w = document.getElementById('win-pbrush');
        w?.classList.remove('hidden');
        if (w) bringFront(w);
      } else if (name === 'CALC.EXE') {
        const w = document.getElementById('win-calc');
        w?.classList.remove('hidden');
        if (w) bringFront(w);
      } else if (name === 'NOTEPAD.EXE' || name === 'SYSTEM.INI' || name === 'WIN.INI') {
        const w = document.getElementById('win-notepad');
        w?.classList.remove('hidden');
        if (w) bringFront(w);
      } else if (name === 'PROGMAN.EXE') {
        const w = document.getElementById('win-progman');
        w?.classList.remove('hidden');
        if (w) bringFront(w);
      }
    });
  });

  document.querySelectorAll('.w31-window').forEach(w => {
    w.addEventListener('mousedown', () => bringFront(w));
  });
})();
