import process from "node:process";

const port = Number(process.env.DEV_SMOKE_PORT ?? "4399");
const origin = `http://127.0.0.1:${port}`;
const server = Bun.spawn(
	["bun", "run", "dev", "--", "--host", "127.0.0.1", "--port", String(port)],
	{
		env: process.env,
		stderr: "inherit",
		stdout: "inherit",
	},
);

try {
	let lastStatus: number | undefined;
	for (let attempt = 0; attempt < 120; attempt += 1) {
		if (server.exitCode !== null) {
			throw new Error(
				`Development server exited with code ${server.exitCode}.`,
			);
		}
		try {
			const response = await fetch(origin);
			lastStatus = response.status;
			if (response.status === 200) {
				process.stdout.write(`Development smoke check passed at ${origin}.\n`);
				process.exitCode = 0;
				break;
			}
		} catch {
			// The server may not be listening yet.
		}
		await Bun.sleep(250);
	}
	if (process.exitCode !== 0) {
		throw new Error(
			`Development server did not return HTTP 200${lastStatus ? `; last status was ${lastStatus}` : ""}.`,
		);
	}
} finally {
	server.kill();
	await server.exited;
}
