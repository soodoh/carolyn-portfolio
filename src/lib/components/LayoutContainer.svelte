<section class="container">
	<slot />
</section>

<style lang="postcss">
	.container {
		width: calc(100% - (2 * var(--padding)));
		max-width: var(--max-container-width);
		flex-grow: 1;
	}
</style>
