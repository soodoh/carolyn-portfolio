import DropdownIcon from "@/components/icons/DropdownIcon";
import { useState } from "react";
import styles from "./dropdown.module.css";

// TODO implement close on document click
//
// const close = (event: MouseEvent | TouchEvent) => {
// 	if (event.target instanceof HTMLElement && !event.target.closest('.dropdown')) {
// 		dropdownOpen = false;
// 	}
// };
//
// <svelte:document on:click={close} on:touchstart={close} />

const Dropdown = <T extends string>({
  current,
  options,
  onChange,
}: {
  current: T;
  options: T[];
  onChange: (option: T) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={styles.dropdown}>
      <button
        className={styles.menuButton}
        aria-label="Choose a filter"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {current}
        <DropdownIcon />
      </button>
      <div className={styles.dropdownMenu} role="menu" aria-hidden={!open}>
        {options.map((option, index) => (
          <button
            key={`option-${index}-${option}`}
            aria-label={`Choose filter: ${option}`}
            onClick={() => {
              onChange(option);
              setOpen(false);
            }}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dropdown;
