const runInsight = (parseIdFn, buildRequestsFn, extractMetricsFn, sheetName) => {
	const ui    = SpreadsheetApp.getUi();
	const ss    = SpreadsheetApp.getActiveSpreadsheet();
	const sheet = ss.getSheetByName(sheetName);
	if (!sheet) return ui.alert(`❌ ${sheetName} 시트가 없습니다.`);

	const lastRow = sheet.getLastRow();
	if (lastRow < 2) return ui.alert('처리할 데이터가 없습니다.');

	const links     = sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat();
	const existing  = sheet.getRange(2, 2, lastRow - 1, 4).getValues();
	const pendingRows = [], pendingIds = [];

	links.forEach((link, idx) => {
		const row = idx + 2;
		const hasData = existing[idx].every(cell => cell != null && cell !== '');
		if (link && !hasData) {
			const id = parseIdFn(link);
			if (id) {
				pendingRows.push(row);
				pendingIds.push(id);
			}
		}
	});

	if (!pendingIds.length) return ui.alert('✅ 빈 데이터가 없습니다.');

	const requests  = buildRequestsFn(pendingIds);
	const responses = fetchAllInBatches(requests);
	const failures  = [];

	responses.forEach((resp, j) => {
		const row = pendingRows[j];

		if (resp.getResponseCode() !== 200) {
			sheet.getRange(row, 1).setBackground('#ffcccc');
			failures.push(`${row}행 실패: HTTP ${resp.getResponseCode()}`);
			return;
		}

		const raw = resp.getContentText().trim();
		const { status, data, error } = extractMetricsFn(raw);

		if (status) {
			sheet.getRange(row, 2, 1, data.length).setValues([data]);
		} else {
			sheet.getRange(row, 1).setBackground('#ffcccc');
			failures.push(`${row}행 실패: ${error}`);
		}
	});

	ui.alert(
		`✅ ${sheetName} 인사이트 완료\n` +
		`요청: ${pendingIds.length}건${failures.length ? `\n실패:\n${failures.join('\n')}` : ''}`
	);
};