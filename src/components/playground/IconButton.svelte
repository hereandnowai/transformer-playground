<script lang="ts">
	import Icon, { type IconName } from './Icon.svelte';

	interface Props {
		icon: IconName;
		/** Accessible name; also the tooltip. */
		label: string;
		/** Show the label (or the shorter `text`) as visible text next to the icon. */
		showLabel?: boolean;
		/** Shorter visible text; `label` stays the accessible name. */
		text?: string;
		/** A keyboard shortcut, shown in the tooltip. */
		shortcut?: string;
		/** For toggle buttons: whether the tool is on. */
		pressed?: boolean;
		href?: string;
		onclick?: (event: MouseEvent) => void;
		class?: string;
		controls?: string;
	}

	let {
		icon,
		label,
		showLabel = false,
		text,
		shortcut,
		pressed,
		href,
		onclick,
		class: className = '',
		controls
	}: Props = $props();

	const title = $derived(shortcut ? `${label} (${shortcut})` : label);
</script>

{#if href}
	<a
		class="icon-btn {className}"
		class:with-label={showLabel}
		{href}
		target="_blank"
		rel="noopener"
		{title}
		aria-label={label}
	>
		<Icon name={icon} />
		{#if showLabel}<span class="text">{text ?? label}</span>{/if}
	</a>
{:else}
	<button
		type="button"
		class="icon-btn {className}"
		class:with-label={showLabel}
		class:on={pressed}
		{title}
		aria-label={label}
		aria-pressed={pressed}
		aria-controls={controls}
		aria-keyshortcuts={shortcut}
		{onclick}
	>
		<Icon name={icon} />
		{#if showLabel}<span class="text">{text ?? label}</span>{/if}
	</button>
{/if}

<style lang="scss">
	.icon-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		height: 2.5rem;
		min-width: 2.5rem;
		padding: 0 0.55rem;
		border-radius: 999px;
		border: 1px solid transparent;
		color: var(--ink-secondary);
		font-size: 0.875rem;
		font-weight: 600;
		white-space: nowrap;
		transition:
			background-color 0.18s var(--ease-out),
			color 0.18s var(--ease-out),
			border-color 0.18s var(--ease-out),
			transform 0.18s var(--ease-out);

		&.with-label {
			padding: 0 0.95rem 0 0.75rem;
			border-color: var(--line);
			background: var(--surface);
			color: var(--ink-body);
		}

		&:hover {
			background: var(--surface-muted);
			color: var(--ink-strong);
		}
		&:active {
			transform: scale(0.96);
		}

		&.on {
			background: var(--brand);
			border-color: var(--brand);
			color: var(--brand-ink);
		}
	}
</style>
