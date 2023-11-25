import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	webServer: {
		command: 'yarn build && yarn preview',
		url: 'http://localhost:4000'
	},
	reporter: [['html', { open: 'always' }]],
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/,
	use: {
		baseURL: 'http://localhost:4000'
	}
};

export default config;
