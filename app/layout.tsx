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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Karla:ital,wght@0,200..800;1,200..800&family=Old+Standard+TT:ital,wght@0,400;0,700;1,400&display=swap"
          rel="stylesheet"
        />
        <meta
          name="google-site-verification"
          content="mZWTxlscBqxebm-E7NiMf8dG-G2qbqKKODr0BoCUobQ"
        />
      </head>
      <body>
        <Header isLayout />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer socialMedia={socialMedia} />
      </body>
    </html>
  );
}
