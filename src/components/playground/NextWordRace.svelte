<script lang="ts">
	import { flip } from 'svelte/animate';
	import { modelData, sampling, temperature, inputText, isModelRunning } from '~/store';
	import { tokenLabel, pct } from '~/utils/playground/attention';
	import SamplingControls from './SamplingControls.svelte';
	import Icon from './Icon.svelte';

	interface Props {
		/** How many words take part in the race. */
		count?: number;
		/** Hide the controls (Story mode shows the race on its own). */
		compact?: boolean;
	}

	let { count = 10, compact = false }: Props = $props();

	/** Softmax of the temperature-scaled scores, before top-k / top-p cut anything. */
	const softmax = (xs: number[]) => {
		const max = Math.max(...xs);
		const ex = xs.map((x) => Math.exp(x - max));
		const sum = ex.reduce((a, b) => a + b, 0);
		return ex.map((e) => e / sum);
	};

	const rows = $derived.by(() => {
		const probs = $modelData?.probabilities ?? [];
		if (!probs.length) return [];
		const before = softmax(probs.map((p) => p.scaledLogit));
		return probs.slice(0, count).map((p, i) => ({
			id: p.tokenId,
			label: tokenLabel(p.token),
			before: before[i],
			after: p.probability,
			kept: p.probability > 0
		}));
	});

	const sampled = $derived($modelData?.sampled);
	const sampledId = $derived(sampled?.tokenId);
	const sampledInRace = $derived(rows.some((r) => r.id === sampledId));
	// Count over every scored word (the app keeps the top 50), not just the bars on screen.
	const kept = $derived(($modelData?.probabilities ?? []).filter((p) => p.probability > 0).length);
	const top = $derived(rows[0]);
	const scale = $derived(Math.max(0.0001, ...rows.map((r) => Math.max(r.before, r.after))));

	const summary = $derived.by(() => {
		if (!top) return '';
		const rule =
			$sampling.type === 'top-k'
				? `Top-k = ${$sampling.value} keeps ${kept === 1 ? 'only the favourite' : `the ${kept} likeliest words`}`
				: `Top-p = ${$sampling.value.toFixed(2)} keeps ${kept >= 50 ? 'all 50 listed' : kept} word${kept === 1 ? '' : 's'}`;
		return `At temperature ${$temperature.toFixed(1)}, “${top.label}” leads with ${pct(top.before, 1)}. ${rule}, and their chances are shared out again to add up to 100%.`;
	});

	let pickCount = $state(0);
	const pickAgain = () => {
		pickCount += 1;
		// Writing the same settings back re-runs the sampling step (a new random pick).
		sampling.update((s) => ({ ...s }));
	};
</script>

<div class="race" class:compact>
	{#if !compact}
		<p class="prompt">
			<span class="prompt-text">{$inputText.trim()}</span>
			{#if rows.length && sampled}
				<mark class="picked-word">{tokenLabel(sampled.token)}</mark>
			{/if}
		</p>
	{/if}

	{#if !rows.length}
		<p class="empty">The race starts after the first run.</p>
	{:else}
		<ol class="bars" aria-label="Most likely next words">
			{#each rows as row (row.id)}
				<li
					class="bar-row"
					class:cut={!row.kept}
					class:picked={row.id === sampledId}
					animate:flip={{ duration: 400 }}
				>
					<span class="word">{row.label}</span>
					<span class="track" aria-hidden="true">
						<span class="ghost" style="width:{(row.before / scale) * 100}%"></span>
						<span class="fill" style="width:{(row.after / scale) * 100}%"></span>
					</span>
					<span class="value">
						{#if row.kept}{pct(row.after, 1)}{:else}cut{/if}
						<span class="sr-only"
							>{row.kept ? '' : `, removed by ${$sampling.type}`}{row.id === sampledId
								? ', picked'
								: ''}</span
						>
					</span>
					{#if row.id === sampledId}
						{#key pickCount}<span class="badge" aria-hidden="true">picked</span>{/key}
					{/if}
				</li>
			{/each}
		</ol>
		<div class="key" aria-hidden="true">
			<span><span class="sw ghost-sw"></span>chance after temperature (before the cut)</span>
			<span
				><span class="sw fill-sw"></span>chance after {$sampling.type} (the draw uses these)</span
			>
		</div>
		<p class="summary">
			{summary}
			{#if sampled && !sampledInRace}
				This time the draw picked “{tokenLabel(sampled.token)}”, number {sampled.rank + 1} on the list:
				a long shot.
			{/if}
		</p>
	{/if}

	{#if !compact}
		<div class="controls">
			<SamplingControls variant="full" idPrefix="race" />
			<button
				type="button"
				class="again"
				onclick={pickAgain}
				disabled={$isModelRunning || !rows.length}
			>
				<Icon name="shuffle" size={18} /> Pick again
			</button>
		</div>
	{/if}
</div>

<style lang="scss">
	.race {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		container-type: inline-size;
	}
	.prompt {
		font-size: 1.05rem;
		line-height: 1.5;
		color: var(--ink-strong);
		padding: 0.75rem 1rem;
		border-radius: var(--radius);
		background: var(--surface-subtle);
		border: 1px solid var(--line);
	}
	.picked-word {
		margin-left: 0.35em;
		padding: 0.05em 0.35em;
		border-radius: 0.35em;
		background: var(--brand);
		color: var(--brand-ink);
		font-weight: 800;
	}
	.bars {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.bar-row {
		position: relative;
		display: grid;
		grid-template-columns: 6.5rem minmax(4rem, 1fr) 3.8rem 3.9rem;
		align-items: center;
		gap: 0.7rem;
		padding: 0.25rem 0.5rem;
		border-radius: 0.6rem;
		transition: background-color 0.3s var(--ease-out);

		&.picked {
			background: var(--brand-soft);
		}
		&.cut {
			.word,
			.value {
				color: var(--ink-faint);
			}
			.word {
				text-decoration: line-through;
				text-decoration-color: var(--line-heavy);
			}
		}
	}
	.word {
		font-weight: 700;
		color: var(--ink-strong);
		text-align: right;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.track {
		position: relative;
		height: 1.15rem;
		border-radius: 999px;
		background: var(--surface-muted);
		overflow: hidden;

		.ghost,
		.fill {
			position: absolute;
			left: 0;
			top: 0;
			height: 100%;
			border-radius: 999px;
			transition: width 0.55s var(--ease-out);
		}
		.ghost {
			background: color-mix(in srgb, var(--teal) 22%, transparent);
		}
		.fill {
			top: 25%;
			height: 50%;
			background: var(--teal);
		}
	}
	.picked .track .fill {
		background: var(--brand);
		box-shadow: inset 0 0 0 1px var(--brand-strong);
	}
	.value {
		font-variant-numeric: tabular-nums;
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--ink-body);
	}
	.badge {
		justify-self: start;
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
		background: var(--brand);
		color: var(--brand-ink);
		font-size: 0.7rem;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		animation: badge-in 0.5s var(--ease-out);
	}
	.key {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.2rem;
		font-size: 0.75rem;
		color: var(--ink-muted);

		> span {
			display: inline-flex;
			align-items: center;
			gap: 0.4rem;
		}
		.sw {
			width: 1.2rem;
			height: 0.6rem;
			border-radius: 999px;
		}
		.ghost-sw {
			background: color-mix(in srgb, var(--teal) 22%, transparent);
		}
		.fill-sw {
			background: var(--teal);
		}
	}
	.summary {
		font-size: 0.88rem;
		line-height: 1.5;
		color: var(--ink-secondary);
	}
	.controls {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1rem;
		border-radius: var(--radius);
		border: 1px solid var(--line);
		background: var(--surface-subtle);
	}
	.again {
		align-self: flex-start;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.55rem 1.1rem;
		border-radius: 999px;
		background: var(--brand);
		color: var(--brand-ink);
		font-weight: 800;
		font-size: 0.9rem;
		transition: transform 0.15s var(--ease-out);

		&:hover:not(:disabled) {
			transform: translateY(-1px);
		}
		&:disabled {
			background: var(--surface-muted);
			color: var(--ink-muted);
			cursor: not-allowed;
		}
	}
	.compact {
		.bar-row {
			grid-template-columns: 5.5rem 1fr 3.6rem;
			padding: 0.15rem 0.3rem;
		}
		.badge {
			display: none;
		}
		.word {
			font-size: 0.85rem;
		}
	}
	.empty {
		font-size: 0.9rem;
		color: var(--ink-muted);
	}

	// Narrow panels (phones): drop the badge column; the yellow row already marks the pick.
	@container (max-width: 26rem) {
		.bar-row {
			grid-template-columns: 5.5rem minmax(3rem, 1fr) 3.6rem;
		}
		.badge {
			display: none;
		}
	}

	@keyframes badge-in {
		0% {
			opacity: 0;
			transform: scale(0.6);
		}
		60% {
			transform: scale(1.12);
		}
		100% {
			opacity: 1;
			transform: scale(1);
		}
	}
</style>
