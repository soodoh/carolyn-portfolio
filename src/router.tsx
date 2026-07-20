import { createRouter } from "@tanstack/react-router";
import AppError from "@/components/app-error";
import NotFound from "@/components/not-found";
import { routeTree } from "@/src/routeTree.gen";

export function getRouter() {
	return createRouter({
		routeTree,
		scrollRestoration: true,
		defaultErrorComponent: AppError,
		defaultNotFoundComponent: NotFound,
		defaultOnCatch: (error) => {
			console.error("Unhandled route error", error);
		},
	});
}

declare module "@tanstack/react-router" {
	interface Register {
		router: ReturnType<typeof getRouter>;
	}
}
