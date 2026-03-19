function doPost(e) {
  try {
    var sheetName = "Leads";
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
    }

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "timestamp",
        "name",
        "package",
        "city",
        "source",
        "notes"
      ]);
    }

    var payload = JSON.parse(e.postData.contents || "{}");

    sheet.appendRow([
      payload.timestamp || new Date().toISOString(),
      payload.name || "",
      payload.package || "",
      payload.city || "",
      payload.source || "",
      payload.notes || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({
        ok: true,
        message: "Lead stored"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        ok: false,
        error: String(error)
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
