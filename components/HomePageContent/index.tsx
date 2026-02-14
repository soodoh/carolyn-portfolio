"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const HomePageContent = () => {
  const homePageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const [isTransparent, setTransparent] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries[0].isIntersecting;
        setTransparent(isIntersecting);
      },
      {
        rootMargin: `-${headerRef.current?.clientHeight ?? 64}px`,
        threshold: 0,
      },
    );
    if (homePageRef.current) {
      observer.observe(homePageRef.current);
    }
  }, []);

  return (
    <>
      <Header ref={headerRef} isTransparent={isTransparent} />
      <div
        ref={homePageRef}
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
            href="/photography"
            className="flex justify-center text-base text-light no-underline border border-light p-2 w-40 transition-colors duration-200 ease-in-out hover:bg-light hover:text-black max-md:mb-4"
          >
            View Photography
          </Link>
          <Link
            aria-label="View Projects"
            href="/projects"
            className="flex justify-center text-base text-light no-underline border border-light p-2 w-40 transition-colors duration-200 ease-in-out hover:bg-light hover:text-black"
          >
            View Projects
          </Link>
        </div>
      </div>
    </>
  );
};

export default HomePageContent;
