<script lang="ts">
	import Projects from '$lib/components/Projects.svelte';

	export let data: { projects: Project[] };
</script>

<Projects projects={data.projects} />

<style>
</style>
