import { get } from 'svelte/store';
import { replaceState } from '$app/navigation';
import {
	inputText,
	inputTextExample,
	selectedExampleIdx,
	temperature,
	sampling,
	initialTemperature
} from '~/store';
import { pendingPrompt } from '~/store/ui';
import { clampSampling, temperatureIndex, TEMPERATURES } from './sampling';
import { WORD_LIMIT, normalisePrompt, wordCount } from './prompt';

/**
 * Shareable state lives in the query string:
 *   ?q=<prompt>&t=<temperature>&k=<top-k>   or   ...&p=<top-p>
 */
export interface SharedState {
	prompt?: string;
	temperature?: number;
	sampling?: Sampling;
}

export const parseSharedState = (search: string): SharedState => {
	const params = new URLSearchParams(search);
	const state: SharedState = {};

	const q = params.get('q');
	if (q && q.trim()) {
		const prompt = normalisePrompt(q).trim().slice(0, 200);
		if (wordCount(prompt) <= WORD_LIMIT) state.prompt = prompt;
	}

	const t = Number(params.get('t'));
	if (params.has('t') && Number.isFinite(t)) state.temperature = TEMPERATURES[temperatureIndex(t)];

	const k = Number(params.get('k'));
	const p = Number(params.get('p'));
	if (params.has('k') && Number.isFinite(k))
		state.sampling = clampSampling({ type: 'top-k', value: k });
	else if (params.has('p') && Number.isFinite(p))
		state.sampling = clampSampling({ type: 'top-p', value: p });

	return state;
};

/**
 * Applies a shared state before the first run. An example prompt plays at once from the
 * cached data; a custom prompt waits in `pendingPrompt` until the live model is ready.
 * Returns true when a custom prompt is waiting.
 */
export const applySharedState = (state: SharedState, canRunLive: boolean): boolean => {
	if (state.temperature !== undefined) temperature.set(state.temperature);
	if (state.sampling) sampling.set(state.sampling);
	if (!state.prompt) return false;

	const exampleIdx = inputTextExample.findIndex((ex) => ex.trim() === state.prompt);
	if (exampleIdx >= 0) {
		selectedExampleIdx.set(exampleIdx);
		inputText.set(inputTextExample[exampleIdx]);
		return false;
	}
	if (!canRunLive) return false;
	pendingPrompt.set(state.prompt);
	return true;
};

/** The link that reproduces what is on screen now. */
export const shareUrl = (): string => {
	const url = new URL(window.location.href);
	const params = new URLSearchParams();
	const prompt = get(pendingPrompt) ?? get(inputText).trim();
	if (prompt) params.set('q', prompt);
	const t = get(temperature);
	if (t !== initialTemperature) params.set('t', String(t));
	const s = get(sampling);
	params.set(s.type === 'top-k' ? 'k' : 'p', String(s.value));
	url.search = params.toString();
	url.hash = '';
	return url.toString();
};

/** Keeps the address bar in step with the state, without adding history entries. */
export const syncUrl = () => {
	let timer: ReturnType<typeof setTimeout> | undefined;
	const write = () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			const next = shareUrl();
			if (next !== window.location.href) replaceState(next, {});
		}, 250);
	};
	const stops = [inputText, temperature, sampling, pendingPrompt].map((store) =>
		(store as { subscribe: (fn: () => void) => () => void }).subscribe(write)
	);
	return () => {
		clearTimeout(timer);
		stops.forEach((stop) => stop());
	};
};

/** Copies text to the clipboard, with a fallback for browsers without the async API. */
export const copyText = async (text: string): Promise<boolean> => {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		const area = document.createElement('textarea');
		area.value = text;
		area.setAttribute('readonly', '');
		area.style.position = 'fixed';
		area.style.opacity = '0';
		document.body.appendChild(area);
		area.select();
		const ok = document.execCommand('copy');
		area.remove();
		return ok;
	}
};
