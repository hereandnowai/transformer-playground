/** GPT-2 small: 12 blocks (layers) with 12 attention heads each. */
export const LAYERS = 12;
export const HEADS = 12;

/**
 * Attention weights (after the causal mask and softmax) of one head:
 * row i = the token that is looking, column j = the token it looks at. Rows sum to 1.
 */
export const attentionMatrix = (
	data: ModelData | undefined,
	layer: number,
	head: number
): number[][] | null => {
	const m = data?.outputs?.[`block_${layer}_attn_head_${head}_attn_softmax`]?.data;
	return Array.isArray(m) && m.length > 0 ? (m as number[][]) : null;
};

/** Index of the largest value in a row, ignoring masked (future) positions. */
export const argmaxUpTo = (row: number[], last: number): number => {
	let best = 0;
	for (let j = 1; j <= last && j < row.length; j++) if (row[j] > row[best]) best = j;
	return best;
};

/** Tokens carry their leading space; show it as nothing, but never show an empty label. */
export const tokenLabel = (token: string | undefined): string => {
	const t = (token ?? '').replace(/\n/g, '↵').trim();
	return t.length ? t : '␣';
};

export const pct = (v: number, digits = 0): string => `${(v * 100).toFixed(digits)}%`;
