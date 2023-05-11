<script lang="ts">
	import Dropdown from '$lib/Dropdown.svelte';

	export let current: string;
	export let options: string[];
	export let onChange: (albumName: string) => void;
</script>

<div class="container">
	{#each options as name}
		<button class:active={current === name} class="filter" on:click={() => onChange(name)}>
			{name}
		</button>
	{/each}
</div>
<div class="dropdown-container">
	<Dropdown {current} {options} {onChange} />
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
		color: var(--dark-color);
	}
	.dropdown-container {
		display: none;
	}
	.filter {
		font-size: 1rem;
		line-height: 1.75rem;
		border: none;
		background-color: transparent;
		padding: 1rem 2rem;
		cursor: pointer;
	}
	.active {
		border-top: var(--border-height) solid var(--light-color);
	}
	@media (max-width: 600px) {
		.container {
			display: none;
		}
		.dropdown-container {
			display: block;
		}
	}
</style>
