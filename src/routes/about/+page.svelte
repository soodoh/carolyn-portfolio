<script lang="ts">
	import Background from '$lib/Background.svelte';
	import SvelteMarkdown from 'svelte-markdown';

	export let data;
	const formats = ['avif', 'webp', 'jpg'];
	const srcset = [414, 728, 1440];
</script>

<Background image={data.backgroundImage} />
<div class="container">
	<div class="info">
		<div class="photo-container">
			<picture>
				{#each formats as format}
					<source
						type={`image/${format}`}
						srcset={srcset.map((size) => `${data.profilePicture.url}?w=${size}&fm=${format} ${size}w}`).join(', ')}
						sizes="(max-width: 414px) 100vw, (max-width: 728px) 75vw, 25vw"
					/>
				{/each}
				<img src={`${data.profilePicture.url}?fm=jpg&w=${srcset[0]}`} alt={data.profilePicture.title} />
			</picture>
		</div>
		<span>{data.location}</span>
		<span>{data.email}</span>
	</div>
	<div id="markdown-container">
		<SvelteMarkdown source={data.bio} />
	</div>
</div>

<style>
	.container {
		display: grid;
		grid-template-columns: 25% 1fr;
		grid-gap: 2.5rem;
		margin: 3.5rem 2rem;
	}
	.info {
		display: flex;
		align-items: center;
		flex-direction: column;
		color: var(--light-color);
		font-size: 1rem;
		line-height: 1.5rem;
	}
	.photo-container img {
		width: 100%;
		border: 1.5rem solid var(--light-color);
		box-sizing: border-box;
		padding: 0;
		margin-bottom: 1rem;
	}
	#markdown-container {
		flex-grow: 1;
		color: var(--light-text);
		font-family: var(--header-font);
		font-size: 1.25rem;
		line-height: 2rem;
	}
	:global(#markdown-container a) {
		color: var(--light-text);
	}
	:global(#markdown-container p) {
		margin: 0 0 1rem 0;
	}
</style>
