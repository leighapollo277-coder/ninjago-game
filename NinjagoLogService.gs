/*
 * Google Apps Script to log data from Ninjago Game
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet (sheets.new).
 * 2. Go to Extensions > Apps Script.
 * 3. Delete any existing code and paste this script.
 * 4. Click 'Deploy' > 'New deployment'.
 * 5. Select type: 'Web app'.
 * 6. Description: 'Ninjago Game Log Service'.
 * 7. Execute as: 'Me'.
 * 8. Who has access: 'Anyone'.
 * 9. Click 'Deploy', authorize the script if prompted.
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    
    // Header definition
    var headerRow = ["Timestamp", "Event", "Level", "SubLevel", "Target Word", "Selected Word", "Is Correct", "Settings", "User Email"];

    // 1. Initial Setup: If sheet is empty, add headers
    if (lastRow === 0) {
      sheet.appendRow(headerRow);
      sheet.getRange(1, 1, 1, headerRow.length).setFontWeight("bold").setBackground("#f1f1f1");
      sheet.setFrozenRows(1);
    } 
    // 2. Migration: If transitioning from old version (7 cols) to new (9 cols)
    else if (sheet.getLastColumn() < 9) {
      var currentHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      if (currentHeaders.indexOf("User Email") === -1) {
        // Update header row to the full 9 columns
        sheet.getRange(1, 1, 1, headerRow.length).setValues([headerRow]);
        sheet.getRange(1, 1, 1, headerRow.length).setFontWeight("bold").setBackground("#f1f1f1");
      }
    }

    var data = JSON.parse(e.postData.contents);
    
    // Append a row: [Timestamp, Event, Level, SubLevel, TargetWord, SelectedWord, IsCorrect, Settings, UserEmail]
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
    var userEmail = e.parameter.userEmail;
    if (!userEmail) return errorResponse("Missing userEmail");

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify({})).setMimeType(ContentService.MimeType.JSON);

    var headers = data[0];
    var lastSettings = null;
    var completedSubLevels = new Set();
    var latestSubLevel = null;
    var latestCorrectCount = 0;
    var latestWords = [];

    // Helper to get column index safely
    var getCol = function(name) { 
        var idx = headers.indexOf(name);
        return idx; // Returns -1 if not found
    };
    
    var emailIdx = getCol("User Email");
    var eventIdx = getCol("Event");
    var subLevelIdx = getCol("SubLevel");
    var isCorrectIdx = getCol("Is Correct");
    var settingsIdx = getCol("Settings");
    var wordIdx = getCol("Selected Word");

    // Scan data
    for (var i = 1; i < data.length; i++) {
        var row = data[i];
        
        // If email column doesn't exist or doesn't match, skip
        if (emailIdx === -1 || row[emailIdx] !== userEmail) continue;

        var event = eventIdx !== -1 ? row[eventIdx] : null;
        var subLevel = subLevelIdx !== -1 ? row[subLevelIdx] : null;
        var isCorrect = isCorrectIdx !== -1 ? row[isCorrectIdx] : null;
        var settingsStr = settingsIdx !== -1 ? row[settingsIdx] : null;

        if (event === "SYNC_SETTINGS" && settingsStr && settingsStr !== "-") {
            try {
                lastSettings = JSON.parse(settingsStr);
            } catch(e) {}
        }

        if (event === "COMPLETION" && subLevel) {
            completedSubLevels.add(subLevel.replace('課', '關'));
        }

        if (event === "ANSWER" && isCorrect === true && subLevel) {
            var normalizedSubLevel = subLevel.replace('課', '關');
            if (normalizedSubLevel !== latestSubLevel) {
                latestSubLevel = normalizedSubLevel;
                latestCorrectCount = 1;
                latestWords = [wordIdx !== -1 ? row[wordIdx] : null];
            } else {
                latestCorrectCount++;
                latestWords.push(wordIdx !== -1 ? row[wordIdx] : null);
            }
        }
    }

    var result = {
        settings: lastSettings ? JSON.stringify(lastSettings) : null,
        reconstructedStatus: {
            subLevels: Array.from(completedSubLevels)
        }
    };

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
