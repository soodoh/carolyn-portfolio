import "@/components/commonStyles/globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getSocialMedia } from "@/lib/fetch-home-data";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Carolyn DiLoreto: Portfolio",
  description: "",
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
      <body>
        <Header isLayout />
        {children}
        <Footer socialMedia={socialMedia} />
      </body>
    </html>
  );
}
