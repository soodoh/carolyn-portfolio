import SocialMediaIcon from "@/components/SocialMediaIcon";
import styles from "./footer.module.css";
import type { SocialMedia } from "@/lib/types";

const Footer = ({ socialMedia }: { socialMedia: SocialMedia[] }) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.copyright}>
        <span>Copyright © {new Date().getFullYear()} Carolyn DiLoreto</span>
        <span>Designed by Carolyn DiLoreto</span>
        <span>Developed by Paul DiLoreto</span>
      </div>
      <div className={styles.socialMedia}>
        {socialMedia.map((icon) => (
          <SocialMediaIcon key={`social-media-${icon.id}`} icon={icon} />
        ))}
      </div>
    </footer>
  );
};

export default Footer;
