"use client";

import { useEffect, useState, useId } from "react";
import styles from "./page.module.css";
import { formatCurrency, PHOTO_PACKAGES, STUDIO_INFO } from "@/lib/data";
import { Package, ServiceItem, Testimonial } from "@/lib/types";
import { packagesService, studioService, PortfolioItem } from "@/lib/services";
import Icons from "@/components/shared/Icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Extended Lookbook items for rich gallery & lightbox
const LOOKBOOK_ITEMS: Array<PortfolioItem & { photographer: string; lighting: string; description: string }> = [
  {
    id: 1,
    src: "/images/portfolio-wedding.jpg",
    category: "Pre-Wedding",
    title: "Timeless Romance in Earth Tones",
    client: "Aditya & Clarissa",
    specs: "Sony A7R V · 85mm f/1.4 GM",
    photographer: "Dewi Rahayu",
    lighting: "Profoto Softbox 3x4' + Soft Bounce Grid",
    description: "Sesi prewedding editorial bernuansa hangat dengan eksplorasi tekstur linen dan komposisi sinematik intim.",
  },
  {
    id: 2,
    src: "/images/portfolio-portrait.jpg",
    category: "Portrait",
    title: "Monochrome Editorial Headshot",
    client: "Jonathan Kusuma",
    specs: "Hasselblad X2D · 55mm f/2.5",
    photographer: "Budi Santoso",
    lighting: "Beauty Dish 20.5' + Silver Reflector",
    description: "Potret dramatis berkarakter kuat untuk portofolio eksekutif dengan gradasi bayangan presisi tinggi.",
  },
  {
    id: 3,
    src: "/images/portfolio-family.jpg",
    category: "Family",
    title: "Generations of Warmth",
    client: "Keluarga Hendrawan (3 Generasi)",
    specs: "Canon EOS R5 · 24-70mm f/2.8L II",
    photographer: "Budi Santoso",
    lighting: "Dual Profoto D2 + 7ft Octabox Key Light",
    description: "Potret keluarga besar yang mengabadikan tawa spontan antar generasi dalam tata cahaya studio natural.",
  },
  {
    id: 4,
    src: "/images/portfolio-wedding.jpg",
    category: "Pre-Wedding",
    title: "Classic Cinematic Elegance",
    client: "Kevin & Michelle",
    specs: "Sony A7R V · 50mm f/1.2 GM",
    photographer: "Dewi Rahayu",
    lighting: "Profoto Deep White XL + Honeycomb Grid",
    description: "Gaun klasik dipadukan dengan tata cahaya dramatis ala majalah fashion Harper's Bazaar.",
  },
  {
    id: 5,
    src: "/images/portfolio-portrait.jpg",
    category: "Wisuda",
    title: "Valedictorian Pride",
    client: "Farah Salsabila, S.Ked",
    specs: "Sony A7 IV · 85mm f/1.4",
    photographer: "Rizki Pratama",
    lighting: "Key Light 120cm Octabox + Rim Light Stripbox",
    description: "Dokumentasi kelulusan kehormatan dengan properti toga studio premium dan sentuhan retouch natural.",
  },
  {
    id: 6,
    src: "/images/portfolio-family.jpg",
    category: "Commercial",
    title: "Artisanal Brand Campaign",
    client: "Nordic Atelier Studio",
    specs: "Fujifilm GFX 100S · 110mm f/2",
    photographer: "Rizki Pratama",
    lighting: "Precision High-Speed Sync Strobe Array",
    description: "Katalog produk dan visual lookbook komersial dengan akurasi warna tinggi berstandar internasional.",
  },
];

// Rich Services Catalog with Category Filters
const SERVICES_CATALOG = [
  {
    id: "srv-portrait",
    category: "portrait",
    categoryLabel: "Portrait & Fashion",
    title: "Portrait Photography",
    tagline: "Personal branding, editorial headshot & fine art portrait.",
    description: "Sesi foto personal yang dirancang untuk menonjolkan karakter, profesionalisme, dan keunikan ekspresi Anda dengan standar majalah internasional.",
    image: "/images/portfolio-portrait.jpg",
    startingPrice: 350000,
    duration: "60 Menit",
    features: ["15 Foto High-End Retouch", "1-2 Pilihan Outfit", "Profoto Beauty Dish Lighting", "Private Cloud Gallery"],
    packageId: "PKG-001",
  },
  {
    id: "srv-prewedding",
    category: "prewedding",
    categoryLabel: "Prewedding & Couple",
    title: "Prewedding & Couple Story",
    tagline: "Abadikan kisah cinta Anda dalam estetika sinematik.",
    description: "Sesi intim terkonsep dengan konsultasi moodboard, penataan busana, dan pencahayaan artistik untuk mengabadikan babak baru perjalanan Anda.",
    image: "/images/portfolio-wedding.jpg",
    startingPrice: 1500000,
    duration: "180 - 240 Menit",
    features: ["50 Foto High-End Retouch", "Semua File Mentah (RAW)", "Akses Semua Background Studio", "Album Digital Lookbook"],
    packageId: "PKG-003",
  },
  {
    id: "srv-family",
    category: "family",
    categoryLabel: "Family & Maternity",
    title: "Family Legacy & Maternity",
    tagline: "Kehangatan keluarga dan keindahan masa kehamilan.",
    description: "Dokumentasi keluarga multi-generasi dan maternity yang penuh tawa, kehangatan, serta kenyamanan maksimal dengan ruang studio luas berpendingin udara.",
    image: "/images/portfolio-family.jpg",
    startingPrice: 650000,
    duration: "120 Menit",
    features: ["20 Foto Master Retouch", "Maksimal 8 Anggota Keluarga", "1 Cetak Frame Foto 10R", "Properti Studio Lengkap"],
    packageId: "PKG-002",
  },
  {
    id: "srv-graduation",
    category: "graduation",
    categoryLabel: "Wisuda & Personal Brand",
    title: "Graduation Celebration",
    tagline: "Rayakan pencapaian terbaik bersama orang tercinta.",
    description: "Foto wisuda personal maupun rombongan keluarga dengan set toga premium, backdrop elegan, dan proses editing tekstur kulit yang rapi.",
    image: "/images/portfolio-portrait.jpg",
    startingPrice: 450000,
    duration: "90 Menit",
    features: ["15 Foto Retouch", "Free Properti Toga & Ijazah", "Foto Solo & Bersama Orang Tua", "Penerimaan Cepat 3 Hari"],
    packageId: "PKG-005",
  },
  {
    id: "srv-rental",
    category: "rental",
    categoryLabel: "Studio Rental Space",
    title: "Creative Studio Rental",
    tagline: "Ruang studio 150m² dengan cyclorama dan sistem lighting lengkap.",
    description: "Sewa ruang studio profesional untuk kreator konten, agensi iklan, desainer busana, atau fotografer independen yang membutuhkan fasilitas lengkap siap pakai.",
    image: "/images/hero.jpg",
    startingPrice: 500000,
    duration: "Per 2 Jam / Full Day",
    features: ["Cyclorama Putih 6x5m", "3x Profoto D2 1000W Strobes", "Makeup Vanity 4 Cermin", "WiFi 200Mbps & AC Central"],
    packageId: "PKG-006",
  },
  {
    id: "srv-commercial",
    category: "commercial",
    categoryLabel: "Commercial & Event",
    title: "Commercial & Product Visuals",
    tagline: "Katalog produk, lookbook e-commerce & dokumentasi brand.",
    description: "Fotografi komersial dengan color accuracy terkontrol untuk e-commerce, billboard, kemasan produk, dan kampanye digital perusahaan Anda.",
    image: "/images/portfolio-wedding.jpg",
    startingPrice: 800000,
    duration: "120 - 360 Menit",
    features: ["Color-Calibrated Output", "Hak Lisensi Komersial Penuh", "Master File TIF & PNG Transparent", "Sesi Tethered Monitor Preview"],
    packageId: "PKG-004",
  },
];

// Comparison Matrix Data
const COMPARISON_FEATURES = [
  { feature: "Durasi Sesi", basic: "1 Jam (60 mnt)", premium: "2 Jam (120 mnt)", signature: "4 Jam (240 mnt)" },
  { feature: "Foto Hasil Editing (Master Retouch)", basic: "10 Foto", premium: "20 Foto", signature: "50 Foto" },
  { feature: "Semua File Mentah (RAW/JPEG)", basic: "20 Foto Pilihan", premium: "40 Foto", signature: "Semua File (100+)" },
  { feature: "Ganti Outfit / Busana", basic: "1 Outfit", premium: "2-3 Outfit", signature: "Unlimited Outfit" },
  { feature: "Pilihan Background & Set", basic: "1 Background", premium: "2-3 Background", signature: "Semua Set & Cyclorama" },
  { feature: "Properti & Aksesoris Studio", basic: "Standar", premium: "Lengkap + Tematik", signature: "Eksklusif + Request Khusus" },
  { feature: "Cetak Frame Foto", basic: "— (Softcopy only)", premium: "1x Cetak Frame 10R", signature: "Album Lookbook + 2x 20R" },
  { feature: "Akses Cloud Gallery Pribadi", basic: "30 Hari", premium: "90 Hari", signature: "1 Tahun / Selamanya" },
  { feature: "Konsultasi Wardrobe & Moodboard", basic: "Online Chat", premium: "1-on-1 bersama Stylist", signature: "Sesi Moodboard Khusus" },
  { feature: "Kecepatan Pengiriman Hasil", basic: "3-4 Hari Kerja", premium: "2-3 Hari Kerja", signature: "Priority Express (24-48 Jam)" },
];

// Smart Questionnaire Options
const QUIZ_QUESTIONS = [
  {
    id: "occasion",
    title: "1. Apa momen atau tujuan utama sesi foto Anda?",
    subtitle: "Pilih jenis sesi yang paling mewakili rencana Anda saat ini.",
    options: [
      { id: "wisuda", label: "Wisuda / Kelulusan", sub: "Foto toga pribadi & keluarga", icon: "🎓" },
      { id: "prewed", label: "Prewedding / Pasangan", sub: "Momen romantis & pertunangan", icon: "💍" },
      { id: "family", label: "Keluarga / Anak / Maternity", sub: "Dokumentasi kehangatan keluarga", icon: "👨‍👩‍👧‍👦" },
      { id: "portrait", label: "Personal Branding / Portret", sub: "Profil kerja, CV, modeling, ultah", icon: "👤" },
      { id: "business", label: "Produk / Bisnis / Komersial", sub: "Katalog, lookbook, foto korporat", icon: "💼" },
      { id: "studio", label: "Sewa Ruang Studio Saja", sub: "Bawa kamera & tim sendiri", icon: "🏢" },
    ],
  },
  {
    id: "people",
    title: "2. Berapa perkiraan jumlah orang yang akan difoto?",
    subtitle: "Membantu kami menyesuaikan set ruang dan persiapan studio.",
    options: [
      { id: "1", label: "1 Orang (Solo)", sub: "Fokus penuh pada Anda", icon: "🧍" },
      { id: "2", label: "2 Orang (Pasangan)", sub: "Sesi couple atau sahabat", icon: "👫" },
      { id: "small_group", label: "3 – 6 Orang", sub: "Keluarga inti atau rombongan kecil", icon: "👨‍👩‍👧" },
      { id: "large_group", label: "7+ Orang (Grup Besar)", sub: "Keluarga besar atau tim kerja", icon: "👥" },
    ],
  },
  {
    id: "style",
    title: "3. Gaya visual apa yang paling Anda sukai?",
    subtitle: "Tentukan mood dan atmosfer pencahayaan yang diinginkan.",
    options: [
      { id: "editorial", label: "Minimalist Editorial", sub: "Elegan, kontras tinggi ala majalah", icon: "🖤" },
      { id: "warm", label: "Warm & Cinematic", sub: "Tone hangat, intim, dan emosional", icon: "✨" },
      { id: "cheerful", label: "Bright & Cheerful", sub: "Cerah, ceria, dan penuh warna", icon: "☀️" },
      { id: "classic", label: "Clean Studio Classic", sub: "Latar netral abadi tanpa lekang waktu", icon: "🏛️" },
    ],
  },
  {
    id: "budget",
    title: "4. Berapa alokasi investasi / budget yang disiapkan?",
    subtitle: "Kami akan mencocokkan dengan paket yang memberikan nilai maksimal.",
    options: [
      { id: "under_500", label: "< Rp 500.000", sub: "Paket esensial berkualitas", icon: "🪙" },
      { id: "500_1500", label: "Rp 500.000 – Rp 1.500.000", sub: "Paket terpopuler & lengkap", icon: "⭐" },
      { id: "above_1500", label: "> Rp 1.500.000", sub: "Pengalaman signature eksklusif", icon: "👑" },
    ],
  },
];

// Frequently Asked Questions
const FAQS = [
  {
    q: "Apakah saya bisa melakukan reschedule jadwal jika ada keperluan mendadak?",
    a: "Tentu bisa. Reschedule dapat dilakukan maksimal 2 hari (48 jam) sebelum waktu sesi berlangsung tanpa dikenakan biaya tambahan. Anda cukup menghubungi tim concierge kami via WhatsApp atau menggunakan fitur kelola jadwal di website.",
  },
  {
    q: "Berapa menit sebelum sesi saya harus tiba di studio?",
    a: "Kami menyarankan klien untuk tiba 15–20 menit sebelum jadwal sesi dimulai. Waktu ini dapat digunakan untuk berganti busana, touch-up makeup di ruang vanity kami, dan konsultasi singkat bersama fotografer.",
  },
  {
    q: "Apakah diperbolehkan membawa anggota keluarga atau teman pendamping?",
    a: "Sangat diperbolehkan! Studio kami dilengkapi dengan Client Lounge yang nyaman ber-AC, WiFi super cepat, dan artisan coffee bar gratis untuk kenyamanan seluruh pendamping Anda.",
  },
  {
    q: "Apakah Letra Studio menyediakan layanan Makeup Artist (MUA) & Wardrobe?",
    a: "Ya, kami bekerja sama dengan tim Makeup Artist editorial profesional. Anda dapat menambahkan add-on layanan MUA saat melakukan reservasi online atau mengabari kami saat konsultasi konsep.",
  },
  {
    q: "Berapa lama estimasi penerimaan foto hasil editing (retouch)?",
    a: "Foto preview mentah (raw preview) dapat diakses di portal cloud pribadi Anda dalam 24 jam setelah sesi. Setelah Anda memilih foto favorit, tim retoucher kami akan menyelesaikan proses master editorial retouch dalam waktu 2 hingga 4 hari kerja.",
  },
  {
    q: "Bagaimana jika saya datang terlambat ke sesi foto?",
    a: "Durasi sesi akan tetap dihitung sesuai jam reservasi yang telah dipilih agar tidak mengganggu jadwal klien pada sesi berikutnya. Namun, jika slot setelahnya kosong, fotografer kami akan dengan senang hati menyesuaikan waktu secara fleksibel.",
  },
  {
    q: "Apakah saya bisa memilih fotografer tertentu untuk sesi saya?",
    a: "Bisa! Pada tahap formulir reservasi, Anda dapat memilih fotografer favorit Anda (seperti Budi Santoso, Dewi Rahayu, atau Rizki Pratama) sesuai dengan portofolio dan spesialisasi visual mereka tanpa biaya tambahan.",
  },
  {
    q: "Metode pembayaran apa saja yang didukung dan apakah memerlukan Uang Muka (DP)?",
    a: "Kami menerima pembayaran via Transfer Bank (BCA, Mandiri, BNI, BRI), QRIS instan, kartu kredit/debit via Midtrans, serta tunai di kasir studio. Anda dapat memilih membayar DP 50% terlebih dahulu untuk mengunci jadwal atau langsung lunas.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const rawId = useId();
  const compId = rawId.replace(/[^a-zA-Z0-9_-]/g, "");

  // Data fetching state
  const [packages, setPackages] = useState<Package[]>(PHOTO_PACKAGES as Package[]);
  const [loadingPackages, setLoadingPackages] = useState(false);

  // Quick Booking bar state
  const [quickCategory, setQuickCategory] = useState("portrait");
  const [quickDate, setQuickDate] = useState("");
  const [quickTime, setQuickTime] = useState("10:00");
  const [quickTier, setQuickTier] = useState("PKG-002");

  // Service Explorer state
  const [activeServiceFilter, setActiveServiceFilter] = useState("all");

  // Lookbook Lightbox state
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lookbookFilter, setLookbookFilter] = useState("Semua");

  // Before/After Slider state (0 to 100)
  const [sliderPos, setSliderPos] = useState(52);

  // Package comparison toggle
  const [showComparison, setShowComparison] = useState(false);

  // AI Assistant Mode: 'quiz' | 'chat'
  const [aiMode, setAiMode] = useState<"quiz" | "chat">("quiz");

  // Quiz state
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({
    occasion: "wisuda",
    people: "1",
    style: "editorial",
    budget: "500_1500",
  });
  const [quizResult, setQuizResult] = useState<{
    pkgId: string;
    pkgName: string;
    price: number;
    duration: string;
    photos: number;
    matchScore: number;
    reason: string;
    specialist: string;
  } | null>(null);

  // AI Chat state
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "ai" | "user"; text: string; ctaLink?: string; ctaText?: string }>>([
    {
      sender: "ai",
      text: "Halo! Saya AI Personal Concierge Letra Studio 📸. Ada yang bisa saya bantu untuk merencanakan sesi foto terbaik Anda hari ini?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Real-time Booking Slot Simulator
  const [simPkg, setSimPkg] = useState<string>("PKG-002");
  const [simDate, setSimDate] = useState<string>("");
  const [simTime, setSimTime] = useState<string>("14:00");

  // Testimonials Carousel
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  // FAQ Accordion
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  // Fetch live packages if backend is running
  useEffect(() => {
    async function loadData() {
      try {
        setLoadingPackages(true);
        const pkgsData = await packagesService.getAll();
        if (pkgsData && pkgsData.length > 0) {
          setPackages(pkgsData);
        }
      } catch (err) {
        console.warn("Using fallback photo packages mock:", err);
      } finally {
        setLoadingPackages(false);
      }
    }
    loadData();

    // Default dates for quick booking
    const today = new Date();
    today.setDate(today.getDate() + 2);
    const dateStr = today.toISOString().split("T")[0];
    setQuickDate(dateStr);
    setSimDate(dateStr);
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev !== null ? (prev + 1) % LOOKBOOK_ITEMS.length : null));
      }
      if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev !== null ? (prev - 1 + LOOKBOOK_ITEMS.length) % LOOKBOOK_ITEMS.length : null));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex]);

  // Handle Quick Booking Submit
  const handleQuickBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/reservation?package=${quickTier}&date=${quickDate}&time=${quickTime}`);
  };

  // AI Quiz submission
  const handleSelectQuizOption = (questionId: string, optionId: string) => {
    const nextAnswers = { ...quizAnswers, [questionId]: optionId };
    setQuizAnswers(nextAnswers);

    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setQuizStep((prev) => prev + 1);
    } else {
      // Calculate best recommendation
      calculateRecommendation(nextAnswers);
    }
  };

  const calculateRecommendation = (ans: Record<string, string>) => {
    if (ans.occasion === "prewed" || ans.budget === "above_1500") {
      setQuizResult({
        pkgId: "PKG-003",
        pkgName: "Paket Pre-Wedding Signature",
        price: 1500000,
        duration: "4 Jam Sesi Penuh",
        photos: 50,
        matchScore: 98,
        reason: "Sangat ideal untuk sesi berdua dengan moodboard sinematik, konsultasi wardrobe, dan dokumentasi mendalam tanpa terburu-buru.",
        specialist: "Dewi Rahayu (Pre-Wedding Specialist)",
      });
    } else if (ans.occasion === "family" || ans.people === "small_group" || ans.people === "large_group") {
      setQuizResult({
        pkgId: "PKG-002",
        pkgName: "Paket Keluarga Legacy",
        price: 650000,
        duration: "2 Jam Sesi Santai",
        photos: 20,
        matchScore: 95,
        reason: "Memberikan durasi 2 jam yang leluasa untuk anak & orang tua, termasuk 1 cetak foto 10R berbingkai dan beragam properti studio.",
        specialist: "Budi Santoso (Senior Portraitist)",
      });
    } else if (ans.occasion === "wisuda") {
      setQuizResult({
        pkgId: "PKG-005",
        pkgName: "Paket Wisuda Kehormatan",
        price: 450000,
        duration: "1.5 Jam",
        photos: 15,
        matchScore: 96,
        reason: "Dilengkapi properti toga studio, sesi solo & keluarga inti, serta retouching tekstur kulit natural berstandar editorial.",
        specialist: "Rizki Pratama (Graduation & Commercial)",
      });
    } else {
      setQuizResult({
        pkgId: "PKG-001",
        pkgName: "Paket Potret Individu",
        price: 350000,
        duration: "1 Jam Fokus",
        photos: 10,
        matchScore: 92,
        reason: "Pilihan terbaik untuk personal branding, headshot LinkedIn, maupun foto potret profil dengan lighting beauty-dish presisi.",
        specialist: "Budi Santoso",
      });
    }
  };

  // AI Chat prompt sender
  const handleSendChat = (customText?: string) => {
    const text = customText || chatInput;
    if (!text.trim()) return;

    const newMessages = [...chatMessages, { sender: "user" as const, text }];
    setChatMessages(newMessages);
    setChatInput("");
    setIsTyping(true);

    setTimeout(() => {
      let reply = "Terima kasih atas pertanyaannya! Tim fotografer kami siap membantu mewujudkan konsep visual terbaik untuk Anda.";
      let ctaLink: string | undefined = "/reservation";
      let ctaText: string | undefined = "Reservasi Sesi Sekarang";

      const lower = text.toLowerCase();
      if (lower.includes("wisuda")) {
        reply = "Selamat atas kelulusan Anda! 🎓 Untuk foto wisuda, kami merekomendasikan **Paket Wisuda (Rp 450.000)** dengan durasi 1.5 jam. Termasuk properti toga studio, foto solo & keluarga inti, serta retouching halus berstandar editorial.";
        ctaLink = "/reservation?package=PKG-005";
        ctaText = "Pilih Paket Wisuda";
      } else if (lower.includes("outfit") || lower.includes("baju") || lower.includes("pakaian")) {
        reply = "Untuk outfit sesi foto studio, kami sangat merekomendasikan palet warna monokrom (hitam/putih), earth tone (beige, terracotta, olive), atau navy. Hindari motif garis rapat kecil untuk mencegah efek moiré pada sensor kamera.";
        ctaLink = "/portfolio";
        ctaText = "Lihat Contoh Lookbook";
      } else if (lower.includes("beda") || lower.includes("paket") || lower.includes("harga")) {
        reply = "Paket Basic (Rp 350k / 1 jam / 10 foto edit) cocok untuk solo portrait. Paket Premium (Rp 650k / 2 jam / 20 foto edit + cetak 10R) adalah paket paling favorit untuk keluarga & couple. Sedangkan Signature Prewedding (Rp 1.5jt / 4 jam / 50 foto edit) mencakup styling konsep mendalam.";
        ctaLink = "/packages";
        ctaText = "Bandingkan Semua Paket";
      } else if (lower.includes("ruang ganti") || lower.includes("makeup") || lower.includes("fasilitas")) {
        reply = "Studio kami memiliki Private Dressing Room ber-AC, 4 cermin vanity Hollywood, garment steamer, serta Client Lounge dengan artisan coffee gratis.";
        ctaLink = "#studio";
        ctaText = "Lihat Fasilitas Studio";
      } else if (lower.includes("sewa") || lower.includes("rental")) {
        reply = "Sewa ruang studio tersedia mulai Rp 500.000 / 2 jam lengkap dengan cyclorama 6x5m, 3x Profoto strobe, c-stand, dan ruang makeup luas.";
        ctaLink = "/reservation?package=PKG-006";
        ctaText = "Sewa Studio";
      }

      setChatMessages((prev) => [...prev, { sender: "ai", text: reply, ctaLink, ctaText }]);
      setIsTyping(false);
    }, 600);
  };

  // Filtered Lookbook
  const filteredLookbook = lookbookFilter === "Semua"
    ? LOOKBOOK_ITEMS
    : LOOKBOOK_ITEMS.filter((item) => item.category.toLowerCase() === lookbookFilter.toLowerCase());

  // Filtered Services
  const filteredServices = activeServiceFilter === "all"
    ? SERVICES_CATALOG
    : SERVICES_CATALOG.filter((s) => s.category === activeServiceFilter);

  // Current selected package for Simulator
  const activeSimPackageObj = packages.find((p) => p.id === simPkg) || packages[0] || (PHOTO_PACKAGES[1] as Package);

  return (
    <>
      {/* ============================================================ */}
      {/* 1. HERO SECTION */}
      {/* ============================================================ */}
      <section className={styles.hero} id="hero">
        <div className={styles.heroBg}>
          <img src="/images/hero.jpg" alt="Letra Studio Interior & Lighting" className={styles.heroBgImg} />
          <div className={styles.heroOverlay} />
        </div>

        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroEyebrow}>
              <Icons.Sparkles size={14} color="#C9A84C" />
              <span className={styles.heroEyebrowText}>
                Letra Studio · Jimbaran, Bali
              </span>
            </div>

            <h1 className={styles.heroTitle}>
              <span className={styles.heroTitleLine1}>Abadikan Momen yang</span>
              <span className={styles.heroTitleLine2}>Layak Diingat Selamanya</span>
              <span className={styles.heroTitleLine3}>dengan Sentuhan Seni.</span>
            </h1>

            <p className={styles.heroSubtitle}>
              Studio foto berstandar editorial dengan tata cahaya Profoto presisi tinggi, fotografer profesional berpengalaman, dan sistem reservasi real-time tanpa antrean.
            </p>

            <div className={styles.heroActions}>
              <Link href="/reservation" id="hero-reservasi-btn" className="btn btn-gold btn-lg">
                Reservasi Sesi Sekarang
                <Icons.ArrowRight size={17} />
              </Link>

              <a href="#portfolio" className="btn btn-outline btn-lg">
                Eksplorasi Galeri Lookbook
              </a>

              <a href="#ai-assistant" className={styles.heroAiPill}>
                <Icons.Sparkles size={14} color="#E8C97A" />
                <span>Rekomendasi AI Assistant</span>
              </a>
            </div>

            {/* Social Proof & Stats Bar */}
            <div className={styles.heroStats}>
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>2.500+</span>
                <span className={styles.heroStatLabel}>Sesi Terlaksana</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>1.800+</span>
                <span className={styles.heroStatLabel}>Klien Puas</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>4.9 / 5.0</span>
                <span className={styles.heroStatLabel}>Rating Ulasan</span>
              </div>
              <div className={styles.heroStatDivider} />
              <div className={styles.heroStat}>
                <span className={styles.heroStatValue}>10+ Thn</span>
                <span className={styles.heroStatLabel}>Dedikasi Visual</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. LUXURY BOOKING CAPSULE (EDITORIAL & MINIMALIST) */}
      {/* ============================================================ */}
      <section className={styles.bookingCapsuleSection} id="quick-booking">
        <div className="container">
          <div className={styles.bookingCapsuleWrapper}>
            <form className={styles.bookingCapsuleForm} onSubmit={handleQuickBookingSubmit}>
              {/* Segment 1: Layanan Studio */}
              <div className={styles.capsuleSegment}>
                <label htmlFor={`${compId}-quick-tier`} className={styles.capsuleLabel}>
                  Layanan & Paket
                </label>
                <div className={styles.capsuleInputWrap}>
                  <select
                    id={`${compId}-quick-tier`}
                    className={styles.capsuleSelect}
                    value={quickTier}
                    onChange={(e) => {
                      setQuickTier(e.target.value);
                      const found = packages.find((p) => p.id === e.target.value);
                      if (found) setQuickCategory(found.category);
                    }}
                  >
                    {packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} — {formatCurrency(pkg.price)}
                      </option>
                    ))}
                  </select>
                  <Icons.ChevronDown size={14} className={styles.capsuleChevron} />
                </div>
                <span className={styles.capsuleSub}>
                  {(packages.find((p) => p.id === quickTier) || packages[0])?.duration} sesi · {(packages.find((p) => p.id === quickTier) || packages[0])?.editedPhotos} foto retouch
                </span>
              </div>

              <div className={styles.capsuleDivider} />

              {/* Segment 2: Tanggal Sesi */}
              <div className={styles.capsuleSegment}>
                <label htmlFor={`${compId}-quick-date`} className={styles.capsuleLabel}>
                  Tanggal Sesi
                </label>
                <div className={styles.capsuleInputWrap}>
                  <input
                    id={`${compId}-quick-date`}
                    type="date"
                    className={styles.capsuleDateInput}
                    value={quickDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setQuickDate(e.target.value)}
                    required
                  />
                </div>
                <span className={styles.capsuleSub}>
                  {quickDate ? new Date(quickDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" }) : "Pilih tanggal kehadiran"}
                </span>
              </div>

              <div className={styles.capsuleDivider} />

              {/* Segment 3: Waktu Sesi */}
              <div className={styles.capsuleSegment}>
                <label htmlFor={`${compId}-quick-time`} className={styles.capsuleLabel}>
                  Waktu Kunjungan
                </label>
                <div className={styles.capsuleInputWrap}>
                  <select
                    id={`${compId}-quick-time`}
                    className={styles.capsuleSelect}
                    value={quickTime}
                    onChange={(e) => setQuickTime(e.target.value)}
                  >
                    <option value="09:00">09:00 WITA (Pagi)</option>
                    <option value="10:30">10:30 WITA (Pagi)</option>
                    <option value="13:00">13:00 WITA (Siang)</option>
                    <option value="14:30">14:30 WITA (Siang)</option>
                    <option value="16:00">16:00 WITA (Sore)</option>
                    <option value="17:30">17:30 WITA (Golden Hour)</option>
                  </select>
                  <Icons.ChevronDown size={14} className={styles.capsuleChevron} />
                </div>
                <span className={styles.capsuleSub}>Jimbaran Studio, Bali</span>
              </div>

              {/* Action Button */}
              <div className={styles.capsuleAction}>
                <button
                  type="submit"
                  id="quick-book-submit-btn"
                  className={styles.capsuleBtn}
                >
                  <span>Cari Jadwal</span>
                  <Icons.ArrowRight size={15} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. INTERACTIVE SERVICE EXPLORER */}
      {/* ============================================================ */}
      <section className="section" id="services">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">Layanan & Fasilitas Studio</div>
            <h2 className="section-title">Eksplorasi Sesi Sesuai Cerita Anda</h2>
            <p className="section-subtitle">
              Setiap sesi dirancang dengan tata pencahayaan presisi, arahan pose yang natural, serta sentuhan color-grading sinematik.
            </p>
          </div>

          {/* Explorer Category Filter Tabs */}
          <div className={styles.explorerTabs}>
            {[
              { id: "all", label: "Semua Layanan" },
              { id: "portrait", label: "Portrait & Solo" },
              { id: "prewedding", label: "Prewedding & Couple" },
              { id: "family", label: "Family & Maternity" },
              { id: "graduation", label: "Wisuda & Kelulusan" },
              { id: "rental", label: "Sewa Studio Space" },
              { id: "commercial", label: "Commercial & Brand" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`${styles.explorerTabBtn} ${activeServiceFilter === tab.id ? styles.explorerTabBtnActive : ""}`}
                onClick={() => setActiveServiceFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Services Cards Grid */}
          <div className={styles.servicesExplorerGrid}>
            {filteredServices.map((srv) => (
              <div key={srv.id} className={styles.serviceExpCard}>
                <div className={styles.serviceExpImgWrap}>
                  <img src={srv.image} alt={srv.title} className={styles.serviceExpImg} />
                  <span className={styles.serviceExpBadge}>{srv.categoryLabel}</span>
                  <span className={styles.serviceExpDuration}>
                    <Icons.Clock size={13} color="#C9A84C" />
                    {srv.duration}
                  </span>
                </div>

                <div className={styles.serviceExpBody}>
                  <h3 className={styles.serviceExpTitle}>{srv.title}</h3>
                  <p className={styles.serviceExpDesc}>{srv.description}</p>

                  <div className={styles.serviceExpFeatures}>
                    {srv.features.map((feat, fIdx) => (
                      <div key={fIdx} className={styles.serviceExpFeatureItem}>
                        <Icons.Check size={14} color="#C9A84C" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className={styles.serviceExpFooter}>
                    <div className={styles.serviceExpPriceCol}>
                      <span className={styles.serviceExpPriceLabel}>Mulai Dari</span>
                      <span className={styles.serviceExpPriceValue}>{formatCurrency(srv.startingPrice)}</span>
                    </div>

                    <Link
                      href={`/reservation?package=${srv.packageId}`}
                      className="btn btn-gold btn-sm"
                    >
                      Pilih Sesi Ini
                      <Icons.ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. AI BOOKING CONCIERGE & QUESTIONNAIRE */}
      {/* ============================================================ */}
      <section className={`section ${styles.aiSection}`} id="ai-assistant">
        <div className={styles.aiGlow} />
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">
              <Icons.Sparkles size={14} color="#C9A84C" />
              <span>Personal AI Assistant</span>
            </div>
            <h2 className="section-title">Belum Yakin Memilih Paket yang Tepat?</h2>
            <p className="section-subtitle">
              Gunakan kecerdasan asisten booking kami untuk mendapatkan rekomendasi paket, estimasi durasi, fotografer spesialis, dan tips outfit terbaik.
            </p>
          </div>

          <div className={styles.aiContainer}>
            {/* Mode Switcher */}
            <div className={styles.aiModeSwitcher}>
              <button
                type="button"
                className={`${styles.aiModeBtn} ${aiMode === "quiz" ? styles.aiModeBtnActive : ""}`}
                onClick={() => setAiMode("quiz")}
              >
                <Icons.Sliders size={16} />
                <span>Rekomendasi Cepat 30 Detik</span>
              </button>
              <button
                type="button"
                className={`${styles.aiModeBtn} ${aiMode === "chat" ? styles.aiModeBtnActive : ""}`}
                onClick={() => setAiMode("chat")}
              >
                <Icons.MessageSquare size={16} />
                <span>Tanya Jawab AI Concierge</span>
              </button>
            </div>

            {/* Mode 1: Quiz Questionnaire */}
            {aiMode === "quiz" && (
              <div className={styles.aiCard}>
                {!quizResult ? (
                  <div>
                    <div className={styles.quizProgressWrap}>
                      <span className={styles.quizStepText}>
                        Pertanyaan {quizStep + 1} dari {QUIZ_QUESTIONS.length}
                      </span>
                      <div className={styles.quizDots}>
                        {QUIZ_QUESTIONS.map((_, i) => (
                          <span
                            key={i}
                            className={`${styles.quizDot} ${i <= quizStep ? styles.quizDotActive : ""}`}
                          />
                        ))}
                      </div>
                    </div>

                    <h3 className={styles.quizQuestionTitle}>{QUIZ_QUESTIONS[quizStep].title}</h3>
                    <p className={styles.quizQuestionSubtitle}>{QUIZ_QUESTIONS[quizStep].subtitle}</p>

                    <div className={styles.quizOptionsGrid}>
                      {QUIZ_QUESTIONS[quizStep].options.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          className={`${styles.quizOptionBtn} ${quizAnswers[QUIZ_QUESTIONS[quizStep].id] === opt.id ? styles.quizOptionBtnSelected : ""}`}
                          onClick={() => handleSelectQuizOption(QUIZ_QUESTIONS[quizStep].id, opt.id)}
                        >
                          <span className={styles.quizOptionIcon}>{opt.icon}</span>
                          <div>
                            <div className={styles.quizOptionLabel}>{opt.label}</div>
                            <div className={styles.quizOptionSub}>{opt.sub}</div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className={styles.quizNavRow}>
                      {quizStep > 0 ? (
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setQuizStep((p) => p - 1)}
                        >
                          <Icons.ChevronLeft size={16} />
                          Kembali
                        </button>
                      ) : <div />}

                      <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                        Klik salah satu opsi untuk melanjutkan otomatis
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={styles.aiResultCard}>
                    <div className={styles.aiResultHeader}>
                      <div className={styles.aiResultMatchBadge}>
                        <Icons.CheckCircle size={14} />
                        <span>Kecocokan AI: {quizResult.matchScore}% Optimal</span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => { setQuizResult(null); setQuizStep(0); }}
                      >
                        <Icons.RefreshCw size={14} />
                        Ulangi Kuesioner
                      </button>
                    </div>

                    <div style={{ fontSize: "0.8rem", color: "var(--color-gold-primary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Rekomendasi Paket Terbaik Untuk Anda:
                    </div>
                    <h3 className={styles.aiResultPackageName}>{quizResult.pkgName}</h3>
                    <p className={styles.aiResultReason}>{quizResult.reason}</p>

                    <div className={styles.aiResultSpecsGrid}>
                      <div className={styles.aiResultSpecItem}>
                        <span className={styles.aiResultSpecTitle}>Estimasi Investasi</span>
                        <span className={styles.aiResultSpecVal} style={{ color: "var(--color-gold-primary)" }}>
                          {formatCurrency(quizResult.price)}
                        </span>
                      </div>
                      <div className={styles.aiResultSpecItem}>
                        <span className={styles.aiResultSpecTitle}>Durasi & Foto</span>
                        <span className={styles.aiResultSpecVal}>{quizResult.duration} · {quizResult.photos} Foto Retouch</span>
                      </div>
                      <div className={styles.aiResultSpecItem}>
                        <span className={styles.aiResultSpecTitle}>Rekomendasi Fotografer</span>
                        <span className={styles.aiResultSpecVal}>{quizResult.specialist}</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                      <Link
                        href={`/reservation?package=${quizResult.pkgId}`}
                        className="btn btn-gold btn-lg"
                      >
                        Pilih & Reservasi Paket Rekomendasi Ini
                        <Icons.ArrowRight size={16} />
                      </Link>
                      <Link href="/packages" className="btn btn-outline btn-lg">
                        Lihat Katalog Lengkap
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mode 2: Interactive AI Chat */}
            {aiMode === "chat" && (
              <div className={styles.aiCard}>
                <div className={styles.chatContainer}>
                  <div className={styles.chatMessages}>
                    {chatMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={`${styles.chatBubble} ${msg.sender === "ai" ? styles.chatBubbleAi : styles.chatBubbleUser}`}
                      >
                        <div style={{ whiteSpace: "pre-line" }}>{msg.text}</div>
                        {msg.ctaLink && (
                          <div style={{ marginTop: "0.75rem" }}>
                            <Link href={msg.ctaLink} className="btn btn-gold btn-sm">
                              {msg.ctaText || "Lanjutkan"}
                              <Icons.ArrowRight size={14} />
                            </Link>
                          </div>
                        )}
                      </div>
                    ))}
                    {isTyping && (
                      <div className={`${styles.chatBubble} ${styles.chatBubbleAi}`} style={{ fontStyle: "italic", opacity: 0.7 }}>
                        AI Concierge sedang merangkum jawaban terbaik...
                      </div>
                    )}
                  </div>

                  <div className={styles.chatQuickPills}>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", alignSelf: "center", marginRight: 4 }}>
                      Pertanyaan Cepat:
                    </span>
                    <button
                      type="button"
                      className={styles.chatQuickPillBtn}
                      onClick={() => handleSendChat("Saran paket untuk wisuda keluarga?")}
                    >
                      🎓 Rekomendasi Wisuda
                    </button>
                    <button
                      type="button"
                      className={styles.chatQuickPillBtn}
                      onClick={() => handleSendChat("Apa tips outfit dan warna baju yang disarankan?")}
                    >
                      👗 Tips Warna Baju
                    </button>
                    <button
                      type="button"
                      className={styles.chatQuickPillBtn}
                      onClick={() => handleSendChat("Apa perbedaan Paket Basic dan Premium?")}
                    >
                      ⭐ Beda Basic vs Premium
                    </button>
                    <button
                      type="button"
                      className={styles.chatQuickPillBtn}
                      onClick={() => handleSendChat("Apakah ada fasilitas ruang ganti dan makeup?")}
                    >
                      💄 Fasilitas Ruang Makeup
                    </button>
                  </div>

                  <form
                    className={styles.chatInputRow}
                    onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
                  >
                    <input
                      type="text"
                      className={styles.chatInput}
                      placeholder="Ketik pertanyaan Anda seputar sesi foto, harga, atau persiapan..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />
                    <button type="submit" className="btn btn-gold btn-sm" style={{ padding: "0 1.25rem" }}>
                      <Icons.Send size={15} />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. EDITORIAL LOOKBOOK & PORTFOLIO WITH LIGHTBOX */}
      {/* ============================================================ */}
      <section className="section" id="portfolio">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">Galeri & Lookbook</div>
            <h2 className="section-title">Portofolio Karya Terpilih</h2>
            <p className="section-subtitle">
              Setiap foto merupakan perpaduan antara keautentikan momen dan penguasaan teknik tata cahaya editorial beresolusi tinggi.
            </p>
          </div>

          {/* Filter Pills */}
          <div className={styles.explorerTabs}>
            {["Semua", "Portrait", "Pre-Wedding", "Family", "Wisuda", "Commercial"].map((cat) => (
              <button
                key={cat}
                type="button"
                className={`${styles.explorerTabBtn} ${lookbookFilter === cat ? styles.explorerTabBtnActive : ""}`}
                onClick={() => setLookbookFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Lookbook Masonry Grid */}
          <div className={styles.lookbookMasonry}>
            {filteredLookbook.map((item, idx) => (
              <div
                key={item.id}
                className={`${styles.lookbookItem} ${idx === 0 ? styles.lookbookItemLarge : ""}`}
                onClick={() => setLightboxIndex(idx)}
              >
                <img src={item.src} alt={item.title} className={styles.lookbookImg} />
                <div className={styles.lookbookOverlay}>
                  <span className={styles.lookbookCategoryBadge}>{item.category}</span>
                  <h3 className={styles.lookbookTitle}>{item.title}</h3>
                  <div className={styles.lookbookPhotographer}>
                    <Icons.Camera size={13} color="#C9A84C" />
                    <span>{item.client} · Fotografer: {item.photographer}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <Link href="/portfolio" className="btn btn-outline btn-lg">
              Buka Semua Galeri Lookbook
              <Icons.ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {lightboxIndex !== null && filteredLookbook[lightboxIndex] && (
        <div className={styles.lightboxBackdrop} onClick={() => setLightboxIndex(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={() => setLightboxIndex(null)}
              aria-label="Tutup preview"
            >
              <Icons.X size={18} />
            </button>

            <div className={styles.lightboxImgWrap}>
              <img
                src={filteredLookbook[lightboxIndex].src}
                alt={filteredLookbook[lightboxIndex].title}
                className={styles.lightboxImg}
              />
            </div>

            <div className={styles.lightboxMetaCol}>
              <div>
                <span className={styles.lookbookCategoryBadge}>
                  {filteredLookbook[lightboxIndex].category}
                </span>
                <h3 className={styles.heroTitle} style={{ fontSize: "1.6rem", margin: "0.5rem 0" }}>
                  {filteredLookbook[lightboxIndex].title}
                </h3>
                <p style={{ fontSize: "0.88rem", color: "var(--color-text-secondary)", lineHeight: 1.7, marginBottom: "1.5rem" }}>
                  {filteredLookbook[lightboxIndex].description}
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", padding: "1rem", background: "#0E0E0E", borderRadius: "10px" }}>
                  <div style={{ fontSize: "0.8rem", color: "#F0EDE8" }}>
                    <strong style={{ color: "var(--color-gold-light)" }}>Klien:</strong> {filteredLookbook[lightboxIndex].client}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#F0EDE8" }}>
                    <strong style={{ color: "var(--color-gold-light)" }}>Fotografer:</strong> {filteredLookbook[lightboxIndex].photographer}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#F0EDE8" }}>
                    <strong style={{ color: "var(--color-gold-light)" }}>Kamera & Lensa:</strong> {filteredLookbook[lightboxIndex].specs}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#F0EDE8" }}>
                    <strong style={{ color: "var(--color-gold-light)" }}>Tata Cahaya:</strong> {filteredLookbook[lightboxIndex].lighting}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
                <Link
                  href="/reservation"
                  className="btn btn-gold w-full"
                  onClick={() => setLightboxIndex(null)}
                >
                  Reservasi Sesi Mirip Ini
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 6. PHOTO STORY & BEFORE/AFTER RETOUCH SLIDER */}
      {/* ============================================================ */}
      <section className={`section ${styles.beforeAfterSection}`} id="photo-story">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">Dedikasi Kualitas</div>
            <h2 className="section-title">Dari Studio Setup Hingga Master Shot</h2>
            <p className="section-subtitle">
              Geser slider di bawah untuk melihat perbedaan antara foto pencahayaan mentah studio dengan hasil akhir editorial color-grading profesional.
            </p>
          </div>

          {/* Interactive Before/After Comparison */}
          <div className={styles.beforeAfterWrap}>
            {/* Raw background image */}
            <img
              src="/images/portfolio-portrait.jpg"
              alt="Raw Studio Lighting"
              className={`${styles.beforeAfterImg} ${styles.beforeAfterImgRaw}`}
            />

            {/* Retouched top image with clipPath */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
              }}
            >
              <img
                src="/images/portfolio-portrait.jpg"
                alt="Master Editorial Retouch"
                className={`${styles.beforeAfterImg} ${styles.beforeAfterImgRetouched}`}
              />
            </div>

            {/* Badges */}
            <span className={styles.beforeAfterBadgeLeft}>✨ Master Editorial Retouch</span>
            <span className={styles.beforeAfterBadgeRight}>📸 Raw Strobe Setup</span>

            {/* Draggable Divider Line */}
            <div className={styles.beforeAfterDivider} style={{ left: `${sliderPos}%` }}>
              <div className={styles.beforeAfterHandle}>
                <Icons.Sliders size={18} />
              </div>
            </div>

            {/* Invisible range input for smooth drag/touch */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                opacity: 0,
                cursor: "ew-resize",
                zIndex: 10,
              }}
              aria-label="Before after comparison slider"
            />
          </div>

          {/* 3 Steps Process Breakdown */}
          <div className={styles.storyStepsGrid}>
            <div className={styles.storyStepCard}>
              <div className={styles.storyStepNumber}>01</div>
              <h3 className={styles.storyStepTitle}>Moodboard & Wardrobe Styling</h3>
              <p className={styles.storyStepDesc}>
                Konsultasi mendalam mengenai palet warna pakaian, pilihan latar belakang studio, dan karakter visual yang ingin Anda tampilkan.
              </p>
            </div>

            <div className={styles.storyStepCard}>
              <div className={styles.storyStepNumber}>02</div>
              <h3 className={styles.storyStepTitle}>Precision Studio Lighting</h3>
              <p className={styles.storyStepDesc}>
                Penataan tata cahaya Profoto multi-modifier untuk menghasilkan dimensi wajah yang tegas, kulit bersinar sehat, dan detail tajam.
              </p>
            </div>

            <div className={styles.storyStepCard}>
              <div className={styles.storyStepNumber}>03</div>
              <h3 className={styles.storyStepTitle}>High-End Texture Retouching</h3>
              <p className={styles.storyStepDesc}>
                Penyempurnaan manual berstandar majalah mode yang mempertahankan tekstur kulit asli tanpa efek plastik, siap cetak master resolution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. PRICING PACKAGES & INTERACTIVE COMPARISON */}
      {/* ============================================================ */}
      <section className="section" id="packages" style={{ background: "var(--color-bg-secondary)" }}>
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">Transparansi Harga</div>
            <h2 className="section-title">Pilihan Paket Sesi Terkurasi</h2>
            <p className="section-subtitle">
              Investasi berharga untuk kenangan abadi tanpa biaya tersembunyi. Termasuk akses ruang studio, fotografer profesional, dan soft copy beresolusi tinggi.
            </p>
          </div>

          {/* Packages Grid */}
          <div className={styles.packagesGrid}>
            {packages.slice(0, 3).map((pkg) => (
              <div
                key={pkg.id}
                className={`card card-gold ${styles.packageCard} ${pkg.popular ? styles.packageCardPopular : ""}`}
              >
                {pkg.popular && (
                  <div className={styles.popularBadge}>
                    <span>⭐ Pilihan Paling Populer</span>
                  </div>
                )}

                <div className={styles.packageHeaderRow}>
                  <h3 className={styles.packageName}>{pkg.name}</h3>
                  <span className="badge badge-neutral" style={{ textTransform: "capitalize" }}>
                    {pkg.category}
                  </span>
                </div>

                <p className={styles.packageDesc}>{pkg.description}</p>

                <div className={styles.packageMeta}>
                  <div className={styles.packageMetaItem}>
                    <Icons.Clock size={15} color="#C9A84C" />
                    <span>{pkg.duration} sesi</span>
                  </div>
                  <div className={styles.packageMetaItem}>
                    <Icons.Camera size={15} color="#C9A84C" />
                    <span>{pkg.editedPhotos} foto retouch</span>
                  </div>
                </div>

                <div className={styles.packagePrice}>
                  <span className={styles.packagePriceFrom}>Investasi Sesi</span>
                  <span className={styles.packagePriceAmount}>{formatCurrency(pkg.price)}</span>
                </div>

                <div className={styles.packageFeaturesList}>
                  {pkg.features.map((feat, idx) => (
                    <div key={idx} className={styles.packageFeatureItem}>
                      <Icons.Check size={14} color="#C9A84C" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href={`/reservation?package=${pkg.id}`}
                  className={`btn ${pkg.popular ? "btn-gold" : "btn-outline"} w-full`}
                  style={{ marginTop: "auto" }}
                >
                  Pilih {pkg.name}
                  <Icons.ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>

          {/* Interactive Package Comparison Toggle */}
          <div className={styles.comparisonToggleWrap}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowComparison(!showComparison)}
            >
              <Icons.Sliders size={16} />
              <span>{showComparison ? "Sembunyikan Tabel Perbandingan" : "Bandingkan Detail Fitur Semua Paket"}</span>
              {showComparison ? <Icons.ChevronUp size={16} /> : <Icons.ChevronDown size={16} />}
            </button>
          </div>

          {showComparison && (
            <div className={styles.comparisonTableWrap}>
              <table className={styles.comparisonTable}>
                <thead>
                  <tr>
                    <th>Fitur & Fasilitas</th>
                    <th>Paket Potret (Basic)</th>
                    <th>Paket Keluarga (Premium) ⭐</th>
                    <th>Paket Pre-Wedding (Signature)</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_FEATURES.map((row, i) => (
                    <tr key={i}>
                      <td className={styles.comparisonFeatureCol}>{row.feature}</td>
                      <td>{row.basic}</td>
                      <td style={{ color: "var(--color-gold-light)", fontWeight: 600 }}>{row.premium}</td>
                      <td>{row.signature}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.packagesFooter}>
            <Link href="/packages" className="btn btn-outline btn-lg">
              Eksplorasi Seluruh 6 Paket Foto & Add-on
              <Icons.ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. REAL-TIME BOOKING SLOT SIMULATOR */}
      {/* ============================================================ */}
      <section className="section" id="booking-simulator">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">Simulasi Pemesanan</div>
            <h2 className="section-title">Pilih Slot Jadwal Sesi Anda</h2>
            <p className="section-subtitle">
              Sistem booking transparan dan otomatis. Kunci jadwal sesi foto pilihan Anda dalam beberapa klik mudah.
            </p>
          </div>

          <div className={styles.slotBookingCard}>
            <div className={styles.slotBookingGrid}>
              {/* Left Column: Selectors */}
              <div>
                <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                  <label className="form-label">1. Pilih Paket Foto</label>
                  <select
                    className="form-input"
                    value={simPkg}
                    onChange={(e) => setSimPkg(e.target.value)}
                  >
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — {formatCurrency(p.price)} ({p.duration})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                  <label className="form-label">2. Pilih Tanggal Sesi</label>
                  <input
                    type="date"
                    className="form-input"
                    value={simDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSimDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">3. Pilih Slot Waktu Kunjungan</label>
                  <div className={styles.slotPillsGrid}>
                    {[
                      { time: "09:00", status: "available" },
                      { time: "10:30", status: "available" },
                      { time: "13:00", status: "booked" },
                      { time: "14:30", status: "available" },
                      { time: "16:00", status: "available" },
                      { time: "17:30", status: "available" },
                    ].map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={slot.status === "booked"}
                        className={`${styles.slotPillBtn} ${simTime === slot.time ? styles.slotPillBtnSelected : ""} ${slot.status === "booked" ? styles.slotPillBtnBooked : ""}`}
                        onClick={() => setSimTime(slot.time)}
                      >
                        <div>{slot.time} WIB</div>
                        <span style={{ fontSize: "0.68rem", opacity: 0.8 }}>
                          {slot.status === "booked" ? "Terisi" : "Tersedia"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Live Selection Summary Card */}
              <div className={styles.slotSummaryBox}>
                <div>
                  <div style={{ fontSize: "0.78rem", color: "var(--color-gold-primary)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
                    Ringkasan Pilihan Sesi Anda
                  </div>
                  <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", color: "#FFFFFF", marginBottom: "1rem" }}>
                    {activeSimPackageObj.name}
                  </h3>

                  <div className={styles.slotSummaryRow}>
                    <span style={{ color: "var(--color-text-muted)" }}>Tanggal Terpilih</span>
                    <span style={{ color: "#FFFFFF", fontWeight: 500 }}>
                      {simDate ? new Date(simDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Pilih Tanggal"}
                    </span>
                  </div>

                  <div className={styles.slotSummaryRow}>
                    <span style={{ color: "var(--color-text-muted)" }}>Waktu & Durasi</span>
                    <span style={{ color: "#FFFFFF", fontWeight: 500 }}>{simTime} WIB ({activeSimPackageObj.duration})</span>
                  </div>

                  <div className={styles.slotSummaryRow}>
                    <span style={{ color: "var(--color-text-muted)" }}>Hasil Foto Retouch</span>
                    <span style={{ color: "#FFFFFF", fontWeight: 500 }}>{activeSimPackageObj.editedPhotos} Foto Master HD</span>
                  </div>

                  <div className={styles.slotSummaryRow}>
                    <span style={{ color: "var(--color-text-muted)" }}>Lokasi Studio</span>
                    <span style={{ color: "#FFFFFF", fontWeight: 500 }}>Jimbaran, Kabupaten Badung, Bali</span>
                  </div>
                </div>

                <div>
                  <div className={styles.slotSummaryTotal}>
                    <span style={{ fontSize: "0.9rem", color: "var(--color-text-secondary)" }}>Total Biaya Sesi</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 700, color: "var(--color-gold-primary)" }}>
                      {formatCurrency(activeSimPackageObj.price)}
                    </span>
                  </div>

                  <Link
                    href={`/reservation?package=${activeSimPackageObj.id}&date=${simDate}&time=${simTime}`}
                    className="btn btn-gold btn-lg w-full"
                    style={{ marginTop: "1rem" }}
                  >
                    Lanjutkan Pengisian Data Reservasi
                    <Icons.ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. STUDIO EXPERIENCE & HIGH-END FACILITIES */}
      {/* ============================================================ */}
      <section className="section" id="studio" style={{ background: "var(--color-bg-secondary)" }}>
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">Studio Experience</div>
            <h2 className="section-title">Kenyamanan & Fasilitas Eksklusif</h2>
            <p className="section-subtitle">
              Bukan hanya sekadar sesi foto biasa — kami menghadirkan pengalaman studio yang ramah, nyaman, dan berstandar internasional.
            </p>
          </div>

          <div className={styles.studioFacilitiesGrid}>
            {[
              {
                icon: <Icons.Camera size={22} />,
                title: "150m² Cyclorama & Set Tematik",
                desc: "Dinding cyclorama tanpa sudut untuk foto berlatar bersih tanpa batas serta berbagai pilihan set kain dan paper backdrop.",
              },
              {
                icon: <Icons.Zap size={22} />,
                title: "Profoto Pro-10 Lighting Grids",
                desc: "Sistem tata cahaya studio berkecepatan tinggi dengan berbagai pilihan softbox, beauty dish, dan grid modifier presisi.",
              },
              {
                icon: <Icons.Sparkles size={22} />,
                title: "Private Dressing & Makeup Vanity",
                desc: "Ruang ganti privat yang luas dilengkapi 4 cermin vanity berlampu Daylight 5500K dan garment steamer.",
              },
              {
                icon: <Icons.Coffee size={22} />,
                title: "Lounge & Artisan Refreshment",
                desc: "Area santai untuk keluarga & pendamping dengan sajian specialty coffee, teh herbal, dan camilan premium gratis.",
              },
              {
                icon: <Icons.Sliders size={22} />,
                title: "Live Tethered Preview Screen",
                desc: "Layar monitor preview terkalibrasi agar Anda dapat langsung meninjau hasil pose dan ekspresi secara real-time.",
              },
              {
                icon: <Icons.Layers size={22} />,
                title: "Props & Wardrobe Rack",
                desc: "Koleksi properti estetik, bangku editorial, toga wisuda, serta rak pakaian gantung yang bersih dan terawat.",
              },
              {
                icon: <Icons.Shield size={22} />,
                title: "Central AC & Sanitasi Terjaga",
                desc: "Sistem pendingin udara sentral yang sejuk dan ruang studio yang selalu disanitasi sebelum setiap sesi dimulai.",
              },
              {
                icon: <Icons.MapPin size={22} />,
                title: "Area Parkir Pribadi Luas",
                desc: "Lokasi strategis di Jimbaran, Bali dengan parkir khusus mobil/motor yang aman dan gratis.",
              },
            ].map((fac, idx) => (
              <div key={idx} className={styles.studioFacilityCard}>
                <div className={styles.studioFacilityIcon}>{fac.icon}</div>
                <h3 className={styles.studioFacilityTitle}>{fac.title}</h3>
                <p className={styles.studioFacilityDesc}>{fac.desc}</p>
              </div>
            ))}
          </div>

          {/* Location Box */}
          <div style={{ marginTop: "3.5rem", background: "#141414", borderRadius: "14px", border: "1px solid rgba(201,168,76,0.2)", padding: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-gold-primary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Lokasi & Jam Operasional
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem", color: "#FFFFFF", margin: "0.35rem 0" }}>
                {STUDIO_INFO.name} — Jimbaran, Bali
              </h3>
              <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                {STUDIO_INFO.address} · Buka {STUDIO_INFO.workingHours}
              </p>
            </div>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <a
                href="https://www.google.com/maps/place/Letra+Studio/@-8.7771849,115.1807007,955m/data=!3m2!1e3!4b1!4m6!3m5!1s0x2dd245e838f2176d:0x68804cb55cf165a7!8m2!3d-8.7771849!4d115.1832756!16s%2Fg%2F11t4fysdsm?entry=ttu&g_ep=EgoyMDI2MDgyMy4wIKXMDSoASAFQAw%3D%3D"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
              >
                <Icons.MapPin size={16} />
                Petunjuk Arah Google Maps
              </a>
              <a
                href="https://wa.me/6282340619880"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold"
              >
                <Icons.Phone size={16} />
                WhatsApp Studio
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 10. TESTIMONIALS & SOCIAL PROOF */}
      {/* ============================================================ */}
      <section className="section" id="reviews">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">Kesan & Pengalaman Klien</div>
            <h2 className="section-title">Dipercaya Ribuan Klien & Pasangan</h2>
            <p className="section-subtitle">
              Ulasan autentik dari para klien yang telah mengabadikan momen berharga mereka di Letra Studio.
            </p>
          </div>

          <div className={styles.testimonialsGrid}>
            {[
              {
                id: 1,
                name: "Clarissa & Aditya",
                role: "Prewedding Couple",
                package: "Paket Pre-Wedding Signature",
                rating: 5,
                text: "Studio paling nyaman dan fotografernya sangat jago mengarahkan pose yang natural! Hasil fotonya benar-benar seperti majalah editorial internasional. Keluarga besar kami semua memuji hasilnya.",
              },
              {
                id: 2,
                name: "dr. Ryan Prasetya",
                role: "Wisudawan Spesialis UI",
                package: "Paket Wisuda Kehormatan",
                rating: 5,
                text: "Proses booking lewat website sangat mulus dan tepat waktu. Ruang studionya dingin, MUA-nya rapi, dan dalam 3 hari foto master retouch resolusi tinggi sudah siap cetak.",
              },
              {
                id: 3,
                name: "Keluarga Hendrawan",
                role: "Family Session (3 Generasi)",
                package: "Paket Keluarga Legacy",
                rating: 5,
                text: "Membawa orang tua yang sudah sepuh dan balita biasanya melelahkan, tapi tim Letra Studio sangat sabar dan cekatan. Hasil fotonya menangkap kehangatan tawa keluarga kami dengan sempurna.",
              },
            ].map((t) => (
              <div key={t.id} className={`card card-gold ${styles.testimonialCard}`}>
                <div className={styles.ratingRow}>
                  {Array.from({ length: t.rating }).map((_, idx) => (
                    <Icons.Star key={idx} size={15} color="#C9A84C" />
                  ))}
                </div>
                <p className={styles.testimonialText}>&ldquo;{t.text}&rdquo;</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className={styles.testimonialName}>{t.name}</div>
                    <div className={styles.testimonialRole}>{t.role} · {t.package}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 11. FAQ ACCORDION */}
      {/* ============================================================ */}
      <section className="section" id="faq" style={{ background: "var(--color-bg-secondary)" }}>
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">Pertanyaan Umum</div>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Jawaban lengkap seputar proses pemotretan, fasilitas, kebijakan reschedule, dan pengiriman file.
            </p>
          </div>

          <div className={styles.faqAccordion}>
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className={`${styles.faqItem} ${openFaqIdx === idx ? styles.faqItemOpen : ""}`}
              >
                <button
                  type="button"
                  className={styles.faqQuestionBtn}
                  onClick={() => setOpenFaqIdx(openFaqIdx === idx ? null : idx)}
                >
                  <span>{faq.q}</span>
                  {openFaqIdx === idx ? (
                    <Icons.ChevronUp size={18} color="#C9A84C" />
                  ) : (
                    <Icons.ChevronDown size={18} color="#A8A29E" />
                  )}
                </button>
                {openFaqIdx === idx && (
                  <div className={styles.faqAnswer}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 12. FINAL HIGH-CONVERSION CTA */}
      {/* ============================================================ */}
      <section className={styles.ctaSection} id="contact">
        <div className={styles.ctaBg} />
        <div className="container">
          <div className={styles.ctaContent}>
            <div className="section-eyebrow">
              <Icons.Sparkles size={14} color="#C9A84C" />
              <span>Ready to Create Something Beautiful?</span>
            </div>
            <h2 className={styles.ctaTitle}>Abadikan Cerita Berharga Anda Hari Ini</h2>
            <p className={styles.ctaSubtitle}>
              Pilih jadwal sesi foto Anda sekarang dan biarkan tim profesional kami mempersiapkan pengalaman visual tak terlupakan untuk Anda.
            </p>
            <div className={styles.heroActions} style={{ justifyContent: "center" }}>
              <Link href="/reservation" id="cta-reservasi-btn" className="btn btn-gold btn-lg">
                Reservasi Sesi Sekarang
                <Icons.ArrowRight size={17} />
              </Link>
              <a
                href="https://wa.me/6281234567890"
                className="btn btn-outline btn-lg"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icons.Phone size={16} />
                Konsultasi via WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 13. STICKY MOBILE BOOKING BAR */}
      {/* ============================================================ */}
      <div className={styles.mobileStickyBar}>
        <div className={styles.mobileStickyPrice}>
          <span className={styles.mobileStickyPriceLabel}>Sesi Foto Mulai</span>
          <span className={styles.mobileStickyPriceVal}>Rp 350.000</span>
        </div>
        <Link href="/reservation" className="btn btn-gold btn-sm">
          Reservasi Sekarang
          <Icons.ArrowRight size={14} />
        </Link>
      </div>
    </>
  );
}
