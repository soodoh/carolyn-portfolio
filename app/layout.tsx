import "@/components/commonStyles/globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getSocialMedia } from "@/lib/fetch-home-data";
import styles from "./layout.module.css";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const socialMedia = await getSocialMedia();
  return (
    <html lang="en">
      <body>
        <Header />
        <main className={styles.mainContent}>{children}</main>
        <Footer socialMedia={socialMedia} />
      </body>
    </html>
  );
}
