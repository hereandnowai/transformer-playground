<script lang="ts">
	import { BookOpenSolid } from 'flowbite-svelte-icons';
	import { fade } from 'svelte/transition';
	import {
		textbookCurrentPage,
		textbookPreviousPage,
		isTextbookOpen,
		expandedBlock,
		textbookCurrentPageId
	} from '~/store';
	import { textPages } from '~/utils/textbookPages';
	import TextbookCard from './TextbookCard.svelte';
	import { storyOpen, landingInView } from '~/store/ui';

	export let showTextCard: boolean = false;

	$: if (showTextCard) {
		handlePageTransition($textbookCurrentPage, $textbookPreviousPage);
	} else {
		if ($textbookPreviousPage >= 0 && textPages[$textbookPreviousPage]?.out) {
			textPages[$textbookPreviousPage].out();
		}
		textbookPreviousPage.set(-1);
	}

	function handlePageTransition(newPage: number, oldPage: number) {
		if (oldPage >= 0 && oldPage !== newPage) {
			textPages[oldPage]?.out();
		}
		setTimeout(() => {
			textPages[newPage]?.on();
		}, 0);
	}
</script>

<!-- Button that opens the 22 deep-dive notes (hidden while Story mode is open) -->
{#if !showTextCard && !$storyOpen && $landingInView}
	<div class="floating-container" transition:fade={{ duration: 150 }}>
		<button
			type="button"
			class="floating-btn"
			title="Deep-dive notes: 22 short cards on every part of the diagram"
			on:click={() => {
				isTextbookOpen.set(true);
			}}
		>
			<BookOpenSolid class="h-5 w-5" />
			Deep-dive notes
		</button>
	</div>
{/if}

{#if showTextCard}
	<TextbookCard onClose={() => isTextbookOpen.set(false)} />
{/if}

<style lang="scss">
	.floating-container {
		position: fixed;
		bottom: 1.5rem;
		left: 1.5rem;
		z-index: $TEXTBOOK_INDEX;
	}

	.floating-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		height: 2.75rem;
		padding: 0 1.15rem 0 0.95rem;
		border-radius: 999px;
		background: var(--teal);
		color: #ffffff;
		font-weight: 700;
		font-size: 0.9rem;
		box-shadow: var(--shadow-md);
		transition: all 0.2s ease;

		&:hover {
			transform: translateY(-2px);
			box-shadow: var(--shadow-lg);
		}
	}
	:global(html.dark) .floating-btn {
		color: #0a0a0a;
	}
	:root {
		--textbook-highlight-color: var(--accent-blue-600);
		--textbook-highlight-background: linear-gradient(
			to top,
			rgba(251, 255, 0, 0.5),
			rgba(251, 255, 0, 0.3),
			rgba(255, 212, 8, 0)
		);
		--textbook-highlight-shadow-in:
			inset 0 0 10px rgba(251, 255, 0, 0.5), inset 0 0 10px 2px rgba(251, 255, 0, 0.3);
		--textbook-highlight-shadow-out:
			0 2px 8px 1px rgba(251, 255, 0, 0.5), 0 1.5px 6px 3px rgba(251, 255, 0, 0.12);
	}

	:global(.remove-finger) {
		&::after {
			display: none !important;
		}

		:global(*) {
			&::after {
				display: none !important;
			}
		}
	}

	// page - transformer
	:global(.input-form.textbook-highlight .pill) {
		transition: box-shadow 0.2s ease-in-out;
		box-shadow: var(--textbook-highlight-shadow-out) !important;
	}

	:global(.input-form .generate-button.textbook-highlight),
	:global(.example-chips.textbook-highlight) {
		border-radius: 999px;
		box-shadow:
			0 0 0 3px var(--surface),
			0 0 0 6px var(--teal) !important;
		transition: box-shadow 0.2s ease-in-out;
	}

	// page - architecture
	:global(.step.textbook-highlight > .title) {
		width: 1rem !important;
		white-space: nowrap !important;
		color: var(--textbook-highlight-color) !important;
		font-weight: 500 !important;
	}
	:global(.textbook-highlight .bounding) {
		opacity: 1 !important;
		border: 1px dashed var(--textbook-highlight-color) !important;
		box-shadow: var(--textbook-highlight-shadow-in) !important;
		z-index: $BOUNDING_BOX_INDEX !important;
		border-radius: 1rem !important;
	}
	:global(.embedding.textbook-highlight),
	:global(.softmax.textbook-highlight) {
		:global(.title) {
			padding-bottom: 3.5rem !important;
		}
		:global(.bounding) {
			top: -3.3rem !important;
			padding: 0 !important;
		}
	}
	:global(.transformer-bounding-title.textbook-highlight) {
		color: var(--textbook-highlight-color) !important;
		:global(button) {
			border: 1px solid var(--textbook-highlight-color) !important;
			color: var(--textbook-highlight-color) !important;
		}
		:global(button:disabled) {
			border: 1px solid var(--textbook-highlight-color) !important;
			color: var(--textbook-highlight-color) !important;
		}
	}
	:global(.transformer-bounding.textbook-highlight) {
		border: 1px dashed var(--textbook-highlight-color) !important;
		box-shadow: var(--textbook-highlight-shadow-in) !important;
	}

	// page - embedding
	:global(.embedding .column.textbook-highlight) {
		// border-radius: 1rem;
		transition: all 0.2s !important;
		background: var(--textbook-highlight-background) !important;

		:global(.subtitle) {
			transition: all 0.2s !important;
			// font-weight: 600 !important;
			color: var(--textbook-highlight-color) !important;
		}

		:global(.bounding) {
			opacity: 0 !important;
		}
	}
	:global(.embedding .title.textbook-highlight .title-text) {
		position: relative;
		transition: all 0.2s ease-in-out;
		cursor: pointer;
		color: var(--ink-secondary) !important;
		background: var(--textbook-highlight-background) !important;

		&::after {
			content: '👈';
			display: block;
			white-space: nowrap;
			position: absolute;
			right: -2rem;
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke-horizon 1.5s ease-in-out infinite;
		}
	}

	// page qkv
	:global(.qkv-column.textbook-highlight) {
		&::after {
			z-index: $BOUNDING_BOX_INDEX;
			content: '👇';
			display: block;
			white-space: nowrap;
			position: absolute;
			right: 2rem;
			top: -2rem;
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke 1.5s ease-in-out infinite;
		}
	}
	:global(.path-group.qkv.textbook-highlight) {
		animation: opacity-blink 1.5s ease-in-out infinite !important;
	}

	// page multi-head
	:global(.multi-head .head-title.textbook-highlight) {
		color: var(--textbook-highlight-color) !important;
		// font-weight: 600 !important;
		transition: all 0.3s ease-in-out !important;
		scale: 1.1 !important;

		:global(button) {
			transition: all 0.5s !important;
			border: 1px solid var(--textbook-highlight-color) !important;
			color: var(--textbook-highlight-color) !important;
			box-shadow: var(--textbook-highlight-shadow-out) !important;
		}

		&::after {
			z-index: $BOUNDING_BOX_INDEX;
			content: '👈';
			display: block;
			white-space: nowrap;
			position: absolute;
			right: -1.5rem;
			bottom: 0rem;
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke-horizon 1.5s ease-in-out infinite;
		}
	}

	// page attention
	:global(.attention-result.textbook-highlight) {
		&::after {
			content: '👆';
			display: block;
			white-space: nowrap;
			position: absolute;
			bottom: -2.2rem;
			left: 50%;
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke 1.5s ease-in-out infinite;
		}
	}
	:global(.attention-result.textbook-highlight .matrix-label) {
		color: var(--ink-secondary) !important;
		background: var(--textbook-highlight-background) !important;
	}

	// page output concat
	:global(path.to-attention-out.value-to-out.textbook-highlight) {
		animation: opacity-blink 1.5s ease-in-out infinite !important;
		&::after {
			z-index: $BOUNDING_BOX_INDEX;
			content: '👈';
			display: block;
			white-space: nowrap;
			position: absolute;
			right: -1.5rem;
			bottom: 0rem;
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke-horizon 1.5s ease-in-out infinite;
		}
		// color: var(--textbook-highlight-color) !important;
	}
	:global(.column.out.textbook-highlight) {
		&::after {
			z-index: $BOUNDING_BOX_INDEX;
			content: '👈';
			display: block;
			white-space: nowrap;
			position: absolute;
			left: 0;
			bottom: -4rem;
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke-horizon 1.5s ease-in-out infinite;
		}
	}

	// page transformer blocks
	:global(.step.transformer-blocks .guide.textbook-highlight) {
		transition: all 0.5s !important;
		scale: 1.1 !important;
	}

	:global(.transformer-bounding-title.textbook-button-highlight) {
		color: var(--textbook-highlight-color) !important;
		// font-weight: 600 !important;
		transition: all 0.3s ease-in-out !important;
		scale: 1.1 !important;

		:global(button) {
			transition: all 0.5s !important;
			border: 1px solid var(--textbook-highlight-color) !important;
			color: var(--textbook-highlight-color) !important;
			box-shadow: var(--textbook-highlight-shadow-out) !important;
		}
		&::after {
			z-index: $BOUNDING_BOX_INDEX;
			content: '👈';
			display: block;
			white-space: nowrap;
			position: absolute;
			right: -2rem;
			bottom: -0.5rem;
			color: var(--textbook-highlight-color);
			font-size: 1.7rem;
			pointer-events: none;
			animation: finger-poke-horizon 1.5s ease-in-out infinite;
		}
	}
	:global(.attention .title.textbook-highlight) {
		color: var(--textbook-highlight-color) !important;
	}
	:global(.mlp .title.textbook-highlight) {
		color: var(--textbook-highlight-color);
	}

	// logit
	:global(.path-group.softmax.textbook-highlight > path) {
		animation: opacity-blink 1.5s ease-in-out infinite !important;
	}
	:global(.column.final.textbook-highlight) {
		&::after {
			z-index: $BOUNDING_BOX_INDEX;
			content: '👉';
			display: block;
			white-space: nowrap;
			position: absolute;
			right: 1rem;
			bottom: 0rem;
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke-horizon 1.5s ease-in-out infinite;
		}
	}

	// page 12 probabilities
	:global(.step.softmax .title.textbook-highlight .title-text) {
		position: relative;
		transition: all 0.2s ease-in-out;
		cursor: pointer;
		color: var(--ink-secondary) !important;
		background: var(--textbook-highlight-background) !important;

		&::after {
			content: '👈';
			display: block;
			white-space: nowrap;
			position: absolute;
			right: -2rem;
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke-horizon 1.5s ease-in-out infinite;
		}
	}

	// page temperature
	:global(.formula-step.scaled.textbook-highlight) {
		background: var(--textbook-highlight-background) !important;
		color: var(--ink-secondary) !important;
	}

	:global(.title-box.scaled.textbook-highlight .title-text) {
		color: var(--ink-secondary) !important;
		background: var(--textbook-highlight-background) !important;
	}
	:global(.content-box.scaled.textbook-highlight) {
		background: var(--textbook-highlight-background) !important;
	}

	:global(.temperature-input.textbook-highlight) {
		position: relative;
		&::after {
			content: '👆';
			display: block;
			white-space: nowrap;
			position: absolute;
			bottom: -2.5rem;
			left: 50%;
			transform: translateX(-50%);
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke 1.5s ease-in-out infinite;
		}
	}
	:global(.temperature-input.textbook-highlight) {
		background: var(--textbook-highlight-background) !important;
	}

	// page sampling
	:global(.formula-step.sampling.textbook-highlight) {
		background: var(--textbook-highlight-background) !important;
		color: var(--ink-secondary) !important;
	}

	:global(.title-box.sampling.textbook-highlight .title-text) {
		color: var(--ink-secondary) !important;
		background: var(--textbook-highlight-background) !important;
	}
	:global(.content-box.sampling.textbook-highlight) {
		background: var(--textbook-highlight-background) !important;
	}
	:global(.sampling-input.textbook-highlight) {
		position: relative;
		&::after {
			content: '👆';
			display: block;
			white-space: nowrap;
			position: absolute;
			bottom: -2.5rem;
			left: 50%;
			transform: translateX(-50%);
			color: var(--textbook-highlight-color);
			font-size: 2rem;
			pointer-events: none;
			animation: finger-poke 1.5s ease-in-out infinite;
		}
	}
	:global(.sampling-input.textbook-highlight) {
		background: var(--textbook-highlight-background) !important;
	}

	// residual
	:global(.operation-col.residual.textbook-highlight) {
		// pointer-events: none;
	}
	:global(.residual-start.textbook-highlight .residual-text) {
		color: var(--ink-secondary) !important;
		background: var(--textbook-highlight-background) !important;
	}

	// ln, dropout
	:global(.operation-col.textbook-highlight) {
		// pointer-events: none;
	}
	:global(.operation-col.textbook-highlight .icon) {
		opacity: 0 !important;
	}
	:global(.operation-col.textbook-highlight .line) {
		opacity: 1 !important;
	}
	:global(.operation-col.textbook-highlight .guide) {
		opacity: 1 !important;
	}
	:global(.operation-col.textbook-highlight .guide-text) {
		color: var(--ink-secondary) !important;
		background: var(--textbook-highlight-background) !important;
	}

	// animation
	@keyframes finger-poke {
		0%,
		100% {
			transform: translateY(0);
		}
		20% {
			transform: translateY(-4px);
		}
		40% {
			transform: translateY(3px);
		}
		60% {
			transform: translateY(-2px);
		}
		80% {
			transform: translateY(0);
		}
	}
	@keyframes finger-poke-horizon {
		0%,
		100% {
			transform: translateX(0);
		}
		20% {
			transform: translateX(-4px);
		}
		40% {
			transform: translateX(3px);
		}
		60% {
			transform: translateX(-2px);
		}
		80% {
			transform: translateX(0);
		}
	}

	@keyframes textbook-button-blink {
		0% {
			border: 1px solid var(--line-strong);
			color: var(--ink-secondary);
		}
		50% {
			border: 1px solid var(--predicted-color);
			color: var(--predicted-color);
		}
		100% {
			border: 1px solid var(--line-strong);
			color: var(--ink-secondary);
		}
	}
	@keyframes scale-blink {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.08);
		}
		100% {
			transform: scale(1);
		}
	}
	@keyframes opacity-blink {
		0%,
		100% {
			opacity: 0.6;
		}
		50% {
			opacity: 1;
		}
	}
</style>
