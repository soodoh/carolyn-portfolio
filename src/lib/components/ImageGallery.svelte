<script lang="ts">
	import Modal from '$lib/components/Modal.svelte';
	import Image from './Image.svelte';
	import type { ImageType } from '$lib/types';

	export let open = false;
	export let images: ImageType[];
	export let current: number;
	export let onClose = () => (open = false);

	function handleImage(imageIndex: number) {
		current = imageIndex;
	}

	function handleKeypress(event: KeyboardEvent) {
		if (event.key === 'ArrowLeft' && current > 0) {
			handleImage(current - 1);
		} else if (event.key === 'ArrowRight' && current <= images.length - 2) {
			handleImage(current + 1);
		}
	}

	function handleModalBackdrop(event: MouseEvent) {
		if (event.target instanceof HTMLElement && event.target.matches('.modal-container')) {
			onClose();
		}
	}
</script>

<Modal {open} {onClose} onClick={handleModalBackdrop} onKeypress={handleKeypress}>
	<div class="modal-container">
		<div class="close">
			<button aria-label="Close image modal" on:click={onClose}>&times;</button>
		</div>
		<div class="prev">
			{#if current > 0}
				<button aria-label="Previous photo" on:click={() => handleImage(current - 1)}
					><svg inline-src="left-chevron" /></button
				>
			{/if}
		</div>

		<div class="modal-image">
			<Image image={images[current]} srcset={[500, 725, 1440]} sizes="100vw" />
		</div>

		<div class="next">
			{#if current <= images.length - 2}
				<button aria-label="Next photo" on:click={() => handleImage(current + 1)}>
					<svg inline-src="right-chevron" />
				</button>
			{/if}
		</div>
		<div class="info">
			{current + 1} / {images.length}
		</div>
	</div>
</Modal>

<style lang="postcss">
	button {
		border: none;
		background-color: transparent;
		width: 100%;
		cursor: pointer;
	}
	.modal-container {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: grid;
		grid-template-rows: auto 1fr auto;
		grid-template-columns: auto 1fr auto;
		justify-items: center;
		align-items: center;
		color: var(--light-color);
	}
	.modal-image {
		grid-row: 1/3;
		grid-column: 2/3;
		width: calc(100vw - 6rem);
		height: calc(100vh - 4rem);
		position: relative;
	}
	.modal-image :global(img) {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.modal-container button {
		font-size: 2rem;
		color: var(--light-color);
	}
	.modal-container svg {
		width: 2rem;
		height: 2rem;
		stroke: var(--light-color);
	}
	.close {
		grid-column: 3/4;
		justify-self: flex-end;
		align-self: flex-start;
		& button {
			font-size: 3rem;
		}
	}
	.prev button,
	.next button {
		padding: 0.5rem;
	}
	.prev {
		justify-self: flex-start;
	}
	.next {
		justify-self: flex-end;
	}
	.info {
		grid-column: 1/4;
		justify-self: center;
	}
</style>
