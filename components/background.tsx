"use client";

import type { JSX } from "react";
import ImageWrapper from "@/components/image-wrapper";
import type { ImageType } from "@/lib/types";
import { cn } from "@/lib/utils";

const Background = ({
	fixed = false,
	image,
}: {
	fixed?: boolean;
	image: ImageType;
}): JSX.Element => {
	return (
		<div
			className={cn("bg-dark h-screen absolute inset-0 -z-1", fixed && "fixed")}
		>
			<ImageWrapper
				className="w-full h-full object-cover"
				priority
				image={image}
				sizes="100vw"
			/>
		</div>
	);
};

export default Background;
