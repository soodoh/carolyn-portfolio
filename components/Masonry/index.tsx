import Masonry from "react-masonry-css";
import styles from "./masonry.module.css";
import type { ReactNode } from "react";

const MasonryContainer = ({ children }: { children: ReactNode }) => {
  return (
    <Masonry
      breakpointCols={{
        // Arbitrary breakpoints
        default: 4,
        1260: 3,
        962: 2,
        660: 1,
      }}
      className={styles.masonryGrid}
      columnClassName={styles.masonryGridColumn}
    >
      {children}
    </Masonry>
  );
};

export default MasonryContainer;
