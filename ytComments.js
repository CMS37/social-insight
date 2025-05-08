const fetchYouTubeComments = () => {
	const ui = SpreadsheetApp.getUi();
	const ss    = SpreadsheetApp.getActiveSpreadsheet();
	const sheet = ss.getSheetByName('유튜브 댓글');
	const url = sheet.getRange('E2').getValue();
	const videoId = parseYouTubeVideoId(url);

	if (!videoId) {
		ui.alert('⚠️ videoId를 파싱할 수 없습니다.');
		return;
	}

	let nextPageToken = '';
	const allComments = [];

	do {
		const resp = YouTube.CommentThreads.list('snippet', {
		videoId,
		maxResults: 100,
		pageToken: nextPageToken,
		textFormat: 'plainText'
		});
		(resp.items || []).forEach(thread => {
		const c = thread.snippet.topLevelComment.snippet;
		allComments.push([
			c.authorDisplayName,
			c.textDisplay,
			c.likeCount
		]);
		});
		nextPageToken = resp.nextPageToken || '';
	} while (nextPageToken);

	if (allComments.length) {
		sheet
		.getRange(2, 1, allComments.length, 3)
		.setValues(allComments);
	}
};
  