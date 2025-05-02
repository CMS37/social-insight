const log = message => Logger.log(message);

const getRequiredProperty = key => {
	const value = PropertiesService.getScriptProperties().getProperty(key);
	if (!value) throw new Error(`"${key}" 항목이 설정되어 있지 않습니다.`);
	return value;
};

const fetchAllInBatches = (requests, batchSize = Config.BATCH_SIZE, delay = Config.DELAY_MS) => {
	const responses = [];
	for (let i = 0; i < requests.length; i += batchSize) {
		responses.push(...UrlFetchApp.fetchAll(requests.slice(i, i + batchSize)));
		if (i + batchSize < requests.length) Utilities.sleep(delay);
	}
	return responses;
};

const parseTikTokVideoId = url => {
	const match = url.match(/\/(?:video|v)\/(\d+)/) || url.match(/vm\.tiktok\.com\/(\w+)/);
	return match ? match[1] : null;
};