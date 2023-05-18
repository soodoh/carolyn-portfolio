<script lang="ts">
	import type { ProjectType } from '$lib/types';
	import Dropdown from './Dropdown.svelte';

	export let current: string;
	export let options: string[];
	export let onChange: (name: string) => void;
</script>

<div class="container">
	{#each options as name}
		<button
			aria-label={`Choose filter: ${name}`}
			class:active={current === name}
			class="filter"
			on:click={() => onChange(name)}
		>
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
		position: sticky;
		top: var(--header-height);
		margin-bottom: 1.5rem;
		z-index: 2;
		background-color: var(--light-text);
	}
	.dropdown-container {
		display: none;
	}
	.filter {
		color: var(--dark-color);
		font-family: var(--body-font);
		font-size: 1rem;
		line-height: 1.75rem;
		border: none;
		background-color: transparent;
		padding: 1rem 2rem;
		cursor: pointer;
	}
	.active {
		border-top: var(--border-height) solid var(--light-color);
		margin-top: calc(-1 * var(--border-height));
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
