const fetchTikTokComments = () => {
	const ui = SpreadsheetApp.getUi();
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const sheet = ss.getSheetByName('틱톡 댓글');
	const url = sheet.getRange('E2').getValue();
	const videoId = parseTikTokVideoId(url);
  
	if (!videoId) {
		ui.alert('❌ videoId를 파싱할 수 없습니다.');
		return;
	}
  
	let cursor = '0';
	let hasMore = true;
  
	while (hasMore) {
		const apiUrl = `https://${Config.TK_HOST}/api/post/comments?videoId=${videoId}&count=50&cursor=${cursor}`;
		const response = UrlFetchApp.fetch(apiUrl, {
			method: 'get',
			headers: {
			'x-rapidapi-host': Config.TK_HOST,
			'x-rapidapi-key': Config.API_KEY,
			},
			muteHttpExceptions: true,
		});
	
		const data = JSON.parse(response.getContentText());
		if (!data || !data.comments) break;
	
		const rows = data.comments.map(comment => [
			comment.user.nickname,
			comment.text,
			comment.digg_count,
		]);
		sheet.getRange(2, 1, rows.length, 3).setValues(rows);
	
		hasMore = data.has_more === 1;
		cursor = data.cursor;
	}
  
	ui.alert('✅ 댓글 수집 완료');
};
