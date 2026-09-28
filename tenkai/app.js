/**
 * 式の展開・変形クイズ アプリケーション
 * - 原本＋類題の全問統合
 * - 連続10問正解で合格画面（名前登録機能付き）
 * - 合格者一覧（殿堂入り）確認機能
 * - 開発中テスト用: 9問連続正解からスタートボタン
 * - いつでも閲覧できる解答履歴機能
 */

// =========================================
// 問題データ定義（原本6問＋類題12問＝全18問統合）
// =========================================
const ALL_QUESTIONS = [
  // 原本 (1)〜(6)
  {
    id: 1,
    leftTex: "(a + b + 6)(a - b + 6)",
    correctTex: "(a + 6 + b)(a + 6 - b)",
    dummiesTex: [
      "(a + 6 + b)(a - 6 - b)",
      "(a - 6 + b)(a - 6 - b)",
      "(a + b + 6)(a + b - 6)"
    ],
    hint: "同符号の「a」と「+6」を前にまとめて (a+6) とし、異符号の「+b」と「-b」を後ろに置きます。"
  },
  {
    id: 2,
    leftTex: "(x + y - 1)(x - y + 1)",
    correctTex: "(x + y - 1)(x - (y - 1))",
    dummiesTex: [
      "(x + y - 1)(x + (y - 1))",
      "(x - (y + 1))(x + (y + 1))",
      "(x + y + 1)(x - y - 1)"
    ],
    hint: "「x」は同符号。後ろの項は -y+1 = -(y-1) とマイナスをくくることで共通の (y-1) を作ります。"
  },
  {
    id: 3,
    leftTex: "(a - 4b + 5)(a + 4b + 5)",
    correctTex: "(a + 5 - 4b)(a + 5 + 4b)",
    dummiesTex: [
      "(a + 5 - 4b)(a - 5 + 4b)",
      "(a - 5 - 4b)(a - 5 + 4b)",
      "(a + 4b - 5)(a - 4b + 5)"
    ],
    hint: "同符号の「a」と「+5」を前にまとめて (a+5) とし、異符号の「-4b」と「+4b」を後ろに並び替えます。"
  },
  {
    id: 4,
    leftTex: "(3x - 7y + 4z)(3x + 7y - 4z)",
    correctTex: "(3x - (7y - 4z))(3x + (7y - 4z))",
    dummiesTex: [
      "(3x + (7y - 4z))(3x - (7y + 4z))",
      "(3x - (7y + 4z))(3x + (7y + 4z))",
      "(3x - 7y - 4z)(3x + 7y + 4z)"
    ],
    hint: "「3x」は同符号。-7y+4z = -(7y-4z) とマイナスでくくり、共通部分 (7y-4z) を作ります。"
  },
  {
    id: 5,
    leftTex: "(2x + y - 3)(2x - y - 3)",
    correctTex: "(2x - 3 + y)(2x - 3 - y)",
    dummiesTex: [
      "(2x - 3 + y)(2x + 3 - y)",
      "(2x + 3 - y)(2x - 3 - y)",
      "(2x + y + 3)(2x - y - 3)"
    ],
    hint: "同符号の「2x」と「-3」を前にまとめて (2x-3) とし、異符号の「+y」と「-y」を後ろに並べます。"
  },
  {
    id: 6,
    leftTex: "(4 + 3b + c)(4 - 3b - c)",
    correctTex: "(4 + 3b + c)(4 - (3b + c))",
    dummiesTex: [
      "(4 + 3b + c)(4 + (3b + c))",
      "(4 - (3b - c))(4 + (3b - c))",
      "(4 - 3b + c)(4 + 3b - c)"
    ],
    hint: "「4」は同符号。後ろの項 -3b-c = -(3b+c) とマイナスをくくることで共通部分 (3b+c) を作ります。"
  },
  // 類題 (7)〜(18)
  {
    id: 7,
    leftTex: "(x + y + 5)(x - y + 5)",
    correctTex: "(x + 5 + y)(x + 5 - y)",
    dummiesTex: [
      "(x + 5 + y)(x - 5 - y)",
      "(x - 5 + y)(x - 5 - y)",
      "(x + y + 5)(x + y - 5)"
    ],
    hint: "同符号の「x」と「+5」を前にまとめて (x+5) とし、異符号の「±y」を後ろに置きます。"
  },
  {
    id: 8,
    leftTex: "(a - b - 3)(a + b - 3)",
    correctTex: "(a - 3 - b)(a - 3 + b)",
    dummiesTex: [
      "(a - 3 - b)(a + 3 + b)",
      "(a + 3 - b)(a + 3 + b)",
      "(a - b + 3)(a + b - 3)"
    ],
    hint: "同符号の「a」と「-3」を前にまとめて (a-3) とし、異符号の「∓b」を後ろに置きます。"
  },
  {
    id: 9,
    leftTex: "(x + 3y - 2)(x - 3y - 2)",
    correctTex: "(x - 2 + 3y)(x - 2 - 3y)",
    dummiesTex: [
      "(x - 2 + 3y)(x + 2 - 3y)",
      "(x + 2 + 3y)(x + 2 - 3y)",
      "(x + 3y + 2)(x - 3y - 2)"
    ],
    hint: "同符号の「x」と「-2」を前にまとめ、異符号の「±3y」を後ろに並べます。"
  },
  {
    id: 10,
    leftTex: "(2a - 5b + 3)(2a + 5b - 3)",
    correctTex: "(2a - (5b - 3))(2a + (5b - 3))",
    dummiesTex: [
      "(2a + (5b - 3))(2a - (5b + 3))",
      "(2a - (5b + 3))(2a + (5b + 3))",
      "(2a - 5b - 3)(2a + 5b + 3)"
    ],
    hint: "「2a」が同符号。-5b+3 = -(5b-3) とマイナスでくくり出します。"
  },
  {
    id: 11,
    leftTex: "(6 - 3x - y)(6 + 3x + y)",
    correctTex: "(6 - (3x + y))(6 + (3x + y))",
    dummiesTex: [
      "(6 - (3x - y))(6 + (3x - y))",
      "(6 + (3x + y))(6 + (3x - y))",
      "(6 - 3x + y)(6 + 3x - y)"
    ],
    hint: "「6」が同符号。-3x-y = -(3x+y) とマイナスでくくり、共通部分 (3x+y) を作ります。"
  },
  {
    id: 12,
    leftTex: "(p + 2q - 5r)(p - 2q + 5r)",
    correctTex: "(p + (2q - 5r))(p - (2q - 5r))",
    dummiesTex: [
      "(p - (2q - 5r))(p - (2q + 5r))",
      "(p + (2q + 5r))(p - (2q + 5r))",
      "(p + 2q + 5r)(p - 2q - 5r)"
    ],
    hint: "「p」が同符号。-2q+5r = -(2q-5r) とくくり出して符号を揃えます。"
  },
  {
    id: 13,
    leftTex: "(4x - y + 1)(4x + y + 1)",
    correctTex: "(4x + 1 - y)(4x + 1 + y)",
    dummiesTex: [
      "(4x + 1 - y)(4x - 1 + y)",
      "(4x - 1 - y)(4x - 1 + y)",
      "(4x - y - 1)(4x + y + 1)"
    ],
    hint: "「4x」と「+1」が同符号なので前にまとめ、異符号の「∓y」を後ろに置きます。"
  },
  {
    id: 14,
    leftTex: "(x - 2y + 3z)(x + 2y - 3z)",
    correctTex: "(x - (2y - 3z))(x + (2y - 3z))",
    dummiesTex: [
      "(x + (2y - 3z))(x - (2y + 3z))",
      "(x - (2y + 3z))(x + (2y + 3z))",
      "(x - 2y - 3z)(x + 2y + 3z)"
    ],
    hint: "「x」が同符号。-2y+3z = -(2y-3z) とくくり出します。"
  },
  {
    id: 15,
    leftTex: "(m - 3n + 8)(m + 3n + 8)",
    correctTex: "(m + 8 - 3n)(m + 8 + 3n)",
    dummiesTex: [
      "(m + 8 - 3n)(m - 8 + 3n)",
      "(m - 8 - 3n)(m - 8 + 3n)",
      "(m + 3n - 8)(m - 3n + 8)"
    ],
    hint: "「m」と「+8」が同符号なので前にまとめます。"
  },
  {
    id: 16,
    leftTex: "(a - 2b - 5c)(a + 2b + 5c)",
    correctTex: "(a - (2b + 5c))(a + (2b + 5c))",
    dummiesTex: [
      "(a - (2b - 5c))(a + (2b - 5c))",
      "(a + (2b + 5c))(a + (2b - 5c))",
      "(a - 2b + 5c)(a + 2b - 5c)"
    ],
    hint: "「a」が同符号。-2b-5c = -(2b+5c) とくくり出して共通項 (2b+5c) を作ります。"
  },
  {
    id: 17,
    leftTex: "(3x + 2y - 4)(3x - 2y - 4)",
    correctTex: "(3x - 4 + 2y)(3x - 4 - 2y)",
    dummiesTex: [
      "(3x - 4 + 2y)(3x + 4 - 2y)",
      "(3x + 4 - 2y)(3x - 4 - 2y)",
      "(3x + 2y + 4)(3x - 2y - 4)"
    ],
    hint: "「3x」と「-4」が同符号なので前にまとめます。"
  },
  {
    id: 18,
    leftTex: "(5 - a + 2b)(5 + a - 2b)",
    correctTex: "(5 - (a - 2b))(5 + (a - 2b))",
    dummiesTex: [
      "(5 + (a - 2b))(5 - (a + 2b))",
      "(5 - (a + 2b))(5 + (a + 2b))",
      "(5 - a - 2b)(5 + a + 2b)"
    ],
    hint: "「5」が同符号。-a+2b = -(a-2b) とマイナスをくくり出します。"
  }
];

// =========================================
// アプリケーション状態管理
// =========================================
class QuizApp {
  constructor() {
    this.passTarget = 10;       // 合格条件: 連続10問正解
    this.currentStreak = 0;     // 現在の連続正解数
    this.maxStreak = 0;         // セッション内最大連続正解数
    this.totalAnswered = 0;     // 累計回答数
    this.totalCorrect = 0;      // 累計正解数
    this.passCount = 0;         // 合格達成回数
    this.startTime = Date.now();

    this.shuffledPool = [];     // 出題プール
    this.poolIndex = 0;
    this.currentQuestion = null;
    this.currentOptions = [];

    this.isAnsweringLocked = false;
    this.autoAdvanceTimer = null;
    this.soundEnabled = true;
    this.audioCtx = null;

    // 履歴・合格者データ（localStorageから復元）
    this.history = [];
    this.hallOfFame = [];
    this.lastSavedName = '';
    this.loadPersistedData();

    // DOM要素の参照をキャッシュ
    this.dom = {
      body: document.body,
      // ヘッダー操作
      btnHallOfFame: document.getElementById('btn-hall-of-fame'),
      btnHistory: document.getElementById('btn-history'),
      btnTheme: document.getElementById('btn-theme'),
      themeIcon: document.getElementById('theme-icon'),
      btnFullscreen: document.getElementById('btn-fullscreen'),
      fullscreenIcon: document.getElementById('fullscreen-icon'),
      fullscreenText: document.getElementById('fullscreen-text'),
      btnSound: document.getElementById('btn-sound'),
      soundIcon: document.getElementById('sound-icon'),
      btnRestart: document.getElementById('btn-restart'),
      // ステータス
      currentStreakDisplay: document.getElementById('current-streak'),
      totalCounterDisplay: document.getElementById('question-total-counter'),
      progressBar: document.getElementById('progress-bar'),
      accuracyDisplay: document.getElementById('accuracy-display'),
      passCountDisplay: document.getElementById('pass-count-display'),
      // スクリーン
      quizScreen: document.getElementById('quiz-screen'),
      resultScreen: document.getElementById('result-screen'),
      // 問題領域
      equationLeft: document.getElementById('equation-left'),
      equationTarget: document.getElementById('equation-target'),
      optionsGrid: document.getElementById('options-grid'),
      feedbackBanner: document.getElementById('feedback-banner'),
      feedbackIcon: document.getElementById('feedback-icon'),
      feedbackTitle: document.getElementById('feedback-title'),
      feedbackDesc: document.getElementById('feedback-desc'),
      btnNextManual: document.getElementById('btn-next-manual'),
      // 合格リザルト画面
      resultStreak: document.getElementById('result-streak'),
      resultAccuracy: document.getElementById('result-accuracy'),
      resultTotalAnswered: document.getElementById('result-total-answered'),
      resultTime: document.getElementById('result-time'),
      passUserName: document.getElementById('pass-user-name'),
      btnSavePassName: document.getElementById('btn-save-pass-name'),
      passNameForm: document.getElementById('pass-name-form'),
      passRegisteredMsg: document.getElementById('pass-registered-msg'),
      registeredNameDisplay: document.getElementById('registered-name-display'),
      btnRetrySame: document.getElementById('btn-retry-same'),
      btnContinue: document.getElementById('btn-continue'),
      btnViewHofFromResult: document.getElementById('btn-view-hof-from-result'),
      btnViewHistoryFromResult: document.getElementById('btn-view-history-from-result'),
      // 合格者一覧モーダル
      hallOfFameModal: document.getElementById('hall-of-fame-modal'),
      btnCloseHofModal: document.getElementById('btn-close-hof-modal'),
      btnCloseHofModalBottom: document.getElementById('btn-close-hof-modal-bottom'),
      btnClearHof: document.getElementById('btn-clear-hof'),
      hofListContainer: document.getElementById('hof-list-container'),
      modalHofCount: document.getElementById('modal-hof-count'),
      // 履歴モーダル
      historyModal: document.getElementById('history-modal'),
      btnCloseModal: document.getElementById('btn-close-modal'),
      btnCloseModalBottom: document.getElementById('btn-close-modal-bottom'),
      btnClearHistory: document.getElementById('btn-clear-history'),
      historyListContainer: document.getElementById('history-list-container'),
      modalHistoryCount: document.getElementById('modal-history-count'),
      historyTotalCount: document.getElementById('history-total-count'),
      historyCorrectCount: document.getElementById('history-correct-count'),
      historyCurrentStreak: document.getElementById('history-current-streak'),
      historyMaxStreak: document.getElementById('history-max-streak'),
      historyPassCount: document.getElementById('history-pass-count')
    };

    this.init();
  }

  init() {
    this.initTheme();
    this.initEventListeners();
    this.updateStatsDisplay();
    this.resetQuiz();
  }

  // 永続化データの読み込み
  loadPersistedData() {
    try {
      const savedPass = localStorage.getItem('quiz-pass-count');
      if (savedPass) this.passCount = parseInt(savedPass, 10) || 0;

      const savedMaxStreak = localStorage.getItem('quiz-max-streak');
      if (savedMaxStreak) this.maxStreak = parseInt(savedMaxStreak, 10) || 0;

      const savedHistory = localStorage.getItem('quiz-history-records');
      if (savedHistory) this.history = JSON.parse(savedHistory) || [];

      const savedHof = localStorage.getItem('quiz-hall-of-fame');
      if (savedHof) this.hallOfFame = JSON.parse(savedHof) || [];

      const lastName = localStorage.getItem('quiz-last-user-name');
      if (lastName) this.lastSavedName = lastName;
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }
  }

  savePersistedData() {
    try {
      localStorage.setItem('quiz-pass-count', this.passCount);
      localStorage.setItem('quiz-max-streak', this.maxStreak);
      localStorage.setItem('quiz-history-records', JSON.stringify(this.history.slice(0, 100)));
      localStorage.setItem('quiz-hall-of-fame', JSON.stringify(this.hallOfFame.slice(0, 50)));
      if (this.lastSavedName) {
        localStorage.setItem('quiz-last-user-name', this.lastSavedName);
      }
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  // テーマ初期化
  initTheme() {
    const savedTheme = localStorage.getItem('theme-mode');
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  setTheme(theme) {
    if (theme === 'dark') {
      this.dom.body.classList.remove('theme-light');
      this.dom.body.classList.add('theme-dark');
      this.dom.themeIcon.textContent = '☀️';
      this.dom.btnTheme.querySelector('.btn-text').textContent = 'ライト';
    } else {
      this.dom.body.classList.remove('theme-dark');
      this.dom.body.classList.add('theme-light');
      this.dom.themeIcon.textContent = '🌙';
      this.dom.btnTheme.querySelector('.btn-text').textContent = 'ダーク';
    }
    localStorage.setItem('theme-mode', theme);
  }

  toggleTheme() {
    const isDark = this.dom.body.classList.contains('theme-dark');
    this.setTheme(isDark ? 'light' : 'dark');
  }

  // 全画面表示切替
  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        this.updateFullscreenUI(true);
      }).catch(err => {
        console.warn('全画面切り替えエラー:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => {
          this.updateFullscreenUI(false);
        });
      }
    }
  }

  updateFullscreenUI(isFullscreen) {
    if (isFullscreen) {
      this.dom.fullscreenIcon.textContent = '🗗';
      this.dom.fullscreenText.textContent = '解除';
    } else {
      this.dom.fullscreenIcon.textContent = '⛶';
      this.dom.fullscreenText.textContent = '全画面';
    }
  }

  // 効果音再生 (Web Audio API)
  playSound(type) {
    if (!this.soundEnabled) return;

    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const ctx = this.audioCtx;
      const now = ctx.currentTime;

      if (type === 'correct') {
        // ピンポン♪（2音チャイム）
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';

        osc1.frequency.setValueAtTime(659.25, now); // E5
        osc2.frequency.setValueAtTime(880.00, now + 0.12); // A5

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc1.stop(now + 0.14);
        osc2.start(now + 0.12);
        osc2.stop(now + 0.55);

      } else if (type === 'wrong') {
        // ブブー（低音のノイズ波）
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.setValueAtTime(115, now + 0.15);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.4);

      } else if (type === 'fanfare') {
        // 合格ファンファーレ♪ (C5 -> E5 -> G5 -> C6)
        const notes = [523.25, 659.25, 783.99, 1046.50];
        const times = [0, 0.12, 0.24, 0.38];
        const durations = [0.1, 0.1, 0.12, 0.7];

        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + times[i]);

          gain.gain.setValueAtTime(0.25, now + times[i]);
          gain.gain.exponentialRampToValueAtTime(0.001, now + times[i] + durations[i]);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + times[i]);
          osc.stop(now + times[i] + durations[i]);
        });
      }
    } catch (e) {
      console.warn('オーディオ再生エラー:', e);
    }
  }

  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    this.dom.soundIcon.textContent = this.soundEnabled ? '🔊' : '🔇';
  }

  // イベントリスナー
  initEventListeners() {
    // 合格者一覧モーダル
    this.dom.btnHallOfFame.addEventListener('click', () => this.openHallOfFameModal());
    this.dom.btnCloseHofModal.addEventListener('click', () => this.closeHallOfFameModal());
    this.dom.btnCloseHofModalBottom.addEventListener('click', () => this.closeHallOfFameModal());
    this.dom.btnClearHof.addEventListener('click', () => this.clearHallOfFame());
    this.dom.btnViewHofFromResult.addEventListener('click', () => this.openHallOfFameModal());

    // 履歴モーダル
    this.dom.btnHistory.addEventListener('click', () => this.openHistoryModal());
    this.dom.btnCloseModal.addEventListener('click', () => this.closeHistoryModal());
    this.dom.btnCloseModalBottom.addEventListener('click', () => this.closeHistoryModal());
    this.dom.btnClearHistory.addEventListener('click', () => this.clearHistory());
    this.dom.btnViewHistoryFromResult.addEventListener('click', () => this.openHistoryModal());

    // モーダル背景クリックで閉じる
    this.dom.hallOfFameModal.addEventListener('click', (e) => {
      if (e.target === this.dom.hallOfFameModal) this.closeHallOfFameModal();
    });
    this.dom.historyModal.addEventListener('click', (e) => {
      if (e.target === this.dom.historyModal) this.closeHistoryModal();
    });

    // 合格者お名前登録
    this.dom.btnSavePassName.addEventListener('click', () => this.savePassName());
    this.dom.passUserName.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.savePassName();
      }
    });

    // テーマ・全画面・サウンド・リセット
    this.dom.btnTheme.addEventListener('click', () => this.toggleTheme());
    this.dom.btnFullscreen.addEventListener('click', () => this.toggleFullscreen());
    document.addEventListener('fullscreenchange', () => {
      this.updateFullscreenUI(!!document.fullscreenElement);
    });
    this.dom.btnSound.addEventListener('click', () => this.toggleSound());
    this.dom.btnRestart.addEventListener('click', () => this.resetQuiz());

    // 不正解手動進行
    this.dom.btnNextManual.addEventListener('click', () => {
      this.nextQuestion();
    });

    // 合格画面のアクション
    this.dom.btnRetrySame.addEventListener('click', () => {
      this.resetQuiz();
    });
    this.dom.btnContinue.addEventListener('click', () => {
      // 11問目以降へ継続挑戦
      this.dom.resultScreen.classList.remove('active');
      this.dom.resultScreen.classList.add('hidden');
      this.dom.quizScreen.classList.add('active');
      this.nextQuestion();
    });

    // キーボードショートカット
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const key = e.key.toUpperCase();

      // Mキー: 学習モード切り替え (展開4択 ⇄ 因数分解8枚◯✕)
      if (key === 'M' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        if (window.modeController) {
          window.modeController.toggleMode();
        }
        return;
      }

      // 共通キー (全画面・テーマ・音)
      if (key === 'F') {
        this.toggleFullscreen();
        return;
      } else if (key === 'T') {
        this.toggleTheme();
        return;
      } else if (key === 'S') {
        this.toggleSound();
        return;
      }

      // モード2 (因数分解) がアクティブな場合は因数分解アプリに委譲
      if (window.activeAppMode === 'factor') {
        if (window.factoringApp) {
          window.factoringApp.handleKeydown(e);
        }
        return;
      }

      // 以下、モード1 (展開クイズ) がアクティブな場合のキー処理
      // 合格者モーダルが開いている場合
      if (!this.dom.hallOfFameModal.classList.contains('hidden')) {
        if (e.key === 'Escape' || key === 'W') {
          e.preventDefault();
          this.closeHallOfFameModal();
        }
        return;
      }

      // 履歴モーダルが開いている場合
      if (!this.dom.historyModal.classList.contains('hidden')) {
        if (e.key === 'Escape' || key === 'H') {
          e.preventDefault();
          this.closeHistoryModal();
        }
        return;
      }

      if (key === 'W') {
        e.preventDefault();
        this.openHallOfFameModal();
      } else if (key === 'H') {
        e.preventDefault();
        this.openHistoryModal();
      } else if (['1', '2', '3', '4'].includes(key)) {
        const optionIndex = parseInt(key, 10) - 1;
        this.selectOption(optionIndex);
      } else if (['A', 'B', 'C', 'D'].includes(key)) {
        const map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
        this.selectOption(map[key]);
      } else if (e.code === 'Space' || e.key === 'Enter') {
        if (!this.dom.btnNextManual.classList.contains('hidden')) {
          e.preventDefault();
          this.nextQuestion();
        }
      }
    });
  }

  // クイズのリセット＆開始
  resetQuiz() {
    clearTimeout(this.autoAdvanceTimer);
    this.isAnsweringLocked = false;
    this.currentStreak = 0;
    this.startTime = Date.now();

    // 出題プールをシャッフル作成
    this.shuffledPool = this.shuffleArray([...ALL_QUESTIONS]);
    this.poolIndex = 0;

    // 画面切り替え
    this.dom.quizScreen.classList.add('active');
    this.dom.resultScreen.classList.remove('active');
    this.dom.resultScreen.classList.add('hidden');

    this.updateStatsDisplay();
    this.renderCurrentQuestion();
  }

  // 配列シャッフル
  shuffleArray(arr) {
    const array = [...arr];
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // 次の問題を取り出す（プールが尽きたら再シャッフル）
  getNextQuestionFromPool() {
    if (this.poolIndex >= this.shuffledPool.length) {
      const lastQ = this.currentQuestion;
      let newPool = this.shuffleArray([...ALL_QUESTIONS]);
      if (lastQ && newPool[0].id === lastQ.id && newPool.length > 1) {
        [newPool[0], newPool[1]] = [newPool[1], newPool[0]];
      }
      this.shuffledPool = newPool;
      this.poolIndex = 0;
    }
    const q = this.shuffledPool[this.poolIndex];
    this.poolIndex++;
    return q;
  }

  // 現在の問題の描画
  renderCurrentQuestion() {
    this.isAnsweringLocked = false;
    clearTimeout(this.autoAdvanceTimer);

    this.currentQuestion = this.getNextQuestionFromPool();
    const q = this.currentQuestion;

    // 進捗表示
    this.updateStatsDisplay();

    // フィードバックリセット
    this.dom.feedbackBanner.className = 'feedback-banner hidden';
    this.dom.btnNextManual.classList.add('hidden');
    this.dom.equationTarget.innerHTML = '<span class="question-mark">？</span>';
    this.dom.equationTarget.style.borderColor = '';

    // 左辺の数式をKaTeXでレンダリング
    this.renderMath(this.dom.equationLeft, q.leftTex);

    // 4択選択肢の作成（正解1個＋ダミー3個をシャッフル）
    const rawOptions = [
      { tex: q.correctTex, isCorrect: true },
      ...q.dummiesTex.map(tex => ({ tex, isCorrect: false }))
    ];
    this.currentOptions = this.shuffleArray(rawOptions);

    // 選択肢グリッドの再構築（左辺と右辺が同じ大きさ）
    this.dom.optionsGrid.innerHTML = '';
    this.currentOptions.forEach((opt, idx) => {
      const card = document.createElement('button');
      card.className = 'option-card';
      card.setAttribute('data-index', idx);
      card.setAttribute('type', 'button');

      const badge = document.createElement('span');
      badge.className = 'option-key-badge';
      badge.textContent = idx + 1; // 1, 2, 3, 4

      // 選択肢内に「　左辺 \n ＝右辺」の2行等式を構築
      const eqContainer = document.createElement('div');
      eqContainer.className = 'option-eq-container';

      // 1行目: 左辺
      const lineLeft = document.createElement('div');
      lineLeft.className = 'option-line-left';
      const leftFormula = document.createElement('span');
      lineLeft.appendChild(leftFormula);

      // 2行目: ＝右辺
      const lineRight = document.createElement('div');
      lineRight.className = 'option-line-right';
      const eqSign = document.createElement('span');
      eqSign.className = 'option-eq-sign';
      eqSign.textContent = '＝';
      const rightFormula = document.createElement('span');
      lineRight.appendChild(eqSign);
      lineRight.appendChild(rightFormula);

      eqContainer.appendChild(lineLeft);
      eqContainer.appendChild(lineRight);

      card.appendChild(badge);
      card.appendChild(eqContainer);
      this.dom.optionsGrid.appendChild(card);

      // 左辺と右辺の数式をそれぞれKaTeXでレンダリング
      this.renderMath(leftFormula, q.leftTex);
      this.renderMath(rightFormula, opt.tex);

      // クリックイベント
      card.addEventListener('click', () => {
        this.selectOption(idx);
      });
    });
  }

  // KaTeX描画ヘルパー
  renderMath(element, tex) {
    if (typeof katex !== 'undefined') {
      try {
        katex.render(tex, element, {
          throwOnError: false,
          displayMode: false
        });
      } catch (err) {
        element.textContent = tex;
      }
    } else {
      element.textContent = tex;
    }
  }

  // 選択肢の回答処理
  selectOption(optionIndex) {
    if (this.isAnsweringLocked) return;
    if (optionIndex < 0 || optionIndex >= this.currentOptions.length) return;

    this.isAnsweringLocked = true;
    this.totalAnswered++;

    const selectedOpt = this.currentOptions[optionIndex];
    const cards = this.dom.optionsGrid.querySelectorAll('.option-card');
    const clickedCard = cards[optionIndex];
    const currentQ = this.currentQuestion;

    // 履歴レコードを作成・保存
    this.addHistoryRecord(currentQ, selectedOpt.tex, selectedOpt.isCorrect);

    if (selectedOpt.isCorrect) {
      // -----------------------------
      // 【正解の場合】
      // -----------------------------
      this.totalCorrect++;
      this.currentStreak++;
      if (this.currentStreak > this.maxStreak) {
        this.maxStreak = this.currentStreak;
      }

      this.playSound('correct');

      // スタイル更新
      clickedCard.classList.add('state-correct');
      cards.forEach(c => c.classList.add('disabled'));

      // 等号右側に正解式を表示
      this.renderMath(this.dom.equationTarget, selectedOpt.tex);
      this.dom.equationTarget.style.borderColor = 'var(--success)';

      // フィードバックバナー
      this.dom.feedbackBanner.className = 'feedback-banner correct';
      this.dom.feedbackIcon.textContent = '⭕';
      this.dom.feedbackTitle.textContent = `正解！ (${this.currentStreak} 連続正解 🔥)`;
      this.dom.feedbackDesc.textContent = currentQ.hint;
      this.dom.btnNextManual.classList.add('hidden');

      this.updateStatsDisplay();
      this.savePersistedData();

      // ★要件: 「連続正解10問で合格画面を出す」
      if (this.currentStreak === this.passTarget) {
        this.passCount++;
        this.savePersistedData();
        this.updateStatsDisplay();

        // 0.65秒後に合格画面へ！
        this.autoAdvanceTimer = setTimeout(() => {
          this.showPassScreen();
        }, 650);
        return;
      }

      // ★要件: 「正解の時は自動的に次の問題へ」
      this.autoAdvanceTimer = setTimeout(() => {
        this.nextQuestion();
      }, 650);

    } else {
      // -----------------------------
      // 【不正解の場合】
      // -----------------------------
      this.currentStreak = 0; // 連続正解リセット
      this.playSound('wrong');

      clickedCard.classList.add('state-wrong');

      // 正解のカードを教えてあげる
      cards.forEach((c, idx) => {
        c.classList.add('disabled');
        if (this.currentOptions[idx].isCorrect) {
          c.classList.add('state-reveal');
        }
      });

      this.dom.feedbackBanner.className = 'feedback-banner wrong';
      this.dom.feedbackIcon.textContent = '❌';
      this.dom.feedbackTitle.textContent = '連続正解がリセットされました... 再挑戦！';
      this.dom.feedbackDesc.textContent = currentQ.hint;
      this.dom.btnNextManual.classList.remove('hidden');

      this.updateStatsDisplay();
      this.savePersistedData();
    }
  }

  // 次の問題へ進む
  nextQuestion() {
    this.renderCurrentQuestion();
  }

  // ステータス表示の更新
  updateStatsDisplay() {
    this.dom.currentStreakDisplay.textContent = this.currentStreak;
    this.dom.totalCounterDisplay.textContent = `累計回答: ${this.totalAnswered}問`;

    // 連続正解ゲージ（10問で100%）
    const progressPercent = Math.min((this.currentStreak / this.passTarget) * 100, 100);
    this.dom.progressBar.style.width = `${progressPercent}%`;

    const acc = this.totalAnswered > 0 
      ? Math.round((this.totalCorrect / this.totalAnswered) * 100) 
      : 100;
    this.dom.accuracyDisplay.textContent = `${acc}%`;

    this.dom.passCountDisplay.textContent = `${this.passCount}回`;
  }

  // 合格画面の表示
  showPassScreen() {
    this.playSound('fanfare');

    // 画面切り替え
    this.dom.quizScreen.classList.remove('active');
    this.dom.resultScreen.classList.remove('hidden');
    this.dom.resultScreen.classList.add('active');

    // タイム計算
    const elapsedSec = Math.floor((Date.now() - this.startTime) / 1000);
    const mins = Math.floor(elapsedSec / 60).toString().padStart(2, '0');
    const secs = (elapsedSec % 60).toString().padStart(2, '0');
    this.lastPassTime = `${mins}:${secs}`;
    this.lastPassElapsedSec = elapsedSec;

    const accuracy = this.totalAnswered > 0 
      ? Math.round((this.totalCorrect / this.totalAnswered) * 100) 
      : 100;
    this.lastPassAccuracy = `${accuracy}%`;

    this.dom.resultStreak.textContent = `${this.currentStreak} 連続`;
    this.dom.resultAccuracy.textContent = `${accuracy}%`;
    this.dom.resultTotalAnswered.textContent = `${this.totalAnswered} 問`;
    this.dom.resultTime.textContent = this.lastPassTime;

    // 名前入力フォームの初期化（常に空欄で表示）
    this.dom.passNameForm.classList.remove('hidden');
    this.dom.passRegisteredMsg.classList.add('hidden');
    this.dom.passUserName.value = '';
    setTimeout(() => {
      this.dom.passUserName.focus();
    }, 200);
  }

  // タイム文字列を秒数に変換
  parseTimeToSeconds(timeStr) {
    if (!timeStr) return 999999;
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10) || 0;
      const secs = parseInt(parts[1], 10) || 0;
      return mins * 60 + secs;
    }
    return 999999;
  }

  // 合格者のお名前を登録
  savePassName() {
    const rawName = this.dom.passUserName.value.trim();
    const name = rawName || '合格チャレンジャー';
    this.lastSavedName = name;

    const record = {
      id: Date.now(),
      name: name,
      date: new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
      time: this.lastPassTime || '01:00',
      timeSeconds: typeof this.lastPassElapsedSec === 'number' ? this.lastPassElapsedSec : 60,
      accuracy: this.lastPassAccuracy || '100%',
      streak: this.currentStreak
    };

    this.hallOfFame.push(record);
    this.savePersistedData();

    // 登録完了UI表示
    this.dom.passNameForm.classList.add('hidden');
    this.dom.registeredNameDisplay.textContent = name;
    this.dom.passRegisteredMsg.classList.remove('hidden');

    this.playSound('correct');
  }

  // -----------------------------------------
  // 合格者一覧（殿堂入り）モーダル管理
  // -----------------------------------------
  openHallOfFameModal() {
    this.renderHallOfFameModal();
    this.dom.hallOfFameModal.classList.remove('hidden');
  }

  closeHallOfFameModal() {
    this.dom.hallOfFameModal.classList.add('hidden');
  }

  clearHallOfFame() {
    if (confirm('合格者ランキングを消去しますか？')) {
      this.hallOfFame = [];
      this.savePersistedData();
      this.renderHallOfFameModal();
    }
  }

  renderHallOfFameModal() {
    const list = this.dom.hofListContainer;
    list.innerHTML = '';

    const count = this.hallOfFame.length;
    this.dom.modalHofCount.textContent = `${count} 名`;

    if (count === 0) {
      list.innerHTML = `
        <div class="history-empty-state">
          <div class="history-empty-icon">🏆</div>
          <div>まだ合格者が登録されていません。</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">連続10問正解して、最初の合格者として登録しましょう！</div>
        </div>
      `;
      return;
    }

    // ★所要時間（早い順・昇順）でランキングソート
    const sortedHof = [...this.hallOfFame].sort((a, b) => {
      const timeA = typeof a.timeSeconds === 'number' ? a.timeSeconds : this.parseTimeToSeconds(a.time);
      const timeB = typeof b.timeSeconds === 'number' ? b.timeSeconds : this.parseTimeToSeconds(b.time);
      if (timeA !== timeB) {
        return timeA - timeB; // 早いタイムが上位！
      }
      return b.id - a.id;
    });

    sortedHof.forEach((rec, idx) => {
      const card = document.createElement('div');
      card.className = `hof-card ${idx === 0 ? 'rank-1' : idx === 1 ? 'rank-2' : idx === 2 ? 'rank-3' : ''}`;

      let rankDisplay = `${idx + 1}位`;
      let rankBadgeClass = 'hof-rank-normal';
      if (idx === 0) {
        rankDisplay = '🥇 1位';
        rankBadgeClass = 'hof-rank-gold';
      } else if (idx === 1) {
        rankDisplay = '🥈 2位';
        rankBadgeClass = 'hof-rank-silver';
      } else if (idx === 2) {
        rankDisplay = '🥉 3位';
        rankBadgeClass = 'hof-rank-bronze';
      }

      card.innerHTML = `
        <div class="hof-card-left">
          <div class="hof-rank-badge ${rankBadgeClass}">${rankDisplay}</div>
          <div class="hof-name-info">
            <span class="hof-name">${this.escapeHtml(rec.name)}</span>
            <span class="hof-date">合格日時: ${rec.date}</span>
          </div>
        </div>
        <div class="hof-card-right">
          <div class="hof-stat">
            <span class="hof-stat-val highlight-time">⏱️ ${rec.time}</span>
            <span class="hof-stat-label">所要時間</span>
          </div>
          <div class="hof-stat">
            <span class="hof-stat-val">${rec.accuracy}</span>
            <span class="hof-stat-label">正答率</span>
          </div>
        </div>
      `;
      list.appendChild(card);
    });
  }

  escapeHtml(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // -----------------------------------------
  // 解答履歴管理
  // -----------------------------------------
  addHistoryRecord(question, selectedTex, isCorrect) {
    const record = {
      id: Date.now(),
      questionId: question.id,
      leftTex: question.leftTex,
      selectedTex: selectedTex,
      correctTex: question.correctTex,
      isCorrect: isCorrect,
      hint: question.hint,
      time: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };

    this.history.unshift(record);
    if (this.history.length > 100) {
      this.history.pop();
    }
  }

  openHistoryModal() {
    this.renderHistoryModal();
    this.dom.historyModal.classList.remove('hidden');
  }

  closeHistoryModal() {
    this.dom.historyModal.classList.add('hidden');
  }

  clearHistory() {
    if (confirm('解答履歴をすべて消去しますか？')) {
      this.history = [];
      this.savePersistedData();
      this.renderHistoryModal();
    }
  }

  renderHistoryModal() {
    const list = this.dom.historyListContainer;
    list.innerHTML = '';

    const total = this.history.length;
    this.dom.modalHistoryCount.textContent = `${total} 件`;

    this.dom.historyTotalCount.textContent = this.totalAnswered;
    this.dom.historyCorrectCount.textContent = this.totalCorrect;
    this.dom.historyCurrentStreak.textContent = this.currentStreak;
    this.dom.historyMaxStreak.textContent = this.maxStreak;
    this.dom.historyPassCount.textContent = this.passCount;

    if (total === 0) {
      list.innerHTML = `
        <div class="history-empty-state">
          <div class="history-empty-icon">📝</div>
          <div>まだ解答履歴がありません。</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">クイズに回答すると自動的にここに記録されます。</div>
        </div>
      `;
      return;
    }

    this.history.forEach((rec) => {
      const card = document.createElement('div');
      card.className = `history-card ${rec.isCorrect ? 'correct' : 'wrong'}`;

      const header = document.createElement('div');
      header.className = 'history-card-header';

      const statusBadge = document.createElement('span');
      statusBadge.className = 'history-status-badge';
      statusBadge.innerHTML = rec.isCorrect 
        ? `<span>⭕ 正解</span>` 
        : `<span>❌ 不正解</span>`;

      const timeSpan = document.createElement('span');
      timeSpan.className = 'history-time';
      timeSpan.textContent = `[${rec.time}] 問 #${rec.questionId}`;

      header.appendChild(statusBadge);
      header.appendChild(timeSpan);
      card.appendChild(header);

      // 式のブロック
      const eqBlock = document.createElement('div');
      eqBlock.className = 'history-eq-block';

      // 1行目: 問題
      const lineQ = document.createElement('div');
      lineQ.className = 'history-line';
      const labelQ = document.createElement('span');
      labelQ.className = 'history-label';
      labelQ.textContent = '問題:';
      const texQ = document.createElement('span');
      lineQ.appendChild(labelQ);
      lineQ.appendChild(texQ);
      eqBlock.appendChild(lineQ);

      // 2行目: あなたの回答
      const lineAns = document.createElement('div');
      lineAns.className = 'history-line';
      const labelAns = document.createElement('span');
      labelAns.className = 'history-label';
      labelAns.textContent = 'あなたの式:';
      const texAns = document.createElement('span');
      texAns.style.color = rec.isCorrect ? 'var(--success-text)' : 'var(--error-text)';
      lineAns.appendChild(labelAns);
      lineAns.appendChild(texAns);
      eqBlock.appendChild(lineAns);

      // 不正解の場合は正しい式も表示
      if (!rec.isCorrect) {
        const lineCor = document.createElement('div');
        lineCor.className = 'history-line';
        const labelCor = document.createElement('span');
        labelCor.className = 'history-label';
        labelCor.textContent = '正解の式:';
        const texCor = document.createElement('span');
        texCor.style.color = 'var(--success-text)';
        texCor.style.fontWeight = '700';
        lineCor.appendChild(labelCor);
        lineCor.appendChild(texCor);
        eqBlock.appendChild(lineCor);
        this.renderMath(texCor, rec.correctTex);
      }

      card.appendChild(eqBlock);

      // ヒント・解説
      const hintDiv = document.createElement('div');
      hintDiv.className = 'history-hint';
      hintDiv.textContent = `💡 ${rec.hint}`;
      card.appendChild(hintDiv);

      list.appendChild(card);

      // KaTeX描画
      this.renderMath(texQ, rec.leftTex);
      this.renderMath(texAns, `＝ ${rec.selectedTex}`);
    });
  }
}

// =========================================
// 紙吹雪演出マネージャー (Canvas Confetti)
// =========================================
class ConfettiManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas ? canvas.getContext('2d') : null;
    this.particles = [];
    this.animId = null;
    if (this.canvas) {
      this.resize();
      window.addEventListener('resize', () => this.resize());
    }
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  fire() {
    if (!this.canvas || !this.ctx) return;
    this.resize();
    this.particles = [];
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
    for (let i = 0; i < 90; i++) {
      this.particles.push({
        x: this.canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: this.canvas.height / 2,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 18,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 10,
        alpha: 1,
        life: 0.98 + Math.random() * 0.015
      });
    }

    if (this.animId) cancelAnimationFrame(this.animId);
    this.animate();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // 重力
      p.vx *= 0.98;
      p.rotation += p.vRot;
      p.alpha *= p.life;

      if (p.alpha <= 0.02 || p.y > this.canvas.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animId = requestAnimationFrame(() => this.animate());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.animId = null;
    }
  }
}

// =========================================
// MODE 2: 因数分解問題バンク & 生成ロジック
// =========================================
const FACTOR_QUESTION_BANK = {
  // 原本画像に掲載されている4問を含む重要パターン
  coreSamples: [
    // 1. (x - y)^2 - (a + 3b)^2
    {
      original: "(x - y)^2 - (a + 3b)^2",
      correctForms: [
        {
          tex: "\\{(x - y) + (a + 3b)\\}\\{(x - y) - (a + 3b)\\}",
          reason: "正しい変形です。公式 A² - B² = {A + B}{A - B} において A = (x - y), B = (a + 3b) を正しく代入しています。"
        },
        {
          tex: "(x - y + a + 3b)(x - y - a - 3b)",
          reason: "正しい変形です。中カッコを展開し、後ろのカッコの符号 -(a + 3b) = -a - 3b と正しく外しています。"
        }
      ],
      wrongForms: [
        {
          tex: "\\{(x - y) + (a + 3b)\\}\\{(x - y) + (a + 3b)\\}",
          reason: "誤り：後ろのカッコの符号も '+' になっています。公式は (A + B)(A - B) なので一方はマイナスでなければなりません。"
        },
        {
          tex: "\\{(x - y) - (a + 3b)\\}\\{(x - y) - (a + 3b)\\}",
          reason: "誤り：両方のカッコがマイナスになっています。公式は (A + B)(A - B) です。"
        },
        {
          tex: "(x^2 - y^2) - (a^2 + 9b^2)",
          reason: "誤り：(x - y)² を勝手に x² - y² としてはいけません (展開公式の二乗展開ミス)。"
        },
        {
          tex: "\\{(x - y) - (a + 3b)\\}^2",
          reason: "誤り：A² - B² は (A - B)² ではありません。(A - B)² = A² - 2AB + B² です。"
        }
      ]
    },

    // 2. (a + 2b)^2 - (x - 1)^2
    {
      original: "(a + 2b)^2 - (x - 1)^2",
      correctForms: [
        {
          tex: "\\{(a + 2b) + (x - 1)\\}\\{(a + 2b) - (x - 1)\\}",
          reason: "正しい変形です。A = (a + 2b), B = (x - 1) とおいた A² - B² = {A + B}{A - B} の中カッコの形です。"
        },
        {
          tex: "(a + 2b + x - 1)(a + 2b - x + 1)",
          reason: "正しい変形です。後ろのカッコ -(x - 1) を正しく展開して -x + 1 となっています。"
        }
      ],
      wrongForms: [
        {
          tex: "(a + 2b + x - 1)(a + 2b - x - 1)",
          reason: "誤り：最頻出ミス！後ろの -(x - 1) のカッコを外すとき、符号が反転して +1 になるべきところが -1 のままです。"
        },
        {
          tex: "\\{(a + 2b) + (x - 1)\\}^2",
          reason: "誤り：全体の二乗にはなりません。A² - B² = (A + B)(A - B) です。"
        },
        {
          tex: "\\{(a + 2b) - (x - 1)\\}\\{(a + 2b) - (x - 1)\\}",
          reason: "誤り：両方のカッコが引き算になっています。(A + B)(A - B) の和と差の積になりません。"
        }
      ]
    },

    // 3. (2x + y)^2 - 36
    {
      original: "(2x + y)^2 - 36",
      correctForms: [
        {
          tex: "(2x + y + 6)(2x + y - 6)",
          reason: "正しい変形です。36 = 6² なので、(2x + y + 6)(2x + y - 6) と因数分解できます。"
        },
        {
          tex: "\\{(2x + y) + 6\\}\\{(2x + y) - 6\\}",
          reason: "正しい変形です。36 を 6² と捉え、公式 {A + 6}{A - 6} を適用しています。"
        }
      ],
      wrongForms: [
        {
          tex: "(2x + y + 36)(2x + y - 36)",
          reason: "誤り：36 の平方根 (6) を取らずに、36 のまま因数分解してしまっています。"
        },
        {
          tex: "(2x + y + 18)(2x + y - 18)",
          reason: "誤り：36 を半分 (18) にしてしまっています。必要なのは 6² = 36 なので 6 です。"
        },
        {
          tex: "(2x + y - 6)^2",
          reason: "誤り：二乗の差 A² - B² は (A - B)² ではありません。"
        },
        {
          tex: "(2x + y + 6)(2x + y + 6)",
          reason: "誤り：両方足し算になっています。(A + B)(A - B) になる必要があります。"
        }
      ]
    },

    // 4. 64 - (x - y)^2
    {
      original: "64 - (x - y)^2",
      correctForms: [
        {
          tex: "\\{8 + (x - y)\\}\\{8 - (x - y)\\}",
          reason: "正しい変形です。64 = 8² より、{8 + (x - y)}{8 - (x - y)} となります。"
        },
        {
          tex: "(8 + x - y)(8 - x + y)",
          reason: "正しい変形です。後ろのカッコ -(x - y) を展開すると -x + y に正しく符号反転しています。"
        }
      ],
      wrongForms: [
        {
          tex: "\\{64 + (x - y)\\}\\{64 - (x - y)\\}",
          reason: "誤り：64 の平方根 (8) を取らず、64 のままにしてしまっています。"
        },
        {
          tex: "\\{32 + (x - y)\\}\\{32 - (x - y)\\}",
          reason: "誤り：64 を半分 (32) にしてしまっています。8² = 64 より 8 が正解です。"
        },
        {
          tex: "(8 + x - y)(8 - x - y)",
          reason: "誤り：後ろの -(x - y) を外すとき、-y の符号が反転して +y になるべきですが -y のままです。"
        },
        {
          tex: "(x - y + 8)(x - y - 8)",
          reason: "誤り：引く順番が逆です。64 - A² なので (8 + A)(8 - A) であり、全体に -1 倍の符号ズレが生じます。"
        },
        {
          tex: "\\{8 - (x - y)\\}^2",
          reason: "誤り：二乗の形にしてしまっています。正しくは和と差の積です。"
        }
      ]
    },

    // 5. (3x - 1)^2 - 25
    {
      original: "(3x - 1)^2 - 25",
      correctForms: [
        {
          tex: "(3x - 1 + 5)(3x - 1 - 5)",
          reason: "正しい変形です。25 = 5² なので (3x - 1 + 5)(3x - 1 - 5) と変形できます。"
        },
        {
          tex: "\\{(3x - 1) + 5\\}\\{(3x - 1) - 5\\}",
          reason: "正しい変形です。公式 A² - 5² = {A + 5}{A - 5} を正しく適用しています。"
        }
      ],
      wrongForms: [
        {
          tex: "(3x - 1 + 25)(3x - 1 - 25)",
          reason: "誤り：25 の平方根 (5) を取らず、25 のまま式を作っています。"
        },
        {
          tex: "(3x + 4)(3x - 4)",
          reason: "誤り：(3x - 1 - 5) は 3x - 6 になるはずですが、計算が合っていません。"
        }
      ]
    },

    // 6. 49 - (2a + b)^2
    {
      original: "49 - (2a + b)^2",
      correctForms: [
        {
          tex: "\\{7 + (2a + b)\\}\\{7 - (2a + b)\\}",
          reason: "正しい変形です。49 = 7² より {7 + (2a + b)}{7 - (2a + b)} です。"
        },
        {
          tex: "(7 + 2a + b)(7 - 2a - b)",
          reason: "正しい変形です。後ろのカッコ -(2a + b) を外して -2a - b と符号が正しく変化しています。"
        }
      ],
      wrongForms: [
        {
          tex: "(7 + 2a + b)(7 - 2a + b)",
          reason: "誤り：後ろのカッコ -(2a + b) の +b が -b に変わっていません。"
        },
        {
          tex: "\\{49 + (2a + b)\\}\\{49 - (2a + b)\\}",
          reason: "誤り：49 の平方根 (7) に直していません。"
        }
      ]
    },

    // 7. (x + 3)^2 - 16y^2
    {
      original: "(x + 3)^2 - 16y^2",
      correctForms: [
        {
          tex: "(x + 3 + 4y)(x + 3 - 4y)",
          reason: "正しい変形です。16y² = (4y)² なので (x + 3 + 4y)(x + 3 - 4y) となります。"
        },
        {
          tex: "\\{(x + 3) + 4y\\}\\{(x + 3) - 4y\\}",
          reason: "正しい変形です。A = (x + 3), B = 4y として公式を正しく用いています。"
        }
      ],
      wrongForms: [
        {
          tex: "(x + 3 + 16y)(x + 3 - 16y)",
          reason: "誤り：16 の平方根 (4) を取らず、16y のままにしてしまっています。"
        },
        {
          tex: "(x + 3 + 8y)(x + 3 - 8y)",
          reason: "誤り：16 を半分にして 8 にしてしまっています。4² = 16 なので 4y が正解です。"
        }
      ]
    },

    // 8. (2a - b)^2 - (a - 3b)^2
    {
      original: "(2a - b)^2 - (a - 3b)^2",
      correctForms: [
        {
          tex: "\\{(2a - b) + (a - 3b)\\}\\{(2a - b) - (a - 3b)\\}",
          reason: "正しい変形です。塊として A = (2a - b), B = (a - 3b) を {A + B}{A - B} に当てはめています。"
        },
        {
          tex: "(2a - b + a - 3b)(2a - b - a + 3b)",
          reason: "正しい変形です。-(a - 3b) のマイナスが分配されて -a + 3b に正しく符号反転しています。"
        }
      ],
      wrongForms: [
        {
          tex: "(2a - b + a - 3b)(2a - b - a - 3b)",
          reason: "誤り：-(a - 3b) のマイナス分配で、-3b が +3b に変わっていません。"
        },
        {
          tex: "\\{(2a - b) + (a - 3b)\\}^2",
          reason: "誤り：A² - B² は二乗にはならず、和と差の積 (A + B)(A - B) です。"
        }
      ]
    }
  ],

  // 8問の問題セットを生成（正解の数は2〜5個のランダム）
  generateRound(isFirstRound = false) {
    const totalCards = 8;
    const targetCorrectCount = Math.floor(Math.random() * 4) + 2; // 2, 3, 4, 5
    const targetWrongCount = totalCards - targetCorrectCount;

    const correctCandidates = [];
    const wrongCandidates = [];

    let samples = [...this.coreSamples];
    if (isFirstRound) {
      const top4 = samples.slice(0, 4);
      const rest = samples.slice(4).sort(() => Math.random() - 0.5);
      samples = [...top4, ...rest];
    } else {
      samples.sort(() => Math.random() - 0.5);
    }

    samples.forEach(item => {
      item.correctForms.forEach(cf => {
        correctCandidates.push({
          original: item.original,
          transformed: cf.tex,
          fullEquation: `${item.original} = ${cf.tex}`,
          isCorrect: true,
          reason: cf.reason
        });
      });

      item.wrongForms.forEach(wf => {
        wrongCandidates.push({
          original: item.original,
          transformed: wf.tex,
          fullEquation: `${item.original} = ${wf.tex}`,
          isCorrect: false,
          reason: wf.reason
        });
      });
    });

    if (!isFirstRound) {
      correctCandidates.sort(() => Math.random() - 0.5);
      wrongCandidates.sort(() => Math.random() - 0.5);
    }

    const selectedCorrect = [];
    const usedEquations = new Set();

    for (const c of correctCandidates) {
      if (selectedCorrect.length >= targetCorrectCount) break;
      if (!usedEquations.has(c.fullEquation)) {
        selectedCorrect.push(c);
        usedEquations.add(c.fullEquation);
      }
    }

    const selectedWrong = [];
    for (const w of wrongCandidates) {
      if (selectedWrong.length >= targetWrongCount) break;
      if (!usedEquations.has(w.fullEquation)) {
        selectedWrong.push(w);
        usedEquations.add(w.fullEquation);
      }
    }

    const roundCards = [...selectedCorrect, ...selectedWrong].sort(() => Math.random() - 0.5);

    return roundCards.map((card, idx) => ({
      ...card,
      id: idx,
      shortcut: idx + 1, // 1..8
      userChoice: null   // 'circle' | 'cross' | null
    }));
  }
};

// =========================================
// MODE 2: 因数分解8枚◯✕チェック アプリ本体
// =========================================
class FactoringApp {
  constructor(sharedQuizApp) {
    this.quizApp = sharedQuizApp; // 共通のサウンド・テーマ設定を参照
    this.confetti = new ConfettiManager(document.getElementById('confetti-canvas'));
    
    this.cards = [];
    this.isEvaluated = false;

    this.streak = 0;
    this.totalRounds = 0;
    this.totalCorrectJudgments = 0;
    this.totalPossibleJudgments = 0;

    this.initDOM();
    this.initEvents();
    this.startNewRound(true);
  }

  initDOM() {
    this.cardsContainer = document.getElementById('factor-cards-container');
    this.selectionStatus = document.getElementById('factor-selection-status');
    this.resultSummary = document.getElementById('factor-result-summary');
    this.roundFeedback = document.getElementById('factor-round-feedback');

    this.btnCheck = document.getElementById('factor-btn-check');
    this.btnNext = document.getElementById('factor-btn-next');
    this.btnClear = document.getElementById('factor-btn-clear');
    this.btnFormulaHint = document.getElementById('factor-btn-formula-hint');

    // モーダル
    this.modalOverlay = document.getElementById('factor-modal-overlay');
    this.modalTitle = document.getElementById('factor-modal-title');
    this.modalBody = document.getElementById('factor-modal-body');
    this.modalClose = document.getElementById('factor-modal-close');
    this.modalCloseBottom = document.getElementById('factor-modal-close-bottom');

    this.guideModal = document.getElementById('factor-guide-modal');
    this.guideModalClose = document.getElementById('factor-guide-modal-close');
    this.guideModalCloseBottom = document.getElementById('factor-guide-modal-close-bottom');
  }

  initEvents() {
    this.btnCheck.addEventListener('click', () => this.evaluate());
    this.btnNext.addEventListener('click', () => this.startNewRound());
    this.btnClear.addEventListener('click', () => this.clearAllChoices());
    this.btnFormulaHint.addEventListener('click', () => this.showFormulaGuide());

    // モーダル閉じる
    this.modalClose.addEventListener('click', () => this.closeDetailModal());
    this.modalCloseBottom.addEventListener('click', () => this.closeDetailModal());
    this.modalOverlay.addEventListener('click', (e) => {
      if (e.target === this.modalOverlay) this.closeDetailModal();
    });

    this.guideModalClose.addEventListener('click', () => this.closeGuideModal());
    this.guideModalCloseBottom.addEventListener('click', () => this.closeGuideModal());
    this.guideModal.addEventListener('click', (e) => {
      if (e.target === this.guideModal) this.closeGuideModal();
    });

    window.addEventListener('resize', () => {
      if (window.activeAppMode === 'factor') {
        this.fitAllFormulas();
      }
    });
  }

  // キーボードイベント (QuizAppから委譲される)
  handleKeydown(e) {
    if (this.modalOverlay && !this.modalOverlay.classList.contains('hidden')) {
      if (e.key === 'Escape') this.closeDetailModal();
      return;
    }

    if (this.guideModal && !this.guideModal.classList.contains('hidden')) {
      if (e.key === 'Escape') this.closeGuideModal();
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (!this.isEvaluated) {
        this.evaluate();
      } else {
        this.startNewRound();
      }
      return;
    }

    // 1〜8キーで ◯/✕ トグル
    if (e.key >= '1' && e.key <= '8') {
      e.preventDefault();
      const cardIndex = parseInt(e.key, 10) - 1;
      this.toggleChoice(cardIndex);
    }
  }

  startNewRound(isFirstRound = false) {
    this.isEvaluated = false;
    this.cards = FACTOR_QUESTION_BANK.generateRound(isFirstRound);

    this.btnCheck.style.display = 'inline-flex';
    this.btnNext.style.display = 'none';
    this.btnClear.disabled = false;
    this.roundFeedback.innerHTML = '';
    this.resultSummary.innerHTML = '';
    this.updateProgressStatus();

    this.renderCards();
  }

  renderCards() {
    this.cardsContainer.innerHTML = '';

    this.cards.forEach((card, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'math-card';
      cardEl.dataset.id = card.id;

      const numLabel = idx + 1;
      const shortcutLabel = card.shortcut;

      cardEl.innerHTML = `
        <div class="card-header">
          <div style="display: flex; align-items: center; gap: 4px;">
            <span class="card-num-tag">${numLabel}</span>
            <span class="card-shortcut">[${shortcutLabel}]</span>
          </div>
          <div class="card-choice-group">
            <button class="choice-btn circle ${card.userChoice === 'circle' ? 'active' : ''}" data-choice="circle" title="正しい変形 (◯)">◯</button>
            <button class="choice-btn cross ${card.userChoice === 'cross' ? 'active' : ''}" data-choice="cross" title="間違った変形 (✕)">✕</button>
          </div>
        </div>
        <div class="card-formula" id="factor-formula-${card.id}" title="クリックで ◯ / ✕ を切替">
          <div class="formula-line formula-original" id="factor-orig-${card.id}"></div>
          <div class="formula-line formula-transformed" id="factor-trans-${card.id}"></div>
        </div>
        <div class="card-footer">
          <span class="card-status-pill" id="factor-pill-${card.id}"></span>
          <button class="card-explain-btn" id="factor-explain-${card.id}">解説</button>
        </div>
      `;

      // ◯ボタン
      const btnCircle = cardEl.querySelector('.choice-btn.circle');
      btnCircle.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setChoice(card.id, 'circle');
      });

      // ✕ボタン
      const btnCross = cardEl.querySelector('.choice-btn.cross');
      btnCross.addEventListener('click', (e) => {
        e.stopPropagation();
        this.setChoice(card.id, 'cross');
      });

      // 数式領域クリックでトグル
      const formulaEl = cardEl.querySelector('.card-formula');
      formulaEl.addEventListener('click', () => {
        this.toggleChoice(card.id);
      });

      // 解説ボタン
      const explainBtn = cardEl.querySelector('.card-explain-btn');
      explainBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.showCardDetail(card);
      });

      this.cardsContainer.appendChild(cardEl);

      // KaTeX 数式描画
      this.renderFormulaLine(card.original, `factor-orig-${card.id}`);
      this.renderFormulaLine(`= ${card.transformed}`, `factor-trans-${card.id}`);
    });

    setTimeout(() => this.fitAllFormulas(), 50);
    setTimeout(() => this.fitAllFormulas(), 250);
  }

  renderFormulaLine(texStr, elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const render = () => {
      if (typeof katex !== 'undefined') {
        try {
          katex.render(texStr, el, { displayMode: false, throwOnError: false });
          this.fitFormulaLine(el);
          return true;
        } catch (e) {
          console.warn('KaTeX render error:', e);
        }
      }
      return false;
    };

    if (render()) return;

    const retryInterval = setInterval(() => {
      if (render()) clearInterval(retryInterval);
    }, 100);

    setTimeout(() => {
      clearInterval(retryInterval);
      if (!el.innerHTML.trim()) {
        el.textContent = texStr;
        this.fitFormulaLine(el);
      }
    }, 3000);
  }

  // 式がカードからはみ出ない自動スケーリング
  fitFormulaLine(lineEl) {
    if (!lineEl) return;
    lineEl.style.transform = 'none';

    const inner = lineEl.querySelector('.katex-html') || lineEl.firstElementChild || lineEl;
    const parentContainer = lineEl.closest('.card-formula') || lineEl.parentElement;
    if (!inner || !parentContainer) return;

    const naturalWidth = inner.scrollWidth || inner.offsetWidth;
    const availableWidth = parentContainer.clientWidth - 12;

    if (naturalWidth > availableWidth && availableWidth > 0) {
      const scale = Math.max(0.65, availableWidth / naturalWidth);
      lineEl.style.transform = `scale(${scale.toFixed(3)})`;
    } else {
      lineEl.style.transform = 'none';
    }
  }

  fitAllFormulas() {
    if (!this.cardsContainer) return;
    const lines = this.cardsContainer.querySelectorAll('.formula-line');
    lines.forEach(line => this.fitFormulaLine(line));
  }

  setChoice(id, choice) {
    if (this.isEvaluated) return;
    const card = this.cards.find(c => c.id === id);
    if (!card) return;

    if (card.userChoice === choice) {
      card.userChoice = null;
      this.quizApp.playSound('click');
    } else {
      card.userChoice = choice;
      if (choice === 'circle') {
        this.quizApp.playSound('correct');
      } else {
        this.quizApp.playSound('wrong');
      }
    }

    this.updateCardChoiceUI(id);
    this.updateProgressStatus();
  }

  toggleChoice(id) {
    if (this.isEvaluated) return;
    const card = this.cards.find(c => c.id === id);
    if (!card) return;

    if (card.userChoice === null) {
      this.setChoice(id, 'circle');
    } else if (card.userChoice === 'circle') {
      this.setChoice(id, 'cross');
    } else {
      this.setChoice(id, 'cross'); // 解除
    }
  }

  updateCardChoiceUI(id) {
    const card = this.cards.find(c => c.id === id);
    const cardEl = this.cardsContainer.querySelector(`[data-id="${id}"]`);
    if (!card || !cardEl) return;

    cardEl.classList.remove('picked-circle', 'picked-cross', 'unanswered-alert');

    const btnCircle = cardEl.querySelector('.choice-btn.circle');
    const btnCross = cardEl.querySelector('.choice-btn.cross');

    if (card.userChoice === 'circle') {
      cardEl.classList.add('picked-circle');
      btnCircle.classList.add('active');
      btnCross.classList.remove('active');
    } else if (card.userChoice === 'cross') {
      cardEl.classList.add('picked-cross');
      btnCircle.classList.remove('active');
      btnCross.classList.add('active');
    } else {
      btnCircle.classList.remove('active');
      btnCross.classList.remove('active');
    }
  }

  clearAllChoices() {
    if (this.isEvaluated) return;
    this.cards.forEach(card => {
      card.userChoice = null;
      this.updateCardChoiceUI(card.id);
    });
    this.updateProgressStatus();
    this.quizApp.playSound('click');
  }

  updateProgressStatus() {
    const answeredCount = this.cards.filter(c => c.userChoice !== null).length;
    const total = this.cards.length;

    if (answeredCount === total) {
      this.selectionStatus.textContent = `全問回答完了！(8 / 8 枚)`;
      this.selectionStatus.style.background = 'rgba(16, 185, 129, 0.15)';
      this.selectionStatus.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      this.selectionStatus.style.color = 'var(--success)';
      this.roundFeedback.innerHTML = `<span style="color: var(--success); font-weight: 700;">✨ すべての回答がつきました！「答え合わせ」を押してください</span>`;
    } else {
      this.selectionStatus.textContent = `回答済み: ${answeredCount} / ${total} 枚`;
      this.selectionStatus.style.background = '';
      this.selectionStatus.style.borderColor = '';
      this.selectionStatus.style.color = '';
      if (!this.isEvaluated) {
        this.roundFeedback.innerHTML = '';
      }
    }
  }

  evaluate() {
    if (this.isEvaluated) return;

    // 全てのカードにマルかバツがついているかチェック
    const unansweredCards = this.cards.filter(c => c.userChoice === null);
    if (unansweredCards.length > 0) {
      unansweredCards.forEach(c => {
        const cardEl = this.cardsContainer.querySelector(`[data-id="${c.id}"]`);
        if (cardEl) {
          cardEl.classList.add('unanswered-alert');
          setTimeout(() => cardEl.classList.remove('unanswered-alert'), 450);
        }
      });

      this.quizApp.playSound('wrong');
      this.roundFeedback.innerHTML = `
        <span class="feedback-retry">
          ⚠️ すべてのカードに「◯」か「✕」をつけてから判定してください（残り ${unansweredCards.length} 枚未回答）
        </span>
      `;
      return;
    }

    this.isEvaluated = true;

    let correctDecisions = 0;
    let correctCount = 0;

    this.cards.forEach(card => {
      const cardEl = this.cardsContainer.querySelector(`[data-id="${card.id}"]`);
      const pillEl = document.getElementById(`factor-pill-${card.id}`);

      const expectedChoice = card.isCorrect ? 'circle' : 'cross';
      const isHit = (card.userChoice === expectedChoice);

      if (card.isCorrect) correctCount++;

      cardEl.classList.add('evaluated');

      if (isHit) {
        correctDecisions++;
        cardEl.classList.add('eval-correct');
        pillEl.textContent = card.isCorrect ? '◯ 正解！（正しい変形）' : '✕ 正解！（誤答を見抜いた）';
      } else {
        cardEl.classList.add('eval-wrong');
        pillEl.textContent = card.isCorrect ? '✕ 不正解（正解は ◯）' : '✕ 不正解（正解は ✕）';
      }
    });

    this.totalRounds++;
    this.totalCorrectJudgments += correctDecisions;
    this.totalPossibleJudgments += 8;

    const isPerfect = (correctDecisions === 8);

    if (isPerfect) {
      this.streak++;
      this.quizApp.playSound('fanfare');
      this.confetti.fire();
      this.roundFeedback.innerHTML = `<span class="feedback-perfect">🎉 素晴らしい！8問全問完全的中（パーフェクト）！</span>`;
    } else if (correctDecisions >= 6) {
      this.streak = 0;
      this.quizApp.playSound('correct');
      this.roundFeedback.innerHTML = `<span class="feedback-good">好調！8問中 ${correctDecisions} 問的中しました！</span>`;
    } else {
      this.streak = 0;
      this.quizApp.playSound('wrong');
      this.roundFeedback.innerHTML = `<span class="feedback-retry">的中: ${correctDecisions} / 8。カードの「解説」でポイントを確認してみましょう！</span>`;
    }

    this.btnCheck.style.display = 'none';
    this.btnNext.style.display = 'inline-flex';
    this.btnClear.disabled = true;

    this.resultSummary.innerHTML = `
      <span>正しい変形: <strong>${correctCount}問</strong> / 誤った変形: <strong>${8 - correctCount}問</strong></span>
    `;
  }

  showCardDetail(card) {
    this.modalTitle.textContent = `カード詳細解説 (問題 #${card.id + 1})`;
    
    const correctLabel = card.isCorrect ? '◯ 正しい変形' : '✕ 間違った変形';
    const userLabel = card.userChoice === 'circle' ? '◯ 正しい' : card.userChoice === 'cross' ? '✕ 間違い' : '未回答';
    const isHit = (card.userChoice === (card.isCorrect ? 'circle' : 'cross'));

    const verdictBadge = this.isEvaluated 
      ? (isHit 
          ? '<span style="color: var(--success); font-weight: 800; font-size: 1.05rem;">🎉 的中！（正解）</span>' 
          : '<span style="color: var(--error); font-weight: 800; font-size: 1.05rem;">✕ 不正解</span>')
      : '';

    this.modalBody.innerHTML = `
      <div class="modal-section">
        <h4 style="font-size: 0.95rem; margin-bottom: 6px; color: var(--primary);">問題の等式</h4>
        <div class="modal-formula-box" id="factor-modal-formula-box"></div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding: 6px 12px; background: var(--bg-badge); border-radius: 6px; border: 1px solid var(--border-color);">
          <div>
            <strong>あなたの回答:</strong> <span style="font-weight: 700;">${userLabel}</span>
            <span style="margin: 0 10px; color: var(--text-muted);">|</span>
            <strong>正解:</strong> <span style="font-weight: 700; color: ${card.isCorrect ? 'var(--success)' : 'var(--error)'};">${correctLabel}</span>
          </div>
          <div>${verdictBadge}</div>
        </div>
      </div>

      <div class="modal-section" style="margin-top: 12px;">
        <h4 style="font-size: 0.95rem; margin-bottom: 6px; color: var(--primary);">変形のポイント・理由</h4>
        <p style="background: rgba(0,0,0,0.03); padding: 10px; border-radius: 6px; border-left: 4px solid ${card.isCorrect ? 'var(--success)' : 'var(--error)'}; line-height: 1.6;">
          ${card.reason}
        </p>
      </div>

      <div class="modal-section" style="margin-top: 12px;">
        <h4 style="font-size: 0.95rem; margin-bottom: 6px; color: var(--primary);">基本公式の確認</h4>
        <div style="font-size: 0.9rem; color: var(--text-muted); line-height: 1.5;">
          $$A^2 - B^2 = (A + B)(A - B)$$
          <ul style="padding-left: 20px; margin-top: 6px;">
            <li>カッコのかたまりは 1つの文字（A や B）とみなして中カッコを用います。</li>
            <li>後ろのカッコを外すときは <strong>$-(B)$ のマイナスがすべての項に分配される</strong>ため、符号反転に最大の注意が必要です！</li>
          </ul>
        </div>
      </div>
    `;

    this.modalOverlay.classList.remove('hidden');

    const formulaBox = document.getElementById('factor-modal-formula-box');
    const eqTeX = `${card.original} = ${card.transformed}`;
    if (typeof katex !== 'undefined') {
      katex.render(eqTeX, formulaBox, { displayMode: true, throwOnError: false });
    } else {
      formulaBox.textContent = eqTeX;
    }
  }

  showFormulaGuide() {
    this.guideModal.classList.remove('hidden');
    const guideBox = document.getElementById('guide-formula-box');
    if (guideBox && typeof katex !== 'undefined') {
      katex.render("A^2 - B^2 = (A + B)(A - B)", guideBox, { displayMode: true, throwOnError: false });
    }
  }

  closeDetailModal() {
    if (this.modalOverlay) this.modalOverlay.classList.add('hidden');
  }

  closeGuideModal() {
    if (this.guideModal) this.guideModal.classList.add('hidden');
  }
}

// =========================================
// モード切り替えコントローラー (ModeController)
// =========================================
class ModeController {
  constructor() {
    this.btnTenkai = document.getElementById('btn-mode-tenkai');
    this.btnFactor = document.getElementById('btn-mode-factor');
    this.viewTenkai = document.getElementById('view-mode-tenkai');
    this.viewFactor = document.getElementById('view-mode-factor');

    this.init();
  }

  init() {
    if (this.btnTenkai) {
      this.btnTenkai.addEventListener('click', () => this.switchMode('tenkai'));
    }
    if (this.btnFactor) {
      this.btnFactor.addEventListener('click', () => this.switchMode('factor'));
    }

    // URLパラメータまたはハッシュから初期モード判定
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode') || (window.location.hash === '#factor' ? 'factor' : 'tenkai');
    this.switchMode(modeParam);
  }

  switchMode(mode) {
    window.activeAppMode = mode;

    if (mode === 'factor') {
      this.btnTenkai.classList.remove('active');
      this.btnFactor.classList.add('active');
      this.viewTenkai.classList.remove('active');
      this.viewTenkai.classList.add('hidden');
      this.viewFactor.classList.remove('hidden');
      this.viewFactor.classList.add('active');

      document.title = '因数分解の変形チェック (8枚◯✕) | 式の展開・因数分解マスター';

      // 数式のスケーリングをジャストフィット
      if (window.factoringApp) {
        setTimeout(() => window.factoringApp.fitAllFormulas(), 50);
        setTimeout(() => window.factoringApp.fitAllFormulas(), 200);
      }
    } else {
      this.btnFactor.classList.remove('active');
      this.btnTenkai.classList.add('active');
      this.viewFactor.classList.remove('active');
      this.viewFactor.classList.add('hidden');
      this.viewTenkai.classList.remove('hidden');
      this.viewTenkai.classList.add('active');

      document.title = '展開の工夫 式変形4択クイズ | 連続10問合格チャレンジ';
    }

    // URLハッシュを更新 (履歴に残さずスムーズに)
    try {
      history.replaceState(null, '', `?mode=${mode}`);
    } catch (e) {}
  }

  toggleMode() {
    const nextMode = window.activeAppMode === 'factor' ? 'tenkai' : 'factor';
    this.switchMode(nextMode);
  }
}

// =========================================
// アプリケーション統合起動
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  window.quizApp = new QuizApp();
  window.factoringApp = new FactoringApp(window.quizApp);
  window.modeController = new ModeController();
});
