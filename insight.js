const runInsight = (parseIdFn, buildRequestsFn, extractMetricsFn, sheetName) => {
	const ui = SpreadsheetApp.getUi();
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const sheet = ss.getSheetByName(sheetName);
	if (!sheet) return ui.alert(`❌ ${sheetName} 시트가 없습니다.`);

	const lastRow = sheet.getLastRow();
	if (lastRow < 2) return ui.alert('처리할 데이터가 없습니다.');

	const linkRange = sheet.getRange(2, 1, lastRow - 1, 1);
	const dataRange = sheet.getRange(2, 2, lastRow - 1, 4);
	const linkValues = linkRange.getValues().flat();
	const dataValues = dataRange.getValues();

	const pendingRows = [];
	const pendingIds = [];
	linkValues.forEach((link, idx) => {
	  const rowIdx = idx + 2;
	  const hasData = dataValues[idx].every(cell => cell !== '' && cell != null);
	  if (link && !hasData) {
		const id = parseIdFn(link);
		if (id) {
		  pendingRows.push(rowIdx);
		  pendingIds.push(id);
		}
	  }
	});
  
	if (pendingIds.length === 0) return ui.alert('채워야 할 빈 데이터가 없습니다.');

	const requests = buildRequestsFn(pendingIds);
	const responses = fetchAllInBatches(requests);
	const failures = [];



	responses.forEach((resp, j) => {
		const targetRow = pendingRows[j];
		const json = resp.getContentText();
		const { status, data, error} = extractMetricsFn(json);
		if (status) {
			sheet.getRange(targetRow, 2, 1, data.length).setValues([data]);
		} else {
			sheet.getRange(targetRow, 1).setBackground('#ffcccc');
			failures.push(`${targetRow}행 실패: ${error}`);
		}
	});
  
	ui.alert(`✅ ${sheetName} 인사이트 수집 완료\n\n요청한 포스트수: ${pendingIds.length}${failures.length ? `\n\n실패 상세:\n${failures.join('\n')}` : ''}`);
}

/*
틱톡 = statusCode -> statusMsg
인스타 = status -> errorMessage
*/