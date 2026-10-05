/* Windows 1.01 Simulator Script */
(function () {
  'use strict';

  let audioCtx = null;
  let beepsEnabled = true;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  }

  function playSpeakerBeep(freq, dur) {
    if (!beepsEnabled) return;
    initAudio();
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq || 750, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (dur || 0.05));
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + (dur || 0.05));
    } catch (e) {}
  }

  const fileDatabase = [
    { name: 'REVERSI.EXE', size: '16,384', date: '11-20-85', time: '12:00p', isProg: true },
    { name: 'CLOCK.EXE', size: '10,240', date: '11-20-85', time: '12:00p', isProg: true },
    { name: 'CALC.EXE', size: '14,336', date: '11-20-85', time: '12:00p', isProg: true },
    { name: 'NOTEPAD.EXE', size: '18,432', date: '11-20-85', time: '12:00p', isProg: true },
    { name: 'CONTROL.EXE', size: '12,800', date: '11-20-85', time: '12:00p', isProg: true },
    { name: 'CALENDAR.EXE', size: '20,480', date: '11-20-85', time: '12:00p', isProg: true },
    { name: 'PAINT.EXE', size: '32,768', date: '11-20-85', time: '12:00p', isProg: true },
    { name: 'CARDFILE.EXE', size: '24,576', date: '11-20-85', time: '12:00p', isProg: true },
    { name: 'SPOOLER.EXE', size: '8,192', date: '11-20-85', time: '12:00p', isProg: true },
    { name: 'TERMINAL.EXE', size: '22,528', date: '11-20-85', time: '12:00p', isProg: true },
    { name: 'WIN.INI', size: '1,420', date: '11-20-85', time: '12:00p', isProg: false },
    { name: 'PRACTICE.DOC', size: '2,840', date: '11-20-85', time: '12:00p', isProg: false },
    { name: 'README.TXT', size: '3,200', date: '11-20-85', time: '12:00p', isProg: false },
    { name: 'EXIT.COM', size: '512', date: '11-20-85', time: '12:00p', isProg: true }
  ];

  let currentViewMode = 'short';
  let currentFilter = 'all';

  function renderFileList() {
    const container = document.getElementById('file-list-container');
    if (!container) return;
    container.innerHTML = '';

    if (currentViewMode === 'long') {
      container.classList.add('list-view-long');
    } else {
      container.classList.remove('list-view-long');
    }

    const files = fileDatabase.filter(f => currentFilter === 'all' || (currentFilter === 'programs' && f.isProg));

    files.forEach(f => {
      const entry = document.createElement('div');
      entry.className = 'file-entry';
      entry.setAttribute('data-file', f.name);

      if (currentViewMode === 'long') {
        entry.innerHTML = `<span style="display:inline-block; width:130px;">${f.name}</span> <span style="display:inline-block; width:80px; text-align:right;">${f.size}</span> <span style="display:inline-block; width:90px; text-align:right;">${f.date}</span> <span style="display:inline-block; width:70px; text-align:right;">${f.time}</span>`;
      } else {
        entry.textContent = f.name;
      }

      entry.addEventListener('dblclick', () => {
        executeFile(f.name);
      });

      entry.addEventListener('click', () => {
        document.querySelectorAll('.file-entry').forEach(e => e.classList.remove('selected'));
        entry.classList.add('selected');
        playSpeakerBeep(900, 0.03);
      });

      container.appendChild(entry);
    });
  }

  function executeFile(fileName) {
    playSpeakerBeep(850, 0.05);
    const upper = fileName.toUpperCase().trim();
    if (upper === 'REVERSI.EXE') {
      document.getElementById('tile-reversi')?.classList.remove('hidden');
    } else if (upper === 'CLOCK.EXE') {
      document.getElementById('tile-clock')?.classList.remove('hidden');
    } else if (upper === 'CALC.EXE') {
      document.getElementById('tile-calc')?.classList.remove('hidden');
    } else if (upper === 'NOTEPAD.EXE') {
      document.getElementById('tile-notepad')?.classList.remove('hidden');
    } else if (upper === 'PAINT.EXE') {
      document.getElementById('tile-paint')?.classList.remove('hidden');
    } else if (upper === 'CARDFILE.EXE') {
      document.getElementById('tile-cardfile')?.classList.remove('hidden');
    } else if (upper === 'CONTROL.EXE') {
      document.getElementById('tile-control')?.classList.remove('hidden');
    } else if (upper === 'README.TXT' || upper === 'PRACTICE.DOC' || upper === 'WIN.INI') {
      const np = document.getElementById('tile-notepad');
      np?.classList.remove('hidden');
      const ta = document.getElementById('notepad-textarea');
      if (ta) {
        if (upper === 'README.TXT') {
          ta.value = "README.TXT - Microsoft Windows 1.01\n==================================\nWelcome to Microsoft Windows!\nRun REVERSI.EXE for recreation.\nRun PAINT.EXE for bitmap illustrations.\nRun CARDFILE.EXE to manage address records.";
        } else if (upper === 'WIN.INI') {
          ta.value = "[windows]\nspooler=yes\nDoubleClickSpeed=500\nCursorBlinkRate=530\n\n[colors]\nBackground=0 0 170\nWindow=255 255 255";
        }
      }
    } else if (upper === 'EXIT.COM') {
      document.getElementById('win1-exit-modal')?.classList.remove('hidden');
    } else {
      alert(`MS-DOS Executive: Cannot execute ${fileName}`);
    }
  }

  renderFileList();

  const clockCanvas = document.getElementById('clock-canvas');
  if (clockCanvas) {
    const ctx = clockCanvas.getContext('2d');
    const radius = clockCanvas.width / 2;

    function drawClock() {
      ctx.clearRect(0, 0, clockCanvas.width, clockCanvas.height);
      ctx.beginPath();
      ctx.arc(radius, radius, radius - 4, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      for (let num = 1; num <= 12; num++) {
        const ang = (num * Math.PI) / 6;
        ctx.rotate(ang);
        ctx.translate(0, -radius * 0.82);
        ctx.rotate(-ang);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(num.toString(), radius, radius);
        ctx.rotate(ang);
        ctx.translate(0, radius * 0.82);
        ctx.rotate(-ang);
      }

      const now = new Date();
      let hour = now.getHours() % 12;
      let minute = now.getMinutes();
      let second = now.getSeconds();

      const hourPos = (hour * Math.PI / 6) + (minute * Math.PI / (6 * 60));
      drawHand(ctx, hourPos, radius * 0.5, 4);

      const minutePos = (minute * Math.PI / 30) + (second * Math.PI / (30 * 60));
      drawHand(ctx, minutePos, radius * 0.75, 3);

      const secondPos = (second * Math.PI / 30);
      drawHand(ctx, secondPos, radius * 0.85, 1, '#aa0000');
    }

    function drawHand(context, pos, length, width, color) {
      context.beginPath();
      context.lineWidth = width;
      context.lineCap = 'round';
      context.strokeStyle = color || '#000000';
      context.moveTo(radius, radius);
      context.lineTo(radius + length * Math.sin(pos), radius - length * Math.cos(pos));
      context.stroke();
    }

    setInterval(drawClock, 1000);
    drawClock();
  }

  const Reversi = {
    size: 8,
    board: [],
    turn: 'black',
    gameOver: false,
    skill: 'novice',

    init: function () {
      const boardEl = document.getElementById('reversi-board');
      if (!boardEl) return;
      boardEl.innerHTML = '';
      this.board = [];
      this.gameOver = false;
      this.turn = 'black';

      for (let r = 0; r < this.size; r++) {
        this.board[r] = [];
        for (let c = 0; c < this.size; c++) {
          this.board[r][c] = null;
          const cell = document.createElement('div');
          cell.className = 'reversi-cell';
          cell.setAttribute('data-r', r);
          cell.setAttribute('data-c', c);

          cell.addEventListener('click', () => {
            this.handleCellClick(r, c);
          });

          boardEl.appendChild(cell);
        }
      }

      this.board[3][3] = 'white';
      this.board[3][4] = 'black';
      this.board[4][3] = 'black';
      this.board[4][4] = 'white';
      this.render();
    },

    render: function () {
      const cells = document.querySelectorAll('.reversi-cell');
      let blackCount = 0;
      let whiteCount = 0;

      cells.forEach(cell => {
        const r = parseInt(cell.getAttribute('data-r'), 10);
        const c = parseInt(cell.getAttribute('data-c'), 10);
        cell.innerHTML = '';

        const piece = this.board[r][c];
        if (piece) {
          const pieceEl = document.createElement('div');
          pieceEl.className = `reversi-piece piece-${piece}`;
          cell.appendChild(pieceEl);
          if (piece === 'black') blackCount++;
          if (piece === 'white') whiteCount++;
        }
      });

      const scoreEl = document.getElementById('reversi-score');
      if (scoreEl) {
        scoreEl.textContent = `Turno: ${this.turn === 'black' ? 'Negras' : 'Blancas'} | Negras: ${blackCount} | Blancas: ${whiteCount}`;
      }
    },

    isValidMove: function (r, c, player) {
      if (this.board[r][c] !== null) return false;
      const opponent = player === 'black' ? 'white' : 'black';
      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ];

      for (let [dr, dc] of directions) {
        let nr = r + dr;
        let nc = c + dc;
        let foundOpponent = false;

        while (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size && this.board[nr][nc] === opponent) {
          nr += dr;
          nc += dc;
          foundOpponent = true;
        }

        if (foundOpponent && nr >= 0 && nr < this.size && nc >= 0 && nc < this.size && this.board[nr][nc] === player) {
          return true;
        }
      }
      return false;
    },

    handleCellClick: function (r, c) {
      if (this.gameOver) return;
      if (!this.isValidMove(r, c, this.turn)) {
        playSpeakerBeep(300, 0.08);
        return;
      }

      playSpeakerBeep(850, 0.05);
      this.makeMove(r, c, this.turn);

      this.turn = this.turn === 'black' ? 'white' : 'black';
      this.render();

      if (this.turn === 'white') {
        setTimeout(() => this.makeAIMove(), 500);
      }
    },

    makeMove: function (r, c, player) {
      this.board[r][c] = player;
      const opponent = player === 'black' ? 'white' : 'black';
      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ];

      for (let [dr, dc] of directions) {
        let nr = r + dr;
        let nc = c + dc;
        let toFlip = [];

        while (nr >= 0 && nr < this.size && nc >= 0 && nc < this.size && this.board[nr][nc] === opponent) {
          toFlip.push([nr, nc]);
          nr += dr;
          nc += dc;
        }

        if (toFlip.length > 0 && nr >= 0 && nr < this.size && nc >= 0 && nc < this.size && this.board[nr][nc] === player) {
          for (let [fr, fc] of toFlip) {
            this.board[fr][fc] = player;
          }
        }
      }
    },

    makeAIMove: function () {
      let validMoves = [];
      for (let r = 0; r < this.size; r++) {
        for (let c = 0; c < this.size; c++) {
          if (this.isValidMove(r, c, 'white')) {
            validMoves.push([r, c]);
          }
        }
      }

      if (validMoves.length > 0) {
        const choice = validMoves[Math.floor(Math.random() * validMoves.length)];
        this.makeMove(choice[0], choice[1], 'white');
        playSpeakerBeep(650, 0.05);
      }

      this.turn = 'black';
      this.render();
    }
  };

  Reversi.init();
  document.getElementById('btn-reversi-new')?.addEventListener('click', () => {
    playSpeakerBeep(700, 0.05);
    Reversi.init();
  });
  document.getElementById('btn-reversi-skill')?.addEventListener('click', (e) => {
    playSpeakerBeep(700, 0.05);
    Reversi.skill = Reversi.skill === 'novice' ? 'expert' : 'novice';
    e.target.textContent = `Skill: ${Reversi.skill === 'novice' ? 'Novice' : 'Expert'}`;
  });

  const calcScreen = document.getElementById('calc-cga-display');
  let calcVal = '0';
  let calcPrev = null;
  let calcOp = null;
  let calcReset = false;

  document.querySelectorAll('.cga-key').forEach(btn => {
    btn.addEventListener('click', () => {
      const k = btn.getAttribute('data-k');
      playSpeakerBeep(800, 0.03);

      if (!isNaN(k) || k === '.') {
        if (calcReset || calcVal === '0') {
          calcVal = k === '.' ? '0.' : k;
          calcReset = false;
        } else {
          calcVal += k;
        }
        if (calcScreen) calcScreen.textContent = calcVal;
      } else if (k === '=') {
        if (calcPrev !== null && calcOp) {
          const a = parseFloat(calcPrev);
          const b = parseFloat(calcVal);
          let res = 0;
          if (calcOp === '+') res = a + b;
          if (calcOp === '-') res = a - b;
          if (calcOp === '*') res = a * b;
          if (calcOp === '/') res = b !== 0 ? a / b : 'ERROR';
          calcVal = String(res);
          calcPrev = null;
          calcOp = null;
          calcReset = true;
          if (calcScreen) calcScreen.textContent = calcVal;
        }
      } else {
        calcPrev = calcVal;
        calcOp = k;
        calcReset = true;
      }
    });
  });

  document.getElementById('calc-cga-c')?.addEventListener('click', () => {
    playSpeakerBeep(600, 0.04);
    calcVal = '0';
    calcPrev = null;
    calcOp = null;
    if (calcScreen) calcScreen.textContent = '0';
  });

  document.getElementById('notepad-new-btn')?.addEventListener('click', () => {
    playSpeakerBeep(750, 0.04);
    const area = document.getElementById('notepad-textarea');
    if (area) area.value = '';
  });

  document.getElementById('notepad-time-btn')?.addEventListener('click', () => {
    playSpeakerBeep(750, 0.04);
    const area = document.getElementById('notepad-textarea');
    if (area) {
      const d = new Date().toLocaleString();
      area.value += `\n[${d}]\n`;
    }
  });

  document.getElementById('control-palette-sel')?.addEventListener('change', (e) => {
    playSpeakerBeep(700, 0.04);
    document.body.className = '';
    if (e.target.value !== 'cga-default') {
      document.body.classList.add(e.target.value);
    }
  });

  document.getElementById('control-beep-chk')?.addEventListener('change', (e) => {
    beepsEnabled = e.target.checked;
    if (beepsEnabled) playSpeakerBeep(1000, 0.05);
  });

  setInterval(() => {
    const liveTimeEl = document.getElementById('control-live-time');
    if (liveTimeEl) liveTimeEl.textContent = new Date().toLocaleTimeString();
  }, 1000);

  function hideAllDropdowns() {
    document.querySelectorAll('.win1-dropdown').forEach(d => d.classList.add('hidden'));
  }

  document.getElementById('dos-file-menu')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const d = document.getElementById('dropdown-file');
    const wasHidden = d.classList.contains('hidden');
    hideAllDropdowns();
    if (wasHidden) d.classList.remove('hidden');
    playSpeakerBeep(800, 0.03);
  });

  document.getElementById('dos-view-menu')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const d = document.getElementById('dropdown-view');
    const wasHidden = d.classList.contains('hidden');
    hideAllDropdowns();
    if (wasHidden) d.classList.remove('hidden');
    playSpeakerBeep(800, 0.03);
  });

  document.getElementById('dos-special-menu')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const d = document.getElementById('dropdown-special');
    const wasHidden = d.classList.contains('hidden');
    hideAllDropdowns();
    if (wasHidden) d.classList.remove('hidden');
    playSpeakerBeep(800, 0.03);
  });

  window.addEventListener('click', hideAllDropdowns);

  document.getElementById('view-short')?.addEventListener('click', () => {
    currentViewMode = 'short';
    document.getElementById('view-short').textContent = '✓ Short';
    document.getElementById('view-long').textContent = 'Long';
    renderFileList();
  });

  document.getElementById('view-long')?.addEventListener('click', () => {
    currentViewMode = 'long';
    document.getElementById('view-short').textContent = 'Short';
    document.getElementById('view-long').textContent = '✓ Long';
    renderFileList();
  });

  document.getElementById('view-all')?.addEventListener('click', () => {
    currentFilter = 'all';
    renderFileList();
  });

  document.getElementById('view-programs')?.addEventListener('click', () => {
    currentFilter = 'programs';
    renderFileList();
  });

  const runModal = document.getElementById('win1-run-modal');
  const aboutModal = document.getElementById('win1-about-modal');
  const exitModal = document.getElementById('win1-exit-modal');

  document.getElementById('menu-file-run')?.addEventListener('click', () => {
    runModal?.classList.remove('hidden');
    document.getElementById('win1-run-input')?.focus();
  });

  document.getElementById('btn-run-ok')?.addEventListener('click', () => {
    const val = document.getElementById('win1-run-input')?.value || '';
    runModal?.classList.add('hidden');
    executeFile(val);
  });

  document.getElementById('btn-run-cancel')?.addEventListener('click', () => {
    runModal?.classList.add('hidden');
  });

  document.getElementById('menu-file-print')?.addEventListener('click', () => {
    playSpeakerBeep(400, 0.1);
    alert('Spooler: Sending file to LPT1: PRINTER');
  });

  document.getElementById('menu-file-exit')?.addEventListener('click', () => {
    exitModal?.classList.remove('hidden');
  });

  document.getElementById('special-end-session')?.addEventListener('click', () => {
    exitModal?.classList.remove('hidden');
  });

  document.getElementById('special-create-dir')?.addEventListener('click', () => {
    const dName = prompt('New directory name:');
    if (dName) {
      fileDatabase.unshift({ name: dName.toUpperCase(), size: '<DIR>', date: '11-20-85', time: '12:00p', isProg: false });
      renderFileList();
    }
  });

  document.getElementById('special-about')?.addEventListener('click', () => {
    aboutModal?.classList.remove('hidden');
  });

  document.getElementById('btn-about-ok')?.addEventListener('click', () => {
    aboutModal?.classList.add('hidden');
  });

  document.getElementById('win1-btn-reboot')?.addEventListener('click', () => {
    window.location.href = '../index.html';
  });

  document.getElementById('win1-btn-cancel')?.addEventListener('click', () => {
    exitModal?.classList.add('hidden');
  });

  document.querySelectorAll('.btn-close-tile').forEach(btn => {
    btn.addEventListener('click', (e) => {
      playSpeakerBeep(500, 0.04);
      const targetId = btn.getAttribute('data-target');
      const tile = document.getElementById(targetId);
      if (tile) tile.classList.add('hidden');
    });
  });

  document.getElementById('bar-dos')?.addEventListener('click', () => {
    document.getElementById('tile-dos')?.classList.toggle('hidden');
  });

  document.getElementById('bar-reversi')?.addEventListener('click', () => {
    document.getElementById('tile-reversi')?.classList.toggle('hidden');
  });

  document.getElementById('bar-clock')?.addEventListener('click', () => {
    document.getElementById('tile-clock')?.classList.toggle('hidden');
  });

  document.getElementById('bar-calc')?.addEventListener('click', () => {
    document.getElementById('tile-calc')?.classList.toggle('hidden');
  });

  document.getElementById('bar-notepad')?.addEventListener('click', () => {
    document.getElementById('tile-notepad')?.classList.toggle('hidden');
  });

  document.getElementById('bar-paint')?.addEventListener('click', () => {
    document.getElementById('tile-paint')?.classList.toggle('hidden');
  });

  document.getElementById('bar-cardfile')?.addEventListener('click', () => {
    document.getElementById('tile-cardfile')?.classList.toggle('hidden');
  });

  document.getElementById('bar-control')?.addEventListener('click', () => {
    document.getElementById('tile-control')?.classList.toggle('hidden');
  });

  // Paint 1.0 Implementation
  (function initPaint1() {
    const canvas = document.getElementById('paint-cga-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let currentTool = 'pencil';
    let isDrawing = false;
    let startX = 0, startY = 0;
    let snapshot = null;

    document.querySelectorAll('.paint-cga-tool').forEach(btn => {
      btn.addEventListener('click', () => {
        playSpeakerBeep(800, 0.03);
        document.querySelectorAll('.paint-cga-tool').forEach(b => b.classList.remove('active'));
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
      ctx.fillStyle = '#000000';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = currentTool === 'brush' ? 4 : 1;

      if (currentTool === 'pencil' || currentTool === 'brush') {
        ctx.beginPath();
        ctx.moveTo(x, y);
      } else if (currentTool === 'spray') {
        spray(x, y);
      } else if (currentTool === 'eraser') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 4, y - 4, 8, 8);
      }
    });

    canvas.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      const { x, y } = getCoords(e);

      if (currentTool === 'pencil' || currentTool === 'brush') {
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (currentTool === 'spray') {
        spray(x, y);
      } else if (currentTool === 'eraser') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - 4, y - 4, 8, 8);
      } else if (currentTool === 'line') {
        ctx.putImageData(snapshot, 0, 0);
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (currentTool === 'rect') {
        ctx.putImageData(snapshot, 0, 0);
        ctx.strokeRect(startX, startY, x - startX, y - startY);
      }
    });

    window.addEventListener('mouseup', () => {
      isDrawing = false;
    });

    function spray(cx, cy) {
      ctx.fillStyle = '#000000';
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const rad = Math.random() * 8;
        ctx.fillRect(Math.floor(cx + Math.cos(angle) * rad), Math.floor(cy + Math.sin(angle) * rad), 1, 1);
      }
    }

    document.getElementById('paint-cga-clear')?.addEventListener('click', () => {
      playSpeakerBeep(600, 0.05);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    });

    document.getElementById('paint-cga-invert')?.addEventListener('click', () => {
      playSpeakerBeep(700, 0.05);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        d[i] = 255 - d[i];
        d[i + 1] = 255 - d[i + 1];
        d[i + 2] = 255 - d[i + 2];
      }
      ctx.putImageData(imgData, 0, 0);
    });
  })();

  // Cardfile 1.0 Implementation
  (function initCardfile() {
    const cards = [
      {
        title: 'Gates, Bill - Microsoft Corp.',
        body: 'One Microsoft Way\nRedmond, WA 98052\nPhone: (206) 882-8080\nNotes: Founder & CEO of Microsoft'
      },
      {
        title: 'Allen, Paul - Microsoft Corp.',
        body: 'One Microsoft Way\nRedmond, WA 98052\nNotes: Co-founder of Microsoft & Technologist'
      },
      {
        title: 'Ballmer, Steve - Systems Div.',
        body: 'Microsoft Systems Division\nBellevue, WA\nNotes: Windows 1.0 Product Management'
      }
    ];

    let currentCardIndex = 0;
    const titleEl = document.getElementById('cardfile-title');
    const bodyEl = document.getElementById('cardfile-body');
    const countEl = document.getElementById('cardfile-count');

    function renderCard() {
      if (!titleEl || !bodyEl || !countEl) return;
      const c = cards[currentCardIndex];
      titleEl.textContent = c.title;
      bodyEl.value = c.body;
      countEl.textContent = `Card ${currentCardIndex + 1} of ${cards.length}`;
    }

    document.getElementById('cardfile-prev')?.addEventListener('click', () => {
      playSpeakerBeep(800, 0.03);
      currentCardIndex = (currentCardIndex - 1 + cards.length) % cards.length;
      renderCard();
    });

    document.getElementById('cardfile-next')?.addEventListener('click', () => {
      playSpeakerBeep(800, 0.03);
      currentCardIndex = (currentCardIndex + 1) % cards.length;
      renderCard();
    });

    document.getElementById('cardfile-new')?.addEventListener('click', () => {
      playSpeakerBeep(900, 0.05);
      const name = prompt('Card index line / title:');
      if (name) {
        cards.push({ title: name, body: 'Write details here...' });
        currentCardIndex = cards.length - 1;
        renderCard();
      }
    });

    bodyEl?.addEventListener('input', () => {
      if (cards[currentCardIndex]) cards[currentCardIndex].body = bodyEl.value;
    });

    renderCard();
  })();
})();
