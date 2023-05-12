<script lang='ts'>
	export let isOpen = false;

	function handleBackdrop(event: MouseEvent) {
		if (event.target instanceof HTMLElement && event.target.matches('.modal')) {
			isOpen = false;
		}
	}
</script>

{#if isOpen}
	<div class="modal" on:click={handleBackdrop} on:keydown={() => {}}>
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
		background-color: rgba(0, 0, 0, 0.5);
		cursor: pointer;
		z-index: 7;
	}
	.modal-content {
		width: 90vw;
		height: 90vh;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: auto;
		z-index: 8;
	}
</style>
