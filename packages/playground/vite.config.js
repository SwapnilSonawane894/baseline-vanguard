import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	ssr: {
		noExternal: [
			'@baseline-vanguard/eslint-plugin-baseline',
			'@baseline-vanguard/stylelint-plugin-baseline',
			'web-features'
		]
	},
	optimizeDeps: {
		include: [
			'@baseline-vanguard/eslint-plugin-baseline',
			'@baseline-vanguard/stylelint-plugin-baseline',
			'web-features'
		]
	}
});