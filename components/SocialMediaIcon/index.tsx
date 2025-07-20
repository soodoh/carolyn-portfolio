import InstagramIcon from "@/components/icons/InstagramIcon";
import LinkedInIcon from "@/components/icons/LinkedInIcon";
import Link from "next/link";
import styles from "./socialMedia.module.css";
import type { SocialMedia } from "@/lib/types";

const SocialMedia = ({ icon }: { icon: SocialMedia }) => {
  return (
    <Link
      className={styles.link}
      aria-label={`View social media: ${icon.title}`}
      href={icon.link}
    >
      {icon.title === "linkedin" && <LinkedInIcon className={styles.icon} />}
      {icon.title === "instagram" && <InstagramIcon className={styles.icon} />}
    </Link>
  );
};

export default SocialMedia;
