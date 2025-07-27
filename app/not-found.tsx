import layoutStyles from "@/components/commonStyles/layout.module.css";
import { Metadata } from "next";
import styles from "./notFound.module.css";

export const metadata: Metadata = {
  title: "CD: Page Not Found",
  description: "The page you are looking for does not exist.",
  robots: "noindex, nofollow",
  keywords: [],
};

export default function NotFound() {
  return (
    <div className={layoutStyles.container}>
      <div className={styles.notFound}>
        <h1>404</h1>
        <h2>Page not found</h2>
      </div>
    </div>
  );
}
