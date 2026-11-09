"use client";

import React, { useEffect, useState } from "react";
import { Photographer, PhotographerPortfolioItem } from "@/lib/types";
import Icons from "@/components/shared/Icons";
import styles from "./PhotographerDetailModal.module.css";

interface PhotographerDetailModalProps {
  photographer: Photographer | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectPhotographer: (id: string) => void;
  isSelected: boolean;
}

// Fallback portfolio items based on specialty if not directly attached
const FALLBACK_PORTFOLIO: Record<string, PhotographerPortfolioItem[]> = {
  "PHO-001": [
    {
      id: 101,
      title: "Executive Fine Art Portraiture",
      category: "Portrait",
      image: "/images/portfolio-portrait.jpg",
      specs: "Sony A7R V · 85mm f/1.4 GM · Octabox 120cm",
      description: "Konsep potret personal berkelas editorial dengan gradasi bayangan lembut dan kontras premium.",
    },
    {
      id: 102,
      title: "Reza & Dea — The Grand Ballroom",
      category: "Pre-Wedding",
      image: "/images/portfolio-wedding.jpg",
      specs: "Canon R5 · 50mm f/1.2L · Profoto B10X",
      description: "Dokumentasi romansa pranikah mewah dengan komposisi arsitektural dan tata cahaya dramatis.",
    },
    {
      id: 103,
      title: "Maya Sari — Academic Excellence",
      category: "Wisuda",
      image: "/images/portfolio-portrait.jpg",
      specs: "Canon R5 · 85mm f/1.2L · Beauty Dish 70cm",
      description: "Potret wisuda sarjana dengan aksen lighting berkarakter dan warna kulit natural bercahaya.",
    },
  ],
  "PHO-002": [
    {
      id: 201,
      title: "Andi & Mia — Monochromatic Romance",
      category: "Pre-Wedding",
      image: "/images/portfolio-wedding.jpg",
      specs: "Leica SL2 · 50mm Summilux · Continuous Rim Light",
      description: "Eksplorasi emosi hitam-putih abadi dengan penekanan pada siluet dan tatapan mata mendalam.",
    },
    {
      id: 202,
      title: "The Santoso Family Legacy",
      category: "Family",
      image: "/images/portfolio-family.jpg",
      specs: "Nikon Z8 · 35mm f/1.8S · Natural Warm Daylight",
      description: "Momen kehangatan generasi keluarga dalam tata ruang studio beraksen kayu minimalis.",
    },
    {
      id: 203,
      title: "Reza & Dea — Romantic Stroll",
      category: "Pre-Wedding",
      image: "/images/portfolio-wedding.jpg",
      specs: "Canon R5 · 50mm f/1.2L · Profoto B10X",
      description: "Karakter warna hangat bernuansa film analog klasik dengan komposisi visual seimbang.",
    },
  ],
  "PHO-003": [
    {
      id: 301,
      title: "Creative Leadership & Executive Team",
      category: "Commercial",
      image: "/images/portfolio-family.jpg",
      specs: "Sony A7 IV · 24-70mm f/2.8 GM · Grid Spot",
      description: "Portret profil tim pimpinan korporasi dengan aura kepemimpinan modern dan percaya diri.",
    },
    {
      id: 302,
      title: "Corporate Executive Profile",
      category: "Corporate",
      image: "/images/portfolio-portrait.jpg",
      specs: "Nikon Z8 · 85mm f/1.8 S · Clamshell Lighting Setup",
      description: "Headshot formal berdefinisi tinggi untuk profil media eksekutif dan materi penjenamaan bisnis.",
    },
    {
      id: 303,
      title: "Academic Milestone Keepsake",
      category: "Wisuda",
      image: "/images/portfolio-portrait.jpg",
      specs: "Canon R5 · 85mm f/1.2L · Beauty Dish 70cm",
      description: "Dokumentasi kebanggaan kelulusan wisuda berlatar studio formal bernuansa kemewahan tenang.",
    },
  ],
};

export default function PhotographerDetailModal({
  photographer,
  isOpen,
  onClose,
  onSelectPhotographer,
  isSelected,
}: PhotographerDetailModalProps) {
  const [activeLightbox, setActiveLightbox] = useState<PhotographerPortfolioItem | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (activeLightbox) {
          setActiveLightbox(null);
        } else if (isOpen) {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, activeLightbox, onClose]);

  if (!isOpen || !photographer) return null;

  const portfolioList: PhotographerPortfolioItem[] =
    photographer.portfolio && photographer.portfolio.length > 0
      ? photographer.portfolio
      : FALLBACK_PORTFOLIO[photographer.id] || [
          {
            id: 1,
            title: `${photographer.name} Signature Shot`,
            category: photographer.specialty[0] || "Studio",
            image: photographer.photo || "/images/portfolio-portrait.jpg",
            specs: "Profoto Studio Setup · Master Retouched",
            description: "Karya eksklusif yang dikerjakan dengan standar editorial seni potret Letra Studio.",
          },
        ];

  const defaultBio =
    photographer.bio ||
    `Fotografer profesional berdedikasi di Letra Studio dengan pengalaman ${photographer.experience}. Berfokus pada penataan pencahayaan presisi tinggi, komposisi estetis, serta arahan kenyamanan klien guna menghasilkan karya dokumentasi visual yang berkesan dan tak lekang oleh waktu.`;

  const defaultGear =
    photographer.gear && photographer.gear.length > 0
      ? photographer.gear
      : [
          "Kamera Full-Frame High Resolution",
          "Prime Lenses f/1.2 & f/1.4",
          "Profoto B10X High-Speed Sync",
          "Octabox 120cm Soft Diffuser",
        ];

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose}>
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="photographer-detail-title"
        >
          {/* Header */}
          <div className={styles.modalHeader}>
            <div className={styles.headerMain}>
              <div className={styles.avatarWrapper}>
                {photographer.photo ? (
                  <img
                    src={photographer.photo}
                    alt={photographer.name}
                    className={styles.avatarImg}
                  />
                ) : (
                  <div className={styles.avatarFallback}>
                    {photographer.name.charAt(0)}
                  </div>
                )}
                <span className={styles.onlineBadge} title="Fotografer Aktif" />
              </div>

              <div className={styles.headerInfo}>
                <div className={styles.titleRow}>
                  <h2 id="photographer-detail-title" className={styles.name}>
                    {photographer.name}
                  </h2>
                  <span className={styles.roleBadge}>
                    {photographer.roleTitle || "Fotografer Studio"}
                  </span>
                </div>

                <div className={styles.statsRow}>
                  <div className={styles.statItem}>
                    <span className={styles.statStar}>★ {photographer.rating || 4.9}</span>
                  </div>
                  <span className={styles.statDot}>·</span>
                  <div className={styles.statItem}>
                    <Icons.Camera size={13} color="#C9A84C" />
                    <span>{photographer.totalSessions || 100}+ Sesi Sukses</span>
                  </div>
                  <span className={styles.statDot}>·</span>
                  <div className={styles.statItem}>
                    <Icons.Clock size={13} color="#A39E93" />
                    <span>Pengalaman {photographer.experience}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className={styles.closeBtn}
              onClick={onClose}
              aria-label="Tutup jendela detail"
            >
              <Icons.X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className={styles.modalBody}>
            {/* Bio Callout */}
            <div className={styles.bioBox}>
              <span className={styles.bioQuoteIcon}>Filosofi</span>
              <p className={styles.bioText}>"{defaultBio}"</p>
            </div>

            {/* Specialties */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeading}>
                <span>Konsep Foto</span>
              </div>
              <div className={styles.pillsList}>
                {photographer.specialty.map((spec) => (
                  <span key={spec} className={styles.specialtyTag}>
                    {spec}
                  </span>
                ))}
              </div>
            </div>

            {/* Equipment / Gear */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeading}>
                <Icons.Camera size={15} color="#C9A84C" />
                <span>Peralatan Studio & Kamera</span>
              </div>
              <div className={styles.pillsList}>
                {defaultGear.map((item, idx) => (
                  <span key={idx} className={styles.gearTag}>
                    <span>{item}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Schedule Days */}
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeading}>
                <Icons.Calendar size={15} color="#C9A84C" />
                <span>Jadwal Hari Kerja di Studio</span>
              </div>
              <div className={styles.pillsList}>
                {photographer.schedule && photographer.schedule.length > 0 ? (
                  photographer.schedule.map((day) => (
                    <span key={day} className={styles.dayBadge}>
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: "#10B981",
                        }}
                      />
                      <span>{day}</span>
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: "0.8rem", color: "#8C8680" }}>
                    Tersedia setiap hari kerja studio
                  </span>
                )}
              </div>
            </div>

            {/* Portfolio Showcase */}
            <div className={styles.portfolioSection}>
              <div className={styles.portfolioHeader}>
                <div className={styles.portfolioTitle}>
                  <Icons.Eye size={17} color="#C9A84C" />
                  <span>Portofolio & Karya Terpilih</span>
                </div>
                <span className={styles.portfolioSubtitle}>
                  Klik foto untuk pratinjau detail
                </span>
              </div>

              <div className={styles.portfolioGrid}>
                {portfolioList.map((item) => (
                  <div
                    key={item.id}
                    className={styles.portfolioCard}
                    onClick={() => setActiveLightbox(item)}
                    title={`Klik untuk melihat detail foto ${item.title}`}
                  >
                    <div className={styles.portfolioImageWrap}>
                      <img
                        src={item.image}
                        alt={item.title}
                        className={styles.portfolioImg}
                        loading="lazy"
                      />
                      <span className={styles.portfolioCategoryTag}>
                        {item.category}
                      </span>
                      <div className={styles.portfolioHoverPrompt}>
                        <Icons.Eye size={16} />
                        <span>Pratinjau</span>
                      </div>
                    </div>
                    <div className={styles.portfolioMeta}>
                      <div className={styles.portfolioWorkTitle}>{item.title}</div>
                      {item.specs && (
                        <div className={styles.portfolioSpecs}>
                          <Icons.Camera size={11} color="#C9A84C" />
                          <span>{item.specs}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.modalFooter}>
            <div className={styles.availabilityNotice}>
              <Icons.CheckCircle size={15} color="#10B981" />
              <span>Tersedia untuk Sesi Studio</span>
            </div>

            <div className={styles.footerActions}>
              <button type="button" className={styles.btnCancel} onClick={onClose}>
                Tutup
              </button>
              {isSelected ? (
                <div className={styles.btnAlreadySelected}>
                  <Icons.Check size={15} />
                  <span>Fotografer Terpilih</span>
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.btnSelect}
                  onClick={() => {
                    onSelectPhotographer(photographer.id);
                    onClose();
                  }}
                >
                  <Icons.Check size={16} />
                  <span>Pilih Fotografer Ini</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeLightbox && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setActiveLightbox(null)}
        >
          <div
            className={styles.lightboxBox}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.lightboxClose}
              onClick={() => setActiveLightbox(null)}
              title="Tutup pratinjau foto"
            >
              <Icons.X size={20} />
            </button>
            <img
              src={activeLightbox.image}
              alt={activeLightbox.title}
              className={styles.lightboxImage}
            />
            <div className={styles.lightboxCaption}>
              <div className={styles.lightboxTitle}>{activeLightbox.title}</div>
              {activeLightbox.specs && (
                <div className={styles.lightboxSpecs}>
                  {activeLightbox.specs}
                </div>
              )}
              {activeLightbox.description && (
                <p
                  style={{
                    fontSize: "0.85rem",
                    color: "#A39E93",
                    marginTop: "0.4rem",
                    maxWidth: "600px",
                  }}
                >
                  {activeLightbox.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
