"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services";
import Icons from "@/components/shared/Icons";
import styles from "./page.module.css";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user && (user.role === "admin" || user.role === "staff")) {
      router.replace("/admin/dashboard");
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
        role: "admin",
      });
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Akses ditolak. Periksa kredensial staf Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.backdrop} />

      <div className={styles.loginCard}>
        {/* Security / System Header */}
        <div className={styles.header}>
          <div className={styles.logoBadge}>
            <Icons.Shield size={26} color="#C9A84C" />
          </div>
          <div className={styles.brandTitle}>LETRA STUDIO</div>
          <div className={styles.portalBadge}>PORTAL ADMINISTRATOR & STAF</div>
          <p className={styles.subtitle}>
            Area terproteksi untuk pengelolaan operasional reservasi, jadwal fotografer, transaksi, dan laporan analitik.
          </p>
        </div>

        {errorMsg && (
          <div className={styles.alertError}>
            <Icons.AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="admin-email">
              Email Administrator / Staf
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <Icons.Mail size={16} />
              </span>
              <input
                id="admin-email"
                type="email"
                required
                placeholder="nama@letrastudio.id"
                className={styles.inputWithIcon}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="admin-password">
              Kata Sandi
            </label>
            <div className={styles.inputWrapper}>
              <span className={styles.inputIcon}>
                <Icons.Lock size={16} />
              </span>
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                required
                placeholder="Masukkan kata sandi akun"
                className={styles.inputWithIcon}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            id="admin-submit-btn"
            disabled={loading}
          >
            {loading ? "Mengotentikasi Sesi..." : "Masuk ke Dashboard Operasional →"}
          </button>
        </form>
      </div>
    </div>
  );
}
