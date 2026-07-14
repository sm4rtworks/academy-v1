/* SM4RT Academy v1 · members area logic */
'use strict';

/* ============ mock data ============ */
const MODULES = [
  { name: '1 · Arquitetura do Sistema', icon: '🐧', lessons: [
    { t: 'Boot, kernel e systemd', done: true },
    { t: 'Diretórios do Sistema', current: true },
    { t: 'Processos e sinais' },
    { t: 'Live: tira-dúvidas com Cesar Brod', live: true },
  ]},
  { name: '2 · Shell Avançado', icon: '⌨️', lessons: [
    { t: 'Bash scripting profissional' }, { t: 'sed & awk na prática' }, { t: 'Automação com cron e timers' },
  ]},
  { name: '3 · Storage & Filesystems', icon: '💾', locked: true, lessons: [] },
  { name: '4 · Segurança & Hardening', icon: '🛡️', locked: true, lessons: [] },
  { name: '5 · Redes no Linux', icon: '🌐', locked: true, lessons: [] },
  { name: '6 · Performance & Tuning', icon: '📈', locked: true, lessons: [] },
  { name: '7 · Virtualização & Containers', icon: '📦', locked: true, lessons: [] },
  { name: '8 · Troubleshooting + Capstone', icon: '🎓', locked: true, lessons: [] },
];

const CHECKPOINTS = [
  { t: 25, q: 'Onde vivem os binários essenciais do sistema, disponíveis mesmo em modo de recuperação?',
    opts: ['/usr/local/bin', '/bin', '/opt', '/home'], ok: 1,
    fb: 'Exato! /bin guarda os binários essenciais (hoje geralmente um link para /usr/bin).' },
  { t: 70, q: 'Qual diretório é um pseudo-filesystem que expõe dados do kernel em tempo real?',
    opts: ['/proc', '/etc', '/var', '/srv'], ok: 0,
    fb: 'Isso! /proc não existe em disco: é o kernel conversando com você.' },
  { t: 115, q: 'Configurações do sistema, no estilo "texto plano editável", ficam em…',
    opts: ['/dev', '/tmp', '/etc', '/mnt'], ok: 2,
    fb: 'Perfeito. /etc é o coração da configuração de um sistema Linux.' },
];

const VIDEO_ID = '42iQKuQodW4'; // Linux Directories Explained in 100 Seconds

/* ============ sidebar ============ */
const modsEl = document.getElementById('modules');
MODULES.forEach((m, i) => {
  const div = document.createElement('div');
  div.className = 'module' + (m.locked ? ' locked' : '') + (i === 0 ? ' open' : '');
  const doneCount = m.lessons.filter(l => l.done).length;
  const state = m.locked ? '🔒' : `${doneCount}/${m.lessons.length}`;
  const hue = m.locked ? '#2a3145' : '#ff6a00';
  div.innerHTML = `
    <div class="module-head">
      <svg class="mod-cover" viewBox="0 0 34 34"><rect width="34" height="34" rx="9" fill="${m.locked ? '#1a2132' : 'rgba(255,106,0,.16)'}"/><text x="17" y="23" text-anchor="middle" font-size="15">${m.icon}</text></svg>
      <div class="mod-name">${m.name}</div>
      <div class="mod-state">${state}</div>
    </div>
    <div class="lessons">${m.lessons.map(l => `
      <div class="lesson ${l.done ? 'done-l' : ''} ${l.current ? 'current' : ''}">
        <span class="st">${l.done ? '✓' : l.live ? '🔴' : l.current ? '▶' : '○'}</span>${l.t}
      </div>`).join('')}</div>`;
  const head = div.querySelector('.module-head');
  head.addEventListener('click', () => {
    if (m.locked) { toast('Conclua os módulos anteriores para desbloquear 🔒'); return; }
    div.classList.toggle('open');
  });
  modsEl.appendChild(div);
});

/* ============ toast ============ */
let toastEl;
function toast(msg) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    Object.assign(toastEl.style, { position: 'fixed', bottom: '26px', left: '50%', transform: 'translateX(-50%)',
      background: '#1a2132', border: '1px solid rgba(255,255,255,.14)', color: '#e8ecf4', padding: '12px 22px',
      borderRadius: '12px', fontSize: '14px', zIndex: 99, boxShadow: '0 12px 40px rgba(0,0,0,.5)', opacity: 0, transition: 'opacity .25s' });
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.style.opacity = 1;
  clearTimeout(toastEl._t);
  toastEl._t = setTimeout(() => (toastEl.style.opacity = 0), 2600);
}

/* ============ YouTube player + AI checkpoints ============ */
let player, ticker, cpIndex = 0, quizOpen = false;
const overlay = document.getElementById('quizOverlay');
const cpRow = document.getElementById('checkpointRow');

CHECKPOINTS.forEach((c, i) => {
  const d = document.createElement('div');
  d.className = 'cpt' + (i === 0 ? ' next' : '');
  d.title = `Checkpoint ${i + 1} · ${fmt(c.t)}`;
  cpRow.appendChild(d);
});

const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/iframe_api';
document.head.appendChild(tag);

window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player('ytplayer', {
    videoId: VIDEO_ID,
    playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
    events: { onStateChange: onState },
  });
};

function onState(e) {
  if (e.data === YT.PlayerState.PLAYING) {
    clearInterval(ticker);
    ticker = setInterval(watchTime, 400);
  } else clearInterval(ticker);
}

function watchTime() {
  if (quizOpen || cpIndex >= CHECKPOINTS.length) return;
  const t = player.getCurrentTime();
  const cp = CHECKPOINTS[cpIndex];
  if (t >= cp.t) openQuiz(cp);
}

function openQuiz(cp) {
  quizOpen = true;
  player.pauseVideo();
  document.getElementById('quizQuestion').textContent = cp.q;
  const box = document.getElementById('quizOptions');
  const fb = document.getElementById('quizFeedback');
  fb.textContent = ''; fb.className = 'quiz-feedback';
  box.innerHTML = '';
  cp.opts.forEach((o, i) => {
    const b = document.createElement('button');
    b.className = 'quiz-opt'; b.textContent = o;
    b.onclick = () => {
      if (i === cp.ok) {
        b.classList.add('ok');
        fb.textContent = '✓ ' + cp.fb; fb.classList.add('ok');
        [...box.children].forEach(x => (x.disabled = true));
        cpRow.children[cpIndex].classList.remove('next');
        cpRow.children[cpIndex].classList.add('hit');
        cpIndex++;
        if (cpRow.children[cpIndex]) cpRow.children[cpIndex].classList.add('next');
        bumpStreak();
        setTimeout(() => { overlay.hidden = true; quizOpen = false; player.playVideo(); }, 1600);
      } else {
        b.classList.add('bad'); b.disabled = true;
        fb.textContent = 'Hmm, não é essa. Tenta de novo!';
      }
    };
    box.appendChild(b);
  });
  overlay.hidden = false;
}

function fmt(s) { const m = Math.floor(s / 60), ss = String(Math.floor(s % 60)).padStart(2, '0'); return `${m}:${ss}`; }

/* ============ streak + confetti ============ */
let streak = Number(localStorage.getItem('s4w_streak') || 0);
const streakN = document.getElementById('streakN');
streakN.textContent = streak;
function bumpStreak() {
  streak++; localStorage.setItem('s4w_streak', streak);
  streakN.textContent = streak;
  if (typeof confetti === 'function') confetti({ particleCount: 90, spread: 75, origin: { y: .7 }, colors: ['#ff6a00', '#ffd9bd', '#2fd67b', '#ffffff'] });
}

/* ============ lab (CodeMirror + validation) ============ */
const cm = CodeMirror.fromTextArea(document.getElementById('labEditor'), {
  mode: 'shell', theme: 'material-darker', lineNumbers: false, viewportMargin: Infinity,
});
const term = document.getElementById('terminal');
const HINTS = [
  '💡 O comando `find` procura arquivos por critérios…',
  '💡 `-size +100M` filtra por tamanho. E o ponto de partida?',
  '💡 Quase: find / -size +100M  (adicione -type f para só arquivos)',
];
let hintIdx = 0;
document.getElementById('hintBtn').onclick = () => {
  toast(HINTS[Math.min(hintIdx++, HINTS.length - 1)]);
};
document.getElementById('runBtn').onclick = () => {
  const cmd = cm.getValue().replace(/^#.*$/gm, '').trim();
  term.textContent = `sm4rt@lab:~$ ${cmd}\n`;
  const okFind = /\bfind\b/.test(cmd) && /(^|\s)\/(\s|$)/.test(cmd) && /-size\s*\+?100M/.test(cmd);
  const okDu = /\bdu\b/.test(cmd) && /\//.test(cmd);
  if (okFind) {
    term.textContent += [
      '/var/log/journal/system.journal        512M',
      '/home/aluno/dataset.tar.gz             1.2G',
      '/opt/backups/db-dump-2026.sql          890M',
      '', '✓ Desafio concluído! Você encontrou os vilões do disco. 🏆'].join('\n');
    bumpStreak();
    toast('🏆 Lab concluído! +1 na sequência');
  } else if (okDu) {
    term.textContent += 'du funciona, mas o desafio pede arquivos >100MB.\nDica: find / -size +100M';
  } else if (cmd) {
    term.innerHTML += '<span class="err">comando não resolve o desafio · tente a dica 💡</span>';
  } else {
    term.textContent += 'digite um comando primeiro…';
  }
};

/* ============ progress / done / next ============ */
const doneToggle = document.getElementById('doneToggle');
const nextBtn = document.getElementById('nextBtn');
const courseFill = document.getElementById('courseFill');
const coursePct = document.getElementById('coursePct');
doneToggle.checked = localStorage.getItem('s4w_l2done') === '1';
syncDone();
doneToggle.onchange = () => {
  localStorage.setItem('s4w_l2done', doneToggle.checked ? '1' : '0');
  syncDone();
  if (doneToggle.checked && typeof confetti === 'function')
    confetti({ particleCount: 140, spread: 100, origin: { y: .6 }, colors: ['#ff6a00', '#ffd9bd', '#ffffff'] });
};
function syncDone() {
  const done = doneToggle.checked;
  nextBtn.disabled = !done;
  nextBtn.title = done ? '' : 'Conclua a aula para avançar';
  const pct = done ? 18 : 12;
  courseFill.style.setProperty('--p', pct / 100);
  coursePct.textContent = pct + '%';
}
nextBtn.onclick = () => toast('Próxima aula: Processos e sinais ▶ (mock)');

/* ============ notetaker (Editor.js) ============ */
const SEED = {
  time: Date.now(),
  blocks: [
    { type: 'header', data: { text: 'Anatomia do Linux 🐧', level: 2 } },
    { type: 'paragraph', data: { text: 'Tudo é arquivo. Diretórios são o mapa do sistema.' } },
    { type: 'checklist', data: { items: [
      { text: 'Revisar <code class="inline-code">/etc</code> do meu servidor', checked: true },
      { text: 'Explorar /proc com <code class="inline-code">cat /proc/cpuinfo</code>', checked: false },
    ]}},
    { type: 'code', data: { code: 'find / -size +100M -type f 2>/dev/null' } },
  ],
};

const saveStatus = document.getElementById('saveStatus');
let editor;
function initEditor(data) {
  editor = new EditorJS({
    holder: 'editorjs',
    data,
    placeholder: 'Anote enquanto assiste…',
    tools: {
      header: { class: Header, inlineToolbar: true, config: { levels: [1, 2, 3], defaultLevel: 2 } },
      list: { class: EditorjsList, inlineToolbar: true },
      checklist: { class: Checklist, inlineToolbar: true },
      quote: { class: Quote, inlineToolbar: true },
      code: CodeTool,
      marker: Marker,
      inlineCode: InlineCode,
    },
    onChange: debounce(saveNotes, 700),
  });
}
try {
  const saved = localStorage.getItem('s4w_notes');
  initEditor(saved ? JSON.parse(saved) : SEED);
} catch { initEditor(SEED); }

function debounce(fn, ms) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
async function saveNotes() {
  saveStatus.textContent = 'Salvando…'; saveStatus.classList.add('saving');
  try {
    const data = await editor.save();
    localStorage.setItem('s4w_notes', JSON.stringify(data));
  } catch {}
  setTimeout(() => { saveStatus.textContent = 'Salvo ✓'; saveStatus.classList.remove('saving'); }, 350);
}

/* timestamp chips: insert as paragraph block with clickable chip */
document.getElementById('tsBtn').onclick = async () => {
  const t = player && player.getCurrentTime ? Math.floor(player.getCurrentTime()) : 0;
  const idx = editor.blocks.getBlocksCount();
  await editor.blocks.insert('paragraph', {
    text: `<span class="ts-chip" data-t="${t}">⏱ ${fmt(t)}</span>&nbsp; `,
  }, {}, idx, true);
  editor.caret.setToBlock(idx, 'end');
  saveNotes();
};
/* chip click → seek video (delegated) */
document.getElementById('editorjs').addEventListener('click', (e) => {
  const chip = e.target.closest('.ts-chip');
  if (chip && player && player.seekTo) {
    player.seekTo(Number(chip.dataset.t), true);
    player.playVideo();
    toast(`▶ Voltando para ${fmt(Number(chip.dataset.t))}`);
  }
});

/* ✨ AI summary (mock) */
document.getElementById('aiBtn').onclick = async () => {
  toast('✨ IA resumindo a aula…');
  await new Promise(r => setTimeout(r, 1200));
  const idx = editor.blocks.getBlocksCount();
  await editor.blocks.insert('quote', {
    text: '✨ <b>Resumo da IA:</b> O Linux organiza tudo como arquivo. /bin e /usr/bin trazem os executáveis; /etc concentra a configuração em texto plano; /proc e /sys são janelas vivas para o kernel; /var cresce com logs e caches. Dominar essa árvore é o primeiro passo para diagnosticar qualquer servidor.',
    caption: 'gerado a partir da transcrição da aula',
  }, {}, idx, true);
  saveNotes();
};

/* ⬇ export .md */
document.getElementById('mdBtn').onclick = async () => {
  const data = await editor.save();
  const md = data.blocks.map(b => {
    const strip = (h) => h.replace(/<[^>]+>/g, '');
    switch (b.type) {
      case 'header': return '#'.repeat(b.data.level) + ' ' + strip(b.data.text);
      case 'paragraph': return strip(b.data.text);
      case 'checklist': return b.data.items.map(i => `- [${i.checked ? 'x' : ' '}] ${strip(i.text || '')}`).join('\n');
      case 'list': return (b.data.items || []).map(i => `- ${strip(typeof i === 'string' ? i : i.content || '')}`).join('\n');
      case 'code': return '```bash\n' + b.data.code + '\n```';
      case 'quote': return '> ' + strip(b.data.text);
      default: return '';
    }
  }).filter(Boolean).join('\n\n');
  const blob = new Blob([`# Anotações · Linux Avançado · Aula 2\n\n${md}\n`], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'anotacoes-linux-avancado-aula2.md';
  a.click();
  toast('⬇ Anotações exportadas em Markdown');
};

/* ============ tabs ============ */
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
  });
});

/* live chip */
document.querySelector('.live-chip').onclick = () =>
  toast('🔴 Live "tira-dúvidas" quinta às 20h · link do Meet liberado 15min antes (alunos ativos)');
