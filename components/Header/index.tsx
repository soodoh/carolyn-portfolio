"use client";

import Logo from "@/components/icons/Logo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type RefObject, useState } from "react";

const links = [
  { name: "About", path: "/about" },
  { name: "Projects", path: "/projects" },
  { name: "Photography", path: "/photography" },
  { name: "Resume", path: "/resume" },
];

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
  const [mobileNavOpen, setMobileNav] = useState(false);

  // Home page has it's own Header instance to handle transparency state changes
  // when intersecting with the Projects section
  if (isLayout && route === "/") {
    return null;
  }

  return (
    <header
      ref={ref}
      className={cn(
        "sticky top-0 flex bg-dark px-(--spacing-padding) items-center h-(--spacing-header-height) transition-all duration-[250ms] ease-in-out z-2 [&_a]:no-underline",
        route === "/" && "fixed top-0 left-0 right-0",
        isTransparent && "bg-transparent",
      )}
    >
      <Link
        className={cn(
          "grow inline-flex items-end no-underline [&_svg]:h-12 max-sm:[&_svg]:h-8",
          isTransparent &&
            "invisible transition-all duration-[250ms] ease-in-out",
        )}
        aria-label="Home"
        href="/"
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
              "text-light-text",
              route === link.path && "text-light",
            )}
            aria-label={link.name}
            href={link.path}
          >
            {`${link.name}.`}
          </Link>
        ))}
      </nav>

      <Sheet open={mobileNavOpen} onOpenChange={setMobileNav}>
        <Button
          variant="ghost"
          size="icon-lg"
          className="hidden max-md:inline-flex border border-light rounded-[5px] bg-transparent hover:bg-transparent"
          onClick={() => setMobileNav(true)}
          aria-label="Open Navigation"
        >
          <MenuIcon className="h-6 w-6 text-light-text" />
        </Button>

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
              className="absolute top-3 right-(--spacing-padding) border border-light rounded-[5px] bg-transparent px-[0.3rem] hover:bg-transparent"
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
                    "text-light-text text-2xl p-6 no-underline",
                    route === link.path && "text-light",
                  )}
                  aria-label={link.name}
                  href={link.path}
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
