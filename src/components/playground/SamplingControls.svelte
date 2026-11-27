<script lang="ts">
	import { temperature, sampling, weightPopover } from '~/store';
	import { textPages } from '~/utils/textbookPages';
	import RangeField from './RangeField.svelte';
	import {
		TEMPERATURES,
		TOP_K,
		TOP_P,
		temperatureIndex,
		clampSampling,
		formatSampling
	} from '~/utils/playground/sampling';

	interface Props {
		/** `compact` sits in the top bar; `full` adds a plain-language hint under each control. */
		variant?: 'compact' | 'full';
		/** Prefix for element ids, so two copies of the controls can live on one page. */
		idPrefix: string;
	}

	let { variant = 'compact', idPrefix }: Props = $props();

	const disabled = $derived(!!$weightPopover);
	const tIndex = $derived(temperatureIndex($temperature));
	const range = $derived($sampling.type === 'top-k' ? TOP_K : TOP_P);
	const full = $derived(variant === 'full');

	const complete = (id: string) => textPages.find((p) => p.id === id)?.complete?.();

	const setType = (type: Sampling['type']) => {
		if (type === $sampling.type) return;
		sampling.set({ type, value: type === 'top-k' ? TOP_K.initial : TOP_P.initial });
		complete('sampling');
	};
</script>

<div class="sampling-controls {variant}">
	<div class="temperature-input">
		<RangeField
			id="{idPrefix}-temperature"
			label="Temperature"
			min={0}
			max={TEMPERATURES.length - 1}
			step={1}
			value={tIndex}
			valueText={TEMPERATURES[tIndex].toFixed(1)}
			hint={full
				? 'Low: the model plays safe and picks the favourite. High: long shots get a real chance.'
				: undefined}
			{disabled}
			oninput={(i) => temperature.set(TEMPERATURES[i])}
			onchange={() => complete('temperature')}
		/>
	</div>
	<div class="sampling-input">
		<div class="sampling-row">
			<div
				class="segmented"
				role="radiogroup"
				aria-label="Sampling method"
				tabindex="-1"
				onkeydown={(e) => {
					if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
						e.preventDefault();
						setType($sampling.type === 'top-k' ? 'top-p' : 'top-k');
						(e.currentTarget as HTMLElement)
							.querySelector<HTMLElement>('[aria-checked="true"]')
							?.focus();
					}
				}}
			>
				{#each ['top-k', 'top-p'] as const as type}
					<button
						type="button"
						role="radio"
						aria-checked={$sampling.type === type}
						tabindex={$sampling.type === type ? 0 : -1}
						class:selected={$sampling.type === type}
						{disabled}
						onclick={() => setType(type)}
					>
						{type === 'top-k' ? 'Top-k' : 'Top-p'}
					</button>
				{/each}
			</div>
			<RangeField
				id="{idPrefix}-sampling"
				label={$sampling.type === 'top-k' ? 'k (words kept)' : 'p (share kept)'}
				min={range.min}
				max={range.max}
				step={range.step}
				value={$sampling.value}
				valueText={formatSampling($sampling)}
				{disabled}
				oninput={(v) => sampling.set(clampSampling({ type: $sampling.type, value: v }))}
				onchange={() => complete('sampling')}
			/>
		</div>
		{#if full}
			<p class="hint">
				{#if $sampling.type === 'top-k'}
					Top-k keeps only the k most likely words, then picks one of them at random by their
					chances.
				{:else}
					Top-p keeps the smallest set of top words whose chances add up to at least p, then picks
					one of them.
				{/if}
			</p>
		{/if}
	</div>
</div>

<style lang="scss">
	.sampling-controls {
		display: flex;
		align-items: flex-end;
		gap: 1.5rem;

		&.compact {
			.temperature-input {
				width: 9.5rem;
			}
			.sampling-row {
				:global(.range-field) {
					width: 10.5rem;
				}
			}
		}
		&.full {
			flex-direction: column;
			align-items: stretch;
			gap: 1.1rem;

			.sampling-row {
				flex-direction: column;
				align-items: stretch;
				gap: 0.6rem;
			}
			.segmented {
				align-self: flex-start;
			}
		}
	}
	.sampling-row {
		display: flex;
		align-items: flex-end;
		gap: 0.75rem;

		:global(.range-field) {
			flex: 1 1 auto;
		}
	}
	.segmented {
		display: inline-flex;
		padding: 3px;
		border-radius: 999px;
		background: var(--surface-muted);
		border: 1px solid var(--line);
		flex-shrink: 0;

		button {
			padding: 0.25rem 0.7rem;
			border-radius: 999px;
			font-size: 0.8rem;
			font-weight: 600;
			color: var(--ink-secondary);
			transition:
				background-color 0.18s var(--ease-out),
				color 0.18s var(--ease-out);

			&.selected {
				background: var(--surface);
				color: var(--ink-strong);
				box-shadow: var(--shadow-sm);
			}
			&:disabled {
				cursor: not-allowed;
			}
		}
	}
	.hint {
		margin-top: 0.35rem;
		font-size: 0.78rem;
		line-height: 1.35;
		color: var(--ink-muted);
	}
</style>
