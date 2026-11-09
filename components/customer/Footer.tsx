import Link from "next/link";
import { Icon } from "@iconify/react";
import { STUDIO_INFO } from "@/lib/data";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="divider-gold" style={{ margin: "0 0 1.5rem 0" }} />
      <div className="container">
        <div className={styles.footerGrid}>
          {/* Brand */}
          <div className={styles.brand}>
            <div className={styles.logo}>
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
                <circle cx="20" cy="20" r="19" stroke="#C9A84C" strokeWidth="1.5" />
                <circle cx="20" cy="20" r="13" stroke="#C9A84C" strokeWidth="0.8" opacity="0.5" />
                <path d="M20 8 L25 17 L20 14 L15 17 Z" fill="#C9A84C" opacity="0.9" />
                <path d="M32 20 L23 15 L26 20 L23 25 Z" fill="#C9A84C" opacity="0.7" />
                <path d="M20 32 L15 23 L20 26 L25 23 Z" fill="#C9A84C" opacity="0.9" />
                <path d="M8 20 L17 25 L14 20 L17 15 Z" fill="#C9A84C" opacity="0.7" />
                <circle cx="20" cy="20" r="2" fill="#C9A84C" />
              </svg>
              <div>
                <div className={styles.logoName}>LETRA</div>
                <div className={styles.logoSub}>STUDIO</div>
              </div>
            </div>
            <p className={styles.desc}>{STUDIO_INFO.description}</p>
            <div className={styles.socials}>
              <a href="#" className={styles.social} aria-label="Instagram">
                <Icon icon="skill-icons:instagram" width={20} height={20} />
              </a>
              <a href="#" className={styles.social} aria-label="WhatsApp">
                <Icon icon="logos:whatsapp-icon" width={20} height={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div className={styles.linksSection}>
            <h4 className={styles.linkTitle}>Layanan</h4>
            <ul className={styles.linkList}>
              <li><Link href="/packages">Paket Foto</Link></li>
              <li><Link href="/portfolio">Portofolio</Link></li>
              <li><Link href="/reservation">Reservasi</Link></li>
              <li><Link href="/#services">Tentang Kami</Link></li>
            </ul>
          </div>

          <div className={styles.linksSection}>
            <h4 className={styles.linkTitle}>Paket</h4>
            <ul className={styles.linkList}>
              <li><Link href="/packages">Paket Potret</Link></li>
              <li><Link href="/packages">Paket Keluarga</Link></li>
              <li><Link href="/packages">Paket Pre-Wedding</Link></li>
              <li><Link href="/packages">Paket Wisuda</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.contactSection}>
            <h4 className={styles.linkTitle}>Kontak</h4>
            <ul className={styles.contactList}>
              <li>
                <Icon icon="solar:phone-bold-duotone" width={16} height={16} />
                <span>{STUDIO_INFO.phone}</span>
              </li>
              <li>
                <Icon icon="solar:letter-bold-duotone" width={16} height={16} />
                <span>{STUDIO_INFO.email}</span>
              </li>
              <li>
                <Icon icon="solar:map-point-bold-duotone" width={16} height={16} />
                <span>{STUDIO_INFO.address}</span>
              </li>
              <li>
                <Icon icon="solar:clock-circle-bold-duotone" width={16} height={16} />
                <span>{STUDIO_INFO.workingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <div className="divider-gold" style={{ margin: "0 0 1.5rem 0" }} />
          <p>© {new Date().getFullYear()} Letra Studio. Semua hak dilindungi. Dibuat untuk mengabadikan momen terbaik Anda.</p>
        </div>
      </div>
    </footer>
  );
}
