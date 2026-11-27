<script lang="ts">
	import { base } from '$app/paths';
	import { isDark, toggleTheme } from '~/store/theme';
	import { storyOpen, drawerTab, shortcutsOpen, pendingPrompt, showToast } from '~/store/ui';
	import { isFetchingModel } from '~/store';
	import PromptBar from '~/components/playground/PromptBar.svelte';
	import ExampleChips from '~/components/playground/ExampleChips.svelte';
	import SamplingControls from '~/components/playground/SamplingControls.svelte';
	import IconButton from '~/components/playground/IconButton.svelte';
	import { copyText, shareUrl } from '~/utils/playground/urlState';
	import { toggleStory, toggleDrawer } from '~/utils/playground/panels';

	interface Props {
		/** False once the visitor has scrolled down to the article. */
		isActive: boolean;
	}

	let { isActive }: Props = $props();

	const copyLink = async () => {
		const ok = await copyText(shareUrl());
		showToast(
			ok ? 'Link copied: it opens this prompt and these settings.' : 'Could not copy the link.'
		);
	};
</script>

<div class="top-bar" class:active={isActive}>
	<a
		class="brand"
		href="https://hereandnowai.com"
		target="_blank"
		rel="noopener"
		title="HERE AND NOW AI: AI is Good"
	>
		<img
			class="mark"
			src={`${base}/hereandnowai-mark.png`}
			alt="HERE AND NOW AI logo"
			width="44"
			height="44"
		/>
		<span class="names">
			<span class="logo">Transformer Playground</span>
			<span class="by">by <strong>HERE AND NOW AI</strong></span>
		</span>
	</a>

	<div class="prompt-slot">
		<PromptBar />
	</div>

	<nav class="actions" aria-label="Tools">
		<div class="tools">
			<IconButton
				icon="story"
				label="Story mode"
				text="Story"
				showLabel
				shortcut="S"
				pressed={$storyOpen}
				controls="story-panel"
				onclick={toggleStory}
			/>
			<IconButton
				icon="grid"
				label="Attention heatmap"
				text="Heatmap"
				showLabel
				shortcut="H"
				pressed={$drawerTab === 'heatmap'}
				controls="insights-drawer"
				onclick={() => toggleDrawer('heatmap')}
			/>
			<IconButton
				icon="bars"
				label="Next-word race"
				text="Next word"
				showLabel
				shortcut="N"
				pressed={$drawerTab === 'race'}
				controls="insights-drawer"
				onclick={() => toggleDrawer('race')}
			/>
		</div>
		<span class="divider" aria-hidden="true"></span>
		<IconButton icon="link" label="Copy link to this view" shortcut="L" onclick={copyLink} />
		<IconButton
			icon="keyboard"
			label="Keyboard shortcuts"
			shortcut="?"
			onclick={() => shortcutsOpen.set(true)}
		/>
		<IconButton
			icon={$isDark ? 'sun' : 'moon'}
			label={$isDark ? 'Switch to light theme' : 'Switch to dark theme'}
			shortcut="T"
			onclick={toggleTheme}
		/>
		<IconButton
			icon="youtube"
			label="HERE AND NOW AI on YouTube"
			href="https://www.youtube.com/@hereandnow_ai"
		/>
		<IconButton
			icon="github"
			label="Source code on GitHub"
			href="https://github.com/hereandnowai/transformer-playground"
		/>
	</nav>

	<div class="row-two">
		<div class="examples">
			<span class="examples-label">
				{#if $pendingPrompt && $isFetchingModel}
					Your shared prompt runs once GPT-2 has loaded. Meanwhile:
				{:else}
					Examples
				{/if}
			</span>
			<ExampleChips />
		</div>
		<SamplingControls idPrefix="top" />
	</div>
</div>

<style lang="scss">
	.top-bar {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr) auto;
		grid-template-rows: auto auto;
		column-gap: 1.5rem;
		row-gap: 0.6rem;
		align-items: center;
		padding: 0.7rem 2rem 0.75rem;
		background: var(--surface-glass);
		backdrop-filter: saturate(1.6) blur(14px);
		-webkit-backdrop-filter: saturate(1.6) blur(14px);
		border-bottom: 1px solid var(--line);
		box-shadow: 0 1px 0 rgba(255, 255, 255, 0.6) inset;

		.prompt-slot,
		.row-two {
			transition:
				opacity 0.25s var(--ease-out),
				transform 0.25s var(--ease-out);
		}
		&:not(.active) {
			.row-two {
				display: none;
			}
			.prompt-slot {
				opacity: 0;
				pointer-events: none;
			}
		}
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-shrink: 0;
		white-space: nowrap;
		text-decoration: none;

		.mark {
			width: 2.75rem;
			height: 2.75rem;
			border-radius: 0.7rem;
			box-shadow: var(--shadow-sm);
			transition: transform 0.3s var(--ease-out);
		}
		&:hover .mark {
			transform: rotate(-6deg) scale(1.04);
		}
		.names {
			display: flex;
			flex-direction: column;
		}
		.logo {
			font-size: 1.35rem;
			font-weight: 800;
			line-height: 1.1;
			letter-spacing: -0.025em;
			color: var(--heading);
		}
		.by {
			font-size: 0.78rem;
			line-height: 1.3;
			color: var(--ink-muted);
			strong {
				font-weight: 700;
				color: var(--ink-secondary);
				letter-spacing: 0.02em;
			}
		}
	}

	.prompt-slot {
		min-width: 0;
		max-width: 56rem;
		width: 100%;
		justify-self: center;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.25rem;

		.tools {
			display: flex;
			gap: 0.4rem;
		}
		.divider {
			width: 1px;
			height: 1.6rem;
			margin: 0 0.4rem;
			background: var(--line);
		}
	}

	.row-two {
		grid-column: 1 / 4;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 2rem;
		min-width: 0;
	}
	.examples {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-width: 0;
		flex: 1 1 auto;

		.examples-label {
			flex-shrink: 0;
			font-size: 0.72rem;
			font-weight: 700;
			letter-spacing: 0.08em;
			text-transform: uppercase;
			color: var(--ink-muted);
			max-width: 14rem;
			white-space: normal;
			line-height: 1.25;
		}
	}

	// Below 1440px the tool buttons drop their text labels (the tooltips keep them).
	@media (max-width: 1439px) {
		.tools :global(.icon-btn.with-label .text) {
			display: none;
		}
		.tools :global(.icon-btn.with-label) {
			padding: 0 0.55rem;
		}
	}
</style>
