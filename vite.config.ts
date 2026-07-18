import netlify from "@netlify/vite-plugin-tanstack-start";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import manifest from "./lib/project-auth-manifest.json";

const staticPublicPaths = new Set(["/", "/about", "/photography", "/projects"]);
const protectedProjectPaths = new Set(
	Object.entries(manifest)
		.filter(([, auth]) => auth.passwordHash)
		.map(([slug]) => `/projects/${slug}`),
);

export default defineConfig({
	define: {
		"process.env.PLAYWRIGHT_TEST": JSON.stringify(
			process.env.PLAYWRIGHT_TEST ?? "false",
		),
	},
	resolve: {
		tsconfigPaths: true,
	},
	plugins: [
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
					if (staticPublicPaths.has(normalizedPath)) {
						return true;
					}
					if (!/^\/projects\/[^/]+$/.test(normalizedPath)) {
						// Protected projects and the Contentful-backed resume redirect stay
						// dynamic. Prerendering /resume would follow its external PDF URL.
						return false;
					}
					return !protectedProjectPaths.has(normalizedPath);
				},
			},
		}),
		tailwindcss(),
		viteReact(),
		netlify({ dev: { edgeFunctions: { enabled: false } } }),
	],
	server: {
		port: 3000,
	},
	build: {
		sourcemap: true,
	},
});
