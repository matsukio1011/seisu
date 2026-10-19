/**
 * ====================================================================
 * ルートで約分マスター / 算数・数学トレーニング
 * 全PC共通オンラインランキング連携用 Google Apps Script (GAS) コード
 * ====================================================================
 * 
 * 【重要：403 Forbidden（アクセス権が必要です）が出る場合の対処】
 * 
 * すでにデプロイされている場合でも、アクセス権限を「全員」に変更する必要があります：
 * 1. Apps Script 画面の右上「デプロイ」青色ボタン > 「デプロイを管理」をクリック
 * 2. 左側の「有効なデプロイ」から対象を選び、右上の「鉛筆アイコン（編集）」をクリック
 * 3. 「バージョン」: 「新バージョン」を選択
 * 4. 「アクセスできるユーザー」: 「全員 (Anyone)」に設定 ★必須★
 *    （※「自分のみ」や「ドメイン内」になっていると他のPCや外部からアクセスできません）
 * 5. 「デプロイ」をクリック
 * 
 * これでどのPCからでもログイン不要でランキングが保存・表示されます！
 * ====================================================================
 */

function doGet(e) {
  var sheet = getOrCreateSheet();
  
  // GET経由でのスコア登録フォールバック（ブラウザCORS対策）
  if (e && e.parameter && e.parameter.action === 'submit') {
    try {
      var p = e.parameter;
      var nowStr = Utilities.formatDate(new Date(), "Asia/Tokyo", "yyyy/MM/dd HH:mm");
      sheet.appendRow([
        p.name ? String(p.name).substring(0, 15) : "名無し",
        p.course || "上級",
        Number(p.targetStreak) || 10,
        Number(p.timeSeconds) || 0,
        p.clearTime || "",
        p.accuracy || "100%",
        p.date || nowStr
      ]);
    } catch (err) {}
  }
  
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
