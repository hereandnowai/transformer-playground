<script lang="ts">
	import { fly } from 'svelte/transition';
	import { tick } from 'svelte';
	import { blockIdx, attentionHeadIdx } from '~/store';
	import { drawerTab, type DrawerTab } from '~/store/ui';
	import AttentionHeatmap from './AttentionHeatmap.svelte';
	import NextWordRace from './NextWordRace.svelte';
	import Icon from './Icon.svelte';

	const tabs: { id: DrawerTab; label: string; blurb: string }[] = [
		{
			id: 'heatmap',
			label: 'Attention heatmap',
			blurb:
				'Each row is a word looking back at the words before it. Darker squares get more attention; each row adds up to 100%.'
		},
		{
			id: 'race',
			label: 'Next-word race',
			blurb:
				'The words GPT-2 thinks could come next. Move the sliders and watch the chances change live.'
		}
	];

	// Start on the block and head the diagram shows.
	let layer = $state($blockIdx);
	let head = $state($attentionHeadIdx);

	let panel: HTMLElement | undefined = $state();
	let innerWidth = $state(520);

	const current = $derived(tabs.find((t) => t.id === $drawerTab));

	$effect(() => {
		if ($drawerTab)
			tick().then(() =>
				panel?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus()
			);
	});

	const onTabKey = (event: KeyboardEvent) => {
		if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
		event.preventDefault();
		const i = tabs.findIndex((t) => t.id === $drawerTab);
		const next = tabs[(i + (event.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
		drawerTab.set(next.id);
	};
</script>

{#if $drawerTab && current}
	<aside
		id="insights-drawer"
		class="drawer"
		aria-label="Insights"
		bind:this={panel}
		transition:fly={{ x: 40, duration: 260 }}
	>
		<header>
			<div class="tabs" role="tablist" aria-label="Insights" tabindex="-1" onkeydown={onTabKey}>
				{#each tabs as tab}
					<button
						type="button"
						role="tab"
						id="tab-{tab.id}"
						aria-selected={$drawerTab === tab.id}
						aria-controls="tabpanel-{tab.id}"
						tabindex={$drawerTab === tab.id ? 0 : -1}
						onclick={() => drawerTab.set(tab.id)}
					>
						<Icon name={tab.id === 'heatmap' ? 'grid' : 'bars'} size={18} />
						{tab.label}
					</button>
				{/each}
			</div>
			<button
				type="button"
				class="close"
				aria-label="Close insights (Esc)"
				title="Close (Esc)"
				onclick={() => drawerTab.set(null)}
			>
				<Icon name="close" />
			</button>
		</header>

		<div
			class="body"
			role="tabpanel"
			id="tabpanel-{current.id}"
			aria-labelledby="tab-{current.id}"
			bind:clientWidth={innerWidth}
		>
			<h2>{current.label}</h2>
			<p class="blurb">{current.blurb}</p>
			{#if current.id === 'heatmap'}
				<AttentionHeatmap bind:layer bind:head width={innerWidth - 48} />
				<p class="note">
					Many heads pour a lot of attention onto the very first word. Researchers call this an
					<em>attention sink</em>: a safe place to park attention when nothing else matters.
				</p>
			{:else}
				<NextWordRace />
			{/if}
		</div>
	</aside>
{/if}

<style lang="scss">
	.drawer {
		position: fixed;
		top: calc(var(--header-h, 7.5rem) + 0.75rem);
		right: 1rem;
		bottom: 1rem;
		width: min(35rem, calc(100vw - 2rem));
		z-index: $TEXTBOOK_INDEX + 1;
		display: flex;
		flex-direction: column;
		border-radius: var(--radius-lg);
		background: var(--surface);
		border: 1px solid var(--line);
		box-shadow: var(--shadow-lg);
		overflow: hidden;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.75rem 0.75rem 0.75rem 1rem;
		border-bottom: 1px solid var(--line);
		background: var(--surface-subtle);
	}
	.tabs {
		display: flex;
		gap: 0.35rem;

		button {
			display: inline-flex;
			align-items: center;
			gap: 0.45rem;
			padding: 0.5rem 0.9rem;
			border-radius: 999px;
			font-size: 0.88rem;
			font-weight: 700;
			color: var(--ink-secondary);
			transition:
				background-color 0.18s var(--ease-out),
				color 0.18s var(--ease-out);

			&:hover {
				color: var(--ink-strong);
				background: var(--surface-muted);
			}
			&[aria-selected='true'] {
				background: var(--brand);
				color: var(--brand-ink);
			}
		}
	}
	.close {
		display: grid;
		place-items: center;
		width: 2.4rem;
		height: 2.4rem;
		border-radius: 999px;
		color: var(--ink-secondary);
		&:hover {
			background: var(--surface-muted);
			color: var(--ink-strong);
		}
	}
	.body {
		flex: 1 1 auto;
		overflow-y: auto;
		padding: 1.25rem 1.5rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;

		h2 {
			font-size: 1.35rem;
			font-weight: 800;
			letter-spacing: -0.02em;
			color: var(--heading);
		}
		.blurb {
			font-size: 0.92rem;
			line-height: 1.5;
			color: var(--ink-secondary);
			margin-top: -0.4rem;
		}
		.note {
			font-size: 0.82rem;
			line-height: 1.5;
			color: var(--ink-muted);
			padding: 0.75rem 0.9rem;
			border-left: 3px solid var(--brand);
			background: var(--surface-subtle);
			border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
		}
	}
</style>
