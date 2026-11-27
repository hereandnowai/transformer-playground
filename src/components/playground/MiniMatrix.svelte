<script lang="ts">
	import { interpolateRgb } from 'd3';
	import { isDark } from '~/store/theme';

	interface Props {
		matrix: number[][];
		/** Side length of the whole square, in px. */
		size?: number;
		label: string;
	}

	let { matrix, size = 64, label }: Props = $props();

	const n = $derived(matrix.length);
	const ramp = $derived(
		$isDark ? interpolateRgb('#1c1c1c', '#ffdb00') : interpolateRgb('#eef4f3', '#004040')
	);
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 {n} {n}"
	role="img"
	aria-label={label}
	shape-rendering="crispEdges"
>
	{#each matrix as row, i}
		{#each row as v, j}
			{#if j <= i}
				<rect x={j} y={i} width="1" height="1" fill={ramp(v)} />
			{/if}
		{/each}
	{/each}
</svg>

<style>
	svg {
		display: block;
		border-radius: 6px;
		background: var(--surface-subtle);
	}
</style>
