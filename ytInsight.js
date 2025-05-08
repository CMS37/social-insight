const fetchYouTubeInsightsBatch = () => {
	const sheet   = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
	const START   = 3;
	const lastRow = sheet.getLastRow();
	if (lastRow < START) return;

	const urls     = sheet.getRange(START,1,lastRow-START+1,1).getValues().flat();
	const rowCount = urls.length;
	const results  = Array.from({ length: rowCount }, () => Array(9).fill(''));
	const entries  = urls
	.map((u, i) => {
		const vid = parseYouTubeVideoId((u || '').toString().trim());
		return vid ? { rowIndex: i, vid } : null;
	})
	.filter(x => x);

	const CHUNK = 50;
	const [TW, TH] = [130, 73];
	for (let i = 0; i < entries.length; i += CHUNK) {
		const batch = entries.slice(i, i + CHUNK);
		const resp  = YouTube.Videos.list(
			'snippet,contentDetails,statistics',
			{ id: batch.map(e => e.vid).join(',') }
		);
		(resp.items || []).forEach(item => {
			const e = batch.find(b => b.vid === item.id);
			if (!e) return;
			const r = e.rowIndex;
			const { snippet: sn, contentDetails: cd = {}, statistics: st = {} } = item;
			const thumbUrl = sn.thumbnails?.default?.url || '';
			const thumbF   = thumbUrl ? `=IMAGE("${thumbUrl}",4,${TH},${TW})` : '';
			const publishDay = sn.publishedAt?.split('T')[0] || '';
			const duration   = cd.duration ? parseDuration(cd.duration) : '';
			const dislikes   = st.dislikeCount != null ? st.dislikeCount : 'N/A';

			results[r] = [
			sn.channelTitle || '',
			sn.title        || '',
			thumbF,
			publishDay,
			duration,
			st.viewCount    || 0,
			st.likeCount    || 0,
			dislikes,
			st.commentCount || 0
			];
		});
	}
	
	const dataRange = sheet.getRange(START,2,rowCount,results[0].length);
	dataRange
		.setValues(results)
		.setHorizontalAlignment('center')
		.setVerticalAlignment('middle');
	sheet.setColumnWidth(4, TW);
	sheet.setRowHeights(START, rowCount, TH);
};
	