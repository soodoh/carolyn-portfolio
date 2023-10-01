<script lang="ts">
	import { page } from '$app/stores';
	import MobileNav from '$lib/components/MobileNav.svelte';
	import { transparentHeader } from '$lib/stores';

	const links = [
		{ name: 'About', path: '/about' },
		{ name: 'Projects', path: '/projects' },
		{ name: 'Photography', path: '/photography' },
		{ name: 'Resume', path: '/resume' }
	];
	let mobileNavOpen = false;
</script>

<header
	class:fixed={$page.url.pathname === '/'}
	class:transparent={$page.url.pathname === '/' && $transparentHeader}
	class:mobile-open={mobileNavOpen}
>
	<div class="brand">
		<a aria-label="Home" href="/">
			<svg inline-src="logo" />
			<h1>Carolyn DiLoreto</h1>
		</a>
	</div>
	<nav>
		{#each links as link}
			<a aria-label={link.name} href={link.path} class:active={$page.url.pathname === link.path}>
				{`${link.name}.`}
			</a>
		{/each}
	</nav>
	<div class="mobile-nav-container">
		<MobileNav {links} bind:isOpen={mobileNavOpen} />
	</div>
</header>

<style lang="postcss">
	header {
		position: sticky;
		top: 0;
		display: flex;
		background-color: var(--dark-color);
		padding: 0rem var(--padding);
		align-items: center;
		height: var(--header-height);
		transition: all 250ms ease-in-out;
		z-index: 2;
		&.mobile-open {
			z-index: 3;
		}
	}
	.fixed {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
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
		flex-grow: 1;
		& a {
			display: inline-flex;
			align-items: flex-end;
			margin: 0.5rem 0;
		}
		& svg {
			height: 3rem;
		}

		@media (--sm-viewport) {
			& {
				display: flex;
				justify-content: center;
			}
			& svg {
				height: 2rem;
			}
			& h1 {
				font-size: 1.5rem;
				line-height: 1.5rem;
				margin-left: 0;
			}
		}
	}
	h1 {
		font-size: 1.5rem;
		margin: 0;
		font-size: 2rem;
		font-weight: 100;
		margin-left: 2rem;
		line-height: 1.75rem;
	}

	nav {
		& a {
			margin-left: 2rem;
			font-size: 1rem;
			&:first-child {
				margin-left: 0;
			}
			&.active {
				color: var(--light-color);
			}
		}
		@media (--md-viewport) {
			& {
				display: none;
			}
		}
	}

	.mobile-nav-container {
		display: none;
		@media (--md-viewport) {
			display: block;
		}
	}
</style>
