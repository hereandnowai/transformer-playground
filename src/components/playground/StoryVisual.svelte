<script lang="ts">
	import { tokens, tokenIds, modelData, blockIdx, attentionHeadIdx } from '~/store';
	import { drawerTab } from '~/store/ui';
	import type { StoryVisual } from '~/utils/playground/storySteps';
	import { attentionMatrix, tokenLabel, LAYERS, HEADS } from '~/utils/playground/attention';
	import AttentionHeatmap from './AttentionHeatmap.svelte';
	import NextWordRace from './NextWordRace.svelte';
	import MiniMatrix from './MiniMatrix.svelte';

	interface Props {
		visual: StoryVisual;
		/** Phones have no drawer: hide the "open the full view" buttons there. */
		canOpenDrawer?: boolean;
	}

	let { visual, canOpenDrawer = true }: Props = $props();

	const labels = $derived(($tokens ?? []).map(tokenLabel));
	// Keep the visuals short: long prompts show their first and last few tokens.
	const shown = $derived(
		labels.length <= 8
			? labels.map((l, i) => ({ l, i }))
			: [
					...labels.slice(0, 4).map((l, i) => ({ l, i })),
					null,
					...labels.slice(-3).map((l, k) => ({ l, i: labels.length - 3 + k }))
				]
	);

	let layer = $state($blockIdx);
	let head = $state($attentionHeadIdx);

	/** A fixed pseudo-random pattern per token, purely decorative (stands for 768 numbers). */
	const stripe = (seed: number) =>
		Array.from({ length: 18 }, (_, k) => {
			const x = Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453;
			return x - Math.floor(x);
		});
</script>

<div class="visual v-{visual}">
	{#if visual === 'tokens'}
		<ul class="chips" aria-label="Tokens and their IDs">
			{#each shown as t}
				{#if t}
					<li class="chip">
						<span class="tok">{t.l}</span><span class="id">{$tokenIds?.[t.i] ?? ''}</span>
					</li>
				{:else}
					<li class="more" aria-label="more tokens">…</li>
				{/if}
			{/each}
		</ul>
		<p class="caption">
			{labels.length} tokens · top: the token · bottom: its ID in GPT-2’s vocabulary
		</p>
	{:else if visual === 'embeddings' || visual === 'positions'}
		<ul
			class="rows"
			aria-label={visual === 'embeddings' ? 'Token embeddings' : 'Token plus position'}
		>
			{#each shown.slice(0, 5) as t}
				{#if t}
					<li>
						<span class="tok">{t.l}</span>
						<span class="vec" aria-hidden="true">
							{#each stripe($tokenIds?.[t.i] ?? t.i) as v}<i style="opacity:{0.25 + v * 0.75}"
								></i>{/each}
						</span>
						{#if visual === 'positions'}
							<span class="op" aria-hidden="true">+</span>
							<span class="pos">position {t.i}</span>
						{/if}
					</li>
				{/if}
			{/each}
		</ul>
		<p class="caption">
			{visual === 'embeddings'
				? 'Each bar stands for a list of 768 numbers (the pattern here is only a picture).'
				: 'Token list + position list = what goes into block 1. Positions count from 0.'}
		</p>
	{:else if visual === 'attention'}
		<AttentionHeatmap compact {layer} {head} width={300} />
		<p class="caption">
			Block {layer + 1}, head {head + 1}: each row is a word looking back. Grey stripes are later
			words, hidden by the mask.
		</p>
		{#if canOpenDrawer}
			<button type="button" class="open" onclick={() => drawerTab.set('heatmap')}
				>Open the full attention heatmap</button
			>
		{/if}
	{:else if visual === 'heads'}
		<ul class="heads" aria-label="The 12 attention heads of block {layer + 1}">
			{#each Array(HEADS) as _, h}
				{@const m = attentionMatrix($modelData, layer, h)}
				<li>
					{#if m}<MiniMatrix matrix={m} size={52} label="Head {h + 1}" />{/if}
					<span>Head {h + 1}</span>
				</li>
			{/each}
		</ul>
		<p class="caption">
			The same sentence in block {layer + 1}: every head spreads its attention differently.
		</p>
	{:else if visual === 'mlp'}
		<div
			class="mlp"
			aria-label="768 numbers grow to 3,072, pass through GELU, and shrink back to 768"
		>
			<span class="layer narrow">768</span>
			<span class="arrow" aria-hidden="true">→</span>
			<span class="layer wide">3,072</span>
			<span class="arrow" aria-hidden="true">→</span>
			<span class="gelu">GELU</span>
			<span class="arrow" aria-hidden="true">→</span>
			<span class="layer narrow">768</span>
		</div>
		<p class="caption">Expand, bend, compress: done for every token separately.</p>
	{:else if visual === 'residual'}
		<div
			class="flow"
			aria-label="Input, layer norm, attention, add the input back, layer norm, MLP, add back"
		>
			<span class="node x">x</span>
			<span class="arrow" aria-hidden="true">→</span>
			<span class="node ln">Norm</span>
			<span class="arrow" aria-hidden="true">→</span>
			<span class="node att">Attention</span>
			<span class="arrow" aria-hidden="true">→</span>
			<span class="node add">+ x</span>
			<span class="arrow" aria-hidden="true">→</span>
			<span class="node ln">Norm</span>
			<span class="arrow" aria-hidden="true">→</span>
			<span class="node mlp-n">MLP</span>
			<span class="arrow" aria-hidden="true">→</span>
			<span class="node add">+</span>
		</div>
		<p class="caption">“+ x”: the input skips around the layer and is added back to its output.</p>
	{:else if visual === 'stack'}
		<ol class="stack" aria-label="Twelve transformer blocks">
			{#each Array(LAYERS) as _, i}
				<li class:current={i === $blockIdx}><span>{i + 1}</span></li>
			{/each}
		</ol>
		<p class="caption">
			12 blocks, one after another. The diagram shows block {$blockIdx + 1} (highlighted).
		</p>
	{:else if visual === 'race'}
		<NextWordRace compact count={5} />
		{#if canOpenDrawer}
			<button type="button" class="open" onclick={() => drawerTab.set('race')}
				>Open the next-word race</button
			>
		{/if}
	{/if}
</div>

<style lang="scss">
	.visual {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		padding: 0.9rem;
		border-radius: var(--radius);
		background: var(--surface-subtle);
		border: 1px solid var(--line);
	}
	.caption {
		font-size: 0.76rem;
		line-height: 1.4;
		color: var(--ink-muted);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.chip {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		padding: 0.3rem 0.6rem;
		border-radius: 0.6rem;
		background: var(--surface);
		border: 1px solid var(--line-strong);
		box-shadow: var(--shadow-sm);
		animation: rise 0.4s var(--ease-out) both;

		.tok {
			font-weight: 700;
			color: var(--ink-strong);
			font-size: 0.9rem;
		}
		.id {
			font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
			font-size: 0.7rem;
			color: var(--ink-muted);
		}
	}
	.more {
		align-self: center;
		color: var(--ink-muted);
	}
	.rows {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;

		li {
			display: flex;
			align-items: center;
			gap: 0.5rem;
		}
		.tok {
			width: 5.5rem;
			text-align: right;
			font-weight: 700;
			font-size: 0.85rem;
			color: var(--ink-strong);
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
		.vec {
			display: flex;
			gap: 2px;
			i {
				width: 8px;
				height: 16px;
				border-radius: 2px;
				background: var(--accent-blue-600);
			}
		}
		.op {
			font-weight: 800;
			color: var(--ink-muted);
		}
		.pos {
			padding: 0.1rem 0.5rem;
			border-radius: 999px;
			background: var(--brand);
			color: var(--brand-ink);
			font-size: 0.72rem;
			font-weight: 700;
			white-space: nowrap;
		}
	}
	.heads {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: 0.5rem;

		li {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 0.2rem;
			font-size: 0.66rem;
			color: var(--ink-muted);
		}
	}
	.mlp,
	.flow {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.35rem;
		font-weight: 700;
		font-size: 0.8rem;
	}
	.arrow {
		color: var(--ink-faint);
	}
	.layer {
		display: grid;
		place-items: center;
		border-radius: 0.5rem;
		background: var(--accent-purple-100);
		color: var(--ink-strong);
		border: 1px solid var(--accent-purple-500);
		&.narrow {
			width: 3.4rem;
			height: 2.6rem;
		}
		&.wide {
			width: 5.4rem;
			height: 4rem;
		}
	}
	.gelu {
		padding: 0.35rem 0.6rem;
		border-radius: 999px;
		background: var(--brand);
		color: var(--brand-ink);
	}
	.node {
		padding: 0.3rem 0.55rem;
		border-radius: 0.5rem;
		background: var(--surface);
		border: 1px solid var(--line-strong);
		color: var(--ink-strong);
		&.add {
			background: var(--brand);
			border-color: var(--brand);
			color: var(--brand-ink);
		}
		&.ln {
			border-style: dashed;
		}
	}
	.stack {
		display: flex;
		gap: 4px;

		li {
			flex: 1;
			height: 2.4rem;
			display: grid;
			place-items: end center;
			padding-bottom: 0.25rem;
			border-radius: 0.4rem;
			background: var(--teal-soft);
			border: 1px solid var(--line);
			font-size: 0.7rem;
			font-weight: 700;
			color: var(--ink-secondary);
			animation: rise 0.4s var(--ease-out) both;

			&.current {
				background: var(--brand);
				border-color: var(--brand);
				color: var(--brand-ink);
			}
		}
		@for $i from 1 through 12 {
			li:nth-child(#{$i}) {
				animation-delay: #{$i * 30}ms;
			}
		}
	}
	.open {
		align-self: flex-start;
		font-size: 0.82rem;
		font-weight: 700;
		color: var(--link);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
</style>
