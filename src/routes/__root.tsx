import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import type { JSX, ReactNode } from "react";
import { useEffect } from "react";
import css from "@/components/commonStyles/globals.css?url";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { getRootData } from "@/lib/server-functions";
import { containerClass } from "@/lib/utils";

export const Route = createRootRoute({
	loader: () => getRootData(),
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{ title: "CD Portfolio" },
			{ name: "description", content: "" },
			{ name: "robots", content: "index, follow" },
			{
				name: "google-site-verification",
				content: "mZWTxlscBqxebm-E7NiMf8dG-G2qbqKKODr0BoCUobQ",
			},
		],
		links: [
			{ rel: "stylesheet", href: css },
			{ rel: "icon", href: "/favicon.png" },
			{ rel: "preconnect", href: "https://fonts.googleapis.com" },
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Karla:ital,wght@0,200..800;1,200..800&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=swap",
			},
		],
	}),
	component: RootComponent,
	notFoundComponent: NotFound,
	shellComponent: RootDocument,
});

function RootComponent(): JSX.Element {
	const { socialMedia } = Route.useLoaderData();
	useEffect(() => {
		document.documentElement.dataset.hydrated = "true";
	}, []);
	return (
		<>
			<Header isLayout />
			<main className="flex-1 flex flex-col">
				<Outlet />
			</main>
			<Footer socialMedia={socialMedia} />
		</>
	);
}

function NotFound(): JSX.Element {
	return (
		<div className={containerClass}>
			<div className="flex flex-col items-center justify-center pt-8">
				<h1 className="m-0">404</h1>
				<h2 className="m-0">Page not found</h2>
			</div>
		</div>
	);
}

function RootDocument({ children }: { children: ReactNode }): JSX.Element {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	);
}
