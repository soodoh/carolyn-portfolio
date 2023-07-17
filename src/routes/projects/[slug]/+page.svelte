<script lang="ts">
	import LayoutImage from '$lib/components/LayoutImage.svelte';

	export let data;
	let showError = false;
	let authenticated = false;
	let passwordInput: string;

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (passwordInput !== data.project.password) {
			showError = true;
		} else {
			authenticated = true;
		}
	}
</script>

<svelte:head>
	<title>CD Projects - {data.project.title}</title>
	<meta
		name="description"
		content={`Carolyn DiLoreto's project, ${data.project.title} - ${data.project.summary}`}
	/>
	<meta name="robots" content={data.project.password ? 'noindex, nofollow' : 'index, follow'} />
</svelte:head>
{#if data.project.password && !authenticated}
	<div class="password">
		<a aria-label="Go back" href="/projects">
			<svg inline-src="left-arrow" />
			Go Back
		</a>
		<h1>Password Protected</h1>
		<p>Please enter a password to continue.</p>
		<form on:submit={handleSubmit}>
			<input type="password" class:password-error={showError} bind:value={passwordInput} />
			{#if showError}
				<span class="error-text">The password you entered is incorrect</span>
			{/if}
			<button aria-label="Enter password" type="submit">Enter</button>
		</form>
	</div>
{:else}
	<div class="container">
		<a aria-label="Go back" href="/projects" class="go-back">
			<svg inline-src="left-arrow" />
			Go Back
		</a>
		<section class="header" class:video-header={!!data.project.videoLink}>
			<div class="info">
				<h1>{data.project.title}</h1>
				{#if data.project.role}
					<h2>{data.project.role}</h2>
				{/if}
			</div>
			{#if !data.project.videoLink}
				<div class="image">
					<LayoutImage
						image={data.project.coverImage}
						sizes="(max-width: 950px) 100vw, 450px"
						srcset={[414, 728, 1440]}
					/>
				</div>
			{:else}
				<div class="video">
					<iframe
						src={data.project.videoLink}
						title="Video Player"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; fullscreen; picture-in-picture; web-share"
						allowfullscreen
					/>
				</div>
			{/if}
		</section>
		<div class="markdown-container">
			{@html data.project.description}
		</div>
		<a aria-label="View more work" href="/projects" class="view-more">View More Work</a>
	</div>
{/if}

<style lang="postcss">
	.password {
		display: flex;
		flex-direction: column;
		background-color: var(--dark-color);
		color: var(--light-text);
		width: calc(100% - (2 * var(--padding)));
		max-width: 1000px;
		padding: var(--padding);
		box-sizing: border-box;
		box-shadow: 0.5rem 0.5rem 0.5rem rgba(var(--dark-color-rgb), 0.75);

		& a {
			display: flex;
			align-items: center;
			color: var(--light-color);
			font-size: 1.1rem;
			align-self: flex-start;
			& svg {
				width: 2rem;
				margin-right: 1rem;
				fill: var(--light-color);
			}
		}
		& h1 {
			margin: 0;
			margin-top: 3rem;
			margin-bottom: 0.5rem;
			text-align: center;
		}
		& p {
			text-align: center;
			font-size: 1.5rem;
			margin: 0;
		}
		& form {
			display: flex;
			flex-direction: column;
			align-items: center;
			width: 25rem;
			margin: 2rem auto;
			@media (--md-viewport) {
				& {
					width: 100%;
				}
			}
		}
		& input {
			width: 100%;
			height: 2rem;
			border-radius: 0.3rem;
			font-size: 1.2rem;
			padding: 1.5rem 1rem;
			border: 1px solid rgba(var(--dark-color-rgb), 0.5);
			box-sizing: border-box;
			&:hover {
				border: 1px solid rgba(var(--dark-color-rgb), 0.8);
			}
			&:focus {
				outline: 1px solid var(--light-color);
			}
		}
		& button {
			background-color: var(--dark-color);
			color: var(--light-color);
			border: 1px solid var(--light-color);
			padding: 0.5rem;
			width: 18rem;
			margin-top: 1rem;
			@media (--md-viewport) {
				& {
					width: 100%;
				}
			}
		}
		& .password-error {
			border: 1px solid var(--error-color);
		}
		& .error-text {
			font-size: 0.8rem;
			color: var(--error-color);
		}
	}

	.container {
		max-width: 1000px;
		padding: 2rem var(--padding);
		margin: auto;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.go-back {
		align-self: flex-start;
		transition: all 250ms ease-in-out;
		background-color: transparent;
		border: 1px solid rgba(var(--dark-color-rgb), 0.5);
		color: var(--dark-color);
		display: inline-flex;
		align-items: center;
		text-decoration: none;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		margin-bottom: 3rem;
		&:hover {
			background-color: rgba(var(--dark-color-rgb), 0.1);
			border: 1px solid rgba(var(--dark-color-rgb), 1);
			transition: all 250ms ease-in-out;
		}
		& svg {
			width: 1.5rem;
			fill: var(--dark-color);
		}
	}
	.view-more {
		background-color: var(--dark-color);
		color: var(--light-text);
		text-decoration: none;
		margin: auto;
		display: inline;
		padding: 0.5rem 1rem;
		font-size: 0.9rem;
		transition: all 250ms ease-in-out;
		&:hover {
			transition: all 250ms ease-in-out;
			box-shadow: 0 0.2rem 0.3rem var(--dark-color);
		}
	}
	.header {
		width: 100%;
		display: grid;
		grid-template-columns: 1fr 1fr;
		@media (--md-viewport) {
			& {
				grid-template-columns: 1fr;
			}
		}
	}
	.video-header {
		grid-template-columns: 1fr;
		& .info {
			text-align: center;
		}
		& h2 {
			padding-bottom: 2rem;
		}
	}
	.image {
		width: 100%;
		@media (--md-viewport) {
			& {
				grid-row-start: 1;
				margin-bottom: 2rem;
			}
		}
	}
	.video {
		position: relative;
		padding-top: 56.25%;
		& iframe {
			position: absolute;
			top: 0;
			width: 100%;
			height: 100%;
		}
	}
	.info {
		display: flex;
		flex-direction: column;
		justify-content: center;
		& h1 {
			margin: 0;
			font-size: 3.8rem;
		}
		& h2 {
			margin: 0;
			font-family: var(--body-font);
		}
	}

	.markdown-container {
		margin: 5rem 4rem 2rem 4rem;
		@media (--md-viewport) {
			& {
				margin: 5rem 1rem;
			}
		}
	}
	.markdown-container :global(h1) {
		text-align: center;
		font-size: 2.25rem;
	}
	.markdown-container :global(p) {
		text-indent: 2rem;
		text-align: left;
		line-height: 2rem;
		font-size: 1.25rem;
		font-family: var(--body-font);
		margin-bottom: 2rem;
	}
	.markdown-container :global(p > :first-child:is(img)) {
		margin-left: -2rem;
	}
	.markdown-container :global(img) {
		width: 100%;
		margin-bottom: 0.5rem;
	}
</style>
