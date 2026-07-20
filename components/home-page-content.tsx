"use client";

import { Link } from "@tanstack/react-router";
import type { JSX } from "react";

const HomePageContent = (): JSX.Element => {
	return (
		<div
			data-home-hero
			className="flex justify-center items-center flex-col min-h-screen"
		>
			<div className="flex flex-col items-center [&_svg]:h-32 max-md:[&_svg]:h-24 [&_svg]:mb-8">
				<h1 className="text-[3.5rem] text-light-text m-0 max-md:text-[2rem]">
					Carolyn DiLoreto
				</h1>
			</div>
			<div className="flex justify-between mt-8 w-[28rem] max-md:flex-col max-md:items-center max-md:w-auto">
				<Link
					aria-label="View Photography"
					to="/photography"
					className="flex justify-center text-base text-light no-underline border border-light p-2 w-40 transition-colors duration-200 ease-in-out nonessential-motion hover:bg-light hover:text-black max-md:mb-4"
				>
					View Photography
				</Link>
				<Link
					aria-label="View Projects"
					to="/projects"
					className="flex justify-center text-base text-light no-underline border border-light p-2 w-40 transition-colors duration-200 ease-in-out nonessential-motion hover:bg-light hover:text-black"
				>
					View Projects
				</Link>
			</div>
		</div>
	);
};

export default HomePageContent;
