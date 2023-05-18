<script lang="ts">
	import Projects from '$lib/components/Projects.svelte';

	export let data;
</script>

<svelte:head>
	<title>CD Projects</title>
	<meta
		name="description"
		content="View Carolyn DiLoreto's past and current projects. From film editing to UX Engineering there are many skills showcased in this section of the portfolio."
	/>
</svelte:head>
<Projects projects={data.projects} />

<style>
</style>
