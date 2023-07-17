<script lang="ts">
	export let open = false;
	export let onClose = () => (open = false);
	export let onKeypress: ((event: KeyboardEvent) => void) | null = null;
	export let onClick: ((event: MouseEvent) => void) | null = null;

	function handleKeypress(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
		if (typeof onKeypress === 'function') {
			onKeypress(event);
		}
	}

	let modal: HTMLElement;
	function handleFocus(event: FocusEvent) {
		const focusableElements = modal.querySelectorAll(
			'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
		);
		if (
			event.target instanceof HTMLElement &&
			focusableElements[0] instanceof HTMLElement &&
			!event.target.closest('.modal')
		) {
			focusableElements[0].focus();
		}
	}
</script>

<svelte:window on:click={onClick} on:keydown={open ? handleKeypress : null} on:focusin={open ? handleFocus : null} />
<div class:modal-open={open} class="modal" bind:this={modal} aria-modal="true" role="dialog">
	<div class="modal-content">
		<slot />
	</div>
</div>

<style lang="postcss">
	:global(body:has(.modal-open)) {
		overflow: hidden;
	}
	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: rgba(0, 0, 0, 0.8);
		cursor: pointer;
		z-index: 4;
		opacity: 0;
		transition: all 0.25s ease-in-out;
		visibility: hidden;
	}
	.modal-open {
		opacity: 1;
		transition: all 0.25s ease-in-out;
		visibility: visible;
	}
	.modal-content {
		cursor: auto;
		z-index: 5;
	}
</style>
