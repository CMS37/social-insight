const parseInstagramUrl = url => {
	return url
};

const buildInstagramPostRequest = urls =>
	urls.map(url => ({
		url: `https://${Config.INS_HOST}/post?url=${encodeURIComponent(url)}`,
		method: "get",
		headers: {
			"x-rapidapi-host": Config.INS_HOST,
			"x-rapidapi-key": Config.API_KEY,
		},
		muteHttpExceptions: true,
	}));

const extractInstagramMetrics = raw => {
	if (!raw) return { status: false, data: [], error: '빈 응답' };
	let parsed;
	try { parsed = JSON.parse(raw); } catch (e) {
		return { status: false, data: [], error: '잘못된 JSON' };
	}
	if (parsed.statusCode !== 0) {
		return {
			status: false,
			data: [], error: parsed.statusMsg || `statusCode ${parsed.statusCode}`
		};
	}
	const js = parsed.data.edge_media_to_parent_comment;
	const viewCount    = parsed.data.video_view_count ?? -1;
	const commentCount = js?.count ?? -1;
	const likeCount    = parsed.data.edge_media_preview_like?.count ?? -1;

	return {
		status: true,
		data: [viewCount, commentCount, likeCount]
	};
};

const collectInstagramInsight = () => {
	runInsight(parseInstagramUrl, buildInstagramPostRequest, extractInstagramMetrics, '인스타');
};