import { containerClass } from "@/lib/utils";
import { Metadata } from "next";

// Statically generated at build time, will error if any Dynamic APIs are used
export const dynamic = "error";

export const metadata: Metadata = {
  title: "CD: Page Not Found",
  description: "The page you are looking for does not exist.",
  robots: "noindex, nofollow",
  keywords: [],
};

export default function NotFound() {
  return (
    <div className={containerClass}>
      <div className="flex flex-col items-center justify-center pt-8">
        <h1 className="m-0">404</h1>
        <h2 className="m-0">Page not found</h2>
      </div>
    </div>
  );
}
