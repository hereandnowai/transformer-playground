<script lang="ts">
	import {
		inputText,
		isModelRunning,
		predictedToken,
		isFetchingModel,
		expandedBlock,
		weightPopover,
		isMobile
	} from '~/store';
	import { modelLoadError, modelLoadProgress, modelLoadRetry, pendingPrompt } from '~/store/ui';
	import { completeCurrentAnimation } from '~/utils/animation';
	import { textPages } from '~/utils/textbookPages';
	import { WORD_LIMIT, normalisePrompt, wordCount } from '~/utils/playground/prompt';
	import LoadingDots from '~/components/common/LoadingDots.svelte';

	let editor: HTMLSpanElement | undefined = $state();
	let field: HTMLDivElement | undefined = $state();

	/** The text in the box. Once the box is focused, the predicted word is folded into it. */
	let draft = $state('');
	let merged = $state(false);

	const predicted = $derived($predictedToken?.token ?? '');

	// A new run (or a new example) resets the box to the prompt that was run.
	$effect(() => {
		const text = $inputText;
		draft = text;
		merged = false;
		if (editor && document.activeElement !== editor) editor.innerText = text;
	});

	// Long prompts keep their end (and the predicted word) in view.
	$effect(() => {
		void draft;
		void showPrediction;
		void predicted;
		if (field) field.scrollLeft = field.scrollWidth;
	});

	const tooLong = $derived(wordCount(merged ? draft : draft + predicted) > WORD_LIMIT);
	const blocked = $derived($isFetchingModel || $expandedBlock.id !== null || !!$weightPopover);
	const canGenerate = $derived(!blocked && !tooLong);
	const showPrediction = $derived(!merged && !$isModelRunning && predicted.length > 0);
	const loadPct = $derived(Math.round($modelLoadProgress * 100));

	const status = $derived.by(() => {
		if ($isMobile)
			return 'Try the examples. Typing your own text needs a desktop or laptop browser.';
		if ($modelLoadError) return `${$modelLoadError} Press Retry download; the examples still work.`;
		if ($isFetchingModel)
			return $pendingPrompt
				? `Your shared prompt runs as soon as GPT-2 has loaded (${loadPct}%).`
				: `Loading GPT-2 in your browser (${loadPct}% of about 630 MB, first visit only). Try the examples meanwhile.`;
		if (tooLong) return `Keep it to ${WORD_LIMIT} words or fewer.`;
		if ($expandedBlock.id !== null) return 'Close the zoomed view to type a new prompt.';
		return '';
	});

	const foldPrediction = () => {
		if (merged || !editor) return;
		draft = normalisePrompt(draft + predicted);
		editor.innerText = draft;
		merged = true;
	};

	const placeCaretAtEnd = () => {
		if (!editor) return;
		const range = document.createRange();
		range.selectNodeContents(editor);
		range.collapse(false);
		const sel = window.getSelection();
		sel?.removeAllRanges();
		sel?.addRange(range);
	};

	const generate = (event?: Event) => {
		event?.preventDefault();
		if (!canGenerate) return;
		completeCurrentAnimation();
		foldPrediction();
		textPages.find((page) => page.id === 'how-transformers-work')?.complete?.();
		const text = normalisePrompt(draft);
		// Re-running the same text still counts as a new run.
		inputText.set(text === $inputText ? text + ' ' : text);
	};

	const onKeydown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			generate();
		}
	};

	const onPaste = (event: ClipboardEvent) => {
		// Plain text only: no pasted formatting or line breaks in the prompt.
		event.preventDefault();
		const text = event.clipboardData?.getData('text/plain') ?? '';
		document.execCommand('insertText', false, text.replace(/\s+/g, ' '));
	};
</script>

<form
	class="prompt-bar input-form"
	class:blocked
	onsubmit={generate}
	aria-describedby="prompt-status"
>
	<div class="pill" class:running={$isModelRunning}>
		<span class="spark" aria-hidden="true">
			<svg viewBox="0 0 24 24" width="18" height="18"
				><path d="M12 2.5 14 9l6.5 2-6.5 2-2 6.5-2-6.5-6.5-2L10 9z" fill="currentColor" /></svg
			>
		</span>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			bind:this={field}
			class="field"
			onclick={() => {
				editor?.focus();
				placeCaretAtEnd();
			}}
		>
			<span
				bind:this={editor}
				class="editor"
				contenteditable={blocked ? 'false' : 'plaintext-only'}
				role="textbox"
				tabindex="0"
				aria-label="Your prompt: GPT-2 predicts the next word"
				aria-multiline="false"
				aria-disabled={blocked}
				data-placeholder="Type a sentence and press Generate"
				onfocus={() => {
					foldPrediction();
					placeCaretAtEnd();
				}}
				oninput={() => (draft = editor?.innerText ?? '')}
				onkeydown={onKeydown}
				onpaste={onPaste}
			></span>
			{#if showPrediction}
				{#if /^\s/.test(predicted)}<span class="gap"> </span>{/if}<mark
					class="prediction"
					title="The word GPT-2 picked next">{predicted.trimStart()}</mark
				>
			{/if}
			{#if $isModelRunning}
				<span class="running-dots"><LoadingDots /></span>
			{/if}
		</div>
		{#if tooLong}
			<span class="limit" title={status}>{WORD_LIMIT} words max</span>
		{/if}
		{#if $modelLoadError}
			<button
				type="button"
				class="generate-button retry"
				title="{$modelLoadError} Try again (parts already downloaded are kept)."
				onclick={() => modelLoadRetry.update((n) => n + 1)}
			>
				<span class="btn-text">Retry download</span>
			</button>
		{:else}
			<button
				type="submit"
				class="generate-button"
				class:loading={$isFetchingModel && !$isMobile}
				disabled={!canGenerate}
				title={status || 'Run GPT-2 on your prompt (Enter)'}
				aria-keyshortcuts="Enter"
				style="--load:{loadPct}%"
			>
				<span class="btn-text">
					{#if $isFetchingModel && !$isMobile}
						Loading {loadPct}%
					{:else}
						Generate
					{/if}
				</span>
			</button>
		{/if}
	</div>
	<p id="prompt-status" class="sr-only" aria-live="polite">{status}</p>
</form>

<style lang="scss">
	.prompt-bar {
		position: relative;
		width: 100%;
		min-width: 0;
	}
	.pill {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		height: 3.25rem;
		padding: 0.3rem 0.3rem 0.3rem 1rem;
		border-radius: 999px;
		background: var(--surface);
		border: 1.5px solid var(--line-strong);
		box-shadow: var(--shadow-sm);
		transition:
			border-color 0.2s var(--ease-out),
			box-shadow 0.2s var(--ease-out);

		&:focus-within {
			border-color: var(--teal);
			box-shadow:
				0 0 0 4px var(--teal-soft),
				var(--shadow-md);
		}
	}
	.spark {
		flex-shrink: 0;
		display: grid;
		place-items: center;
		width: 1.9rem;
		height: 1.9rem;
		border-radius: 999px;
		background: var(--brand);
		color: var(--brand-ink);
	}
	.field {
		flex: 1 1 auto;
		min-width: 0;
		display: flex;
		align-items: center;
		overflow: hidden;
		white-space: nowrap;
		cursor: text;
		font-size: 1.05rem;
		line-height: 1.4;
		color: var(--ink-strong);

		.editor {
			flex: 0 0 auto;
			min-width: 1ch;
			white-space: pre;
			outline: none;

			&:empty::before {
				content: attr(data-placeholder);
				color: var(--ink-faint);
			}
		}
		.blocked & {
			cursor: default;
		}
	}
	.prediction {
		flex: 1 0 auto;
		white-space: pre;
		background: none;
		color: var(--brand-ink);
		font-weight: 700;

		&::before {
			content: '';
		}
		background-image: linear-gradient(var(--brand), var(--brand));
		background-repeat: no-repeat;
		background-size: auto 100%;
		background-position: left;
		padding-right: 0.15em;
		border-radius: 0.3em;
		animation: pop 0.45s var(--ease-out);
		max-width: max-content;
	}
	:global(html.dark) .prediction {
		color: var(--brand-ink);
	}
	.gap {
		white-space: pre;
	}
	.running-dots {
		flex-shrink: 0;
		margin-left: 0.4rem;
	}

	.generate-button {
		position: relative;
		flex-shrink: 0;
		height: 100%;
		min-width: 8.5rem;
		padding: 0 1.6rem;
		border-radius: 999px;
		overflow: hidden;
		background: var(--brand);
		color: var(--brand-ink);
		font-weight: 800;
		font-size: 1rem;
		letter-spacing: 0.01em;
		box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.12);
		transition:
			transform 0.15s var(--ease-out),
			filter 0.15s var(--ease-out);

		&:hover:not(:disabled) {
			filter: brightness(1.04) saturate(1.1);
			transform: translateY(-1px);
		}
		&:active:not(:disabled) {
			transform: translateY(0) scale(0.97);
		}
		&:disabled {
			cursor: not-allowed;
			background: var(--surface-muted);
			color: var(--ink-muted);
			box-shadow: none;
		}
		&.loading:disabled {
			background: linear-gradient(
				to right,
				var(--brand-soft) 0%,
				var(--brand-soft) var(--load),
				var(--surface-muted) var(--load)
			);
			color: var(--ink-body);
			font-weight: 700;
			font-variant-numeric: tabular-nums;
		}
		.btn-text {
			position: relative;
		}
	}

	.limit {
		flex-shrink: 0;
		padding: 0.2rem 0.6rem;
		border-radius: 999px;
		background: var(--accent-red-100);
		color: var(--accent-red-700);
		font-size: 0.75rem;
		font-weight: 700;
	}

	@keyframes pop {
		0% {
			opacity: 0;
			transform: translateY(4px);
		}
		100% {
			opacity: 1;
			transform: none;
		}
	}
</style>
