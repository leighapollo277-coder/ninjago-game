function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    
    // Ensure we are working on a sheet with data or the first sheet
    if (sheet.getLastRow() === 0 && ss.getSheets().length > 1) {
      sheet = ss.getSheets()[0];
    }

    var data = JSON.parse(e.postData.contents);
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Default Header if empty
    if (sheet.getLastRow() === 0) {
      headers = ["Timestamp", "Event", "Level", "SubLevel", "Target Word", "Selected Word", "Is Correct", "Settings", "User Email"];
      sheet.appendRow(headers);
    }

    var getCol = function(name) { return headers.indexOf(name); };
    
    // Prepare Row based on headers
    var newRow = new Array(headers.length || 9).fill("-");
    
    var mapping = {
      "Timestamp": data.timestamp || new Date().toISOString(),
      "Event": data.event || "ANSWER",
      "Level": data.level,
      "SubLevel": data.subLevel,
      "Target Word": data.targetWord,
      "Selected Word": data.selectedWord,
      "Is Correct": data.isCorrect,
      "Settings": data.settings,
      "User Email": data.userEmail || "anonymous",
      "User Name": data.userName
    };

    headers.forEach(function(h, i) {
      if (mapping[h] !== undefined) newRow[i] = mapping[h];
    });

    sheet.appendRow(newRow);
    
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

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    
    var lastSettings = null;
    var completedSubLevels = new Set();
    var latestSubLevel = null;
    var latestCorrectCount = 0;
    var latestWords = [];
    
    var debug = {
        totalRowsScanned: 0,
        sheetsFound: sheets.length,
        matchingEmailRows: 0,
        userMatchingEvents: [],
        allEventsInSheet: [], 
        matchingRowSamples: []
    };

    var globalEventSet = new Set();
    var userEventSet = new Set();

    // Scan ALL sheets
    sheets.forEach(function(sheet) {
      var sheetData = sheet.getDataRange().getValues();
      if (sheetData.length <= 1) return;
      
      var headers = sheetData[0];
      var getCol = function(name) { 
        // Try exact match, then case-insensitive
        var idx = headers.indexOf(name);
        if (idx !== -1) return idx;
        for (var k=0; k<headers.length; k++) {
          if (String(headers[k]).toLowerCase().trim() === name.toLowerCase()) return k;
        }
        return -1;
      };

      var emailIdx = getCol("User Email");
      var eventIdx = getCol("Event");
      var subLevelIdx = getCol("SubLevel");
      var isCorrectIdx = getCol("Is Correct");
      var settingsIdx = getCol("Settings");
      var wordIdx = getCol("Selected Word");

      debug.totalRowsScanned += (sheetData.length - 1);

      for (var i = 1; i < sheetData.length; i++) {
          var row = sheetData[i];
          if (!row || row.length === 0) continue;

          var rawEmail = emailIdx !== -1 ? String(row[emailIdx] || "") : "";
          if (rawEmail === "" && getCol("Email") !== -1) rawEmail = String(row[getCol("Email")] || "");
          
          var rowEmail = rawEmail.toLowerCase().trim();
          var event = eventIdx !== -1 ? String(row[eventIdx] || "").trim() : "-";
          
          if (event !== "-" && event !== "") globalEventSet.add(event);

          if (rowEmail === targetEmail) {
              debug.matchingEmailRows++;
              if (event !== "-") userEventSet.add(event);
              
              if (debug.matchingRowSamples.length < 5) {
                  debug.matchingRowSamples.push({sheet: sheet.getName(), row: i+1, data: row});
              }
              
              var subLevel = subLevelIdx !== -1 ? String(row[subLevelIdx] || "").trim() : "-";
              var isCorrect = isCorrectIdx !== -1 ? row[isCorrectIdx] : null;
              var settingsStr = settingsIdx !== -1 ? String(row[settingsIdx] || "") : null;

              if (event === "SYNC_SETTINGS" && settingsStr && settingsStr !== "-" && settingsStr !== "") {
                  try { 
                      var parsed = JSON.parse(settingsStr);
                      if (parsed) lastSettings = parsed;
                  } catch(e) {}
              }

              if (event === "COMPLETION" && subLevel !== "-" && subLevel !== "") {
                  completedSubLevels.add(subLevel.replace('課', '關'));
              }

              if (event.indexOf("ANSWER") !== -1 && (isCorrect === true || isCorrect === "TRUE" || String(isCorrect).toUpperCase() === "TRUE") && subLevel !== "-" && subLevel !== "") {
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
    });

    debug.allEventsInSheet = Array.from(globalEventSet);
    debug.userMatchingEvents = Array.from(userEventSet);

    var result = {
        settings: lastSettings ? JSON.stringify(lastSettings) : null,
        reconstructedStatus: {
            subLevels: Array.from(completedSubLevels)
        },
        debugInfo: debug
    };

    if (latestSubLevel && !completedSubLevels.has(latestSubLevel)) {
        result.cloudSession = {
            email: targetEmail, // Include user email for identity verification
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
