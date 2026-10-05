/* Windows 2000 Professional Simulator Script */
(function () {
  'use strict';

  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
  }

  const W2kAudio = {
    startup: function () {
      initAudio();
      if (!audioCtx) return;
      try {
        const chord = [
          { freq: 261.63, time: 0.0, dur: 3.0 },
          { freq: 329.63, time: 0.05, dur: 3.0 },
          { freq: 392.00, time: 0.1, dur: 3.2 },
          { freq: 523.25, time: 0.15, dur: 3.5 },
          { freq: 659.25, time: 0.25, dur: 3.5 }
        ];

        chord.forEach(n => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(n.freq, audioCtx.currentTime + n.time);

          gain.gain.setValueAtTime(0.001, audioCtx.currentTime + n.time);
          gain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + n.time + 0.15);
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
        osc.frequency.setValueAtTime(900, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.03);
      } catch (e) {}
    }
  };

  window.addEventListener('click', function playOnce() {
    W2kAudio.startup();
    window.removeEventListener('click', playOnce);
  }, { once: true });

  let highestZ = 100;
  const activeTabs = new Map();

  const WindowManager = {
    open: function (appId) {
      W2kAudio.click();
      const win = document.getElementById(`win-${appId}`);
      if (!win) return;
      win.classList.remove('hidden');
      this.bringFront(win);

      if (!activeTabs.has(appId)) {
        const tab = document.createElement('button');
        tab.className = 'w2k-tab win-outset active';
        tab.setAttribute('data-id', appId);
        const title = win.querySelector('.w2k-titlebar span')?.textContent || appId;
        tab.innerHTML = `<span style="font-weight:bold;">${title}</span>`;
        tab.addEventListener('click', () => this.toggle(appId));
        document.getElementById('w2k-tabs')?.appendChild(tab);
        activeTabs.set(appId, tab);
      }
      this.updateTabs(appId);
    },

    close: function (appId) {
      W2kAudio.click();
      const win = document.getElementById(`win-${appId}`);
      if (win) win.classList.add('hidden');
      const tab = activeTabs.get(appId);
      if (tab) tab.remove();
      activeTabs.delete(appId);
    },

    minimize: function (appId) {
      W2kAudio.click();
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
      document.querySelectorAll('.w2k-titlebar').forEach(t => t.classList.add('inactive'));
      win.querySelector('.w2k-titlebar')?.classList.remove('inactive');
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
    const bar = win.querySelector('.w2k-titlebar');
    if (!bar) return;

    let isDown = false;
    let sx = 0, sy = 0, ox = 0, oy = 0;

    function onDown(e) {
      if (e.target.closest('.w2k-ctrl-btn')) return;
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

  document.querySelectorAll('.w2k-window').forEach(setupDraggable);

  document.querySelectorAll('.w2k-ctrl-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const win = e.target.closest('.w2k-window');
      if (win) WindowManager.close(win.getAttribute('data-id'));
    });
  });

  document.querySelectorAll('.w2k-ctrl-min').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const win = e.target.closest('.w2k-window');
      if (win) WindowManager.minimize(win.getAttribute('data-id'));
    });
  });

  document.querySelectorAll('.w2k-icon[data-app]').forEach(icon => {
    icon.addEventListener('dblclick', () => {
      WindowManager.open(icon.getAttribute('data-app'));
    });
    icon.addEventListener('click', () => {
      document.querySelectorAll('.w2k-icon').forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
    });
  });

  const startBtn = document.getElementById('w2k-start-btn');
  const startMenu = document.getElementById('w2k-start-menu');

  startBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    W2kAudio.click();
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

  document.querySelectorAll('.w2k-menu-item[data-app]').forEach(item => {
    item.addEventListener('click', () => {
      const appId = item.getAttribute('data-app');
      if (appId) WindowManager.open(appId);
      startMenu?.classList.add('hidden');
      startBtn?.classList.remove('active');
    });
  });

  const shutdownDialog = document.getElementById('w2k-shutdown-dialog');
  document.getElementById('w2k-menu-shutdown')?.addEventListener('click', () => {
    W2kAudio.click();
    shutdownDialog?.classList.remove('hidden');
    startMenu?.classList.add('hidden');
    startBtn?.classList.remove('active');
  });

  document.getElementById('btn-w2k-shut-cancel')?.addEventListener('click', () => {
    shutdownDialog?.classList.add('hidden');
  });

  document.getElementById('btn-w2k-shut-ok')?.addEventListener('click', () => {
    window.location.href = '../index.html';
  });

  function renderMMCView(viewName) {
    const pane = document.getElementById('mmc-detail-pane');
    if (!pane) return;
    if (viewName === 'sysinfo') {
      pane.innerHTML = `
        <h3 style="margin-bottom:8px; color:#0a246a;">System Information</h3>
        <table style="width:100%; border-collapse:collapse; font-size:11px;">
          <tr><td style="font-weight:bold; width:160px; padding:3px;">OS Name:</td><td>Microsoft Windows 2000 Professional</td></tr>
          <tr><td style="font-weight:bold; padding:3px;">Version:</td><td>5.0.2195 Service Pack 4 Build 2195</td></tr>
          <tr><td style="font-weight:bold; padding:3px;">System Type:</td><td>X86-based PC</td></tr>
          <tr><td style="font-weight:bold; padding:3px;">Processor:</td><td>x86 Family 6 Model 8 Stepping 3 ~800 Mhz</td></tr>
          <tr><td style="font-weight:bold; padding:3px;">Total Physical Memory:</td><td>256,000 KB</td></tr>
          <tr><td style="font-weight:bold; padding:3px;">Available Physical Memory:</td><td>184,320 KB</td></tr>
          <tr><td style="font-weight:bold; padding:3px;">System Directory:</td><td>C:\\WINNT\\System32</td></tr>
        </table>
      `;
    } else if (viewName === 'devmgr') {
      pane.innerHTML = `
        <h3 style="margin-bottom:8px; color:#0a246a;">Device Manager</h3>
        <div style="font-family:monospace; line-height:1.6;">
          <div>🖥 WIN2K-WORKSTATION</div>
          <div style="padding-left:14px;">📁 Computer: ACPI Multiprocessor PC</div>
          <div style="padding-left:14px;">📁 Disk drives: QUANTUM FIREBALL lct20 20GB</div>
          <div style="padding-left:14px;">📁 Display adapters: RIVA TNT2 Model 64/Model 64 Pro</div>
          <div style="padding-left:14px;">📁 Network adapters: Realtek RTL8139 Family PCI Fast Ethernet</div>
          <div style="padding-left:14px;">📁 Ports (COM &amp; LPT): Communications Port (COM1)</div>
          <div style="padding-left:14px;">📁 Sound, video and game controllers: Sound Blaster 16</div>
        </div>
      `;
    } else if (viewName === 'eventlog') {
      pane.innerHTML = `
        <h3 style="margin-bottom:8px; color:#0a246a;">Event Viewer (Local)</h3>
        <table style="width:100%; border-collapse:collapse; font-size:11px;">
          <tr style="background:#eee; font-weight:bold; border-bottom:1px solid #808080;">
            <th style="padding:4px; text-align:left;">Type</th>
            <th style="padding:4px; text-align:left;">Date</th>
            <th style="padding:4px; text-align:left;">Source</th>
            <th style="padding:4px; text-align:left;">Event</th>
          </tr>
          <tr><td style="padding:4px;">Information</td><td>Today</td><td>EventLog</td><td>6005</td></tr>
          <tr><td style="padding:4px;">Information</td><td>Today</td><td>Service Control Manager</td><td>7036</td></tr>
          <tr><td style="padding:4px;">Information</td><td>Today</td><td>PlugPlayManager</td><td>1001</td></tr>
        </table>
      `;
    } else if (viewName === 'disk') {
      pane.innerHTML = `
        <h3 style="margin-bottom:8px; color:#0a246a;">Disk Management</h3>
        <p style="margin-bottom:8px;">Volume status and partition layout:</p>
        <div style="display:flex; border:1px solid #808080; background:#f0f0f0; margin-bottom:12px;">
          <div style="width:100px; padding:8px; background:#d4d0c8; border-right:1px solid #808080;">
            <strong>Disk 0</strong><br>Basic<br>19.08 GB<br>Online
          </div>
          <div style="flex:1; padding:8px; background:#fff;">
            <strong>(C:)</strong> 19.08 GB NTFS<br>Healthy (System, Boot)
            <div style="height:14px; background:#0a246a; margin-top:4px;"></div>
          </div>
        </div>
      `;
    }
  }

  renderMMCView('sysinfo');

  document.querySelectorAll('.mmc-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.mmc-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      renderMMCView(item.getAttribute('data-view'));
    });
  });

  const cmdInput = document.getElementById('cmd-input');
  const cmdOutput = document.getElementById('cmd-output');
  if (cmdInput && cmdOutput) {
    cmdInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const raw = cmdInput.value.trim();
        const val = raw.toLowerCase();
        cmdInput.value = '';

        const echo = document.createElement('p');
        echo.textContent = `C:\\WINNT\\system32> ${raw}`;
        cmdOutput.appendChild(echo);

        const resp = document.createElement('div');
        if (val === 'ver') {
          resp.textContent = 'Microsoft Windows 2000 [Version 5.00.2195]';
        } else if (val === 'dir') {
          resp.innerHTML = '<pre> Volume in drive C is WIN2K_NTFS\n Directory of C:\\WINNT\\system32\n\n11/17/2000  01:23 PM    &lt;DIR&gt;          .\n11/17/2000  01:23 PM    &lt;DIR&gt;          ..\n11/17/2000  01:23 PM           377,616 cmd.exe\n11/17/2000  01:23 PM           324,880 taskmgr.exe\n11/17/2000  01:23 PM            66,048 notepad.exe\n11/17/2000  01:23 PM            54,272 winmine.exe\n               4 File(s)        822,816 bytes\n               2 Dir(s)   14,342,912,000 bytes free</pre>';
        } else if (val === 'ipconfig') {
          resp.innerHTML = '<pre>Windows 2000 IP Configuration\n\nEthernet adapter Local Area Connection:\n\n   Connection-specific DNS Suffix  . :\n   IP Address. . . . . . . . . . . . : 192.168.1.105\n   Subnet Mask . . . . . . . . . . . : 255.255.255.0\n   Default Gateway . . . . . . . . . : 192.168.1.1</pre>';
        } else if (val === 'systeminfo') {
          resp.innerHTML = '<pre>Host Name:                 WIN2K-PRO\nOS Name:                   Microsoft Windows 2000 Professional\nOS Version:                5.0.2195 Service Pack 4 Build 2195\nOS Manufacturer:           Microsoft Corporation\nSystem Manufacturer:       PC/AT Compatible\nSystem Type:               X86-based PC\nTotal Physical Memory:     256 MB</pre>';
        } else if (val.startsWith('ping')) {
          resp.innerHTML = '<pre>Pinging 127.0.0.1 with 32 bytes of data:\n\nReply from 127.0.0.1: bytes=32 time&lt;10ms TTL=128\nReply from 127.0.0.1: bytes=32 time&lt;10ms TTL=128\nReply from 127.0.0.1: bytes=32 time&lt;10ms TTL=128\nReply from 127.0.0.1: bytes=32 time&lt;10ms TTL=128\n\nPing statistics for 127.0.0.1:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)</pre>';
        } else if (val === 'help') {
          resp.innerHTML = '<pre>Supported commands:\nDIR         Displays a list of files and subdirectories.\nVER         Displays the Windows version.\nIPCONFIG    Displays IP address, subnet mask and default gateway.\nSYSTEMINFO  Displays machine specific properties and configuration.\nPING        Verifies IP connectivity.\nCLS         Clears the screen.\nEXIT        Quits the CMD.EXE program.</pre>';
        } else if (val === 'cls') {
          cmdOutput.innerHTML = '';
          return;
        } else if (val === 'exit') {
          WindowManager.close('cmd');
          return;
        } else if (val === 'regedit') {
          WindowManager.open('regedit');
          resp.textContent = 'Starting Registry Editor (regedit.exe)...';
        } else if (val === 'taskmgr') {
          WindowManager.open('taskmgr');
          resp.textContent = 'Starting Windows Task Manager (taskmgr.exe)...';
        } else if (val === 'notepad') {
          WindowManager.open('notepad');
          resp.textContent = 'Starting Notepad (notepad.exe)...';
        } else if (val.startsWith('echo ')) {
          resp.textContent = raw.substring(5);
        } else if (val !== '') {
          resp.textContent = `'${raw}' is not recognized as an internal or external command, operable program or batch file.`;
        }
        cmdOutput.appendChild(resp);
        const b = document.getElementById('win-cmd')?.querySelector('.cmd-body');
        if (b) b.scrollTop = b.scrollHeight;
      }
    });
  }

  function updateClock() {
    const el = document.getElementById('w2k-clock');
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

  // Windows 2000 Task Manager Implementation
  (function initTaskmgr2000() {
    const canvas = document.getElementById('w2k-cpu-canvas');
    const ctx = canvas?.getContext('2d');
    const pctEl = document.getElementById('w2k-cpu-pct');
    const history = new Array(30).fill(15);

    function drawCpuGraph() {
      if (!ctx || !canvas) return;
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = '#003300';
      ctx.lineWidth = 1;
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Graph
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      const step = canvas.width / (history.length - 1);
      history.forEach((val, i) => {
        const x = i * step;
        const y = canvas.height - (val / 100) * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    setInterval(() => {
      const newVal = Math.floor(Math.random() * 25) + 10;
      history.shift();
      history.push(newVal);
      if (pctEl) pctEl.textContent = `${newVal}%`;
      drawCpuGraph();
    }, 1200);

    drawCpuGraph();

    // Tabs
    document.querySelectorAll('.taskmgr-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        W2kAudio.click();
        document.querySelectorAll('.taskmgr-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const tab = btn.dataset.tab;
        document.getElementById('w2k-taskmgr-perf')?.classList.add('hidden');
        document.getElementById('w2k-taskmgr-apps')?.classList.add('hidden');
        document.getElementById('w2k-taskmgr-procs')?.classList.add('hidden');

        if (tab === 'perf') document.getElementById('w2k-taskmgr-perf')?.classList.remove('hidden');
        if (tab === 'apps') document.getElementById('w2k-taskmgr-apps')?.classList.remove('hidden');
        if (tab === 'procs') document.getElementById('w2k-taskmgr-procs')?.classList.remove('hidden');
      });
    });
  })();

  // Shutdown and Reboot to Boot Manager
  document.getElementById('w2k-menu-shutdown')?.addEventListener('click', () => {
    W2kAudio.click();
    document.getElementById('w2k-shutdown-dialog')?.classList.remove('hidden');
    document.getElementById('w2k-start-menu')?.classList.add('hidden');
  });

  document.getElementById('btn-w2k-shut-ok')?.addEventListener('click', () => {
    W2kAudio.click();
    const radios = document.getElementsByName('w2k-shut-opt');
    let sel = 'reboot';
    for (let r of radios) {
      if (r.checked) sel = r.value;
    }
    document.getElementById('w2k-shutdown-dialog')?.classList.add('hidden');

    if (sel === 'reboot' || sel === 'shutdown') {
      window.location.href = '../index.html';
    } else {
      alert('Logging off Administrator...\nReturning to Welcome to Windows 2000 login prompt.');
    }
  });

  document.getElementById('btn-w2k-shut-cancel')?.addEventListener('click', () => {
    W2kAudio.click();
    document.getElementById('w2k-shutdown-dialog')?.classList.add('hidden');
  });

  const hash = window.location.hash.replace('#', '');
  const query = new URLSearchParams(window.location.search).get('open');
  const targetApp = hash || query;
  if (targetApp) {
    targetApp.split(',').forEach(app => WindowManager.open(app.trim()));
  }
})();
