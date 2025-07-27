import "@/components/commonStyles/globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getSocialMedia } from "@/lib/fetch-home-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CD Portfolio",
  description: "",
  robots: "index, follow",
  keywords: [],
  icons: "/favicon.png",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const socialMedia = await getSocialMedia();
  return (
    <html lang="en">
      <head>
        <meta
          name="google-site-verification"
          content="mZWTxlscBqxebm-E7NiMf8dG-G2qbqKKODr0BoCUobQ"
        />
      </head>
      <body>
        <Header isLayout />
        {children}
        <Footer socialMedia={socialMedia} />
      </body>
    </html>
  );
}
