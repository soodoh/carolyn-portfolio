<div class="container">
	<slot />
</div>

<style>
	.container {
		width: calc(100% - (2 * var(--padding)));
		max-width: var(--max-container-width);
	}
</style>
