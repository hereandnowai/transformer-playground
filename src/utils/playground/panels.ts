import { get } from 'svelte/store';
import { isTextbookOpen } from '~/store';
import { storyOpen, storyStep, drawerTab, shortcutsOpen, type DrawerTab } from '~/store/ui';
import { storySteps } from './storySteps';

/** Story mode and the upstream textbook card would fight over the diagram highlights. */
export const openStory = () => {
	isTextbookOpen.set(false);
	storyOpen.set(true);
};

export const toggleStory = () => (get(storyOpen) ? storyOpen.set(false) : openStory());

export const toggleDrawer = (tab: DrawerTab) =>
	drawerTab.update((current) => (current === tab ? null : tab));

/** Closes the topmost open layer. Returns false when nothing was open. */
export const closeTopLayer = (): boolean => {
	if (get(shortcutsOpen)) {
		shortcutsOpen.set(false);
		return true;
	}
	if (get(drawerTab)) {
		drawerTab.set(null);
		return true;
	}
	if (get(storyOpen)) {
		storyOpen.set(false);
		return true;
	}
	return false;
};

/** Jumps to story step `i` (clamped to the first and last step). */
export const goToStep = (i: number) =>
	storyStep.set(Math.max(0, Math.min(storySteps.length - 1, i)));

export const stepStory = (delta: number) => goToStep(get(storyStep) + delta);
