import InstagramIcon from "@/components/icons/InstagramIcon";
import LinkedInIcon from "@/components/icons/LinkedInIcon";
import Link from "next/link";
import type { SocialMedia } from "@/lib/types";

const SocialMedia = ({ icon }: { icon: SocialMedia }) => {
  return (
    <Link
      className="flex items-center justify-center rounded-full w-10 h-10 p-2 mx-1 no-underline text-center transition-colors duration-[250ms] ease-in-out hover:bg-dark/25"
      aria-label={`View social media: ${icon.title}`}
      href={icon.link}
    >
      {icon.title === "linkedin" && (
        <LinkedInIcon className="fill-dark w-full h-full" />
      )}
      {icon.title === "instagram" && (
        <InstagramIcon className="fill-dark w-full h-full" />
      )}
    </Link>
  );
};

export default SocialMedia;
