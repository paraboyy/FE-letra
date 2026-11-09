"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services";
import Icons from "@/components/shared/Icons";
import styles from "./page.module.css";
import Link from "next/link";

export default function CustomerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      if (user.role === "admin" || user.role === "staff") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/history");
      }
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      await authService.login({
        email,
        password,
        role: "customer",
      });
      router.push("/history");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal masuk. Periksa email dan kata sandi Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.bg}>
        <img src="/images/hero.jpg" alt="Letra Studio" />
        <div className={styles.bgOverlay} />
      </div>

      <div className={styles.card}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className={styles.logoBadge}>
            <Icons.Camera size={26} color="#C9A84C" />
          </div>
          <div className={styles.brandTitle}>LETRA STUDIO</div>
          <div className={styles.brandSub}>PORTAL PELANGGAN</div>
          <h1 className={styles.pageTitle}>Masuk Akun Pelanggan</h1>
          <p className={styles.pageSubtitle}>
            Kelola reservasi sesi foto Anda dan akses riwayat pemesanan studio.
          </p>
        </div>

        {errorMsg && (
          <div className={styles.errorAlert}>
            <Icons.AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="auth-email">
              Alamat Email
            </label>
            <div className={styles.inputContainer}>
              <span className={styles.inputIcon}>
                <Icons.Mail size={16} />
              </span>
              <input
                id="auth-email"
                type="email"
                className={styles.input}
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="auth-password">
              Kata Sandi
            </label>
            <div className={styles.inputContainer}>
              <span className={styles.inputIcon}>
                <Icons.Lock size={16} />
              </span>
              <input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                className={styles.input}
                placeholder="Masukkan kata sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPassword ? <Icons.EyeOff size={16} color="#C9A84C" /> : <Icons.Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            id="customer-login-btn"
            disabled={loading}
          >
            {loading ? "Memverifikasi Kredensial..." : "Masuk ke Akun Saya →"}
          </button>
        </form>

        <div className={styles.footerActions}>
          <div className={styles.registerPrompt}>
            Belum memiliki akun?{" "}
            <Link href="/auth/register" className={styles.goldLink}>
              Daftar Sekarang
            </Link>
          </div>
          <div className={styles.backHomeLink}>
            <Link href="/">← Kembali ke Beranda Studio</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
