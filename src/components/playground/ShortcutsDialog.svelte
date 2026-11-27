<script lang="ts">
	import { shortcutsOpen } from '~/store/ui';
	import { SHORTCUTS } from '~/utils/playground/shortcuts';
	import Icon from './Icon.svelte';

	let dialog: HTMLDialogElement | undefined = $state();

	// A native modal dialog: it traps focus, closes on Esc and gives focus back afterwards.
	$effect(() => {
		if (!dialog) return;
		if ($shortcutsOpen && !dialog.open) dialog.showModal();
		if (!$shortcutsOpen && dialog.open) dialog.close();
	});
</script>

<dialog
	bind:this={dialog}
	class="shortcuts"
	aria-labelledby="shortcuts-title"
	onclose={() => shortcutsOpen.set(false)}
	onclick={(e) => {
		// A click on the backdrop (the dialog element itself) closes it.
		if (e.target === dialog) shortcutsOpen.set(false);
	}}
>
	<div class="inner">
		<header>
			<h2 id="shortcuts-title"><Icon name="keyboard" /> Keyboard shortcuts</h2>
			<button
				type="button"
				class="close"
				aria-label="Close"
				onclick={() => shortcutsOpen.set(false)}
			>
				<Icon name="close" />
			</button>
		</header>
		<div class="groups">
			{#each SHORTCUTS as group}
				<section>
					<h3>{group.group}</h3>
					<dl>
						{#each group.items as item}
							<div class="item">
								<dt>
									{#each item.keys as key}
										{#if key === '…'}<span class="dots">to</span>{:else}<kbd>{key}</kbd>{/if}
									{/each}
								</dt>
								<dd>{item.label}</dd>
							</div>
						{/each}
					</dl>
				</section>
			{/each}
		</div>
		<p class="foot">Shortcuts pause while you type in the prompt box.</p>
	</div>
</dialog>

<style lang="scss">
	.shortcuts {
		width: min(40rem, calc(100vw - 2rem));
		padding: 0;
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		background: var(--surface);
		color: var(--ink-body);
		box-shadow: var(--shadow-lg);

		&::backdrop {
			background: rgba(11, 31, 31, 0.35);
			backdrop-filter: blur(3px);
		}
		&[open] {
			animation: dialog-in 0.25s var(--ease-out);
		}
	}
	.inner {
		padding: 1.25rem 1.5rem 1.25rem;
	}
	header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 1rem;

		h2 {
			display: inline-flex;
			align-items: center;
			gap: 0.6rem;
			font-size: 1.25rem;
			font-weight: 800;
			color: var(--heading);
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
		}
	}
	.groups {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
		gap: 1.25rem 2rem;
	}
	h3 {
		font-size: 0.72rem;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink-muted);
		margin-bottom: 0.5rem;
	}
	.item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.35rem 0;
		border-bottom: 1px solid var(--line-subtle);
	}
	dt {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		min-width: 5.5rem;
	}
	dd {
		font-size: 0.88rem;
		color: var(--ink-body);
	}
	kbd {
		min-width: 1.75rem;
		height: 1.75rem;
		padding: 0 0.45rem;
		display: inline-grid;
		place-items: center;
		border-radius: 0.4rem;
		border: 1px solid var(--line-strong);
		border-bottom-width: 2px;
		background: var(--surface-subtle);
		font-family: inherit;
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--ink-strong);
	}
	.dots {
		font-size: 0.75rem;
		color: var(--ink-muted);
	}
	.foot {
		margin-top: 1rem;
		font-size: 0.8rem;
		color: var(--ink-muted);
	}
	@keyframes dialog-in {
		from {
			opacity: 0;
			transform: translateY(8px) scale(0.98);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}
</style>
