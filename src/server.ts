import handler, { createServerEntry } from "@tanstack/react-start/server-entry";

const ONLY_HTML_ERROR = JSON.stringify({
	error: "Only HTML requests are supported here",
});

async function isOnlyHtmlError(response: Response): Promise<boolean> {
	return (
		response.status === 500 &&
		response.headers.get("Content-Type")?.startsWith("application/json") ===
			true &&
		(await response.clone().text()) === ONLY_HTML_ERROR
	);
}

export default createServerEntry({
	async fetch(request, options) {
		const response = await handler.fetch(request, options);
		if (!(await isOnlyHtmlError(response))) {
			return response;
		}

		// Work around TanStack/router#7913 until Start reports failed content
		// negotiation as a client error instead of an internal server error.
		return new Response(null, {
			headers: {
				"Cache-Control": "no-store",
				Vary: "Accept",
			},
			status: 406,
		});
	},
});
