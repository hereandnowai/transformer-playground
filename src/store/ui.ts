import { readable, writable } from 'svelte/store';

/** Which tool panel is open in the side drawer, if any. */
export type DrawerTab = 'heatmap' | 'race';

/** Story mode: open state and the current step (0-based). */
export const storyOpen = writable(false);
export const storyStep = writable(0);

/** The insights drawer (attention heatmap / next-word race). */
export const drawerTab = writable<DrawerTab | null>(null);

/** False once the visitor has scrolled from the playground down to the article. */
export const landingInView = writable(true);

/** The keyboard-shortcuts help dialog. */
export const shortcutsOpen = writable(false);

/** Share of the GPT-2 model that has been downloaded, from 0 to 1. */
export const modelLoadProgress = writable(0);

/** Set when the model download failed for good; the Generate button then offers a retry. */
export const modelLoadError = writable<string | null>(null);

/** Bumped to ask the page to try the model download again. */
export const modelLoadRetry = writable(0);

/** A prompt from a shared link that waits until the live model is ready. */
export const pendingPrompt = writable<string | null>(null);

/** Short status message announced to screen readers and shown as a toast. */
export const toastMessage = writable<string | null>(null);

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export const showToast = (message: string, ms = 2400) => {
	toastMessage.set(message);
	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => toastMessage.set(null), ms);
};

/** Phones and narrow windows get the story-first layout instead of the full diagram. */
export const COMPACT_QUERY = '(max-width: 899px)';

export const isCompact = readable(false, (set) => {
	if (typeof window === 'undefined') return;
	const mq = window.matchMedia(COMPACT_QUERY);
	set(mq.matches);
	const onChange = (e: MediaQueryListEvent) => set(e.matches);
	mq.addEventListener('change', onChange);
	return () => mq.removeEventListener('change', onChange);
});
