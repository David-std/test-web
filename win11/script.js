/* Windows 11 Pro Script */
(function () {
  'use strict';

  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  }

  function playWin11Chime() {
    initAudio();
    if (!audioCtx) return;
    try {
      const notes = [369.99, 554.37, 739.99, 932.33];
      const now = audioCtx.currentTime;
      notes.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.04, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.8);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.8);
      });
    } catch (e) {}
  }

  function playClickSound() {
    initAudio();
    if (!audioCtx) return;
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.03);
    } catch (e) {}
  }

  let topZIndex = 100;
  const startBtn = document.getElementById('w11-start-btn');
  const startMenu = document.getElementById('w11-start-menu');
  const powerBtn = document.getElementById('w11-power-btn');
  const powerPopup = document.getElementById('w11-power-popup');
  const widgetsBtn = document.getElementById('w11-widgets-btn');
  const widgetsBoard = document.getElementById('w11-widgets-board');
  const widgetsCloseBtn = document.getElementById('widgets-close-btn');

  startBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    playWin11Chime();
    startMenu?.classList.toggle('hidden');
    widgetsBoard?.classList.remove('open');
  });

  powerBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    playClickSound();
    powerPopup?.classList.toggle('hidden');
  });

  widgetsBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    playClickSound();
    widgetsBoard?.classList.toggle('open');
    startMenu?.classList.add('hidden');
  });

  widgetsCloseBtn?.addEventListener('click', () => {
    playClickSound();
    widgetsBoard?.classList.remove('open');
  });

  const quickPill = document.getElementById('w11-quick-pill');
  const quickFlyout = document.getElementById('w11-quick-flyout');
  const snapFlyout = document.getElementById('w11-snap-flyout');
  const copilotBtn = document.getElementById('w11-copilot-btn');
  const copilotFlyout = document.getElementById('w11-copilot-flyout');
  const copilotCloseBtn = document.getElementById('copilot-close-btn');
  const copilotClearBtn = document.getElementById('copilot-clear-btn');
  const copilotInput = document.getElementById('copilot-user-input');
  const copilotSendBtn = document.getElementById('copilot-send-btn');
  const copilotChatHistory = document.getElementById('copilot-chat-history');

  function toggleCopilot(open) {
    playClickSound();
    const backdrop = document.getElementById('w11-copilot-backdrop');
    const shouldOpen = typeof open === 'boolean' ? open : copilotFlyout?.classList.contains('hidden');
    if (shouldOpen) {
      copilotFlyout?.classList.remove('hidden');
      backdrop?.classList.remove('hidden');
      startMenu?.classList.add('hidden');
      widgetsBoard?.classList.remove('open');
      copilotBtn?.classList.add('active');
      setTimeout(() => copilotInput?.focus(), 150);
    } else {
      copilotFlyout?.classList.add('hidden');
      backdrop?.classList.add('hidden');
      copilotBtn?.classList.remove('active');
    }
  }

  copilotBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleCopilot();
  });

  copilotCloseBtn?.addEventListener('click', () => {
    playClickSound();
    toggleCopilot(false);
  });

  // Second close button (chrome X on right panel)
  document.getElementById('copilot-close-btn2')?.addEventListener('click', () => {
    playClickSound();
    toggleCopilot(false);
  });

  // Notification center toggle
  const notifCenter = document.getElementById('w11-notif-center');
  const w11Clock = document.getElementById('w11-clock');
  w11Clock?.addEventListener('click', (e) => {
    e.stopPropagation();
    playClickSound();
    notifCenter?.classList.toggle('hidden');
    quickFlyout?.classList.add('hidden');
    startMenu?.classList.add('hidden');
  });
  document.getElementById('nc-clear-all')?.addEventListener('click', () => {
    document.querySelectorAll('.nc-notif').forEach(n => n.remove());
  });
  document.querySelectorAll('.nc-notif-close').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.nc-notif')?.remove());
  });

  quickPill?.addEventListener('click', (e) => {
    e.stopPropagation();
    playClickSound();
    quickFlyout?.classList.toggle('hidden');
    startMenu?.classList.add('hidden');
    widgetsBoard?.classList.remove('open');
    copilotFlyout?.classList.add('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#w11-start-menu') && !e.target.closest('#w11-start-btn')) {
      startMenu?.classList.add('hidden');
      powerPopup?.classList.add('hidden');
    }
    if (!e.target.closest('#w11-widgets-board') && !e.target.closest('#w11-widgets-btn')) {
      widgetsBoard?.classList.remove('open');
    }
    if (!e.target.closest('#w11-quick-flyout') && !e.target.closest('#w11-quick-pill')) {
      quickFlyout?.classList.add('hidden');
    }
    if (!e.target.closest('#w11-notif-center') && !e.target.closest('#w11-clock')) {
      notifCenter?.classList.add('hidden');
    }
    if (!e.target.closest('#w11-copilot-flyout') && !e.target.closest('#w11-copilot-btn')) {
      if (!copilotFlyout?.classList.contains('hidden')) {
        toggleCopilot(false);
      }
    }
    if (!e.target.closest('#w11-snap-flyout') && !e.target.closest('.w11-ctrl-max')) {
      snapFlyout?.classList.add('hidden');
    }
  });

  // Close copilot when clicking backdrop
  document.getElementById('w11-copilot-backdrop')?.addEventListener('click', () => toggleCopilot(false));

  window.addEventListener('keydown', (e) => {
    if ((e.key === 'c' || e.key === 'C') && (e.altKey || (e.ctrlKey && e.shiftKey))) {
      e.preventDefault();
      toggleCopilot();
    }
  });

  function appendCopilotMessage(sender, text) {
    if (!copilotChatHistory) return;
    const msg = document.createElement('div');
    msg.className = `copilot-msg ${sender}`;
    msg.innerHTML = text.replace(/\n/g, '<br>');
    copilotChatHistory.appendChild(msg);
    copilotChatHistory.scrollTop = copilotChatHistory.scrollHeight;
  }

  function handleCopilotAction(action) {
    playClickSound();
    if (action === 'dark-mode') {
      appendCopilotMessage('user', 'Activar Modo Oscuro');
      if (!document.body.classList.contains('dark-mode')) toggleTheme();
      setTimeout(() => {
        appendCopilotMessage('bot', '🌙 He activado el Modo Oscuro en Windows 11 para proteger tu vista y resaltar los contrastes del fondo Bloom.');
      }, 400);
    } else if (action === 'light-mode') {
      appendCopilotMessage('user', 'Activar Modo Claro');
      if (document.body.classList.contains('dark-mode')) toggleTheme();
      setTimeout(() => {
        appendCopilotMessage('bot', '☀️ He activado el Modo Claro con la estética luminosa y etérea de Windows 11.');
      }, 400);
    } else if (action === 'open-explorer') {
      appendCopilotMessage('user', 'Abrir Explorador con Pestañas');
      openWindow('win-pc');
      setTimeout(() => {
        appendCopilotMessage('bot', '📁 He abierto el Explorador de archivos con su barra de comandos moderna y pestañas.');
      }, 400);
    } else if (action === 'open-terminal') {
      appendCopilotMessage('user', 'Abrir Windows Terminal');
      openWindow('win-terminal');
      setTimeout(() => {
        appendCopilotMessage('bot', '💻 He iniciado Windows Terminal con PowerShell listo para ejecutar comandos.');
      }, 400);
    } else if (action === 'system-specs') {
      appendCopilotMessage('user', '¿Qué novedades tiene Windows 11?');
      setTimeout(() => {
        appendCopilotMessage('bot', '✨ **Novedades principales de Windows 11:**\n• Diseño centrado con material Mica y Fluent Design.\n• Explorador con pestañas nativas.\n• Asistente Copilot con IA integrado en la barra de tareas.\n• Snap Layouts al pasar el cursor sobre maximizar.\n• Tablero de Widgets en vivo y nueva Windows Terminal.');
      }, 400);
    } else if (action === 'poem') {
      appendCopilotMessage('user', 'Escribe un poema sobre Windows');
      setTimeout(() => {
        appendCopilotMessage('bot', '🎨 *Ventanas que abren mundos sin final,*\n*un fondo Bloom de azul etéreo y puro,*\n*la luz que danza en vidrio y cristal,*\n*guiando tu camino hacia el futuro.*');
      }, 400);
    } else if (action === 'open-taskmgr') {
      appendCopilotMessage('user', 'Abrir Administrador de tareas');
      openWindow('win-taskmgr');
      setTimeout(() => {
        appendCopilotMessage('bot', 'Abriendo el Administrador de tareas. Puedes ver el rendimiento de CPU, memoria y red en tiempo real.');
      }, 400);
    } else if (action === 'open-settings') {
      appendCopilotMessage('user', 'Abrir Configuración');
      openWindow('win-settings');
      setTimeout(() => {
        appendCopilotMessage('bot', 'Abriendo la app de Configuración de Windows 11. Aquí puedes personalizar el sistema, gestionar cuentas y actualizar Windows.');
      }, 400);
    }
  }

  // Wire all chip variants (old .copilot-chip and new .cp-chip-card)
  document.querySelectorAll('.copilot-chip[data-action], .cp-chip-card[data-action]').forEach(chip => {
    chip.addEventListener('click', () => {
      handleCopilotAction(chip.getAttribute('data-action'));
    });
  });

  function submitCopilotInput() {
    if (!copilotInput) return;
    const txt = copilotInput.value.trim();
    if (!txt) return;
    copilotInput.value = '';
    playClickSound();
    appendCopilotMessage('user', txt);

    const lower = txt.toLowerCase();
    setTimeout(() => {
      if (lower.includes('oscuro') || lower.includes('noche')) {
        if (!document.body.classList.contains('dark-mode')) toggleTheme();
        appendCopilotMessage('bot', '🌙 He cambiado el sistema al Modo Oscuro como me has pedido.');
      } else if (lower.includes('claro') || lower.includes('dia') || lower.includes('día')) {
        if (document.body.classList.contains('dark-mode')) toggleTheme();
        appendCopilotMessage('bot', '☀️ He restaurado el sistema al Modo Claro.');
      } else if (lower.includes('explorador') || lower.includes('carpeta') || lower.includes('archivos')) {
        openWindow('win-pc');
        appendCopilotMessage('bot', '📁 Abriendo el Explorador de archivos con pestañas.');
      } else if (lower.includes('terminal') || lower.includes('cmd') || lower.includes('consola')) {
        openWindow('win-terminal');
        appendCopilotMessage('bot', '💻 Iniciando Windows Terminal.');
      } else if (lower.includes('tarea') || lower.includes('rendimiento') || lower.includes('taskmgr')) {
        openWindow('win-taskmgr');
        appendCopilotMessage('bot', '⚡ Abriendo el Administrador de tareas para que revises los procesos y el rendimiento del sistema.');
      } else if (lower.includes('ajuste') || lower.includes('configuracion') || lower.includes('configuración')) {
        openWindow('win-settings');
        appendCopilotMessage('bot', '⚙️ Abriendo la app de Configuración de Windows 11.');
      } else if (lower.includes('hola') || lower.includes('buenos') || lower.includes('buenas')) {
        appendCopilotMessage('bot', '👋 ¡Hola! Soy Copilot, tu asistente de inteligencia artificial en Windows 11. ¿En qué te puedo ayudar hoy?');
      } else if (lower.includes('quien eres') || lower.includes('quién eres')) {
        appendCopilotMessage('bot', '🤖 Soy Microsoft Copilot, integrado directamente en la barra de tareas de Windows 11 para ayudarte con tus tareas, responder preguntas y controlar el sistema.');
      } else {
        appendCopilotMessage('bot', `💡 Entendido. Como asistente IA de Windows 11, estoy procesando "${txt}". Puedo ayudarte a abrir aplicaciones (Explorador, Terminal, Ajustes), cambiar el tema a claro/oscuro o resolver dudas sobre el sistema.`);
      }
    }, 450);
  }

  copilotSendBtn?.addEventListener('click', submitCopilotInput);
  copilotInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitCopilotInput();
    }
  });

  copilotClearBtn?.addEventListener('click', () => {
    playClickSound();
    const chat = document.getElementById('copilot-chat-history');
    if (chat) {
      const welcome = document.getElementById('copilot-welcome-card');
      chat.innerHTML = '';
      if (welcome) chat.appendChild(welcome);
    }
  });

  function performRestart() {
    playWin11Chime();
    const restartScreen = document.getElementById('w11-restart-screen');
    if (restartScreen) {
      restartScreen.classList.remove('hidden');
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1600);
    } else {
      window.location.href = '../index.html';
    }
  }

  document.getElementById('w11-action-restart')?.addEventListener('click', performRestart);
  document.getElementById('w11-action-shutdown')?.addEventListener('click', performRestart);
  document.getElementById('w11-action-sleep')?.addEventListener('click', () => {
    powerPopup?.classList.add('hidden');
  });

  /* Alternador de Modo Claro / Oscuro */
  function toggleTheme() {
    playClickSound();
    if (document.body.classList.contains('dark-mode')) {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
    }
  }

  document.getElementById('theme-toggle-btn')?.addEventListener('click', toggleTheme);
  document.getElementById('settings-theme-btn')?.addEventListener('click', toggleTheme);

  /* Actualizar estado activo en la barra de tareas */
  function updateTaskbarPills() {
    document.querySelectorAll('.w11-task-btn[data-win]').forEach(btn => {
      const winId = btn.getAttribute('data-win');
      if (!winId) return;
      const win = document.getElementById(winId);
      if (win && !win.classList.contains('hidden')) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  function openWindow(winId) {
    playClickSound();
    startMenu?.classList.add('hidden');
    const win = document.getElementById(winId);
    if (win) {
      win.classList.remove('hidden');
      win.style.zIndex = ++topZIndex;
      updateTaskbarPills();
    }
  }

  function toggleWindow(winId) {
    const win = document.getElementById(winId);
    if (!win) return;
    if (win.classList.contains('hidden')) {
      openWindow(winId);
    } else if (parseInt(win.style.zIndex || '100', 10) === topZIndex) {
      win.classList.add('hidden');
      updateTaskbarPills();
    } else {
      win.style.zIndex = ++topZIndex;
      updateTaskbarPills();
    }
  }

  document.querySelectorAll('.w11-task-btn[data-win]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const winId = btn.getAttribute('data-win');
      if (winId) toggleWindow(winId);
    });
  });

  document.querySelectorAll('.w11-icon[data-win]').forEach(el => {
    el.addEventListener('click', () => {
      const winId = el.getAttribute('data-win');
      if (winId) openWindow(winId);
    });
  });

  document.querySelectorAll('.pinned-app[data-win]').forEach(el => {
    el.addEventListener('click', () => {
      const winId = el.getAttribute('data-win');
      if (winId) openWindow(winId);
    });
  });

  document.querySelectorAll('.w11-ctrl-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      playClickSound();
      const win = e.target.closest('.w11-window');
      if (win) {
        win.classList.add('hidden');
        updateTaskbarPills();
      }
    });
  });

  document.querySelectorAll('.w11-ctrl-min').forEach(btn => {
    btn.addEventListener('click', (e) => {
      playClickSound();
      const win = e.target.closest('.w11-window');
      if (win) {
        win.classList.add('hidden');
        updateTaskbarPills();
      }
    });
  });

  document.querySelectorAll('.w11-ctrl-max').forEach(btn => {
    btn.addEventListener('click', (e) => {
      playClickSound();
      const win = e.target.closest('.w11-window');
      if (win) {
        if (win.getAttribute('data-maximized') === 'true') {
          win.style.top = win.getAttribute('data-prev-top') || '60px';
          win.style.left = win.getAttribute('data-prev-left') || '160px';
          win.style.width = win.getAttribute('data-prev-width') || '700px';
          win.style.height = win.getAttribute('data-prev-height') || '460px';
          win.removeAttribute('data-maximized');
        } else {
          win.setAttribute('data-prev-top', win.style.top);
          win.setAttribute('data-prev-left', win.style.left);
          win.setAttribute('data-prev-width', win.style.width);
          win.setAttribute('data-prev-height', win.style.height);
          win.style.top = '0px';
          win.style.left = '0px';
          win.style.width = '100vw';
          win.style.height = 'calc(100vh - 48px)';
          win.setAttribute('data-maximized', 'true');
        }
      }
    });
  });

  document.querySelectorAll('.w11-window').forEach(win => {
    win.addEventListener('mousedown', () => {
      win.style.zIndex = ++topZIndex;
      updateTaskbarPills();
    });

    const handle = win.querySelector('.w11-titlebar') || win.querySelector('.w11-tab-bar') || win.querySelector('.w11-terminal-titlebar');
    if (!handle) return;

    let isDown = false;
    let sx = 0, sy = 0, ox = 0, oy = 0;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('.w11-controls') || e.target.closest('.w11-tab-close') || e.target.closest('.w11-tab-add')) return;
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

  document.getElementById('w11-show-desktop')?.addEventListener('click', () => {
    playClickSound();
    document.querySelectorAll('.w11-window').forEach(w => w.classList.add('hidden'));
    updateTaskbarPills();
  });

  function updateClock() {
    const el = document.getElementById('w11-clock');
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

  /* Pestañas de Explorador de archivos */
  document.querySelectorAll('.w11-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      if (e.target.closest('.w11-tab-close')) {
        e.stopPropagation();
        playClickSound();
        if (document.querySelectorAll('.w11-tab').length > 1) {
          tab.remove();
        }
        return;
      }
      playClickSound();
      document.querySelectorAll('.w11-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  document.querySelector('.w11-tab-add')?.addEventListener('click', () => {
    playClickSound();
    const newTab = document.createElement('div');
    newTab.className = 'w11-tab active';
    newTab.innerHTML = `
      <svg viewBox="0 0 16 16" width="14" height="14"><path d="M2 4 L7 4 L9 6 L14 6 L14 13 L2 13 Z" fill="#0284c7"/></svg>
      <span>Nueva carpeta</span>
      <button class="w11-tab-close">✕</button>
    `;
    document.querySelectorAll('.w11-tab').forEach(t => t.classList.remove('active'));
    document.querySelector('.w11-tab-add')?.before(newTab);
    newTab.addEventListener('click', (e) => {
      if (e.target.closest('.w11-tab-close')) {
        e.stopPropagation();
        newTab.remove();
        return;
      }
      document.querySelectorAll('.w11-tab').forEach(t => t.classList.remove('active'));
      newTab.classList.add('active');
    });
  });

  /* Administrador de tareas Fluent */
  document.querySelectorAll('.w11-tm-nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      document.querySelectorAll('.w11-tm-nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.w11-tm-subpanel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tm-panel');
      if (targetId) {
        document.getElementById(targetId)?.classList.add('active');
      }
    });
  });

  document.querySelectorAll('.w11-tm-row').forEach(row => {
    row.addEventListener('click', () => {
      document.querySelectorAll('.w11-tm-row').forEach(r => r.classList.remove('selected'));
      row.classList.add('selected');
    });
  });

  document.getElementById('w11-end-task-btn')?.addEventListener('click', () => {
    const selected = document.querySelector('.w11-tm-row.selected');
    if (selected) {
      playClickSound();
      selected.remove();
    }
  });

  /* Gráfica de CPU en vivo para Windows 11 */
  const polyline11 = document.getElementById('w11-cpu-line');
  const polygon11 = document.getElementById('w11-cpu-polygon');
  const perfTitlePct = document.getElementById('w11-perf-title-pct');
  const cpuExp = document.getElementById('w11-cpu-exp');
  const cpuEdge = document.getElementById('w11-cpu-edge');
  const cpuTm = document.getElementById('w11-cpu-tm');
  const uptime11 = document.getElementById('w11-uptime');

  const history11 = Array(30).fill(140);
  let seconds11 = 138;

  function updatePerf11() {
    const usage = Math.floor(9 + Math.random() * 21);
    if (perfTitlePct) perfTitlePct.textContent = `Utilización: ${usage}%`;
    if (cpuExp) cpuExp.textContent = `${(1.1 + Math.random() * 1.2).toFixed(1)} %`;
    if (cpuEdge) cpuEdge.textContent = `${(1.8 + Math.random() * 2.5).toFixed(1)} %`;
    if (cpuTm) cpuTm.textContent = `${(0.6 + Math.random() * 0.8).toFixed(1)} %`;

    seconds11++;
    const hrs = Math.floor(seconds11 / 3600);
    const mins = String(Math.floor((seconds11 % 3600) / 60)).padStart(2, '0');
    const secs = String(seconds11 % 60).padStart(2, '0');
    if (uptime11) uptime11.textContent = `${hrs}:${mins}:${secs}`;

    const yVal = 150 - (usage / 100) * 130;
    history11.shift();
    history11.push(yVal);

    if (polyline11 && polygon11) {
      const step = 400 / (history11.length - 1);
      const pts = history11.map((y, idx) => `${Math.round(idx * step)},${Math.round(y)}`).join(' ');
      polyline11.setAttribute('points', pts);
      polygon11.setAttribute('points', `0,160 ${pts} 400,160`);
    }
  }

  setInterval(updatePerf11, 1200);

  /* Terminal de Windows interactivo */
  const termInput = document.getElementById('terminal-input');
  const termOutput = document.getElementById('terminal-output');

  termInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const cmd = termInput.value.trim();
      termInput.value = '';
      if (!termOutput) return;

      const cmdLine = document.createElement('p');
      cmdLine.innerHTML = `<span style="color:#22c55e;">PS C:\\Users\\Usuario&gt;</span> ${cmd}`;
      termOutput.appendChild(cmdLine);

      const res = document.createElement('div');
      res.style.marginBottom = '8px';

      const lower = cmd.toLowerCase();
      if (lower === 'clear' || lower === 'cls') {
        termOutput.innerHTML = '';
        return;
      } else if (lower === 'help' || lower === 'get-help') {
        res.innerHTML = `
          Comandos disponibles de PowerShell:<br>
          &nbsp;&nbsp;<b>winfetch / neofetch</b> - Muestra especificaciones de Windows 11<br>
          &nbsp;&nbsp;<b>dir / ls</b> - Lista archivos y directorios<br>
          &nbsp;&nbsp;<b>Get-Process</b> - Muestra los procesos activos del sistema<br>
          &nbsp;&nbsp;<b>ipconfig</b> - Configuración de adaptadores IP de red<br>
          &nbsp;&nbsp;<b>systeminfo</b> - Información general del hardware y SO<br>
          &nbsp;&nbsp;<b>clear / cls</b> - Limpia la pantalla
        `;
      } else if (lower === 'winfetch' || lower === 'neofetch') {
        res.innerHTML = `
<pre style="color:#38bdf8; margin:4px 0;">
  ████████  ████████   <b>Usuario@DESKTOP-WIN11-PRO</b>
  ████████  ████████   -------------------------
  ████████  ████████   <b>SO:</b> Microsoft Windows 11 Pro 64-bit (23H2)
                       <b>Kernel:</b> NT 10.0.22631.3007
  ████████  ████████   <b>Shell:</b> PowerShell 7.4.1
  ████████  ████████   <b>CPU:</b> Intel Core i7-13700K (16C 24T) @ 3.40GHz
  ████████  ████████   <b>Memoria:</b> 8140MB / 32768MB
</pre>
        `;
      } else if (lower === 'dir' || lower === 'ls' || lower === 'get-childitem') {
        res.innerHTML = `
<pre style="color:#cbd5e1; margin:4px 0;">
Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         23/09/2026    18:14                Desktop
d-----         23/09/2026    18:14                Documents
d-----         23/09/2026    18:14                Downloads
d-----         23/09/2026    18:14                Pictures
-a----         23/09/2026    18:30           4096 Documento_Proyecto.docx
-a----         23/09/2026    18:30           8192 Presupuesto_Anual.xlsx
</pre>
        `;
      } else if (lower === 'get-process' || lower === 'ps') {
        res.innerHTML = `
<pre style="color:#cbd5e1; margin:4px 0;">
Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id ProcessName
-------  ------    -----      -----     ------     -- -----------
    512      32    78200      92100       4.12   4488 explorer
    890      64   184600     210400      12.45   5120 msedge
    240      16    42000      54200       0.98   6012 pwsh
    310      20    34500      46100       1.10   7240 taskmgr
</pre>
        `;
      } else if (lower === 'ipconfig') {
        res.innerHTML = `
<pre style="color:#cbd5e1; margin:4px 0;">
Configuración IP de Windows:

Adaptador de Ethernet Ethernet0:
   Sufijo DNS específico para la conexión. . : localdomain
   Vínculo: dirección IPv6 local. . . : fe80::d4a8:912f:3301:5a42%12
   Dirección IPv4. . . . . . . . . . . . . . : 192.168.1.145
   Máscara de subred . . . . . . . . . . . . : 255.255.255.0
   Puerta de enlace predeterminada . . . . . : 192.168.1.1
</pre>
        `;
      } else if (lower === 'systeminfo') {
        res.innerHTML = `
<pre style="color:#cbd5e1; margin:4px 0;">
Nombre de host:               DESKTOP-WIN11-PRO
Nombre del sistema operativo: Microsoft Windows 11 Pro
Versión del SO:               10.0.22631 N/D Compilación 22631
Fabricante del sistema:       Microsoft Corporation
Tipo de sistema:              PC basado en x64
Memoria física total:         32,768 MB
</pre>
        `;
      } else if (cmd.length > 0) {
        res.innerHTML = `<span style="color:#f87171;">'${cmd}' no se reconoce como un comando o cmdlet interno. Escriba 'help' para ver comandos.</span>`;
      }

      termOutput.appendChild(res);
      const body = document.getElementById('terminal-body');
      if (body) body.scrollTop = body.scrollHeight;
    }
  });

  /* Microsoft Edge Bing en Windows 11 */
  const w11BingInput = document.getElementById('w11-bing-input');
  const w11BingBtn = document.getElementById('w11-bing-btn');
  function doW11BingSearch() {
    if (!w11BingInput) return;
    const query = w11BingInput.value.trim();
    if (!query) return;
    playClickSound();
    const urlInput = document.getElementById('edge-url-input');
    if (urlInput) urlInput.value = `https://www.bing.com/search?q=${encodeURIComponent(query)}`;
    const cards = document.querySelector('.w11-edge-cards');
    if (cards) {
      cards.innerHTML = `
        <div class="w11-edge-card" style="grid-column: span 2;">
          <span class="w11-pill" style="background:#0067c0;">Resultados de Bing & Copilot</span>
          <strong>Resultados destacados para: "${query}"</strong>
          <p style="margin-top:6px; opacity:0.85;">Se encontraron 2,180,000 resultados en 0.22 segundos.</p>
          <ul style="padding-left:18px; margin-top:8px; line-height:1.6; opacity:0.85;">
            <li>Microsoft Windows 11: Documentación y novedades oficiales</li>
            <li>Guía de diseño Fluent para desarrolladores web y de aplicaciones</li>
            <li>Consejos de productividad con inteligencia artificial generativa</li>
          </ul>
        </div>
      `;
    }
  }

  w11BingBtn?.addEventListener('click', doW11BingSearch);
  w11BingInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doW11BingSearch();
  });

  /* Búsqueda en menú Inicio de Windows 11 */
  const startSearchInput = document.getElementById('w11-start-search-input');
  startSearchInput?.addEventListener('input', () => {
    const val = startSearchInput.value.toLowerCase().trim();
    document.querySelectorAll('.pinned-app').forEach(app => {
      const text = app.textContent?.toLowerCase() || '';
      app.style.display = val.length === 0 || text.includes(val) ? 'flex' : 'none';
    });
  });

  /* Quick Settings Flyout Interactivity */
  document.querySelectorAll('.quick-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      playClickSound();
      tile.classList.toggle('active');
      const desc = tile.querySelector('.qt-desc');
      if (desc) {
        desc.textContent = tile.classList.contains('active') ? 'Activado' : 'Desactivado';
      }
    });
  });

  const brightSlider = document.getElementById('w11-slider-bright');
  brightSlider?.addEventListener('input', (e) => {
    const desktop = document.querySelector('.w11-desktop');
    if (desktop) desktop.style.filter = `brightness(${e.target.value}%)`;
  });

  document.querySelectorAll('.quick-settings-link[data-win]').forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      const winId = btn.getAttribute('data-win');
      if (winId) openWindow(winId);
      quickFlyout?.classList.add('hidden');
    });
  });

  /* Snap Layouts */
  let activeSnapWin = null;

  document.querySelectorAll('.w11-ctrl-max').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      activeSnapWin = btn.closest('.w11-window');
      if (!activeSnapWin || !snapFlyout) return;
      const rect = btn.getBoundingClientRect();
      snapFlyout.style.top = `${rect.bottom + 6}px`;
      snapFlyout.style.left = `${Math.min(window.innerWidth - 240, Math.max(10, rect.left - 180))}px`;
      snapFlyout.classList.remove('hidden');
    });
  });

  snapFlyout?.addEventListener('mouseleave', () => {
    snapFlyout.classList.add('hidden');
  });

  document.querySelectorAll('.snap-slot').forEach(slot => {
    slot.addEventListener('click', (e) => {
      e.stopPropagation();
      playClickSound();
      if (!activeSnapWin) return;
      const pos = slot.getAttribute('data-pos');
      const hTotal = 'calc(100vh - 48px)';
      const hHalf = 'calc((100vh - 48px) / 2)';

      activeSnapWin.style.transition = 'all 0.2s cubic-bezier(0.1, 0.9, 0.2, 1)';
      if (pos === 'left-half') {
        activeSnapWin.style.top = '0px';
        activeSnapWin.style.left = '0px';
        activeSnapWin.style.width = '50vw';
        activeSnapWin.style.height = hTotal;
      } else if (pos === 'right-half') {
        activeSnapWin.style.top = '0px';
        activeSnapWin.style.left = '50vw';
        activeSnapWin.style.width = '50vw';
        activeSnapWin.style.height = hTotal;
      } else if (pos === 'left-priority') {
        activeSnapWin.style.top = '0px';
        activeSnapWin.style.left = '0px';
        activeSnapWin.style.width = '66vw';
        activeSnapWin.style.height = hTotal;
      } else if (pos === 'right-priority') {
        activeSnapWin.style.top = '0px';
        activeSnapWin.style.left = '66vw';
        activeSnapWin.style.width = '34vw';
        activeSnapWin.style.height = hTotal;
      } else if (pos === 'tri-left') {
        activeSnapWin.style.top = '0px';
        activeSnapWin.style.left = '0px';
        activeSnapWin.style.width = '33.3vw';
        activeSnapWin.style.height = hTotal;
      } else if (pos === 'tri-mid') {
        activeSnapWin.style.top = '0px';
        activeSnapWin.style.left = '33.3vw';
        activeSnapWin.style.width = '33.3vw';
        activeSnapWin.style.height = hTotal;
      } else if (pos === 'tri-right') {
        activeSnapWin.style.top = '0px';
        activeSnapWin.style.left = '66.6vw';
        activeSnapWin.style.width = '33.4vw';
        activeSnapWin.style.height = hTotal;
      } else if (pos === 'q-tl') {
        activeSnapWin.style.top = '0px';
        activeSnapWin.style.left = '0px';
        activeSnapWin.style.width = '50vw';
        activeSnapWin.style.height = hHalf;
      } else if (pos === 'q-tr') {
        activeSnapWin.style.top = '0px';
        activeSnapWin.style.left = '50vw';
        activeSnapWin.style.width = '50vw';
        activeSnapWin.style.height = hHalf;
      } else if (pos === 'q-bl') {
        activeSnapWin.style.top = hHalf;
        activeSnapWin.style.left = '0px';
        activeSnapWin.style.width = '50vw';
        activeSnapWin.style.height = hHalf;
      } else if (pos === 'q-br') {
        activeSnapWin.style.top = hHalf;
        activeSnapWin.style.left = '50vw';
        activeSnapWin.style.width = '50vw';
        activeSnapWin.style.height = hHalf;
      }
      setTimeout(() => { activeSnapWin.style.transition = ''; }, 250);
      snapFlyout.classList.add('hidden');
    });
  });

  /* Papelera de reciclaje Windows 11 */
  const w11EmptyBtn = document.getElementById('w11-empty-bin-btn');
  const w11RestoreBtn = document.getElementById('w11-restore-bin-btn');
  const w11BinList = document.getElementById('w11-bin-list');
  const w11RecycleImg = document.getElementById('w11-recycle-img');

  w11EmptyBtn?.addEventListener('click', () => {
    playClickSound();
    if (w11BinList) {
      w11BinList.innerHTML = '<div style="color:var(--w11-text-dim, #64748b); font-size:12px; padding:24px; text-align:center;">Esta carpeta está vacía.</div>';
    }
    if (w11RecycleImg) {
      w11RecycleImg.src = '../assets/icons/win11/recycle_empty.png';
    }
  });

  w11RestoreBtn?.addEventListener('click', () => {
    playClickSound();
    if (w11BinList) {
      w11BinList.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; padding:10px; border-radius:6px; border:1px solid rgba(0,0,0,0.06); margin-bottom:8px;">
          <svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 4 L14 4 L20 10 L20 20 L4 20 Z" fill="#0284c7"/></svg>
          <div style="flex:1;">
            <strong>Borrador_Estrategia_2026.docx</strong>
            <div style="font-size:11px; opacity:0.6;">Ubicación: C:\\Users\\Usuario\\OneDrive</div>
          </div>
          <span style="font-size:11px; opacity:0.7;">1.2 MB</span>
        </div>
        <div style="display:flex; align-items:center; gap:10px; padding:10px; border-radius:6px; border:1px solid rgba(0,0,0,0.06); margin-bottom:8px;">
          <svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 4 L14 4 L20 10 L20 20 L4 20 Z" fill="#059669"/></svg>
          <div style="flex:1;">
            <strong>Datos_Exportados.csv</strong>
            <div style="font-size:11px; opacity:0.6;">Ubicación: C:\\Users\\Usuario\\Downloads</div>
          </div>
          <span style="font-size:11px; opacity:0.7;">450 KB</span>
        </div>
      `;
    }
    if (w11RecycleImg) {
      w11RecycleImg.src = '../assets/icons/win11/recycle_full.png';
    }
  });

  const hash = window.location.hash.replace('#', '');
  const query = new URLSearchParams(window.location.search).get('open');
  const targetApp = hash || query;
  if (targetApp) {
    targetApp.split(',').forEach(winId => {
      const trimmed = winId.trim();
      if (trimmed === 'copilot') {
        toggleCopilot(true);
        appendCopilotMessage('user', 'Activar Modo Oscuro y abrir Terminal');
        setTimeout(() => {
          appendCopilotMessage('bot', '🌙 He activado el Modo Oscuro y abierto la Windows Terminal con PowerShell listo.');
          openWindow('win-terminal');
        }, 150);
      } else {
        const fullId = trimmed.startsWith('win-') ? trimmed : `win-${trimmed}`;
        openWindow(fullId);
      }
    });
  }

  // Desktop right-click context menu
  const ctxMenu = document.getElementById('w11-ctx-menu');
  const desktop = document.querySelector('.w11-desktop');

  desktop?.addEventListener('contextmenu', (e) => {
    if (e.target.closest('.w11-window') || e.target.closest('.w11-taskbar') || e.target.closest('footer')) return;
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 230);
    const y = Math.min(e.clientY, window.innerHeight - 260);
    ctxMenu.style.left = x + 'px';
    ctxMenu.style.top = y + 'px';
    ctxMenu.classList.remove('hidden');
  });

  document.addEventListener('click', () => ctxMenu?.classList.add('hidden'));
  document.addEventListener('contextmenu', (e) => {
    if (!e.target.closest('#w11-ctx-menu')) ctxMenu?.classList.add('hidden');
  });

  document.getElementById('ctx-refresh')?.addEventListener('click', () => {
    playClickSound();
    ctxMenu.classList.add('hidden');
  });

  document.getElementById('ctx-new-folder')?.addEventListener('click', () => {
    playClickSound();
    ctxMenu.classList.add('hidden');
  });

  document.getElementById('ctx-terminal')?.addEventListener('click', () => {
    playClickSound();
    openWindow('win-terminal');
    ctxMenu.classList.add('hidden');
  });

  document.getElementById('ctx-personalize')?.addEventListener('click', () => {
    playClickSound();
    openWindow('win-settings');
    ctxMenu.classList.add('hidden');
  });

  document.getElementById('ctx-display')?.addEventListener('click', () => {
    playClickSound();
    openWindow('win-settings');
    ctxMenu.classList.add('hidden');
  });

})();
