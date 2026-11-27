const CACHE_PREFIX = 'onnx-model-cache';
const CACHE_NAME = `${CACHE_PREFIX}-v2`;

/**
 * @param {string[]} chunkUrls
 * @param {((share: number) => void) | undefined} onProgress
 */
async function fetchModelChunks(chunkUrls, onProgress) {
	await clearOldCaches();

	let hasCache = false;
	const cache = await caches.open(CACHE_NAME);
	const cachedResponses = await Promise.all(
		chunkUrls.map((/** @type {string} */ url) => cache.match(url))
	);

	let done = 0;
	/** @param {ArrayBuffer} buffer */
	const tick = (buffer) => {
		done += 1;
		onProgress?.(done / chunkUrls.length);
		return buffer;
	};

	// add cache
	const fetchPromises = chunkUrls.map((/** @type {string} */ url, /** @type {number} */ index) => {
		if (!cachedResponses[index]) {
			// console.log(`Fetching and caching: ${url}`);
			return fetch(url).then((response) => {
				if (response.ok) {
					cache.put(url, response.clone());
					return response.arrayBuffer().then(tick);
				} else {
					throw new Error(`Failed to fetch ${url}`);
				}
			});
		} else {
			hasCache = true;
			// console.log(`Using cached version: ${url}`);
			return cachedResponses[index].arrayBuffer().then(tick);
		}
	});

	const modelBuffers = await Promise.all(fetchPromises);
	return { hasCache, modelBuffers };
}

/**
 * Downloads (or reads from the Cache API) every model chunk and joins them.
 * `onProgress` receives the share of chunks that are ready, from 0 to 1.
 * @param {string[]} urls
 * @param {(share: number) => void} [onProgress]
 */
export async function fetchAndMergeChunks(urls, onProgress) {
	const { hasCache, modelBuffers: chunks } = await fetchModelChunks(urls, onProgress);
	const totalSize = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
	const mergedArray = new Uint8Array(totalSize);
	let offset = 0;
	for (const chunk of chunks) {
		mergedArray.set(new Uint8Array(chunk), offset);
		offset += chunk.byteLength;
	}
	return { hasCache, mergedArray: mergedArray.buffer };
}

async function clearOldCaches() {
	const cacheNames = await caches.keys();
	await Promise.all(
		cacheNames.map((name) => {
			if (name !== CACHE_NAME && name.includes(CACHE_PREFIX)) {
				console.log(`Deleting old cache: ${name}`);
				return caches.delete(name);
			}
		})
	);
}
