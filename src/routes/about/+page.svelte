<script lang="ts">
	import Background from '$lib/components/Background.svelte';
	import LayoutContainer from '$lib/components/LayoutContainer.svelte';
	import LayoutImage from '$lib/components/LayoutImage.svelte';

	export let data;
</script>

<svelte:head>
	<title>About Carolyn</title>
	<meta
		name="description"
		content="Carolyn DiLoreto is a multi-media visual artist, dancer, and USC alumnus, with a Media Arts + Practice major and a double minor in Dance and Computer Programming."
	/>
</svelte:head>
<Background fixed image={data.backgroundImage} />
<LayoutContainer>
	<div class="container">
		<div class="info">
			<LayoutImage
				srcset={[100, 200, 300, 500]}
				image={data.profilePicture}
				sizes="(max-width: 600px) 100vw, (max-width: 950px) 50vw, (max-width: 1500px) 25vw, 360px"
			/>
			<section class="info-details">
				<span>{data.location}</span>
				<span>{data.email}</span>
			</section>
		</div>
		<div class="markdown-container">
			{@html data.parsedBio}
		</div>
	</div>
</LayoutContainer>

<style lang="postcss">
	.container {
		display: grid;
		grid-template-columns: 25% 1fr;
		grid-gap: 2.5rem;
		margin-top: 3.5rem;
		@media (--lg-viewport) {
			& {
				grid-template-columns: 1fr 1fr;
			}
		}
		@media (--md-viewport) {
			& {
				grid-template-columns: 1fr;
				grid-template-rows: auto auto;
			}
		}
	}
	.info {
		color: var(--light-color);
		font-size: 1rem;
		line-height: 1.5rem;
		@media (--md-viewport) {
			& {
				margin-bottom: 2.5rem;
			}
		}
	}
	.info-details {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
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
</style>
