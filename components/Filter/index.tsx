"use client";

import Dropdown from "@/components/Dropdown";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Filter = <T extends string>({
  current,
  options,
  onChange,
}: {
  current: T;
  options: T[];
  onChange: (name: T) => void;
}) => {
  return (
    <section className="sticky top-[var(--spacing-header-height)] mb-6 z-2 bg-white">
      <div role="tablist" className="max-md:hidden">
        {options.map((name, index) => (
          <Button
            key={`filter-${index}-${name}`}
            variant="ghost"
            role="tab"
            aria-label={`Choose filter: ${name}`}
            className={cn(
              "text-dark font-body text-base leading-7 rounded-none px-8 py-4 h-auto hover:bg-transparent hover:text-dark",
              current === name && "border-t-[5px] border-t-light -mt-[5px]",
            )}
            onClick={() => onChange(name)}
          >
            {name}
          </Button>
        ))}
      </div>
      <div className="hidden max-md:block">
        <Dropdown current={current} options={options} onChange={onChange} />
      </div>
    </section>
  );
};

export default Filter;
