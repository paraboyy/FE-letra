"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/lib/services";
import { User } from "@/lib/types";
import Icons from "@/components/shared/Icons";
import { Icon } from "@iconify/react";
import styles from "./AdminLayout.module.css";

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  adminOnly?: boolean;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard", icon: <Icons.TrendingUp size={18} />, label: "Dashboard Analitik" },
  { href: "/admin/reservations", icon: <Icons.Calendar size={18} />, label: "Reservasi Sesi" },
  { href: "/admin/schedule", icon: <Icons.Clock size={18} />, label: "Jadwal Roster" },
  { href: "/admin/transactions", icon: <Icons.CreditCard size={18} />, label: "Buku Kas & Transaksi" },
  { href: "/admin/customers", icon: <Icons.Users size={18} />, label: "Direktori Pelanggan" },
  { href: "/admin/packages", icon: <Icons.Package size={18} />, label: "Paket Foto & Harga", adminOnly: true },
  { href: "/admin/photographers", icon: <Icons.Camera size={18} />, label: "Staf Fotografer", adminOnly: true },
  { href: "/admin/reports", icon: <Icons.Layers size={18} />, label: "Laporan Keuangan", adminOnly: true },
];

const STAFF_NAV_ITEMS: NavItem[] = [
  { href: "/admin/dashboard", icon: <Icons.TrendingUp size={18} />, label: "Dashboard Harian" },
  { href: "/admin/reservations", icon: <Icons.Calendar size={18} />, label: "Antrean Reservasi" },
  { href: "/admin/schedule", icon: <Icons.Clock size={18} />, label: "Jadwal Studio" },
  { href: "/admin/transactions", icon: <Icons.CreditCard size={18} />, label: "Verifikasi Pembayaran" },
  { href: "/admin/customers", icon: <Icons.Users size={18} />, label: "Kontak Pelanggan" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authStatus, setAuthStatus] = useState<"checking" | "authorized" | "unauthenticated" | "forbidden">("checking");

  useEffect(() => {
    // Auto-close mobile drawer on route navigation
    setMobileOpen(false);

    // If on admin login page, handle already logged in admin/staff
    if (pathname === "/admin/login") {
      const user = authService.getCurrentUser();
      if (user && (user.role === "admin" || user.role === "staff")) {
        router.replace("/admin/dashboard");
      } else {
        setAuthStatus("authorized");
      }
      return;
    }

    // Protected Admin Routes Verification
    const token = typeof window !== "undefined" ? localStorage.getItem("letra_auth_token") : null;
    const user = authService.getCurrentUser();

    // 1. Unauthenticated: Not logged in or no token
    if (!token || !user) {
      setAuthStatus("unauthenticated");
      router.replace(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // 2. Forbidden: Logged in, but role is customer (not staff or admin)
    if (user.role !== "admin" && user.role !== "staff") {
      setCurrentUser(user);
      setAuthStatus("forbidden");
      return;
    }

    // 3. Authorized: Admin or Staff
    setCurrentUser(user);
    setAuthStatus("authorized");
  }, [pathname, router]);

  // If currently on admin login, render cleanly without sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = () => {
    authService.logout();
    router.push("/admin/login");
  };

  // 1. Loading / Redirecting state for unauthenticated or verifying visitors
  if (authStatus === "checking" || authStatus === "unauthenticated") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0D0C0B",
          color: "#C9A84C",
          fontFamily: "var(--font-sans, sans-serif)",
        }}
      >
        <div
          style={{
            width: "44px",
            height: "44px",
            border: "3px solid rgba(201, 168, 76, 0.15)",
            borderTopColor: "#C9A84C",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            marginBottom: "1.25rem",
          }}
        />
        <div style={{ fontSize: "1.1rem", fontWeight: 600, letterSpacing: "0.08em", color: "#F0EDE8" }}>
          LETRA STUDIO
        </div>
        <div style={{ fontSize: "0.85rem", color: "#8C8680", marginTop: "0.35rem" }}>
          Memeriksa otorisasi administrator...
        </div>
      </div>
    );
  }

  // 2. Forbidden state: Customer role trying to access admin workspace
  if (authStatus === "forbidden") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0D0C0B",
          padding: "1.5rem",
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: "520px",
            width: "100%",
            textAlign: "center",
            padding: "3rem 2rem",
            border: "1px solid rgba(201, 168, 76, 0.25)",
            backgroundColor: "#161513",
            borderRadius: "16px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.25rem" }}>
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                background: "rgba(224, 80, 80, 0.1)",
                border: "1px solid rgba(224, 80, 80, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#E05050",
              }}
            >
              <Icons.Shield size={34} />
            </div>
          </div>
          <h2 style={{ color: "#F0EDE8", fontSize: "1.35rem", marginBottom: "0.5rem" }}>
            Akses Ditolak — Khusus Administrator & Staf
          </h2>
          <p style={{ color: "#8C8680", fontSize: "0.875rem", lineHeight: "1.6", marginBottom: "1.75rem" }}>
            Akun Anda (<strong>{currentUser?.email}</strong>) terdaftar dengan peran <strong>Pelanggan (Customer)</strong>. Area ini hanya dapat diakses oleh Administrator dan Staf operasional Letra Studio.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/" className="btn btn-gold btn-sm">
              Kembali ke Beranda
            </Link>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={handleLogout}
            >
              Keluar & Masuk Akun Staf
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isStaff = currentUser?.role === "staff";
  const navItems = isStaff ? STAFF_NAV_ITEMS : ADMIN_NAV_ITEMS;

  // Check if staff is trying to access admin-only pages
  const adminOnlyRoutes = ["/admin/packages", "/admin/photographers", "/admin/reports"];
  const isRestrictedForStaff = isStaff && adminOnlyRoutes.some((route) => pathname.startsWith(route));

  const currentPageTitle = navItems.find((n) => pathname.startsWith(n.href))?.label || "Workspace Operasional";

  return (
    <div className={styles.layout}>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`${styles.mobileBackdrop} ${mobileOpen ? styles.mobileBackdropShow : ""}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar (Desktop Collapsible & Mobile Slide-Out Drawer) */}
      <aside
        className={`${styles.sidebar} ${collapsed ? styles.collapsed : ""} ${
          mobileOpen ? styles.sidebarMobileOpen : ""
        }`}
      >
        {/* Logo Header */}
        <div className={styles.sidebarLogo}>
          <div className={styles.logoLeft}>
            <div className={styles.logoIcon}>
              <Icons.Camera size={24} color="#C9A84C" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className={styles.logoText}>
                <span className={styles.logoName}>LETRA</span>
                <span className={styles.logoBadge}>
                  {isStaff ? "Staff Workspace" : "Admin Workspace"}
                </span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            className={styles.mobileCloseBtn}
            onClick={() => setMobileOpen(false)}
            title="Tutup Menu"
          >
            <Icons.X size={16} />
          </button>
        </div>

        {/* Navigation List */}
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              id={`nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={`${styles.navItem} ${
                pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))
                  ? styles.navItemActive
                  : ""
              }`}
              title={collapsed && !mobileOpen ? item.label : undefined}
              onClick={() => setMobileOpen(false)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {(!collapsed || mobileOpen) && (
                <span className={styles.navLabel}>
                  {item.label}
                  {item.adminOnly && (
                    <span
                      style={{
                        fontSize: "0.6rem",
                        background: "rgba(201,168,76,0.15)",
                        color: "#C9A84C",
                        padding: "0.1rem 0.35rem",
                        borderRadius: "4px",
                        marginLeft: "0.4rem",
                      }}
                    >
                      Admin
                    </span>
                  )}
                </span>
              )}
              {(!collapsed || mobileOpen) &&
                (pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href))) && (
                  <span className={styles.navDot} />
                )}
            </Link>
          ))}
        </nav>

        {/* Bottom User Info & Logout */}
        <div className={styles.sidebarBottom}>
          <div className={`${styles.adminInfo} ${collapsed && !mobileOpen ? styles.hidden : ""}`}>
            <div
              className={styles.adminAvatar}
              style={{
                background: isStaff
                  ? "linear-gradient(135deg, #5090E0, #2563EB)"
                  : "linear-gradient(135deg, #C9A84C, #9B7A2F)",
              }}
            >
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div>
              <div className={styles.adminName}>
                {currentUser?.name || (isStaff ? "Staf Studio" : "Admin Letra")}
              </div>
              <div className={styles.adminRole}>
                {isStaff ? "Staf Operasional" : "Administrator"}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={styles.logoutBtn}
            title="Keluar dari Sistem"
            id="admin-logout-btn"
          >
            <Icons.LogOut size={16} />
            {(!collapsed || mobileOpen) && <span>Keluar</span>}
          </button>
        </div>

        {/* Desktop Collapse Toggle */}
        <button
          className={styles.collapseBtn}
          onClick={() => setCollapsed(!collapsed)}
          aria-label="Toggle sidebar"
          id="sidebar-toggle"
        >
          <Icon
            icon="solar:alt-arrow-left-bold"
            width={18}
            height={18}
            style={{
              transform: collapsed ? "rotate(180deg)" : "none",
              transition: "transform 0.3s",
            }}
          />
        </button>
      </aside>

      {/* Main Content */}
      <main className={`${styles.main} ${collapsed ? styles.mainExpanded : ""}`}>
        {/* Sticky Responsive Topbar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              className={styles.mobileMenuBtn}
              onClick={() => setMobileOpen(true)}
              aria-label="Buka Menu Navigasi"
              id="mobile-menu-toggle"
            >
              <Icons.Menu size={20} />
            </button>
            <h1 className={styles.pageTitle}>{currentPageTitle}</h1>
          </div>
          <div className={styles.topbarRight}>
            <div className={styles.apiIndicator}>
              <span className={styles.liveDot} />
              <span>{isStaff ? "Staf Mode" : "Admin Mode"}</span>
            </div>
            <div
              className={styles.adminAvatarSmall}
              style={{
                background: isStaff
                  ? "linear-gradient(135deg, #5090E0, #2563EB)"
                  : "linear-gradient(135deg, #C9A84C, #9B7A2F)",
              }}
              title={currentUser?.name || "Akun Studio"}
            >
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "A"}
            </div>
          </div>
        </header>

        {/* Inner Page View */}
        <div className={styles.content}>
          {isRestrictedForStaff ? (
            <div
              className="card"
              style={{
                textAlign: "center",
                padding: "4rem 2rem",
                border: "1px dashed rgba(201,168,76,0.3)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                <Icons.Shield size={44} color="#C9A84C" />
              </div>
              <h2 style={{ color: "#F0EDE8", fontSize: "1.3rem", marginBottom: "0.5rem" }}>
                Akses Terbatas untuk Staf
              </h2>
              <p
                style={{
                  color: "#8C8680",
                  maxWidth: "480px",
                  margin: "0 auto 1.5rem",
                  fontSize: "0.875rem",
                }}
              >
                Halaman ini memuat pengaturan master sistem atau laporan keuangan studio yang hanya
                dapat dikelola oleh akun Administrator.
              </p>
              <Link href="/admin/dashboard" className="btn btn-gold btn-sm">
                Kembali ke Dashboard Harian
              </Link>
            </div>
          ) : (
            children
          )}
        </div>
      </main>
    </div>
  );
}
