import { get } from 'svelte/store';
import {
	inputText,
	inputTextExample,
	selectedExampleIdx,
	isFetchingModel,
	isModelRunning,
	expandedBlock,
	weightPopover
} from '~/store';
import { pendingPrompt } from '~/store/ui';
import { textPages } from '~/utils/textbookPages';

/** True while the diagram is busy and a new prompt would clash with it. */
export const isBusy = () =>
	get(isModelRunning) || get(expandedBlock).id !== null || !!get(weightPopover);

/** Runs example prompt `i` (0-based). Picking the current example again replays it. */
export const selectExample = (i: number) => {
	const text = inputTextExample[i];
	if (!text) return;
	if (get(isFetchingModel)) textPages.find((p) => p.id === 'how-transformers-work')?.complete?.();
	pendingPrompt.set(null);
	selectedExampleIdx.set(i);
	inputText.update((prev) => (prev === text.trim() ? text + ' ' : text.trim()));
};
