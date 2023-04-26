<script lang="ts">
	import InlineSVG from 'svelte-inline-svg';
	export let socialMedia;
</script>

<footer>
	{#each socialMedia as item}
		<InlineSVG src={item.icon.url} class="svg" />
	{/each}
</footer>

<style>
	footer {
		fill: var(--dark-color);
	}
</style>
