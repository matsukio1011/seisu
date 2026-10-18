(function () {
  'use strict';

  const patternsData = window.QUESTIONS_DATA || [];

  // ==================== SOUND MANAGER (Web Audio API) ====================
  let audioCtx = null;
  let soundEnabled = localStorage.getItem('mojishiki_sound') !== 'false';

  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  function playTone(freq, startDelay, duration, type = 'sine', peakGain = 0.15) {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + startDelay;
      const stopTime = startTime + duration;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, stopTime);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(stopTime);
    } catch (e) {
      // Audio context error fallback
    }
  }

  function playCorrectSound() {
    if (!soundEnabled) return;
    // Pleasant 2-tone chime (C5 -> E5 -> G5)
    playTone(523.25, 0.0, 0.12, 'sine', 0.18);
    playTone(659.25, 0.08, 0.28, 'sine', 0.22);
  }

  function playWrongSound() {
    if (!soundEnabled) return;
    // Low double buzzer (Sawtooth)
    playTone(146.83, 0.0, 0.12, 'sawtooth', 0.16);
    playTone(138.59, 0.14, 0.18, 'sawtooth', 0.18);
  }

  function playPassFanfare() {
    if (!soundEnabled) return;
    // Triumphant fanfare: C5 -> E5 -> G5 -> C6 chord
    playTone(523.25, 0.0, 0.12, 'triangle', 0.20);
    playTone(659.25, 0.12, 0.12, 'triangle', 0.22);
    playTone(783.99, 0.24, 0.16, 'triangle', 0.24);
    // Chord on top
    playTone(523.25, 0.40, 0.65, 'triangle', 0.15);
    playTone(659.25, 0.40, 0.65, 'triangle', 0.18);
    playTone(783.99, 0.40, 0.65, 'triangle', 0.20);
    playTone(1046.50, 0.40, 0.70, 'sine', 0.25);
  }

  // ==================== HISTORY MANAGER ====================
  const STORAGE_KEY = 'mojishiki_learning_history';

  function getStoredHistory() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (data && typeof data === 'object') {
        return {
          totalAnswers: data.totalAnswers || 0,
          totalCorrect: data.totalCorrect || 0,
          maxStreakEver: data.maxStreakEver || 0,
          passCount: data.passCount || 0,
          logs: Array.isArray(data.logs) ? data.logs : []
        };
      }
    } catch (e) {}
    return {
      totalAnswers: 0,
      totalCorrect: 0,
      maxStreakEver: 0,
      passCount: 0,
      logs: []
    };
  }

  function saveStoredHistory(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  function recordHistoryItem(q, chosenExpr, isCorrect) {
    const hist = getStoredHistory();
    hist.totalAnswers++;
    if (isCorrect) hist.totalCorrect++;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    hist.logs.unshift({
      id: Date.now() + Math.random(),
      time: timeStr,
      patternId: q.patternId,
      patternTitle: q.patternTitle,
      subpatternId: q.subpatternId,
      subpatternTitle: q.subpatternTitle,
      text: q.text,
      correctExpr: q.correct,
      chosenExpr: chosenExpr,
      isCorrect: isCorrect
    });

    if (hist.logs.length > 200) {
      hist.logs = hist.logs.slice(0, 200);
    }
    saveStoredHistory(hist);
  }

  function recordPassAchievement() {
    const hist = getStoredHistory();
    hist.passCount++;
    saveStoredHistory(hist);
  }

  function updateMaxStreakRecord(streak) {
    const hist = getStoredHistory();
    if (streak > hist.maxStreakEver) {
      hist.maxStreakEver = streak;
      saveStoredHistory(hist);
    }
  }

  // ==================== APPLICATION STATE ====================
  let selectedPatternIds = new Set(patternsData.map(p => p.id));
  let orderMode = 'random'; // 'random' | 'sequential'
  let questionLimit = 10;   // 5 | 10 | 20 | 0 (0 = all)
  let goalStreak = 10;      // 5 | 10 | 15 | 20 | 0 (0 = none)
  let speedUnitMode = localStorage.getItem('mojishiki_speed_unit') || 'prefix'; // 'prefix' (分速m) | 'slash' (m/分)

  let quizQueue = [];
  let currentIndex = 0;
  let currentQuestion = null;
  let currentChoices = [];
  let currentSelectedIndex = -1;
  let answered = false;
  let autoNextTimer = null;
  let hasPassedThisRound = false;

  let stats = {
    correct: 0,
    wrong: 0,
    streak: 0,
    maxStreak: 0,
    wrongQuestions: []
  };

  // DOM Elements
  const viewSetup = document.getElementById('view-setup');
  const viewQuiz = document.getElementById('view-quiz');
  const viewSummary = document.getElementById('view-summary');

  const patternGrid = document.getElementById('pattern-grid');
  const selectionSummary = document.getElementById('selection-summary');
  const btnSelectAll = document.getElementById('btn-select-all');
  const btnClearAll = document.getElementById('btn-clear-all');
  const btnStartQuiz = document.getElementById('btn-start-quiz');
  const btnBackSetup = document.getElementById('btn-back-setup');
  const btnTheme = document.getElementById('btn-theme');
  const btnSound = document.getElementById('btn-sound');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const btnHistory = document.getElementById('btn-history');

  // Quiz DOM
  const progressLabel = document.getElementById('progress-label');
  const progressFill = document.getElementById('progress-fill');
  const pillCorrect = document.getElementById('pill-correct');
  const pillWrong = document.getElementById('pill-wrong');
  const pillStreak = document.getElementById('pill-streak');
  const quickPatternSelect = document.getElementById('quick-pattern-select');

  const qNumBadge = document.getElementById('q-num-badge');
  const qPatternBadge = document.getElementById('q-pattern-badge');
  const qSubpatternBadge = document.getElementById('q-subpattern-badge');
  const qText = document.getElementById('q-text');
  const qHintBar = document.getElementById('q-hint-bar');
  const qHintContent = document.getElementById('q-hint-content');
  const btnQuizSpeed = document.getElementById('btn-quiz-speed');
  const btnToggleHint = document.getElementById('btn-toggle-hint');
  const choicesGrid = document.getElementById('choices-grid');

  const quizActionSlot = document.getElementById('quiz-action-slot');
  const slotPrompt = document.getElementById('slot-prompt');
  const slotCorrect = document.getElementById('slot-correct');
  const slotWrong = document.getElementById('slot-wrong');
  const wrongFeedbackText = document.getElementById('wrong-feedback-text');
  const wrongReasonText = document.getElementById('wrong-reason-text');
  const btnNextQuestion = document.getElementById('btn-next-question');

  // Summary DOM
  const sumTotal = document.getElementById('sum-total');
  const sumCorrect = document.getElementById('sum-correct');
  const sumAccuracy = document.getElementById('sum-accuracy');
  const sumStreak = document.getElementById('sum-streak');
  const btnRetrySame = document.getElementById('btn-retry-same');
  const btnReviewWrong = document.getElementById('btn-review-wrong');
  const btnSummaryHistory = document.getElementById('btn-summary-history');
  const btnToSetup = document.getElementById('btn-to-setup');

  // Modal 1: Pass Modal
  const modalPass = document.getElementById('modal-pass');
  const passMsg = document.getElementById('pass-msg');
  const btnPassContinue = document.getElementById('btn-pass-continue');
  const btnPassHistory = document.getElementById('btn-pass-history');
  const btnPassSetup = document.getElementById('btn-pass-setup');

  // Modal 2: History Modal
  const modalHistory = document.getElementById('modal-history');
  const btnCloseHistory = document.getElementById('btn-close-history');
  const btnCloseHistoryBottom = document.getElementById('btn-close-history-bottom');
  const btnClearHistory = document.getElementById('btn-clear-history');
  const histTotal = document.getElementById('hist-total');
  const histAccuracy = document.getElementById('hist-accuracy');
  const histCurrentStreak = document.getElementById('hist-current-streak');
  const histMaxStreak = document.getElementById('hist-max-streak');
  const histPassCount = document.getElementById('hist-pass-count');
  const historyEmpty = document.getElementById('history-empty');
  const historyTbody = document.getElementById('history-tbody');

  // ==================== SPEED UNIT CONVERSION & MATH RENDERING ====================
  function applySpeedUnit(str) {
    if (!str || speedUnitMode !== 'slash') return str || '';
    return str
      .replace(/時速何\s*\$\\text\{\s*km\}\$\s*か/g, '何 $\\text{km/時}$ か')
      .replace(/分速何\s*\$\\text\{\s*m\}\$\s*か/g, '何 $\\text{m/分}$ か')
      .replace(/秒速何\s*\$\\text\{\s*m\}\$\s*か/g, '何 $\\text{m/秒}$ か')
      .replace(/平均の分速\s*\(\$\\text\{\s*m\}\$\)/g, '平均の速さ ($\\text{m/分}$)')
      .replace(/時速\s*\$([^$]+?)\\text\{\s*km\}\$/g, '$$$1\\text{ km/時}$$')
      .replace(/分速\s*\$([^$]+?)\\text\{\s*m\}\$/g, '$$$1\\text{ m/分}$$')
      .replace(/秒速\s*\$([^$]+?)\\text\{\s*m\}\$/g, '$$$1\\text{ m/秒}$$')
      .replace(/分速\s*\$([^$]+?)\$\s*m/g, '$$$1\\text{ m/分}$$')
      .replace(/時速\s*([\d.]+)\s*km/g, '$$$1\\text{ km/時}$$')
      .replace(/分速\s*([\d.]+)\s*m/g, '$$$1\\text{ m/分}$$')
      .replace(/秒速\s*([\d.]+)\s*m/g, '$$$1\\text{ m/秒}$$')
      .replace(/（時速）/g, '（km/時）')
      .replace(/（分速）/g, '（m/分）')
      .replace(/（分速/g, '（m/分')
      .replace(/（秒速/g, '（m/秒')
      .replace(/（時速/g, '（km/時')
      .replace(/秒速・分速・時速/g, 'm/秒・m/分・km/時')
      .replace(/時速と分/g, 'km/時と分');
  }

  function renderMathInString(str) {
    if (!str) return '';
    const formatted = applySpeedUnit(str);
    return formatted.replace(/\$([^$]+)\$/g, function (_, tex) {
      if (window.katex) {
        try {
          return window.katex.renderToString(tex, {
            throwOnError: false,
            displayMode: false
          });
        } catch (e) {
          return fallbackTexToHtml(tex);
        }
      }
      return fallbackTexToHtml(tex);
    });
  }

  function fallbackTexToHtml(tex) {
    let s = tex
      .replace(/\\,\\{\\}\\^\\circ\\text\{C\}/g, '℃')
      .replace(/\^\\circ\\text\{C\}/g, '℃')
      .replace(/\\text\{\s*([^}]*)\}/g, '<span class="math-unit">$1</span>')
      .replace(/\\left\(/g, '(')
      .replace(/\\right\)/g, ')')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '<span class="frac"><sup>$1</sup>&frasl;<sub>$2</sub></span>')
      .replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>')
      .replace(/\^(\d+|[a-zA-Z]+)/g, '<sup>$1</sup>')
      .replace(/\\times/g, '×')
      .replace(/\\div/g, '÷')
      .replace(/\\pm/g, '±')
      .replace(/\\%/g, '%');
    return `<span class="math-fallback">${s}</span>`;
  }

  // ==================== THEME & SOUND CONTROLS ====================
  function initTheme() {
    const saved = localStorage.getItem('mojishiki_theme') || 'light';
    setTheme(saved);
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mojishiki_theme', theme);
    const isDark = theme === 'dark';
    btnTheme.innerHTML = isDark
      ? '<span class="btn-icon">☀️</span><span>ライトモード</span>'
      : '<span class="btn-icon">🌙</span><span>ダークモード</span>';
  }

  btnTheme.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  function updateSoundButton() {
    btnSound.innerHTML = soundEnabled
      ? '<span class="btn-icon">🔊</span><span>音声ON</span>'
      : '<span class="btn-icon">🔇</span><span>音声OFF</span>';
  }

  btnSound.addEventListener('click', () => {
    getAudioContext(); // Activate on user click
    soundEnabled = !soundEnabled;
    localStorage.setItem('mojishiki_sound', soundEnabled ? 'true' : 'false');
    updateSoundButton();
  });

  // Fullscreen management
  function updateFullscreenButton() {
    const isFs = !!document.fullscreenElement;
    btnFullscreen.innerHTML = isFs
      ? '<span class="btn-icon">🗗</span><span>全画面解除</span>'
      : '<span class="btn-icon">⛶</span><span>全画面表示</span>';
  }

  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  });

  document.addEventListener('fullscreenchange', updateFullscreenButton);

  // ==================== PATTERN SELECTION VIEW ====================
  function renderPatternGrid() {
    patternGrid.innerHTML = '';
    quickPatternSelect.innerHTML = '<option value="custom">選択中のパターン</option><option value="all">全パターン（全450問）</option>';

    patternsData.forEach(pat => {
      const qCount = pat.subpatterns.reduce((acc, sp) => acc + sp.questions.length, 0);
      const isSelected = selectedPatternIds.has(pat.id);

      const opt = document.createElement('option');
      opt.value = String(pat.id);
      opt.textContent = `パターン${pat.id}：${pat.title} (${qCount}問)`;
      quickPatternSelect.appendChild(opt);

      const card = document.createElement('div');
      card.className = `pattern-card${isSelected ? ' selected' : ''}`;
      card.dataset.id = pat.id;

      const subNames = pat.subpatterns.map(sp => sp.title).join(' / ');

      card.innerHTML = `
        <div class="pattern-card-top">
          <div class="pattern-num">
            <span class="pattern-check">✓</span>
            <span>パターン ${pat.id}</span>
          </div>
          <div class="pattern-meta">
            <span class="pattern-count">${pat.subpatterns.length}種・${qCount}問</span>
            <button type="button" class="pattern-quick-btn" data-quick-id="${pat.id}" title="このパターンだけすぐに出題">すぐ出題 ▶</button>
          </div>
        </div>
        <div class="pattern-name">${pat.title}</div>
        <div class="pattern-sublist">${subNames}</div>
      `;

      card.addEventListener('click', (e) => {
        getAudioContext();
        const quickBtn = e.target.closest('[data-quick-id]');
        if (quickBtn) {
          e.stopPropagation();
          const pid = Number(quickBtn.dataset.quickId);
          selectedPatternIds.clear();
          selectedPatternIds.add(pid);
          updatePatternSelectionUI();
          startQuiz();
          return;
        }
        if (selectedPatternIds.has(pat.id)) {
          selectedPatternIds.delete(pat.id);
        } else {
          selectedPatternIds.add(pat.id);
        }
        updatePatternSelectionUI();
      });

      patternGrid.appendChild(card);
    });

    updatePatternSelectionUI();
  }

  function updatePatternSelectionUI() {
    const cards = patternGrid.querySelectorAll('.pattern-card');
    cards.forEach(c => {
      const id = Number(c.dataset.id);
      c.classList.toggle('selected', selectedPatternIds.has(id));
    });

    let totalQuestions = 0;
    patternsData.forEach(p => {
      if (selectedPatternIds.has(p.id)) {
        totalQuestions += p.subpatterns.reduce((acc, sp) => acc + sp.questions.length, 0);
      }
    });

    selectionSummary.textContent = `${selectedPatternIds.size} パターン選択中（対象 ${totalQuestions} 問）`;
    btnStartQuiz.disabled = selectedPatternIds.size === 0;
  }

  btnSelectAll.addEventListener('click', () => {
    patternsData.forEach(p => selectedPatternIds.add(p.id));
    updatePatternSelectionUI();
  });

  btnClearAll.addEventListener('click', () => {
    selectedPatternIds.clear();
    updatePatternSelectionUI();
  });

  // Segmented controls for Order, Count & Goal Streak
  document.querySelectorAll('[data-order]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-order]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      orderMode = btn.dataset.order;
    });
  });

  document.querySelectorAll('[data-limit]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-limit]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      questionLimit = Number(btn.dataset.limit);
    });
  });

  document.querySelectorAll('[data-goal]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-goal]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      goalStreak = Number(btn.dataset.goal);
    });
  });

  function updateSpeedUnitUI() {
    document.querySelectorAll('[data-speed]').forEach(b => {
      b.classList.toggle('active', b.dataset.speed === speedUnitMode);
    });
    if (btnQuizSpeed) {
      btnQuizSpeed.textContent = speedUnitMode === 'slash' ? '⚡ 速さ：m/分' : '⚡ 速さ：分速m';
    }
  }

  function refreshCurrentQuestionDisplay() {
    if (!currentQuestion) return;
    qPatternBadge.textContent = `パターン${currentQuestion.patternId}：${applySpeedUnit(currentQuestion.patternTitle)}`;
    qSubpatternBadge.innerHTML = `${currentQuestion.subpatternId} ${renderMathInString(currentQuestion.subpatternTitle)}（問${currentQuestion.num}）`;
    qText.innerHTML = renderMathInString(currentQuestion.text);
    qHintContent.innerHTML = renderMathInString(currentQuestion.patternHint);

    const exprEls = choicesGrid.querySelectorAll('.choice-expr');
    exprEls.forEach((el, idx) => {
      if (currentChoices[idx]) {
        el.innerHTML = renderMathInString(currentChoices[idx].expr);
      }
    });

    if (answered && currentSelectedIndex >= 0 && currentChoices[currentSelectedIndex] && !currentChoices[currentSelectedIndex].isCorrect) {
      wrongFeedbackText.innerHTML = `正解：<strong>${renderMathInString(currentQuestion.correct)}</strong>`;
      if (wrongReasonText) {
        const r = currentChoices[currentSelectedIndex].reason;
        wrongReasonText.innerHTML = r ? `⚠️ ${renderMathInString(r)}` : '';
      }
    }
  }

  function setSpeedUnitMode(mode) {
    speedUnitMode = mode === 'slash' ? 'slash' : 'prefix';
    localStorage.setItem('mojishiki_speed_unit', speedUnitMode);
    updateSpeedUnitUI();
    refreshCurrentQuestionDisplay();
  }

  document.querySelectorAll('[data-speed]').forEach(btn => {
    btn.addEventListener('click', () => {
      setSpeedUnitMode(btn.dataset.speed);
    });
  });

  if (btnQuizSpeed) {
    btnQuizSpeed.addEventListener('click', () => {
      setSpeedUnitMode(speedUnitMode === 'prefix' ? 'slash' : 'prefix');
    });
  }

  // Quick Pattern Dropdown in Quiz View
  quickPatternSelect.addEventListener('change', () => {
    const val = quickPatternSelect.value;
    if (val === 'all') {
      patternsData.forEach(p => selectedPatternIds.add(p.id));
    } else if (val !== 'custom') {
      selectedPatternIds.clear();
      selectedPatternIds.add(Number(val));
    }
    updatePatternSelectionUI();
    startQuiz();
  });

  // ==================== QUIZ EXECUTION ====================
  function collectPool() {
    const pool = [];
    patternsData.forEach(p => {
      if (!selectedPatternIds.has(p.id)) return;
      p.subpatterns.forEach(sp => {
        sp.questions.forEach(q => {
          pool.push({
            patternId: p.id,
            patternTitle: p.title,
            patternHint: p.hint,
            subpatternId: sp.id,
            subpatternTitle: sp.title,
            num: q.num,
            text: q.text,
            correct: q.correct,
            mistakes: q.mistakes,
            explanation: q.explanation
          });
        });
      });
    });
    return pool;
  }

  function shuffleArray(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function startQuiz(customPool) {
    getAudioContext();
    if (autoNextTimer) {
      clearTimeout(autoNextTimer);
      autoNextTimer = null;
    }
    modalPass.style.display = 'none';

    let pool = customPool || collectPool();
    if (pool.length === 0) return;

    if (!customPool && orderMode === 'random') {
      pool = shuffleArray(pool);
    }

    if (!customPool && questionLimit > 0 && pool.length > questionLimit) {
      pool = pool.slice(0, questionLimit);
    }

    quizQueue = pool;
    currentIndex = 0;
    hasPassedThisRound = false;
    stats = {
      correct: 0,
      wrong: 0,
      streak: 0,
      maxStreak: 0,
      wrongQuestions: []
    };

    if (selectedPatternIds.size === patternsData.length) {
      quickPatternSelect.value = 'all';
    } else if (selectedPatternIds.size === 1) {
      quickPatternSelect.value = String([...selectedPatternIds][0]);
    } else {
      quickPatternSelect.value = 'custom';
    }

    showView('quiz');
    loadQuestion();
  }

  function showView(name) {
    if (autoNextTimer) {
      clearTimeout(autoNextTimer);
      autoNextTimer = null;
    }
    modalPass.style.display = 'none';
    modalHistory.style.display = 'none';

    viewSetup.classList.toggle('active', name === 'setup');
    viewQuiz.classList.toggle('active', name === 'quiz');
    viewSummary.classList.toggle('active', name === 'summary');
    btnBackSetup.style.display = name === 'setup' ? 'none' : 'inline-flex';
  }

  function setActionSlotState(mode) {
    quizActionSlot.classList.remove('state-prompt', 'state-correct', 'state-wrong');
    quizActionSlot.classList.add(`state-${mode}`);
    slotPrompt.style.display = mode === 'prompt' ? 'flex' : 'none';
    slotCorrect.style.display = mode === 'correct' ? 'flex' : 'none';
    slotWrong.style.display = mode === 'wrong' ? 'flex' : 'none';
  }

  function loadQuestion() {
    if (autoNextTimer) {
      clearTimeout(autoNextTimer);
      autoNextTimer = null;
    }
    answered = false;
    currentSelectedIndex = -1;
    currentQuestion = quizQueue[currentIndex];

    // Status bar
    const total = quizQueue.length;
    progressLabel.textContent = `第 ${currentIndex + 1} 問 / 全 ${total} 問`;
    progressFill.style.width = `${((currentIndex + 1) / total) * 100}%`;
    updateScorePills();

    // Question Header & Badges
    if (qNumBadge) {
      qNumBadge.textContent = `Q${currentIndex + 1}`;
    }
    qPatternBadge.textContent = `パターン${currentQuestion.patternId}：${applySpeedUnit(currentQuestion.patternTitle)}`;
    qSubpatternBadge.innerHTML = `${currentQuestion.subpatternId} ${renderMathInString(currentQuestion.subpatternTitle)}（問${currentQuestion.num}）`;

    // Dynamic font sizing based on visible text length so long word problems never overflow
    const plainLen = currentQuestion.text
      .replace(/\\text\{\s*([^}]*)\}/g, '$1')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
      .replace(/[$\\{}]/g, '').length;
    qText.classList.remove('q-text-lg', 'q-text-md', 'q-text-sm');
    if (plainLen <= 28) {
      qText.classList.add('q-text-lg');
    } else if (plainLen <= 52) {
      qText.classList.add('q-text-md');
    } else {
      qText.classList.add('q-text-sm');
    }

    qText.innerHTML = renderMathInString(currentQuestion.text);

    // Hint
    qHintBar.classList.remove('revealed');
    qHintContent.innerHTML = renderMathInString(currentQuestion.patternHint);
    btnToggleHint.textContent = '💡 考え方のヒント (H)';

    // Build 4 shuffled choices
    const rawChoices = [
      { expr: currentQuestion.correct, isCorrect: true, reason: '正解の式です！' },
      ...currentQuestion.mistakes.map(m => ({
        expr: m.expr,
        isCorrect: false,
        reason: m.reason
      }))
    ];
    currentChoices = shuffleArray(rawChoices);

    choicesGrid.innerHTML = '';
    currentChoices.forEach((ch, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';
      btn.innerHTML = `
        <span class="choice-key">${idx + 1}</span>
        <span class="choice-expr">${renderMathInString(ch.expr)}</span>
        <span class="choice-tag"></span>
      `;
      btn.addEventListener('click', () => handleSelectChoice(idx));
      choicesGrid.appendChild(btn);
    });

    // Reset fixed Action Slot to prompt state
    setActionSlotState('prompt');
  }

  function updateScorePills() {
    pillCorrect.textContent = `⭕ 正解 ${stats.correct}`;
    pillWrong.textContent = `❌ ミス ${stats.wrong}`;

    if (goalStreak > 0) {
      pillStreak.textContent = `🔥 ${stats.streak} / 目標 ${goalStreak} 連続`;
      if (stats.streak >= goalStreak) {
        pillStreak.style.background = 'var(--correct-bg)';
        pillStreak.style.color = 'var(--correct)';
      } else {
        pillStreak.style.background = 'var(--warning-bg)';
        pillStreak.style.color = 'var(--warning)';
      }
    } else {
      pillStreak.textContent = `🔥 ${stats.streak} 連続`;
      pillStreak.style.background = 'var(--warning-bg)';
      pillStreak.style.color = 'var(--warning)';
    }
  }

  function handleSelectChoice(selectedIndex) {
    if (answered) return;
    answered = true;
    currentSelectedIndex = selectedIndex;
    getAudioContext();

    const chosen = currentChoices[selectedIndex];
    const isRight = chosen.isCorrect;

    // Record in persistent history
    recordHistoryItem(currentQuestion, chosen.expr, isRight);

    if (isRight) {
      stats.correct++;
      stats.streak++;
      if (stats.streak > stats.maxStreak) stats.maxStreak = stats.streak;
      updateMaxStreakRecord(stats.streak);
      playCorrectSound();
    } else {
      stats.wrong++;
      stats.streak = 0;
      stats.wrongQuestions.push(currentQuestion);
      playWrongSound();
    }
    updateScorePills();

    // Style Choice Buttons
    const buttons = choicesGrid.querySelectorAll('.choice-btn');
    buttons.forEach((btn, idx) => {
      btn.disabled = true;
      const tag = btn.querySelector('.choice-tag');
      if (currentChoices[idx].isCorrect) {
        btn.classList.add('is-correct');
        tag.textContent = '⭕ 正解';
      } else if (idx === selectedIndex) {
        btn.classList.add('is-wrong-selected');
        tag.textContent = '❌ あなたの選択';
      }
    });

    if (isRight) {
      setActionSlotState('correct');

      // Check for PASS condition (Goal Streak Achieved!)
      if (goalStreak > 0 && stats.streak >= goalStreak && !hasPassedThisRound) {
        hasPassedThisRound = true;
        recordPassAchievement();
        playPassFanfare();

        // Show Pass Congratulations Modal!
        passMsg.innerHTML = `目標の <strong>${goalStreak} 連続正解</strong> を見事に達成しました！<br><span style="font-size:0.88rem; color:var(--text-secondary); margin-top:4px; display:inline-block;">文字式のルールがしっかり身についています！</span>`;
        modalPass.style.display = 'flex';
        return;
      }

      // Normal Correct: Auto advance after ~500ms
      autoNextTimer = setTimeout(() => {
        nextQuestion();
      }, 500);
    } else {
      // Incorrect: Show concise wrong bar in the fixed action slot
      setActionSlotState('wrong');
      wrongFeedbackText.innerHTML = `正解：<strong>${renderMathInString(currentQuestion.correct)}</strong>`;
      if (wrongReasonText) {
        wrongReasonText.innerHTML = chosen.reason ? `⚠️ ${renderMathInString(chosen.reason)}` : '';
      }
      btnNextQuestion.textContent = (currentIndex + 1 < quizQueue.length)
        ? '次の問題へ進む (Enter / Space) ▶'
        : '結果発表を見る (Enter / Space) 🏁';
    }
  }

  function nextQuestion() {
    if (autoNextTimer) {
      clearTimeout(autoNextTimer);
      autoNextTimer = null;
    }
    if (!answered) return;
    if (currentIndex + 1 < quizQueue.length) {
      currentIndex++;
      loadQuestion();
    } else {
      showSummary();
    }
  }

  function showSummary() {
    showView('summary');
    const total = quizQueue.length;
    const acc = total > 0 ? Math.round((stats.correct / total) * 100) : 0;

    sumTotal.textContent = `${total} 問`;
    sumCorrect.textContent = `${stats.correct} 問`;
    sumAccuracy.textContent = `${acc}%`;
    sumStreak.textContent = `${stats.maxStreak} 連続`;

    btnReviewWrong.style.display = stats.wrongQuestions.length > 0 ? 'inline-flex' : 'none';
    btnReviewWrong.textContent = `❌ 間違えた問題だけ復習する（${stats.wrongQuestions.length}問）`;
  }

  // ==================== HISTORY MODAL UI ====================
  function openHistoryModal() {
    getAudioContext();
    const hist = getStoredHistory();

    // Summary stats
    histTotal.textContent = `${hist.totalAnswers}問`;
    const acc = hist.totalAnswers > 0 ? Math.round((hist.totalCorrect / hist.totalAnswers) * 100) : 0;
    histAccuracy.textContent = `${acc}%`;
    histCurrentStreak.textContent = `${stats.streak}連勝`;
    histMaxStreak.textContent = `${Math.max(hist.maxStreakEver, stats.maxStreak)}連勝`;
    histPassCount.textContent = `${hist.passCount}回`;

    // Populate list
    historyTbody.innerHTML = '';
    if (!hist.logs || hist.logs.length === 0) {
      historyEmpty.style.display = 'block';
      document.getElementById('history-table').style.display = 'none';
    } else {
      historyEmpty.style.display = 'none';
      document.getElementById('history-table').style.display = 'table';

      hist.logs.forEach(item => {
        const tr = document.createElement('tr');
        const badgeClass = item.isCorrect ? 'h-badge-correct' : 'h-badge-wrong';
        const badgeText = item.isCorrect ? '⭕ 正解' : '❌ ミス';
        const chosenDisp = item.isCorrect ? '<span style="color:var(--text-muted);">-</span>' : renderMathInString(item.chosenExpr);

        tr.innerHTML = `
          <td><span class="${badgeClass}">${badgeText}</span></td>
          <td><span class="h-pat-tag">P${item.patternId} ${item.subpatternId}</span></td>
          <td>${renderMathInString(item.text)}</td>
          <td><strong>${renderMathInString(item.correctExpr)}</strong></td>
          <td>${chosenDisp}</td>
          <td style="color:var(--text-muted); font-size:0.75rem;">${item.time}</td>
        `;
        historyTbody.appendChild(tr);
      });
    }

    modalHistory.style.display = 'flex';
  }

  function closeHistoryModal() {
    modalHistory.style.display = 'none';
  }

  // Pass Modal Actions
  btnPassContinue.addEventListener('click', () => {
    modalPass.style.display = 'none';
    nextQuestion();
  });
  btnPassHistory.addEventListener('click', () => {
    modalPass.style.display = 'none';
    openHistoryModal();
  });
  btnPassSetup.addEventListener('click', () => {
    modalPass.style.display = 'none';
    showView('setup');
  });

  // History Modal Actions
  btnHistory.addEventListener('click', openHistoryModal);
  btnSummaryHistory.addEventListener('click', openHistoryModal);
  btnCloseHistory.addEventListener('click', closeHistoryModal);
  btnCloseHistoryBottom.addEventListener('click', closeHistoryModal);
  btnClearHistory.addEventListener('click', () => {
    if (confirm('これまでの解答履歴・学習記録をすべて消去しますか？')) {
      localStorage.removeItem(STORAGE_KEY);
      openHistoryModal();
    }
  });

  // Background overlay click to close modals
  modalHistory.addEventListener('click', (e) => {
    if (e.target === modalHistory) closeHistoryModal();
  });
  modalPass.addEventListener('click', (e) => {
    if (e.target === modalPass) {
      modalPass.style.display = 'none';
      nextQuestion();
    }
  });

  // Event Listeners for Quiz & Navigation
  btnStartQuiz.addEventListener('click', () => startQuiz());
  btnBackSetup.addEventListener('click', () => showView('setup'));
  btnNextQuestion.addEventListener('click', nextQuestion);

  btnToggleHint.addEventListener('click', () => {
    const revealed = qHintBar.classList.toggle('revealed');
    btnToggleHint.textContent = revealed ? '💡 ヒントを隠す (H)' : '💡 考え方のヒント (H)';
  });

  btnRetrySame.addEventListener('click', () => startQuiz());
  btnReviewWrong.addEventListener('click', () => {
    if (stats.wrongQuestions.length > 0) {
      startQuiz(stats.wrongQuestions.slice());
    }
  });
  btnToSetup.addEventListener('click', () => showView('setup'));

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    // If History Modal is open, Esc closes it
    if (modalHistory.style.display === 'flex') {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeHistoryModal();
      }
      return;
    }

    // If Pass Modal is open, Enter or Space continues
    if (modalPass.style.display === 'flex') {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        modalPass.style.display = 'none';
        nextQuestion();
      }
      return;
    }

    if (!viewQuiz.classList.contains('active')) return;

    if (e.key >= '1' && e.key <= '4') {
      const idx = Number(e.key) - 1;
      if (!answered && currentChoices[idx]) {
        e.preventDefault();
        handleSelectChoice(idx);
      }
    } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
      if (answered) {
        e.preventDefault();
        nextQuestion();
      }
    } else if (e.key.toLowerCase() === 'h') {
      e.preventDefault();
      btnToggleHint.click();
    }
  });

  // Initialize
  initTheme();
  updateSoundButton();
  updateSpeedUnitUI();
  renderPatternGrid();
})();
