const fetchTikTokComments = (videoId, sheetName) => {
	const ss = SpreadsheetApp.getActiveSpreadsheet();
	const sheet = ss.getSheetByName(sheetName);
	sheet.clear(); // 시트 초기화
	sheet.appendRow(['작성자', '댓글 내용', '댓글 좋아요 수']);
  
	let cursor = '0';
	let hasMore = true;
  
	while (hasMore) {
	  const response = UrlFetchApp.fetch(`https://${Config.TK_HOST}/api/comment/list?videoId=${videoId}&cursor=${cursor}`, {
		method: 'get',
		headers: {
		  'x-rapidapi-host': Config.TK_HOST,
		  'x-rapidapi-key': Config.API_KEY,
		},
		muteHttpExceptions: true,
	  });
  
	  const data = JSON.parse(response.getContentText()).data;
	  if (!data || !data.comments) break;
  
	  const rows = data.comments.map(comment => [
		comment.user.nickname,
		comment.text,
		comment.digg_count,
	  ]);
	  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 3).setValues(rows);
  
	  hasMore = data.has_more === 1;
	  cursor = data.cursor;
	}
};

