/**
 * DailyPuzzleHub — app.js
 * Comprehensive gaming platform engine featuring 13 deterministic daily micro-games.
 * Zero Backend · 100% Client-Side · LocalStorage Persistence · Web Audio API · Confetti FX
 * Includes Home Dashboard with Game Thumbnails & "Watch Ad to Continue" Second Chance System.
 */

'use strict';

/* ============================================================
   SECTION 1: PRNG & SEEDING UTILITIES
   ============================================================ */

/**
 * Mulberry32 PRNG — 32-bit deterministic pseudo-random number generator
 * @param {number} seed 
 * @returns {function} next() -> [0, 1)
 */
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let z = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    z = (z + Math.imul(z ^ (z >>> 7), 61 | z)) ^ z;
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  };
}

/** Get the current UTC date string YYYY-MM-DD */
function getUTCDateStr() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Convert date string to an integer seed */
function dateSeed(dateStr) {
  return dateStr.split('-').reduce((acc, part, i) => {
    const weights = [10000, 100, 1];
    return acc + parseInt(part, 10) * weights[i];
  }, 0);
}

/** Get the daily puzzle number (days since epoch 2024-01-01) */
function getPuzzleNumber(dateStr) {
  const epoch = new Date('2024-01-01T00:00:00Z');
  const today = new Date(dateStr + 'T00:00:00Z');
  return Math.floor((today - epoch) / 86400000) + 1;
}

/** Seeded Fisher-Yates array shuffle */
function seededShuffle(arr, rng) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Format seconds into MM:SS */
function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/* ============================================================
   SECTION 2: AUDIO & CONFETTI FX
   ============================================================ */
const SoundFX = {
  ctx: null,
  enabled: true,

  init() {
    this.enabled = localStorage.getItem('dph_sound_enabled') !== 'false';
    this.updateIcon();
    document.getElementById('btn-audio-toggle').addEventListener('click', () => {
      this.enabled = !this.enabled;
      localStorage.setItem('dph_sound_enabled', this.enabled);
      this.updateIcon();
      showGlobalToast(this.enabled ? '🔊 Sound Enabled' : '🔇 Sound Muted');
    });
  },

  updateIcon() {
    const icon = document.getElementById('audio-icon');
    if (icon) icon.textContent = this.enabled ? '🔊' : '🔇';
  },

  getContext() {
    if (!this.ctx && typeof AudioContext !== 'undefined') {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  },

  playTone(freq, type = 'sine', duration = 0.18, volume = 0.15) {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  },

  click() { this.playTone(480, 'sine', 0.05, 0.08); },
  success() {
    this.playTone(523.25, 'triangle', 0.12, 0.12);
    setTimeout(() => this.playTone(659.25, 'triangle', 0.18, 0.15), 100);
  },
  error() { this.playTone(180, 'sawtooth', 0.22, 0.15); },
  win() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      setTimeout(() => this.playTone(f, 'sine', 0.28, 0.18), i * 90);
    });
  }
};

/** Trigger celebratory confetti burst */
function triggerConfetti() {
  if (typeof confetti === 'function') {
    confetti({
      particleCount: 85,
      spread: 75,
      origin: { y: 0.6 }
    });
  }
}

/** Global toast message helper */
let toastTimeout = null;
function showGlobalToast(msg, duration = 2500) {
  const el = document.getElementById('global-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => el.classList.remove('show'), duration);
}

/** Panel-specific toast message helper */
function showGameToast(game, msg, duration = 3000) {
  const el = document.getElementById(`${game}-toast`);
  if (!el) { showGlobalToast(msg, duration); return; }
  el.textContent = msg;
  setTimeout(() => { if (el.textContent === msg) el.textContent = ''; }, duration);
}

/** Clipboard copy with graceful fallback */
async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {}
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
  document.body.removeChild(ta);
  return ok;
}

/* ============================================================
   SECTION 3: LOCAL STORAGE & PERSISTENCE
   ============================================================ */
const LS = {
  prefix: 'dph_',
  get(key, def = null) {
    try {
      const v = localStorage.getItem(this.prefix + key);
      return v ? JSON.parse(v) : def;
    } catch { return def; }
  },
  set(key, val) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(val));
    } catch {}
  }
};

/* ============================================================
   SECTION 4: THEME & COUNTDOWN MANAGERS
   ============================================================ */
const ThemeManager = {
  init() {
    const saved = localStorage.getItem('dph_theme') || 'dark';
    this.apply(saved);
    document.getElementById('btn-theme-toggle').addEventListener('click', () => {
      const current = document.body.classList.contains('theme-light') ? 'light' : 'dark';
      this.apply(current === 'dark' ? 'light' : 'dark');
    });
  },
  apply(theme) {
    const icon = document.getElementById('theme-icon');
    if (theme === 'light') {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
      if (icon) icon.textContent = '☀️';
    } else {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
      if (icon) icon.textContent = '🌙';
    }
    localStorage.setItem('dph_theme', theme);
  }
};

const CountdownManager = {
  timerEl: null,
  init() {
    this.timerEl = document.getElementById('countdown-timer');
    this.tick();
    setInterval(() => this.tick(), 1000);
  },
  tick() {
    const now = new Date();
    const nextMidnight = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0, 0, 0
    ));
    const diff = Math.max(0, Math.floor((nextMidnight - now) / 1000));
    const h = String(Math.floor(diff / 3600)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const s = String(diff % 60).padStart(2, '0');
    if (this.timerEl) this.timerEl.textContent = `${h}:${m}:${s}`;
  }
};

/* ============================================================
   SECTION 5: GAME REGISTRY & METADATA (13 GAMES)
   ============================================================ */
const GAMES_LIST = [
  { id: 'wordle', name: 'Daily Word Guess', short: 'Wordle', category: 'Word & Text', icon: '🟩', desc: 'Guess the secret 5-letter word in 6 attempts with color clues.' },
  { id: 'sudoku', name: 'Daily Sudoku', short: 'Sudoku', category: 'Logic & Math', icon: '🔢', desc: '9×9 logical number placement with pencil notes and error checks.' },
  { id: 'minesweeper', name: 'Daily Minesweeper', short: 'Mines', category: 'Classic Logic', icon: '💣', desc: 'Clear all 71 safe squares on a 9×9 grid containing 10 hidden mines.' },
  { id: 'connections', name: 'Daily Connections', short: 'Connections', category: 'Word Association', icon: '🟨', desc: 'Group 16 related words into 4 secret categories of four.' },
  { id: 'crossword', name: 'Daily Mini Crossword', short: 'Crossword', category: 'Word Trivia', icon: '📰', desc: 'A quick 5×5 daily crossword with clue hints and letter reveal.' },
  { id: 'nonogram', name: 'Daily Nonogram', short: 'Nonogram', category: 'Pixel Logic', icon: '🖼️', desc: 'Use number runs to fill tiles and unveil hidden daily pixel art.' },
  { id: 'game2048', name: 'Daily 2048', short: '2048', category: 'Math & Sliding', icon: '🧮', desc: 'Slide numbers across a 4×4 grid to merge tiles and reach 2048.' },
  { id: 'wordsearch', name: 'Daily Word Search', short: 'Word Search', category: 'Pattern Search', icon: '🔍', desc: 'Find 6 hidden themed words in an 8×8 date-seeded letter matrix.' },
  { id: 'anagram', name: 'Daily Anagram Scramble', short: 'Anagram', category: 'Vocabulary', icon: '🔤', desc: 'Unscramble 7 letters to solve the daily word with dictionary clues.' },
  { id: 'memory', name: 'Daily Memory Match', short: 'Memory', category: 'Visual Memory', icon: '🃏', desc: 'Flip cards and find all 8 matching emoji pairs in minimum moves.' },
  { id: 'sliding', name: 'Daily Sliding Puzzle', short: 'Sliding', category: 'Spatial Logic', icon: '🧩', desc: 'Slide tiles 1 to 8 into sequential order in a 3×3 grid.' },
  { id: 'sequence', name: 'Daily Sequence Memory', short: 'Sequence', category: 'Audio & Sequence', icon: '🎵', desc: 'Watch and listen to the Simon pads, then repeat the 8-round sequence.' },
  { id: 'cryptogram', name: 'Daily Cryptogram', short: 'Cryptogram', category: 'Code Breaking', icon: '📜', desc: 'Decipher a daily famous inspirational quote with a substitution cipher.' }
];

/* ============================================================
   SECTION 6: REWARDED AD "SECOND CHANCE" MANAGER
   ============================================================ */
const ReviveManager = {
  activeGameId: null,
  onSuccessCallback: null,
  onGiveUpCallback: null,

  canRevive(gameId) {
    const today = getUTCDateStr();
    return !LS.get(`revived_${gameId}_${today}`, false);
  },

  markRevived(gameId) {
    const today = getUTCDateStr();
    LS.set(`revived_${gameId}_${today}`, true);
  },

  promptRevive(gameId, onSuccess, onGiveUp) {
    if (!this.canRevive(gameId)) {
      if (typeof onGiveUp === 'function') onGiveUp();
      return;
    }
    this.activeGameId = gameId;
    this.onSuccessCallback = onSuccess;
    this.onGiveUpCallback = onGiveUp;

    document.getElementById('rewarded-ad-container').style.display = 'none';
    document.getElementById('revive-actions').style.display = 'flex';
    ModalManager.openModal('modal-revive');
  },

  triggerRewardedAd(gameId, onSuccess) {
    // ── PRODUCTION: Google H5 Games adBreak Rewarded Ad API ──────────────────
    if (typeof window.adBreak === 'function') {
      window.adBreak({
        type: 'reward',
        name: `revive_${gameId}`,
        beforeAd: () => {
          // Pause any running game timers here if needed
          document.getElementById('rewarded-ad-container').style.display = 'block';
          document.getElementById('revive-actions').style.display = 'none';
        },
        afterAd: () => {
          document.getElementById('rewarded-ad-container').style.display = 'none';
        },
        adViewed: () => {
          // User watched the ad — grant the reward
          ModalManager.closeModal('modal-revive');
          this.markRevived(gameId);
          SoundFX.success();
          showGlobalToast('✨ Second Chance Activated! You are back in the game!');
          if (typeof onSuccess === 'function') onSuccess();
        },
        adDismissed: () => {
          // User closed the ad without watching — don't grant reward
          document.getElementById('rewarded-ad-container').style.display = 'none';
          document.getElementById('revive-actions').style.display = 'flex';
          showGlobalToast('⚠️ Watch the full ad to receive your Second Chance!');
        }
      });
      return; // let the real SDK handle it
    }

    // ── FALLBACK: 5-second simulated video ad for local/dev testing ──────────
    const container = document.getElementById('rewarded-ad-container');
    const actions   = document.getElementById('revive-actions');
    const timerNum  = document.getElementById('ad-timer-num');
    const fill      = document.getElementById('ad-progress-fill');

    container.style.display = 'block';
    actions.style.display = 'none';

    let timeLeft = 5;
    timerNum.textContent = timeLeft;
    fill.style.width = '0%';
    fill.style.transition = 'width 5s linear';
    setTimeout(() => { fill.style.width = '100%'; }, 50);

    const interval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(interval);
        ModalManager.closeModal('modal-revive');
        this.markRevived(gameId);
        SoundFX.success();
        showGlobalToast('✨ Second Chance Activated! You are back in the game!');
        if (typeof onSuccess === 'function') onSuccess();
      } else {
        timerNum.textContent = timeLeft;
      }
    }, 1000);
  },

  init() {
    document.getElementById('btn-revive-watch').addEventListener('click', () => {
      this.triggerRewardedAd(this.activeGameId, this.onSuccessCallback);
    });

    document.getElementById('btn-revive-giveup').addEventListener('click', () => {
      ModalManager.closeModal('modal-revive');
      if (typeof this.onGiveUpCallback === 'function') this.onGiveUpCallback();
    });
  }
};

/* ============================================================
   SECTION 7: NAVIGATION & HOME DASHBOARD MANAGER
   ============================================================ */
const NavManager = {
  currentGame: 'home',

  init() {
    // Brand Logo -> Return Home
    document.getElementById('brand-logo').addEventListener('click', (e) => {
      e.preventDefault();
      this.switchGame('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Quick nav tab clicks
    document.querySelectorAll('.quick-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchGame(tab.dataset.game));
    });

    // Central selector button
    document.getElementById('btn-open-game-menu').addEventListener('click', () => {
      this.renderGameSelectorGrid();
      ModalManager.openModal('modal-game-selector');
    });

    // Close selector button
    const closeSel = document.getElementById('close-game-selector');
    if (closeSel) closeSel.addEventListener('click', () => ModalManager.closeModal('modal-game-selector'));

    // Footer game links
    document.querySelectorAll('.footer-link-game').forEach(lnk => {
      lnk.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchGame(lnk.dataset.game);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    // Listen to URL hash routing
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace(/^#(\/|game\/)?/, '');
      if (hash && (hash === 'home' || GAMES_LIST.some(g => g.id === hash))) {
        this.switchGame(hash, false);
      }
    });

    // Initial route from hash or default to home
    const initHash = window.location.hash.replace(/^#(\/|game\/)?/, '');
    if (initHash && GAMES_LIST.some(g => g.id === initHash)) {
      this.switchGame(initHash, false);
    } else {
      this.switchGame('home', false);
    }

    this.renderHomeCards();
    this.updateBadges();
  },

  renderHomeCards() {
    const grid = document.getElementById('home-cards-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const today = getUTCDateStr();

    let solvedCount = 0;
    let totalPlayedCount = 0;

    GAMES_LIST.forEach(game => {
      const state = LS.get(`${game.id}_state_${today}`);
      const stats = LS.get(`${game.id}_stats`, { streak: 0, played: 0 });
      totalPlayedCount += stats.played || 0;

      let statusClass = 'status-notstarted';
      let statusText = '⚪ Not Started';

      if (state?.won) {
        statusClass = 'status-completed';
        statusText = '🟢 Completed ✔';
        solvedCount++;
      } else if (state && (state.guesses?.length > 0 || state.userGrid?.some(x => x !== 0 && x !== '') || state.firstClick === false || state.score > 0 || state.foundWords?.length > 0 || state.moves > 0)) {
        statusClass = 'status-inprogress';
        statusText = '🟡 In Progress';
      }

      const card = document.createElement('div');
      card.className = 'home-card';
      card.innerHTML = `
        <div class="card-thumbnail">
          ${this.getMiniThumbnailHtml(game.id)}
        </div>
        <div class="card-header-info">
          <span class="card-category">${game.category}</span>
          <span class="card-status-badge ${statusClass}">${statusText}</span>
        </div>
        <h3 class="card-title">${game.name}</h3>
        <p class="card-desc">${game.desc}</p>
        <div class="card-footer">
          <span class="card-streak">🔥 ${stats.streak || 0} Day Streak</span>
          <button class="card-btn" data-game="${game.id}">Play Game ➔</button>
        </div>
      `;

      card.querySelector('.card-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        this.switchGame(game.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
      card.addEventListener('click', () => {
        this.switchGame(game.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });

      grid.appendChild(card);
    });

    // Update Home hero stats
    document.getElementById('home-completed-count').textContent = `${solvedCount}/${GAMES_LIST.length}`;
    document.getElementById('home-streak-val').textContent = `🔥 ${LS.get('global_streak', 0)}`;
    document.getElementById('home-total-played').textContent = totalPlayedCount;
    document.getElementById('home-date-display').textContent = `Date: ${today}`;
  },

  getMiniThumbnailHtml(gameId) {
    switch (gameId) {
      case 'wordle':
        return `
          <div class="thumb-wordle-grid">
            <div class="thumb-wordle-tile" style="background:#22c55e;">W</div>
            <div class="thumb-wordle-tile" style="background:#eab308;">O</div>
            <div class="thumb-wordle-tile" style="background:#334155;">R</div>
            <div class="thumb-wordle-tile" style="background:#334155;">D</div>
            <div class="thumb-wordle-tile" style="background:#22c55e;">L</div>
            <div class="thumb-wordle-tile" style="background:#22c55e;">E</div>
          </div>
        `;
      case 'sudoku':
        return `
          <div class="thumb-sudoku-mini">
            <div class="thumb-sudoku-c">5</div>
            <div class="thumb-sudoku-c">3</div>
            <div class="thumb-sudoku-c">·</div>
            <div class="thumb-sudoku-c">6</div>
            <div class="thumb-sudoku-c" style="color:#6366f1;">7</div>
            <div class="thumb-sudoku-c">·</div>
            <div class="thumb-sudoku-c">·</div>
            <div class="thumb-sudoku-c">9</div>
            <div class="thumb-sudoku-c">8</div>
          </div>
        `;
      case 'minesweeper':
        return `
          <div class="thumb-mines-mini">
            <span>💣</span>
            <span style="color:#60a5fa;font-weight:900;">1</span>
            <span style="color:#4ade80;font-weight:900;">2</span>
            <span>🚩</span>
          </div>
        `;
      case 'connections':
        return `
          <div class="thumb-conn-mini">
            <div class="thumb-conn-bar" style="background:#eab308;"></div>
            <div class="thumb-conn-bar" style="background:#22c55e;"></div>
            <div class="thumb-conn-bar" style="background:#3b82f6;"></div>
            <div class="thumb-conn-bar" style="background:#a855f7;"></div>
          </div>
        `;
      case 'crossword':
        return `
          <div style="display:grid;grid-template-columns:repeat(3,24px);gap:2px;background:#334155;padding:2px;border-radius:4px;">
            <div style="width:24px;height:24px;background:#1e293b;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem;color:#f8fafc;">A</div>
            <div style="width:24px;height:24px;background:#1e293b;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem;color:#f8fafc;">P</div>
            <div style="width:24px;height:24px;background:#1e293b;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem;color:#f8fafc;">P</div>
            <div style="width:24px;height:24px;background:#0f172a;"></div>
            <div style="width:24px;height:24px;background:#1e293b;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem;color:#6366f1;">L</div>
            <div style="width:24px;height:24px;background:#0f172a;"></div>
            <div style="width:24px;height:24px;background:#1e293b;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem;color:#f8fafc;">E</div>
            <div style="width:24px;height:24px;background:#1e293b;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem;color:#f8fafc;">A</div>
            <div style="width:24px;height:24px;background:#1e293b;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.75rem;color:#f8fafc;">T</div>
          </div>
        `;
      case 'nonogram':
        return `<span style="font-size:3rem;">❤️</span>`;
      case 'game2048':
        return `
          <div class="thumb-2048-mini">
            <div class="thumb-2048-t" style="background:#3b82f6;">2</div>
            <div class="thumb-2048-t" style="background:#06b6d4;">4</div>
            <div class="thumb-2048-t" style="background:#10b981;">8</div>
            <div class="thumb-2048-t" style="background:#f59e0b;">16</div>
          </div>
        `;
      case 'wordsearch':
        return `<span style="font-size:2.6rem;">🔍</span>`;
      case 'anagram':
        return `
          <div style="display:flex;gap:4px;">
            <span style="background:#6366f1;color:#fff;padding:4px 8px;border-radius:4px;font-weight:800;">A</span>
            <span style="background:#6366f1;color:#fff;padding:4px 8px;border-radius:4px;font-weight:800;">B</span>
            <span style="background:#6366f1;color:#fff;padding:4px 8px;border-radius:4px;font-weight:800;">C</span>
          </div>
        `;
      case 'memory':
        return `
          <div style="display:flex;gap:8px;font-size:2rem;">
            <span>💎</span><span>💎</span>
          </div>
        `;
      case 'sliding':
        return `
          <div style="display:grid;grid-template-columns:repeat(3,20px);gap:2px;background:#1e293b;padding:3px;border-radius:4px;">
            <div style="width:20px;height:20px;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;border-radius:2px;">1</div>
            <div style="width:20px;height:20px;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;border-radius:2px;">2</div>
            <div style="width:20px;height:20px;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;border-radius:2px;">3</div>
            <div style="width:20px;height:20px;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;border-radius:2px;">4</div>
            <div style="width:20px;height:20px;background:#6366f1;color:#fff;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:800;border-radius:2px;">5</div>
            <div style="width:20px;height:20px;background:transparent;"></div>
          </div>
        `;
      case 'sequence':
        return `
          <div class="thumb-simon-mini">
            <div class="thumb-simon-p" style="background:#22c55e;"></div>
            <div class="thumb-simon-p" style="background:#ef4444;"></div>
            <div class="thumb-simon-p" style="background:#eab308;"></div>
            <div class="thumb-simon-p" style="background:#3b82f6;"></div>
          </div>
        `;
      case 'cryptogram':
        return `<span style="font-size:2.8rem;">📜</span>`;
      default:
        return `<span style="font-size:2.5rem;">🧩</span>`;
    }
  },

  renderGameSelectorGrid() {
    const grid = document.getElementById('game-suite-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const today = getUTCDateStr();

    GAMES_LIST.forEach(game => {
      const card = document.createElement('div');
      card.className = `suite-card ${game.id === this.currentGame ? 'active' : ''}`;
      card.dataset.game = game.id;

      const isCompleted = LS.get(`${game.id}_state_${today}`)?.won || false;

      card.innerHTML = `
        <div class="suite-card-icon">${game.icon}</div>
        <div class="suite-card-info">
          <span class="suite-card-title">${game.name}</span>
          <span class="suite-card-desc">${game.desc}</span>
          <span class="suite-card-status ${isCompleted ? 'done' : ''}">
            ${isCompleted ? '✅ Completed Today' : '▶ Play Daily Challenge'}
          </span>
        </div>
      `;
      card.addEventListener('click', () => {
        ModalManager.closeModal('modal-game-selector');
        this.switchGame(game.id);
      });
      grid.appendChild(card);
    });
  },

  switchGame(gameId, updateHash = true) {
    if (gameId !== 'home' && !GAMES_LIST.some(g => g.id === gameId)) return;
    this.currentGame = gameId;

    if (gameId === 'home') {
      document.getElementById('current-game-icon').textContent = '🏠';
      document.getElementById('current-game-title').textContent = 'All Games';
      if (updateHash) window.location.hash = 'home';
      this.renderHomeCards();
    } else {
      const gameObj = GAMES_LIST.find(g => g.id === gameId);
      document.getElementById('current-game-icon').textContent = gameObj.icon;
      document.getElementById('current-game-title').textContent = gameObj.short;
      if (updateHash) window.location.hash = `game/${gameId}`;
    }

    // Update active tab in quick-nav bar
    document.querySelectorAll('.quick-tab').forEach(tab => {
      const active = tab.dataset.game === gameId;
      tab.classList.toggle('active', active);
      if (active) tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    });

    // Update panels
    document.querySelectorAll('.game-panel').forEach(panel => {
      panel.classList.toggle('active', panel.id === `panel-${gameId}`);
    });

    // Pause/Resume active timers
    if (gameId === 'sudoku') SudokuGame.resumeTimer(); else SudokuGame.pauseTimer();
    if (gameId === 'minesweeper') MinesweeperGame.resumeTimer(); else MinesweeperGame.pauseTimer();
    if (gameId === 'crossword') CrosswordGame.resumeTimer(); else CrosswordGame.pauseTimer();

    this.renderGameSelectorGrid();
    this.updateBadges();
  },

  updateBadges() {
    const today = getUTCDateStr();
    GAMES_LIST.forEach(g => {
      const isWon = LS.get(`${g.id}_state_${today}`)?.won || false;
      const badge = document.getElementById(`badge-${g.id}`);
      if (badge) badge.className = `tab-badge ${isWon ? 'done' : ''}`;
    });

    // Update global streak count display
    const streak = LS.get('global_streak', 0);
    const streakEl = document.getElementById('streak-count');
    if (streakEl) streakEl.textContent = streak;
  }
};

/* ============================================================
   SECTION 8: MODAL MANAGER & GAME COMPLETE CONTROLLER
   ============================================================ */
const ModalManager = {
  openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
  },
  closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
  },
  closeAll() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
  },
  init() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) this.closeAll();
      });
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') this.closeAll();
    });

    const closes = {
      'close-stats': 'modal-stats',
      'close-help': 'modal-help',
      'close-complete': 'modal-complete'
    };
    Object.entries(closes).forEach(([btnId, modalId]) => {
      const btn = document.getElementById(btnId);
      if (btn) btn.addEventListener('click', () => this.closeModal(modalId));
    });

    document.getElementById('btn-stats').addEventListener('click', () => {
      StatsManager.renderStats();
      this.openModal('modal-stats');
    });
    document.getElementById('btn-help').addEventListener('click', () => {
      this.openModal('modal-help');
    });

    document.querySelectorAll('.help-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.help-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.help-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const target = document.getElementById(tab.dataset.tab);
        if (target) target.classList.add('active');
      });
    });

    const mobileClose = document.getElementById('ad-mobile-close');
    if (mobileClose) {
      mobileClose.addEventListener('click', () => {
        const ad = document.getElementById('ad-mobile-bottom');
        if (ad) ad.style.display = 'none';
      });
    }
  }
};

const GameComplete = {
  currentGame: '',
  currentShareText: '',

  init() {
    document.getElementById('btn-complete-share').addEventListener('click', async () => {
      const ok = await copyToClipboard(this.currentShareText);
      showGlobalToast(ok ? '📋 Results copied to clipboard!' : '⚠️ Copy failed');
    });

    document.getElementById('btn-complete-next').addEventListener('click', () => {
      ModalManager.closeModal('modal-complete');
      const ids = GAMES_LIST.map(g => g.id);
      const nextIdx = (ids.indexOf(this.currentGame) + 1) % ids.length;
      NavManager.switchGame(ids[nextIdx]);
    });
  },

  show(gameId, title, resultHtml, shareText) {
    this.currentGame = gameId;
    this.currentShareText = shareText;

    document.getElementById('complete-title').textContent = title;
    document.getElementById('complete-result').innerHTML = resultHtml;

    SoundFX.win();
    triggerConfetti();

    const panelShareBtn = document.getElementById(`btn-${gameId}-share`);
    if (panelShareBtn) {
      panelShareBtn.classList.remove('btn-hidden');
      panelShareBtn.style.display = 'inline-flex';
      panelShareBtn.onclick = async () => {
        const ok = await copyToClipboard(shareText);
        showGlobalToast(ok ? '📋 Results copied to clipboard!' : '⚠️ Copy failed');
      };
    }

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}

    NavManager.updateBadges();
    ModalManager.openModal('modal-complete');
  }
};

/* ============================================================
   SECTION 9: GLOBAL STATS MANAGER
   ============================================================ */
const StatsManager = {
  renderStats() {
    const body = document.getElementById('stats-modal-body');
    if (!body) return;

    let totalPlayed = 0;
    let totalWins = 0;
    let rowsHtml = '';

    GAMES_LIST.forEach(game => {
      const s = LS.get(`${game.id}_stats`, { played: 0, wins: 0, streak: 0 });
      totalPlayed += s.played || 0;
      totalWins += s.wins || 0;
      const winPct = s.played > 0 ? Math.round((s.wins / s.played) * 100) : 0;

      rowsHtml += `
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-subtle);font-size:0.88rem;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span>${game.icon}</span>
            <strong>${game.name}</strong>
          </div>
          <div style="display:flex;gap:14px;color:var(--text-secondary);font-size:0.8rem;">
            <span>Played: <strong>${s.played}</strong></span>
            <span>Win: <strong>${winPct}%</strong></span>
            <span>Streak: <strong style="color:#f59e0b;">${s.streak || 0}</strong></span>
          </div>
        </div>
      `;
    });

    const globalWinPct = totalPlayed > 0 ? Math.round((totalWins / totalPlayed) * 100) : 0;

    body.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;text-align:center;margin-bottom:18px;">
        <div style="background:var(--bg-elevated);padding:12px;border-radius:var(--radius-md);border:1px solid var(--border-subtle);">
          <div style="font-size:1.4rem;font-weight:800;color:var(--brand-a);">${totalPlayed}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">Total Played</div>
        </div>
        <div style="background:var(--bg-elevated);padding:12px;border-radius:var(--radius-md);border:1px solid var(--border-subtle);">
          <div style="font-size:1.4rem;font-weight:800;color:var(--success);">${globalWinPct}%</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">Win Rate</div>
        </div>
        <div style="background:var(--bg-elevated);padding:12px;border-radius:var(--radius-md);border:1px solid var(--border-subtle);">
          <div style="font-size:1.4rem;font-weight:800;color:#f59e0b;">🔥 ${LS.get('global_streak', 0)}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">Daily Streak</div>
        </div>
      </div>
      <div style="max-height:300px;overflow-y:auto;">
        ${rowsHtml}
      </div>
    `;
  },

  recordWin(gameId) {
    const today = getUTCDateStr();
    let stats = LS.get(`${gameId}_stats`, { played: 0, wins: 0, streak: 0, lastDate: '' });
    if (stats.lastDate !== today) {
      stats.lastDate = today;
      stats.played++;
      stats.wins++;
      stats.streak++;
      LS.set(`${gameId}_stats`, stats);

      let gStreak = LS.get('global_streak', 0);
      let gLast = LS.get('global_last_date', '');
      if (gLast !== today) {
        gStreak++;
        LS.set('global_streak', gStreak);
        LS.set('global_last_date', today);
      }
    }
  }
};

/* ============================================================
   SECTION 10: GAME 1 — DAILY WORD GUESS (WORDLE)
   ============================================================ */
const WordleGame = {
  DATE_STR: '',
  PUZZLE_NUM: 0,
  TARGET: '',
  guesses: [],
  currentGuess: '',
  gameOver: false,
  won: false,
  MAX_GUESSES: 6,
  WORD_LENGTH: 5,

  KB_ROWS: [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['ENTER','Z','X','C','V','B','N','M','⌫']
  ],

  init() {
    this.DATE_STR = getUTCDateStr();
    this.PUZZLE_NUM = getPuzzleNumber(this.DATE_STR);
    const rng = mulberry32(dateSeed(this.DATE_STR) ^ 0xDEAD);
    const words = seededShuffle(TARGET_WORDS, rng);
    this.TARGET = words[0].toUpperCase();

    document.getElementById('wordle-number').textContent = `#${this.PUZZLE_NUM}`;
    this.loadState();
    this.buildBoard();
    this.buildKeyboard();
    this.bindKeys();
  },

  buildBoard() {
    const board = document.getElementById('wordle-board');
    board.innerHTML = '';
    // BUG FIX: Explicit .wordle-row elements prevent 1×30 vertical-stripe rendering
    for (let r = 0; r < this.MAX_GUESSES; r++) {
      const row = document.createElement('div');
      row.className = 'wordle-row';
      row.id = `wr-${r}`;
      for (let c = 0; c < this.WORD_LENGTH; c++) {
        const tile = document.createElement('div');
        tile.classList.add('wordle-tile');
        tile.id = `wt-${r}-${c}`;
        row.appendChild(tile);
      }
      board.appendChild(row);
    }
    this.guesses.forEach((g, r) => this.revealRow(r, g, false));
    document.getElementById('wordle-attempts').textContent = `${this.guesses.length}/${this.MAX_GUESSES}`;
  },

  buildKeyboard() {
    this.KB_ROWS.forEach((row, i) => {
      const rowEl = document.getElementById(`kb-row-${i + 1}`);
      rowEl.innerHTML = '';
      row.forEach(key => {
        const btn = document.createElement('button');
        btn.classList.add('kb-key');
        if (key === 'ENTER' || key === '⌫') btn.classList.add('wide');
        btn.textContent = key;
        btn.dataset.key = key;
        btn.addEventListener('click', () => this.handleKey(key));
        rowEl.appendChild(btn);
      });
    });
    this.restoreKeyboardColors();
  },

  bindKeys() {
    document.addEventListener('keydown', e => {
      if (NavManager.currentGame !== 'wordle') return;
      if (document.querySelector('.modal-overlay.open')) return;
      if (e.key === 'Enter') this.handleKey('ENTER');
      else if (e.key === 'Backspace') this.handleKey('⌫');
      else if (/^[a-zA-Z]$/.test(e.key)) this.handleKey(e.key.toUpperCase());
    });
  },

  handleKey(key) {
    if (this.gameOver) return;
    if (key === '⌫') {
      if (this.currentGuess.length > 0) {
        this.currentGuess = this.currentGuess.slice(0, -1);
        this.updateCurrentRow();
        SoundFX.click();
      }
    } else if (key === 'ENTER') {
      this.submitGuess();
    } else if (this.currentGuess.length < this.WORD_LENGTH) {
      this.currentGuess += key;
      this.updateCurrentRow();
      SoundFX.click();
    }
  },

  updateCurrentRow() {
    const row = this.guesses.length;
    for (let c = 0; c < this.WORD_LENGTH; c++) {
      const tile = document.getElementById(`wt-${row}-${c}`);
      if (!tile) continue;
      tile.textContent = this.currentGuess[c] || '';
      tile.dataset.letter = this.currentGuess[c] || '';
    }
  },

  submitGuess() {
    if (this.currentGuess.length < this.WORD_LENGTH) {
      showGameToast('wordle', 'Not enough letters');
      SoundFX.error();
      return;
    }
    const guess = this.currentGuess.toLowerCase();
    const valid = TARGET_WORDS.includes(guess) || (typeof VALID_GUESSES !== 'undefined' && VALID_GUESSES.includes(guess));
    if (!valid) {
      showGameToast('wordle', 'Not in word list');
      SoundFX.error();
      return;
    }

    const row = this.guesses.length;
    this.guesses.push(this.currentGuess);
    this.currentGuess = '';
    this.revealRow(row, this.guesses[row], true);

    const won = guess.toUpperCase() === this.TARGET;
    if (won) {
      this.gameOver = true;
      this.won = true;
      this.saveState();
      setTimeout(() => {
        StatsManager.recordWin('wordle');
        GameComplete.show('wordle', '🎉 Wordle Solved!', `<p>Solved in ${this.guesses.length}/${this.MAX_GUESSES} attempts!</p><p>Word was: <strong>${this.TARGET}</strong></p>`, this.buildShareText());
      }, 1500);
    } else if (this.guesses.length >= this.MAX_GUESSES) {
      this.saveState();
      setTimeout(() => {
        // SECOND CHANCE REVIVE HOOK
        ReviveManager.promptRevive('wordle', () => {
          // Player watched ad -> revive + 1 extra row!
          this.MAX_GUESSES = 7;
          this.gameOver = false;
          this.buildBoard();
          showGameToast('wordle', '✨ Second Chance! Extra guess row unlocked!');
        }, () => {
          // Player gave up -> game over
          this.gameOver = true;
          this.won = false;
          this.saveState();
          GameComplete.show('wordle', '😔 Game Over', `<p>The word was: <strong>${this.TARGET}</strong></p>`, this.buildShareText());
        });
      }, 1200);
    } else {
      this.saveState();
    }
    document.getElementById('wordle-attempts').textContent = `${this.guesses.length}/${this.MAX_GUESSES}`;
  },

  revealRow(row, guess, animate) {
    const colors = this.computeColors(guess, this.TARGET);
    colors.forEach((color, col) => {
      const tile = document.getElementById(`wt-${row}-${col}`);
      if (!tile) return;
      tile.textContent = guess[col];
      setTimeout(() => {
        tile.classList.add(color);
        this.updateKeyColor(guess[col], color);
      }, animate ? col * 200 : 0);
    });
  },

  computeColors(guess, target) {
    const result = Array(this.WORD_LENGTH).fill('absent');
    const tArr = target.split('');
    const gArr = guess.split('');
    const tUsed = Array(this.WORD_LENGTH).fill(false);
    const gUsed = Array(this.WORD_LENGTH).fill(false);

    for (let i = 0; i < this.WORD_LENGTH; i++) {
      if (gArr[i] === tArr[i]) {
        result[i] = 'correct';
        tUsed[i] = true;
        gUsed[i] = true;
      }
    }
    for (let i = 0; i < this.WORD_LENGTH; i++) {
      if (gUsed[i]) continue;
      for (let j = 0; j < this.WORD_LENGTH; j++) {
        if (!tUsed[j] && gArr[i] === tArr[j]) {
          result[i] = 'present';
          tUsed[j] = true;
          break;
        }
      }
    }
    return result;
  },

  updateKeyColor(letter, color) {
    const btn = document.querySelector(`.kb-key[data-key="${letter}"]`);
    if (!btn) return;
    const priority = { correct: 3, present: 2, absent: 1 };
    const current = btn.classList.contains('correct') ? 'correct' : btn.classList.contains('present') ? 'present' : btn.classList.contains('absent') ? 'absent' : '';
    if (!current || (priority[color] || 0) > (priority[current] || 0)) {
      btn.classList.remove('correct', 'present', 'absent');
      btn.classList.add(color);
    }
  },

  restoreKeyboardColors() {
    this.guesses.forEach(g => {
      const colors = this.computeColors(g, this.TARGET);
      g.split('').forEach((l, i) => this.updateKeyColor(l, colors[i]));
    });
  },

  buildShareText() {
    const score = this.won ? `${this.guesses.length}/${this.MAX_GUESSES}` : 'X/6';
    const rows = this.guesses.map(g => {
      const c = this.computeColors(g, this.TARGET);
      return c.map(x => x === 'correct' ? '🟩' : x === 'present' ? '🟨' : '⬛').join('');
    });
    return `DailyPuzzleHub Word Guess #${this.PUZZLE_NUM} ${score}\n\n${rows.join('\n')}\n\nhttps://dailypuzzlehub.com`;
  },

  saveState() {
    LS.set(`wordle_state_${this.DATE_STR}`, { guesses: this.guesses, gameOver: this.gameOver, won: this.won, maxGuesses: this.MAX_GUESSES });
  },

  loadState() {
    const saved = LS.get(`wordle_state_${this.DATE_STR}`);
    if (saved) {
      this.guesses = saved.guesses || [];
      this.gameOver = saved.gameOver || false;
      this.won = saved.won || false;
      this.MAX_GUESSES = saved.maxGuesses || 6;
    }
  }
};

/* ============================================================
   SECTION 11: GAME 2 — DAILY SUDOKU (WCAG AAA Contrast)
   ============================================================ */
const SudokuGame = {
  DATE_STR: '',
  PUZZLE_NUM: 0,
  solution: [],
  puzzle: [],
  userGrid: [],
  notes: [],
  selectedCell: null,
  notesMode: false,
  errors: 0,
  MAX_ERRORS: 3,
  timerSecs: 0,
  timerRunning: false,
  timerInterval: null,
  gameOver: false,
  won: false,

  init() {
    this.DATE_STR = getUTCDateStr();
    this.PUZZLE_NUM = getPuzzleNumber(this.DATE_STR);
    document.getElementById('sudoku-number').textContent = `#${this.PUZZLE_NUM}`;

    this.generateDeterministicPuzzle();
    this.loadState();
    this.buildGrid();
    this.bindControls();
    if (!this.gameOver) this.startTimer();
  },

  generateDeterministicPuzzle() {
    const rng = mulberry32(dateSeed(this.DATE_STR) ^ 0x50D0);
    const base = [
      1,2,3,4,5,6,7,8,9,
      4,5,6,7,8,9,1,2,3,
      7,8,9,1,2,3,4,5,6,
      2,3,4,5,6,7,8,9,1,
      5,6,7,8,9,1,2,3,4,
      8,9,1,2,3,4,5,6,7,
      3,4,5,6,7,8,9,1,2,
      6,7,8,9,1,2,3,4,5,
      9,1,2,3,4,5,6,7,8
    ];
    const digits = seededShuffle([1,2,3,4,5,6,7,8,9], rng);
    this.solution = base.map(d => digits[d - 1]);

    this.puzzle = [...this.solution];
    const indices = seededShuffle(Array.from({ length: 81 }, (_, i) => i), rng);
    for (let i = 0; i < 44; i++) {
      this.puzzle[indices[i]] = 0;
    }
  },

  buildGrid() {
    const grid = document.getElementById('sudoku-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 81; i++) {
      const cell = document.createElement('div');
      cell.className = 'sudoku-cell';
      cell.id = `sc-${i}`;
      cell.dataset.idx = i;
      cell.addEventListener('click', () => this.selectCell(i));
      grid.appendChild(cell);
    }
    this.renderGrid();
  },

  selectCell(idx) {
    this.selectedCell = idx;
    this.renderHighlights();
  },

  renderGrid() {
    for (let i = 0; i < 81; i++) {
      const cell = document.getElementById(`sc-${i}`);
      if (!cell) continue;
      cell.innerHTML = '';
      const isGiven = this.puzzle[i] !== 0;
      const val = this.userGrid[i];

      cell.className = 'sudoku-cell';
      if (isGiven) {
        cell.classList.add('given');
        cell.textContent = this.puzzle[i];
      } else if (val !== 0) {
        cell.classList.add('user');
        cell.textContent = val;
        if (val !== this.solution[i]) cell.classList.add('error');
      } else if (this.notes[i] && this.notes[i].size > 0) {
        const notesGrid = document.createElement('div');
        notesGrid.className = 'sudoku-notes-grid';
        for (let n = 1; n <= 9; n++) {
          const nSpan = document.createElement('span');
          nSpan.className = 'sudoku-note-num';
          nSpan.textContent = this.notes[i].has(n) ? n : '';
          notesGrid.appendChild(nSpan);
        }
        cell.appendChild(notesGrid);
      }
    }
    this.renderHighlights();
  },

  renderHighlights() {
    document.querySelectorAll('.sudoku-cell').forEach(c => {
      c.classList.remove('selected', 'related', 'same-num');
    });
    if (this.selectedCell === null) return;

    const sel = document.getElementById(`sc-${this.selectedCell}`);
    if (sel) sel.classList.add('selected');

    const sRow = Math.floor(this.selectedCell / 9);
    const sCol = this.selectedCell % 9;
    const sVal = this.userGrid[this.selectedCell] || this.puzzle[this.selectedCell];

    for (let i = 0; i < 81; i++) {
      const r = Math.floor(i / 9);
      const c = i % 9;
      const bR = Math.floor(r / 3);
      const bC = Math.floor(c / 3);
      const val = this.userGrid[i] || this.puzzle[i];

      if (i !== this.selectedCell) {
        if (r === sRow || c === sCol || (bR === Math.floor(sRow / 3) && bC === Math.floor(sCol / 3))) {
          document.getElementById(`sc-${i}`)?.classList.add('related');
        }
        if (sVal !== 0 && val === sVal) {
          document.getElementById(`sc-${i}`)?.classList.add('same-num');
        }
      }
    }
  },

  enterNumber(num) {
    if (this.selectedCell === null || this.gameOver) return;
    if (this.puzzle[this.selectedCell] !== 0) return;

    if (this.notesMode && num !== 0) {
      if (this.notes[this.selectedCell].has(num)) this.notes[this.selectedCell].delete(num);
      else this.notes[this.selectedCell].add(num);
      this.userGrid[this.selectedCell] = 0;
    } else {
      this.userGrid[this.selectedCell] = num;
      this.notes[this.selectedCell].clear();

      if (num !== 0 && num !== this.solution[this.selectedCell]) {
        this.errors++;
        document.getElementById('sudoku-errors').textContent = this.errors;
        SoundFX.error();

        if (this.errors >= this.MAX_ERRORS) {
          this.pauseTimer();
          // SECOND CHANCE REVIVE HOOK
          ReviveManager.promptRevive('sudoku', () => {
            // Player watched ad -> clear 3rd strike!
            this.errors = 2;
            this.userGrid[this.selectedCell] = 0;
            document.getElementById('sudoku-errors').textContent = this.errors;
            this.renderGrid();
            this.startTimer();
            showGameToast('sudoku', '✨ Second Chance! Error strike removed!');
          }, () => {
            // Player gave up
            this.gameOver = true;
            showGameToast('sudoku', '💀 Too many errors! Resetting puzzle.');
            setTimeout(() => this.resetPuzzle(), 1800);
          });
          return;
        }
      } else if (num !== 0) {
        SoundFX.click();
      }
    }
    this.renderGrid();
    this.saveState();
    this.checkWin();
  },

  checkWin() {
    for (let i = 0; i < 81; i++) {
      if (this.userGrid[i] !== this.solution[i] && this.puzzle[i] === 0) return;
    }
    this.won = true;
    this.gameOver = true;
    this.pauseTimer();
    StatsManager.recordWin('sudoku');
    const timeStr = formatTime(this.timerSecs);
    GameComplete.show('sudoku', '🎉 Sudoku Solved!', `<p>Cleared in <strong>${timeStr}</strong> with ${this.errors}/3 errors!</p>`, this.buildShareText());
  },

  resetPuzzle() {
    this.userGrid = [...this.puzzle];
    this.notes = Array(81).fill(null).map(() => new Set());
    this.errors = 0;
    this.gameOver = false;
    document.getElementById('sudoku-errors').textContent = '0';
    this.renderGrid();
    this.startTimer();
    this.saveState();
  },

  bindControls() {
    document.getElementById('btn-sudoku-notes').addEventListener('click', () => {
      this.notesMode = !this.notesMode;
      document.getElementById('btn-sudoku-notes').classList.toggle('active', this.notesMode);
      document.getElementById('notes-status').textContent = this.notesMode ? 'ON' : 'OFF';
    });

    document.querySelectorAll('.num-btn').forEach(btn => {
      btn.addEventListener('click', () => this.enterNumber(parseInt(btn.dataset.num, 10)));
    });

    document.getElementById('btn-sudoku-hint').addEventListener('click', () => {
      const empties = [];
      for (let i = 0; i < 81; i++) {
        if (this.puzzle[i] === 0 && this.userGrid[i] !== this.solution[i]) empties.push(i);
      }
      if (empties.length > 0) {
        const hintIdx = empties[0];
        this.userGrid[hintIdx] = this.solution[hintIdx];
        this.notes[hintIdx].clear();
        this.renderGrid();
        showGameToast('sudoku', '💡 Hint revealed a square!');
        this.checkWin();
      }
    });

    document.getElementById('btn-sudoku-check').addEventListener('click', () => {
      let errFound = false;
      for (let i = 0; i < 81; i++) {
        if (this.puzzle[i] === 0 && this.userGrid[i] !== 0 && this.userGrid[i] !== this.solution[i]) {
          errFound = true;
          break;
        }
      }
      showGameToast('sudoku', errFound ? '❌ Some numbers are incorrect' : '✅ Looking good so far!');
    });

    document.addEventListener('keydown', e => {
      if (NavManager.currentGame !== 'sudoku') return;
      if (document.querySelector('.modal-overlay.open')) return;
      if (/^[1-9]$/.test(e.key)) this.enterNumber(parseInt(e.key, 10));
      else if (e.key === 'Backspace' || e.key === 'Delete') this.enterNumber(0);
      else if (e.key === 'n' || e.key === 'N') document.getElementById('btn-sudoku-notes').click();
    });
  },

  startTimer() {
    if (this.timerRunning) return;
    this.timerRunning = true;
    this.timerInterval = setInterval(() => {
      this.timerSecs++;
      const el = document.getElementById('sudoku-timer');
      if (el) el.textContent = formatTime(this.timerSecs);
    }, 1000);
  },
  pauseTimer() {
    this.timerRunning = false;
    clearInterval(this.timerInterval);
  },
  resumeTimer() {
    if (!this.gameOver) this.startTimer();
  },

  buildShareText() {
    return `DailyPuzzleHub Sudoku #${this.PUZZLE_NUM} ⏱️ ${formatTime(this.timerSecs)}\nErrors: ${this.errors}/3 · Medium\nhttps://dailypuzzlehub.com`;
  },

  saveState() {
    LS.set(`sudoku_state_${this.DATE_STR}`, {
      userGrid: this.userGrid,
      notes: this.notes.map(s => [...s]),
      errors: this.errors,
      timerSecs: this.timerSecs,
      gameOver: this.gameOver,
      won: this.won
    });
  },

  loadState() {
    const saved = LS.get(`sudoku_state_${this.DATE_STR}`);
    if (saved) {
      this.userGrid = saved.userGrid || [...this.puzzle];
      this.notes = (saved.notes || []).map(arr => new Set(arr));
      this.errors = saved.errors || 0;
      this.timerSecs = saved.timerSecs || 0;
      this.gameOver = saved.gameOver || false;
      this.won = saved.won || false;
      document.getElementById('sudoku-errors').textContent = this.errors;
      document.getElementById('sudoku-timer').textContent = formatTime(this.timerSecs);
    } else {
      this.userGrid = [...this.puzzle];
      this.notes = Array(81).fill(null).map(() => new Set());
    }
  }
};

/* ============================================================
   SECTION 12: GAME 3 — DAILY MINESWEEPER
   ============================================================ */
const MinesweeperGame = {
  DATE_STR: '',
  PUZZLE_NUM: 0,
  ROWS: 9,
  COLS: 9,
  TOTAL_MINES: 10,
  board: [],
  revealed: [],
  flagged: [],
  firstClick: true,
  flagMode: false,
  timerSecs: 0,
  timerRunning: false,
  timerInterval: null,
  gameOver: false,
  won: false,

  init() {
    this.DATE_STR = getUTCDateStr();
    this.PUZZLE_NUM = getPuzzleNumber(this.DATE_STR);
    document.getElementById('mine-number').textContent = `#${this.PUZZLE_NUM}`;
    this.loadState();
    this.buildBoard();
    this.bindControls();
  },

  buildBoard() {
    const grid = document.getElementById('mine-grid');
    grid.innerHTML = '';
    const size = this.ROWS * this.COLS;

    if (this.board.length === 0) {
      this.board = Array(size).fill(0);
      this.revealed = Array(size).fill(false);
      this.flagged = Array(size).fill(false);
    }

    for (let i = 0; i < size; i++) {
      const cell = document.createElement('div');
      cell.className = 'mine-cell';
      cell.id = `mc-${i}`;
      cell.dataset.idx = i;
      cell.addEventListener('click', (e) => this.handleClick(i, e));
      cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.toggleFlag(i);
      });
      grid.appendChild(cell);
    }
    this.renderBoard();
  },

  generateMines(excludeIdx) {
    const size = this.ROWS * this.COLS;
    this.board = Array(size).fill(0);
    const rng = mulberry32(dateSeed(this.DATE_STR) ^ 0xB00B);
    const candidates = Array.from({ length: size }, (_, i) => i).filter(i => i !== excludeIdx);
    const shuffled = seededShuffle(candidates, rng);

    for (let i = 0; i < this.TOTAL_MINES; i++) {
      this.board[shuffled[i]] = -1;
    }
    for (let i = 0; i < size; i++) {
      if (this.board[i] === -1) continue;
      this.board[i] = this.getNeighbors(i).filter(n => this.board[n] === -1).length;
    }
  },

  getNeighbors(idx) {
    const r = Math.floor(idx / this.COLS);
    const c = idx % this.COLS;
    const n = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < this.ROWS && nc >= 0 && nc < this.COLS) {
          n.push(nr * this.COLS + nc);
        }
      }
    }
    return n;
  },

  handleClick(idx, e) {
    if (this.gameOver) return;
    if (this.flagMode || e.shiftKey) {
      this.toggleFlag(idx);
      return;
    }
    if (this.flagged[idx]) return;

    if (this.firstClick) {
      this.firstClick = false;
      this.generateMines(idx);
      this.startTimer();
    }

    if (this.board[idx] === -1) {
      this.pauseTimer();
      SoundFX.error();

      // SECOND CHANCE REVIVE HOOK
      ReviveManager.promptRevive('minesweeper', () => {
        // Player watched ad -> flag that mine and keep playing!
        this.flagged[idx] = true;
        this.revealed[idx] = false;
        this.gameOver = false;
        this.renderBoard();
        this.resumeTimer();
        showGameToast('minesweeper', '✨ Second Chance! Mine flagged safely!');
      }, () => {
        // Player gave up -> game over
        this.gameOver = true;
        this.revealAllMines(idx);
        document.getElementById('mine-emoji-btn').textContent = '😵';
        setTimeout(() => {
          GameComplete.show('minesweeper', '💥 Kaboom!', '<p>You triggered a mine! Try again tomorrow or reset.</p>', this.buildShareText());
        }, 1200);
      });
      return;
    }

    this.revealCell(idx);
    SoundFX.click();
    this.renderBoard();
    this.saveState();
    this.checkWin();
  },

  revealCell(idx) {
    if (this.revealed[idx] || this.flagged[idx]) return;
    this.revealed[idx] = true;
    if (this.board[idx] === 0) {
      this.getNeighbors(idx).forEach(n => this.revealCell(n));
    }
  },

  toggleFlag(idx) {
    if (this.gameOver || this.revealed[idx]) return;
    this.flagged[idx] = !this.flagged[idx];
    SoundFX.click();
    this.renderBoard();
    this.saveState();
  },

  renderBoard() {
    const size = this.ROWS * this.COLS;
    let flagsCount = 0;
    for (let i = 0; i < size; i++) {
      const cell = document.getElementById(`mc-${i}`);
      if (!cell) continue;
      cell.className = 'mine-cell';
      cell.textContent = '';
      if (this.flagged[i]) {
        cell.classList.add('flagged');
        cell.textContent = '🚩';
        flagsCount++;
      } else if (this.revealed[i]) {
        cell.classList.add('revealed');
        if (this.board[i] > 0) {
          cell.textContent = this.board[i];
          cell.dataset.num = this.board[i];
        }
      }
    }
    document.getElementById('mines-remaining').textContent = Math.max(0, this.TOTAL_MINES - flagsCount);
  },

  revealAllMines(hitIdx) {
    for (let i = 0; i < this.ROWS * this.COLS; i++) {
      const cell = document.getElementById(`mc-${i}`);
      if (this.board[i] === -1) {
        cell.textContent = '💣';
        if (i === hitIdx) cell.classList.add('mine-hit');
      }
    }
  },

  checkWin() {
    let safeCount = 0;
    const size = this.ROWS * this.COLS;
    for (let i = 0; i < size; i++) {
      if (this.board[i] !== -1 && this.revealed[i]) safeCount++;
    }
    if (safeCount === size - this.TOTAL_MINES) {
      this.won = true;
      this.gameOver = true;
      this.pauseTimer();
      document.getElementById('mine-emoji-btn').textContent = '😎';
      StatsManager.recordWin('minesweeper');
      GameComplete.show('minesweeper', '🎉 Board Cleared!', `<p>All 10 mines safely detected in <strong>${this.timerSecs}s</strong>!</p>`, this.buildShareText());
    }
  },

  bindControls() {
    document.getElementById('btn-mine-flag-mode').addEventListener('click', () => {
      this.flagMode = !this.flagMode;
      document.getElementById('btn-mine-flag-mode').classList.toggle('active', this.flagMode);
      document.getElementById('flag-mode-status').textContent = this.flagMode ? 'ON' : 'OFF';
    });

    document.getElementById('mine-emoji-btn').addEventListener('click', () => {
      if (!this.won) {
        this.board = [];
        this.firstClick = true;
        this.gameOver = false;
        this.timerSecs = 0;
        this.pauseTimer();
        document.getElementById('mine-timer').textContent = '000';
        document.getElementById('mine-emoji-btn').textContent = '🙂';
        this.buildBoard();
        this.saveState();
      }
    });
  },

  startTimer() {
    if (this.timerRunning) return;
    this.timerRunning = true;
    this.timerInterval = setInterval(() => {
      this.timerSecs = Math.min(999, this.timerSecs + 1);
      document.getElementById('mine-timer').textContent = String(this.timerSecs).padStart(3, '0');
    }, 1000);
  },
  pauseTimer() {
    this.timerRunning = false;
    clearInterval(this.timerInterval);
  },
  resumeTimer() {
    if (!this.gameOver && !this.firstClick) this.startTimer();
  },

  buildShareText() {
    const outcome = this.won ? '✅ Cleared' : '💥 Exploded';
    return `DailyPuzzleHub Minesweeper #${this.PUZZLE_NUM} ${outcome} in ${this.timerSecs}s!\nhttps://dailypuzzlehub.com`;
  },

  saveState() {
    LS.set(`minesweeper_state_${this.DATE_STR}`, {
      board: this.board,
      revealed: this.revealed,
      flagged: this.flagged,
      firstClick: this.firstClick,
      timerSecs: this.timerSecs,
      gameOver: this.gameOver,
      won: this.won
    });
  },

  loadState() {
    const saved = LS.get(`minesweeper_state_${this.DATE_STR}`);
    if (saved) {
      this.board = saved.board || [];
      this.revealed = saved.revealed || [];
      this.flagged = saved.flagged || [];
      this.firstClick = saved.firstClick ?? true;
      this.timerSecs = saved.timerSecs || 0;
      this.gameOver = saved.gameOver || false;
      this.won = saved.won || false;
      document.getElementById('mine-timer').textContent = String(this.timerSecs).padStart(3, '0');
      document.getElementById('mine-emoji-btn').textContent = this.won ? '😎' : this.gameOver ? '😵' : '🙂';
    }
  }
};

/* ============================================================
   SECTION 13: GAME 4 — DAILY CONNECTIONS
   ============================================================ */
const ConnectionsGame = {
  DATE_STR: '',
  PUZZLE_NUM: 0,
  puzzle: null,
  words: [],
  selected: [],
  solvedGroups: [],
  lives: 4,
  gameOver: false,
  won: false,

  init() {
    this.DATE_STR = getUTCDateStr();
    this.PUZZLE_NUM = getPuzzleNumber(this.DATE_STR);
    document.getElementById('conn-number').textContent = `#${this.PUZZLE_NUM}`;

    const rng = mulberry32(dateSeed(this.DATE_STR) ^ 0xC044);
    const pIdx = Math.floor(rng() * CONNECTIONS_PUZZLES.length);
    this.puzzle = CONNECTIONS_PUZZLES[pIdx];

    this.loadState();
    if (this.words.length === 0) {
      const allWords = this.puzzle.groups.flatMap(g => g.words.map(w => ({ word: w, groupLevel: g.level })));
      this.words = seededShuffle(allWords, rng);
    }

    this.render();
    this.bindControls();
  },

  render() {
    const solvedCont = document.getElementById('conn-solved-container');
    solvedCont.innerHTML = '';
    this.solvedGroups.forEach(lvl => {
      const grp = this.puzzle.groups.find(g => g.level === lvl);
      if (!grp) return;
      const d = document.createElement('div');
      d.className = `conn-solved-group ${grp.color}`;
      d.innerHTML = `
        <div class="conn-cat-title">${grp.category}</div>
        <div class="conn-cat-words">${grp.words.join(', ')}</div>
      `;
      solvedCont.appendChild(d);
    });

    const grid = document.getElementById('conn-grid');
    grid.innerHTML = '';
    const solvedWords = new Set(this.solvedGroups.flatMap(lvl => this.puzzle.groups.find(g => g.level === lvl)?.words || []));
    const remaining = this.words.filter(w => !solvedWords.has(w.word));

    remaining.forEach(item => {
      const card = document.createElement('button');
      card.className = `conn-card ${this.selected.includes(item.word) ? 'selected' : ''}`;
      card.textContent = item.word;
      card.addEventListener('click', () => this.toggleSelect(item.word));
      grid.appendChild(card);
    });

    const submitBtn = document.getElementById('btn-conn-submit');
    submitBtn.textContent = `Submit (${this.selected.length}/4)`;
    submitBtn.disabled = this.selected.length !== 4 || this.gameOver;

    const livesStr = '● '.repeat(this.lives).trim() + ' ○ '.repeat(Math.max(0, 4 - this.lives)).trim();
    document.getElementById('conn-lives').textContent = `Mistakes: ${livesStr}`;
  },

  toggleSelect(word) {
    if (this.gameOver) return;
    if (this.selected.includes(word)) {
      this.selected = this.selected.filter(w => w !== word);
    } else if (this.selected.length < 4) {
      this.selected.push(word);
    }
    SoundFX.click();
    this.render();
  },

  submitGuess() {
    if (this.selected.length !== 4 || this.gameOver) return;

    for (let grp of this.puzzle.groups) {
      const match = this.selected.every(w => grp.words.includes(w));
      if (match) {
        SoundFX.success();
        this.solvedGroups.push(grp.level);
        this.selected = [];
        this.render();
        this.saveState();
        if (this.solvedGroups.length === 4) {
          this.won = true;
          this.gameOver = true;
          StatsManager.recordWin('connections');
          this.saveState();
          GameComplete.show('connections', '🎉 Connections Solved!', '<p>All 4 secret categories uncovered!</p>', this.buildShareText());
        }
        return;
      }
    }

    for (let grp of this.puzzle.groups) {
      const count = this.selected.filter(w => grp.words.includes(w)).length;
      if (count === 3) {
        showGameToast('conn', 'One away...');
        break;
      }
    }

    SoundFX.error();
    this.lives--;
    if (this.lives <= 0) {
      // SECOND CHANCE REVIVE HOOK
      ReviveManager.promptRevive('connections', () => {
        // Player watched ad -> restore 1 life!
        this.lives = 1;
        this.gameOver = false;
        this.saveState();
        this.render();
        showGameToast('conn', '✨ Second Chance! +1 Mistake Life Granted!');
      }, () => {
        // Player gave up
        this.gameOver = true;
        this.solvedGroups = [1, 2, 3, 4];
        this.saveState();
        this.render();
        showGameToast('conn', 'Out of mistakes! Revealing categories.');
        setTimeout(() => {
          GameComplete.show('connections', '😔 Better Luck Next Time', '<p>All categories revealed!</p>', this.buildShareText());
        }, 1500);
      });
      return;
    }
    this.saveState();
    this.render();
  },

  bindControls() {
    document.getElementById('btn-conn-shuffle').addEventListener('click', () => {
      this.words = seededShuffle(this.words, mulberry32(Date.now()));
      this.render();
    });
    document.getElementById('btn-conn-deselect').addEventListener('click', () => {
      this.selected = [];
      this.render();
    });
    document.getElementById('btn-conn-submit').addEventListener('click', () => this.submitGuess());
  },

  buildShareText() {
    return `DailyPuzzleHub Connections #${this.PUZZLE_NUM}\n${this.won ? '🟩 All categories found!' : 'Attempts finished'}\nMistakes remaining: ${this.lives}/4\nhttps://dailypuzzlehub.com`;
  },

  saveState() {
    LS.set(`connections_state_${this.DATE_STR}`, {
      words: this.words,
      solvedGroups: this.solvedGroups,
      lives: this.lives,
      gameOver: this.gameOver,
      won: this.won
    });
  },

  loadState() {
    const saved = LS.get(`connections_state_${this.DATE_STR}`);
    if (saved) {
      this.words = saved.words || [];
      this.solvedGroups = saved.solvedGroups || [];
      this.lives = saved.lives ?? 4;
      this.gameOver = saved.gameOver || false;
      this.won = saved.won || false;
    }
  }
};

/* ============================================================
   SECTION 14: GAME 5 — DAILY MINI CROSSWORD
   ============================================================ */
const CrosswordGame = {
  DATE_STR: '',
  PUZZLE_NUM: 0,
  puzzle: null,
  userGrid: Array(25).fill(''),
  selectedCell: 0,
  direction: 'across',
  timerSecs: 0,
  timerRunning: false,
  timerInterval: null,
  gameOver: false,
  won: false,

  init() {
    this.DATE_STR = getUTCDateStr();
    this.PUZZLE_NUM = getPuzzleNumber(this.DATE_STR);
    document.getElementById('crossword-number').textContent = `#${this.PUZZLE_NUM}`;

    const rng = mulberry32(dateSeed(this.DATE_STR) ^ 0xC805);
    const pIdx = Math.floor(rng() * MINI_CROSSWORD_PUZZLES.length);
    this.puzzle = MINI_CROSSWORD_PUZZLES[pIdx];

    this.loadState();
    this.buildGrid();
    this.renderClues();
    this.bindControls();
    if (!this.gameOver) this.startTimer();
  },

  buildGrid() {
    const grid = document.getElementById('crossword-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 25; i++) {
      const cell = document.createElement('div');
      cell.className = 'cw-cell';
      cell.id = `cw-${i}`;
      cell.dataset.idx = i;

      const r = Math.floor(i / 5);
      const c = i % 5;
      const acClue = this.puzzle.across.find(cl => cl.row === r && cl.col === c);
      const dnClue = this.puzzle.down.find(cl => cl.row === r && cl.col === c);
      const num = acClue?.num || dnClue?.num;

      if (num) {
        const numSpan = document.createElement('span');
        numSpan.className = 'cw-num';
        numSpan.textContent = num;
        cell.appendChild(numSpan);
      }

      cell.addEventListener('click', () => {
        if (this.selectedCell === i) {
          this.direction = this.direction === 'across' ? 'down' : 'across';
        } else {
          this.selectedCell = i;
        }
        this.renderHighlights();
      });
      grid.appendChild(cell);
    }
    this.renderValues();
  },

  renderValues() {
    for (let i = 0; i < 25; i++) {
      const cell = document.getElementById(`cw-${i}`);
      if (!cell) continue;
      cell.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) node.remove();
      });
      if (this.userGrid[i]) {
        cell.appendChild(document.createTextNode(this.userGrid[i]));
      }
    }
    this.renderHighlights();
  },

  renderHighlights() {
    document.querySelectorAll('.cw-cell').forEach(c => c.classList.remove('active-word', 'active-cell'));
    if (this.selectedCell === null) return;

    const r = Math.floor(this.selectedCell / 5);
    const c = this.selectedCell % 5;

    for (let i = 0; i < 25; i++) {
      const cr = Math.floor(i / 5);
      const cc = i % 5;
      if (this.direction === 'across' && cr === r) {
        document.getElementById(`cw-${i}`)?.classList.add('active-word');
      } else if (this.direction === 'down' && cc === c) {
        document.getElementById(`cw-${i}`)?.classList.add('active-word');
      }
    }
    document.getElementById(`cw-${this.selectedCell}`)?.classList.add('active-cell');

    const clueObj = this.direction === 'across'
      ? this.puzzle.across.find(cl => cl.row === r)
      : this.puzzle.down.find(cl => cl.col === c);

    if (clueObj) {
      document.getElementById('clue-dir-num').textContent = `${clueObj.num}${this.direction === 'across' ? 'A' : 'D'}:`;
      document.getElementById('clue-text').textContent = clueObj.clue;
    }
  },

  renderClues() {
    const acList = document.getElementById('across-clues');
    const dnList = document.getElementById('down-clues');
    acList.innerHTML = '';
    dnList.innerHTML = '';

    this.puzzle.across.forEach(cl => {
      const li = document.createElement('li');
      li.className = 'clue-item';
      li.innerHTML = `<strong>${cl.num}.</strong> ${cl.clue}`;
      li.addEventListener('click', () => {
        this.selectedCell = cl.row * 5 + cl.col;
        this.direction = 'across';
        this.renderHighlights();
      });
      acList.appendChild(li);
    });

    this.puzzle.down.forEach(cl => {
      const li = document.createElement('li');
      li.className = 'clue-item';
      li.innerHTML = `<strong>${cl.num}.</strong> ${cl.clue}`;
      li.addEventListener('click', () => {
        this.selectedCell = cl.row * 5 + cl.col;
        this.direction = 'down';
        this.renderHighlights();
      });
      dnList.appendChild(li);
    });
  },

  handleInput(char) {
    if (this.gameOver) return;
    this.userGrid[this.selectedCell] = char.toUpperCase();
    SoundFX.click();
    this.advanceCell(1);
    this.renderValues();
    this.saveState();
    this.checkWin();
  },

  advanceCell(step) {
    const r = Math.floor(this.selectedCell / 5);
    const c = this.selectedCell % 5;
    if (this.direction === 'across') {
      const nextCol = c + step;
      if (nextCol >= 0 && nextCol < 5) this.selectedCell = r * 5 + nextCol;
    } else {
      const nextRow = r + step;
      if (nextRow >= 0 && nextRow < 5) this.selectedCell = nextRow * 5 + c;
    }
  },

  checkWin() {
    for (let i = 0; i < 25; i++) {
      if (this.userGrid[i] !== this.puzzle.grid[i]) return;
    }
    this.won = true;
    this.gameOver = true;
    this.pauseTimer();
    StatsManager.recordWin('crossword');
    GameComplete.show('crossword', '🎉 Mini Crossword Solved!', `<p>Completed in <strong>${formatTime(this.timerSecs)}</strong>!</p>`, this.buildShareText());
  },

  bindControls() {
    document.addEventListener('keydown', e => {
      if (NavManager.currentGame !== 'crossword') return;
      if (document.querySelector('.modal-overlay.open')) return;
      if (/^[a-zA-Z]$/.test(e.key)) {
        this.handleInput(e.key);
      } else if (e.key === 'Backspace') {
        this.userGrid[this.selectedCell] = '';
        this.advanceCell(-1);
        this.renderValues();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        this.advanceCell(1);
        this.renderHighlights();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        this.advanceCell(-1);
        this.renderHighlights();
      }
    });

    document.getElementById('btn-crossword-check').addEventListener('click', () => {
      let errors = 0;
      for (let i = 0; i < 25; i++) {
        if (this.userGrid[i] && this.userGrid[i] !== this.puzzle.grid[i]) errors++;
      }
      showGameToast('crossword', errors > 0 ? `❌ ${errors} incorrect letters` : '✅ All entered letters match!');
    });

    document.getElementById('btn-crossword-reveal').addEventListener('click', () => {
      this.userGrid[this.selectedCell] = this.puzzle.grid[this.selectedCell];
      this.renderValues();
      this.checkWin();
    });
  },

  startTimer() {
    if (this.timerRunning) return;
    this.timerRunning = true;
    this.timerInterval = setInterval(() => {
      this.timerSecs++;
      document.getElementById('crossword-timer').textContent = formatTime(this.timerSecs);
    }, 1000);
  },
  pauseTimer() {
    this.timerRunning = false;
    clearInterval(this.timerInterval);
  },
  resumeTimer() {
    if (!this.gameOver) this.startTimer();
  },

  buildShareText() {
    return `DailyPuzzleHub Mini Crossword #${this.PUZZLE_NUM} ⏱️ ${formatTime(this.timerSecs)}\nhttps://dailypuzzlehub.com`;
  },

  saveState() {
    LS.set(`crossword_state_${this.DATE_STR}`, {
      userGrid: this.userGrid,
      timerSecs: this.timerSecs,
      gameOver: this.gameOver,
      won: this.won
    });
  },

  loadState() {
    const saved = LS.get(`crossword_state_${this.DATE_STR}`);
    if (saved) {
      this.userGrid = saved.userGrid || Array(25).fill('');
      this.timerSecs = saved.timerSecs || 0;
      this.gameOver = saved.gameOver || false;
      this.won = saved.won || false;
      document.getElementById('crossword-timer').textContent = formatTime(this.timerSecs);
    }
  }
};

/* ============================================================
   SECTION 15: GAME 6 — DAILY NONOGRAM (PICROSS)
   ============================================================ */
const NonogramGame = {
  DATE_STR: '',
  PUZZLE_NUM: 0,
  puzzle: null,
  userGrid: [],
  mode: 'fill',
  timerSecs: 0,
  gameOver: false,
  won: false,

  init() {
    this.DATE_STR = getUTCDateStr();
    this.PUZZLE_NUM = getPuzzleNumber(this.DATE_STR);
    document.getElementById('nono-number').textContent = `#${this.PUZZLE_NUM}`;

    const rng = mulberry32(dateSeed(this.DATE_STR) ^ 0x9090);
    const pIdx = Math.floor(rng() * NONOGRAM_PUZZLES.length);
    this.puzzle = NONOGRAM_PUZZLES[pIdx];

    this.loadState();
    if (this.userGrid.length === 0) {
      this.userGrid = Array(this.puzzle.size * this.puzzle.size).fill(0);
    }
    this.buildBoard();
    this.bindControls();
  },

  buildBoard() {
    const board = document.getElementById('nono-board');
    board.innerHTML = '';
    const sz = this.puzzle.size;

    board.style.gridTemplateColumns = `50px repeat(${sz}, 36px)`;

    const corner = document.createElement('div');
    corner.className = 'nono-header-col';
    board.appendChild(corner);

    for (let c = 0; c < sz; c++) {
      const colClues = this.computeColClues(c);
      const hCol = document.createElement('div');
      hCol.className = 'nono-header-col';
      hCol.innerHTML = colClues.map(n => `<span>${n}</span>`).join('');
      board.appendChild(hCol);
    }

    for (let r = 0; r < sz; r++) {
      const rowClues = this.computeRowClues(r);
      const hRow = document.createElement('div');
      hRow.className = 'nono-header-row';
      hRow.innerHTML = rowClues.map(n => `<span>${n}</span>`).join(' ');
      board.appendChild(hRow);

      for (let c = 0; c < sz; c++) {
        const idx = r * sz + c;
        const cell = document.createElement('div');
        cell.className = 'nono-cell';
        cell.id = `nc-${idx}`;
        cell.addEventListener('click', () => this.toggleCell(idx, this.mode));
        cell.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          this.toggleCell(idx, 'cross');
        });
        board.appendChild(cell);
      }
    }
    this.renderGrid();
  },

  computeRowClues(r) {
    const runs = [];
    let cur = 0;
    for (let c = 0; c < this.puzzle.size; c++) {
      if (this.puzzle.grid[r][c] === 1) cur++;
      else if (cur > 0) { runs.push(cur); cur = 0; }
    }
    if (cur > 0) runs.push(cur);
    return runs.length ? runs : [0];
  },

  computeColClues(c) {
    const runs = [];
    let cur = 0;
    for (let r = 0; r < this.puzzle.size; r++) {
      if (this.puzzle.grid[r][c] === 1) cur++;
      else if (cur > 0) { runs.push(cur); cur = 0; }
    }
    if (cur > 0) runs.push(cur);
    return runs.length ? runs : [0];
  },

  toggleCell(idx, action) {
    if (this.gameOver) return;
    if (action === 'fill') {
      this.userGrid[idx] = this.userGrid[idx] === 1 ? 0 : 1;
    } else {
      this.userGrid[idx] = this.userGrid[idx] === 2 ? 0 : 2;
    }
    SoundFX.click();
    this.renderGrid();
    this.saveState();
    this.checkWin();
  },

  renderGrid() {
    for (let i = 0; i < this.userGrid.length; i++) {
      const cell = document.getElementById(`nc-${i}`);
      if (!cell) continue;
      cell.classList.remove('filled', 'crossed');
      if (this.userGrid[i] === 1) cell.classList.add('filled');
      else if (this.userGrid[i] === 2) cell.classList.add('crossed');
    }
  },

  checkWin() {
    const sz = this.puzzle.size;
    for (let r = 0; r < sz; r++) {
      for (let c = 0; c < sz; c++) {
        const target = this.puzzle.grid[r][c];
        const user = this.userGrid[r * sz + c];
        if (target === 1 && user !== 1) return;
        if (target === 0 && user === 1) return;
      }
    }
    this.won = true;
    this.gameOver = true;
    StatsManager.recordWin('nonogram');
    GameComplete.show('nonogram', '🎉 Nonogram Solved!', `<p>You uncovered the <strong>${this.puzzle.name} ${this.puzzle.icon}</strong>!</p>`, this.buildShareText());
  },

  bindControls() {
    const fillBtn = document.getElementById('btn-nono-fill');
    const crossBtn = document.getElementById('btn-nono-cross');

    fillBtn.addEventListener('click', () => {
      this.mode = 'fill';
      fillBtn.classList.add('mode-active');
      crossBtn.classList.remove('mode-active');
    });
    crossBtn.addEventListener('click', () => {
      this.mode = 'cross';
      crossBtn.classList.add('mode-active');
      fillBtn.classList.remove('mode-active');
    });

    document.getElementById('btn-nono-reset').addEventListener('click', () => {
      this.userGrid = Array(this.puzzle.size * this.puzzle.size).fill(0);
      this.renderGrid();
      this.saveState();
    });
  },

  buildShareText() {
    return `DailyPuzzleHub Nonogram #${this.PUZZLE_NUM} Revealed: ${this.puzzle.icon} ${this.puzzle.name}!\nhttps://dailypuzzlehub.com`;
  },

  saveState() {
    LS.set(`nonogram_state_${this.DATE_STR}`, { userGrid: this.userGrid, gameOver: this.gameOver, won: this.won });
  },

  loadState() {
    const saved = LS.get(`nonogram_state_${this.DATE_STR}`);
    if (saved) {
      this.userGrid = saved.userGrid || [];
      this.gameOver = saved.gameOver || false;
      this.won = saved.won || false;
    }
  }
};

/* ============================================================
   SECTION 16: GAME 7 — DAILY 2048
   ============================================================ */
const Game2048 = {
  DATE_STR: '',
  grid: Array(16).fill(0),
  score: 0,
  bestScore: 0,
  rng: null,
  gameOver: false,
  won: false,

  init() {
    this.DATE_STR = getUTCDateStr();
    this.rng = mulberry32(dateSeed(this.DATE_STR) ^ 0x2048);
    this.bestScore = LS.get('2048_best', 0);
    document.getElementById('best-2048').textContent = this.bestScore;

    this.loadState();
    if (this.grid.every(v => v === 0)) {
      this.spawnTile();
      this.spawnTile();
    }
    this.render();
    this.bindControls();
  },

  spawnTile() {
    const emptyIndices = [];
    this.grid.forEach((v, i) => { if (v === 0) emptyIndices.push(i); });
    if (emptyIndices.length === 0) return;
    const idx = emptyIndices[Math.floor(this.rng() * emptyIndices.length)];
    this.grid[idx] = this.rng() < 0.9 ? 2 : 4;
  },

  render() {
    const board = document.getElementById('g2048-grid');
    board.innerHTML = '';
    this.grid.forEach(val => {
      const tile = document.createElement('div');
      tile.className = 'g2048-tile';
      if (val > 0) {
        tile.textContent = val;
        tile.dataset.val = val;
      }
      board.appendChild(tile);
    });
    document.getElementById('score-2048').textContent = this.score;
  },

  slide(dir) {
    if (this.gameOver) return;
    let moved = false;
    const isHorizontal = dir === 'left' || dir === 'right';

    for (let i = 0; i < 4; i++) {
      let line = [];
      for (let j = 0; j < 4; j++) {
        const idx = isHorizontal ? i * 4 + j : j * 4 + i;
        line.push(this.grid[idx]);
      }
      if (dir === 'right' || dir === 'down') line.reverse();

      const filtered = line.filter(v => v !== 0);
      const merged = [];
      for (let k = 0; k < filtered.length; k++) {
        if (filtered[k] === filtered[k + 1]) {
          const val = filtered[k] * 2;
          merged.push(val);
          this.score += val;
          if (val === 2048 && !this.won) {
            this.won = true;
            StatsManager.recordWin('game2048');
            GameComplete.show('game2048', '🎉 2048 Tile Reached!', `<p>Magnificent! Daily High Score: <strong>${this.score}</strong></p>`, this.buildShareText());
          }
          k++;
        } else {
          merged.push(filtered[k]);
        }
      }
      while (merged.length < 4) merged.push(0);
      if (dir === 'right' || dir === 'down') merged.reverse();

      for (let j = 0; j < 4; j++) {
        const idx = isHorizontal ? i * 4 + j : j * 4 + i;
        if (this.grid[idx] !== merged[j]) moved = true;
        this.grid[idx] = merged[j];
      }
    }

    if (moved) {
      SoundFX.click();
      this.spawnTile();
      this.render();
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        LS.set('2048_best', this.bestScore);
        document.getElementById('best-2048').textContent = this.bestScore;
      }
      this.saveState();
      this.checkGameOver();
    }
  },

  checkGameOver() {
    if (this.grid.includes(0)) return;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const v = this.grid[r * 4 + c];
        if (c < 3 && v === this.grid[r * 4 + c + 1]) return;
        if (r < 3 && v === this.grid[(r + 1) * 4 + c]) return;
      }
    }
    // SECOND CHANCE REVIVE HOOK
    ReviveManager.promptRevive('game2048', () => {
      // Remove two lowest tiles to free space!
      let cleared = 0;
      for (let i = 0; i < 16; i++) {
        if (this.grid[i] === 2 || this.grid[i] === 4) {
          this.grid[i] = 0;
          cleared++;
          if (cleared >= 2) break;
        }
      }
      this.gameOver = false;
      this.render();
      this.saveState();
      showGameToast('2048', '✨ Second Chance! Cleared space on the board!');
    }, () => {
      this.gameOver = true;
      showGameToast('2048', 'No more valid moves! Final Score: ' + this.score);
    });
  },

  bindControls() {
    document.addEventListener('keydown', e => {
      if (NavManager.currentGame !== 'game2048') return;
      if (document.querySelector('.modal-overlay.open')) return;
      if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); this.slide('up'); }
      else if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); this.slide('down'); }
      else if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); this.slide('left'); }
      else if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); this.slide('right'); }
    });

    document.querySelectorAll('.g2048-pad-btn').forEach(btn => {
      btn.addEventListener('click', () => this.slide(btn.dataset.dir));
    });
  },

  buildShareText() {
    return `DailyPuzzleHub 2048 Score: ${this.score} pts! (Best: ${this.bestScore})\nhttps://dailypuzzlehub.com`;
  },

  saveState() {
    LS.set(`2048_state_${this.DATE_STR}`, { grid: this.grid, score: this.score, gameOver: this.gameOver, won: this.won });
  },

  loadState() {
    const saved = LS.get(`2048_state_${this.DATE_STR}`);
    if (saved) {
      this.grid = saved.grid || Array(16).fill(0);
      this.score = saved.score || 0;
      this.gameOver = saved.gameOver || false;
      this.won = saved.won || false;
    }
  }
};

/* ============================================================
   SECTION 17: GAME 8 — DAILY WORD SEARCH
   ============================================================ */
const WordSearchGame = {
  DATE_STR: '',
  PUZZLE_NUM: 0,
  puzzle: null,
  grid: Array(64).fill(''),
  foundWords: [],
  selectedCells: [],
  isDragging: false,
  startCell: null,
  gameOver: false,
  won: false,

  init() {
    this.DATE_STR = getUTCDateStr();
    this.PUZZLE_NUM = getPuzzleNumber(this.DATE_STR);
    const rng = mulberry32(dateSeed(this.DATE_STR) ^ 0x5EAC);
    const pIdx = Math.floor(rng() * WORDSEARCH_PUZZLES.length);
    this.puzzle = WORDSEARCH_PUZZLES[pIdx];

    document.getElementById('ws-theme').textContent = this.puzzle.theme;
    this.loadState();
    this.generateBoard(rng);
    this.render();
    this.bindEvents();
  },

  generateBoard(rng) {
    if (this.grid.some(c => c !== '')) return;
    this.grid = Array(64).fill('');

    const dirs = [[0,1],[1,0],[1,1],[0,-1],[-1,0]];
    this.puzzle.words.forEach(word => {
      let placed = false;
      let attempts = 0;
      while (!placed && attempts < 100) {
        attempts++;
        const dir = dirs[Math.floor(rng() * dirs.length)];
        const r = Math.floor(rng() * 8);
        const c = Math.floor(rng() * 8);
        const endR = r + dir[0] * (word.length - 1);
        const endC = c + dir[1] * (word.length - 1);

        if (endR >= 0 && endR < 8 && endC >= 0 && endC < 8) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            const idx = (r + dir[0] * i) * 8 + (c + dir[1] * i);
            if (this.grid[idx] !== '' && this.grid[idx] !== word[i]) {
              canPlace = false;
              break;
            }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              const idx = (r + dir[0] * i) * 8 + (c + dir[1] * i);
              this.grid[idx] = word[i];
            }
            placed = true;
          }
        }
      }
    });

    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let i = 0; i < 64; i++) {
      if (this.grid[i] === '') this.grid[i] = alpha[Math.floor(rng() * alpha.length)];
    }
  },

  render() {
    const chipsCont = document.getElementById('ws-word-chips');
    chipsCont.innerHTML = '';
    this.puzzle.words.forEach(w => {
      const chip = document.createElement('span');
      chip.className = `ws-chip ${this.foundWords.includes(w) ? 'found' : ''}`;
      chip.textContent = w;
      chipsCont.appendChild(chip);
    });

    const board = document.getElementById('ws-grid');
    board.innerHTML = '';
    for (let i = 0; i < 64; i++) {
      const cell = document.createElement('div');
      cell.className = 'ws-cell';
      cell.id = `wsc-${i}`;
      cell.textContent = this.grid[i];
      cell.dataset.idx = i;
      board.appendChild(cell);
    }
  },

  bindEvents() {
    const board = document.getElementById('ws-grid');

    board.addEventListener('pointerdown', e => {
      const cell = e.target.closest('.ws-cell');
      if (!cell) return;
      this.isDragging = true;
      this.startCell = parseInt(cell.dataset.idx, 10);
      this.selectedCells = [this.startCell];
      this.highlightCells();
    });

    window.addEventListener('pointermove', e => {
      if (!this.isDragging || this.startCell === null) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const cell = el?.closest('.ws-cell');
      if (!cell) return;
      const cur = parseInt(cell.dataset.idx, 10);
      this.calculateLine(this.startCell, cur);
      this.highlightCells();
    });

    window.addEventListener('pointerup', () => {
      if (!this.isDragging) return;
      this.isDragging = false;
      this.checkSelectedWord();
      this.selectedCells = [];
      this.highlightCells();
    });
  },

  calculateLine(start, end) {
    const r1 = Math.floor(start / 8), c1 = start % 8;
    const r2 = Math.floor(end / 8), c2 = end % 8;
    const dr = r2 - r1;
    const dc = c2 - c1;

    if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
      const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
      const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
      const len = Math.max(Math.abs(dr), Math.abs(dc)) + 1;
      this.selectedCells = [];
      for (let i = 0; i < len; i++) {
        this.selectedCells.push((r1 + stepR * i) * 8 + (c1 + stepC * i));
      }
    }
  },

  highlightCells() {
    document.querySelectorAll('.ws-cell').forEach(c => c.classList.remove('highlight'));
    this.selectedCells.forEach(idx => {
      document.getElementById(`wsc-${idx}`)?.classList.add('highlight');
    });
  },

  checkSelectedWord() {
    const word = this.selectedCells.map(i => this.grid[i]).join('');
    const rev = word.split('').reverse().join('');

    const match = this.puzzle.words.find(w => (w === word || w === rev) && !this.foundWords.includes(w));
    if (match) {
      SoundFX.success();
      this.foundWords.push(match);
      this.selectedCells.forEach(idx => {
        document.getElementById(`wsc-${idx}`)?.classList.add('found');
      });
      this.render();
      this.saveState();

      if (this.foundWords.length === this.puzzle.words.length) {
        this.won = true;
        this.gameOver = true;
        StatsManager.recordWin('wordsearch');
        GameComplete.show('wordsearch', '🎉 All Words Found!', `<p>Theme: <strong>${this.puzzle.theme}</strong> completely solved!</p>`, this.buildShareText());
      }
    }
  },

  buildShareText() {
    return `DailyPuzzleHub Word Search #${this.PUZZLE_NUM} (${this.puzzle.theme})\nFound all ${this.foundWords.length}/${this.puzzle.words.length} words!\nhttps://dailypuzzlehub.com`;
  },

  saveState() {
    LS.set(`wordsearch_state_${this.DATE_STR}`, { grid: this.grid, foundWords: this.foundWords, gameOver: this.gameOver, won: this.won });
  },

  loadState() {
    const saved = LS.get(`wordsearch_state_${this.DATE_STR}`);
    if (saved) {
      this.grid = saved.grid || [];
      this.foundWords = saved.foundWords || [];
      this.gameOver = saved.gameOver || false;
      this.won = saved.won || false;
    }
  }
};

/* ============================================================
   SECTION 18: GAME 9 — DAILY ANAGRAM SCRAMBLE
   ============================================================ */
const AnagramGame = {
  DATE_STR: '',
  PUZZLE_NUM: 0,
  puzzle: null,
  letters: [],
  placed: [],
  gameOver: false,
  won: false,

  init() {
    this.DATE_STR = getUTCDateStr();
    this.PUZZLE_NUM = getPuzzleNumber(this.DATE_STR);
    document.getElementById('anagram-number').textContent = `#${this.PUZZLE_NUM}`;

    const rng = mulberry32(dateSeed(this.DATE_STR) ^ 0x4A4A);
    const pIdx = Math.floor(rng() * ANAGRAM_PUZZLES.length);
    this.puzzle = ANAGRAM_PUZZLES[pIdx];

    document.getElementById('anagram-clue-text').textContent = this.puzzle.clue;
    this.loadState();
    if (this.letters.length === 0) {
      this.letters = seededShuffle(this.puzzle.target.split(''), rng);
    }
    this.render();
    this.bindControls();
  },

  render() {
    const slots = document.getElementById('anagram-slots');
    slots.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      const slot = document.createElement('div');
      slot.className = 'anagram-slot';
      slot.textContent = this.placed[i] || '';
      slot.addEventListener('click', () => this.removeLetter(i));
      slots.appendChild(slot);
    }

    const rack = document.getElementById('anagram-rack');
    rack.innerHTML = '';
    this.letters.forEach((l, i) => {
      const tile = document.createElement('button');
      tile.className = 'anagram-tile';
      tile.textContent = l;
      const placedCount = this.placed.filter(p => p === l).length;
      const totalCount = this.letters.slice(0, i + 1).filter(x => x === l).length;
      if (totalCount <= placedCount) tile.classList.add('used');

      tile.addEventListener('click', () => this.placeLetter(l));
      rack.appendChild(tile);
    });
  },

  placeLetter(letter) {
    if (this.gameOver || this.placed.length >= 7) return;
    this.placed.push(letter);
    SoundFX.click();
    this.render();
  },

  removeLetter(slotIdx) {
    if (this.gameOver || !this.placed[slotIdx]) return;
    this.placed.splice(slotIdx, 1);
    SoundFX.click();
    this.render();
  },

  submit() {
    if (this.placed.length < 7) {
      showGameToast('anagram', 'Fill all 7 letters!');
      SoundFX.error();
      return;
    }
    const attempt = this.placed.join('');
    if (attempt === this.puzzle.target) {
      this.won = true;
      this.gameOver = true;
      StatsManager.recordWin('anagram');
      this.saveState();
      GameComplete.show('anagram', '🎉 Anagram Solved!', `<p>Secret Word: <strong>${this.puzzle.target}</strong></p><p>${this.puzzle.clue}</p>`, this.buildShareText());
    } else {
      showGameToast('anagram', 'Not the correct word. Try again!');
      SoundFX.error();
    }
  },

  bindControls() {
    document.getElementById('btn-anagram-shuffle').addEventListener('click', () => {
      this.letters = seededShuffle(this.letters, mulberry32(Date.now()));
      this.render();
    });
    document.getElementById('btn-anagram-clear').addEventListener('click', () => {
      this.placed = [];
      this.render();
    });
    document.getElementById('btn-anagram-submit').addEventListener('click', () => this.submit());
  },

  buildShareText() {
    return `DailyPuzzleHub Anagram #${this.PUZZLE_NUM} Solved: ${this.puzzle.target}!\nhttps://dailypuzzlehub.com`;
  },

  saveState() {
    LS.set(`anagram_state_${this.DATE_STR}`, { placed: this.placed, gameOver: this.gameOver, won: this.won });
  },

  loadState() {
    const saved = LS.get(`anagram_state_${this.DATE_STR}`);
    if (saved) {
      this.placed = saved.placed || [];
      this.gameOver = saved.gameOver || false;
      this.won = saved.won || false;
    }
  }
};

/* ============================================================
   SECTION 19: GAME 10 — DAILY MEMORY MATCH
   ============================================================ */
const MemoryGame = {
  DATE_STR: '',
  cards: [],
  flipped: [],
  matched: [],
  moves: 0,
  gameOver: false,
  won: false,

  init() {
    this.DATE_STR = getUTCDateStr();
    const rng = mulberry32(dateSeed(this.DATE_STR) ^ 0x3E30);
    const setIdx = Math.floor(rng() * MEMORY_MATCH_SETS.length);
    const emojis = MEMORY_MATCH_SETS[setIdx];

    this.loadState();
    if (this.cards.length === 0) {
      this.cards = seededShuffle([...emojis, ...emojis], rng);
    }
    this.render();
  },

  render() {
    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';
    this.cards.forEach((emoji, i) => {
      const card = document.createElement('div');
      const isFlipped = this.flipped.includes(i) || this.matched.includes(i);
      card.className = `memory-card ${isFlipped ? 'flipped' : ''} ${this.matched.includes(i) ? 'matched' : ''}`;
      card.innerHTML = `
        <div class="memory-card-inner">
          <div class="memory-card-front">?</div>
          <div class="memory-card-back">${emoji}</div>
        </div>
      `;
      card.addEventListener('click', () => this.flipCard(i));
      grid.appendChild(card);
    });

    document.getElementById('memory-moves').textContent = this.moves;
    document.getElementById('memory-pairs').textContent = `${this.matched.length / 2}/8`;
  },

  flipCard(idx) {
    if (this.gameOver || this.flipped.length >= 2 || this.flipped.includes(idx) || this.matched.includes(idx)) return;
    this.flipped.push(idx);
    SoundFX.click();
    this.render();

    if (this.flipped.length === 2) {
      this.moves++;
      const [a, b] = this.flipped;
      if (this.cards[a] === this.cards[b]) {
        SoundFX.success();
        this.matched.push(a, b);
        this.flipped = [];
        this.render();
        this.saveState();
        if (this.matched.length === 16) {
          this.won = true;
          this.gameOver = true;
          StatsManager.recordWin('memory');
          GameComplete.show('memory', '🎉 Memory Match Complete!', `<p>All 8 pairs matched in <strong>${this.moves} moves</strong>!</p>`, this.buildShareText());
        }
      } else {
        setTimeout(() => {
          this.flipped = [];
          this.render();
        }, 850);
      }
    }
  },

  buildShareText() {
    return `DailyPuzzleHub Memory Match #${getPuzzleNumber(this.DATE_STR)}: Cleared in ${this.moves} moves!\nhttps://dailypuzzlehub.com`;
  },

  saveState() {
    LS.set(`memory_state_${this.DATE_STR}`, { cards: this.cards, matched: this.matched, moves: this.moves, gameOver: this.gameOver, won: this.won });
  },

  loadState() {
    const saved = LS.get(`memory_state_${this.DATE_STR}`);
    if (saved) {
      this.cards = saved.cards || [];
      this.matched = saved.matched || [];
      this.moves = saved.moves || 0;
      this.gameOver = saved.gameOver || false;
      this.won = saved.won || false;
    }
  }
};

/* ============================================================
   SECTION 20: GAME 11 — DAILY SLIDING PUZZLE (3x3)
   ============================================================ */
const SlidingPuzzleGame = {
  DATE_STR: '',
  tiles: [],
  moves: 0,
  gameOver: false,
  won: false,

  init() {
    this.DATE_STR = getUTCDateStr();
    const rng = mulberry32(dateSeed(this.DATE_STR) ^ 0x511D);
    this.loadState();
    if (this.tiles.length === 0) {
      this.generateSolvable(rng);
    }
    this.render();
  },

  generateSolvable(rng) {
    this.tiles = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    let blank = 8;
    for (let i = 0; i < 40; i++) {
      const neighbors = this.getNeighbors(blank);
      const chosen = neighbors[Math.floor(rng() * neighbors.length)];
      [this.tiles[blank], this.tiles[chosen]] = [this.tiles[chosen], this.tiles[blank]];
      blank = chosen;
    }
  },

  getNeighbors(idx) {
    const r = Math.floor(idx / 3);
    const c = idx % 3;
    const n = [];
    if (r > 0) n.push((r - 1) * 3 + c);
    if (r < 2) n.push((r + 1) * 3 + c);
    if (c > 0) n.push(r * 3 + (c - 1));
    if (c < 2) n.push(r * 3 + (c + 1));
    return n;
  },

  render() {
    const grid = document.getElementById('sliding-grid');
    grid.innerHTML = '';
    this.tiles.forEach((val, i) => {
      const tile = document.createElement('div');
      tile.className = `sliding-tile ${val === 0 ? 'empty' : ''}`;
      tile.textContent = val !== 0 ? val : '';
      tile.addEventListener('click', () => this.trySlide(i));
      grid.appendChild(tile);
    });
    document.getElementById('sliding-moves').textContent = this.moves;
  },

  trySlide(idx) {
    if (this.gameOver) return;
    const blank = this.tiles.indexOf(0);
    if (this.getNeighbors(blank).includes(idx)) {
      [this.tiles[blank], this.tiles[idx]] = [this.tiles[idx], this.tiles[blank]];
      this.moves++;
      SoundFX.click();
      this.render();
      this.saveState();
      this.checkWin();
    }
  },

  checkWin() {
    const solved = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    if (this.tiles.every((v, i) => v === solved[i])) {
      this.won = true;
      this.gameOver = true;
      StatsManager.recordWin('sliding');
      GameComplete.show('sliding', '🎉 Sliding Puzzle Solved!', `<p>Order restored in <strong>${this.moves} moves</strong>!</p>`, this.buildShareText());
    }
  },

  buildShareText() {
    return `DailyPuzzleHub Sliding Puzzle #${getPuzzleNumber(this.DATE_STR)}: Solved in ${this.moves} moves!\nhttps://dailypuzzlehub.com`;
  },

  saveState() {
    LS.set(`sliding_state_${this.DATE_STR}`, { tiles: this.tiles, moves: this.moves, gameOver: this.gameOver, won: this.won });
  },

  loadState() {
    const saved = LS.get(`sliding_state_${this.DATE_STR}`);
    if (saved) {
      this.tiles = saved.tiles || [];
      this.moves = saved.moves || 0;
      this.gameOver = saved.gameOver || false;
      this.won = saved.won || false;
    }
  }
};

/* ============================================================
   SECTION 21: GAME 12 — DAILY SEQUENCE MEMORY (SIMON)
   ============================================================ */
const SequenceGame = {
  DATE_STR: '',
  sequence: [],
  playerStep: 0,
  currentLevel: 1,
  MAX_LEVEL: 8,
  isPlayingBack: false,
  pads: [261.63, 329.63, 392.00, 523.25],
  gameOver: false,
  won: false,

  init() {
    this.DATE_STR = getUTCDateStr();
    const rng = mulberry32(dateSeed(this.DATE_STR) ^ 0x5130);
    this.sequence = Array.from({ length: this.MAX_LEVEL }, () => Math.floor(rng() * 4));

    this.loadState();
    this.render();
    this.bindControls();
  },

  render() {
    document.getElementById('seq-level').textContent = `${this.currentLevel}/${this.MAX_LEVEL}`;
    document.getElementById('seq-best').textContent = LS.get('seq_best', 0);
  },

  startSequence() {
    if (this.isPlayingBack || this.gameOver) return;
    this.playSequence();
  },

  async playSequence() {
    this.isPlayingBack = true;
    this.playerStep = 0;
    document.getElementById('simon-status').textContent = 'Watch...';

    for (let i = 0; i < this.currentLevel; i++) {
      await new Promise(r => setTimeout(r, 450));
      this.lightPad(this.sequence[i]);
    }
    await new Promise(r => setTimeout(r, 400));
    document.getElementById('simon-status').textContent = 'Your Turn!';
    this.isPlayingBack = false;
  },

  lightPad(idx) {
    const pad = document.querySelector(`.simon-pad[data-pad="${idx}"]`);
    if (!pad) return;
    pad.classList.add('lit');
    SoundFX.playTone(this.pads[idx], 'triangle', 0.25, 0.2);
    setTimeout(() => pad.classList.remove('lit'), 300);
  },

  handlePadClick(idx) {
    if (this.isPlayingBack || this.gameOver) return;
    this.lightPad(idx);

    if (idx === this.sequence[this.playerStep]) {
      this.playerStep++;
      if (this.playerStep === this.currentLevel) {
        SoundFX.success();
        if (this.currentLevel === this.MAX_LEVEL) {
          this.won = true;
          this.gameOver = true;
          StatsManager.recordWin('sequence');
          this.saveState();
          GameComplete.show('sequence', '🎉 Sequence Mastered!', `<p>All 8 sequence rounds conquered flawlessly!</p>`, this.buildShareText());
        } else {
          this.currentLevel++;
          this.render();
          this.saveState();
          setTimeout(() => this.playSequence(), 800);
        }
      }
    } else {
      SoundFX.error();
      if (this.currentLevel > 1 && ReviveManager.canRevive('sequence')) {
        document.getElementById('simon-status').textContent = 'Mistake!';
        ReviveManager.promptRevive('sequence', () => {
          this.playerStep = 0;
          document.getElementById('simon-status').textContent = 'Replaying Pattern...';
          setTimeout(() => this.playSequence(), 600);
          showGameToast('sequence', `✨ Second Chance! Replaying Round ${this.currentLevel}!`);
        }, () => {
          this.currentLevel = 1;
          this.playerStep = 0;
          this.render();
          document.getElementById('simon-status').textContent = 'Restarted at Round 1';
        });
      } else {
        document.getElementById('simon-status').textContent = 'Mistake! Replay';
        this.playerStep = 0;
      }
    }
  },

  bindControls() {
    document.getElementById('btn-seq-start').addEventListener('click', () => this.startSequence());
    document.querySelectorAll('.simon-pad').forEach(pad => {
      pad.addEventListener('click', () => this.handlePadClick(parseInt(pad.dataset.pad, 10)));
    });
  },

  buildShareText() {
    return `DailyPuzzleHub Sequence Memory #${getPuzzleNumber(this.DATE_STR)}: Cleared Level ${this.currentLevel}/8!\nhttps://dailypuzzlehub.com`;
  },

  saveState() {
    LS.set(`sequence_state_${this.DATE_STR}`, { currentLevel: this.currentLevel, gameOver: this.gameOver, won: this.won });
  },

  loadState() {
    const saved = LS.get(`sequence_state_${this.DATE_STR}`);
    if (saved) {
      this.currentLevel = saved.currentLevel || 1;
      this.gameOver = saved.gameOver || false;
      this.won = saved.won || false;
    }
  }
};

/* ============================================================
   SECTION 22: GAME 13 — DAILY CRYPTOGRAM
   ============================================================ */
const CryptogramGame = {
  DATE_STR: '',
  PUZZLE_NUM: 0,
  quoteObj: null,
  cipherMap: {},    // plainLetter  -> cipherLetter
  reverseMap: {},   // cipherLetter -> plainLetter
  userGuesses: {},  // cipherLetter -> guessed plainLetter
  selectedCipher: null, // currently selected cipher letter (BUG FIX: explicit state)
  gameOver: false,
  won: false,
  _keydownBound: false,

  init() {
    this.DATE_STR = getUTCDateStr();
    this.PUZZLE_NUM = getPuzzleNumber(this.DATE_STR);
    document.getElementById('crypto-number').textContent = `#${this.PUZZLE_NUM}`;

    const rng = mulberry32(dateSeed(this.DATE_STR) ^ 0xC919);
    const qIdx = Math.floor(rng() * CRYPTOGRAM_PUZZLES.length);
    this.quoteObj = CRYPTOGRAM_PUZZLES[qIdx];
    document.getElementById('crypto-author').textContent = `— ${this.quoteObj.author}`;

    this.cipherMap = {};
    this.reverseMap = {};
    this.userGuesses = {};
    this.selectedCipher = null;

    this.generateCipher(rng);
    this.loadState();
    this.render();
    this.buildOnScreenKeyboard();
    this.bindControls();
    this.bindGlobalKeydown();
  },

  generateCipher(rng) {
    const alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    let shuffled = seededShuffle(alpha, rng);
    // Ensure no letter maps to itself
    for (let i = 0; i < 26; i++) {
      if (shuffled[i] === alpha[i]) {
        const next = (i + 1) % 26;
        [shuffled[i], shuffled[next]] = [shuffled[next], shuffled[i]];
      }
    }
    alpha.forEach((plain, i) => {
      this.cipherMap[plain]    = shuffled[i];
      this.reverseMap[shuffled[i]] = plain;
    });
  },

  // ── BUG FIX: Render delegates click to char-box, highlights ALL matching slots ──
  render() {
    const board = document.getElementById('cryptogram-board');
    board.innerHTML = '';
    const words = this.quoteObj.quote.split(' ');

    words.forEach(word => {
      const wordBox = document.createElement('div');
      wordBox.className = 'crypto-word';

      word.split('').forEach(ch => {
        if (/[A-Z]/.test(ch)) {
          const cipherChar = this.cipherMap[ch];
          const isSelected = this.selectedCipher === cipherChar;
          const guessedVal = this.userGuesses[cipherChar] || '';
          const isCorrect  = guessedVal === ch;

          const charBox = document.createElement('div');
          charBox.className = 'crypto-char-box' +
            (isSelected ? ' highlight' : '') +
            (guessedVal ? ' filled' : '') +
            (isCorrect  ? ' correct' : '');
          charBox.dataset.cipher = cipherChar;

          // Clicking any box selects that cipher letter (BUG FIX)
          charBox.addEventListener('click', () => {
            if (!this.gameOver) {
              this.selectedCipher = cipherChar;
              this.render();
              this.updateKeyboard();
            }
          });

          const input = document.createElement('div');
          input.className = 'crypto-input';
          input.textContent = guessedVal;

          const cipherLabel = document.createElement('span');
          cipherLabel.className = 'crypto-cipher-letter';
          cipherLabel.textContent = cipherChar;

          charBox.appendChild(input);
          charBox.appendChild(cipherLabel);
          wordBox.appendChild(charBox);
        } else {
          const punct = document.createElement('span');
          punct.className = 'crypto-punct';
          punct.textContent = ch;
          wordBox.appendChild(punct);
        }
      });
      board.appendChild(wordBox);
    });
  },

  // ── Centralised key handler called by physical keyboard + on-screen keyboard ──
  handleCryptoKey(key) {
    if (this.gameOver || !this.selectedCipher) return;

    if (key === 'BACKSPACE' || key === '⌫') {
      this.userGuesses[this.selectedCipher] = '';
    } else if (/^[A-Z]$/.test(key)) {
      this.userGuesses[this.selectedCipher] = key;
      SoundFX.click();
      // Auto-advance: select next unfilled cipher letter in sequence
      this.advanceSelection();
    }
    this.render();
    this.updateKeyboard();
    this.saveState();
    this.checkWin();
  },

  advanceSelection() {
    // Build an ordered list of all cipher letters that appear in the quote
    const orderedCiphers = [];
    const seen = new Set();
    for (const ch of this.quoteObj.quote) {
      if (/[A-Z]/.test(ch)) {
        const cipher = this.cipherMap[ch];
        if (!seen.has(cipher)) { seen.add(cipher); orderedCiphers.push(cipher); }
      }
    }
    const idx = orderedCiphers.indexOf(this.selectedCipher);
    // Find next cipher letter that isn't fully guessed
    for (let offset = 1; offset < orderedCiphers.length; offset++) {
      const next = orderedCiphers[(idx + offset) % orderedCiphers.length];
      if (!this.userGuesses[next]) {
        this.selectedCipher = next;
        return;
      }
    }
  },

  // ── BUG FIX: Global keydown scoped to cryptogram panel ──
  bindGlobalKeydown() {
    if (this._keydownBound) return;
    this._keydownBound = true;
    document.addEventListener('keydown', e => {
      if (NavManager.currentGame !== 'cryptogram') return;
      if (document.querySelector('.modal-overlay.open')) return;
      if (e.key === 'Backspace') { e.preventDefault(); this.handleCryptoKey('BACKSPACE'); }
      else if (e.key === 'Escape') { this.selectedCipher = null; this.render(); this.updateKeyboard(); }
      else if (/^[a-zA-Z]$/.test(e.key)) this.handleCryptoKey(e.key.toUpperCase());
    });
  },

  buildOnScreenKeyboard() {
    const panel = document.getElementById('panel-cryptogram');
    if (!panel || panel.querySelector('.crypto-keyboard')) return;

    const rows = [
      ['Q','W','E','R','T','Y','U','I','O','P'],
      ['A','S','D','F','G','H','J','K','L'],
      ['⌫','Z','X','C','V','B','N','M']
    ];
    const kb = document.createElement('div');
    kb.className = 'crypto-keyboard';

    rows.forEach(row => {
      const rowEl = document.createElement('div');
      rowEl.className = 'crypto-kb-row';
      row.forEach(k => {
        const btn = document.createElement('button');
        btn.className = 'crypto-kb-key' + (k === '⌫' ? ' wide' : '');
        btn.textContent = k;
        btn.dataset.key = k;
        btn.addEventListener('click', () => this.handleCryptoKey(k === '⌫' ? 'BACKSPACE' : k));
        rowEl.appendChild(btn);
      });
      kb.appendChild(rowEl);
    });

    // Insert keyboard after the board
    const board = document.getElementById('cryptogram-board');
    board.parentNode.insertBefore(kb, board.nextSibling);
  },

  updateKeyboard() {
    const kb = document.querySelector('#panel-cryptogram .crypto-keyboard');
    if (!kb) return;
    // Mark keys that have been used as guesses
    kb.querySelectorAll('.crypto-kb-key').forEach(btn => {
      const k = btn.dataset.key;
      if (k === '⌫') return;
      const isUsed = Object.values(this.userGuesses).includes(k);
      btn.classList.toggle('used', isUsed);
    });
  },

  checkWin() {
    const fullQuote = this.quoteObj.quote;
    for (const ch of fullQuote) {
      if (/[A-Z]/.test(ch)) {
        const cipher = this.cipherMap[ch];
        if (this.userGuesses[cipher] !== ch) return;
      }
    }
    this.won = true;
    this.gameOver = true;
    StatsManager.recordWin('cryptogram');
    GameComplete.show('cryptogram', '🎉 Cryptogram Deciphered!',
      `<p>"${this.quoteObj.quote}"</p><p><strong>— ${this.quoteObj.author}</strong></p>`,
      this.buildShareText());
  },

  bindControls() {
    document.getElementById('btn-crypto-hint').addEventListener('click', () => {
      const unrevealed = Object.keys(this.reverseMap).filter(c => this.userGuesses[c] !== this.reverseMap[c]);
      if (unrevealed.length > 0) {
        // Reveal a hint for the currently selected cipher, else pick first unrevealed
        const target = (this.selectedCipher && unrevealed.includes(this.selectedCipher))
          ? this.selectedCipher : unrevealed[0];
        this.userGuesses[target] = this.reverseMap[target];
        SoundFX.click();
        this.render();
        this.updateKeyboard();
        this.saveState();
        this.checkWin();
        showGameToast('crypto', `💡 Hint revealed: ${target} = ${this.reverseMap[target]}`);
      }
    });

    document.getElementById('btn-crypto-clear').addEventListener('click', () => {
      this.userGuesses = {};
      this.selectedCipher = null;
      this.render();
      this.updateKeyboard();
      this.saveState();
    });

    document.getElementById('btn-crypto-check').addEventListener('click', () => {
      let errors = 0;
      Object.keys(this.userGuesses).forEach(c => {
        if (this.userGuesses[c] && this.userGuesses[c] !== this.reverseMap[c]) errors++;
      });
      showGameToast('crypto', errors > 0
        ? `❌ ${errors} incorrect substitution(s) found`
        : '✅ All entered letters are correct so far!');
    });
  },

  buildShareText() {
    return `DailyPuzzleHub Cryptogram #${this.PUZZLE_NUM} Decoded!\nAuthor: ${this.quoteObj.author}\nhttps://dailypuzzlehub.com`;
  },

  saveState() {
    LS.set(`cryptogram_state_${this.DATE_STR}`, {
      userGuesses: this.userGuesses,
      selectedCipher: this.selectedCipher,
      gameOver: this.gameOver,
      won: this.won
    });
  },

  loadState() {
    const saved = LS.get(`cryptogram_state_${this.DATE_STR}`);
    if (saved) {
      this.userGuesses    = saved.userGuesses    || {};
      this.selectedCipher = saved.selectedCipher || null;
      this.gameOver       = saved.gameOver       || false;
      this.won            = saved.won            || false;
    }
  }
};

/* ============================================================
   SECTION 23: ADSENSE & APPLICATION INIT
   ============================================================ */
function initAdSense() {
  if (typeof window.adsbygoogle === 'undefined') {
    window.adsbygoogle = [];
  }
  try {
    document.querySelectorAll('ins.adsbygoogle').forEach(ins => {
      if (!ins.dataset.adStatus) {
        window.adsbygoogle.push({});
      }
    });
  } catch (e) {}
}

function initApp() {
  SoundFX.init();
  ThemeManager.init();
  CountdownManager.init();
  ModalManager.init();
  ReviveManager.init();
  GameComplete.init();

  // Initialize all 13 games
  WordleGame.init();
  SudokuGame.init();
  MinesweeperGame.init();
  ConnectionsGame.init();
  CrosswordGame.init();
  NonogramGame.init();
  Game2048.init();
  WordSearchGame.init();
  AnagramGame.init();
  MemoryGame.init();
  SlidingPuzzleGame.init();
  SequenceGame.init();
  CryptogramGame.init();

  // Navigation and Home Dashboard
  NavManager.init();

  // AdSense
  initAdSense();

  console.log(
    '%c🧩 DailyPuzzleHub Suite Loaded (13 Daily Games + Home Dashboard)',
    'font-size:18px;color:#6366f1;font-weight:bold;',
    `\nUTC Seed: ${getUTCDateStr()} · Puzzle #${getPuzzleNumber(getUTCDateStr())}`
  );
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
