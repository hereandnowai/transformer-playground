import { get } from 'svelte/store';
import { storyOpen, shortcutsOpen, showToast } from '~/store/ui';
import { toggleTheme } from '~/store/theme';
import { inputTextExample } from '~/store';
import { selectExample, isBusy } from './actions';
import { closeTopLayer, stepStory, toggleDrawer, toggleStory } from './panels';
import { copyText, shareUrl } from './urlState';

export interface Shortcut {
	keys: string[];
	label: string;
}

/** The list shown in the "?" dialog. Keep it in step with `handleShortcut`. */
export const SHORTCUTS: { group: string; items: Shortcut[] }[] = [
	{
		group: 'Prompt',
		items: [
			{ keys: ['/'], label: 'Type a prompt' },
			{ keys: ['Enter'], label: 'Generate the next word (in the prompt box)' },
			{ keys: ['1', '…', String(inputTextExample.length)], label: 'Run an example prompt' }
		]
	},
	{
		group: 'Tools',
		items: [
			{ keys: ['S'], label: 'Story mode on or off' },
			{ keys: ['←', '→'], label: 'Previous or next story step' },
			{ keys: ['H'], label: 'Attention heatmap' },
			{ keys: ['N'], label: 'Next-word race' },
			{ keys: ['Esc'], label: 'Close the open panel' }
		]
	},
	{
		group: 'Page',
		items: [
			{ keys: ['L'], label: 'Copy a link to this view' },
			{ keys: ['T'], label: 'Light or dark theme' },
			{ keys: ['?'], label: 'Show these shortcuts' }
		]
	}
];

/** Typing in a field must never trigger a shortcut. */
const isTextEntry = (el: EventTarget | null): boolean => {
	if (!(el instanceof HTMLElement)) return false;
	if (el.isContentEditable) return true;
	if (el.tagName === 'TEXTAREA' || el.tagName === 'SELECT') return true;
	return el.tagName === 'INPUT' && (el as HTMLInputElement).type !== 'range';
};

/** Widgets that use the arrow keys themselves (sliders, tabs, radio groups, the heatmap). */
const ownsArrows = (el: EventTarget | null): boolean => {
	if (!(el instanceof HTMLElement)) return false;
	if (el.tagName === 'INPUT') return true;
	const role = el.getAttribute('role');
	return role === 'grid' || role === 'tab' || role === 'radio' || role === 'slider';
};

const focusPrompt = () => {
	const box = document.querySelector<HTMLElement>('.prompt-bar [role="textbox"]');
	box?.focus();
};

export const handleShortcut = (event: KeyboardEvent) => {
	if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;

	if (event.key === 'Escape') {
		if (closeTopLayer()) event.preventDefault();
		return;
	}
	if (isTextEntry(event.target)) return;
	if (event.key.startsWith('Arrow') && ownsArrows(event.target)) return;
	// While the help dialog is open, only Esc (above) and "?" do anything.
	if (get(shortcutsOpen) && event.key !== '?') return;

	const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
	let handled = true;

	switch (key) {
		case '?':
			shortcutsOpen.update((open) => !open);
			break;
		case '/':
			focusPrompt();
			break;
		case 's':
			toggleStory();
			break;
		case 'h':
			toggleDrawer('heatmap');
			break;
		case 'n':
			toggleDrawer('race');
			break;
		case 't':
			toggleTheme();
			break;
		case 'l':
			copyText(shareUrl()).then((ok) =>
				showToast(
					ok ? 'Link copied: it opens this prompt and these settings.' : 'Could not copy the link.'
				)
			);
			break;
		case 'ArrowRight':
		case 'ArrowLeft':
			if (!get(storyOpen)) {
				handled = false;
				break;
			}
			stepStory(key === 'ArrowRight' ? 1 : -1);
			break;
		default: {
			const n = Number(key);
			if (Number.isInteger(n) && n >= 1 && n <= inputTextExample.length && !isBusy()) {
				selectExample(n - 1);
			} else handled = false;
		}
	}

	if (handled) event.preventDefault();
};
