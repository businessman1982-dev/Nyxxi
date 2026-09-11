/**
 * Nyxxi — lead sink for Google Sheets.
 *
 * Turns a Google Sheet into the endpoint the signup form posts to, so every
 * address that comes in lands as a row you own. Free, no third party.
 *
 * SETUP
 *   1. Create a Google Sheet. Name the first tab "Leads" (or change SHEET_NAME).
 *   2. Extensions -> Apps Script. Delete the placeholder, paste this file, save.
 *   3. Deploy -> New deployment -> type "Web app".
 *        Execute as:        Me
 *        Who has access:    Anyone            <- required; "Anyone with Google
 *                                                account" will reject visitors
 *   4. Authorise when prompted, then copy the /exec URL it gives you.
 *   5. In your .env:
 *        VITE_SIGNUP_ENDPOINT=<that /exec URL>
 *        VITE_SIGNUP_FORMAT=form
 *
 *   VITE_SIGNUP_FORMAT=form is not optional. Apps Script cannot answer the CORS
 *   preflight that a JSON post triggers, so json mode fails in the browser.
 *
 * Re-deploying after an edit: Deploy -> Manage deployments -> edit -> New version.
 * A brand new deployment gives you a different URL.
 */

var SHEET_NAME = "Leads";
var HEADERS = ["Received", "Email", "Plan", "Source", "Sent at"];

function doPost(e) {
  try {
    var data = (e && e.parameter) || {};

    // Also accept a JSON body, for a caller that can manage the preflight.
    if (!data.email && e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        // leave data as-is; the guard below reports it
      }
    }

    var email = String(data.email || "").trim();
    if (!email || email.indexOf("@") === -1) {
      return json({ ok: false, error: "no email" });
    }

    var sheet = getSheet();

    // One row per address: a repeat signup updates rather than duplicates.
    var existing = findRow(sheet, email);
    var row = [new Date(), email, data.plan || "", data.source || "", data.at || ""];
    if (existing > 0) {
      sheet.getRange(existing, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/** Lets you open the /exec URL in a browser to confirm the deployment is live. */
function doGet() {
  return json({ ok: true, rows: Math.max(0, getSheet().getLastRow() - 1) });
}

function getSheet() {
  var book = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = book.getSheetByName(SHEET_NAME) || book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function findRow(sheet, email) {
  var last = sheet.getLastRow();
  if (last < 2) return -1;
  var emails = sheet.getRange(2, 2, last - 1, 1).getValues();
  for (var i = 0; i < emails.length; i++) {
    if (String(emails[i][0]).trim().toLowerCase() === email.toLowerCase()) return i + 2;
  }
  return -1;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
