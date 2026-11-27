<script lang="ts">
	import '~/styles/app.css';
	import '~/styles/theme.css';
	import '~/styles/global.scss';
	import type { Snippet } from 'svelte';
	import { onMount } from 'svelte';
	import Topbar from '~/components/Topbar.svelte';
	import { isLoaded, rootRem } from '~/store';
	import { initTheme, predictedColor } from '~/store/theme';
	import { isCompact, landingInView } from '~/store/ui';
	import Article from '~/components/article/Article.svelte';
	import Footer from '~/components/Footer.svelte';
	import Toast from '~/components/playground/Toast.svelte';
	import ShortcutsDialog from '~/components/playground/ShortcutsDialog.svelte';
	import { handleShortcut } from '~/utils/playground/shortcuts';

	let { children }: { children: Snippet } = $props();

	const minScreenWidth = 1300;
	const minColumWidth = Math.floor(minScreenWidth / 24) - rootRem * 2;

	let topBarHeight = $state(0);
	let scrollLeft = $state(0);
	let topBarActive = $state(true);
	let target: HTMLElement | undefined = $state();

	onMount(() => {
		initTheme();
		isLoaded.set(true);

		// The prompt fades out once the visitor scrolls down to the article.
		const observer = new IntersectionObserver(
			(entries) =>
				entries.forEach((entry) => {
					topBarActive = entry.isIntersecting;
					landingInView.set(entry.isIntersecting);
				}),
			{ threshold: 0.2 }
		);
		if (target) observer.observe(target);

		// The diagram is wider than small windows; keep the fixed header aligned with it.
		const onScroll = () => (scrollLeft = window.scrollX || document.documentElement.scrollLeft);
		window.addEventListener('scroll', onScroll, { passive: true });

		return () => {
			observer.disconnect();
			window.removeEventListener('scroll', onScroll);
		};
	});
</script>

<svelte:window onkeydown={handleShortcut} />

<a class="skip-link" href="#main">Skip to the playground</a>

<div
	id="app"
	class:compact={$isCompact}
	style={`--min-screen-width:${minScreenWidth}px;--min-column-width:${minColumWidth}px;--predicted-color:${$predictedColor};--header-h:${topBarHeight}px;`}
>
	<div id="landing">
		{#if !$isCompact}
			<header bind:offsetHeight={topBarHeight} style="transform: translateX({-1 * scrollLeft}px);">
				<Topbar isActive={topBarActive} />
			</header>
		{/if}
		<main id="main" style={$isCompact ? '' : `padding-top:${topBarHeight}px`} bind:this={target}>
			{#if $isLoaded}
				{@render children()}
			{:else}
				<div class="boot" role="status">
					<span class="dot"></span><span class="dot"></span><span class="dot"></span>
					<span class="sr-only">Loading the playground</span>
				</div>
			{/if}
		</main>
	</div>
	<div class="article h-auto w-full">
		<Article></Article>
	</div>
	<Footer />
</div>

<Toast />
<ShortcutsDialog />

<style lang="scss">
	.skip-link {
		position: fixed;
		left: 1rem;
		top: -4rem;
		z-index: $TEXTBOOK_INDEX + 20;
		padding: 0.6rem 1rem;
		border-radius: 999px;
		background: var(--brand);
		color: var(--brand-ink);
		font-weight: 800;
		transition: top 0.2s;

		&:focus {
			top: 1rem;
		}
	}

	#app {
		height: 100vh;
		min-width: 900px;
	}

	#landing {
		height: 100%;
		width: 100%;
		min-width: var(--min-screen-width);
	}

	header {
		min-width: var(--min-screen-width);
		width: 100%;
		position: fixed;
		z-index: $TOP_BAR_INDEX;
	}
	main {
		position: relative;
		height: 95%;
		width: 100%;
		display: flex;
		justify-content: start;
		overflow: hidden;
	}
	.article {
		padding-top: 2rem;
	}

	// Phones and narrow windows: a normal scrolling page, no minimum width.
	#app.compact {
		height: auto;
		min-width: 0;

		#landing {
			height: auto;
			min-width: 0;
		}
		main {
			height: auto;
			display: block;
			overflow: visible;
		}
		.article {
			padding: 2rem 1rem 0;
		}
	}

	.boot {
		display: flex;
		gap: 0.4rem;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;

		.dot {
			width: 0.6rem;
			height: 0.6rem;
			border-radius: 999px;
			background: var(--brand);
			animation: bounce 1s infinite ease-in-out;
			&:nth-child(2) {
				animation-delay: 0.15s;
			}
			&:nth-child(3) {
				animation-delay: 0.3s;
			}
		}
	}
	@keyframes bounce {
		0%,
		80%,
		100% {
			transform: scale(0.6);
			opacity: 0.5;
		}
		40% {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
