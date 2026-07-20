import type { ErrorComponentProps } from "@tanstack/react-router";
import { useRouter } from "@tanstack/react-router";
import type { JSX } from "react";
import { Button } from "@/components/ui/button";
import { containerClass } from "@/lib/utils";

export default function AppError(_props: ErrorComponentProps): JSX.Element {
	const router = useRouter();
	return (
		<>
			<title>CD: Something went wrong</title>
			<meta name="robots" content="noindex, nofollow" />
			<div className={containerClass}>
				<div className="flex flex-col items-center justify-center gap-4 pt-8 text-center">
					<h1 className="m-0">Something went wrong</h1>
					<p className="m-0">This page could not be loaded.</p>
					<div className="flex flex-wrap justify-center gap-3">
						<Button type="button" onClick={() => void router.invalidate()}>
							Try again
						</Button>
						<Button asChild variant="outline">
							<a href="/">Return home</a>
						</Button>
					</div>
				</div>
			</div>
		</>
	);
}
