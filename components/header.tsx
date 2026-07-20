"use client";

import { Link, useLocation } from "@tanstack/react-router";
import { MenuIcon, XIcon } from "lucide-react";
import type { JSX } from "react";
import { useEffect, useRef, useState } from "react";
import Logo from "@/components/icons/logo";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { cn, darkSurfaceFocusClass } from "@/lib/utils";

const links = [
	{ name: "About", path: "/about" },
	{ name: "Projects", path: "/projects" },
	{ name: "Photography", path: "/photography" },
	{ name: "Resume", path: "/resume" },
] as const;

const Header = (): JSX.Element => {
	const route = useLocation({ select: (location) => location.pathname });
	const headerRef = useRef<HTMLElement>(null);
	const [mobileNavOpen, setMobileNav] = useState(false);
	const [heroVisibility, setHeroVisibility] = useState<{
		isIntersecting: boolean | undefined;
		route: string;
	}>(() => ({ isIntersecting: undefined, route }));
	const isTransparent =
		route === "/" &&
		(heroVisibility.route !== route || heroVisibility.isIntersecting !== false);

	useEffect(() => {
		if (route !== "/") {
			setHeroVisibility({ isIntersecting: false, route });
			return;
		}
		const homeHero = document.querySelector("[data-home-hero]");
		if (!homeHero) {
			setHeroVisibility({ isIntersecting: false, route });
			return;
		}
		const observer = new IntersectionObserver(
			(entries) =>
				setHeroVisibility({
					isIntersecting: entries[0]?.isIntersecting ?? false,
					route,
				}),
			{
				rootMargin: `-${headerRef.current?.clientHeight ?? 64}px`,
				threshold: 0,
			},
		);
		observer.observe(homeHero);
		return () => observer.disconnect();
	}, [route]);

	return (
		<header
			ref={headerRef}
			data-header-appearance={isTransparent ? "transparent" : "opaque"}
			className={cn(
				"sticky top-0 flex bg-dark px-(--spacing-padding) items-center h-(--spacing-header-height) transition-all duration-[250ms] ease-in-out nonessential-motion z-2 [&_a]:no-underline",
				route === "/" && "fixed top-0 left-0 right-0",
				isTransparent && "bg-transparent",
			)}
		>
			<Link
				className={cn(
					darkSurfaceFocusClass,
					"grow inline-flex items-end no-underline [&_svg]:h-12 max-sm:[&_svg]:h-8",
					isTransparent &&
						"invisible transition-all duration-[250ms] ease-in-out nonessential-motion",
				)}
				aria-label="Home"
				to="/"
			>
				<Logo />
				<span className="text-3xl font-[100] ml-8 font-header text-light-text max-sm:text-2xl max-sm:ml-0">
					Carolyn DiLoreto
				</span>
			</Link>

			<nav className="[&_a]:ml-8 [&_a:first-child]:ml-0 [&_a]:text-base max-md:hidden">
				{links.map((link) => (
					<Link
						key={`header-link-${link.name}`}
						className={cn(
							darkSurfaceFocusClass,
							"text-light-text",
							route === link.path && "text-light",
						)}
						aria-label={link.name}
						to={link.path}
					>
						{`${link.name}.`}
					</Link>
				))}
			</nav>

			<Sheet open={mobileNavOpen} onOpenChange={setMobileNav}>
				<SheetTrigger asChild>
					<Button
						variant="ghost"
						size="icon-lg"
						className={cn(
							darkSurfaceFocusClass,
							"hidden max-md:inline-flex border border-light rounded-[5px] bg-transparent hover:bg-transparent",
						)}
						aria-label="Open Navigation"
					>
						<MenuIcon className="h-6 w-6 text-light-text" />
					</Button>
				</SheetTrigger>

				<SheetContent
					side="right"
					showCloseButton={false}
					className="bg-dark border-none w-full max-w-none flex flex-col items-center justify-center"
				>
					<SheetTitle className="sr-only">Navigation</SheetTitle>
					<SheetClose asChild>
						<Button
							variant="ghost"
							size="icon-lg"
							className={cn(
								darkSurfaceFocusClass,
								"absolute top-3 right-(--spacing-padding) border border-light rounded-[5px] bg-transparent px-[0.3rem] hover:bg-transparent",
							)}
							aria-label="Close Navigation"
						>
							<XIcon className="h-5 w-5 text-light-text" />
						</Button>
					</SheetClose>
					<nav className="flex flex-col items-center">
						{links.map((link) => (
							<SheetClose key={`mobile-link-${link.name}`} asChild>
								<Link
									className={cn(
										darkSurfaceFocusClass,
										"text-light-text text-2xl p-6 no-underline",
										route === link.path && "text-light",
									)}
									aria-label={link.name}
									to={link.path}
								>
									{`${link.name}.`}
								</Link>
							</SheetClose>
						))}
					</nav>
				</SheetContent>
			</Sheet>
		</header>
	);
};

export default Header;
