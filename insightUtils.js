const writeResultsToSheet = (sheetName, headers, rows) => {
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const sheet = ss.getSheetByName(sheetName);

	sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
	if (rows.length) sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
};
  
const logFailures = (sheetName, failures) => {
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
	const rows = failures.map(f => [new Date(), f.id, f.error]);
	sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 3).setValues(rows);
};

const getInputs = (sheetName, rangeA1) => {
	const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
	if (!sheet) return [];
	return sheet.getRange(rangeA1).getValues().flat().filter(v => v);
};
