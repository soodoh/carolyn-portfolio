<script lang="ts">
	export let current: string;
	export let options: string[];
	export let onChange: (albumName: string) => void;
</script>

<div class="container">
	{#each options as name}
		<button class={current === name ? 'active' : ''} on:click={() => onChange(name)}>
			{name}
		</button>
	{/each}
</div>

<style>
	:root {
		--border-height: 5px;
	}
	.container {
		margin-top: calc(-1 * var(--border-height));
		margin-bottom: 1.5rem;
		position: relative;
		z-index: 2;
	}
	.active {
		border-top: var(--border-height) solid var(--light-color);
	}
	button {
		border: none;
		background-color: transparent;
		padding: 1rem 2rem;
		cursor: pointer;
		color: var(--dark-color);
		font-size: .9rem;
		line-height: 1.75rem;
	}
	@media (max-width: 600px) {

	}
</style>
