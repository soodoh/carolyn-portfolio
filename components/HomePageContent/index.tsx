"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import styles from "./homePage.module.css";

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
      <div ref={homePageRef} className={styles.container}>
        <div className={styles.brand}>
          <h1>Carolyn DiLoreto</h1>
        </div>
        <div className={styles.links}>
          <Link aria-label="View Photography" href="/photography">
            View Photography
          </Link>
          <Link aria-label="View Projects" href="/projects">
            View Projects
          </Link>
        </div>
      </div>
    </>
  );
};

export default HomePageContent;
