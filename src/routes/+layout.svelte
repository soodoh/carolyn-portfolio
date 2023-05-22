<script lang="ts">
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import '@fontsource/karla';
	import '@fontsource/old-standard-tt';
	import '$lib/globals.css';

	export let data;
</script>

<svelte:head>
	<meta name="google-site-verification" content="mZWTxlscBqxebm-E7NiMf8dG-G2qbqKKODr0BoCUobQ" />
</svelte:head>

<Header />
<main><slot /></main>
<Footer socialMedia={data.socialMedia} />

<style lang="postcss">
	main {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
</style>
