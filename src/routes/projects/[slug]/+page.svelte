<script lang="ts">
	import Image from '$lib/components/Image.svelte';

	export let data;
	let showError = false;
	let authenticated = false;
	let passwordInput: string;

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		console.log(passwordInput, data.project.password, 'hi');
		if (passwordInput !== data.project.password) {
			showError = true;
		} else {
			authenticated = true;
		}
	}
</script>

{#if data.project.password && !authenticated}
	<div class="password">
		<a href="/projects">
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
			<button type="submit">Enter</button>
		</form>
	</div>
{:else}
	<div class="container">
		<a href="/projects" class="go-back">
			<svg inline-src="left-arrow" />
			Go Back
		</a>
		<section class="header" class:video-header={!!data.project.videoLink}>
			<div class="info">
				<h1>{data.project.title}</h1>
				<h2>{data.project.role}</h2>
			</div>
			{#if !data.project.videoLink}
				<div class="image">
					<Image
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
		<a href="/projects" class="view-more">View More Work</a>
	</div>
{/if}

<style>
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
	}
	.password a svg {
		width: 2rem;
		margin-right: 1rem;
		fill: var(--light-color);
	}
	.password a {
		display: flex;
		align-items: center;
		color: var(--light-color);
		font-size: 1.1rem;
		align-self: flex-start;
	}
	.password h1 {
		margin: 0;
		margin-top: 3rem;
		margin-bottom: 0.5rem;
		text-align: center;
	}
	.password p {
		text-align: center;
		font-size: 1.5rem;
		margin: 0;
	}
	.password form {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 25rem;
		margin: 2rem auto;
	}
	.password input {
		width: 100%;
		height: 2rem;
		border-radius: 0.3rem;
		font-size: 1.2rem;
		padding: 1.5rem 1rem;
		border: 1px solid rgba(var(--dark-color-rgb), 0.5);
		box-sizing: border-box;
	}
	.password input:hover {
		border: 1px solid rgba(var(--dark-color-rgb), 0.8);
	}
	.password input:focus {
		outline: 1px solid var(--light-color);
	}
	.password button {
		background-color: var(--dark-color);
		color: var(--light-color);
		border: 1px solid var(--light-color);
		padding: 0.5rem;
		width: 18rem;
		margin-top: 1rem;
	}
	.password .password-error {
		border: 1px solid var(--error-color);
	}
	.error-text {
		font-size: 0.8rem;
		color: var(--error-color);
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
	}
	.go-back:hover {
		background-color: rgba(var(--dark-color-rgb), 0.1);
		border: 1px solid rgba(var(--dark-color-rgb), 1);
		transition: all 250ms ease-in-out;
	}
	.go-back svg {
		width: 1.5rem;
		fill: var(--dark-color);
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
	}
	.view-more:hover {
		transition: all 250ms ease-in-out;
		box-shadow: 0 0.2rem 0.3rem var(--dark-color);
	}
	.header {
		width: 100%;
		display: grid;
		grid-template-columns: 1fr 1fr;
	}
	.video-header {
		grid-template-columns: 1fr;
	}
	.video-header .info {
		text-align: center;
	}
	.video-header h2 {
		padding-bottom: 2rem;
	}
	.image {
		width: 100%;
	}
	.video {
		position: relative;
		padding-top: 56.25%;
	}
	.video iframe {
		position: absolute;
		top: 0;
		width: 100%;
		height: 100%;
	}
	.info {
		display: flex;
		flex-direction: column;
		justify-content: center;
	}
	.info h1 {
		margin: 0;
		font-size: 3.8rem;
	}
	.info h2 {
		margin: 0;
		font-family: var(--body-font);
	}
	@media (max-width: 950px) {
		.header {
			grid-template-columns: 1fr;
		}
		.image {
			grid-row-start: 1;
			margin-bottom: 2rem;
		}
	}

	.markdown-container {
		margin: 5rem 4rem;
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
	.markdown-container :global(img) {
		margin-left: -2rem;
		width: 100%;
	}
</style>
