import flowbitePlugin from 'flowbite/plugin';
/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/flowbite-svelte/**/*.{html,js,svelte,ts}'
	],

	plugins: [flowbitePlugin],

	darkMode: 'class',

	theme: {
		extend: {
			screens: {
				sm: '',
				xs: ''
			},
			fontSize: {},
			fontFamily: {
				// System fonts only: no web-font download, no third-party font CDN.
				sans: [
					'ui-sans-serif',
					'system-ui',
					'-apple-system',
					'"Segoe UI"',
					'Roboto',
					'"Helvetica Neue"',
					'Arial',
					'sans-serif'
				],
				mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace']
			},
			colors: {
				brand: { DEFAULT: '#FFDB00', ink: '#0A0A0A' },
				cyan: {
					50: '#ecfeff',
					100: '#cffafe',
					200: '#a5f3fc',
					300: '#67e8f9',
					400: '#22d3ee',
					500: '#06b6d4',
					600: '#0891b2',
					700: '#0e7490',
					800: '#155e75',
					900: '#164e63',
					950: '#083344'
				}
			}
		}
	}
};
