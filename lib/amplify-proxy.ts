export function forwardComputeResponse(response: Response): Response {
	const headers = new Headers(response.headers);
	headers.set("x-amplify-artifact-target", "compute");
	const isRedirect = response.status >= 300 && response.status < 400;
	return new Response(isRedirect ? null : response.body, {
		headers,
		status: response.status,
		statusText: response.statusText,
	});
}
