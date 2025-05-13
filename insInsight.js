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
	if (!parsed.status) {
	return {
		status: false,
		data: [],
		error: parsed.message || parsed.error || 'API 요청 실패'
	};
	}
	const viewCount    = parsed.is_video ? parsed.video_view_count : '';
	const commentCount = parsed.edge_media_to_parent_comment?.count ?? '';
	const likeCount    = parsed.edge_media_preview_like?.count ?? '';

	return {
		status: true,
		data: [viewCount, commentCount, likeCount]
	};
};

const collectInstagramInsight = () => {
	runInsight(parseInstagramUrl, buildInstagramPostRequest, extractInstagramMetrics, '인스타');
};