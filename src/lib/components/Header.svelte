<script lang="ts">
	import { page } from '$app/stores';
	import { transparentHeader } from '$lib/stores';

	const links = [
		{ name: 'About', path: '/about' },
		{ name: 'Projects', path: '/projects' },
		{ name: 'Photography', path: '/photography' },
		{ name: 'Resume', path: '/resume' }
	];
	let mobileNavOpen = false;
</script>

<header class:transparent={$page.url.pathname === '/' && $transparentHeader}>
	<a aria-label="Home" href="/" class="brand">
		<svg inline-src="logo" />
		<h1>Carolyn DiLoreto</h1>
	</a>
	<nav class:mobile-open={mobileNavOpen}>
		{#each links as link}
			<a
				aria-label={link.name}
				href={link.path}
				class:active={$page.url.pathname === link.path}
				on:click={() => (mobileNavOpen = false)}
			>
				{`${link.name}.`}
			</a>
		{/each}
	</nav>
	<button
		aria-label={mobileNavOpen ? 'Close navigation menu' : 'Open navigation menu'}
		class="mobile-nav-button"
		on:click={() => (mobileNavOpen = !mobileNavOpen)}
	>
		<div class:close-icon={mobileNavOpen} class="hamburger-icon" />
	</button>
</header>

<style>
	:root {
		--mobile-nav-size: 2.5rem;
	}
	header {
		position: sticky;
		top: 0;
		display: flex;
		background-color: var(--dark-color);
		padding: 0rem var(--padding);
		align-items: center;
		height: var(--header-height);
		transition: all 250ms ease-in-out;
	}
	a,
	a:visited {
		text-decoration: none;
		color: var(--light-text);
	}
	.transparent {
		transition: all 250ms ease-in-out;
		background-color: transparent;
	}
	.transparent .brand {
		transition: all 250ms ease-in-out;
		visibility: hidden;
	}

	.brand {
		display: flex;
		align-items: flex-end;
		margin: 0.5rem 0;
		flex-grow: 1;
	}
	.brand svg {
		height: 3rem;
	}
	h1 {
		font-size: 1.5rem;
		margin: 0;
		font-size: 2rem;
		font-weight: 100;
		margin-left: 2rem;
		line-height: 1.75rem;
	}

	.mobile-nav-button {
		display: none;
	}
	nav a {
		margin-left: 2rem;
	}
	nav a.active {
		color: var(--light-color);
	}
	@media (max-width: 414px) {
		:root {
			--mobile-nav-size: 2rem;
		}
		.brand {
			display: flex;
			justify-content: center;
		}
		.brand svg {
			height: 2rem;
		}
		.brand h1 {
			font-size: 1.5rem;
			line-height: 1.5rem;
			margin-left: 0;
		}
	}
	@media (max-width: 820px) {
		nav {
			display: none;
		}
		.mobile-nav-button {
			display: block;
			width: var(--mobile-nav-size);
			height: var(--mobile-nav-size);
			border: 1px solid var(--light-color);
			border-radius: 0.2rem;
			background-color: transparent;
			cursor: pointer;
			z-index: 3;
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
			transition: all 250ms ease-in-out;
		}
		header:has(.mobile-open) {
			z-index: 3;
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
		nav a {
			display: flex;
			justify-content: center;
			width: 100%;
			padding: 3rem;
		}
	}
</style>
