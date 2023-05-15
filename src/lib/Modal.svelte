<script lang="ts">
	export let isOpen = false;
	export let onKeypress: ((event: KeyboardEvent) => void) | null = null;

	function handleBackdrop(event: MouseEvent) {
		if (event.target instanceof HTMLElement && event.target.matches('.modal')) {
			isOpen = false;
		}
	}
	function handleKeypress(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isOpen = false;
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

<svelte:window
	on:keydown={isOpen ? handleKeypress : null}
	on:focusin={isOpen ? handleFocus : null}
/>
<div
	class:modal-open={isOpen}
	class="modal"
	bind:this={modal}
	on:click={handleBackdrop}
	on:keydown={handleKeypress}
>
	<div class="modal-content">
		<slot />
	</div>
</div>

<style>
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
