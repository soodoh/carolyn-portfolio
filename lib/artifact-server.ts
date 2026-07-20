export function parseTcpPort(value: string, name: string): number {
	const port = Number(value);
	if (!Number.isInteger(port) || port < 1 || port > 65_535) {
		throw new Error(`${name} must be an integer between 1 and 65535.`);
	}
	return port;
}

export async function assertTcpPortAvailable(
	port: number,
	label = "Amplify compute port",
): Promise<void> {
	let probe: ReturnType<typeof Bun.serve>;
	try {
		probe = Bun.serve({
			hostname: "127.0.0.1",
			port,
			fetch: () => new Response("port availability probe"),
		});
	} catch (error) {
		throw new Error(`${label} ${port} is already in use.`, {
			cause: error,
		});
	}
	await probe.stop(true);
}
