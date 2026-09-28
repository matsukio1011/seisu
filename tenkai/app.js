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
      } else if (key === 'F') {
        this.toggleFullscreen();
      } else if (key === 'T') {
        this.toggleTheme();
      } else if (key === 'S') {
        this.toggleSound();
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

// アプリケーション起動
document.addEventListener('DOMContentLoaded', () => {
  window.quizApp = new QuizApp();
});
