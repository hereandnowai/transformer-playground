<script lang="ts">
	import { modelMeta, tokens, rootRem } from '~/store';
	import * as d3 from 'd3';
	import { gsap } from '~/utils/gsap';
	import Matrix from '~/components/common/Matrix.svelte';
	import { onDestroy, onMount } from 'svelte';
	import HelpPopover from '../common/HelpPopover.svelte';
	import { themePalette } from '~/store/theme';
	import WeightPopoverCard from '../common/WeightPopoverCard.svelte';
	import Katex from '~/utils/Katex.svelte';

	$: palette = $themePalette;

	const tokenGap = 6;

	// generate data
	const visibleDimension = 20;

	$: tokenLen = $tokens.length;

	// Illustrative values: W_O is (768, 768), so a few rows and columns stand for the whole matrix.
	const wOWeightData = Array(visibleDimension)
		.fill(0)
		.map((col) =>
			Array(visibleDimension)
				.fill(0)
				.map((d) => Math.random())
		);

	const wOBiasData = Array(1)
		.fill(0)
		.map((col) =>
			Array(visibleDimension)
				.fill(0)
				.map((d) => Math.random())
		);
	$: headsConcatData = Array(tokenLen)
		.fill(0)
		.map((col) =>
			Array(visibleDimension)
				.fill(0)
				.map((d) => Math.random())
		);
	$: attentionOutData = Array(tokenLen)
		.fill(0)
		.map((col) =>
			Array(visibleDimension)
				.fill(0)
				.map((d) => Math.random())
		);
	// color scale
	let weightColorScale;
	$: weightColorScale = (d, i) => {
		return d3.interpolate(palette.color('gray', 100), palette.color('gray', 400))(d);
	};
	let out1ColorScale;
	$: out1ColorScale = (d, i) => {
		return d3.interpolate(palette.color('purple', 100), palette.color('purple', 400))(d);
	};
	let out2ColorScale;
	$: out2ColorScale = (d, i) => {
		return d3.interpolate(palette.color('purple', 100), palette.color('purple', 400))(d);
	};

	// animation
	let isAnimationActive = false;
	let progress = 0;
	let timeline = gsap.timeline();

	onMount(() => {
		timeline.eventCallback('onUpdate', () => {
			progress = timeline.progress();
			if (progress === 1) isAnimationActive = false;
		});

		setTimeout(() => {
			isAnimationActive = true;
			draw();
		}, 300);
	});

	onDestroy(() => {
		if (timeline) {
			timeline.kill();
			timeline = null;
		}
	});

	const draw = () => {
		// upscale --------------------------------
		const embeddingRows = d3.selectAll('.weight-popover-content .embedding-matrix g.g-row').nodes();
		const weightCols = d3.selectAll('.weight-popover-content .out-proj-weights g.g-col').nodes();
		const weightBiasCells = d3.selectAll('.weight-popover-content .out-proj-bias rect').nodes();

		const outRows = d3.selectAll('.weight-popover-content .out-proj-out g.g-row').nodes();

		const mulSymbol = d3.select('.weight-popover-content .symbol.mul').node();
		const plusSymbol = d3.select('.weight-popover-content .symbol.plus').node();
		const equalSymbol = d3.select('.weight-popover-content .symbol.equal').node();

		const highlight = '#94a3b8';

		// first row detail animation
		timeline.set(weightBiasCells, { opacity: 0.1 });
		timeline.set('.formula .first-row', { opacity: 1 });
		timeline.set('.formula .total', { opacity: 0 });

		const firstOutputRowRects = d3.select(outRows[0]).selectAll('rect').nodes();
		const firstEmbeddingRowRects = d3.select(embeddingRows[0]).selectAll('rect').nodes();

		firstOutputRowRects.forEach((outputRect, outCellIdx) => {
			const isFirstOutCell = outCellIdx === 0;
			const firstWeightColRects = d3.select(weightCols[outCellIdx]).selectAll('rect').nodes();
			timeline.set(firstEmbeddingRowRects, { opacity: 0.1 });

			firstEmbeddingRowRects.forEach((embeddingRect, i) => {
				//embedding
				timeline
					.fromTo(
						embeddingRect,
						{ opacity: 0.1, strokeWidth: 0 },
						{
							opacity: 1,
							duration: isFirstOutCell ? 0.1 : 0.002,
							strokeWidth: 10,
							stroke: highlight
						}
					)
					.to(
						embeddingRect,
						{
							strokeWidth: 0,
							duration: isFirstOutCell ? 0.1 : 0.002
						},
						'<50%'
					);

				//weights
				timeline
					.fromTo(
						firstWeightColRects[i],
						{ opacity: 0.1, strokeWidth: 0 },
						{
							opacity: 1,
							duration: isFirstOutCell ? 0.1 : 0.002,
							strokeWidth: 10,
							stroke: highlight
						},
						'<-50%'
					)
					.to(
						firstWeightColRects[i],
						{
							strokeWidth: 0,
							duration: isFirstOutCell ? 0.1 : 0.002
						},
						'<50%'
					);
			});

			//symbol
			if (isFirstOutCell) {
				timeline.from(
					[
						mulSymbol,
						equalSymbol,
						plusSymbol,
						,
						'.formula .first-row .part1',
						'.formula .first-row .part2'
					],
					{
						duration: 0.05,
						opacity: 1
					},
					'<50%'
				);
			}
			//bias
			timeline
				.fromTo(
					weightBiasCells[outCellIdx],

					{ opacity: 0.1, strokeWidth: 0 },
					{
						opacity: 1,
						duration: isFirstOutCell ? 0.4 : 0.002,
						strokeWidth: 10,
						stroke: highlight
					},
					'<'
				)
				.to(
					weightBiasCells[outCellIdx],

					{
						strokeWidth: 0,
						duration: isFirstOutCell ? 0.4 : 0.002
					},
					'<50%'
				);

			//out
			timeline
				.fromTo(
					outputRect,
					{ opacity: 0, strokeWidth: 0 },
					{
						opacity: 1,
						duration: isFirstOutCell ? 0.4 : 0.002,
						strokeWidth: 10,
						stroke: highlight
					},
					'<-50%'
				)
				.to(
					outputRect,

					{
						strokeWidth: 0,
						duration: isFirstOutCell ? 0.4 : 0.002
					},
					'<50%'
				);
			if (isFirstOutCell) {
				timeline.to('.formula .first-row', { opacity: 0, duration: 0.3 }, '>+1');
				timeline.to('.formula .total', { opacity: 1, duration: 0.3 }, `<`);
			}
		});

		// rest row animation
		let previousRowIdx = 0;

		// out vectors
		outRows.forEach(function (row, rowIdx) {
			if (rowIdx === 0) return;

			const outputCells = d3.select(row).selectAll('rect').nodes();
			const embeddingRowRects = d3.select(embeddingRows[rowIdx]).selectAll('rect').nodes();

			// Check if rowIdx has changed
			if (previousRowIdx !== null && previousRowIdx !== rowIdx) {
				timeline.fromTo(
					embeddingRowRects,
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: 0.01
					},
					'<'
				);

				const weightColRects = d3
					.selectAll('.weight-popover-content .out-proj-weights g.g-col rect')
					.nodes();
				timeline.set(weightColRects, { opacity: 0.1 });
				timeline.set(weightBiasCells, { opacity: 0.1 });
			}

			outputCells.forEach((d, colIdx) => {
				const weightColRects = d3.select(weightCols[colIdx]).selectAll('rect').nodes();

				timeline.fromTo(
					weightColRects,
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: 0.01
					},
					`<50%`
				);

				timeline.from(
					d,
					{
						opacity: 0,
						duration: 0.01
					},
					`<50%`
				);
				timeline.fromTo(
					weightBiasCells[colIdx],
					{ opacity: 0.1 },
					{
						opacity: 1,
						duration: 0.01
					},
					'<'
				);
			});
			previousRowIdx = rowIdx;
		});
	};

	// event
	let highlightCol: number | undefined = undefined;
	let highlightRow: number | undefined = undefined;

	const onMouseOverCell = (e, d) => {
		if (isAnimationActive) return;
		highlightRow = d.rowIndex;
		highlightCol = d.colIndex;
	};
	const onMouseOutSvg = () => {
		highlightCol = undefined;
		highlightRow = undefined;
	};
</script>

<WeightPopoverCard
	id="output-projection"
	title={'Attention Output Projection (Wₒ)'}
	bind:isAnimationActive
	{timeline}
>
	<div class="out-proj-weight-popover weight-popover-content flex items-center justify-start">
		<div class="matrix flex flex-col items-center">
			<div class="tokens" style={`gap:${tokenGap}px`}>
				{#each $tokens as token, index}
					<div class="token-label"><span>{token}</span></div>
				{/each}
			</div>
		</div>
		<div class="matrix flex flex-col items-center">
			<div class="title flex items-center gap-1">
				Joined Head Outputs <HelpPopover id="out-proj-concat"
					>{`The ${$modelMeta.attention_head_num} head outputs (${$modelMeta.dimension / $modelMeta.attention_head_num} numbers each), \nplaced side by side: ${$modelMeta.dimension} numbers per token.`}</HelpPopover
				>
			</div>
			<div class="flex">
				<Matrix
					className="embedding-matrix"
					data={headsConcatData}
					showSize={false}
					cellHeight={rootRem * 0.8}
					cellWidth={3}
					rowGap={tokenGap}
					colorScale={out1ColorScale}
					{highlightRow}
				/>
			</div>
			<div class="size">({tokenLen}, {$modelMeta.dimension})</div>
		</div>

		<div class="operator">
			<div class="symbol mul">&times;</div>
		</div>
		<div class="matrix flex flex-col items-center">
			<div class="title flex items-center gap-1">
				<span>Output Weights W<sub>O</sub></span>
				<HelpPopover id="out-proj-weights"
					>{`Mixes what the heads found into one vector. \nCalled c_proj in the GPT-2 code. \nLearned in training, fixed in prediction.`}</HelpPopover
				>
			</div>
			<div class="flex gap-0">
				<Matrix
					className="out-proj-weights"
					data={wOWeightData}
					showSize={false}
					groupBy={'col'}
					cellHeight={3}
					cellWidth={3}
					rowGap={0}
					colorScale={weightColorScale}
					{highlightCol}
				/>
			</div>

			<div class="size">({$modelMeta.dimension}, {$modelMeta.dimension})</div>
		</div>
		<div class="operator"><div class="symbol plus px-3">+</div></div>
		<div class="matrix flex flex-col items-center">
			<div class="title flex items-center gap-1">
				Output Bias <HelpPopover id="out-proj-bias"
					>{`Offsets added after the projection. \nLearned in training, fixed in prediction.`}</HelpPopover
				>
			</div>
			<Matrix
				className="out-proj-bias"
				data={wOBiasData}
				showSize={false}
				groupBy={'col'}
				cellHeight={2}
				cellWidth={8}
				rowGap={0}
				colorScale={weightColorScale}
				highlightRow={highlightCol}
			/>
			<div class="size">({$modelMeta.dimension})</div>
		</div>
		<div class="operator">
			<div class="symbol equal px-4">=</div>
		</div>
		<div class="matrix flex flex-col items-center">
			<div class="title">Attention <br />Output</div>
			<div class="flex">
				<Matrix
					className="out-proj-out"
					data={attentionOutData}
					showSize={false}
					cellHeight={rootRem * 0.8}
					cellWidth={3}
					rowGap={tokenGap}
					colorScale={out2ColorScale}
					{onMouseOverCell}
					{onMouseOutSvg}
					{highlightCol}
					{highlightRow}
				/>
			</div>
			<div class="size">({tokenLen}, {$modelMeta.dimension})</div>
		</div>
	</div>
	<div class="formula">
		<div class="first-row flex items-center justify-center gap-1">
			<span class="part1">
				<Katex
					displayMode
					math={`
	(Heads_{1,1}×W^O_{1,1} + \\cdots + Heads_{1,768}×W^O_{768,1})`}
				/>
			</span>
			<span class="part2">
				<Katex displayMode math={`+ Bias_1 = Out_{1,1}`} />
			</span>
		</div>
		<div class="total">
			<Katex
				displayMode
				math={`
	\\sum_{d=1}^{768} Heads_{id} \\cdot W^O_{dj} + Bias_j = Out_{ij}
	`}
			/>
		</div>
	</div>
</WeightPopoverCard>

<style lang="scss">
	.weight-popover-content {
		padding: 3rem 4rem 1.5rem 1rem;
		gap: 1rem;
	}

	.operator {
		position: relative;
	}
</style>
