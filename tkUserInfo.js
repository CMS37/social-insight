const collectTikTokUserInfo = () => {
	const ui = SpreadsheetApp.getUi();
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const sheetName = '틱톡 유저정보';
	const sheet = ss.getSheetByName(sheetName);

	const lastRow = sheet.getLastRow();
	if (lastRow < 2) return ui.alert('❌ 수집할 유저네임이 없습니다.');

	const userIds = sheet
		.getRange(2, 1, lastRow - 1, 1)
		.getValues()
		.flat()
		.filter(id => id);

	sheet.getRange(2, 1, lastRow - 1, 1).setBackground(null);

	const existing = sheet.getRange(2, 2, lastRow - 1, 6).getValues();

	const pendingRows = [];
	const pendingIds = [];
	userIds.forEach((id, i) => {
		if (!id) return;
		const rowData = existing[i];
		const allFilled = rowData.every(cell => cell !== '' && cell != null);
		if (!allFilled) {
			pendingRows.push(i + 2);
			pendingIds.push(id);
		}
	});

	if (pendingIds.length === 0) {
		ui.alert('✅ 모든 사용자 정보가 이미 채워져 있습니다.');
		return;
	}

	const requests = pendingIds.map(id => ({
		url: `https://${Config.TK_HOST}/api/user/info?uniqueId=${encodeURIComponent(id)}`,
		method: 'get',
		headers: {
		'x-rapidapi-host': Config.TK_HOST,
		'x-rapidapi-key': Config.API_KEY,
		},
		muteHttpExceptions: true,
	}));

	const responses = fetchAllWithBackoff(requests);
	const numRows = lastRow - 1;
	const allValues = Array.from({ length: numRows }, () => Array(6).fill(''));
	responses.forEach((resp, idx) => {
		const row = pendingRows[idx];
		const data = JSON.parse(resp.getContentText());

		if (data.statusCode !== 0) {
			sheet.getRange(row, 1).setBackground('#ffcccc');
		} else {
			const user = data.userInfo.user;
			const stats = data.userInfo.stats;
			const values = [
				user.id || '',
				user.nickname || '',
				user.signature || '',
				user.bioLink?.link || '',
				stats.followingCount || 0,
				stats.followerCount || 0,
			];
			allValues[row - 2] = values;
		}
	});

	sheet.getRange(2, 2, numRows, 6).setValues(allValues);

	ui.alert(`✅ ${sheetName} 수집 완료\n요청한 사용자 수: ${pendingIds.length}`);
};