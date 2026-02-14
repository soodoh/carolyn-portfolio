"use client";

import DropdownIcon from "@/components/icons/DropdownIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Dropdown = <T extends string>({
  current,
  options,
  onChange,
}: {
  current: T;
  options: T[];
  onChange: (option: T) => void;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="mt-2 pb-2 flex items-center cursor-pointer border-none bg-transparent font-body text-base leading-7 text-dark">
        {current}
        <DropdownIcon className="fill-dark ml-2 w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-white text-dark shadow-[0_0_0.5rem_rgba(var(--color-dark-rgb),0.25)] z-10"
        align="start"
      >
        {options.map((option, index) => (
          <DropdownMenuItem
            key={`option-${index}-${option}`}
            className="cursor-pointer px-8 py-4 text-base"
            onClick={() => onChange(option)}
          >
            {option}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Dropdown;
