<script lang="ts">
	import Header from '$lib/Header.svelte';
	import Footer from '$lib/Footer.svelte';
	export let data;
</script>

<svelte:head>
	<meta name="google-site-verification" content="mZWTxlscBqxebm-E7NiMf8dG-G2qbqKKODr0BoCUobQ" />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="true" />
	<link
		href="https://fonts.googleapis.com/css2?family=Karla&family=Old+Standard+TT&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<Header />
<main><slot /></main>
<Footer socialMedia={data.socialMedia} />

<style>
	:root {
		--light-text: #fff;
		--dark-color: #494f5c;
		--light-color: #cec0a8;
		--error-color: #fd9f92;
		--body-font: 'Karla', sans-serif;
		--header-font: 'Old Standard TT', serif;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		font-family: var(--body-font);
	}
	:global(h1, h2, h3, h4, h5) {
		font-family: var(--header-font);
	}
	main {
		flex-grow: 1;
	}
</style>
