<script lang="ts">
	import Markdown from 'svelte-markdown';
	import Image from '$lib/components/Image.svelte';

	export let data;
</script>

<div class="container">
	<section class="header">
		<div class="info">
			<h1>{data.project.title}</h1>
			<h2>{data.project.role}</h2>
		</div>
		<div class="image">
			<Image
				image={data.project.coverImage}
				sizes="(max-width: 950px) 100vw, 450px"
				srcset={[414, 728, 1440]}
			/>
		</div>
	</section>
	<div id="markdown-container">
		<Markdown source={data.project.description} />
	</div>
</div>

<style>
	.container {
	}
	.header {
		display: flex;
	}
	.info h1 {
		font-size: 3rem;
	}
	.info h2 {
		font-family: var(--body-font);
	}
</style>
