"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services";
import Icons from "@/components/shared/Icons";
import styles from "../login/page.module.css";
import Link from "next/link";

export default function CustomerRegisterPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password.length < 6) {
      setErrorMsg("Kata sandi harus terdiri dari minimal 6 karakter.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setErrorMsg("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      await authService.register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      router.push("/history");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Pendaftaran gagal. Silakan coba lagi.");
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

      <div className={styles.card} style={{ maxWidth: "460px" }}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <div className={styles.logoBadge}>
            <Icons.Camera size={26} color="#C9A84C" />
          </div>
          <div className={styles.brandTitle}>LETRA STUDIO</div>
          <div className={styles.brandSub}>REGISTRASI PELANGGAN</div>
          <h1 className={styles.pageTitle}>Buat Akun Pelanggan</h1>
          <p className={styles.pageSubtitle}>
            Daftarkan diri Anda untuk kemudahan reservasi dan akses eksklusif hasil foto.
          </p>
        </div>

        {errorMsg && (
          <div className={styles.errorAlert}>
            <Icons.AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form className={styles.form} onSubmit={handleRegister}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="reg-name">
              Nama Lengkap
            </label>
            <div className={styles.inputContainer}>
              <span className={styles.inputIcon}>
                <Icons.User size={16} />
              </span>
              <input
                id="reg-name"
                type="text"
                className={styles.input}
                placeholder="Contoh: Maya Sari"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                autoComplete="name"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="reg-email">
              Alamat Email
            </label>
            <div className={styles.inputContainer}>
              <span className={styles.inputIcon}>
                <Icons.Mail size={16} />
              </span>
              <input
                id="reg-email"
                type="email"
                className={styles.input}
                placeholder="nama@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="reg-phone">
              Nomor WhatsApp / Telepon
            </label>
            <div className={styles.inputContainer}>
              <span className={styles.inputIcon}>
                <Icons.Phone size={16} />
              </span>
              <input
                id="reg-phone"
                type="tel"
                className={styles.input}
                placeholder="0812-3456-7890"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
                autoComplete="tel"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="reg-password">
              Kata Sandi <span style={{ fontSize: "0.72rem", color: "#7E7873" }}>(Minimal 6 karakter)</span>
            </label>
            <div className={styles.inputContainer}>
              <span className={styles.inputIcon}>
                <Icons.Lock size={16} />
              </span>
              <input
                id="reg-password"
                type={showPassword ? "text" : "password"}
                className={styles.input}
                placeholder="Buat kata sandi akun"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="new-password"
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

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="reg-confirm-password">
              Ulangi Kata Sandi
            </label>
            <div className={styles.inputContainer}>
              <span className={styles.inputIcon}>
                <Icons.Lock size={16} />
              </span>
              <input
                id="reg-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                className={styles.input}
                placeholder="Ketik ulang kata sandi"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                title={showConfirmPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showConfirmPassword ? <Icons.EyeOff size={16} color="#C9A84C" /> : <Icons.Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            id="register-btn"
            disabled={loading}
          >
            {loading ? "Mendaftarkan Akun..." : "Daftar Akun Pelanggan →"}
          </button>
        </form>

        <div className={styles.footerActions}>
          <div className={styles.registerPrompt}>
            Sudah memiliki akun terdaftar?{" "}
            <Link href="/auth/login" className={styles.goldLink}>
              Masuk di Sini
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
