import { createRouter } from "@tanstack/react-router";
import NotFound from "@/components/not-found";
import { routeTree } from "@/src/routeTree.gen";

export function getRouter() {
	return createRouter({
		routeTree,
		scrollRestoration: true,
		defaultNotFoundComponent: NotFound,
	});
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
