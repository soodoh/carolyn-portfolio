<script lang="ts">
	import Icon from '$lib/Icon.svelte';
	import type { SocialMedia } from '$lib/types';
	export let socialMedia: SocialMedia[];
</script>

<footer>
	<div class="copyright">
		<span>Copyright © {new Date().getFullYear()} Carolyn DiLoreto</span>
		<span>Designed by Carolyn DiLoreto</span>
		<span>Developed by Paul DiLoreto</span>
	</div>
	<div class="social-media">
		{#each socialMedia as icon}
			<Icon {icon} />
		{/each}
	</div>
</footer>

<style>
	footer {
		display: flex;
		justify-content: space-between;
		padding: 1rem var(--padding);
	}
	.copyright {
		display: flex;
		flex-direction: column;
		justify-content: center;
		font-size: 0.75rem;
		line-height: 1.25rem;
	}
	.social-media {
		display: flex;
		justify-content: center;
		align-items: center;
	}
	@media (max-width: 768px) {
		footer {
			flex-direction: column;
			align-items: center;
		}
		.copyright {
			align-items: center;
		}
		.social-media {
			margin-top: 1rem;
		}
	}
</style>
