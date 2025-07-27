"use client";

import Logo from "@/components/icons/Logo";
import classNames from "classnames/bind";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./header.module.css";
import type { RefObject } from "react";

const cx = classNames.bind(styles);

const links = [
  { name: "About", path: "/about" },
  { name: "Projects", path: "/projects" },
  { name: "Photography", path: "/photography" },
  { name: "Resume", path: "/resume" },
];
const mobileNavOpen = false;

const Header = ({
  ref,
  isLayout = false,
  isTransparent = false,
}: {
  ref?: RefObject<HTMLElement | null>;
  isLayout?: boolean;
  isTransparent?: boolean;
}) => {
  const route = usePathname();

  // Home page has it's own Header instance to handle transparency state changes
  // when intersecting with the Projects section
  if (isLayout && route === "/") {
    return null;
  }

  return (
    <header
      ref={ref}
      className={cx({
        header: true,
        fixed: route === "/",
        transparent: isTransparent,
        headerMobileNavOpen: mobileNavOpen,
      })}
    >
      <div className={cx({ brand: true, hideBrand: isTransparent })}>
        <Link className={styles.brandLink} aria-label="Home" href="/">
          <Logo />
          <span className={styles.brandText}>Carolyn DiLoreto</span>
        </Link>
      </div>
      <nav className={styles.navContainer}>
        {links.map((link) => (
          <Link
            key={`header-link-${link.name}`}
            className={cx({
              navLink: true,
              activeNavLink: route === link.path,
            })}
            aria-label={link.name}
            href={link.path}
          >
            {`${link.name}.`}
          </Link>
        ))}
      </nav>
      <div className={styles.mobileNavContainer}></div>
    </header>
  );
};

export default Header;
