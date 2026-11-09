"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { authService } from "@/lib/services";
import { User } from "@/lib/types";
import Icons from "@/components/shared/Icons";
import styles from "./Navbar.module.css";

const GUEST_NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/packages", label: "Paket & Harga" },
  { href: "/portfolio", label: "Portofolio" },
  { href: "/reservation", label: "Reservasi" },
  { href: "/reservation/status", label: "Lacak Reservasi" },
];

const LOGGED_IN_NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/portfolio", label: "Portofolio" },
  { href: "/reservation", label: "Reservasi" },
  { href: "/history", label: "Riwayat Sesi" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Edit Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    password: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateUser = () => {
      const user = authService.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        setProfileForm({
          name: user.name || "",
          phone: user.phone || "",
          password: "",
        });
      }
    };

    updateUser();

    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("auth_change", updateUser);
    window.addEventListener("storage", updateUser);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setUserDropdownOpen(false);
        setProfileModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("auth_change", updateUser);
      window.removeEventListener("storage", updateUser);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [pathname]);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setUserDropdownOpen(false);
    router.push("/");
  };

  const handleOpenEditProfile = () => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || "",
        phone: currentUser.phone || "",
        password: "",
      });
    }
    setProfileMsg(null);
    setUserDropdownOpen(false);
    setProfileModalOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      setProfileMsg({ type: "error", text: "Nama lengkap tidak boleh kosong." });
      return;
    }

    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const updated = await authService.updateProfile({
        id: currentUser?.id,
        email: currentUser?.email,
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        password: profileForm.password ? profileForm.password : undefined,
      });

      setCurrentUser(updated);
      setProfileMsg({ type: "success", text: "Profil berhasil diperbarui!" });
      setTimeout(() => {
        setProfileModalOpen(false);
        setProfileMsg(null);
      }, 1200);
    } catch (err: unknown) {
      setProfileMsg({
        type: "error",
        text: err instanceof Error ? err.message : "Gagal memperbarui profil.",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const getRoleLabel = (role?: string) => {
    if (role === "admin") return "Administrator";
    if (role === "staff") return "Staf Studio";
    return "Klien Studio";
  };

  // Select navigation links depending on auth state
  const activeNavLinks = currentUser ? LOGGED_IN_NAV_LINKS : GUEST_NAV_LINKS;

  return (
    <>
      <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
        <div className="container">
          <nav className={styles.nav}>
            {/* Logo */}
            <Link href="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <Icons.Camera size={22} color="#C9A84C" />
              </div>
              <div className={styles.logoText}>
                <span className={styles.logoName}>LETRA</span>
                <span className={styles.logoSub}>STUDIO</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <ul className={styles.navLinks}>
              {activeNavLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`${styles.navLink} ${pathname === link.href ? styles.active : ""}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* CTA / Auth Actions */}
            <div className={styles.navActions}>
              {currentUser ? (
                <div className={styles.userMenuWrapper} ref={dropdownRef}>
                  <button
                    type="button"
                    className={`${styles.userPillBtn} ${userDropdownOpen ? styles.userPillBtnActive : ""}`}
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    aria-expanded={userDropdownOpen}
                    aria-haspopup="true"
                    id="nav-user-pill"
                  >
                    <div className={styles.userAvatar}>
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                      <span className={styles.statusIndicator} />
                    </div>
                    <div className={styles.userInfoCol}>
                      <span className={styles.userName}>{currentUser.name || "Akun Saya"}</span>
                      <span className={styles.userRoleLabel}>{getRoleLabel(currentUser.role)}</span>
                    </div>
                    <span className={`${styles.chevronIcon} ${userDropdownOpen ? styles.chevronIconRotated : ""}`}>
                      <Icons.ChevronDown size={14} />
                    </span>
                  </button>

                  {userDropdownOpen && (
                    <div className={styles.dropdownMenu}>
                      <div className={styles.dropdownHeader}>
                        <div className={styles.dropdownUserName}>{currentUser.name}</div>
                        <div className={styles.dropdownUserEmail}>{currentUser.email}</div>
                        <span className={styles.dropdownRoleTag}>
                          {getRoleLabel(currentUser.role)}
                        </span>
                      </div>

                      <button
                        type="button"
                        className={styles.dropdownItem}
                        onClick={handleOpenEditProfile}
                        id="dropdown-edit-profile-btn"
                      >
                        <Icons.User size={15} color="#C9A84C" />
                        <span>Edit Profil Saya</span>
                      </button>

                      {(currentUser.role === "admin" || currentUser.role === "staff") && (
                        <Link
                          href="/admin/dashboard"
                          className={styles.dropdownItem}
                          onClick={() => setUserDropdownOpen(false)}
                        >
                          <Icons.Shield size={15} color="#C9A84C" />
                          <span>Dashboard Operasional</span>
                        </Link>
                      )}

                      <div className={styles.dropdownDivider} />

                      <button
                        type="button"
                        className={`${styles.dropdownItem} ${styles.dropdownItemLogout}`}
                        onClick={handleLogout}
                        id="nav-logout-btn"
                      >
                        <Icons.LogOut size={15} color="#F87171" />
                        <span>Keluar dari Akun</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/login" className="btn btn-ghost btn-sm" id="nav-login-btn">
                  <Icons.User size={15} style={{ marginRight: 4 }} />
                  Masuk
                </Link>
              )}

              <Link href="/reservation" id="nav-reservasi-btn" className="btn btn-gold btn-sm">
                Reservasi Sekarang
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              className={`${styles.hamburger} ${menuOpen ? styles.open : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
              id="mobile-menu-btn"
            >
              <span />
              <span />
              <span />
            </button>
          </nav>
        </div>

        {/* Mobile Menu */}
        <div className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ""}`}>
          <ul className={styles.mobileLinks}>
            {activeNavLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`${styles.mobileLink} ${pathname === link.href ? styles.active : ""}`}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {currentUser ? (
              <>
                <li>
                  <button
                    type="button"
                    className={styles.mobileLink}
                    style={{ background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}
                    onClick={() => {
                      setMenuOpen(false);
                      handleOpenEditProfile();
                    }}
                  >
                    Edit Profil ({currentUser.name})
                  </button>
                </li>
                {(currentUser.role === "admin" || currentUser.role === "staff") && (
                  <li>
                    <Link
                      href="/admin/dashboard"
                      className={styles.mobileLink}
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard Admin
                    </Link>
                  </li>
                )}
                <li style={{ marginTop: "0.5rem" }}>
                  <button
                    type="button"
                    className="btn btn-outline w-full"
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    style={{ color: "#F87171", borderColor: "rgba(248, 113, 113, 0.3)" }}
                  >
                    Keluar dari Akun
                  </button>
                </li>
              </>
            ) : (
              <li>
                <Link href="/auth/login" className={styles.mobileLink} onClick={() => setMenuOpen(false)}>
                  Masuk Akun Pelanggan
                </Link>
              </li>
            )}

            <li style={{ marginTop: "0.5rem" }}>
              <Link href="/reservation" className="btn btn-gold w-full" onClick={() => setMenuOpen(false)}>
                Reservasi Sekarang
              </Link>
            </li>
          </ul>
        </div>
      </header>

      {/* Edit Profile Modal */}
      {profileModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setProfileModalOpen(false)}>
          <div className={styles.profileModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Pengaturan & Edit Profil</h3>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setProfileModalOpen(false)}
                aria-label="Tutup modal"
              >
                ✕
              </button>
            </div>

            {profileMsg && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  fontSize: "0.825rem",
                  marginBottom: "1rem",
                  background: profileMsg.type === "success" ? "rgba(76, 175, 136, 0.15)" : "rgba(224, 85, 85, 0.15)",
                  border: `1px solid ${profileMsg.type === "success" ? "rgba(76, 175, 136, 0.4)" : "rgba(224, 85, 85, 0.4)"}`,
                  color: profileMsg.type === "success" ? "#4CAF88" : "#E05555",
                }}
              >
                {profileMsg.text}
              </div>
            )}

            <div className={styles.profileHero}>
              <div className={styles.profileAvatarLg}>
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: "#F0EDE8", fontSize: "0.95rem" }}>
                  {currentUser?.name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#8C8680", marginTop: "0.15rem" }}>
                  {currentUser?.email}
                </div>
                <span className={styles.dropdownRoleTag}>
                  {getRoleLabel(currentUser?.role)}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" htmlFor="edit-profile-name">
                  Nama Lengkap *
                </label>
                <input
                  id="edit-profile-name"
                  type="text"
                  className="form-input"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  placeholder="Masukkan nama lengkap Anda"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1rem" }}>
                <label className="form-label" htmlFor="edit-profile-phone">
                  Nomor WhatsApp / Telepon
                </label>
                <input
                  id="edit-profile-phone"
                  type="tel"
                  className="form-input"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="08xx-xxxx-xxxx"
                />
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label" htmlFor="edit-profile-password">
                  Kata Sandi Baru (Opsional)
                </label>
                <input
                  id="edit-profile-password"
                  type="password"
                  className="form-input"
                  value={profileForm.password}
                  onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                  placeholder="Biarkan kosong jika tidak ingin mengubah sandi"
                />
                <span style={{ fontSize: "0.72rem", color: "#8C8680", marginTop: "0.25rem", display: "block" }}>
                  Minimal 6 karakter jika ingin mengganti kata sandi.
                </span>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setProfileModalOpen(false)}
                  disabled={savingProfile}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-gold"
                  id="save-profile-btn"
                  disabled={savingProfile}
                >
                  {savingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
