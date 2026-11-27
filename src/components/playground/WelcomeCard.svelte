<script lang="ts">
	import { fly } from 'svelte/transition';
	import { storyOpen, drawerTab, landingInView } from '~/store/ui';
	import { isTextbookOpen } from '~/store';
	import { openStory } from '~/utils/playground/panels';
	import Icon from './Icon.svelte';

	const KEY = 'tp-welcome-dismissed';

	let dismissed = $state(true);
	$effect(() => {
		try {
			dismissed = localStorage.getItem(KEY) === '1';
		} catch {
			dismissed = false;
		}
	});

	const dismiss = () => {
		dismissed = true;
		try {
			localStorage.setItem(KEY, '1');
		} catch {
			// Private browsing: the card just comes back next time.
		}
	};

	const show = $derived(
		!dismissed && $landingInView && !$storyOpen && !$drawerTab && !$isTextbookOpen
	);
</script>

{#if show}
	<aside class="welcome" aria-labelledby="welcome-title" transition:fly={{ y: 20, duration: 280 }}>
		<button type="button" class="x" aria-label="Dismiss" onclick={dismiss}
			><Icon name="close" size={16} /></button
		>
		<p class="eyebrow">New here?</p>
		<h2 id="welcome-title">How does an AI pick its next word?</h2>
		<p>Follow the 9-step story from tokens to the next word, right on the live GPT-2 diagram.</p>
		<div class="actions">
			<button
				type="button"
				class="start"
				onclick={() => {
					dismiss();
					openStory();
				}}
			>
				<Icon name="story" size={18} /> Start the story
			</button>
			<span class="or">or press <kbd>S</kbd></span>
		</div>
	</aside>
{/if}

<style lang="scss">
	.welcome {
		position: fixed;
		right: 1.5rem;
		bottom: 1.5rem;
		z-index: $TEXTBOOK_INDEX + 1;
		width: 22rem;
		padding: 1.1rem 1.2rem 1.1rem;
		border-radius: var(--radius-lg);
		background: var(--surface);
		border: 1px solid var(--line);
		box-shadow: var(--shadow-lg);

		&::before {
			content: '';
			position: absolute;
			inset: 0 0 auto 0;
			height: 5px;
			border-radius: var(--radius-lg) var(--radius-lg) 0 0;
			background: var(--brand);
		}
		h2 {
			font-size: 1.1rem;
			font-weight: 800;
			line-height: 1.25;
			color: var(--heading);
			margin: 0.2rem 0 0.4rem;
			padding-right: 1.5rem;
		}
		p {
			font-size: 0.88rem;
			line-height: 1.5;
			color: var(--ink-body);
		}
		.eyebrow {
			font-size: 0.7rem;
			font-weight: 800;
			letter-spacing: 0.1em;
			text-transform: uppercase;
			color: var(--ink-muted);
		}
	}
	.x {
		position: absolute;
		top: 0.7rem;
		right: 0.7rem;
		display: grid;
		place-items: center;
		width: 1.9rem;
		height: 1.9rem;
		border-radius: 999px;
		color: var(--ink-secondary);
		&:hover {
			background: var(--surface-muted);
		}
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-top: 0.9rem;
	}
	.start {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		height: 2.5rem;
		padding: 0 1.1rem;
		border-radius: 999px;
		background: var(--brand);
		color: var(--brand-ink);
		font-weight: 800;
		font-size: 0.92rem;
		box-shadow: inset 0 -2px 0 rgba(0, 0, 0, 0.12);
		transition: transform 0.15s var(--ease-out);
		&:hover {
			transform: translateY(-1px);
		}
	}
	.or {
		font-size: 0.8rem;
		color: var(--ink-muted);
		kbd {
			font-family: inherit;
			font-weight: 700;
			padding: 0.05rem 0.4rem;
			border-radius: 0.3rem;
			border: 1px solid var(--line-strong);
			background: var(--surface-subtle);
			color: var(--ink-strong);
		}
	}
</style>
