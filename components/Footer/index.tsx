import SocialMediaIcon from "@/components/SocialMediaIcon";
import type { SocialMedia } from "@/lib/types";

const Footer = ({ socialMedia }: { socialMedia: SocialMedia[] }) => {
  return (
    <footer className="flex justify-between px-(--spacing-padding) py-4 max-md:flex-col max-md:items-center">
      <div className="flex flex-col justify-center text-xs leading-5 max-md:items-center">
        <span>Copyright © {new Date().getFullYear()} Carolyn DiLoreto</span>
        <span>Designed by Carolyn DiLoreto</span>
        <span>Developed by Paul DiLoreto</span>
      </div>
      <div className="flex items-center justify-center max-md:mt-4">
        {socialMedia.map((icon) => (
          <SocialMediaIcon key={`social-media-${icon.id}`} icon={icon} />
        ))}
      </div>
    </footer>
  );
};

export default Footer;
