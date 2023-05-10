<script lang="ts">
	export let current: string;
	export let options: string[];
	export let onChange: (albumName: string) => void;
	let dropdownOpen = false;
	const close = (event: MouseEvent) => {
		if (event.target instanceof HTMLElement && !event.target.closest('.dropdown')) {
			dropdownOpen = false;
		}
	};
</script>

<svelte:document on:click={close} />
<div class="container">
	{#each options as name}
		<button class={`filter ${current === name ? 'active' : ''}`} on:click={() => onChange(name)}>
			{name}
		</button>
	{/each}
</div>
<div class="dropdown">
	<button
		class="menu-button"
		aria-haspopup="true"
		aria-expanded={dropdownOpen}
		on:click={() => (dropdownOpen = !dropdownOpen)}
	>
		{current}
		<svg inline-src="dropdown" />
	</button>
	<div class="dropdown-menu" role="menu" aria-hidden={!dropdownOpen}>
		{#each options as option}
			<button
				on:click={() => {
					onChange(option);
					dropdownOpen = false;
				}}
			>
				{option}
			</button>
		{/each}
	</div>
</div>

<style>
	:root {
		--border-height: 5px;
	}
	.container {
		margin-top: calc(-1 * var(--border-height));
		margin-bottom: 1.5rem;
		position: relative;
		z-index: 1;
		color: var(--dark-color);
		font-size: 0.9rem;
		line-height: 1.75rem;
	}
	.dropdown {
		display: none;
	}
	.filter {
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
		.dropdown {
			display: block;
			position: relative;
			margin: 0.5rem 0 1.5rem 0;
		}
		.dropdown button {
			cursor: pointer;
			border: none;
			background-color: transparent;
		}
		.menu-button {
			display: flex;
		}
		.menu-button svg {
			fill: var(--dark-color);
			margin-left: 0.5rem;
			width: 1rem;
			height: 1rem;
		}
		.dropdown-menu {
			display: grid;
			z-index: 1;
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			background-color: var(--light-text);
			color: var(--dark-color);
			overflow: hidden;
		}
		.dropdown-menu button {
			padding: 1rem 0;
			border-bottom: 1px solid var(--dark-transparent-color);
		}
		.dropdown-menu[aria-hidden='true'] {
			display: none;
		}
	}
</style>
