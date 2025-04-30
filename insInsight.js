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

const extractInstagramMetrics = json => {
	const data = JSON.parse(json);
	if (!data.status) {
		return {
			status: false,
			data : [],
			error: data.errorMessage
		}
	}
	const viewCount = data.video_view_count || -1;
	const playCount = data.video_play_count || -1;
	const commentCount = data.edge_media_to_parent_comment?.count || -1;
	const likeCount = data.edge_media_preview_like?.count || -1;
	return {
		status: true,
		data: [ viewCount, playCount, commentCount, likeCount ],
	};
}

const collectInstagramInsight = () => {
	runInsight(parseInstagramUrl, buildInstagramPostRequest, extractInstagramMetrics, '인스타');
};