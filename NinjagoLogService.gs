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
      sheet.appendRow(["Timestamp", "Event", "Level", "SubLevel", "Target Word", "Selected Word", "Is Correct"]);
      // Style the header: Bold and Light Gray background
      sheet.getRange(1, 1, 1, 7).setFontWeight("bold").setBackground("#f1f1f1");
      sheet.setFrozenRows(1); // Freeze the first row
    }

    var data = JSON.parse(e.postData.contents);
    
    // Append a row: [Timestamp, Event, Level, SubLevel, TargetWord, SelectedWord, IsCorrect]
    sheet.appendRow([
      data.timestamp,
      data.event || "ANSWER",
      data.level,
      data.subLevel,
      data.targetWord || "-",
      data.selectedWord || "-",
      data.isCorrect !== undefined ? data.isCorrect : "-"
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({result: "success"}))
      .setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({result: "error", message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: Test function to verify sheet access from within GAS editor
function testLog() {
  doPost({
    postData: {
      contents: JSON.stringify({
        timestamp: new Date().toISOString(),
        event: "COMPLETION",
        level: 1,
        subLevel: "all",
        targetWord: "N/A",
        selectedWord: "N/A",
        isCorrect: true
      })
    }
  });
}
