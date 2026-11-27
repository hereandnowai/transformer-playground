<script lang="ts">
	import { fly } from 'svelte/transition';
	import { toastMessage } from '~/store/ui';
	import Icon from './Icon.svelte';
</script>

<div class="toast-region" role="status" aria-live="polite">
	{#if $toastMessage}
		<div class="toast" transition:fly={{ y: 16, duration: 220 }}>
			<span class="tick"><Icon name="check" size={16} /></span>
			{$toastMessage}
		</div>
	{/if}
</div>

<style lang="scss">
	.toast-region {
		position: fixed;
		left: 50%;
		bottom: 1.5rem;
		transform: translateX(-50%);
		z-index: $TEXTBOOK_INDEX + 10;
		pointer-events: none;
	}
	.toast {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.65rem 1.1rem 0.65rem 0.7rem;
		border-radius: 999px;
		background: var(--ink-strong);
		color: var(--page);
		font-size: 0.9rem;
		font-weight: 600;
		box-shadow: var(--shadow-lg);
		white-space: nowrap;
	}
	.tick {
		display: grid;
		place-items: center;
		width: 1.6rem;
		height: 1.6rem;
		border-radius: 999px;
		background: var(--brand);
		color: var(--brand-ink);
	}
</style>
