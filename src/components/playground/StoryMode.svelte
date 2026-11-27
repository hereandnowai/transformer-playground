<script lang="ts">
	import { fly } from 'svelte/transition';
	import { tick, untrack } from 'svelte';
	import { get } from 'svelte/store';
	import {
		expandedBlock,
		isTextbookOpen,
		textbookCurrentPage,
		textbookCurrentPageId
	} from '~/store';
	import { storyOpen, storyStep, drawerTab } from '~/store/ui';
	import { storySteps } from '~/utils/playground/storySteps';
	import { textPages, type TextbookPage } from '~/utils/textbookPages';
	import { goToStep } from '~/utils/playground/panels';
	import StoryVisual from './StoryVisual.svelte';
	import Icon from './Icon.svelte';

	interface Props {
		/** Phones: the story is part of the page, not a floating card over the diagram. */
		inline?: boolean;
	}

	let { inline = false }: Props = $props();

	const total = storySteps.length;
	const step = $derived(storySteps[Math.min($storyStep, total - 1)]);
	const visible = $derived(inline || $storyOpen);

	// Cards for diagram parts on the right sit on the left, and the other way round.
	const side = $derived(step.id === 'mlp' || step.id === 'next-word' ? 'left' : 'right');

	const go = goToStep;

	// --- Diagram highlights (desktop only) -------------------------------------------------
	// Pages whose `on()` has run, and a pending `on()` call (handlers may need the DOM to settle).
	let applied: string[] = [];
	let pending: ReturnType<typeof setTimeout> | undefined;
	/** Textbook pages that open a zoomed view of a diagram block. */
	const ZOOMS: Record<string, string> = {
		'token-embedding': 'embedding',
		'positional-encoding': 'embedding'
	};
	const page = (id: string): TextbookPage | undefined => textPages.find((p) => p.id === id);

	const applyHighlights = (next: string[]) => {
		clearTimeout(pending);
		// Some handlers keep the zoomed view open when the next page needs it too.
		textbookCurrentPageId.set(next[0] ?? textPages[get(textbookCurrentPage)]?.id ?? '');
		applied.filter((id) => !next.includes(id)).forEach((id) => page(id)?.out());
		// A step can be skipped before its handler ran; never leave its zoomed view behind.
		const zoomed = get(expandedBlock).id;
		if (zoomed !== null && !next.some((id) => ZOOMS[id] === zoomed))
			expandedBlock.set({ id: null });
		const kept = applied.filter((id) => next.includes(id));
		applied = kept;
		pending = setTimeout(() => {
			next.filter((id) => !kept.includes(id)).forEach((id) => page(id)?.on());
			applied = [...next];
		}, 0);
	};

	$effect(() => {
		if (inline) return;
		const next = $storyOpen ? step.highlight : [];
		untrack(() => applyHighlights(next));
	});

	// Spotlight: dim the parts of the diagram this step is not about (styles in theme.css).
	$effect(() => {
		if (inline) return;
		const app = document.getElementById('app');
		if (!app) return;
		if ($storyOpen && step.spot.length) app.dataset.spot = step.spot.join(' ');
		else delete app.dataset.spot;
		if ($storyOpen) app.dataset.story = 'open';
		else delete app.dataset.story;
		return () => {
			delete app.dataset.spot;
			delete app.dataset.story;
		};
	});

	// Opening the upstream textbook closes the story (both drive the same highlights).
	$effect(() => {
		if ($isTextbookOpen) untrack(() => storyOpen.set(false));
	});

	let card: HTMLElement | undefined = $state();
	let opener: HTMLElement | null = null;

	$effect(() => {
		if (!inline && $storyOpen) {
			untrack(() => {
				opener = document.activeElement as HTMLElement | null;
				tick().then(() => card?.querySelector<HTMLElement>('h2')?.focus());
			});
		} else if (!inline && opener) {
			opener.focus?.();
			opener = null;
		}
	});

	// Move focus to the new title so screen readers read the new step.
	let titleEl: HTMLElement | undefined = $state();
	let first = true;
	$effect(() => {
		void $storyStep;
		if (first) {
			first = false;
			return;
		}
		if (!inline) untrack(() => tick().then(() => titleEl?.focus()));
	});
</script>

{#if visible}
	<section
		id="story-panel"
		class="story"
		class:inline
		class:left={!inline && side === 'left'}
		class:drawer-open={!inline && !!$drawerTab}
		aria-label="Story mode"
		aria-roledescription={inline ? undefined : 'guided tour'}
		bind:this={card}
		transition:fly={{ y: 24, duration: inline ? 0 : 280 }}
	>
		<header>
			<p class="kicker">
				<Icon name="story" size={16} />
				Story mode · Step {$storyStep + 1} of {total}
			</p>
			{#if !inline}
				<button
					type="button"
					class="close"
					aria-label="Close story mode (Esc)"
					title="Close (Esc)"
					onclick={() => storyOpen.set(false)}
				>
					<Icon name="close" size={18} />
				</button>
			{/if}
		</header>

		<ol class="rail" aria-label="Steps">
			{#each storySteps as s, i}
				<li>
					<button
						type="button"
						class:done={i < $storyStep}
						class:current={i === $storyStep}
						aria-current={i === $storyStep ? 'step' : undefined}
						aria-label="Step {i + 1}: {s.short}"
						title="{i + 1}. {s.short}"
						onclick={() => go(i)}
					></button>
				</li>
			{/each}
		</ol>

		{#key step.id}
			<div class="content" in:fly={{ x: 16, duration: 260 }}>
				<h2 tabindex="-1" bind:this={titleEl}>{step.title}</h2>
				{#each step.body as para}<p class="para">{para}</p>{/each}
				<StoryVisual visual={step.visual} canOpenDrawer={!inline} />
				<p class="takeaway">{step.takeaway}</p>
			</div>
		{/key}

		<footer>
			<button
				type="button"
				class="back"
				disabled={$storyStep === 0}
				onclick={() => go($storyStep - 1)}
			>
				<Icon name="left" size={18} /> Back
			</button>
			{#if !inline}<span class="hint" aria-hidden="true"><kbd>←</kbd> <kbd>→</kbd> to move</span
				>{/if}
			{#if $storyStep < total - 1}
				<button type="button" class="next" onclick={() => go($storyStep + 1)}>
					Next: {storySteps[$storyStep + 1].short}
					<Icon name="right" size={18} />
				</button>
			{:else}
				<button
					type="button"
					class="next"
					onclick={() => {
						if (inline) go(0);
						else storyOpen.set(false);
					}}
				>
					{inline ? 'Start again' : 'Finish and explore'}
					<Icon name="check" size={18} />
				</button>
			{/if}
		</footer>
	</section>
{/if}

<style lang="scss">
	.story {
		position: fixed;
		right: 1.5rem;
		bottom: 1.5rem;
		z-index: $TEXTBOOK_INDEX + 2;
		width: 31rem;
		max-height: calc(100vh - var(--header-h, 7.5rem) - 3rem);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1.1rem 1.25rem 1rem;
		border-radius: var(--radius-lg);
		background: var(--surface);
		border: 1px solid var(--line);
		box-shadow: var(--shadow-lg);
		transition:
			right 0.35s var(--ease-out),
			left 0.35s var(--ease-out);

		&.left {
			right: auto;
			left: 1.5rem;
		}
		&.drawer-open:not(.left) {
			right: calc(min(35rem, 100vw - 2rem) + 2rem);
		}

		&.inline {
			position: static;
			width: 100%;
			max-height: none;
			box-shadow: var(--shadow-md);
		}
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.kicker {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-muted);
	}
	.close {
		display: grid;
		place-items: center;
		width: 2.1rem;
		height: 2.1rem;
		border-radius: 999px;
		color: var(--ink-secondary);
		&:hover {
			background: var(--surface-muted);
			color: var(--ink-strong);
		}
	}
	.rail {
		display: grid;
		grid-template-columns: repeat(9, 1fr);
		gap: 4px;

		button {
			display: block;
			width: 100%;
			height: 0.4rem;
			border-radius: 999px;
			background: var(--surface-muted);
			transition:
				background-color 0.3s var(--ease-out),
				transform 0.2s var(--ease-out);
			// A larger hit area than the visible bar.
			position: relative;
			&::after {
				content: '';
				position: absolute;
				inset: -0.6rem 0;
			}
			&:hover {
				transform: scaleY(1.5);
			}
			&.done {
				background: var(--teal);
			}
			&.current {
				background: var(--brand);
				box-shadow: 0 0 0 1px var(--brand-strong) inset;
			}
		}
	}
	.content {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		overflow-y: auto;
		min-height: 0;
		padding-right: 0.25rem;

		h2 {
			font-size: 1.3rem;
			font-weight: 800;
			line-height: 1.2;
			letter-spacing: -0.02em;
			color: var(--heading);
			outline: none;
		}
		.para {
			font-size: 0.9rem;
			line-height: 1.55;
			color: var(--ink-body);
		}
		.takeaway {
			font-size: 0.88rem;
			font-weight: 600;
			line-height: 1.45;
			color: var(--ink-strong);
			padding: 0.55rem 0.8rem;
			border-left: 4px solid var(--brand);
			background: var(--brand-soft);
			border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
		}
	}
	footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding-top: 0.25rem;

		button {
			display: inline-flex;
			align-items: center;
			gap: 0.35rem;
			height: 2.5rem;
			padding: 0 1rem;
			border-radius: 999px;
			font-weight: 700;
			font-size: 0.9rem;
			transition:
				transform 0.15s var(--ease-out),
				background-color 0.15s var(--ease-out);
		}
		.back {
			color: var(--ink-body);
			border: 1px solid var(--line-strong);
			background: var(--surface);
			&:hover:not(:disabled) {
				background: var(--surface-muted);
			}
			&:disabled {
				opacity: 0.45;
				cursor: not-allowed;
			}
		}
		.next {
			background: var(--brand);
			color: var(--brand-ink);
			font-weight: 800;
			box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.12);
			&:hover {
				transform: translateY(-1px);
			}
		}
		.hint {
			font-size: 0.72rem;
			color: var(--ink-muted);
			kbd {
				font-family: inherit;
				padding: 0.05rem 0.35rem;
				border-radius: 0.3rem;
				border: 1px solid var(--line-strong);
				background: var(--surface-subtle);
			}
		}
	}
</style>
