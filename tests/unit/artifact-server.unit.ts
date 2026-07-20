import { describe, expect, test } from "bun:test";
import { assertTcpPortAvailable, parseTcpPort } from "@/lib/artifact-server";

describe("artifact server ports", () => {
	test("rejects an occupied compute port instead of trusting its response", async () => {
		const unrelatedServer = Bun.serve({
			hostname: "127.0.0.1",
			port: 0,
			fetch: () => new Response("UNRELATED-COMPUTE-PROCESS"),
		});
		try {
			const port = unrelatedServer.port;
			if (port === undefined) {
				throw new Error("Bun did not assign a test server port.");
			}
			await expect(assertTcpPortAvailable(port)).rejects.toThrow(
				`Amplify compute port ${port} is already in use`,
			);
		} finally {
			await unrelatedServer.stop(true);
		}
	});

	test("validates configured TCP ports", () => {
		expect(parseTcpPort("4101", "TEST_PORT")).toBe(4101);
		for (const invalid of ["", "0", "65536", "1.5", "not-a-port"]) {
			expect(() => parseTcpPort(invalid, "TEST_PORT")).toThrow("TEST_PORT");
		}
	});
});
