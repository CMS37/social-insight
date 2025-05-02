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

const extractTikTokMetrics = json => {
	const data = JSON.parse(json);
	if (data.statusCode !== 0) {
		return { 
			status: false,
			data: [],
			error: data.statusMsg
		};
	}
	const stats = data.itemInfo?.itemStruct?.stats || {};
	const { playCount ='', commentCount = '', diggCount = '', collectCount = '' } = stats;
	return {
		status: true,
		data: [ playCount, commentCount, diggCount, collectCount ],
	};
};

const collectTikTokInsight = () => {
	runInsight(parseTikTokVideoId, buildTikTokPostRequest, extractTikTokMetrics, '틱톡');
};