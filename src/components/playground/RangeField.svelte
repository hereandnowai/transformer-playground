<script lang="ts">
	interface Props {
		id: string;
		label: string;
		min: number;
		max: number;
		step: number;
		value: number;
		/** The value as people should read it (shown and announced). */
		valueText: string;
		hint?: string;
		disabled?: boolean;
		oninput: (value: number) => void;
		onchange?: () => void;
	}

	let {
		id,
		label,
		min,
		max,
		step,
		value,
		valueText,
		hint,
		disabled = false,
		oninput,
		onchange
	}: Props = $props();

	const pct = $derived(((value - min) / (max - min || 1)) * 100);
</script>

<div class="range-field" class:disabled>
	<div class="head">
		<label for={id}>{label}</label>
		<output for={id} aria-hidden="true">{valueText}</output>
	</div>
	<input
		{id}
		type="range"
		{min}
		{max}
		{step}
		{value}
		{disabled}
		aria-valuetext={valueText}
		aria-describedby={hint ? `${id}-hint` : undefined}
		style="--pct:{pct}%"
		oninput={(e) => oninput(Number((e.currentTarget as HTMLInputElement).value))}
		{onchange}
	/>
	{#if hint}<p class="hint" id="{id}-hint">{hint}</p>{/if}
</div>

<style lang="scss">
	.range-field {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		min-width: 0;

		&.disabled {
			opacity: 0.55;
		}
	}
	.head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.75rem;
		font-size: 0.8rem;
		line-height: 1.1;

		label {
			font-weight: 600;
			color: var(--ink-secondary);
		}
		output {
			font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
			font-variant-numeric: tabular-nums;
			font-weight: 600;
			color: var(--ink-strong);
		}
	}
	.hint {
		font-size: 0.78rem;
		color: var(--ink-muted);
		line-height: 1.35;
	}

	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 1.25rem;
		background: transparent;
		cursor: pointer;

		&:disabled {
			cursor: not-allowed;
		}
		&::-webkit-slider-runnable-track {
			height: 6px;
			border-radius: 999px;
			background: linear-gradient(
				to right,
				var(--teal) 0%,
				var(--teal) var(--pct),
				var(--track) var(--pct),
				var(--track) 100%
			);
		}
		&::-moz-range-track {
			height: 6px;
			border-radius: 999px;
			background: var(--track);
		}
		&::-moz-range-progress {
			height: 6px;
			border-radius: 999px;
			background: var(--teal);
		}
		&::-webkit-slider-thumb {
			-webkit-appearance: none;
			appearance: none;
			margin-top: -6px;
			width: 18px;
			height: 18px;
			border-radius: 50%;
			background: var(--brand);
			border: 2px solid var(--teal);
			box-shadow: var(--shadow-sm);
			transition: transform 0.15s var(--ease-out);
		}
		&::-moz-range-thumb {
			width: 14px;
			height: 14px;
			border-radius: 50%;
			background: var(--brand);
			border: 2px solid var(--teal);
		}
		&:hover::-webkit-slider-thumb,
		&:focus-visible::-webkit-slider-thumb {
			transform: scale(1.15);
		}
		&:focus-visible {
			outline-offset: 4px;
		}
	}
</style>
