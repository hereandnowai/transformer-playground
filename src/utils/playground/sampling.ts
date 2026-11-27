/** Temperatures offered by the slider (very small values overflow Math.exp). */
export const TEMPERATURES = [
	0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 10.0
] as const;

export const TOP_K = { min: 1, max: 50, step: 1, initial: 5 } as const;
export const TOP_P = { min: 0.1, max: 1, step: 0.05, initial: 0.5 } as const;

/** Index of the offered temperature closest to `value`. */
export const temperatureIndex = (value: number): number => {
	let best = 0;
	TEMPERATURES.forEach((t, i) => {
		if (Math.abs(t - value) < Math.abs(TEMPERATURES[best] - value)) best = i;
	});
	return best;
};

/** Snaps a sampling value into its valid range and step. */
export const clampSampling = (s: Sampling): Sampling => {
	const r = s.type === 'top-k' ? TOP_K : TOP_P;
	const v = Number.isFinite(s.value) ? s.value : r.initial;
	const snapped = Math.round(Math.min(r.max, Math.max(r.min, v)) / r.step) * r.step;
	return { type: s.type, value: Number(snapped.toFixed(2)) };
};

export const formatSampling = (s: Sampling): string =>
	s.type === 'top-k' ? String(s.value) : s.value.toFixed(2);
