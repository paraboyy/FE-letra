"use client";

import { useEffect, useState, useRef } from "react";
import { studioService, PortfolioItem } from "@/lib/services";
import Icons from "@/components/shared/Icons";
import Link from "next/link";
import styles from "./page.module.css";

// 3D Background Particle & Geometric Wireframe Engine
function Interactive3DBackground({ enabled }: { enabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, isHovered: false, clickBurst: 0 });
  const scrollRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX - width / 2;
      mouseRef.current.targetY = e.clientY - height / 2;
      mouseRef.current.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.isHovered = false;
    };

    const handleClick = () => {
      mouseRef.current.clickBurst = 1.0;
    };

    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("click", handleClick);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initialize 3D Floating Particles (Golden Dust & Bokeh)
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: (Math.random() - 0.5) * width * 1.5,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * 800 + 50,
      radius: Math.random() * 4 + 1.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      vz: (Math.random() - 0.5) * 0.5,
      alpha: Math.random() * 0.45 + 0.15,
      color: Math.random() > 0.3 ? "201, 168, 76" : "232, 201, 122",
    }));

    // 3D Wireframe Prisms (Camera Lens Prisms & Crystals)
    const createIcosahedronVertices = () => {
      const phi = (1 + Math.sqrt(5)) / 2;
      const a = 1;
      const b = 1 / phi;
      return [
        [-a, 0, b], [a, 0, b], [-a, 0, -b], [a, 0, -b],
        [0, b, a], [0, b, -a], [0, -b, a], [0, -b, -a],
        [b, a, 0], [-b, a, 0], [b, -a, 0], [-b, -a, 0],
      ];
    };

    const icosaVertices = createIcosahedronVertices();
    const prisms = [
      { x: -width * 0.35, y: -height * 0.2, z: 400, size: 70, rx: 0, ry: 0, rz: 0, speedX: 0.003, speedY: 0.005 },
      { x: width * 0.35, y: height * 0.15, z: 500, size: 90, rx: 1, ry: 1, rz: 0, speedX: -0.002, speedY: 0.004 },
      { x: -width * 0.2, y: height * 0.45, z: 350, size: 60, rx: 2, ry: 0, rz: 1, speedX: 0.004, speedY: -0.003 },
      { x: width * 0.25, y: -height * 0.35, z: 600, size: 80, rx: 0.5, ry: 2, rz: 0.5, speedX: -0.003, speedY: -0.002 },
    ];

    const fov = 350;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse lerp
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.04;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.04;

      const mouseNormX = mouseRef.current.x / (width / 2);
      const mouseNormY = mouseRef.current.y / (height / 2);
      const scrollOffset = scrollRef.current * 0.15;

      // Click burst decay
      if (mouseRef.current.clickBurst > 0) {
        mouseRef.current.clickBurst *= 0.94;
      }

      // 1. Draw 3D Rotating Prisms (Optical Crystals)
      prisms.forEach((prism) => {
        prism.rx += prism.speedX + mouseNormY * 0.002;
        prism.ry += prism.speedY + mouseNormX * 0.002;

        const effectiveY = prism.y - scrollOffset * 0.5;
        const projectedVertices: { x: number; y: number; z: number }[] = [];

        icosaVertices.forEach(([vx, vy, vz]) => {
          let x = vx * prism.size;
          let y = vy * prism.size;
          let z = vz * prism.size;

          const cosX = Math.cos(prism.rx);
          const sinX = Math.sin(prism.rx);
          const y1 = y * cosX - z * sinX;
          const z1 = y * sinX + z * cosX;

          const cosY = Math.cos(prism.ry);
          const sinY = Math.sin(prism.ry);
          const x2 = x * cosY + z1 * sinY;
          const z2 = -x * sinY + z1 * cosY;

          const wx = x2 + prism.x - mouseRef.current.x * 0.08;
          const wy = y1 + effectiveY - mouseRef.current.y * 0.08;
          const wz = z2 + prism.z;

          const scale = fov / (fov + wz);
          const px = wx * scale + width / 2;
          const py = wy * scale + height / 2;

          projectedVertices.push({ x: px, y: py, z: wz });
        });

        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(201, 168, 76, 0.12)";

        for (let i = 0; i < projectedVertices.length; i++) {
          for (let j = i + 1; j < projectedVertices.length; j++) {
            const p1 = projectedVertices[i];
            const p2 = projectedVertices[j];
            const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

            if (dist < prism.size * 1.6) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      });

      // 2. Draw 3D Floating Particles & Bokeh Orbs
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.z < 50) p.z = 850;
        if (p.z > 850) p.z = 50;

        const effectiveY = p.y - scrollOffset * 0.8;
        const scale = fov / (fov + p.z);
        const screenX = (p.x - mouseRef.current.x * 0.12) * scale + width / 2;
        const screenY = (effectiveY - mouseRef.current.y * 0.12) * scale + height / 2;
        const renderedRadius = Math.max(1, p.radius * scale * (1 + mouseRef.current.clickBurst * 1.5));

        const dx = screenX - (mouseRef.current.x + width / 2);
        const dy = screenY - (mouseRef.current.y + height / 2);
        const distToMouse = Math.hypot(dx, dy);

        let highlightAlpha = p.alpha;
        if (distToMouse < 180) {
          highlightAlpha = Math.min(0.85, p.alpha + (1 - distToMouse / 180) * 0.35);
          p.x += (dx / distToMouse) * 1.2;
          p.y += (dy / distToMouse) * 1.2;
        }

        const grad = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, renderedRadius * 2.5);
        grad.addColorStop(0, `rgba(${p.color}, ${highlightAlpha})`);
        grad.addColorStop(0.5, `rgba(${p.color}, ${highlightAlpha * 0.35})`);
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(screenX, screenY, renderedRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Draw Connecting Constellation Lines
      ctx.lineWidth = 0.75;
      for (let i = 0; i < particles.length; i += 2) {
        for (let j = i + 1; j < particles.length; j += 2) {
          const p1 = particles[i];
          const p2 = particles[j];

          const s1 = fov / (fov + p1.z);
          const x1 = (p1.x - mouseRef.current.x * 0.12) * s1 + width / 2;
          const y1 = (p1.y - scrollOffset * 0.8 - mouseRef.current.y * 0.12) * s1 + height / 2;

          const s2 = fov / (fov + p2.z);
          const x2 = (p2.x - mouseRef.current.x * 0.12) * s2 + width / 2;
          const y2 = (p2.y - scrollOffset * 0.8 - mouseRef.current.y * 0.12) * s2 + height / 2;

          const dist = Math.hypot(x1 - x2, y1 - y2);
          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.15;
            ctx.strokeStyle = `rgba(201, 168, 76, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("click", handleClick);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className={styles.bgCanvasContainer}>
      <canvas ref={canvasRef} className={styles.bgCanvas} />
    </div>
  );
}

// 3D Tilt Card Component
function TiltCard({ item, onOpen }: { item: PortfolioItem; onOpen: (item: PortfolioItem) => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState("");
  const [shineStyle, setShineStyle] = useState("");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTransformStyle(`perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);
    setShineStyle(`radial-gradient(circle at ${x}px ${y}px, rgba(201, 168, 76, 0.25) 0%, transparent 60%)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setShineStyle("");
  };

  return (
    <div className={styles.tiltCardWrap}>
      <div
        ref={cardRef}
        className={styles.tiltCard}
        style={{ transform: transformStyle }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={() => onOpen(item)}
      >
        <div className={styles.cardShine} style={{ background: shineStyle }} />
        <div className={styles.imageWrap}>
          <img src={item.src} alt={item.title} loading="lazy" />
          <div className={styles.categoryBadge}>{item.category}</div>
          <div className={styles.expandPrompt} title="Buka Detail Foto">
            <Icons.Maximize2 size={16} />
          </div>
        </div>
        <div className={styles.captionArea}>
          <h3 className={styles.itemTitle}>{item.title}</h3>
          <div className={styles.clientLabel}>{item.client}</div>
          <div className={styles.specsRow}>
            <Icons.Camera size={13} color="#C9A84C" />
            <span>{item.specs}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// 3D CoverFlow Carousel Mode
function CoverFlowCarousel({
  items,
  onOpen,
}: {
  items: PortfolioItem[];
  onOpen: (item: PortfolioItem) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (items.length === 0) return null;

  const next = () => setActiveIndex((prev) => (prev + 1) % items.length);
  const prev = () => setActiveIndex((prev) => (prev - 1 + items.length) % items.length);

  return (
    <div>
      <div className={styles.coverflowContainer}>
        <div className={styles.coverflowStage}>
          {items.map((item, index) => {
            const offset = index - activeIndex;
            const isCenter = offset === 0;

            let transform = "";
            let opacity = 1;
            let zIndex = 10 - Math.abs(offset);

            if (isCenter) {
              transform = "translateX(0px) translateZ(100px) rotateY(0deg) scale(1.1)";
            } else if (offset > 0) {
              transform = `translateX(${offset * 140}px) translateZ(-${offset * 80}px) rotateY(-35deg) scale(${Math.max(0.7, 1 - offset * 0.15)})`;
              opacity = Math.max(0.2, 1 - offset * 0.35);
            } else {
              transform = `translateX(${offset * 140}px) translateZ(${offset * 80}px) rotateY(35deg) scale(${Math.max(0.7, 1 + offset * 0.15)})`;
              opacity = Math.max(0.2, 1 + offset * 0.35);
            }

            if (Math.abs(offset) > 3) {
              opacity = 0;
            }

            return (
              <div
                key={item.id}
                className={styles.coverflowItem}
                style={{
                  transform,
                  opacity,
                  zIndex,
                }}
                onClick={() => {
                  if (isCenter) onOpen(item);
                  else setActiveIndex(index);
                }}
              >
                <img src={item.src} alt={item.title} />
                {isCenter && (
                  <div className={styles.coverflowCaption}>
                    <h4 style={{ fontSize: "1.1rem", fontWeight: 600 }}>{item.title}</h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-gold-light)" }}>{item.category} · {item.client}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.coverflowNav}>
        <button type="button" className={styles.coverflowNavBtn} onClick={prev} title="Foto Sebelumnya">
          <Icons.ChevronLeft size={20} />
        </button>
        <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
          {activeIndex + 1} dari {items.length} Karya
        </span>
        <button type="button" className={styles.coverflowNavBtn} onClick={next} title="Foto Berikutnya">
          <Icons.ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}

const CATEGORIES = ["Semua", "Pre-Wedding", "Portrait", "Family", "Wisuda", "Commercial"];

export default function PortfolioPage() {
  const [selectedCat, setSelectedCat] = useState("Semua");
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  // 3D Background toggle & cursor tracking
  const [bg3dEnabled, setBg3dEnabled] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: -500, y: -500 });

  // View Mode: 'grid' | 'coverflow'
  const [viewMode, setViewMode] = useState<"grid" | "coverflow">("grid");

  // Lightbox Modal state
  const [activeItem, setActiveItem] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    async function loadPortfolio() {
      setLoading(true);
      try {
        const data = await studioService.getPortfolio();
        setItems(data);
      } catch (err) {
        console.error("Failed to load portfolio items from backend API:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPortfolio();
  }, []);

  const handleGlobalMouseMove = (e: React.MouseEvent) => {
    setCursorPos({ x: e.clientX, y: e.clientY });
  };

  const filteredItems =
    selectedCat === "Semua"
      ? items
      : items.filter((item) => item.category.toLowerCase() === selectedCat.toLowerCase());

  const handleNextLightbox = () => {
    if (!activeItem) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === activeItem.id);
    const nextIndex = (currentIndex + 1) % filteredItems.length;
    setActiveItem(filteredItems[nextIndex]);
  };

  const handlePrevLightbox = () => {
    if (!activeItem) return;
    const currentIndex = filteredItems.findIndex((i) => i.id === activeItem.id);
    const prevIndex = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
    setActiveItem(filteredItems[prevIndex]);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!activeItem) return;
      if (e.key === "Escape") setActiveItem(null);
      if (e.key === "ArrowRight") handleNextLightbox();
      if (e.key === "ArrowLeft") handlePrevLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeItem, filteredItems]);

  return (
    <div className={styles.wrapper} onMouseMove={handleGlobalMouseMove}>
      {/* 3D Interactive Floating Background */}
      <Interactive3DBackground enabled={bg3dEnabled} />

      {/* Dynamic Cursor Spotlight Ambient Glow */}
      <div
        className={styles.bgCursorGlow}
        style={{
          left: cursorPos.x,
          top: cursorPos.y,
          opacity: bg3dEnabled ? 1 : 0,
        }}
      />

      {/* 3D Ambient Control Toggle */}
      <button
        type="button"
        className={styles.bgModeToggle}
        onClick={() => setBg3dEnabled((prev) => !prev)}
        title="Aktifkan / Nonaktifkan 3D Ambient Background"
      >
        <Icons.Sparkles size={14} color="#C9A84C" />
        <span>3D Ambient: {bg3dEnabled ? "Aktif" : "Mati"}</span>
      </button>

      <div className={styles.contentWrap}>
        {/* Hero Header */}
        <div className={styles.header}>
          <div className={styles.headerBg} />
          <div className="container">
            <div className={styles.headerContent}>
              <div className="section-eyebrow">Galeri & Lookbook Visual</div>
              <h1 className={styles.headerTitle}>Lookbook & Portofolio Karya</h1>
              <p className={styles.headerSubtitle}>
                Koleksi karya fotografi pilihan Letra Studio dengan fokus pada kedalaman komposisi, estetika pencahayaan, dan keaslian ekspresi.
              </p>
            </div>
          </div>
        </div>

        <div className="container section">
          {/* GALLERY FILTER & VIEW MODE CONTROLS */}
          <div className={styles.galleryControlsRow}>
            <div className={styles.filterPills}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  id={`filter-${cat}`}
                  className={`${styles.filterPill} ${cat === selectedCat ? styles.filterPillActive : ""}`}
                  onClick={() => setSelectedCat(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className={styles.viewModeSwitcher}>
              <button
                type="button"
                className={`${styles.viewModeBtn} ${viewMode === "grid" ? styles.viewModeBtnActive : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <Icons.Grid size={14} />
                <span>3D Grid</span>
              </button>
              <button
                type="button"
                className={`${styles.viewModeBtn} ${viewMode === "coverflow" ? styles.viewModeBtnActive : ""}`}
                onClick={() => setViewMode("coverflow")}
              >
                <Icons.Layers size={14} />
                <span>3D Carousel</span>
              </button>
            </div>
          </div>

          {/* GALLERY DISPLAY */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-gold-primary)" }}>
              <Icons.RefreshCw size={28} className="animate-spin" style={{ margin: "0 auto 1rem auto" }} />
              <div>Memuat galeri karya dari server...</div>
            </div>
          ) : filteredItems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-text-muted)" }}>
              Tidak ada foto ditemukan untuk kategori &quot;{selectedCat}&quot;.
            </div>
          ) : viewMode === "grid" ? (
            <div className={styles.lookbookGrid}>
              {filteredItems.map((item) => (
                <TiltCard key={item.id} item={item} onOpen={setActiveItem} />
              ))}
            </div>
          ) : (
            <CoverFlowCarousel items={filteredItems} onOpen={setActiveItem} />
          )}

          {/* STUDIO SESSION CTA */}
          <div className={styles.ctaBox}>
            <div>
              <h2 className={styles.ctaTitle}>Ingin Menciptakan Seri Foto Serupa?</h2>
              <p className={styles.ctaDesc}>
                Jadwalkan sesi Anda bersama tim fotografer Letra Studio dan diskusikan konsep visual Anda sekarang.
              </p>
            </div>
            <Link href="/reservation" className="btn btn-gold btn-lg" id="portfolio-cta-btn">
              + Reservasi Sesi Studio
            </Link>
          </div>
        </div>
      </div>

      {/* CINEMATIC LIGHTBOX MODAL */}
      {activeItem && (
        <div className={styles.lightboxOverlay} onClick={() => setActiveItem(null)}>
          <div className={styles.lightboxCard} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={() => setActiveItem(null)}
              title="Tutup (Esc)"
            >
              <Icons.X size={18} />
            </button>

            <div className={styles.lightboxImgWrap}>
              <img src={activeItem.src} alt={activeItem.title} />
            </div>

            <div className={styles.lightboxDetails}>
              <div>
                <div className={styles.lightboxCategory}>{activeItem.category}</div>
                <h2 className={styles.lightboxTitle}>{activeItem.title}</h2>
                <div className={styles.lightboxClient}>Klien: {activeItem.client}</div>

                <div className={styles.exifGrid} style={{ marginTop: "1.5rem" }}>
                  <div className={styles.exifItem}>
                    <span className={styles.exifLabel}>Camera System</span>
                    <span className={styles.exifVal}>Sony A7R V / FX3</span>
                  </div>

                  <div className={styles.exifItem}>
                    <span className={styles.exifLabel}>Optical Specs</span>
                    <span className={styles.exifVal}>{activeItem.specs || "85mm f/1.4 GM"}</span>
                  </div>

                  <div className={styles.exifItem}>
                    <span className={styles.exifLabel}>Lighting Modifier</span>
                    <span className={styles.exifVal}>Octabox 150cm + Grid</span>
                  </div>

                  <div className={styles.exifItem}>
                    <span className={styles.exifLabel}>Color Space</span>
                    <span className={styles.exifVal}>ProPhoto RGB · 16-Bit</span>
                  </div>
                </div>
              </div>

              <div className={styles.lightboxActions}>
                <Link
                  href={`/reservation?category=${activeItem.category.toLowerCase()}`}
                  className="btn btn-gold w-full"
                  style={{ justifyContent: "center" }}
                >
                  Booking Sesi Seperti Ini →
                </Link>

                <div className={styles.lightboxNavArrows}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={handlePrevLightbox}>
                    ← Sebelumnya
                  </button>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    Gunakan tombol panah keyboard
                  </span>
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleNextLightbox}>
                    Berikutnya →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
