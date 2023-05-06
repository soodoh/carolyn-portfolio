<script lang="ts">
	import Background from '$lib/Background.svelte';

	export let data;
</script>

<Background image={data.backgroundImage} />
