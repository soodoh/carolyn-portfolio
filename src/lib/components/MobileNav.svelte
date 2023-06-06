<script lang="ts">
	import { page } from '$app/stores';

	export let links: { name: string; path: string }[];
	export let isOpen = false;
</script>

<button
	aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
	class="mobile-nav-button"
	on:click={() => (isOpen = !isOpen)}
>
	<div class:close-icon={isOpen} class="hamburger-icon" />
</button>
<nav class:mobile-open={isOpen}>
	{#each links as link}
		<a
			aria-label={link.name}
			href={link.path}
			class:active={$page.url.pathname === link.path}
			on:click={() => (isOpen = false)}
		>
			{`${link.name}.`}
		</a>
	{/each}
</nav>

<style lang="postcss">
	:root {
		--mobile-nav-size: 2.5rem;
		@media (--sm-viewport) {
			--mobile-nav-size: 2rem;
		}
	}

	.mobile-nav-button {
		position: relative;
		z-index: 3;
	}

	a,
	a:visited {
		text-decoration: none;
		color: var(--light-text);
	}

	nav {
		display: flex;
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		left: 0;
		visibility: hidden;
		opacity: 0;
		transform: scale(0);
		transition: transform 250ms ease-in-out;

		& a {
			display: flex;
			justify-content: center;
			width: 100%;
			padding: 3rem;
			font-size: 1.5rem;
			&.active {
				color: var(--light-color);
			}
		}
	}

	.mobile-nav-button {
		display: none;
		@media (--lg-viewport) {
			& {
				padding: 0.3rem;
				display: block;
				width: var(--mobile-nav-size);
				height: var(--mobile-nav-size);
				border: 1px solid var(--light-color);
				border-radius: 0.2rem;
				background-color: transparent;
				cursor: pointer;
				z-index: 3;
			}
		}
	}

	.mobile-open {
		opacity: 1;
		transform: scale(1);
		visibility: visible;
		transition: all 250ms ease-in-out;
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100vh;
		background-color: var(--dark-color);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.hamburger-icon {
		position: relative;
		flex: none;
		width: 100%;
		height: 2px;
		background-color: var(--light-text);
		transition: all 250ms ease-in-out;
	}
	.hamburger-icon:before,
	.hamburger-icon:after {
		content: '';
		position: absolute;
		top: calc(var(--mobile-nav-size) / -6);
		left: 0;
		width: 100%;
		height: 2px;
		background-color: var(--light-text);
		transition: var(--menu-transition);
	}
	.hamburger-icon:after {
		top: calc(var(--mobile-nav-size) / 6);
	}
	.close-icon {
		transform: rotate(135deg);
	}
	.close-icon:before,
	.close-icon:after {
		top: 0;
		transform: rotate(90deg);
	}
	.close-icon:after {
		opacity: 0;
	}
</style>
