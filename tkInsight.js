const buildTikTokPostRequest = ids =>
	ids.map(id => ({
		url: `https://${Config.TK_HOST}/api/post/detail?videoId=${id}`,
		method: "get",
		headers: {
			"x-rapidapi-host": Config.TK_HOST,
			"x-rapidapi-key": Config.API_KEY,
		},
		muteHttpExceptions: true,
	}));

const extractTikTokMetrics = raw => {
	if (!raw) return { status: false, data: [], error: '빈 응답' };
	let parsed;
	try { parsed = JSON.parse(raw); } catch (e) {
		return { status: false, data: [], error: '잘못된 JSON' };
	}
	if (parsed.statusCode !== 0) {
		return {
		status: false,
		data: [],
		error: parsed.statusMsg || `statusCode ${parsed.statusCode}`,
		};
	}
	const stats = parsed.itemInfo?.itemStruct?.stats || {};
	const {
		playCount   = '',
		commentCount= '',
		diggCount   = '',
		collectCount= ''
	} = stats;
	return {
		status: true,
		data: [ playCount, commentCount, diggCount, collectCount ]
	};
};

const collectTikTokInsight = () => {
	runInsight(parseTikTokVideoId, buildTikTokPostRequest, extractTikTokMetrics, '틱톡');
};