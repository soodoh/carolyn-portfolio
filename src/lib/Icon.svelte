<script lang="ts">
	import type { SocialMedia } from '$lib/types';
	export let icon: SocialMedia;
</script>

<a href={icon.link}>
		{#if icon.title === 'linkedin'}
			<svg inline-src="linkedin" />
		{/if}
		{#if icon.title === 'instagram'}
			<svg inline-src="instagram" />
		{/if}
</a>

<style>
	a {
		border-radius: 50%;
		text-decoration: none;
		text-align: center;
		display: flex;
		justify-content: center;
		align-items: center;
		width: 1.5rem;
		height: 1.5rem;
		padding: .5rem;
		margin: 0 .25rem;
		transition: background-color 0.25s ease-in-out;
	}
	a:hover {
		transition: background-color 0.25s ease-in-out;
		background-color: var(--dark-transparent-color);
	}
	svg {
		fill: var(--dark-color);
		width: 100%;
		height: 100%;
	}
</style>
