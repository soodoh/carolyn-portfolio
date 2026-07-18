"use client";

import type { JSX } from "react";
import Dropdown from "@/components/dropdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FilterProps<T extends string> = {
	current: T;
	options: T[];
	onChange: (name: T) => void;
};

function Filter<T extends string>({
	current,
	options,
	onChange,
}: FilterProps<T>): JSX.Element {
	return (
		<div
			data-visual-sticky-filter
			className="sticky top-[var(--spacing-header-height)] mb-6 z-2 bg-white"
		>
			<fieldset className="m-0 max-md:hidden border-0 p-0">
				<legend className="sr-only">Filter</legend>
				{options.map((name) => (
					<Button
						key={`filter-${name}`}
						variant="ghost"
						aria-pressed={current === name}
						aria-label={`Choose filter: ${name}`}
						className={cn(
							"text-dark font-body text-base leading-7 rounded-none px-8 py-4 h-auto hover:bg-transparent hover:text-dark",
							current === name &&
								"border-t-[5px] border-t-light-on-white -mt-[5px]",
						)}
						onClick={() => onChange(name)}
					>
						{name}
					</Button>
				))}
			</fieldset>
			<div className="hidden max-md:block">
				<Dropdown current={current} options={options} onChange={onChange} />
			</div>
		</div>
	);
}

export default Filter;
