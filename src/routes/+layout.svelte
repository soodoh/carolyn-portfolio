<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import '@fontsource/karla';
	import '@fontsource/old-standard-tt';

	export let data;
</script>

<svelte:head>
	<meta name="google-site-verification" content="mZWTxlscBqxebm-E7NiMf8dG-G2qbqKKODr0BoCUobQ" />
</svelte:head>

<Header />
<main><slot /></main>
<Footer socialMedia={data.socialMedia} />

<style lang="postcss">
	:global(:root) {
		--light-text: #fff;
		--dark-color: #494f5c;
		--dark-color-rgb: 73, 79, 92;
		--light-color: #cec0a8;
		--error-color: #fd9f92;
		--body-font: 'Karla', sans-serif;
		--header-font: 'Old Standard TT', serif;
		--padding: 1.5rem;
		--header-height: 4rem;
		--max-container-width: 1440px;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		font-family: var(--body-font);
		color: var(--dark-color);
	}
	:global(h1, h2, h3, h4, h5) {
		font-family: var(--header-font);
	}
	main {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
