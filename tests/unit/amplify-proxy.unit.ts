import { describe, expect, test } from "bun:test";
import { forwardComputeResponse } from "@/lib/amplify-proxy";

describe("Amplify compute proxy responses", () => {
	for (const status of [301, 308]) {
		test(`forwards ${status} redirects without a body`, async () => {
			const response = forwardComputeResponse(
				new Response("redirect body", {
					headers: {
						location: "https://example.com/destination",
						"x-compute-header": "preserved",
					},
					status,
				}),
			);

			expect(response.status).toBe(status);
			expect(response.headers.get("location")).toBe(
				"https://example.com/destination",
			);
			expect(response.headers.get("x-compute-header")).toBe("preserved");
			expect(response.headers.get("x-amplify-artifact-target")).toBe("compute");
			expect(await response.text()).toBe("");
		});
	}

	test("preserves non-redirect response bodies", async () => {
		const response = forwardComputeResponse(new Response("content"));

		expect(response.status).toBe(200);
		expect(await response.text()).toBe("content");
	});
});
