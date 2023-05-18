<script lang="ts">
	import Background from '$lib/components/Background.svelte';
	import Image from '$lib/components/Image.svelte';
	import LayoutContainer from '$lib/components/LayoutContainer.svelte';

	export let data;
</script>

<Background fixed image={data.backgroundImage} />
<LayoutContainer>
	<div class="container">
		<div class="info">
			<Image
				srcset={[414, 728, 1440]}
				image={data.profilePicture}
				sizes="(max-width: 414px) 100vw, (max-width: 728px) 75vw, 25vw"
			/>
			<span>{data.location}</span>
			<span>{data.email}</span>
		</div>
		<div class="markdown-container">
			{@html data.parsedBio}
		</div>
	</div>
</LayoutContainer>

<style>
	.container {
		display: grid;
		grid-template-columns: 25% 1fr;
		grid-gap: 2.5rem;
		margin-top: 3.5rem;
	}
	.info {
		display: flex;
		align-items: center;
		flex-direction: column;
		color: var(--light-color);
		font-size: 1rem;
		line-height: 1.5rem;
	}
	:global(.info img) {
		width: 100%;
		border: 1.5rem solid var(--light-color);
		box-sizing: border-box;
		padding: 0;
		margin-bottom: 1rem;
	}
	.markdown-container {
		flex-grow: 1;
		color: var(--light-text);
		font-family: var(--header-font);
		font-size: 1.25rem;
		line-height: 2rem;
	}
	.markdown-container :global(a) {
		color: var(--light-color);
	}
	.markdown-container :global(p) {
		margin-top: 0;
		margin-bottom: 2rem;
	}
	@media (max-width: 950px) {
		.container {
			grid-template-columns: 1fr 1fr;
		}
	}
	@media (max-width: 600px) {
		.container {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto;
		}
		.info {
			margin-bottom: 2.5rem;
		}
	}
</style>
