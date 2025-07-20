"use client";

import Logo from "@/components/icons/Logo";
import classNames from "classnames/bind";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./header.module.css";

const cx = classNames.bind(styles);

const links = [
  { name: "About", path: "/about" },
  { name: "Projects", path: "/projects" },
  { name: "Photography", path: "/photography" },
  { name: "Resume", path: "/resume" },
];
const mobileNavOpen = false;

const Header = ({ transparentHeader }: { transparentHeader?: boolean }) => {
  const route = usePathname();

  return (
    <header
      className={cx({
        header: true,
        fixed: route === "/",
        transparent: route === "/" && transparentHeader,
        headerMobileNavOpen: mobileNavOpen,
      })}
    >
      <div className={cx({ brand: true, hideBrand: transparentHeader })}>
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
