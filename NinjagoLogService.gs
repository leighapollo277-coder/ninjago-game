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

    var eventParam = e.parameter.event;
    if (eventParam === "GET_DASHBOARD") {
        return getDashboardData(targetEmail);
    }

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

function getDashboardData(targetEmail) {
    try {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheets = ss.getSheets();
        
        var stats = {
            uniqueCorrect: new Set(),
            uniqueIncorrect: new Set(),
            dailyQuestions: {}, // "YYYY-MM-DD" -> count
            dailyMinutes: {}, // "YYYY-MM-DD" -> count
            dailyMastery: {}, // New: Track Mastery Growth
            wordFrequency: {}, // word -> {correct: 0, incorrect: 0, firstCorrectIndex: -1, lastWasCorrect: false, triesBeforeCorrect: 0}
            weeklyStats: {}, // "YYYY-WW" -> {correct: 0, total: 0}
            levelStats: {}, // level -> {correct: 0, total: 0}
            totalQuestions: 0,
            totalDurationMs: 0,
            sampleLogs: [],
            topIncorrect: [] // New: To store top incorrect words
        };
        
        var lastTimestamp = null;
        var sessionGapThreshold = 20 * 60 * 1000; // 20 mins gap = new session
        
        var totalRowsScanned = 0;
        var totalEmailMatches = 0;
        
        sheets.forEach(function(sheet) {
            var sheetData = sheet.getDataRange().getValues();
            if (sheetData.length <= 1) return;
            
            var headers = sheetData[0];
            var getCol = function(name) {
                var idx = headers.indexOf(name);
                if (idx !== -1) return idx;
                for (var k=0; k<headers.length; k++) {
                    if (String(headers[k]).toLowerCase().trim() === name.toLowerCase()) return k;
                }
                return -1;
            };

            var emailIdx = getCol("User Email");
            var eventIdx = getCol("Event");
            var wordIdx = getCol("Target Word");
            var isCorrectIdx = getCol("Is Correct");
            var timestampIdx = getCol("Timestamp");
            var subLevelIdx = getCol("SubLevel");

            for (var i = 1; i < sheetData.length; i++) {
                var row = sheetData[i];
                totalRowsScanned++;
                var rowEmail = emailIdx !== -1 ? String(row[emailIdx] || "").toLowerCase().trim() : "";
                if (rowEmail !== targetEmail) continue;
                totalEmailMatches++;

                var event = eventIdx !== -1 ? String(row[eventIdx] || "").trim() : "";
                if (event.indexOf("ANSWER") === -1) continue;

                var timestampRaw = timestampIdx !== -1 ? row[timestampIdx] : null;
                var timestamp = timestampRaw ? new Date(timestampRaw) : null;
                if (!timestamp || isNaN(timestamp.getTime())) continue;

                var word = wordIdx !== -1 ? String(row[wordIdx] || "").trim() : "";
                var isCorrect = isCorrectIdx !== -1 ? (row[isCorrectIdx] === true || row[isCorrectIdx] === "TRUE" || String(row[isCorrectIdx]).toUpperCase() === "TRUE") : false;
                var subLevel = subLevelIdx !== -1 ? String(row[subLevelIdx] || "").trim() : "Unknown";

                var ds = Utilities.formatDate(timestamp, "GMT+8", "yyyy-MM-dd");
                
                // Track Unique Correct (Mastery) with timestamp
                if (isCorrect && (!stats.wordFrequency[word] || !stats.wordFrequency[word].everCorrect)) {
                  if (!stats.dailyMastery[ds]) stats.dailyMastery[ds] = new Set();
                  stats.dailyMastery[ds].add(word);
                }
                var weekStr = getWeekIdentifier(timestamp);

                // Basic stats
                stats.totalQuestions++;
                if (isCorrect) {
                   stats.uniqueCorrect.add(word);
                } else {
                   stats.uniqueIncorrect.add(word);
                }
                
                if (stats.sampleLogs.length < 5) {
                    stats.sampleLogs.push({ date: ds, word: word, correct: isCorrect, sub: subLevel });
                }

                // Daily Activity
                stats.dailyQuestions[ds] = (stats.dailyQuestions[ds] || 0) + 1;
                
                // Duration Calculation
                if (lastTimestamp) {
                    var diff = timestamp.getTime() - lastTimestamp.getTime();
                    if (diff > 0 && diff < sessionGapThreshold) {
                        stats.totalDurationMs += diff;
                        stats.dailyMinutes[ds] = (stats.dailyMinutes[ds] || 0) + (diff / (60 * 1000));
                    }
                }
                lastTimestamp = timestamp;

                // Word Frequency & Analysis
                if (!stats.wordFrequency[word]) {
                    stats.wordFrequency[word] = { correct: 0, incorrect: 0, attempts: [], finalCorrect: false, everCorrect: false };
                }
                if (isCorrect) stats.wordFrequency[word].correct++;
                else stats.wordFrequency[word].incorrect++;
                stats.wordFrequency[word].attempts.push(isCorrect);
                stats.wordFrequency[word].finalCorrect = isCorrect;
                if (isCorrect) stats.wordFrequency[word].everCorrect = true;

                // Weekly Trend
                if (!stats.weeklyStats[weekStr]) stats.weeklyStats[weekStr] = { correct: 0, total: 0 };
                stats.weeklyStats[weekStr].total++;
                if (isCorrect) stats.weeklyStats[weekStr].correct++;

                // Level Heatmap
                if (!stats.levelStats[subLevel]) stats.levelStats[subLevel] = { correct: 0, total: 0 };
                stats.levelStats[subLevel].total++;
                if (isCorrect) stats.levelStats[subLevel].correct++;
            }
        });

        // Initialize last 30 days with 0 to ensure charts have a baseline
        var nowMonthStr = new Date();
        for (var dOffset = 0; dOffset < 30; dOffset++) {
            var d = new Date(nowMonthStr.getTime() - dOffset * 24 * 60 * 60 * 1000);
            var ds = Utilities.formatDate(d, "GMT+8", "yyyy-MM-dd");
            if (stats.dailyQuestions[ds] === undefined) stats.dailyQuestions[ds] = 0;
            if (stats.dailyMinutes[ds] === undefined) stats.dailyMinutes[ds] = 0;
        }

        // Level Details: Find all words per level and categorize them
        var levelDetails = {};
        sheets.forEach(function(s) {
            var name = s.getName();
            // Broader detection: contains a digit, "level", "all", or "words"
            if (/\d+/.test(name) || name.toLowerCase().indexOf("level") !== -1 || name === "all") {
                var sheetData = s.getDataRange().getValues();
                if (sheetData.length <= 1) return;
                
                // Smart column detection: Skip if Column A looks like a timestamp
                var wordColIdx = 0;
                var sampleVal = String(sheetData[1][0] || "");
                // Regex for ISO timestamp (2025-01-01T...) or standard GAS date (2025-01-01 10:00:00)
                if (/\d{4}-\d{2}-\d{2}/.test(sampleVal) || sampleVal.indexOf("202") === 0) {
                    // Column A looks like a date/timestamp, try Column B
                    wordColIdx = 1;
                    
                    // But if Column B is also empty or looks like a timestamp, this sheet is likely a LOG sheet!
                    if (sheetData.length > 1) {
                      var bSample = String(sheetData[1][1] || "");
                      if (!bSample || /\d{4}-\d{2}-\d{2}/.test(bSample)) {
                        return; // Skip this sheet entirely (it's likely a log sheet)
                      }
                    }
                }

                var levelWords = [];
                for (var j=1; j<sheetData.length; j++) {
                    var w = String(sheetData[j][wordColIdx] || "").trim();
                    if (w && w.toLowerCase() !== "word") levelWords.push(w);
                }
                
                var mastered = [];
                var unresolved = [];
                var untested = [];
                
                levelWords.forEach(function(w) {
                    var wordStat = stats.wordFrequency[w];
                    if (!wordStat) {
                        untested.push(w);
                    } else if (wordStat.finalCorrect) {
                        mastered.push(w);
                    } else {
                        unresolved.push(w);
                    }
                });
                
                levelDetails[name] = {
                    total: levelWords.length,
                    mastered: mastered,
                    unresolved: unresolved,
                    untested: untested
                };
            }
        });

        // Finalize Mastery Trend (Cumulative Growth)
        var cumulativeMasteryTrend = [];
        var masterSet = new Set();
        var dates = Object.keys(stats.dailyQuestions).sort(); // Use dailyQuestions dates as a baseline
        dates.forEach(function(d) {
          if (stats.dailyMastery[d]) {
            stats.dailyMastery[d].forEach(w => masterSet.add(w));
          }
          cumulativeMasteryTrend.push([d, masterSet.size]);
        });

        // Calculate top incorrect words
        stats.topIncorrect = Object.entries(stats.wordFrequency)
            .filter(([, data]) => data.incorrect > 0)
            .sort(([, a], [, b]) => b.incorrect - a.incorrect)
            .slice(0, 10) // Get top 10
            .map(([word, data]) => ({ word, incorrect: data.incorrect, correct: data.correct }));

        // Convert Sets to arrays for sorting
        var result = {
            uniqueCorrectCount: stats.uniqueCorrect.size,
            uniqueIncorrectCount: stats.uniqueIncorrect.size,
            uniqueCorrectWords: Array.from(stats.uniqueCorrect).sort(),
            uniqueIncorrectWords: Array.from(stats.uniqueIncorrect).sort(),
            totalQuestions: stats.totalQuestions,
            totalMinutes: Math.round(stats.totalDurationMs / (60 * 1000)),
            avgTimePerQuestion: stats.totalQuestions > 0 ? (stats.totalDurationMs / stats.totalQuestions / 1000).toFixed(1) : 0,
            dailyQuestions: Object.entries(stats.dailyQuestions).sort(),
            dailyMinutes: Object.entries(stats.dailyMinutes).sort(),
            masteryGrowth: cumulativeMasteryTrend,
            weeklyAccuracy: stats.weeklyStats,
            levelStats: stats.levelStats,
            levelDetails: levelDetails,
            wordAnalysis: summarizeWordAnalysis(stats.wordFrequency),
            debug: {
                totalRowsScanned: totalRowsScanned,
                totalEmailMatches: totalEmailMatches,
                matchingEmail: targetEmail,
                sampleLogs: stats.sampleLogs || []
            }
        };

        return ContentService.createTextOutput(JSON.stringify(result))
            .setMimeType(ContentService.MimeType.JSON);

    } catch (err) {
        return errorResponse(err.toString());
    }
}

function getWeekIdentifier(date) {
    var d = new Date(date);
    d.setHours(0,0,0,0);
    d.setDate(d.getDate() + 4 - (d.getDay()||7));
    var yearStart = new Date(d.getFullYear(),0,1);
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return d.getFullYear() + "-W" + (weekNo < 10 ? "0"+weekNo : weekNo);
}

function summarizeWordAnalysis(wordFreq) {
    var summary = [];
    for (var word in wordFreq) {
        var data = wordFreq[word];
        var attempts = data.attempts;
        var triesBeforeCorrect = -1;
        var turnedCorrectToIncorrect = false;
        
        // Calculate Tries Before Correct
        var firstCorrectIdx = attempts.indexOf(true);
        if (firstCorrectIdx !== -1) {
            triesBeforeCorrect = firstCorrectIdx; // 0 means first try was correct
        }

        // Calculate "turned from correct to incorrect finally"
        var hasCorrect = attempts.indexOf(true) !== -1;
        var finallyIncorrect = attempts[attempts.length - 1] === false;
        if (hasCorrect && finallyIncorrect) {
            turnedCorrectToIncorrect = true;
        }

        summary.push({
            word: word,
            correct: data.correct,
            incorrect: data.incorrect,
            triesBeforeCorrect: triesBeforeCorrect,
            turnedCorrectToIncorrect: turnedCorrectToIncorrect,
            finalCorrect: data.finalCorrect
        });
    }
    return summary;
}

function errorResponse(msg) {
  return ContentService.createTextOutput(JSON.stringify({result: "error", message: msg}))
    .setMimeType(ContentService.MimeType.JSON);
}
