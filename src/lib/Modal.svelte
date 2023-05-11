<script lang="ts">
	export let isOpen = false;

	function escapeModal(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isOpen = false;
		}
	}
</script>

{#if isOpen}
	<div class="modal">
		<div class="modal-overlay" on:click={() => (isOpen = false)} on:keypress={escapeModal} />
		<div class="modal-content">
			<slot />
		</div>
	</div>
{/if}

<style>
	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1;
	}

	.modal-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.8);
	}

	.modal-content {
		z-index: 2;
	}
</style>
