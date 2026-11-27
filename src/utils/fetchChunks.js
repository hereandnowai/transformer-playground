const CACHE_PREFIX = 'onnx-model-cache';
const CACHE_NAME = `${CACHE_PREFIX}-v2`;

/** Parallel downloads at a time. Dozens of large parallel streams can be reset by the network. */
const CONCURRENCY = 6;
/** Extra attempts per chunk after a failed download, with a growing pause in between. */
const RETRIES = 4;

/** @param {number} ms */
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Reads one chunk from the cache, or downloads it (with retries) and caches it.
 * @param {string} url
 * @param {Cache | null} cache
 * @returns {Promise<{ buffer: ArrayBuffer, cached: boolean }>}
 */
async function getChunk(url, cache) {
	const hit = await cache?.match(url).catch(() => undefined);
	if (hit) return { buffer: await hit.arrayBuffer(), cached: true };

	for (let attempt = 0; ; attempt++) {
		try {
			const response = await fetch(url);
			if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
			const buffer = await response.arrayBuffer();
			// Caching is a bonus: a full or unavailable cache must not stop the download.
			await cache
				?.put(url, new Response(new Blob([buffer]), { headers: response.headers }))
				.catch(() => undefined);
			return { buffer, cached: false };
		} catch (error) {
			if (attempt >= RETRIES) throw error;
			await pause(1000 * 2 ** attempt);
		}
	}
}

/**
 * @param {string[]} chunkUrls
 * @param {((share: number) => void) | undefined} onProgress
 */
async function fetchModelChunks(chunkUrls, onProgress) {
	await clearOldCaches();
	const cache =
		typeof caches === 'undefined' ? null : await caches.open(CACHE_NAME).catch(() => null);

	/** @type {ArrayBuffer[]} */
	const modelBuffers = new Array(chunkUrls.length);
	let hasCache = false;
	let next = 0;
	let done = 0;

	const worker = async () => {
		while (next < chunkUrls.length) {
			const index = next++;
			const { buffer, cached } = await getChunk(chunkUrls[index], cache);
			modelBuffers[index] = buffer;
			hasCache ||= cached;
			done += 1;
			onProgress?.(done / chunkUrls.length);
		}
	};

	await Promise.all(Array.from({ length: Math.min(CONCURRENCY, chunkUrls.length) }, worker));
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
	if (typeof caches === 'undefined') return;
	const cacheNames = await caches.keys().catch(() => []);
	await Promise.all(
		cacheNames.map((name) => {
			if (name !== CACHE_NAME && name.includes(CACHE_PREFIX)) {
				return caches.delete(name);
			}
		})
	);
}
