<script lang="ts">
	import {
		inputText,
		inputTextExample,
		inputTextExampleShort,
		isModelRunning,
		expandedBlock,
		weightPopover
	} from '~/store';
	import { selectExample } from '~/utils/playground/actions';

	interface Props {
		/** Ignore the "busy" states (used on phones, where nothing else can be running). */
		alwaysEnabled?: boolean;
	}

	let { alwaysEnabled = false }: Props = $props();

	const disabled = $derived(
		!alwaysEnabled && ($isModelRunning || $expandedBlock.id !== null || !!$weightPopover)
	);
	const current = $derived($inputText.trim());
</script>

<div class="example-chips select-button" role="group" aria-label="Example prompts">
	{#each inputTextExample as text, i}
		<button
			type="button"
			class="chip"
			class:selected={current === text.trim()}
			aria-pressed={current === text.trim()}
			title={text}
			aria-label="Example {i + 1}: {text}"
			aria-keyshortcuts={String(i + 1)}
			{disabled}
			onclick={() => selectExample(i)}
		>
			<span class="num" aria-hidden="true">{i + 1}</span>
			<span class="text">{inputTextExampleShort[i] ?? text}</span>
		</button>
	{/each}
</div>

<style lang="scss">
	.example-chips {
		display: flex;
		gap: 0.5rem;
		min-width: 0;
		overflow-x: auto;
		scrollbar-width: none;
		padding: 2px; // room for the focus ring

		&::-webkit-scrollbar {
			display: none;
		}
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		flex: 0 1 auto;
		min-width: 0;
		max-width: 15rem;
		height: 2rem;
		padding: 0 0.8rem 0 0.3rem;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: var(--surface);
		color: var(--ink-body);
		font-size: 0.82rem;
		font-weight: 500;
		transition:
			background-color 0.18s var(--ease-out),
			border-color 0.18s var(--ease-out),
			transform 0.18s var(--ease-out);

		.num {
			display: grid;
			place-items: center;
			flex-shrink: 0;
			width: 1.45rem;
			height: 1.45rem;
			border-radius: 999px;
			background: var(--surface-muted);
			color: var(--ink-secondary);
			font-size: 0.72rem;
			font-weight: 700;
		}
		.text {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		&:hover:not(:disabled) {
			border-color: var(--line-strong);
			background: var(--surface-subtle);
			transform: translateY(-1px);
		}
		&.selected {
			border-color: var(--teal);
			background: var(--teal-soft);
			color: var(--ink-strong);

			.num {
				background: var(--brand);
				color: var(--brand-ink);
			}
		}
		&:disabled {
			cursor: not-allowed;
			opacity: 0.6;
		}
	}
</style>
