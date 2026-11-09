"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/data";
import { Package } from "@/lib/types";
import { packagesService } from "@/lib/services";
import Icons from "@/components/shared/Icons";
import Link from "next/link";
import styles from "./page.module.css";

const CATEGORIES = [
  { id: "all", label: "Semua Paket" },
  { id: "portrait", label: "Portrait & Profile" },
  { id: "family", label: "Family Legacy" },
  { id: "prewedding", label: "Pre-Wedding & Love Story" },
  { id: "graduation", label: "Graduation" },
  { id: "business", label: "Commercial & Business" },
  { id: "premium", label: "Exclusive Bespoke" },
];

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPackages() {
      setLoading(true);
      try {
        const data = await packagesService.getAll({
          category: selectedCategory !== "all" ? selectedCategory : undefined,
        });
        setPackages(data);
      } catch (err) {
        console.error("Failed to load packages from API:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPackages();
  }, [selectedCategory]);

  return (
    <div className={styles.wrapper}>
      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.headerBg} />
        <div className="container">
          <div className={styles.headerContent}>
            <div className="section-eyebrow">Katalog Layanan</div>
            <h1 className={styles.headerTitle}>Paket & Investasi Sesi Foto</h1>
            <p className={styles.headerSubtitle}>
              Transparan, lengkap, dan terkurasi. Setiap sesi sudah termasuk penggunaan studio privat, tata pencahayaan profesional, dan proses color grading master.
            </p>
          </div>
        </div>
      </div>

      <div className="container section">
        {/* Category Tabs */}
        <div className={styles.categoryBar}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              id={`cat-${cat.id}`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`${styles.categoryPill} ${selectedCategory === cat.id ? styles.categoryPillActive : ""}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Consultation Banner */}
        <div className={styles.compBanner}>
          <div className={styles.compBannerLeft}>
            <div className={styles.bannerIconWrap}>
              <Icons.Sparkles size={20} color="#C9A84C" />
            </div>
            <div>
              <div className={styles.bannerTitle}>Butuh Penyesuaian Khusus atau Lokasi Outdoor?</div>
              <div className={styles.bannerSub}>Tim fotografer kami siap menyusun penawaran khusus sesuai kebutuhan produksi Anda.</div>
            </div>
          </div>
          <a href="https://wa.me/6281234567890" target="_blank" rel="noopener noreferrer" className="btn btn-gold btn-sm">
            Konsultasi Gratis via WhatsApp
          </a>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gold-primary)" }}>
            Memuat katalog paket foto...
          </div>
        ) : packages.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-text-muted)" }}>
            Tidak ada paket ditemukan untuk kategori ini.
          </div>
        ) : (
          <div className={styles.packagesGrid}>
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                id={`pkg-${pkg.id}`}
                className={`card ${styles.packageCard} ${pkg.popular ? styles.popularCard : ""}`}
              >
                {pkg.popular && (
                  <div className={styles.popularBadge}>
                    <span>REKOMENDASI UTAMA</span>
                  </div>
                )}

                {/* Header */}
                <div className={styles.pkgHeader}>
                  <div className={styles.categoryBadge}>
                    {CATEGORIES.find((c) => c.id === pkg.category)?.label || pkg.category}
                  </div>
                  <h2 className={styles.pkgName}>{pkg.name}</h2>
                </div>

                <p className={styles.pkgDesc}>{pkg.description}</p>

                {/* Meta */}
                <div className={styles.pkgMeta}>
                  <div className={styles.pkgMetaItem}>
                    <Icons.Clock size={16} color="#C9A84C" />
                    <div>
                      <div className={styles.pkgMetaLabel}>Durasi Sesi</div>
                      <div className={styles.pkgMetaValue}>{pkg.duration}</div>
                    </div>
                  </div>
                  <div className={styles.pkgMetaItem}>
                    <Icons.Camera size={16} color="#C9A84C" />
                    <div>
                      <div className={styles.pkgMetaLabel}>Foto Mentah</div>
                      <div className={styles.pkgMetaValue}>{pkg.photos} file</div>
                    </div>
                  </div>
                  <div className={styles.pkgMetaItem}>
                    <Icons.Sparkles size={16} color="#C9A84C" />
                    <div>
                      <div className={styles.pkgMetaLabel}>Retouched Master</div>
                      <div className={styles.pkgMetaValue}>{pkg.editedPhotos} file</div>
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className={styles.pkgFeatures}>
                  <div className={styles.pkgFeaturesTitle}>Fasilitas & Inklusi:</div>
                  <ul className={styles.featureList}>
                    {pkg.features?.map((f, fi) => (
                      <li key={fi} className={styles.featureItem}>
                        <Icons.Check size={14} color="#C9A84C" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price & CTA */}
                <div className={styles.pkgFooter}>
                  <div className={styles.pkgPrice}>
                    <span className={styles.pkgPriceLabel}>Total Investasi</span>
                    <span className={styles.pkgPriceAmount} style={{ color: pkg.popular ? "#C9A84C" : "var(--color-text-primary)" }}>
                      {formatCurrency(pkg.price)}
                    </span>
                  </div>
                  <Link
                    href={`/reservation?package=${pkg.id}`}
                    className={`btn ${pkg.popular ? "btn-gold" : "btn-outline"} w-full`}
                    id={`book-${pkg.id}`}
                  >
                    Pilih Paket & Tentukan Jadwal
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* FAQ Section */}
        <div className={styles.faqSection}>
          <div className="section-header">
            <div className="section-eyebrow">Tanya Jawab</div>
            <h2 className="section-title" style={{ fontSize: "1.75rem" }}>Pertanyaan Seputar Sesi Studio</h2>
          </div>
          <div className={styles.faqGrid}>
            {[
              {
                q: "Bagaimana alur pemilihan foto hasil pemotretan?",
                a: "Setelah sesi selesai, Anda akan menerima link akses galeri web privat untuk menandai dan memilih foto-foto favorit yang akan masuk ke tahap retouching profesional.",
              },
              {
                q: "Berapa lama estimasi proses color grading & retouching?",
                a: "Hasil editing master diselesaikan dalam 2 hingga 5 hari kerja tergantung jenis paket yang dipilih, dikirim dalam format JPEG full-resolution siap cetak.",
              },
              {
                q: "Apakah studio menyediakan ruang ganti & perlengkapan tata rias?",
                a: "Ya, kami menyediakan ruang ganti privat yang nyaman lengkap dengan vanity mirror, steamer pakaian, dan perlengkapan touch-up standar.",
              },
              {
                q: "Apakah diperbolehkan membawa properti atau kostum sendiri?",
                a: "Tentu saja. Anda sangat dipersilakan membawa properti berkesan pribadi, kostum wisuda, gaun pre-wedding, maupun produk promosi bisnis Anda.",
              },
            ].map((faq, i) => (
              <div key={i} className={`card ${styles.faqCard}`}>
                <h3 className={styles.faqQuestion}>{faq.q}</h3>
                <p className={styles.faqAnswer}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
