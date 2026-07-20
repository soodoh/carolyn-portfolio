import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, loadEnv } from "vite";
import { getStaticPublicPaths } from "./lib/amplify-artifact";

const staticPublicPaths = new Set(getStaticPublicPaths());

export default defineConfig(({ mode }) => {
	Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

	return {
		define: {
			"process.env.RELEASE_COMMIT": JSON.stringify(
				process.env.AWS_COMMIT_ID ?? process.env.GITHUB_SHA ?? "local",
			),
			"process.env.CONTENTFUL_SPACE_ID": JSON.stringify(
				process.env.CONTENTFUL_SPACE_ID ?? "",
			),
			"process.env.HERMETIC_PRODUCTION_BUILD": JSON.stringify(
				process.env.HERMETIC_PRODUCTION_BUILD ?? "false",
			),
			"process.env.PLAYWRIGHT_TEST": JSON.stringify(
				process.env.PLAYWRIGHT_TEST ?? "false",
			),
		},
		resolve: {
			tsconfigPaths: true,
		},
		plugins: [
			nitro({
				preset: "aws_amplify",
				awsAmplify: { runtime: "nodejs24.x" },
			}),
			tanstackStart({
				prerender: {
					enabled: true,
					autoStaticPathsDiscovery: true,
					concurrency: 1,
					crawlLinks: true,
					failOnError: true,
					filter: ({ path }) => {
						const normalizedPath =
							path.length > 1 ? path.replace(/\/$/, "") : path;
						return staticPublicPaths.has(normalizedPath);
					},
				},
			}),
			tailwindcss(),
			viteReact(),
		],
		server: {
			port: 3000,
		},
		build: {
			sourcemap: false,
		},
	};
});
