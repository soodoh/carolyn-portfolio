"use client";

import type { JSX } from "react";
import Dropdown from "@/components/dropdown";
import { Button } from "@/components/ui/button";

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
			className="sticky top-[var(--spacing-header-height)] z-3 mb-6 bg-white max-md:mb-0 max-md:pt-2 max-md:pb-6"
		>
			<fieldset className="m-0 max-md:hidden overflow-visible border-0 p-0">
				<legend className="sr-only">Filter</legend>
				{options.map((name) => (
					<Button
						key={`filter-${name}`}
						variant="ghost"
						aria-pressed={current === name}
						aria-label={`Choose filter: ${name}`}
						className="relative h-auto overflow-visible rounded-none px-8 py-4 font-body text-base leading-7 text-dark hover:bg-transparent hover:text-dark focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-[-2px] focus-visible:outline-dark focus-visible:ring-0 focus-visible:ring-offset-0"
						onClick={() => onChange(name)}
					>
						{current === name ? (
							<span
								data-selected-filter-indicator
								aria-hidden="true"
								className="absolute -top-[5px] right-0 left-0 h-[5px] bg-light"
							/>
						) : null}
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
