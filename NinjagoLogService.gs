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
 * 10. Copy the Web App URL and paste it into the Game Settings.
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Check if sheet is empty and add headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Timestamp", "Event", "Level", "SubLevel", "Target Word", "Selected Word", "Is Correct", "Settings", "User Email"]);
      sheet.getRange(1, 1, 1, 9).setFontWeight("bold").setBackground("#f1f1f1");
      sheet.setFrozenRows(1);
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
    var eventType = e.parameter.event;
    
    if (!userEmail) return errorResponse("Missing userEmail");

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    
    var lastSettings = null;
    var completedSubLevels = new Set();
    var latestSubLevel = null;
    var latestCorrectCount = 0;
    var latestWords = [];

    // Helper to get column index
    var getCol = function(name) { return headers.indexOf(name); };
    
    // Iterate from bottom to top to get latest settings quickly, but we need full scan for completion reconstruction
    for (var i = 1; i < data.length; i++) {
        var row = data[i];
        if (row[getCol("User Email")] !== userEmail) continue;

        var event = row[getCol("Event")];
        var subLevel = row[getCol("SubLevel")];
        var isCorrect = row[getCol("Is Correct")];
        var settingsStr = row[getCol("Settings")];

        if (event === "SYNC_SETTINGS" && settingsStr && settingsStr !== "-") {
            try {
                lastSettings = JSON.parse(settingsStr);
            } catch(e) {}
        }

        if (event === "COMPLETION") {
            completedSubLevels.add(subLevel);
        }

        if (event === "ANSWER" && isCorrect === true) {
            if (subLevel !== latestSubLevel) {
                latestSubLevel = subLevel;
                latestCorrectCount = 1;
                latestWords = [row[getCol("Selected Word")]];
            } else {
                latestCorrectCount++;
                latestWords.push(row[getCol("Selected Word")]);
            }
        }
    }

    var result = {
        settings: lastSettings ? JSON.stringify(lastSettings) : null,
        reconstructedStatus: {
            subLevels: Array.from(completedSubLevels)
        }
    };

    // If latest level isn't in completed set, it's a "Partial Session"
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
