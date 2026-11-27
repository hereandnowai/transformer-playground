<script lang="ts">
	import { base } from '$app/paths';
	import { inputText, predictedToken } from '~/store';
	import { isDark, toggleTheme } from '~/store/theme';
	import { tokenLabel } from '~/utils/playground/attention';
	import ExampleChips from './ExampleChips.svelte';
	import StoryMode from './StoryMode.svelte';
	import AttentionHeatmap from './AttentionHeatmap.svelte';
	import NextWordRace from './NextWordRace.svelte';
	import IconButton from './IconButton.svelte';

	interface Props {
		/** False until the tokenizer has loaded and the first example has run. */
		ready: boolean;
	}

	let { ready }: Props = $props();

	let width = $state(360);
	let layer = $state(0);
	let head = $state(0);
</script>

<div class="mobile" bind:clientWidth={width}>
	<header class="bar">
		<a class="brand" href="https://hereandnowai.com" target="_blank" rel="noopener">
			<img
				src={`${base}/hereandnowai-mark.png`}
				alt="HERE AND NOW AI logo"
				width="36"
				height="36"
			/>
			<span class="names">
				<span class="logo">Transformer Playground</span>
				<span class="by">by <strong>HERE AND NOW AI</strong></span>
			</span>
		</a>
		<div class="icons">
			<IconButton
				icon={$isDark ? 'sun' : 'moon'}
				label={$isDark ? 'Switch to light theme' : 'Switch to dark theme'}
				onclick={toggleTheme}
			/>
			<IconButton
				icon="github"
				label="Source code on GitHub"
				href="https://github.com/hereandnowai/transformer-playground"
			/>
		</div>
	</header>

	<section class="hero" aria-labelledby="hero-title">
		<h1 id="hero-title">How does an AI pick its next word?</h1>
		<p>
			Pick a sentence and follow GPT-2, step by step, from tokens to the next word. Explained
			simply, with the model’s real numbers.
		</p>
	</section>

	<section class="card prompt" aria-labelledby="prompt-title">
		<h2 id="prompt-title" class="eyebrow">Choose a sentence</h2>
		<ExampleChips alwaysEnabled />
		<p class="sentence" aria-live="polite">
			{$inputText.trim()}
			{#if ready && $predictedToken}<mark>{tokenLabel($predictedToken.token)}</mark>{/if}
		</p>
		<p class="note">
			On a phone you can explore these five ready-made examples. To type your own sentence and see
			the full live diagram, open this page on a desktop or laptop browser.
		</p>
	</section>

	<StoryMode inline />

	<section class="card" aria-labelledby="m-heatmap">
		<h2 id="m-heatmap">Attention heatmap</h2>
		<p class="blurb">
			Each row is a word looking back at the words before it. Tap a square to read its value.
		</p>
		<AttentionHeatmap bind:layer bind:head width={Math.max(240, width - 80)} />
	</section>

	<section class="card" aria-labelledby="m-race">
		<h2 id="m-race">Next-word race</h2>
		<p class="blurb">
			The words GPT-2 thinks could come next. Change the settings and watch the chances move.
		</p>
		<NextWordRace count={8} />
	</section>
</div>

<style lang="scss">
	.mobile {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 0 1rem 2rem;
		max-width: 40rem;
		margin: 0 auto;
	}
	.bar {
		position: sticky;
		top: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin: 0 -1rem;
		padding: 0.6rem 1rem;
		background: var(--surface-glass);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		border-bottom: 1px solid var(--line);
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		min-width: 0;
		img {
			width: 2.25rem;
			height: 2.25rem;
			border-radius: 0.55rem;
		}
		.names {
			display: flex;
			flex-direction: column;
			min-width: 0;
		}
		.logo {
			font-weight: 800;
			font-size: 1.02rem;
			letter-spacing: -0.02em;
			color: var(--heading);
			white-space: nowrap;
		}
		.by {
			font-size: 0.72rem;
			color: var(--ink-muted);
			strong {
				color: var(--ink-secondary);
			}
		}
	}
	.icons {
		display: flex;
		flex-shrink: 0;
	}
	.hero {
		padding: 0.75rem 0 0.25rem;
		h1 {
			font-size: 1.75rem;
			font-weight: 850;
			line-height: 1.15;
			letter-spacing: -0.03em;
			color: var(--heading);
		}
		p {
			margin-top: 0.5rem;
			font-size: 0.98rem;
			line-height: 1.55;
			color: var(--ink-body);
		}
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		padding: 1rem;
		border-radius: var(--radius-lg);
		background: var(--surface);
		border: 1px solid var(--line);
		box-shadow: var(--shadow-md);

		h2 {
			font-size: 1.2rem;
			font-weight: 800;
			color: var(--heading);
		}
		.eyebrow {
			font-size: 0.72rem;
			font-weight: 800;
			letter-spacing: 0.08em;
			text-transform: uppercase;
			color: var(--ink-muted);
		}
		.blurb {
			font-size: 0.88rem;
			line-height: 1.5;
			color: var(--ink-secondary);
			margin-top: -0.35rem;
		}
	}
	.prompt {
		:global(.example-chips) {
			flex-wrap: wrap;
			overflow: visible;
		}
		:global(.example-chips .chip) {
			max-width: 100%;
		}
	}
	.sentence {
		font-size: 1.15rem;
		line-height: 1.5;
		font-weight: 600;
		color: var(--ink-strong);
		padding: 0.75rem 0.9rem;
		border-radius: var(--radius);
		background: var(--surface-subtle);
		border: 1px solid var(--line);

		mark {
			padding: 0.05em 0.35em;
			border-radius: 0.35em;
			background: var(--brand);
			color: var(--brand-ink);
			font-weight: 800;
		}
	}
	.note {
		font-size: 0.8rem;
		line-height: 1.45;
		color: var(--ink-muted);
	}
</style>
