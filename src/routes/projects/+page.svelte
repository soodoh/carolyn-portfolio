<script lang="ts">
	import Projects from '$lib/components/Projects.svelte';

	export let data;
</script>

<svelte:head>
	<title>CD Projects</title>
</svelte:head>
<Projects projects={data.projects} />

<style>
</style>
