import type { JSX } from "react";
import { containerClass } from "@/lib/utils";

export default function NotFound(): JSX.Element {
	return (
		<>
			<title>CD: Page Not Found</title>
			<meta
				name="description"
				content="The page you are looking for does not exist."
			/>
			<meta name="robots" content="noindex, nofollow" />
			<div className={containerClass}>
				<div className="flex flex-col items-center justify-center pt-8">
					<h1 className="m-0">404</h1>
					<h2 className="m-0">Page not found</h2>
				</div>
			</div>
		</>
	);
}
