"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { STATUS_CONFIG, formatDate, formatCurrency } from "@/lib/data";
import { Reservation, User } from "@/lib/types";
import { reservationsService, paymentService, authService } from "@/lib/services";
import Icons from "@/components/shared/Icons";
import Link from "next/link";
import styles from "./page.module.css";

export default function HistoryPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "unpaid" | "completed">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadHistory = async (targetUser?: User | null) => {
    const activeUser = targetUser || user || authService.getCurrentUser();
    if (!activeUser) return;
    try {
      const data = await reservationsService.getAll({
        customerEmail: activeUser.email,
      });
      setReservations(data);
    } catch (err) {
      console.error("Failed to load reservations history from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("letra_auth_token") : null;
    const currentUser = authService.getCurrentUser();

    if (!token || !currentUser) {
      router.replace("/auth/login?redirect=/history");
      return;
    }

    setUser(currentUser);
    loadHistory(currentUser);
  }, [router]);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePayMidtrans = async (r: Reservation, amountType: "dp" | "settlement" | "full") => {
    setPayingId(r.id);
    try {
      const snapData = await paymentService.getSnapToken(r.id, amountType);

      if (typeof window !== "undefined" && (window as any).snap) {
        (window as any).snap.pay(snapData.token, {
          onSuccess: async (result: any) => {
            await paymentService.confirmPayment({
              reservationId: r.id,
              amountType,
              paymentResult: result,
            });
            alert(
              amountType === "settlement"
                ? "Pelunasan sisa berhasil diverifikasi! Status pemesanan Anda kini Lunas Penuh."
                : "Pembayaran via Midtrans berhasil diverifikasi!"
            );
            loadHistory();
          },
          onPending: () => {
            alert("Menunggu pembayaran Anda diselesaikan melalui metode terpilih.");
          },
          onError: () => {
            alert("Pembayaran Midtrans tidak berhasil.");
          },
        });
      } else {
        // Fallback simulation in dev sandbox
        await paymentService.confirmPayment({
          reservationId: r.id,
          amountType,
          paymentResult: { payment_type: "qris", transaction_status: "settlement" },
        });
        alert(
          amountType === "settlement"
            ? "Pelunasan sisa berhasil dikonfirmasi! Status pemesanan Anda kini Lunas Penuh."
            : "Pembayaran simulasi Sandbox Midtrans berhasil dikonfirmasi!"
        );
        loadHistory();
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal memproses sesi pembayaran Midtrans.");
    } finally {
      setPayingId(null);
    }
  };

  // Metrics
  const totalSpending = reservations
    .filter((r) => r.paymentStatus === "paid" || r.paymentStatus === "dp_paid")
    .reduce((sum, r) => sum + (r.paymentStatus === "paid" ? r.totalAmount : r.totalAmount * 0.5), 0);

  const upcomingCount = reservations.filter((r) => r.status === "confirmed" || r.status === "pending").length;
  const unpaidCount = reservations.filter((r) => r.paymentStatus === "pending" || r.paymentStatus === "dp_paid").length;
  const completedCount = reservations.filter((r) => r.status === "completed").length;

  // Filtered reservations
  const filteredReservations = reservations.filter((r) => {
    // Tab filter
    if (activeTab === "upcoming" && !(r.status === "confirmed" || r.status === "pending")) return false;
    if (activeTab === "unpaid" && !(r.paymentStatus === "pending" || r.paymentStatus === "dp_paid")) return false;
    if (activeTab === "completed" && r.status !== "completed") return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = r.id.toLowerCase().includes(q);
      const matchPkg = r.packageName.toLowerCase().includes(q);
      const matchPhotographer = r.photographerName.toLowerCase().includes(q);
      return matchId || matchPkg || matchPhotographer;
    }

    return true;
  });

  if (!user) {
    return (
      <div className={styles.wrapper}>
        <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#C9A84C" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid rgba(201, 168, 76, 0.15)",
              borderTopColor: "#C9A84C",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              marginBottom: "1rem",
            }}
          />
          <div style={{ fontSize: "1rem", fontWeight: 600, color: "#F0EDE8" }}>
            LETRA STUDIO
          </div>
          <p style={{ color: "#8C8680", fontSize: "0.85rem", marginTop: "0.25rem" }}>
            Memeriksa autentikasi sesi pelanggan...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.headerBg} />
        <div className="container">
          <div className={styles.headerContent}>
            <div className="section-eyebrow">Client Dashboard</div>
            <h1 className={styles.headerTitle}>
              {user ? `Riwayat Sesi · ${user.name}` : "Riwayat Reservasi Saya"}
            </h1>
            <p className={styles.headerSubtitle}>
              {user
                ? `Kelola jadwal pemotretan, lacak status verifikasi pembayaran, dan pantau sesi studio Anda di Letra Studio Bali.`
                : "Daftar seluruh sesi foto Anda di Letra Studio beserta status verifikasi dan akses detailnya."}
            </p>
          </div>
        </div>
      </div>

      <div className="container section">
        {/* KPI Metrics Row */}
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <div className={styles.statIconWrap}>
              <Icons.Calendar size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{reservations.length}</span>
              <span className={styles.statLabel}>Total Reservasi</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrap} style={{ background: "rgba(80, 144, 224, 0.1)", borderColor: "rgba(80, 144, 224, 0.3)", color: "#5090E0" }}>
              <Icons.Clock size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{upcomingCount}</span>
              <span className={styles.statLabel}>Sesi Mendatang</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrap} style={{ background: "rgba(76, 175, 136, 0.1)", borderColor: "rgba(76, 175, 136, 0.3)", color: "#4CAF88" }}>
              <Icons.CheckCircle size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{completedCount}</span>
              <span className={styles.statLabel}>Sesi Selesai</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIconWrap}>
              <Icons.CreditCard size={22} />
            </div>
            <div className={styles.statInfo}>
              <span className={styles.statValue}>{formatCurrency(totalSpending)}</span>
              <span className={styles.statLabel}>Total Investasi</span>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className={styles.filterBar}>
          <div className={styles.filterPills}>
            {[
              { id: "all", label: `Semua Sesi (${reservations.length})` },
              { id: "upcoming", label: `Mendatang (${upcomingCount})` },
              { id: "unpaid", label: `Perlu Bayar / DP (${unpaidCount})` },
              { id: "completed", label: `Selesai (${completedCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`${styles.filterPill} ${activeTab === tab.id ? styles.filterPillActive : ""}`}
                onClick={() => setActiveTab(tab.id as any)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={styles.searchBox}>
            <Icons.Search size={15} className={styles.searchIcon} style={{ marginRight: "1rem" }} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Cari ID, Paket, Fotografer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Reservations List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-gold-primary)" }}>
            <Icons.RefreshCw size={28} className="animate-spin" style={{ margin: "0 auto 1rem auto" }} />
            <div>Memuat riwayat sesi studio dari sistem...</div>
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className={styles.emptyCard}>
            <div className={styles.emptyIconWrap}>
              <Icons.Camera size={36} />
            </div>
            <h3 className={styles.emptyTitle}>
              {searchQuery.trim()
                ? "Tidak Ditemukan Sesi yang Sesuai"
                : activeTab !== "all"
                  ? "Tidak Ada Sesi di Kategori Ini"
                  : "Belum Ada Riwayat Sesi Foto"}
            </h3>
            <p className={styles.emptyDesc}>
              {searchQuery.trim()
                ? `Tidak ada reservasi yang cocok dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                : "Jadwalkan momen istimewa Anda di Letra Studio Jimbaran, Bali. Pilih paket foto dan fotografer terbaik kami sekarang."}
            </p>
            <Link href="/reservation" className="btn btn-gold" style={{ marginTop: "0.5rem" }}>
              + Buat Reservasi Sesi Baru
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {filteredReservations.map((r) => {
              const statusInfo = STATUS_CONFIG[r.status] || { label: r.status, class: "badge-neutral" };
              const payInfo = STATUS_CONFIG[r.paymentStatus] || { label: r.paymentStatus, class: "badge-neutral" };
              const isPendingPayment = r.paymentStatus === "pending";
              const isDpPaid = r.paymentStatus === "dp_paid";
              const remainingAmount = r.totalAmount * 0.5;

              // Extract date components
              const dateObj = new Date(r.date);
              const dayStr = isNaN(dateObj.getDate()) ? "--" : dateObj.getDate().toString().padStart(2, "0");
              const monthStr = isNaN(dateObj.getMonth())
                ? "SESI"
                : dateObj.toLocaleDateString("id-ID", { month: "short" }).toUpperCase();
              const yearStr = isNaN(dateObj.getFullYear()) ? "" : dateObj.getFullYear();

              return (
                <div key={r.id} className={styles.resCard} id={`history-${r.id}`}>
                  {/* Left Date Banner */}
                  <div className={styles.resDateBanner}>
                    <span className={styles.resDateDay}>{dayStr}</span>
                    <span className={styles.resDateMonth}>{monthStr}</span>
                    <span className={styles.resDateYear}>{yearStr}</span>
                  </div>

                  {/* Center Details */}
                  <div className={styles.resCenter}>
                    <div className={styles.resTopRow}>
                      <button
                        type="button"
                        className={styles.resIdBadge}
                        onClick={() => handleCopyId(r.id)}
                        title="Klik untuk menyalin Kode Reservasi"
                      >
                        <Icons.Copy size={11} />
                        <span>{r.id}</span>
                        {copiedId === r.id && <span style={{ color: "#4CAF88", fontWeight: "bold" }}>✓ Tersalin</span>}
                      </button>

                      <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        Dipesan pada {formatDate(r.createdAt || r.date)}
                      </span>
                    </div>

                    <h3 className={styles.resPkgName}>{r.packageName}</h3>

                    <div className={styles.resMetaRow}>
                      <span className={styles.resMetaItem}>
                        <Icons.Clock size={14} color="#C9A84C" />
                        <span>{r.time} WITA</span>
                      </span>

                      <span className={styles.resMetaItem}>
                        <Icons.User size={14} color="#C9A84C" />
                        <span>Fotografer: {r.photographerName}</span>
                      </span>

                      <span className={styles.resMetaItem}>
                        <Icons.MapPin size={14} color="#C9A84C" />
                        <span>Jimbaran Studio</span>
                      </span>
                    </div>
                  </div>

                  {/* Right Finance & Actions */}
                  <div className={styles.resRight}>
                    <div className={styles.resBadgesWrap}>
                      <span className={`badge ${statusInfo.class}`}>{statusInfo.label}</span>
                      <span className={`badge ${payInfo.class}`}>{payInfo.label}</span>
                    </div>

                    <div className={styles.resPriceWrap}>
                      <div className={styles.resPriceVal}>{formatCurrency(r.totalAmount)}</div>
                      {isDpPaid && (
                        <div className={styles.resPriceRemaining}>
                          DP Terbayar · Sisa Pelunasan {formatCurrency(remainingAmount)}
                        </div>
                      )}
                    </div>

                    <div className={styles.resActionsRow}>
                      {isPendingPayment && (
                        <button
                          type="button"
                          className="btn btn-gold btn-sm"
                          id={`pay-dp-${r.id}`}
                          disabled={payingId === r.id}
                          onClick={() => handlePayMidtrans(r, "dp")}
                        >
                          <Icons.CreditCard size={13} style={{ marginRight: 4 }} />
                          {payingId === r.id ? "Memproses..." : `Bayar DP (${formatCurrency(r.totalAmount * 0.5)})`}
                        </button>
                      )}

                      {isDpPaid && (
                        <button
                          type="button"
                          className="btn btn-gold btn-sm"
                          id={`pay-settlement-${r.id}`}
                          disabled={payingId === r.id}
                          onClick={() => handlePayMidtrans(r, "settlement")}
                        >
                          {payingId === r.id ? "Memproses..." : `Pelunasan (${formatCurrency(remainingAmount)})`}
                        </button>
                      )}

                      <Link
                        href={`/reservation/status?id=${r.id}`}
                        className="btn btn-outline btn-sm"
                        id={`view-${r.id}`}
                      >
                        Detail Sesi →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Booking CTA */}
        <div className={styles.newResCta}>
          <Link href="/reservation" className="btn btn-gold btn-lg" id="new-reservation-btn">
            + Jadwalkan Sesi Foto Baru
          </Link>
        </div>
      </div>
    </div>
  );
}

