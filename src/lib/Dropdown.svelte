<script lang="ts">
	export let current: string;
	export let options: string[];
	export let onChange: (option: string) => void;

	let dropdownOpen = false;
	const close = (event: MouseEvent) => {
		if (event.target instanceof HTMLElement && !event.target.closest('.dropdown')) {
			dropdownOpen = false;
		}
	};
</script>

<svelte:document on:click={close} />
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
	.dropdown {
		display: inline-block;
		position: relative;
		width: auto;
		margin: 0.5rem 0 1.5rem 0;
	}
	.dropdown button {
		cursor: pointer;
		border: none;
		background-color: transparent;
		font-size: 1.2rem;
		line-height: 1.75rem;
	}
	.menu-button {
		display: flex;
		align-items: center;
	}
	.menu-button svg {
		fill: var(--dark-color);
		margin-left: 0.5rem;
		width: 1rem;
		height: 1rem;
	}
	.dropdown-menu {
		scale: 1;
		transition: all 0.2s ease-in-out;
		display: grid;
		z-index: 1;
		position: absolute;
		top: 0;
		left: 0;
		background-color: var(--light-text);
		color: var(--dark-color);
		overflow: hidden;
		box-shadow: 0 0 0.5rem var(--dark-transparent-color);
	}
	.dropdown-menu button {
		padding: 1rem 2rem;
	}
	.dropdown-menu button:not(:last-child) {
		border-bottom: 1px solid var(--dark-transparent-color);
	}
	.dropdown-menu[aria-hidden='true'] {
		scale: 0;
		transition: scale 0.2s ease-in-out;
	}
</style>
