const collectInstagramUserInfo = () => {
	const ui   = SpreadsheetApp.getUi();
	const ss   = SpreadsheetApp.getActiveSpreadsheet();
	const name = '인스타 유저정보';
	const sheet = ss.getSheetByName(name);
	
	const lastRow = sheet.getLastRow();
	if (lastRow < 2) return ui.alert('❌ 수집할 유저네임이 없습니다.');

	const usernames = sheet
		.getRange(2, 1, lastRow - 1, 1)
		.getValues()
		.flat()
		.filter(id => id);

	const requests = usernames.map(username => ({
		url: `https://${Config.INS_HOST}/profile2?username=${encodeURIComponent(username)}`,
		method: 'get',
		headers: {
		'x-rapidapi-host': Config.INS_HOST,
		'x-rapidapi-key' : Config.API_KEY,
		},
		muteHttpExceptions: true
	}));

	const responses = fetchAllWithBackoff(requests);

	const rows = responses.map((resp, i) => {
		if (resp.getResponseCode() !== 200) {
			sheet.getRange(i + 2, 1).setBackground('#ffcccc');
			return ['', '', '', '', ''];
		}
		const data = JSON.parse(resp.getContentText());
		const fullName       = data.full_name       || '';
		const biography      = data.biography       || '';
		const linksArray     = data.bio_links       || [];
		const bioLinks       = linksArray.map(link => link.url).filter(u => u).join('\n');
		const followerCount  = data.follower_count  || 0;
		const followingCount = data.following_count || 0;
		return [ fullName, biography, bioLinks, followerCount, followingCount ];
	});

	sheet.getRange(2, 2, rows.length, 5).setValues(rows);
	
	ui.alert(`✅ ${name} 수집 완료\n처리한 사용자 수: ${rows.length}`);
}