function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    
    // Header definition - 確保順序與存入時一致
    var headerRow = ["Timestamp", "Event", "Level", "SubLevel", "Target Word", "Selected Word", "Is Correct", "Settings", "User Email"];

    // 1. Initial Setup: If sheet is empty, add headers
    if (lastRow === 0) {
      sheet.appendRow(headerRow);
      sheet.getRange(1, 1, 1, headerRow.length).setFontWeight("bold").setBackground("#f1f1f1");
      sheet.setFrozenRows(1);
    } 
    // 2. Migration: If transitioning from old version
    else {
      var currentLastCol = sheet.getLastColumn();
      if (currentLastCol < 9) {
          var headers = sheet.getRange(1, 1, 1, currentLastCol).getValues()[0];
          if (headers.indexOf("User Email") === -1) {
              sheet.getRange(1, 1, 1, headerRow.length).setValues([headerRow]);
          }
      }
    }

    var data = JSON.parse(e.postData.contents);
    
    // Append a row
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.event || "ANSWER",
      data.level || "-",
      data.subLevel || "-",
      data.targetWord || "-",
      data.selectedWord || "-",
      data.isCorrect !== undefined ? data.isCorrect : "-",
      data.settings || "-",
      data.userEmail || "anonymous"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({result: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({result: "error", message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var userEmailRaw = e.parameter.userEmail;
    if (!userEmailRaw) return errorResponse("Missing userEmail");
    
    var targetEmail = String(userEmailRaw).toLowerCase().trim();

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    var headers = data[0];
    var lastSettings = null;
    var completedSubLevels = new Set();
    var latestSubLevel = null;
    var latestCorrectCount = 0;
    var latestWords = [];
    
    var debug = {
        totalRowsScanned: data.length - 1,
        matchingEmailRows: 0,
        availableHeaders: headers,
        userMatchingEvents: [],
        allEventsInSheet: [], 
        matchingRowSamples: []
    };

    var getCol = function(name) { return headers.indexOf(name); };
    
    var emailIdx = getCol("User Email");
    var eventIdx = getCol("Event");
    var subLevelIdx = getCol("SubLevel");
    var isCorrectIdx = getCol("Is Correct");
    var settingsIdx = getCol("Settings");
    var wordIdx = getCol("Selected Word");

    var globalEventSet = new Set();
    var userEventSet = new Set();

    for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (!row || row.length === 0) continue;

        var rawEmail = emailIdx !== -1 ? String(row[emailIdx] || "") : "anonymous";
        var rowEmail = rawEmail.toLowerCase().trim();
        var event = eventIdx !== -1 ? String(row[eventIdx] || "").trim() : "-";
        
        if (event !== "-" && event !== "") globalEventSet.add(event);

        // 核心邏輯：匹配使用者 Email
        if (rowEmail === targetEmail) {
            debug.matchingEmailRows++;
            if (event !== "-") userEventSet.add(event);
            
            if (debug.matchingRowSamples.length < 5) {
                debug.matchingRowSamples.push(row);
            }
            
            var subLevel = subLevelIdx !== -1 ? String(row[subLevelIdx] || "").trim() : "-";
            var isCorrect = isCorrectIdx !== -1 ? row[isCorrectIdx] : null;
            var settingsStr = settingsIdx !== -1 ? String(row[settingsIdx] || "") : null;

            // 1. 恢復明確設定 (SYNC_SETTINGS)
            if (event === "SYNC_SETTINGS" && settingsStr && settingsStr !== "-" && settingsStr !== "") {
                try { 
                    var parsed = JSON.parse(settingsStr);
                    if (parsed) lastSettings = parsed;
                } catch(e) {}
            }

            // 2. 恢復已完成關卡 (COMPLETION)
            if (event === "COMPLETION" && subLevel !== "-" && subLevel !== "") {
                completedSubLevels.add(subLevel.replace('課', '關'));
            }

            // 3. 恢復部分進度 (ANSWER)
            // 注意：這裡我們使用鬆散匹配，只要 event 包含 ANSWER 就算（有些舊資料可能是 ANSWER_07 之類的）
            if (event.indexOf("ANSWER") !== -1 && (isCorrect === true || isCorrect === "TRUE") && subLevel !== "-" && subLevel !== "") {
                var normalizedSubLevel = subLevel.replace('課', '關');
                if (normalizedSubLevel !== latestSubLevel) {
                    latestSubLevel = normalizedSubLevel;
                    latestCorrectCount = 1;
                    latestWords = [wordIdx !== -1 ? String(row[wordIdx] || "") : null];
                } else {
                    latestCorrectCount++;
                    latestWords.push(wordIdx !== -1 ? String(row[wordIdx] || "") : null);
                }
            }
        }
    }

    debug.allEventsInSheet = Array.from(globalEventSet);
    debug.userMatchingEvents = Array.from(userEventSet);

    var result = {
        settings: lastSettings ? JSON.stringify(lastSettings) : null,
        reconstructedStatus: {
            subLevels: Array.from(completedSubLevels)
        },
        debugInfo: debug
    };

    // 如果最後一個活動關卡尚未標記為完成，則視為可恢復的會話
    if (latestSubLevel && !completedSubLevels.has(latestSubLevel)) {
        result.cloudSession = {
            subName: latestSubLevel,
            score: latestCorrectCount,
            words: latestWords,
            timestamp: new Date().toISOString()
        };
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
      return errorResponse(err.toString());
  }
}

function errorResponse(msg) {
  return ContentService.createTextOutput(JSON.stringify({result: "error", message: msg}))
    .setMimeType(ContentService.MimeType.JSON);
}
