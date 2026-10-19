/**
 * ====================================================================
 * ルートで約分マスター / 算数・数学トレーニング
 * 全PC共通オンラインランキング連携用 Google Apps Script (GAS) コード
 * ====================================================================
 * 
 * 【設定手順（約2〜3分で完了・完全無料）】
 * 
 * 1. Googleドライブ (https://drive.google.com/) で新規の「Google スプレッドシート」を作成します。
 *    （シート名は適当でOK。例: 「ルート約分ランキング」）
 * 
 * 2. 上部メニューの「拡張機能」 > 「Apps Script」をクリックします。
 * 
 * 3. 表示されたエディタの内容（myFunctionなど）を全て消去し、
 *    このファイルの内容をすべてコピー＆ペーストします。
 * 
 * 4. 右上の「デプロイ」青色ボタン > 「新しいデプロイ」をクリックします。
 *    - 種類の選択（歯車アイコン）: 「ウェブアプリ」を選択
 *    - 説明: 「ルート約分ランキング」など
 *    - 次のユーザーとして実行: 「自分」
 *    - アクセスできるユーザー: 「全員」★必ず「全員」にしてください★
 * 
 * 5. 「デプロイ」をクリックし、初回のみGoogleのアクセス承認（「詳細」>「...へ移動」>「許可」）を行います。
 * 
 * 6. 完了画面に表示される「ウェブアプリ URL」（https://script.google.com/macros/s/.../exec）をコピーします。
 * 
 * 7. アプリ（rootyakubun.html）のヘッダーにある「🏆 ランキング」>「⚙️ 設定」を開き、
 *    コピーしたURLを貼り付けて「保存」をクリックします。
 * 
 * これで、どのPCからでも共通のランキングが表示・更新されるようになります！
 * ====================================================================
 */

function doGet(e) {
  var sheet = getOrCreateSheet();
  var data = sheet.getDataRange().getValues();
  var records = [];
  
  // 1行目は見出し [名前, コース, 連勝数, 秒数, クリアタイム, 正解率, 日時]
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (row[0]) {
      records.push({
        name: String(row[0]),
        course: String(row[1] || '上級'),
        targetStreak: Number(row[2]) || 0,
        timeSeconds: Number(row[3]) || 0,
        clearTime: String(row[4] || ''),
        accuracy: String(row[5] || '100%'),
        date: String(row[6] || '')
      });
    }
  }
  
  // ランキング順位付け: 目標連勝数 降順 -> クリアタイム（秒数） 昇順
  records.sort(function(a, b) {
    if (b.targetStreak !== a.targetStreak) {
      return b.targetStreak - a.targetStreak;
    }
    return a.timeSeconds - b.timeSeconds;
  });
  
  // 上位100件をJSONで返却
  return ContentService.createTextOutput(JSON.stringify(records.slice(0, 100)))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var sheet = getOrCreateSheet();
    var params = {};
    if (e && e.postData && e.postData.contents) {
      params = JSON.parse(e.postData.contents);
    }
    
    var nowStr = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd HH:mm");
    
    sheet.appendRow([
      params.name ? String(params.name).substring(0, 15) : "名無し",
      params.course || "上級",
      Number(params.targetStreak) || 10,
      Number(params.timeSeconds) || 0,
      params.clearTime || "",
      params.accuracy || "100%",
      params.date || nowStr
    ]);
    
    return doGet(e);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["名前", "コース", "連勝数", "秒数", "クリアタイム", "正解率", "登録日時"]);
    sheet.getRange(1, 1, 1, 7).setBackground("#1e1e38").setFontColor("#fbbf24").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}
