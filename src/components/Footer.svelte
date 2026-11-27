<footer class="site-footer" data-click="footer">
	<div class="inner">
		<p class="credit">
			Based on
			<a href="https://github.com/poloclub/transformer-explainer" target="_blank" rel="noopener"
				>Transformer Explainer</a
			>
			by the Polo Club of Data Science, Georgia Tech (MIT licence) ·
			<a href="https://doi.org/10.1145/3772318.3791725" target="_blank" rel="noopener"
				>CHI 2026 paper</a
			>
		</p>
		<p class="ours">
			Transformer Playground © 2026
			<a href="https://hereandnowai.com" target="_blank" rel="noopener">HERE AND NOW AI</a>
			· <em>AI is Good</em> ·
			<a
				href="https://github.com/hereandnowai/transformer-playground"
				target="_blank"
				rel="noopener">Source on GitHub</a
			>
			·
			<a href="https://www.youtube.com/@hereandnow_ai" target="_blank" rel="noopener">YouTube</a>
			· <a href="mailto:info@hereandnowai.com">info@hereandnowai.com</a>
		</p>
	</div>
</footer>

<style lang="scss">
	.site-footer {
		border-top: 1px solid var(--line);
		padding: 1.5rem 1rem 2rem;
		font-size: 0.85rem;
		color: var(--ink-muted);
		text-align: center;

		.inner {
			max-width: 78ch;
			margin: 0 auto;
			display: flex;
			flex-direction: column;
			gap: 0.4rem;
		}
		a {
			color: var(--ink-secondary);
			text-decoration: underline;
			text-underline-offset: 2px;
			&:hover {
				color: var(--accent-purple-600);
			}
		}
	}
	:global(html.dark) .site-footer {
		border-top: 2px solid var(--brand);
		a:hover {
			color: var(--brand);
		}
	}
</style>
