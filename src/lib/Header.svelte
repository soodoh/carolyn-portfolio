<script lang="ts">
	import { page } from '$app/stores';
	const links = [
		{ name: 'About', path: '/about' },
		{ name: 'Projects', path: '/projects' },
		{ name: 'Photography', path: '/photography' },
		{ name: 'Resume', path: '/resume' }
	];
</script>

<header class={$page.url.pathname === '/' ? 'home' : ''}>
	<a href="/" class="brand">
		<svg inline-src="logo" />
		<h1>Carolyn DiLoreto</h1>
	</a>
	<nav>
		{#each links as link}
			<a href={link.path} class={$page.url.pathname === link.path ? 'active' : ''}>
				{`${link.name}.`}
			</a>
		{/each}
	</nav>
</header>

<style>
	header {
		display: flex;
		justify-content: space-between;
		background-color: var(--dark-color);
		padding: 0rem var(--padding);
		align-items: center;
	}
	a,
	a:visited {
		text-decoration: none;
		color: var(--light-text);
	}
	.home {
		background-color: transparent;
	}
	.home .brand {
		visibility: hidden;
	}

	.brand {
		display: flex;
		align-items: flex-end;
		margin: 0.5rem 0;
	}
	svg {
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

	nav a {
		margin-left: 2rem;
	}
	nav a.active {
		color: var(--light-color);
	}
	@media (max-width: 600px) {
		header {
			flex-direction: column;
			align-items: flex-start;
		}
		nav {
			margin-top: 1rem;
		}
	}
</style>
