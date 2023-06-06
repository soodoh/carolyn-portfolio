import { inlineSvg } from '@svelte-put/preprocess-inline-svg/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		inlineSvg(
			[
				{
					directories: 'static/icons'
				}
			],
			{
				inlineSrcAttributeName: 'inline-src'
			}
		),
		sveltekit()
	]
});
