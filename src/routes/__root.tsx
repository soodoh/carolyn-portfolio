import {
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type { JSX, ReactNode } from "react";
import { useEffect } from "react";
import css from "@/components/commonStyles/globals.css?url";
import Footer from "@/components/footer";
import Header from "@/components/header";
import NotFound from "@/components/not-found";
import { getSocialMedia } from "@/lib/fetch-home-data";

const getRootData = createServerFn().handler(async () => ({
	socialMedia: await getSocialMedia(),
}));

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
