/**
 * 樹形図ビジュアライザー (Tree Diagram Lab)
 * 順列・場合の数の樹形図を動的描画・学習できるアプリ
 */

// じゃんけん勝敗判定ヘルパー
function evaluateJanken(path) {
  const uniqueHands = Array.from(new Set(path));
  if (uniqueHands.length === 1 || uniqueHands.length === 3) {
    return { isAiko: true, winners: [], label: "あいこ" };
  }
  let winningHand = "";
  if (uniqueHands.includes("✊") && uniqueHands.includes("✌️")) winningHand = "✊";
  else if (uniqueHands.includes("✌️") && uniqueHands.includes("✋")) winningHand = "✌️";
  else if (uniqueHands.includes("✋") && uniqueHands.includes("✊")) winningHand = "✋";

  const names = ["A君", "B君", "C君", "D君", "E君"];
  const winners = [];
  path.forEach((hand, idx) => {
    if (hand === winningHand) {
      winners.push(idx);
    }
  });

  const winnerNames = winners.map(idx => names[idx]).join("・");
  return {
    isAiko: false,
    winners,
    winningHand,
    label: `${winnerNames}の勝ち`
  };
}

// 順列計算ヘルパー P(n, r)
function perm(n, r) {
  if (r < 0 || r > n) return 0;
  let res = 1;
  for (let i = 0; i < r; i++) res *= (n - i);
  return res;
}

// 部分集合の表記フォーマットヘルパー
function formatSubset(path, elements) {
  const included = [];
  path.forEach((val, i) => {
    if (val === "○" && elements && elements[i]) {
      included.push(elements[i]);
    }
  });
  if (included.length === 0) return "∅";
  return `{${included.join(", ")}}`;
}

// ==========================================
// 辞書式配列問題のファクトリ関数
// ==========================================
function makeDictionaryProblem({ letters, targetWord }) {
  const sorted = [...letters].sort();
  const n = sorted.length;
  function fact(k) { let r = 1; for(let i=2; i<=k; i++) r*=i; return r; }
  const totalPerm = fact(n);

  let rank = 1;
  let remaining = [...sorted];
  const steps = [];

  for (let i = 0; i < n; i++) {
    const char = targetWord[i];
    const charIdx = remaining.indexOf(char);
    const blockSize = fact(remaining.length - 1);

    if (charIdx > 0) {
      for (let c = 0; c < charIdx; c++) {
        const skippedChar = remaining[c];
        const prefix = targetWord.slice(0, i) + skippedChar;
        const wildcard = "_ ".repeat(n - 1 - i).trim();
        const displayPattern = wildcard ? `${prefix} ${wildcard}` : prefix;
        steps.push({
          label: `${displayPattern}`,
          calc: `${blockSize}通り (${remaining.length - 1}!)`,
          val: `${blockSize}通り`
        });
        rank += blockSize;
      }
    }
    remaining.splice(charIdx, 1);
  }

  steps.push({
    label: `★ ${targetWord} (目的の単語)`,
    calc: `アルファベット順`,
    val: `第${rank}番目`
  });

  const formulaStr = `総数: ${n}! = ${totalPerm}通り / ${targetWord}: 第${rank}番目`;
  const columnLabels = Array.from({ length: n }, (_, i) => `${i + 1}文字目`);
  const slotCounts = Array.from({ length: n }, (_, i) => n - i);

  return {
    isDictionary: true,
    targetWord,
    targetRank: rank,
    totalPerm,
    title: `【辞書式配列】${sorted.join(", ")} を並べたとき「${targetWord}」は何番目？`,
    items: sorted,
    firstItems: sorted,
    defaultFirstChoice: (n >= 6 ? targetWord[0] : null),
    depth: n,
    allowRepeat: false,
    columnLabels,
    slotCounts,
    formula: formulaStr,
    sublines: steps,
    note: `アルファベット順(${sorted.join(",")})に配列したとき、${targetWord} は 第${rank}番目 になります（順列総数: ${totalPerm}通り）。`,
    filterCondition: (path) => path.join("") === targetWord,
    conditionLabel: `「${targetWord}」に一致 (第${rank}番目)`
  };
}

// ==========================================
// カード問題動的ファクトリ関数
// 最大カード (4, 5, 6) を自由に切り替え可能
// ==========================================
function makeCardProblem({
  baseTitle,
  hasZero,
  depth,
  conditionType = "none",
  defaultMax = 5,
  minMax = 4,
  maxMax = 6,
  columnLabelsGen = null
}) {
  return {
    isCardProblem: true,
    isDynamic: true,
    paramName: "最大カード",
    unit: "",
    minParam: minMax,
    maxParam: maxMax,
    defaultParam: defaultMax,
    currentParam: defaultMax,
    isRangeProblem: (conditionType === "range" || conditionType === "gte400" || conditionType === "gte3000"),
    generate: function(maxCard = defaultMax, rangeVal = 400, rangeDir = "gte") {
      // 使えるカード
      const items = [];
      if (hasZero) items.push("0");
      for (let i = 1; i <= maxCard; i++) items.push(String(i));

      const firstItems = hasZero ? items.filter(x => x !== "0") : items;
      const cardTotal = items.length;
      const actualDepth = Math.min(depth, cardTotal);

      // 桁ラベル
      let columnLabels = [];
      if (columnLabelsGen) {
        columnLabels = columnLabelsGen(actualDepth, maxCard);
      } else {
        const standardLabels = ["十万の位", "万の位", "千の位", "百の位", "十の位", "一の位"];
        columnLabels = standardLabels.slice(standardLabels.length - actualDepth);
      }

      const cardRangeStr = hasZero ? `0〜${maxCard}` : `1〜${maxCard}`;
      let title = `【${cardRangeStr}】${baseTitle} (${actualDepth}けた)`;
      let filterCondition = () => true;
      let conditionLabel = "すべて";
      let slotCounts = [];
      let formulaStr = "";
      let sublines = null;
      let noteStr = "";

      // 条件別の計算
      if (conditionType === "none") {
        if (!hasZero) {
          slotCounts = Array.from({ length: actualDepth }, (_, i) => maxCard - i);
          const total = slotCounts.reduce((a, b) => a * b, 1);
          formulaStr = `${slotCounts.join(" × ")} = ${total}通り`;
          noteStr = `使えるカードは ${cardRangeStr}（計${cardTotal}枚）。各桁を順に掛けていきます。`;
          filterCondition = () => true;
          conditionLabel = "すべて";
        } else {
          // 0あり
          slotCounts = Array.from({ length: actualDepth }, (_, i) => (i === 0 ? maxCard : cardTotal - i));
          const total = slotCounts.reduce((a, b) => a * b, 1);
          formulaStr = `${slotCounts.join(" × ")} = ${total}通り`;
          noteStr = `最高位は0を除く${maxCard}通り × 2桁目以降は0を含む残りカードの順列 ＝ ${total}通り`;
          filterCondition = (path) => path[0] !== "0";
          conditionLabel = "最高位≠0";
        }
      } else if (conditionType === "even") {
        const nonZeroEvens = [];
        for (let i = 2; i <= maxCard; i += 2) nonZeroEvens.push(String(i));

        if (!hasZero) {
          // 0なし偶数
          const numEvens = nonZeroEvens.length; // 2, 4,...
          const innerPerm = perm(cardTotal - 1, actualDepth - 1);
          const total = innerPerm * numEvens;
          formulaStr = `${cardTotal - 1} × ... × ${numEvens} = ${total}通り`;
          slotCounts = Array.from({ length: actualDepth - 1 }, (_, i) => cardTotal - 1 - i);
          slotCounts.push(numEvens);
          noteStr = `一の位が偶数(${nonZeroEvens.join(", ")})の${numEvens}通り × 残りの桁の順列(${innerPerm}通り) ＝ ${total}通り`;
          filterCondition = (path) => parseInt(path[path.length - 1], 10) % 2 === 0;
          conditionLabel = `一の位が偶数 (${nonZeroEvens.join(",")})`;
        } else {
          // 0あり偶数（場合分け）
          const numNonZeroEvens = nonZeroEvens.length;
          // 1. 一の位が0のとき
          const s0 = perm(maxCard, actualDepth - 1); // 0を除いたmaxCard枚から(actualDepth-1)枚
          // 2. 一の位が0以外の偶数のとき
          const sOther = (maxCard - 1) * perm(cardTotal - 2, actualDepth - 2) * numNonZeroEvens;
          const total = s0 + sOther;

          formulaStr = `${sOther} + ${s0} = ${total}通り`;
          sublines = [
            { label: `一の位が偶数(${nonZeroEvens.join(",")})のとき`, calc: `${maxCard - 1} × ... × ${numNonZeroEvens}`, val: `${sOther}通り` },
            { label: `一の位が 0 のとき`, calc: `${maxCard} × ... × 1`, val: `${s0}通り` }
          ];
          slotCounts = Array.from({ length: actualDepth }, () => "各場合");
          noteStr = `一の位が0以外の場合は最高位に0が来られないため場合分けして計算します：${sOther} + ${s0} ＝ ${total}通り`;
          filterCondition = (path) => {
            if (path[0] === "0") return false;
            return parseInt(path[path.length - 1], 10) % 2 === 0;
          };
          conditionLabel = `一の位が偶数 (0, ${nonZeroEvens.join(",")})`;
        }
      } else if (conditionType === "odd_ends") {
        const odds = [];
        for (let i = 1; i <= maxCard; i += 2) odds.push(String(i));
        const numOdds = odds.length;

        const innerPerm = perm(cardTotal - 2, actualDepth - 2);
        const total = numOdds * (numOdds - 1) * innerPerm;

        formulaStr = `${numOdds} × ${innerPerm > 0 ? innerPerm + ' × ' : ''}${numOdds - 1} = ${total}通り`;
        slotCounts = [numOdds];
        for (let i = 0; i < actualDepth - 2; i++) {
          slotCounts.push(cardTotal - 2 - i);
        }
        slotCounts.push(numOdds - 1);

        noteStr = `両端が奇数(${odds.join(",")})の ${numOdds}×${numOdds - 1}通り × 間の桁の順列(${innerPerm}通り) ＝ ${total}通り`;
        filterCondition = (path) => {
          if (hasZero && path[0] === "0") return false;
          return parseInt(path[0], 10) % 2 !== 0 && parseInt(path[path.length - 1], 10) % 2 !== 0;
        };
        conditionLabel = `両端が奇数 (${odds.join(",")})`;
      } else if (conditionType === "even_ends") {
        const nonZeroEvens = [];
        for (let i = 2; i <= maxCard; i += 2) nonZeroEvens.push(String(i));
        const numEvens = nonZeroEvens.length;

        if (!hasZero) {
          const innerPerm = perm(cardTotal - 2, actualDepth - 2);
          const total = numEvens * (numEvens - 1) * innerPerm;
          formulaStr = `${numEvens} × ${innerPerm > 0 ? innerPerm + ' × ' : ''}${numEvens - 1} = ${total}通り`;
          slotCounts = [numEvens];
          for (let i = 0; i < actualDepth - 2; i++) slotCounts.push(cardTotal - 2 - i);
          slotCounts.push(numEvens - 1);
          noteStr = `両端が偶数(${nonZeroEvens.join(",")})の ${numEvens}×${numEvens - 1}通り × 間の桁(${innerPerm}通り) ＝ ${total}通り`;
          filterCondition = (path) => parseInt(path[0], 10) % 2 === 0 && parseInt(path[path.length - 1], 10) % 2 === 0;
          conditionLabel = `両端が偶数 (${nonZeroEvens.join(",")})`;
        } else {
          // 0あり両端偶数（場合分け）
          const innerPerm = perm(cardTotal - 2, actualDepth - 2);
          // 1. 末尾が0のとき: 先頭は非ゼロ偶数numEvens通り
          const s0 = numEvens * innerPerm * 1;
          // 2. 末尾が非ゼロ偶数のとき: 先頭は残り非ゼロ偶数(numEvens-1)通り
          const sOther = (numEvens - 1) * innerPerm * numEvens;
          const total = s0 + sOther;

          formulaStr = `${s0} + ${sOther} = ${total}通り`;
          sublines = [
            { label: `一の位が 0 のとき (先頭は偶数${nonZeroEvens.join(",")})`, calc: `${numEvens} × ${innerPerm} × 1`, val: `${s0}通り` },
            { label: `両端が 0 以外の偶数(${nonZeroEvens.join(",")})のとき`, calc: `${numEvens - 1} × ${innerPerm} × ${numEvens}`, val: `${sOther}通り` }
          ];
          slotCounts = Array.from({ length: actualDepth }, () => "各場合");
          noteStr = `偶数は 0 と ${nonZeroEvens.join(",")}。最高位に0は使えないため場合分けして計算します：合計 ${total}通り`;
          filterCondition = (path) => {
            if (path[0] === "0") return false;
            return parseInt(path[0], 10) % 2 === 0 && parseInt(path[path.length - 1], 10) % 2 === 0;
          };
          conditionLabel = `両端が偶数 (0, ${nonZeroEvens.join(",")})`;
        }
      } else if (conditionType === "range" || conditionType === "gte400" || conditionType === "gte3000") {
        const isGte = (rangeDir === "gte");
        const dirStr = isGte ? "以上" : "以下";

        // 最高位ごとの内訳を動的集計
        const byTop = {};
        const collectDfs = (currPath) => {
          if (currPath.length === actualDepth) {
            const num = parseInt(currPath.join(""), 10);
            const match = isGte ? (num >= rangeVal) : (num <= rangeVal);
            if (match) {
              byTop[currPath[0]] = (byTop[currPath[0]] || 0) + 1;
            }
            return;
          }
          for (const it of items) {
            if (currPath.length === 0 && hasZero && it === "0") continue;
            if (!currPath.includes(it)) {
              collectDfs([...currPath, it]);
            }
          }
        };
        collectDfs([]);

        const topKeys = Object.keys(byTop).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
        const total = topKeys.reduce((sum, k) => sum + byTop[k], 0);
        const allCounts = topKeys.map(k => byTop[k]);
        const innerPerm = perm(cardTotal - 1, actualDepth - 1);
        const isPureMultiply = allCounts.length > 0 && allCounts.every(c => c === innerPerm);

        const firstColName = (columnLabels && columnLabels[0]) ? columnLabels[0].replace(/\(.*\)/, '').trim() : "最高位";

        if (isPureMultiply) {
          formulaStr = `${topKeys.length} × ${innerPerm} = ${total}通り`;
          slotCounts = [topKeys.length];
          for (let i = 0; i < actualDepth - 1; i++) slotCounts.push(cardTotal - 1 - i);
          noteStr = `${firstColName}は ${topKeys.join(",")} の${topKeys.length}通り × 残りの桁(${innerPerm}通り) ＝ ${total}通り`;
        } else {
          sublines = topKeys.map(k => ({
            label: `${firstColName}が【${k}】のとき`,
            calc: byTop[k] === innerPerm ? `${firstColName}${k}の全通り` : `${rangeVal}${dirStr}を満たす枝`,
            val: `${byTop[k]}通り`
          }));
          formulaStr = total > 0 ? `${allCounts.join(" + ")} = ${total}通り` : "0通り";
          slotCounts = Array.from({ length: actualDepth }, () => "各場合");
          noteStr = `設定値 ${rangeVal}${dirStr} を満たす数を${firstColName}ごとに場合分けして計算します：合計 ${total}通り`;
        }

        filterCondition = (path) => {
          if (hasZero && path[0] === "0") return false;
          const num = parseInt(path.join(""), 10);
          return isGte ? num >= rangeVal : num <= rangeVal;
        };
        conditionLabel = `${rangeVal}${dirStr}`;
      }

      return {
        title,
        items,
        firstItems,
        depth: actualDepth,
        allowRepeat: false,
        columnLabels,
        slotCounts,
        formula: formulaStr,
        sublines,
        note: noteStr,
        filterCondition,
        conditionLabel
      };
    }
  };
}

// プリセット問題データ
const PROBLEMS = {
  // ==========================================
  // 【手書きメモ】カード問題 (最大4, 5, 6から選択可能)
  // ==========================================
  cards15_3digit: makeCardProblem({
    baseTitle: "3けたの数を作る",
    hasZero: false,
    depth: 3,
    conditionType: "none",
    defaultMax: 5
  }),
  cards15_3digit_even: makeCardProblem({
    baseTitle: "3けたの「偶数」を作る",
    hasZero: false,
    depth: 3,
    conditionType: "even",
    defaultMax: 5
  }),
  cards15_4digit_odd_ends: makeCardProblem({
    baseTitle: "「両端が奇数」の4けたの数を作る",
    hasZero: false,
    depth: 4,
    conditionType: "odd_ends",
    defaultMax: 5
  }),
  cards15_4digit_even_ends: makeCardProblem({
    baseTitle: "「両端が偶数」の4けたの数を作る",
    hasZero: false,
    depth: 4,
    conditionType: "even_ends",
    defaultMax: 5
  }),
  cards05_3digit: makeCardProblem({
    baseTitle: "3けたの数を作る (0あり)",
    hasZero: true,
    depth: 3,
    conditionType: "none",
    defaultMax: 5
  }),
  cards05_3digit_even: makeCardProblem({
    baseTitle: "3けたの「偶数」を作る (0あり)",
    hasZero: true,
    depth: 3,
    conditionType: "even",
    defaultMax: 5
  }),
  cards05_4digit_odd_ends: makeCardProblem({
    baseTitle: "「両端が奇数」の4けたの数を作る (0あり)",
    hasZero: true,
    depth: 4,
    conditionType: "odd_ends",
    defaultMax: 5
  }),
  cards05_4digit_even_ends: makeCardProblem({
    baseTitle: "「両端が偶数」の4けたの数を作る (0あり)",
    hasZero: true,
    depth: 4,
    conditionType: "even_ends",
    defaultMax: 5
  }),

  // ==========================================
  // 【問題 28】カード 0〜max (初期値 max=4)
  // ==========================================
  prob28_1_3digit: makeCardProblem({
    baseTitle: "3桁の整数",
    hasZero: true,
    depth: 3,
    conditionType: "none",
    defaultMax: 4
  }),
  prob28_2_odd_ends_3digit: makeCardProblem({
    baseTitle: "3桁で「両端が奇数」の整数",
    hasZero: true,
    depth: 3,
    conditionType: "odd_ends",
    defaultMax: 4
  }),
  prob28_3_odd_ends_5digit: makeCardProblem({
    baseTitle: "「両端が奇数」の5桁の整数",
    hasZero: true,
    depth: 5,
    conditionType: "odd_ends",
    defaultMax: 4,
    minMax: 4 // 0〜4で5枚あるので4から可能
  }),

  // ==========================================
  // 【数字・範囲の指定】 (何以上・何以下を選択可能)
  // ==========================================
  prob_range_3digit: makeCardProblem({
    baseTitle: "3桁の範囲指定 (何以上・何以下)",
    hasZero: true,
    depth: 3,
    conditionType: "range",
    defaultMax: 5
  }),
  prob_range_4digit: makeCardProblem({
    baseTitle: "4桁の範囲指定 (何以上・何以下)",
    hasZero: true,
    depth: 4,
    conditionType: "range",
    defaultMax: 5
  }),
  prob_3digit_gte400: makeCardProblem({
    baseTitle: "3桁の範囲指定",
    hasZero: true,
    depth: 3,
    conditionType: "range",
    defaultMax: 5
  }),
  prob29_1_4digit: makeCardProblem({
    baseTitle: "4桁の整数",
    hasZero: true,
    depth: 4,
    conditionType: "none",
    defaultMax: 5
  }),
  prob29_2_gte3000: makeCardProblem({
    baseTitle: "4桁の範囲指定",
    hasZero: true,
    depth: 4,
    conditionType: "range",
    defaultMax: 5
  }),
  prob29_5_6digit: makeCardProblem({
    baseTitle: "すべてのカードを並べる整数 (6桁など)",
    hasZero: true,
    depth: 6,
    conditionType: "none",
    defaultMax: 5,
    minMax: 5 // 0〜5で6枚必要なので最小5
  }),
  prob29_6_even_ends_6digit: makeCardProblem({
    baseTitle: "「両端が偶数」の6桁の整数",
    hasZero: true,
    depth: 6,
    conditionType: "even_ends",
    defaultMax: 5,
    minMax: 5
  }),

  // ==========================================
  // 【辞書式配列】4文字 (総数24通り)
  // ==========================================
  dict_math: makeDictionaryProblem({
    letters: ["A", "H", "M", "T"],
    targetWord: "MATH"
  }),
  dict_star: makeDictionaryProblem({
    letters: ["A", "R", "S", "T"],
    targetWord: "STAR"
  }),
  dict_blue: makeDictionaryProblem({
    letters: ["B", "E", "L", "U"],
    targetWord: "BLUE"
  }),

  // ==========================================
  // 【辞書式配列】5文字 (総数120通り)
  // ==========================================
  dict_smile: makeDictionaryProblem({
    letters: ["E", "I", "L", "M", "S"],
    targetWord: "SMILE"
  }),
  dict_cloud: makeDictionaryProblem({
    letters: ["C", "D", "L", "O", "U"],
    targetWord: "CLOUD"
  }),
  dict_train: makeDictionaryProblem({
    letters: ["A", "I", "N", "R", "T"],
    targetWord: "TRAIN"
  }),

  // ==========================================
  // 【辞書式配列】6・7文字 (720〜5040通り)
  // ==========================================
  dict_dragon: makeDictionaryProblem({
    letters: ["A", "D", "G", "N", "O", "R"],
    targetWord: "DRAGON"
  }),
  dict_orange: makeDictionaryProblem({
    letters: ["A", "E", "G", "N", "O", "R"],
    targetWord: "ORANGE"
  }),
  dict_pencil: makeDictionaryProblem({
    letters: ["C", "E", "I", "L", "N", "P"],
    targetWord: "PENCIL"
  }),
  dict_planet: makeDictionaryProblem({
    letters: ["A", "E", "L", "N", "P", "T"],
    targetWord: "PLANET"
  }),
  dict_english: makeDictionaryProblem({
    letters: ["E", "G", "H", "I", "L", "N", "S"],
    targetWord: "ENGLISH"
  }),

  // ==========================================
  // 基本・発展問題
  // ==========================================
  cards_2digit: makeCardProblem({
    baseTitle: "2けたの数を作る",
    hasZero: false,
    depth: 2,
    conditionType: "none",
    defaultMax: 4
  }),
  // ==========================================
  // 【集合】部分集合の個数 (手書きメモ)
  // ==========================================
  subset_problem: {
    isDynamic: true,
    isSubset: true,
    paramName: "要素数",
    unit: "個",
    minParam: 2,
    maxParam: 5,
    defaultParam: 3,
    currentParam: 3,
    generate: function(elemCount = 3) {
      const allElems = ["a", "b", "c", "d", "e"].slice(0, elemCount);
      const labels = allElems.map(el => `要素 ${el}`);
      const counts = Array.from({ length: elemCount }, () => 2);
      const total = Math.pow(2, elemCount);
      const formulaStr = `${counts.join(" × ")} = 2^${elemCount} = ${total}個`;

      // 樹形図の上から順（辞書順：○○○から×××まで）にできる部分集合の一覧
      const subsetList = [];
      function collectSubsets(idx, currentPath) {
        if (idx === elemCount) {
          subsetList.push(formatSubset(currentPath, allElems));
          return;
        }
        collectSubsets(idx + 1, [...currentPath, "○"]);
        collectSubsets(idx + 1, [...currentPath, "×"]);
      }
      collectSubsets(0, []);

      // 手書きメモ風の内訳表示（sublines）
      const sublines = [
        { label: `全部分集合 (${total}個)`, calc: `手書きメモの一覧`, val: subsetList.join(", ") }
      ];

      return {
        title: `{${allElems.join(", ")}} の部分集合の個数`,
        items: ["○", "×"],
        firstItems: ["○", "×"],
        depth: elemCount,
        allowRepeat: true,
        columnLabels: labels,
        slotCounts: counts,
        formula: formulaStr,
        sublines: sublines,
        note: `各要素(${allElems.join(",")})について「部分集合に入る(○)」か「入らない(×)」かの2通りずつ枝分かれします（2の${elemCount}乗 ＝ ${total}個）。`,
        filterCondition: () => true,
        conditionLabel: "すべて",
        isSubset: true,
        subsetElements: allElems
      };
    }
  },
  // ==========================================
  // 【教科書の定番問題】
  // ==========================================
  // [1] 先に2勝で優勝（Aチーム vs Bチーム）
  match_game: {
    title: "先に2勝した方が優勝（Aチーム vs Bチーム）",
    items: ["A", "B"],
    firstItems: ["A", "B"],
    depth: 3,
    allowRepeat: true,
    columnLabels: ["第1試合", "第2試合", "第3試合"],
    slotCounts: ["2", "2", "2(一部)"],
    formula: "3 ＋ 3 ＝ 6通り",
    sublines: [
      { label: "Aチーム優勝 (3通り)", calc: "AA(2試合), ABA(3試合), BAA(3試合)", val: "3通り" },
      { label: "Bチーム優勝 (3通り)", calc: "BB(2試合), BAB(3試合), ABB(3試合)", val: "3通り" }
    ],
    note: "どちらかが先に2勝した時点で試合終了となるため、AAやBBは第2試合で終了します。勝敗の決まり方は全部で6通りです。",
    isTerminal: (path) => {
      const a = path.filter(x => x === "A").length;
      const b = path.filter(x => x === "B").length;
      return a >= 2 || b >= 2;
    },
    filterCondition: () => true,
    conditionLabel: "すべて",
    isMatchGame: true
  },

  // [2] プレゼント交換（完全順列・攪乱順列）
  present_exchange: {
    isDynamic: true,
    paramName: "人数",
    unit: "人",
    minParam: 3,
    maxParam: 6,
    defaultParam: 4,
    currentParam: 4,
    generate: function(n = 4) {
      const allStudents = ["A", "B", "C", "D", "E", "F"].slice(0, n);
      const allPresents = ["a", "b", "c", "d", "e", "f"].slice(0, n);
      const firstChoices = allPresents.slice(1); // A cannot receive 'a'

      // 事前に全解を求めて統計とサブ行を作成
      const validDerangements = [];
      function solve(depth, path, used) {
        if (depth === n) {
          validDerangements.push(path);
          return;
        }
        allPresents.forEach(p => {
          if (!used.includes(p) && p !== allPresents[depth]) {
            solve(depth + 1, [...path, p], [...used, p]);
          }
        });
      }
      solve(0, [], []);

      const total = validDerangements.length;
      const perBranch = total / (n - 1);

      const sublines = firstChoices.map(p => {
        const matches = validDerangements.filter(r => r[0] === p);
        const example = matches.length <= 3
          ? matches.map(r => `(${r.join(",")})`).join(", ")
          : `${matches.slice(0, 2).map(r => `(${r.join(",")})`).join(", ")} など`;
        return {
          label: `A君が「${p}」をもらうとき`,
          calc: example,
          val: `${perBranch}通り`
        };
      });

      const colLabels = allStudents.map(s => `${s}君のもらう物`);
      const slotCounts = [n - 1, ...Array.from({ length: n - 1 }, () => "—")];

      return {
        title: `プレゼント交換（${n}人・完全順列）`,
        items: allPresents,
        firstItems: firstChoices,
        depth: n,
        allowRepeat: false,
        columnLabels: colLabels,
        slotCounts: slotCounts,
        formula: `${perBranch}通り × ${n - 1} ＝ ${total}通り`,
        sublines: sublines,
        note: `${n}人全員が自分の持ってきた物以外のプレゼントをもらう配り方（完全順列・攪乱順列）です。A君がbをもらう場合が${perBranch}通りあり、他のプレゼントをもらう場合も同様に対称なため ${perBranch}通り × ${n - 1} ＝ ${total}通り となります。`,
        getNextItems: (depth, path, used) => {
          return allPresents.filter(p => !used.includes(p) && p !== allPresents[depth]);
        },
        filterCondition: () => true,
        conditionLabel: "すべて",
        isPresentExchange: true
      };
    }
  },

  // [3] 隣り合わない3桁の整数（1, 2, 3）
  no_adjacent_digit: {
    title: "同じ数字が隣り合わない3桁の整数（1, 2, 3）",
    items: ["1", "2", "3"],
    firstItems: ["1", "2", "3"],
    depth: 3,
    allowRepeat: true,
    columnLabels: ["百の位", "十の位", "一の位"],
    slotCounts: [3, 2, 2],
    formula: "3 × 2 × 2 ＝ 12個",
    sublines: [
      { label: "百の位が 1 のとき (4個)", calc: "121, 123, 131, 132", val: "4個" },
      { label: "百の位が 2 のとき (4個)", calc: "212, 213, 231, 232", val: "4個" },
      { label: "百の位が 3 のとき (4個)", calc: "312, 313, 321, 323", val: "4個" }
    ],
    note: "百の位は1, 2, 3の3通り。十の位は百の位以外の2通り。一の位は十の位以外の2通り（百の位と同じ数字は使えます）。積の法則より 3 × 2 × 2 ＝ 12個 です。",
    getNextItems: (depth, path) => {
      const digits = ["1", "2", "3"];
      if (path.length === 0) return digits;
      const last = path[path.length - 1];
      return digits.filter(d => d !== last);
    },
    filterCondition: () => true,
    conditionLabel: "すべて",
    isNoAdjacentDigit: true
  },

  // [4] コインと数直線の移動（3回投げて座標が1）
  coin_walk: {
    title: "コインと数直線の移動（3回投げて座標が1）",
    items: ["表", "裏"],
    firstItems: ["表", "裏"],
    depth: 3,
    allowRepeat: true,
    columnLabels: ["1回目 (+1/-1)", "2回目 (+1/-1)", "3回目 (+1/-1)"],
    slotCounts: [2, 2, 2],
    formula: "全体: 2^3 = 8通り ／ 座標が1: 3通り",
    sublines: [
      { label: "表・表・裏", calc: "+1 + 1 - 1 = +1", val: "座標 1 ★" },
      { label: "表・裏・表", calc: "+1 - 1 + 1 = +1", val: "座標 1 ★" },
      { label: "裏・表・表", calc: "-1 + 1 + 1 = +1", val: "座標 1 ★" },
      { label: "その他の出方 (5通り)", calc: "座標 +3: 1通り, 座標 -1: 3通り, 座標 -3: 1通り", val: "条件外" }
    ],
    note: "原点0から表で+1、裏で-1進みます。3回投げて座標が1になるには「表が2回・裏が1回」出る必要があります（全体8通り中3通り）。",
    filterCondition: (path) => {
      const pos = path.reduce((sum, v) => sum + (v === "表" ? 1 : -1), 0);
      return pos === 1;
    },
    conditionLabel: "最終座標が 1",
    isCoinWalk: true
  },

  // [5] 赤玉2個・白玉1個の取り出し（色が異なる）
  ball_draw: {
    title: "赤玉2個・白玉1個の取り出し（色が異なる）",
    items: ["赤1", "赤2", "白"],
    firstItems: ["赤1", "赤2", "白"],
    depth: 2,
    allowRepeat: false,
    columnLabels: ["1回目", "2回目"],
    slotCounts: [3, 2],
    formula: "全体: 3 × 2 = 6通り ／ 異色: 4通り",
    sublines: [
      { label: "1回目が 赤1 のとき", calc: "赤1→白 (異色 ○), 赤1→赤2 (同色 ×)", val: "1通り" },
      { label: "1回目が 赤2 のとき", calc: "赤2→白 (異色 ○), 赤2→赤1 (同色 ×)", val: "1通り" },
      { label: "1回目が 白 のとき", calc: "白→赤1 (異色 ○), 白→赤2 (異色 ○)", val: "2通り" }
    ],
    note: "赤玉2個を「赤1」「赤2」と区別して樹形図を書くのが鉄則です。全体6通り中、色が異なる取り出し方は 1 + 1 + 2 = 4通り です。",
    filterCondition: (path) => {
      const c1 = path[0].startsWith("赤") ? "赤" : "白";
      const c2 = path[1] ? (path[1].startsWith("赤") ? "赤" : "白") : "";
      return c1 !== c2;
    },
    conditionLabel: "色が異なる (赤と白)",
    isBallDraw: true
  },
  coin: {
    isDynamic: true,
    paramName: "回数",
    unit: "回",
    minParam: 1,
    maxParam: 5,
    defaultParam: 3,
    currentParam: 3,
    generate: function(times = 3) {
      const labels = Array.from({ length: times }, (_, i) => `${i + 1}回目`);
      const counts = Array.from({ length: times }, () => 2);
      const total = Math.pow(2, times);
      const formulaStr = `${counts.join(" × ")} = ${total}通り`;
      return {
        title: `コインを${times}回投げる（表・裏）`,
        items: ["表", "裏"],
        firstItems: ["表", "裏"],
        depth: times,
        allowRepeat: true,
        columnLabels: labels,
        slotCounts: counts,
        formula: formulaStr,
        note: `1回ごとに「表・裏」の2通りずつ枝分かれします（2の${times}乗 = ${total}通り）`,
        filterCondition: () => true,
        conditionLabel: "すべて"
      };
    }
  },
  janken: {
    isDynamic: true,
    paramName: "人数",
    unit: "人",
    minParam: 2,
    maxParam: 5,
    defaultParam: 3,
    currentParam: 3,
    currentWinnerFilter: "all",
    generate: function(people = 3, winnerFilter = "all") {
      const names = ["A君", "B君", "C君", "D君", "E君"];
      const labels = Array.from({ length: people }, (_, i) => names[i]);
      const counts = Array.from({ length: people }, () => 3);
      const total = Math.pow(3, people);

      let condLabel = "すべて";
      if (winnerFilter === "aiko") condLabel = "あいこ";
      else if (winnerFilter === "solo_0") condLabel = "A君の1人勝ち";
      else if (winnerFilter !== "all") {
        const idx = parseInt(winnerFilter, 10);
        condLabel = `${names[idx]}が勝つ`;
      }

      const filterCondition = (path) => {
        if (winnerFilter === "all") return true;
        const res = evaluateJanken(path);
        if (winnerFilter === "aiko") return res.isAiko;
        if (winnerFilter === "solo_0") {
          return !res.isAiko && res.winners.length === 1 && res.winners[0] === 0;
        }
        const targetIdx = parseInt(winnerFilter, 10);
        return !res.isAiko && res.winners.includes(targetIdx);
      };

      const formulaStr = `${counts.join(" × ")} = ${total}通り`;

      return {
        title: `${people}人でじゃんけん（グー・チョキ・パー）`,
        items: ["✊", "✌️", "✋"],
        firstItems: ["✊", "✌️", "✋"],
        depth: people,
        allowRepeat: true,
        columnLabels: labels,
        slotCounts: counts,
        formula: formulaStr,
        note: `1人あたり「✊・✌️・✋」の3通りずつ枝分かれします（3の${people}乗 = ${total}通り）`,
        filterCondition: filterCondition,
        conditionLabel: condLabel,
        isJanken: true
      };
    }
  }
};

class TreeVisualizer {
  constructor() {
    this.currentProblemKey = "cards15_3digit";
    this.currentProblem = null;

    // SVG & Viewport状態
    this.svg = document.getElementById("tree-svg");
    this.viewportGroup = document.getElementById("viewport-group");
    this.edgesLayer = document.getElementById("edges-layer");
    this.nodesLayer = document.getElementById("nodes-layer");
    this.labelsLayer = document.getElementById("labels-layer");
    this.svgContainer = document.getElementById("svg-container");

    // パン＆ズーム変換パラメータ
    this.transform = {
      x: 60,
      y: 40,
      scale: 1.0
    };
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };

    // ツリーデータ
    this.rootNode = null;
    this.allNodes = [];
    this.allEdges = [];
    this.leafNodes = [];

    // アニメーション・描画状態
    this.animTimer = null;
    this.animIndex = 0;
    this.animQueue = [];
    this.isPlaying = false;
    this.speed = 150;

    // フィルタ状態
    this.firstBranchFilter = "all";
    this.lastBranchFilter = "all";
    this.jankenWinnerFilter = "all";
    this.onlyMatchesFilter = false;

    // 範囲指定（何以上・何以下）の状態
    this.rangeTargetVal = 400;
    this.rangeDirection = "gte"; // "gte" (以上) or "lte" (以下)

    this.initDOM();
    this.bindEvents();
    this.loadProblem(this.currentProblemKey);
  }

  initDOM() {
    this.dom = {
      problemSelect: document.getElementById("problem-select"),
      qTitle: document.getElementById("q-title"),
      qDesc: document.getElementById("q-desc"),
      slotsContainer: document.getElementById("slots-container"),
      formulaText: document.getElementById("formula-text"),
      formulaNote: document.getElementById("formula-note"),
      filterFirstBranch: document.getElementById("filter-first-branch"),
      filterLastBranch: document.getElementById("filter-last-branch"),
      checkOnlyMatches: document.getElementById("check-only-matches"),
      btnDrawAll: document.getElementById("btn-draw-all"),
      btnPlayStep: document.getElementById("btn-play-step"),
      playBtnIcon: document.getElementById("play-btn-icon"),
      playBtnText: document.getElementById("play-btn-text"),
      btnClearTree: document.getElementById("btn-clear-tree"),
      stepSpeed: document.getElementById("step-speed"),
      speedDisplay: document.getElementById("speed-display"),
      statDisplayedCount: document.getElementById("stat-displayed-count"),
      statTotalCount: document.getElementById("stat-total-count"),
      zoomLevel: document.getElementById("zoom-level"),
      btnZoomIn: document.getElementById("btn-zoom-in"),
      btnZoomOut: document.getElementById("btn-zoom-out"),
      btnZoomReset: document.getElementById("btn-zoom-reset"),
      btnCanvasFit: document.getElementById("btn-canvas-fit"),
      btnToggleFit: document.getElementById("btn-toggle-fit"),
      btnFullscreen: document.getElementById("btn-fullscreen"),
      btnThemeToggle: document.getElementById("btn-theme-toggle"),
      themeText: document.getElementById("theme-text"),
      iconSun: document.getElementById("icon-sun"),
      iconMoon: document.getElementById("icon-moon"),
      iconEnterFs: document.getElementById("icon-enter-fullscreen"),
      iconExitFs: document.getElementById("icon-exit-fullscreen"),
      fsText: document.getElementById("fs-text"),
      currentPathVal: document.getElementById("current-path-val"),
      // 最高位セレクター＆インサイト
      firstDigitBar: document.getElementById("first-digit-bar"),
      firstDigitLabel: document.getElementById("first-digit-label"),
      digitChips: document.getElementById("digit-chips"),
      // 一の位セレクター
      lastDigitBar: document.getElementById("last-digit-bar"),
      lastDigitLabel: document.getElementById("last-digit-label"),
      lastDigitChips: document.getElementById("last-digit-chips"),
      insightContent: document.getElementById("insight-content"),
      // コイン・じゃんけん・カードパラメータ変更
      subParamContainer: document.getElementById("sub-param-container"),
      subParamLabel: document.getElementById("sub-param-label"),
      subParamChips: document.getElementById("sub-param-chips"),
      // じゃんけん勝者セレクター
      jankenWinnerContainer: document.getElementById("janken-winner-container"),
      jankenWinnerChips: document.getElementById("janken-winner-chips"),
      // 範囲指定セレクター
      rangeParamContainer: document.getElementById("range-param-container"),
      rangeNumInput: document.getElementById("range-num-input"),
      rangeValueChips: document.getElementById("range-value-chips"),
      rangeDirectionChips: document.getElementById("range-direction-chips"),
      // モーダル
      customModal: document.getElementById("custom-modal"),
      modalClose: document.getElementById("modal-close"),
      customCancel: document.getElementById("custom-cancel"),
      customApply: document.getElementById("custom-apply"),
      customTitle: document.getElementById("custom-title"),
      customItems: document.getElementById("custom-items"),
      customDepth: document.getElementById("custom-depth"),
      customAllowRepeat: document.getElementById("custom-allow-repeat")
    };
  }

  bindEvents() {
    this.dom.problemSelect.addEventListener("change", (e) => {
      const val = e.target.value;
      if (val === "custom") {
        this.openCustomModal();
      } else {
        this.loadProblem(val);
      }
    });

    this.dom.filterFirstBranch.addEventListener("change", (e) => {
      this.selectFirstBranch(e.target.value);
    });

    this.dom.filterLastBranch.addEventListener("change", (e) => {
      this.selectLastBranch(e.target.value);
    });

    this.dom.checkOnlyMatches.addEventListener("change", (e) => {
      this.onlyMatchesFilter = e.target.checked;
      this.render();
      this.fitToScreen();
    });

    this.dom.btnDrawAll.addEventListener("click", () => {
      this.stopAnimation();
      this.showAllInstantly();
    });

    this.dom.btnPlayStep.addEventListener("click", () => {
      if (this.isPlaying) {
        this.pauseAnimation();
      } else {
        this.startAnimation();
      }
    });

    this.dom.btnClearTree.addEventListener("click", () => {
      this.stopAnimation();
      this.clearSvg();
      this.updateStats(0, this.leafNodes.length);
    });

    this.dom.stepSpeed.addEventListener("input", (e) => {
      this.speed = parseInt(e.target.value, 10);
      const text = this.speed < 80 ? "高速" : this.speed > 300 ? "低速" : "中速";
      this.dom.speedDisplay.textContent = text;
      if (this.isPlaying) {
        this.restartInterval();
      }
    });

    this.svgContainer.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      this.isDragging = true;
      this.dragStart = { x: e.clientX - this.transform.x, y: e.clientY - this.transform.y };
      this.svgContainer.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      this.transform.x = e.clientX - this.dragStart.x;
      this.transform.y = e.clientY - this.dragStart.y;
      this.applyTransform();
    });

    window.addEventListener("mouseup", () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.svgContainer.style.cursor = "grab";
      }
    });

    this.svgContainer.addEventListener("wheel", (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      this.zoomAtPoint(e.clientX, e.clientY, zoomFactor);
    }, { passive: false });

    this.dom.btnZoomIn.addEventListener("click", () => this.zoomCenter(1.2));
    this.dom.btnZoomOut.addEventListener("click", () => this.zoomCenter(0.8));
    this.dom.btnZoomReset.addEventListener("click", () => {
      this.transform.scale = 1.0;
      this.applyTransform();
    });
    this.dom.btnCanvasFit.addEventListener("click", () => this.fitToScreen());
    this.dom.btnToggleFit.addEventListener("click", () => this.fitToScreen());

    this.dom.btnFullscreen.addEventListener("click", () => this.toggleFullscreen());
    document.addEventListener("fullscreenchange", () => this.updateFullscreenUI());

    this.dom.btnThemeToggle.addEventListener("click", () => this.toggleTheme());

    this.dom.modalClose.addEventListener("click", () => this.closeCustomModal());
    this.dom.customCancel.addEventListener("click", () => this.closeCustomModal());
    this.dom.customApply.addEventListener("click", () => this.applyCustomProblem());

    window.addEventListener("keydown", (e) => {
      if (e.key === "f" || e.key === "F") {
        if (!["INPUT", "SELECT"].includes(document.activeElement.tagName)) {
          this.fitToScreen();
        }
      }
    });

    window.addEventListener("resize", () => {
      this.fitToScreen();
    });

    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        this.fitToScreen();
      });
      resizeObserver.observe(this.svgContainer);
    }

    // 範囲指定の数値入力（1の位まで自由入力）
    if (this.dom.rangeNumInput) {
      this.dom.rangeNumInput.addEventListener("input", (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val > 0) {
          this.rangeTargetVal = val;
          this.loadProblem(this.currentProblemKey);
        }
      });
    }
  }

  loadProblem(key) {
    this.currentProblemKey = key;
    const problemDef = PROBLEMS[key];
    this.stopAnimation();

    if (problemDef.isDynamic) {
      if (key === "janken") {
        this.currentProblem = problemDef.generate(problemDef.currentParam, this.jankenWinnerFilter);
        this.buildSubParamUI(problemDef);
        this.buildJankenWinnerUI(problemDef.currentParam);
        if (this.dom.rangeParamContainer) this.dom.rangeParamContainer.classList.add("hide");
      } else if (problemDef.isRangeProblem) {
        const is4digit = (problemDef.depth === 4 || key.includes("4digit") || key.includes("3000"));
        const unitScale = is4digit ? 1000 : 100;
        
        if (is4digit && this.rangeTargetVal < 1000) this.rangeTargetVal = 3000;
        else if (!is4digit && this.rangeTargetVal >= 1000) this.rangeTargetVal = 400;

        const maxLimit = problemDef.currentParam * unitScale;
        if (this.rangeTargetVal > maxLimit) this.rangeTargetVal = maxLimit;

        this.currentProblem = problemDef.generate(problemDef.currentParam, this.rangeTargetVal, this.rangeDirection);
        this.buildSubParamUI(problemDef);
        this.buildRangeUI(problemDef.currentParam, is4digit);
        if (this.dom.jankenWinnerContainer) this.dom.jankenWinnerContainer.classList.add("hide");
      } else {
        this.currentProblem = problemDef.generate(problemDef.currentParam);
        this.buildSubParamUI(problemDef);
        if (this.dom.jankenWinnerContainer) {
          this.dom.jankenWinnerContainer.classList.add("hide");
        }
        if (this.dom.rangeParamContainer) {
          this.dom.rangeParamContainer.classList.add("hide");
        }
      }
    } else {
      this.currentProblem = problemDef;
      if (this.dom.subParamContainer) {
        this.dom.subParamContainer.classList.add("hide");
      }
      if (this.dom.jankenWinnerContainer) {
        this.dom.jankenWinnerContainer.classList.add("hide");
      }
      if (this.dom.rangeParamContainer) {
        this.dom.rangeParamContainer.classList.add("hide");
      }
    }

    this.dom.qTitle.textContent = this.currentProblem.title;
    
    let badgeLabel = "使えるカード";
    let badgesHtml = "";

    if (this.currentProblem.isMatchGame) {
      badgeLabel = "対戦チーム";
      badgesHtml = `
        <span class="badge-card">Aチーム</span>
        <span class="badge-card">Bチーム</span>
        <span style="margin-left: 10px; color: var(--accent-cyan);">ルール: 先に2勝した方が優勝（最大3試合）</span>
      `;
    } else if (this.currentProblem.isPresentExchange) {
      badgeLabel = "生徒とプレゼント";
      const n = this.currentProblem.depth;
      const students = ["A", "B", "C", "D", "E", "F"].slice(0, n);
      const presents = ["a", "b", "c", "d", "e", "f"].slice(0, n);
      badgesHtml = presents.map((p, i) => `<span class="badge-card">${p} (${students[i]}の物)</span>`).join(" ")
        + ` <span style="margin-left: 10px; color: var(--accent-cyan);">ルール: 全員が自分の物以外をもらう</span>`;
    } else if (this.currentProblem.isNoAdjacentDigit) {
      badgeLabel = "使える数字";
      badgesHtml = this.currentProblem.items
        .map(item => `<span class="badge-card">${item}</span>`)
        .join(" ") + ` <span style="margin-left: 10px; color: var(--accent-cyan);">ルール: 隣り合う位は異なる数字</span>`;
    } else if (this.currentProblem.isCoinWalk) {
      badgeLabel = "コインの移動ルール";
      badgesHtml = `
        <span class="badge-card">表 (+1)</span>
        <span class="badge-card">裏 (-1)</span>
        <span style="margin-left: 10px; color: var(--accent-cyan);">条件: 3回投げて最終座標が 1</span>
      `;
    } else if (this.currentProblem.isBallDraw) {
      badgeLabel = "袋の中の玉";
      badgesHtml = `
        <span class="badge-card" style="border-color:#ef4444; color:#f87171;">赤1</span>
        <span class="badge-card" style="border-color:#ef4444; color:#f87171;">赤2</span>
        <span class="badge-card" style="border-color:#94a3b8; color:#f1f5f9;">白</span>
        <span style="margin-left: 10px; color: var(--accent-cyan);">条件: 取り出した2個の玉の色が異なる</span>
      `;
    } else if (this.currentProblem.isSubset) {
      badgeLabel = "要素の選択";
      badgesHtml = `
        <span class="badge-card">○ (含む)</span>
        <span class="badge-card">× (含まない)</span>
        <span style="margin-left: 10px; color: var(--accent-cyan);">対象集合: {${this.currentProblem.subsetElements.join(", ")}}</span>
      `;
    } else if (this.currentProblem.isDictionary) {
      badgeLabel = "使用する文字 (辞書順)";
      badgesHtml = this.currentProblem.items
        .map(item => `<span class="badge-card">${item}</span>`)
        .join(" ");
    } else if (this.currentProblemKey === "janken") {
      badgeLabel = "選択肢(手)";
      badgesHtml = this.currentProblem.items
        .map(item => `<span class="badge-card">${item}</span>`)
        .join(" ");
    } else if (this.currentProblemKey === "coin") {
      badgeLabel = "コインの面";
      badgesHtml = this.currentProblem.items
        .map(item => `<span class="badge-card">${item}</span>`)
        .join(" ");
    } else {
      badgesHtml = this.currentProblem.items
        .map(item => `<span class="badge-card">${item}</span>`)
        .join(" ");
    }
    this.dom.qDesc.innerHTML = `${badgeLabel}: ${badgesHtml}`;

    if (this.currentProblem.isDictionary && this.currentProblem.defaultFirstChoice) {
      this.firstBranchFilter = this.currentProblem.defaultFirstChoice;
    } else {
      this.firstBranchFilter = "all";
    }

    this.buildSlotsUI();
    this.buildFilterOptions();
    this.buildTreeData();
    this.render();
    setTimeout(() => this.fitToScreen(), 50);
  }

  // サブパラメータ選択UI（コイン回数、じゃんけん人数、最大カード4,5,6）の構築
  buildSubParamUI(pDef) {
    if (!this.dom.subParamContainer) return;

    this.dom.subParamContainer.classList.remove("hide");
    this.dom.subParamLabel.textContent = `${pDef.paramName}:`;
    this.dom.subParamChips.innerHTML = "";

    for (let val = pDef.minParam; val <= pDef.maxParam; val++) {
      const btn = document.createElement("button");
      btn.className = `sub-chip ${val === pDef.currentParam ? 'active' : ''}`;
      btn.textContent = `${val}${pDef.unit}`;
      btn.title = `${pDef.paramName}を${val}${pDef.unit}に変更`;
      btn.addEventListener("click", () => {
        pDef.currentParam = val;
        this.loadProblem(this.currentProblemKey);
      });
      this.dom.subParamChips.appendChild(btn);
    }
  }

  buildJankenWinnerUI(people) {
    if (!this.dom.jankenWinnerContainer) return;

    this.dom.jankenWinnerContainer.classList.remove("hide");
    const container = this.dom.jankenWinnerChips;
    container.innerHTML = "";

    const names = ["A君", "B君", "C君", "D君", "E君"];

    const options = [
      { id: "all", label: "全員" },
      ...Array.from({ length: people }, (_, i) => ({ id: `${i}`, label: `${names[i]}が勝つ` })),
      { id: "solo_0", label: "A君の1人勝ち" },
      { id: "aiko", label: "あいこ" }
    ];

    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = `sub-chip ${opt.id === this.jankenWinnerFilter ? 'active' : ''}`;
      btn.textContent = opt.label;
      btn.addEventListener("click", () => {
        this.jankenWinnerFilter = opt.id;
        this.loadProblem("janken");
      });
      container.appendChild(btn);
    });
  }

  // 範囲指定（何以上・何以下：1の位まで自由設定）選択UIの構築
  buildRangeUI(maxCard, is4digit) {
    if (!this.dom.rangeParamContainer) return;
    this.dom.rangeParamContainer.classList.remove("hide");

    const unitScale = is4digit ? 1000 : 100;
    const minVal = 1 * unitScale;
    const maxVal = maxCard * unitScale + (is4digit ? 654 : 54);

    // 入力欄の同期
    if (this.dom.rangeNumInput) {
      this.dom.rangeNumInput.min = minVal;
      this.dom.rangeNumInput.max = maxVal;
      this.dom.rangeNumInput.value = this.rangeTargetVal;
    }

    const valueContainer = this.dom.rangeValueChips;
    const dirContainer = this.dom.rangeDirectionChips;
    valueContainer.innerHTML = "";
    dirContainer.innerHTML = "";

    // 向きボタン (以上 / 以下)
    const dirs = [
      { id: "gte", label: "以上 (≧)" },
      { id: "lte", label: "以下 (≦)" }
    ];
    dirs.forEach(d => {
      const btn = document.createElement("button");
      btn.className = `sub-chip ${d.id === this.rangeDirection ? 'active' : ''}`;
      btn.textContent = d.label;
      btn.title = `条件を「${d.label}」に設定`;
      btn.addEventListener("click", () => {
        this.rangeDirection = d.id;
        this.loadProblem(this.currentProblemKey);
      });
      dirContainer.appendChild(btn);
    });

    // よく使う例のボタン（10の位や1の位の例を含む）
    const presetList = is4digit
      ? [2000, 2500, 3000, 3200, 3500, 4000].filter(v => v <= maxCard * 1000)
      : [300, 320, 350, 400, 420, 450, 500].filter(v => v <= maxCard * 100 + 50);

    presetList.forEach(val => {
      const btn = document.createElement("button");
      btn.className = `sub-chip ${val === this.rangeTargetVal ? 'active' : ''}`;
      btn.textContent = `${val}`;
      btn.title = `例として ${val} を入力`;
      btn.addEventListener("click", () => {
        this.rangeTargetVal = val;
        if (this.dom.rangeNumInput) this.dom.rangeNumInput.value = val;
        this.loadProblem(this.currentProblemKey);
      });
      valueContainer.appendChild(btn);
    });
  }

  buildSlotsUI() {
    const p = this.currentProblem;
    const container = this.dom.slotsContainer;
    container.innerHTML = "";

    const depth = p.depth;
    for (let i = 0; i < depth; i++) {
      const slotItem = document.createElement("div");
      slotItem.className = "slot-item";

      const label = document.createElement("div");
      label.className = "slot-label";
      label.textContent = p.columnLabels && p.columnLabels[i] ? p.columnLabels[i] : `${i + 1}番目`;

      const box = document.createElement("div");
      box.className = "slot-box";
      box.id = `slot-box-${i}`;
      box.textContent = "—";

      const count = document.createElement("div");
      count.className = "slot-count-badge";
      const sc = p.slotCounts && p.slotCounts[i] !== undefined ? p.slotCounts[i] : "";
      count.textContent = typeof sc === "number" ? `${sc}通り` : sc;

      slotItem.appendChild(label);
      slotItem.appendChild(box);
      slotItem.appendChild(count);
      container.appendChild(slotItem);

      if (i < depth - 1) {
        const op = document.createElement("div");
        op.className = "slot-operator";
        op.textContent = "×";
        container.appendChild(op);
      }
    }

    let formulaHtml = "";
    if (p.sublines && p.sublines.length > 0) {
      const sublinesHtml = p.sublines
        .map(sub => `<div>• ${sub.label} → <code>${sub.calc}</code> = <span class="subline-val">${sub.val}</span></div>`)
        .join("");
      
      formulaHtml = `
        <div class="formula-header">
          <span class="formula-label">場合分けの計算:</span>
        </div>
        <div class="formula-sublines">${sublinesHtml}</div>
        <div class="formula-total">合計: <strong>${p.formula}</strong></div>
      `;
    } else {
      formulaHtml = `
        <div class="formula-header">
          <span class="formula-label">計算式:</span>
        </div>
        <div class="formula-total"><strong>${p.formula}</strong></div>
      `;
    }

    this.dom.formulaText.innerHTML = formulaHtml;
    this.dom.formulaNote.textContent = p.note;
  }

  buildFilterOptions() {
    const p = this.currentProblem;
    const firstSelect = this.dom.filterFirstBranch;
    const lastSelect = this.dom.filterLastBranch;
    const firstChipsContainer = this.dom.digitChips;
    const lastChipsContainer = this.dom.lastDigitChips;

    const firstColName = p.columnLabels && p.columnLabels[0] ? p.columnLabels[0].replace(/\(.*\)/, '').trim() : "最高位";
    const lastColIndex = p.depth - 1;
    const lastColName = p.columnLabels && p.columnLabels[lastColIndex] ? p.columnLabels[lastColIndex].replace(/\(.*\)/, '').trim() : "一の位";

    firstSelect.innerHTML = '<option value="all">すべて表示</option>';
    firstChipsContainer.innerHTML = "";
    if (this.dom.firstDigitLabel) {
      this.dom.firstDigitLabel.textContent = `👑 ${firstColName}:`;
    }

    const firstChoices = p.firstItems || p.items;
    const allFirstChip = document.createElement("button");
    allFirstChip.className = "digit-chip active";
    allFirstChip.dataset.val = "all";
    allFirstChip.textContent = "全";
    allFirstChip.title = "すべて表示";
    allFirstChip.addEventListener("click", () => this.selectFirstBranch("all"));
    firstChipsContainer.appendChild(allFirstChip);

    firstChoices.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item;
      opt.textContent = `${firstColName}が「${item}」`;
      firstSelect.appendChild(opt);

      const chip = document.createElement("button");
      chip.className = "digit-chip";
      chip.dataset.val = item;
      chip.textContent = item;
      chip.title = `${firstColName}が「${item}」の樹形図を表示`;
      chip.addEventListener("click", () => this.selectFirstBranch(item));
      firstChipsContainer.appendChild(chip);
    });

    lastSelect.innerHTML = '<option value="all">すべて表示</option>';
    lastChipsContainer.innerHTML = "";
    if (this.dom.lastDigitLabel) {
      this.dom.lastDigitLabel.textContent = `🎯 ${lastColName}:`;
    }

    const lastChoices = p.items;
    const allLastChip = document.createElement("button");
    allLastChip.className = "digit-chip active";
    allLastChip.dataset.val = "all";
    allLastChip.textContent = "全";
    allLastChip.title = "すべて表示";
    allLastChip.addEventListener("click", () => this.selectLastBranch("all"));
    lastChipsContainer.appendChild(allLastChip);

    lastChoices.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item;
      opt.textContent = `${lastColName}が「${item}」`;
      lastSelect.appendChild(opt);

      const chip = document.createElement("button");
      chip.className = "digit-chip";
      chip.dataset.val = item;
      chip.textContent = item;
      chip.title = `${lastColName}が「${item}」の樹形図を表示`;
      chip.addEventListener("click", () => this.selectLastBranch(item));
      lastChipsContainer.appendChild(chip);
    });

    this.firstBranchFilter = "all";
    this.lastBranchFilter = "all";
    firstSelect.value = "all";
    lastSelect.value = "all";

    const conditionRow = document.getElementById("condition-filter-row");
    const hasSpecialCondition = p.conditionLabel && p.conditionLabel !== "すべて";

    if (hasSpecialCondition) {
      conditionRow.style.display = "flex";
      this.dom.checkOnlyMatches.checked = false;
      this.onlyMatchesFilter = false;
      conditionRow.querySelector("span").textContent = `条件を満たすもののみ表示 (${p.conditionLabel})`;
    } else {
      conditionRow.style.display = "none";
      this.dom.checkOnlyMatches.checked = false;
      this.onlyMatchesFilter = false;
    }

    this.updateInsightText();
  }

  selectFirstBranch(val) {
    this.firstBranchFilter = val;
    this.dom.filterFirstBranch.value = val;

    const chips = this.dom.digitChips.querySelectorAll(".digit-chip");
    chips.forEach(chip => {
      chip.classList.toggle("active", chip.dataset.val === val);
    });

    this.render();
    this.fitToScreen();
    this.updateInsightText();
  }

  selectLastBranch(val) {
    this.lastBranchFilter = val;
    this.dom.filterLastBranch.value = val;

    const chips = this.dom.lastDigitChips.querySelectorAll(".digit-chip");
    chips.forEach(chip => {
      chip.classList.toggle("active", chip.dataset.val === val);
    });

    this.render();
    this.fitToScreen();
    this.updateInsightText();
  }

  updateInsightText() {
    if (!this.dom.insightContent) return;

    const p = this.currentProblem;
    const firstColName = p.columnLabels && p.columnLabels[0] ? p.columnLabels[0].replace(/\(.*\)/, '').trim() : "最高位";
    const lastColIndex = p.depth - 1;
    const lastColName = p.columnLabels && p.columnLabels[lastColIndex] ? p.columnLabels[lastColIndex].replace(/\(.*\)/, '').trim() : "一の位";

    const firstChoices = p.firstItems || p.items;
    const selFirst = this.firstBranchFilter;
    const selLast = this.lastBranchFilter;

    const matchingLeaves = this.leafNodes.filter(l => l.isMatch);
    const totalMatchCount = matchingLeaves.length;

    if (p.isMatchGame) {
      if (selFirst === "all") {
        this.dom.insightContent.innerHTML = `
          <div>第1試合で【A】が勝つルート（3通り）と、【B】が勝つルート（3通り）で合計 <strong style="color:var(--accent-cyan); font-size:1.05rem;">6通り</strong> です。</div>
          <div style="margin-top: 4px; color: var(--text-sub);">どちらかが先に2勝した時点で試合終了となるため、AAやBBは第2試合で終了します。</div>
          <div style="margin-top: 4px; color: var(--text-sub);">👆 上のボタンで第1試合の勝者（A / B）を選ぶと、各ルートの樹形図をクローズアップできます。</div>
        `;
      } else {
        const branchLeaves = matchingLeaves.filter(l => l.path[0] === selFirst);
        const winSelf = branchLeaves.filter(l => l.path.filter(x => x === selFirst).length >= 2).length;
        const other = selFirst === "A" ? "B" : "A";
        const winOther = branchLeaves.length - winSelf;
        this.dom.insightContent.innerHTML = `
          <div>第1試合で <span class="insight-target">【${selFirst}】</span> が勝った場合、決まり方は全部で <strong style="color:var(--accent-cyan); font-size:1.05rem;">${branchLeaves.length}通り</strong> です。</div>
          <div style="margin-top: 4px; color: var(--text-sub);">・そのまま${selFirst}が優勝するルート: <strong>${winSelf}通り</strong> (${selFirst}${selFirst}, ${selFirst}${other}${selFirst})</div>
          <div style="margin-top: 2px; color: var(--text-sub);">・${other}が逆転優勝するルート: <strong>${winOther}通り</strong> (${selFirst}${other}${other})</div>
          <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1);">
            👉 全体の計算：${selFirst}が初戦勝利（3通り）＋ ${other}が初戦勝利（3通り）＝ <strong>6通り</strong>
          </div>
        `;
      }
      return;
    }

    if (p.isPresentExchange) {
      const n = p.depth;
      const perBranch = totalMatchCount / (n - 1);
      if (selFirst === "all") {
        this.dom.insightContent.innerHTML = `
          <div>${n}人全員が自分の物以外のプレゼントをもらう配り方（完全順列・攪乱順列）は全部で <strong style="color:var(--accent-cyan); font-size:1.05rem;">${totalMatchCount}通り</strong> です。</div>
          <div style="margin-top: 4px; color: var(--text-sub);">A君は自分のプレゼント a 以外の${n - 1}通り（${firstChoices.join(", ")}）をもらいます。各場合で樹形図の形（各${perBranch}通り）が完全に同じになります。</div>
          <div style="margin-top: 4px; color: var(--text-sub);">👆 上のボタンでA君のもらうプレゼント（${firstChoices.join(" / ")}）を選ぶと、綺麗な枝分かれをクローズアップ観察できます。</div>
        `;
      } else {
        const branchLeaves = matchingLeaves.filter(l => l.path[0] === selFirst);
        this.dom.insightContent.innerHTML = `
          <div>A君が <span class="insight-target">【${selFirst}】</span> をもらう配り方は <strong style="color:var(--accent-cyan); font-size:1.05rem;">${branchLeaves.length}通り</strong> です。</div>
          <div style="margin-top: 4px; color: var(--text-sub);">A君が他のプレゼント（${firstChoices.filter(x => x !== selFirst).join(", ")}）をもらう場合もまったく同じ形の樹形図（各${branchLeaves.length}通り）になります。</div>
          <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1);">
            👉 対称性を利用した計算：<span class="insight-calc">${branchLeaves.length}通り × ${n - 1} ＝ ${totalMatchCount}通り</span>
          </div>
        `;
      }
      return;
    }

    if (p.isNoAdjacentDigit) {
      if (selFirst === "all") {
        this.dom.insightContent.innerHTML = `
          <div>隣り合う数字が異なる3桁の整数は全部で <strong style="color:var(--accent-cyan); font-size:1.05rem;">12個</strong> です。</div>
          <div style="margin-top: 4px; color: var(--text-sub);">百の位は1, 2, 3の3通り。十の位は百の位以外の2通り。一の位は十の位以外の2通り。</div>
          <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1);">
            👉 積の法則による計算：<span class="insight-calc">3 × 2 × 2 ＝ 12個</span>
          </div>
        `;
      } else {
        const branchLeaves = matchingLeaves.filter(l => l.path[0] === selFirst);
        this.dom.insightContent.innerHTML = `
          <div>百の位が <span class="insight-target">【${selFirst}】</span> のときは <strong style="color:var(--accent-cyan); font-size:1.05rem;">${branchLeaves.length}個</strong> です。</div>
          <div style="margin-top: 4px; color: var(--text-sub);">十の位（2通り）× 一の位（2通り）＝ 4個。他の数字（${firstChoices.filter(x => x !== selFirst).join(", ")}）のときも同様です。</div>
          <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1);">
            👉 全体の計算：<span class="insight-calc">${branchLeaves.length}個 × 3 ＝ 12個</span>
          </div>
        `;
      }
      return;
    }

    if (p.isCoinWalk) {
      this.dom.insightContent.innerHTML = `
        <div>コインを3回投げて原点から最終座標が 1 になる出方は <strong style="color:var(--accent-cyan); font-size:1.05rem;">${totalMatchCount}通り</strong>（全体8通り中）です。</div>
        <div style="margin-top: 4px; color: var(--text-sub);">表(+1)が2回、裏(-1)が1回出ると <code>(+1) + (+1) + (-1) = 1</code> となります。</div>
        <div style="margin-top: 4px; color: var(--text-sub);">該当する出方: <strong>表・表・裏</strong>, <strong>表・裏・表</strong>, <strong>裏・表・表</strong> の3通り。</div>
      `;
      return;
    }

    if (p.isBallDraw) {
      if (selFirst === "all") {
        this.dom.insightContent.innerHTML = `
          <div>赤玉2個（赤1, 赤2）と白玉1個から取り出した玉の色が異なるのは全部で <strong style="color:var(--accent-cyan); font-size:1.05rem;">${totalMatchCount}通り</strong>（全体6通り中）です。</div>
          <div style="margin-top: 4px; color: var(--text-sub);">同じ赤玉でも「赤1」「赤2」と区別して樹形図を書くのがポイントです。</div>
        `;
      } else {
        const branchLeaves = matchingLeaves.filter(l => l.path[0] === selFirst);
        const matchCount = branchLeaves.filter(l => l.isMatch).length;
        this.dom.insightContent.innerHTML = `
          <div>1回目が <span class="insight-target">【${selFirst}】</span> のとき、色が異なる取り出し方は <strong style="color:var(--accent-cyan); font-size:1.05rem;">${matchCount}通り</strong> です。</div>
          <div style="margin-top: 4px; color: var(--text-sub);">2回目に取り出せる残りの玉（2個）のうち、色が違う玉を選びます。</div>
        `;
      }
      return;
    }

    if (p.isSubset) {
      if (selFirst === "all" && selLast === "all") {
        this.dom.insightContent.innerHTML = `
          <div>集合 <code>{${p.subsetElements.join(", ")}}</code> の部分集合は全部で <strong style="color:var(--accent-cyan); font-size:1.05rem;">${totalMatchCount}個</strong>（2の${p.depth}乗）です。</div>
          <div style="margin-top: 4px; color: var(--text-sub);">各要素について「入る(○)」か「入らない(×)」の2分岐を${p.depth}回繰り返すため、2 × 2 × … × 2 ＝ 2^${p.depth} ＝ ${totalMatchCount}個 となります。</div>
          <div style="margin-top: 4px; color: var(--text-sub);">👆 上のボタンで要素 a の【○】や【×】を選ぶと、手書きメモの上下2つの樹形図のまとまりを観察できます。</div>
        `;
        return;
      }
      if (selFirst !== "all" && selLast === "all") {
        const isInc = selFirst === "○";
        const subCount = matchingLeaves.filter(l => l.path[0] === selFirst).length;
        this.dom.insightContent.innerHTML = `
          <div>${firstColName} を <span class="insight-target">【${selFirst} (${isInc ? "含む" : "含まない"})】</span> とする部分集合は <strong style="color:var(--accent-cyan); font-size:1.05rem;">${subCount}個</strong>（2の${p.depth - 1}乗）です。</div>
          <div style="margin-top: 4px; color: var(--text-sub);">残りの要素（${p.subsetElements.slice(1).join(", ")}）の選び方（2の${p.depth - 1}乗 ＝ ${subCount}通り）と対応しています。</div>
          <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1);">
            👉 全体（${totalMatchCount}個）＝ aを含む（${subCount}個）＋ aを含まない（${subCount}個）
          </div>
        `;
        return;
      }
    }

    if (selFirst === "all" && selLast === "all") {
      this.dom.insightContent.innerHTML = `
        <div>${firstColName}は <span class="insight-target">${firstChoices.join(", ")}</span> の <strong>${firstChoices.length}通り</strong>。</div>
        <div style="margin-top: 4px; color: var(--text-sub);">👆 上のボタンで【最高位】や【一の位】を選ぶと、特定の数字に絞り込んだ樹形図を大きくクローズアップして観察できます。</div>
      `;
      return;
    }

    if (selFirst !== "all" && selLast !== "all") {
      const filtered = matchingLeaves.filter(l => l.path[0] === selFirst && l.path[l.path.length - 1] === selLast);
      const count = filtered.length;

      const patternSlots = Array.from({ length: p.depth }, (_, i) => {
        if (i === 0) return selFirst;
        if (i === p.depth - 1) return selLast;
        return "_";
      }).join(" ");

      this.dom.insightContent.innerHTML = `
        <div>固定パターン: <span class="insight-target">${patternSlots}</span></div>
        <div style="margin-top: 4px;">${firstColName}が【${selFirst}】で、${lastColName}が【${selLast}】のときは <strong style="color:var(--accent-cyan); font-size:1.05rem;">${count}通り</strong> です。</div>
        ${count > 0 ? `<div style="margin-top: 4px; color: var(--text-sub);">残りの位置（${patternSlots}の空欄）に入るカードの並び替えで決まります。</div>` : `<div style="margin-top: 4px; color: var(--accent-rose);">※ この組み合わせは条件を満たしません（0通り）。</div>`}
      `;
      return;
    }

    if (selLast !== "all") {
      const filtered = matchingLeaves.filter(l => l.path[l.path.length - 1] === selLast);
      const count = filtered.length;
      const isLastEven = parseInt(selLast, 10) % 2 === 0;

      this.dom.insightContent.innerHTML = `
        <div>${lastColName}が <span class="insight-target">【${selLast}】</span>（${isLastEven ? '偶数' : '奇数'}）のときは <strong style="color:var(--accent-cyan); font-size:1.05rem;">${count}通り</strong> です。</div>
        <div style="margin-top: 4px; color: var(--text-sub);">偶数や倍数の問題では、まず一の位の数（${selLast}）を決めてから最高位を決めるのがコツです！</div>
        <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1);">
          👉 全体（${totalMatchCount}通り）のうちの一の位「${selLast}」のグループ
        </div>
      `;
      return;
    }

    const targetBranchLeaves = matchingLeaves.filter(l => l.path[0] === selFirst);
    const branchCount = targetBranchLeaves.length;
    const branchCounts = firstChoices.map(c => matchingLeaves.filter(l => l.path[0] === c).length);
    const allSame = branchCounts.every(cnt => cnt === branchCounts[0]);

    if (allSame) {
      this.dom.insightContent.innerHTML = `
        <div>${firstColName}が <span class="insight-target">【${selFirst}】</span> のときは <strong style="color:var(--accent-cyan); font-size:1.05rem;">${branchCount}通り</strong> です。</div>
        <div style="margin-top: 4px;">他の数（${firstChoices.filter(x => x !== selFirst).join(", ")}）のときも<strong>まったく同じ形（各${branchCount}通り）</strong>になります。</div>
        <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1);">
          👉 全体の計算：<span class="insight-calc">${branchCount}通り × ${firstChoices.length} ＝ ${totalMatchCount}通り</span>
        </div>
      `;
    } else {
      const evenChoices = firstChoices.filter(x => parseInt(x, 10) % 2 === 0);
      const oddChoices = firstChoices.filter(x => parseInt(x, 10) % 2 !== 0);
      const isSelectedEven = parseInt(selFirst, 10) % 2 === 0;

      this.dom.insightContent.innerHTML = `
        <div>${firstColName}が <span class="insight-target">【${selFirst}】</span>（${isSelectedEven ? '偶数' : '奇数'}）のときは <strong style="color:var(--accent-cyan); font-size:1.05rem;">${branchCount}通り</strong> です。</div>
        <div style="margin-top: 4px; color: var(--text-sub);">
          ${isSelectedEven
            ? `偶数(${evenChoices.join(", ")})のときは各${branchCount}通り`
            : `奇数(${oddChoices.join(", ")})のときは各${branchCount}通り`} になります。
        </div>
        <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1);">
          👉 すべての合計：<span class="insight-calc">${totalMatchCount}通り</span>
        </div>
      `;
    }
  }

  buildTreeData() {
    const p = this.currentProblem;
    let nextId = 0;

    this.rootNode = {
      id: nextId++,
      value: "根",
      label: "スタート",
      depth: 0,
      path: [],
      children: [],
      parent: null,
      isMatch: true
    };

    this.allNodes = [this.rootNode];
    this.allEdges = [];
    this.leafNodes = [];

    const generateChildren = (parentNode, currentDepth, usedItems) => {
      // 途中で試合が決着するなど早期終了条件の判定
      if (currentDepth > 0 && p.isTerminal && p.isTerminal(parentNode.path)) {
        const isMatch = p.filterCondition(parentNode.path);
        parentNode.isMatch = isMatch;
        this.leafNodes.push(parentNode);
        return;
      }

      if (currentDepth >= p.depth) {
        const isMatch = p.filterCondition(parentNode.path);
        parentNode.isMatch = isMatch;
        this.leafNodes.push(parentNode);
        return;
      }

      let candidateItems = [];
      if (p.getNextItems) {
        candidateItems = p.getNextItems(currentDepth, parentNode.path, usedItems);
      } else {
        candidateItems = (currentDepth === 0 && p.firstItems) ? p.firstItems : p.items;
      }

      let validCandidates = candidateItems;
      if (!p.allowRepeat && !p.getNextItems) {
        validCandidates = candidateItems.filter(item => !usedItems.includes(item));
      }

      validCandidates.forEach(item => {
        const newPath = [...parentNode.path, item];
        const childNode = {
          id: nextId++,
          value: item,
          label: item,
          depth: currentDepth + 1,
          path: newPath,
          children: [],
          parent: parentNode,
          isMatch: true
        };

        const edge = {
          id: `e-${parentNode.id}-${childNode.id}`,
          source: parentNode,
          target: childNode,
          isMatch: true
        };

        parentNode.children.push(childNode);
        this.allNodes.push(childNode);
        this.allEdges.push(edge);

        const nextUsed = p.allowRepeat ? usedItems : [...usedItems, item];
        generateChildren(childNode, currentDepth + 1, nextUsed);
      });
    };

    generateChildren(this.rootNode, 0, []);

    const propagateMatch = (node) => {
      if (node.children.length === 0) {
        return node.isMatch;
      }
      let anyMatch = false;
      node.children.forEach(child => {
        const childMatch = propagateMatch(child);
        if (childMatch) anyMatch = true;
      });
      node.isMatch = anyMatch;
      return anyMatch;
    };
    propagateMatch(this.rootNode);

    this.allEdges.forEach(edge => {
      edge.isMatch = edge.target.isMatch;
    });
  }

  calculateLayout() {
    const visibleNodes = new Set();
    const visibleEdges = new Set();

    const shouldIncludeLeaf = (leaf) => {
      if (this.firstBranchFilter !== "all" && leaf.path[0] !== this.firstBranchFilter) {
        return false;
      }
      if (this.lastBranchFilter !== "all" && leaf.path[leaf.path.length - 1] !== this.lastBranchFilter) {
        return false;
      }
      if (this.onlyMatchesFilter && !leaf.isMatch) {
        return false;
      }
      return true;
    };

    const targetLeaves = this.leafNodes.filter(shouldIncludeLeaf);

    targetLeaves.forEach(leaf => {
      let curr = leaf;
      while (curr) {
        visibleNodes.add(curr);
        if (curr.parent) {
          const edge = this.allEdges.find(e => e.source === curr.parent && e.target === curr);
          if (edge) visibleEdges.add(edge);
        }
        curr = curr.parent;
      }
    });

    if (visibleNodes.size === 0) {
      return { nodes: [], edges: [], leaves: [], bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100 } };
    }

    const LEVEL_WIDTH = 140;
    const LEAF_HEIGHT = 28;

    let currentLeafY = 40;
    targetLeaves.forEach(leaf => {
      leaf.y = currentLeafY;
      leaf.x = leaf.depth * LEVEL_WIDTH + 60;
      currentLeafY += LEAF_HEIGHT;
    });

    const computeInternalY = (node) => {
      if (!visibleNodes.has(node)) return;
      
      const visibleChildren = node.children.filter(c => visibleNodes.has(c));
      if (visibleChildren.length === 0) {
        return;
      }

      visibleChildren.forEach(c => computeInternalY(c));
      const avgY = visibleChildren.reduce((sum, c) => sum + c.y, 0) / visibleChildren.length;
      node.y = avgY;
      node.x = node.depth * LEVEL_WIDTH + 60;
    };

    computeInternalY(this.rootNode);

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    visibleNodes.forEach(node => {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
    });

    maxX += 280;

    return {
      nodes: Array.from(visibleNodes),
      edges: Array.from(visibleEdges),
      leaves: targetLeaves,
      bounds: { minX, maxX, minY, maxY }
    };
  }

  render() {
    this.clearSvg();
    const layout = this.calculateLayout();
    this.currentLayout = layout;

    const matchLeaves = layout.leaves.filter(l => l.isMatch);
    const displayedCount = this.onlyMatchesFilter ? matchLeaves.length : layout.leaves.length;
    const totalMatchCount = this.leafNodes.filter(l => l.isMatch).length;

    this.updateStats(displayedCount, totalMatchCount);

    if (layout.nodes.length === 0) {
      return;
    }

    this.renderColumnHeaders(layout);

    layout.edges.forEach(edge => {
      const pathEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathEl.setAttribute("id", edge.id);
      pathEl.setAttribute("class", `tree-edge ${edge.isMatch ? "match-path" : ""}`);
      
      const sx = edge.source.x;
      const sy = edge.source.y;
      const tx = edge.target.x;
      const ty = edge.target.y;
      const mx = (sx + tx) / 2;
      const d = `M ${sx} ${sy} C ${mx} ${sy}, ${mx} ${ty}, ${tx} ${ty}`;
      pathEl.setAttribute("d", d);

      this.edgesLayer.appendChild(pathEl);
      edge.dom = pathEl;
    });

    layout.nodes.forEach(node => {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "node-group");
      g.setAttribute("transform", `translate(${node.x}, ${node.y})`);

      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", node.depth === 0 ? "14" : "12");
      let nodeClass = "tree-node-circle";
      if (node.depth === 0) nodeClass += " root";
      else if (this.currentProblem.isDictionary && this.currentProblem.targetWord.startsWith(node.path.join(""))) {
        nodeClass += " target-word";
      } else if (node.isMatch) nodeClass += " match";
      circle.setAttribute("class", nodeClass);

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("class", "tree-node-text");
      text.textContent = node.depth === 0 ? "★" : node.value;

      g.appendChild(circle);
      g.appendChild(text);

      g.addEventListener("mouseenter", () => this.highlightPath(node));
      g.addEventListener("mouseleave", () => this.resetHighlight());

      this.nodesLayer.appendChild(g);
      node.dom = g;
    });

    layout.leaves.forEach(leaf => {
      const leafText = document.createElementNS("http://www.w3.org/2000/svg", "text");
      leafText.setAttribute("class", `tree-leaf-label ${leaf.isMatch ? "match" : ""}`);
      leafText.setAttribute("x", leaf.x + 18);
      leafText.setAttribute("y", leaf.y);

      if (this.currentProblem.isMatchGame) {
        const aWins = leaf.path.filter(x => x === "A").length;
        const winner = aWins >= 2 ? "A優勝" : "B優勝";
        leafText.textContent = `➡ ${leaf.path.join("-")} [${winner} (${leaf.path.length}試合)]`;
      } else if (this.currentProblem.isPresentExchange) {
        const students = ["A", "B", "C", "D", "E", "F"];
        const pairs = leaf.path.map((val, idx) => `${students[idx]}:${val}`).join(", ");
        leafText.textContent = `➡ ${pairs}`;
      } else if (this.currentProblem.isNoAdjacentDigit) {
        leafText.textContent = `➡ ${leaf.path.join("")}`;
      } else if (this.currentProblem.isCoinWalk) {
        const pos = leaf.path.reduce((sum, v) => sum + (v === "表" ? 1 : -1), 0);
        const posStr = pos > 0 ? `+${pos}` : `${pos}`;
        const matchTag = pos === 1 ? " ★座標=1" : "";
        leafText.textContent = `➡ ${leaf.path.join("・")} [位置: ${posStr}]${matchTag}`;
      } else if (this.currentProblem.isBallDraw) {
        const c1 = leaf.path[0].startsWith("赤") ? "赤" : "白";
        const c2 = leaf.path[1] ? (leaf.path[1].startsWith("赤") ? "赤" : "白") : "";
        const isDiff = c1 !== c2;
        leafText.textContent = `➡ ${leaf.path.join(" → ")} [${isDiff ? "異色 ○" : "同色 ×"}]`;
      } else if (this.currentProblem.isSubset) {
        const setName = formatSubset(leaf.path, this.currentProblem.subsetElements);
        const nameSuffix = setName === "∅" ? " (空集合)" : "";
        leafText.textContent = `➡ ${leaf.path.join("")}  ${setName}${nameSuffix}`;
      } else if (this.currentProblem.isJanken) {
        const jRes = evaluateJanken(leaf.path);
        leafText.textContent = `➡ ${leaf.path.join("")} [${jRes.label}]`;
      } else if (this.currentProblem.isDictionary) {
        const word = leaf.path.join("");
        if (word === this.currentProblem.targetWord) {
          leafText.textContent = `➡ ${word} 【★ 第${this.currentProblem.targetRank}番目】`;
          leafText.classList.add("target-word");
        } else {
          leafText.textContent = `➡ ${word}`;
        }
      } else {
        leafText.textContent = `➡ ${leaf.path.join("")}`;
      }
      
      this.labelsLayer.appendChild(leafText);
      leaf.labelDom = leafText;
    });
  }

  renderColumnHeaders(layout) {
    const p = this.currentProblem;
    const depth = p.depth;
    const LEVEL_WIDTH = 140;

    for (let d = 1; d <= depth; d++) {
      const colX = d * LEVEL_WIDTH + 60;
      const colLabel = p.columnLabels && p.columnLabels[d - 1] ? p.columnLabels[d - 1] : `${d}けた目`;

      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("class", "tree-column-header");
      text.setAttribute("x", colX);
      text.setAttribute("y", layout.bounds.minY - 20);
      text.textContent = `▼ ${colLabel}`;
      this.labelsLayer.appendChild(text);
    }
  }

  fitToScreen() {
    if (!this.currentLayout || this.currentLayout.nodes.length === 0) return;

    const b = this.currentLayout.bounds;
    const rect = this.svgContainer.getBoundingClientRect();
    const containerW = rect.width || 800;
    const containerH = rect.height || 600;

    const contentW = b.maxX - b.minX + 80;
    const contentH = b.maxY - b.minY + 80;

    if (contentW <= 0 || contentH <= 0) return;

    const padding = 40;
    const scaleX = (containerW - padding * 2) / contentW;
    const scaleY = (containerH - padding * 2) / contentH;
    let targetScale = Math.min(scaleX, scaleY);

    targetScale = Math.max(0.1, Math.min(1.2, targetScale));

    const contentCenterX = (b.minX + b.maxX) / 2;
    const contentCenterY = (b.minY + b.maxY) / 2;

    this.transform.scale = targetScale;
    this.transform.x = containerW / 2 - contentCenterX * targetScale;
    this.transform.y = containerH / 2 - contentCenterY * targetScale;

    this.applyTransform();
  }

  applyTransform() {
    this.viewportGroup.setAttribute(
      "transform",
      `translate(${this.transform.x}, ${this.transform.y}) scale(${this.transform.scale})`
    );
    this.dom.zoomLevel.textContent = `${Math.round(this.transform.scale * 100)}%`;
  }

  zoomCenter(factor) {
    const rect = this.svgContainer.getBoundingClientRect();
    this.zoomAtPoint(rect.width / 2, rect.height / 2, factor);
  }

  zoomAtPoint(clientX, clientY, factor) {
    const rect = this.svgContainer.getBoundingClientRect();
    const px = clientX - rect.left;
    const py = clientY - rect.top;

    const newScale = Math.max(0.05, Math.min(3.0, this.transform.scale * factor));
    const scaleRatio = newScale / this.transform.scale;

    this.transform.x = px - (px - this.transform.x) * scaleRatio;
    this.transform.y = py - (py - this.transform.y) * scaleRatio;
    this.transform.scale = newScale;

    this.applyTransform();
  }

  highlightPath(targetNode) {
    const pathNodes = new Set();
    const pathEdges = new Set();

    let curr = targetNode;
    while (curr) {
      pathNodes.add(curr);
      if (curr.parent) {
        const edge = this.allEdges.find(e => e.source === curr.parent && e.target === curr);
        if (edge) pathEdges.add(edge);
      }
      curr = curr.parent;
    }

    this.allEdges.forEach(e => {
      if (!e.dom) return;
      if (pathEdges.has(e)) {
        e.dom.classList.add("highlighted");
        e.dom.classList.remove("dimmed");
      } else {
        e.dom.classList.add("dimmed");
        e.dom.classList.remove("highlighted");
      }
    });

    this.allNodes.forEach(n => {
      if (!n.dom) return;
      const circle = n.dom.querySelector("circle");
      if (pathNodes.has(n)) {
        circle.classList.add("highlighted");
        circle.classList.remove("dimmed");
      } else {
        circle.classList.add("dimmed");
        circle.classList.remove("highlighted");
      }
    });

    const path = targetNode.path;
    for (let i = 0; i < this.currentProblem.depth; i++) {
      const box = document.getElementById(`slot-box-${i}`);
      if (box) {
        if (i < path.length) {
          box.textContent = path[i];
          box.classList.add("highlight");
        } else {
          box.textContent = "—";
          box.classList.remove("highlight");
        }
      }
    }

    if (path.length > 0) {
      if (this.currentProblem.isMatchGame && targetNode.children.length === 0) {
        const aWins = path.filter(x => x === "A").length;
        const winner = aWins >= 2 ? "Aチーム優勝" : "Bチーム優勝";
        this.dom.currentPathVal.textContent = `${path.join(" → ")} 【${winner} (${path.length}試合で決着)】`;
        this.dom.currentPathVal.style.color = "var(--accent-cyan)";
      } else if (this.currentProblem.isPresentExchange && targetNode.children.length === 0) {
        const students = ["A", "B", "C", "D", "E", "F"];
        const pairs = path.map((val, idx) => `${students[idx]}:${val}`).join(" → ");
        this.dom.currentPathVal.textContent = `${pairs} 【${this.currentProblem.depth}人全員が他人のプレゼント】`;
        this.dom.currentPathVal.style.color = "var(--accent-cyan)";
      } else if (this.currentProblem.isNoAdjacentDigit && targetNode.children.length === 0) {
        this.dom.currentPathVal.textContent = `${path.join(" → ")} 【3桁の整数: ${path.join("")}】`;
        this.dom.currentPathVal.style.color = "var(--accent-cyan)";
      } else if (this.currentProblem.isCoinWalk && targetNode.children.length === 0) {
        const pos = path.reduce((sum, v) => sum + (v === "表" ? 1 : -1), 0);
        const posStr = pos > 0 ? `+${pos}` : `${pos}`;
        const matchText = targetNode.isMatch ? " (★最終座標が 1)" : " (条件外)";
        this.dom.currentPathVal.textContent = `${path.join(" → ")} 【現在地: ${posStr}】${matchText}`;
        this.dom.currentPathVal.style.color = targetNode.isMatch ? "var(--match-color)" : "var(--accent-rose)";
      } else if (this.currentProblem.isBallDraw && targetNode.children.length === 0) {
        const c1 = path[0].startsWith("赤") ? "赤" : "白";
        const c2 = path[1] ? (path[1].startsWith("赤") ? "赤" : "白") : "";
        const isDiff = c1 !== c2;
        this.dom.currentPathVal.textContent = `${path.join(" → ")} 【${isDiff ? "異なる色 ○ (赤と白)" : "同じ色 ×"}】`;
        this.dom.currentPathVal.style.color = isDiff ? "var(--match-color)" : "var(--accent-rose)";
      } else if (this.currentProblem.isSubset && targetNode.children.length === 0) {
        const setName = formatSubset(path, this.currentProblem.subsetElements);
        const nameSuffix = setName === "∅" ? " (空集合)" : "";
        this.dom.currentPathVal.textContent = `${path.join(" → ")} 【部分集合: ${setName}${nameSuffix}】`;
        this.dom.currentPathVal.style.color = "var(--accent-cyan)";
      } else if (this.currentProblem.isJanken && targetNode.children.length === 0) {
        const jRes = evaluateJanken(path);
        const matchText = targetNode.isMatch ? " (条件合致)" : " (条件外)";
        this.dom.currentPathVal.textContent = `${path.join(" → ")} 【${jRes.label}】${matchText}`;
        this.dom.currentPathVal.style.color = targetNode.isMatch ? "var(--match-color)" : "var(--accent-rose)";
      } else if (this.currentProblem.isDictionary && targetNode.children.length === 0) {
        const word = path.join("");
        if (word === this.currentProblem.targetWord) {
          this.dom.currentPathVal.textContent = `${path.join(" → ")} 【★ 第${this.currentProblem.targetRank}番目 (目的の単語)】`;
          this.dom.currentPathVal.style.color = "var(--accent-amber)";
        } else {
          this.dom.currentPathVal.textContent = `${path.join(" → ")}`;
          this.dom.currentPathVal.style.color = "var(--text-sub)";
        }
      } else {
        const matchText = targetNode.isMatch ? " (条件合致)" : " (条件外)";
        this.dom.currentPathVal.textContent = path.join(" → ") + (targetNode.children.length === 0 ? matchText : "");
        this.dom.currentPathVal.style.color = targetNode.isMatch ? "var(--match-color)" : "var(--accent-rose)";
      }
    }
  }

  resetHighlight() {
    this.allEdges.forEach(e => {
      if (e.dom) {
        e.dom.classList.remove("highlighted", "dimmed");
      }
    });
    this.allNodes.forEach(n => {
      if (n.dom) {
        const circle = n.dom.querySelector("circle");
        circle.classList.remove("highlighted", "dimmed");
      }
    });

    for (let i = 0; i < this.currentProblem.depth; i++) {
      const box = document.getElementById(`slot-box-${i}`);
      if (box) {
        box.textContent = "—";
        box.classList.remove("highlight");
      }
    }

    this.dom.currentPathVal.textContent = "カーソルを合わせてください";
    this.dom.currentPathVal.style.color = "var(--text-sub)";
  }

  startAnimation() {
    this.stopAnimation();
    this.render();
    
    this.currentLayout.edges.forEach(e => { if (e.dom) e.dom.style.display = "none"; });
    this.currentLayout.nodes.forEach(n => { if (n.dom) n.dom.style.display = "none"; });
    this.currentLayout.leaves.forEach(l => { if (l.labelDom) l.labelDom.style.display = "none"; });

    if (this.rootNode.dom) this.rootNode.dom.style.display = "block";

    this.animQueue = [];
    const traverse = (node) => {
      node.children.forEach(child => {
        if (this.currentLayout.nodes.includes(child)) {
          const edge = this.currentLayout.edges.find(e => e.source === node && e.target === child);
          this.animQueue.push({ edge, node: child });
          traverse(child);
        }
      });
    };
    traverse(this.rootNode);

    this.animIndex = 0;
    this.isPlaying = true;
    this.dom.playBtnIcon.textContent = "⏸";
    this.dom.playBtnText.textContent = "一時停止";

    this.restartInterval();
  }

  restartInterval() {
    if (this.animTimer) clearInterval(this.animTimer);
    this.animTimer = setInterval(() => {
      if (this.animIndex >= this.animQueue.length) {
        this.stopAnimation();
        this.currentLayout.leaves.forEach(l => { if (l.labelDom) l.labelDom.style.display = "block"; });
        return;
      }

      const item = this.animQueue[this.animIndex];
      if (item.edge && item.edge.dom) item.edge.dom.style.display = "block";
      if (item.node && item.node.dom) item.node.dom.style.display = "block";
      if (item.node.children.length === 0 && item.node.labelDom) {
        item.node.labelDom.style.display = "block";
      }

      this.highlightPath(item.node);
      this.animIndex++;
    }, this.speed);
  }

  pauseAnimation() {
    if (this.animTimer) {
      clearInterval(this.animTimer);
      this.animTimer = null;
    }
    this.isPlaying = false;
    this.dom.playBtnIcon.textContent = "▶";
    this.dom.playBtnText.textContent = "再開";
  }

  stopAnimation() {
    if (this.animTimer) {
      clearInterval(this.animTimer);
      this.animTimer = null;
    }
    this.isPlaying = false;
    this.dom.playBtnIcon.textContent = "▶";
    this.dom.playBtnText.textContent = "ステップ描画";
  }

  showAllInstantly() {
    this.render();
    this.fitToScreen();
    this.resetHighlight();
  }

  clearSvg() {
    this.edgesLayer.innerHTML = "";
    this.nodesLayer.innerHTML = "";
    this.labelsLayer.innerHTML = "";
  }

  updateStats(displayed, total) {
    this.dom.statDisplayedCount.textContent = displayed;
    this.dom.statTotalCount.textContent = total;
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Fullscreen request error: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  updateFullscreenUI() {
    const isFs = !!document.fullscreenElement;
    if (isFs) {
      this.dom.iconEnterFs.classList.add("hide");
      this.dom.iconExitFs.classList.remove("hide");
      this.dom.fsText.textContent = "解除";
    } else {
      this.dom.iconEnterFs.classList.remove("hide");
      this.dom.iconExitFs.classList.add("hide");
      this.dom.fsText.textContent = "全画面";
    }
    setTimeout(() => this.fitToScreen(), 100);
  }

  toggleTheme() {
    const isDark = document.body.classList.contains("dark-theme");
    if (isDark) {
      document.body.classList.remove("dark-theme");
      document.body.classList.add("light-theme");
      this.dom.themeText.textContent = "ライト";
      this.dom.iconSun.classList.add("hide");
      this.dom.iconMoon.classList.remove("hide");
    } else {
      document.body.classList.remove("light-theme");
      document.body.classList.add("dark-theme");
      this.dom.themeText.textContent = "ダーク";
      this.dom.iconSun.classList.remove("hide");
      this.dom.iconMoon.classList.add("hide");
    }
  }

  openCustomModal() {
    this.dom.customModal.classList.remove("hide");
  }

  closeCustomModal() {
    this.dom.customModal.classList.add("hide");
    this.dom.problemSelect.value = this.currentProblemKey;
  }

  applyCustomProblem() {
    const title = this.dom.customTitle.value.trim() || "カスタム問題";
    const itemsRaw = this.dom.customItems.value.split(/[,、\s]+/).filter(Boolean);
    const depth = parseInt(this.dom.customDepth.value, 10) || 2;
    const allowRepeat = this.dom.customAllowRepeat.checked;

    if (itemsRaw.length === 0) {
      alert("要素を1つ以上入力してください。");
      return;
    }

    if (!allowRepeat && depth > itemsRaw.length) {
      alert(`カードが${itemsRaw.length}枚しかないため、重複なしで${depth}桁は作れません。桁数を減らすか重複を許可してください。`);
      return;
    }

    let total = 1;
    const counts = [];
    for (let i = 0; i < depth; i++) {
      const c = allowRepeat ? itemsRaw.length : (itemsRaw.length - i);
      counts.push(c);
      total *= c;
    }
    const formulaStr = `${counts.join(" × ")} = ${total}通り`;

    PROBLEMS.custom = {
      title,
      items: itemsRaw,
      firstItems: itemsRaw,
      depth,
      allowRepeat,
      columnLabels: Array.from({ length: depth }, (_, i) => `${i + 1}番目`),
      slotCounts: counts,
      formula: formulaStr,
      note: `カード数: ${itemsRaw.length}枚、選ぶ数: ${depth}個 (${allowRepeat ? "重複あり" : "重複なし"})`,
      filterCondition: () => true,
      conditionLabel: "すべて"
    };

    this.closeCustomModal();
    this.dom.problemSelect.value = "custom";
    this.loadProblem("custom");
  }
}

// 起動
document.addEventListener("DOMContentLoaded", () => {
  window.treeApp = new TreeVisualizer();
});
