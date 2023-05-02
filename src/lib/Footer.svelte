<script>
	import InlineSVG from 'svelte-inline-svg';
	/** @type {import('$lib/types').SocialMedia} */
	export let socialMedia;
	console.log(socialMedia);
</script>

<footer>
	{#each socialMedia as item}
		<InlineSVG src={item.icon.url} class="svg" />
	{/each}
	hi
</footer>

<style>
	footer {
		fill: var(--dark-color);
	}
</style>
