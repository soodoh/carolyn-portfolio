<script lang="ts">
	import Dropdown from './Dropdown.svelte';

	export let current: string;
	export let options: string[];
	export let onChange: (name: string) => void;
</script>

<div class="container">
	<div class="filter-buttons">
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
	<div class="filter-dropdown">
		<Dropdown {current} {options} {onChange} />
	</div>
</div>

<style lang="postcss">
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
	.filter-dropdown {
		display: none;
		@media (--md-viewport) {
			& {
				display: block;
			}
		}
	}
	.filter-buttons {
		@media (--md-viewport) {
			& {
				display: none;
			}
		}
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
</style>
