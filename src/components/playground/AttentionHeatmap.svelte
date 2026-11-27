<script lang="ts">
	import { interpolateRgb } from 'd3';
	import { modelData, tokens } from '~/store';
	import { isDark } from '~/store/theme';
	import {
		LAYERS,
		HEADS,
		attentionMatrix,
		argmaxUpTo,
		tokenLabel,
		pct
	} from '~/utils/playground/attention';

	interface Props {
		layer?: number;
		head?: number;
		/** Small, label-light version for Story mode and phones. */
		compact?: boolean;
		/** Width available for the matrix, in px. */
		width?: number;
	}

	let { layer = $bindable(0), head = $bindable(0), compact = false, width = 440 }: Props = $props();

	const matrix = $derived(attentionMatrix($modelData, layer, head));
	const labels = $derived(($tokens ?? []).map(tokenLabel));
	const n = $derived(matrix?.length ?? 0);

	const labelWidth = $derived(compact ? 64 : 96);
	const cell = $derived(
		n ? Math.max(compact ? 12 : 18, Math.min(compact ? 30 : 44, (width - labelWidth) / n)) : 0
	);
	const showValues = $derived(!compact && cell >= 34);

	const ramp = $derived(
		$isDark ? interpolateRgb('#1c1c1c', '#ffdb00') : interpolateRgb('#eef4f3', '#004040')
	);
	const inkOn = (v: number) =>
		$isDark ? (v > 0.5 ? '#0a0a0a' : '#f2f2f2') : v > 0.45 ? '#ffffff' : '#0b1f1f';

	// The cell the visitor points at (or reaches with the arrow keys). Defaults to the last token,
	// whose row is the one that feeds the next-word prediction.
	let active = $state<{ row: number; col: number } | null>(null);
	const focusRow = $derived(active?.row ?? Math.max(0, n - 1));

	const topFor = (row: number) => (matrix ? argmaxUpTo(matrix[row], row) : 0);
	const readout = $derived.by(() => {
		if (!matrix || !n) return null;
		const row = Math.min(focusRow, n - 1);
		const col = active ? Math.min(active.col, n - 1) : topFor(row);
		const masked = col > row;
		return { row, col, masked, value: masked ? 0 : matrix[row][col], top: topFor(row) };
	});

	let gridEl: HTMLDivElement | undefined = $state();

	const move = (event: KeyboardEvent) => {
		if (!n) return;
		const cur = active ?? { row: n - 1, col: topFor(n - 1) };
		const delta: Record<string, [number, number]> = {
			ArrowUp: [-1, 0],
			ArrowDown: [1, 0],
			ArrowLeft: [0, -1],
			ArrowRight: [0, 1]
		};
		let next = cur;
		if (delta[event.key]) {
			const [dr, dc] = delta[event.key];
			next = {
				row: Math.min(n - 1, Math.max(0, cur.row + dr)),
				col: Math.min(n - 1, Math.max(0, cur.col + dc))
			};
		} else if (event.key === 'Home') next = { row: cur.row, col: 0 };
		else if (event.key === 'End') next = { row: cur.row, col: cur.row };
		else return;
		event.preventDefault();
		event.stopPropagation();
		active = next;
	};

	const stepLayer = (d: number) => (layer = (layer + d + LAYERS) % LAYERS);
	const stepHead = (d: number) => (head = (head + d + HEADS) % HEADS);
</script>

<div class="heatmap" class:compact>
	{#if !compact}
		<div class="pickers">
			<div class="picker">
				<span class="picker-label" id="hm-layer-label">Block</span>
				<button type="button" aria-label="Previous block" onclick={() => stepLayer(-1)}>‹</button>
				<select aria-labelledby="hm-layer-label" bind:value={layer}>
					{#each Array(LAYERS) as _, i}<option value={i}>{i + 1} of {LAYERS}</option>{/each}
				</select>
				<button type="button" aria-label="Next block" onclick={() => stepLayer(1)}>›</button>
			</div>
			<div class="picker">
				<span class="picker-label" id="hm-head-label">Head</span>
				<button type="button" aria-label="Previous head" onclick={() => stepHead(-1)}>‹</button>
				<select aria-labelledby="hm-head-label" bind:value={head}>
					{#each Array(HEADS) as _, i}<option value={i}>{i + 1} of {HEADS}</option>{/each}
				</select>
				<button type="button" aria-label="Next head" onclick={() => stepHead(1)}>›</button>
			</div>
		</div>
	{/if}

	{#if !matrix}
		<p class="empty">The attention weights appear after the first run.</p>
	{:else}
		{#if !compact && readout}
			<div class="readout" aria-live="polite">
				<span class="q">{labels[readout.row]}</span>
				<span class="arrow" aria-hidden="true">→</span>
				<span class="k">{labels[readout.col]}</span>
				<span class="value">
					{#if readout.masked}
						hidden (a later word)
					{:else}
						{pct(readout.value, 1)}
					{/if}
				</span>
			</div>
		{/if}

		<div class="matrix-wrap" style="--cell:{cell}px; --label-w:{labelWidth}px">
			<div class="col-labels" aria-hidden="true">
				{#each labels as label, j}
					<span class="col-label" class:hot={readout && j === readout.col}>{label}</span>
				{/each}
			</div>
			<div
				bind:this={gridEl}
				class="grid"
				role="grid"
				tabindex="0"
				aria-label="Attention weights of block {layer + 1}, head {head +
					1}. Rows: the word that is looking. Columns: the word it looks at. Use the arrow keys to read each value."
				aria-activedescendant={active ? `hm-${active.row}-${active.col}` : undefined}
				onkeydown={move}
				onfocus={() => {
					if (!active && n) active = { row: n - 1, col: topFor(n - 1) };
				}}
				onmouseleave={() => (active = null)}
			>
				{#each matrix as row, i}
					<div class="row" role="row">
						<span class="row-label" role="rowheader" class:hot={readout && i === readout.row}
							>{labels[i]}</span
						>
						{#each row as v, j}
							{@const masked = j > i}
							<!-- svelte-ignore a11y_mouse_events_have_key_events -->
							<span
								id="hm-{i}-{j}"
								role="gridcell"
								tabindex="-1"
								class="cell"
								class:masked
								class:top={!masked && j === topFor(i)}
								class:active={active?.row === i && active?.col === j}
								style={masked ? '' : `background:${ramp(v)};color:${inkOn(v)}`}
								aria-label="{labels[i]} looks at {labels[j]}: {masked ? 'masked' : pct(v, 1)}"
								onmouseover={() => (active = { row: i, col: j })}
							>
								{#if showValues && !masked}{Math.round(v * 100)}{/if}
							</span>
						{/each}
					</div>
				{/each}
			</div>
		</div>

		{#if !compact}
			<div class="legend" aria-hidden="true">
				<span>0%</span>
				<span
					class="bar"
					style="background:linear-gradient(to right, {ramp(0)}, {ramp(0.5)}, {ramp(1)})"
				></span>
				<span>100%</span>
				<span class="masked-key"><span class="swatch"></span> masked: a later word</span>
			</div>

			<section class="most" aria-labelledby="most-title">
				<h3 id="most-title">Which word does each word look at most?</h3>
				<ol>
					{#each matrix as row, i}
						{@const t = topFor(i)}
						<li class:focus={i === readout?.row}>
							<span class="from">{labels[i]}</span>
							<span class="bar-track"
								><span class="bar-fill" style="width:{row[t] * 100}%"></span></span
							>
							<span class="to">{labels[t]}</span>
							<span class="num">{pct(row[t])}</span>
						</li>
					{/each}
				</ol>
			</section>
		{/if}
	{/if}
</div>

<style lang="scss">
	.heatmap {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		color: var(--ink-body);
	}
	.pickers {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	.picker {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem;
		border-radius: 999px;
		background: var(--surface-subtle);
		border: 1px solid var(--line);

		.picker-label {
			padding: 0 0.4rem 0 0.6rem;
			font-size: 0.72rem;
			font-weight: 700;
			letter-spacing: 0.08em;
			text-transform: uppercase;
			color: var(--ink-muted);
		}
		button {
			width: 1.9rem;
			height: 1.9rem;
			border-radius: 999px;
			font-size: 1.2rem;
			line-height: 1;
			color: var(--ink-secondary);
			&:hover {
				background: var(--surface-muted);
				color: var(--ink-strong);
			}
		}
		select {
			border: none;
			background-color: transparent;
			font-weight: 700;
			font-size: 0.9rem;
			color: var(--ink-strong);
			padding: 0.2rem 1.8rem 0.2rem 0.4rem;
			border-radius: 999px;
			cursor: pointer;
			&:focus {
				box-shadow: none;
			}
		}
	}
	.readout {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		min-height: 2.5rem;
		padding: 0.45rem 0.9rem;
		border-radius: var(--radius);
		background: var(--surface-subtle);
		border: 1px solid var(--line);
		font-size: 1rem;

		.q,
		.k {
			font-weight: 700;
			color: var(--ink-strong);
			padding: 0.05rem 0.45rem;
			border-radius: 0.4rem;
		}
		.q {
			background: color-mix(in srgb, var(--q-color) 14%, transparent);
		}
		.k {
			background: color-mix(in srgb, var(--k-color) 14%, transparent);
		}
		.arrow {
			color: var(--ink-muted);
		}
		.value {
			margin-left: auto;
			font-variant-numeric: tabular-nums;
			font-weight: 700;
			color: var(--ink-strong);
		}
	}

	.matrix-wrap {
		display: grid;
		grid-template-columns: var(--label-w) auto;
		grid-template-rows: auto auto;
		overflow-x: auto;
	}
	.col-labels {
		grid-column: 2;
		display: flex;
		height: 5.2rem;
		align-items: flex-end;

		.col-label {
			width: var(--cell);
			flex-shrink: 0;
			writing-mode: vertical-rl;
			transform: rotate(180deg);
			text-align: left;
			font-size: 0.78rem;
			color: var(--ink-secondary);
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			max-height: 5rem;
			line-height: var(--cell);
		}
	}
	.grid {
		grid-column: 1 / 3;
		display: flex;
		flex-direction: column;
		gap: 2px;
		border-radius: var(--radius-sm);
		&:focus-visible {
			outline-offset: 4px;
		}
	}
	.row {
		display: flex;
		align-items: center;
		gap: 2px;
	}
	.row-label {
		width: var(--label-w);
		flex-shrink: 0;
		padding-right: 0.6rem;
		text-align: right;
		font-size: 0.82rem;
		color: var(--ink-secondary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.hot {
		color: var(--ink-strong) !important;
		font-weight: 700;
	}
	.cell {
		width: calc(var(--cell) - 2px);
		height: calc(var(--cell) - 2px);
		flex-shrink: 0;
		display: grid;
		place-items: center;
		border-radius: 4px;
		font-size: 0.72rem;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		transition: transform 0.12s var(--ease-out);
		cursor: crosshair;

		&.masked {
			background: repeating-linear-gradient(
				135deg,
				var(--surface-subtle) 0 4px,
				var(--surface-muted) 4px 7px
			);
			cursor: default;
		}
		&.top {
			box-shadow: inset 0 0 0 2px var(--brand);
		}
		&.active {
			transform: scale(1.12);
			box-shadow:
				0 0 0 2px var(--surface),
				0 0 0 4px var(--ink-strong);
			z-index: 1;
		}
	}
	.compact .cell {
		border-radius: 3px;
		cursor: default;
		&.active {
			transform: none;
		}
	}
	.compact .row-label {
		font-size: 0.72rem;
	}
	.compact .col-labels {
		display: none;
	}

	.legend {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.75rem;
		color: var(--ink-muted);

		.bar {
			width: 7rem;
			height: 0.5rem;
			border-radius: 999px;
		}
		.masked-key {
			display: inline-flex;
			align-items: center;
			gap: 0.35rem;
			margin-left: 1rem;
		}
		.swatch {
			width: 0.9rem;
			height: 0.9rem;
			border-radius: 3px;
			background: repeating-linear-gradient(
				135deg,
				var(--surface-subtle) 0 3px,
				var(--line-strong) 3px 5px
			);
		}
	}

	.most {
		h3 {
			font-size: 0.95rem;
			font-weight: 700;
			color: var(--heading);
			margin-bottom: 0.5rem;
		}
		ol {
			display: flex;
			flex-direction: column;
			gap: 0.3rem;
		}
		li {
			display: grid;
			grid-template-columns: 6rem 1fr 6rem 3rem;
			align-items: center;
			gap: 0.6rem;
			font-size: 0.85rem;
			padding: 0.15rem 0.4rem;
			border-radius: 0.4rem;

			&.focus {
				background: var(--brand-soft);
			}
		}
		.from,
		.to {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			font-weight: 600;
			color: var(--ink-strong);
		}
		.from {
			text-align: right;
		}
		.bar-track {
			height: 0.45rem;
			border-radius: 999px;
			background: var(--surface-muted);
			overflow: hidden;
		}
		.bar-fill {
			display: block;
			height: 100%;
			border-radius: 999px;
			background: var(--teal);
			transition: width 0.4s var(--ease-out);
		}
		.num {
			text-align: right;
			font-variant-numeric: tabular-nums;
			color: var(--ink-secondary);
		}
	}
	.empty {
		font-size: 0.9rem;
		color: var(--ink-muted);
	}
</style>
