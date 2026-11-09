"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { STATUS_CONFIG, formatDate, formatCurrency, STUDIO_INFO } from "@/lib/data";
import { Reservation } from "@/lib/types";
import { reservationsService, paymentService } from "@/lib/services";
import Icons from "@/components/shared/Icons";
import styles from "./page.module.css";
import Link from "next/link";

function ReservationStatusContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";

  const [searchId, setSearchId] = useState(initialId);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(Boolean(initialId));
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchStatus = async (id: string) => {
    if (!id.trim()) {
      setError("Silakan masukkan nomor kode reservasi Anda.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const data = await reservationsService.getById(id.trim());
      setReservation(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : `Nomor reservasi '${id}' tidak ditemukan.`);
      setReservation(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      setSearchId(initialId);
      fetchStatus(initialId);
    } else {
      setSearchId("");
      setReservation(null);
      setLoading(false);
    }
  }, [initialId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(searchId);
  };

  const handleCopyId = () => {
    if (!reservation) return;
    navigator.clipboard.writeText(reservation.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handlePayMidtrans = async (amountType: "dp" | "settlement" | "full") => {
    if (!reservation) return;

    setPaying(true);
    try {
      const snapData = await paymentService.getSnapToken(reservation.id, amountType);

      if (typeof window !== "undefined" && (window as any).snap) {
        (window as any).snap.pay(snapData.token, {
          onSuccess: async (result: any) => {
            await paymentService.confirmPayment({
              reservationId: reservation.id,
              amountType,
              paymentResult: result,
            });
            alert(
              amountType === "settlement"
                ? "Pelunasan sisa berhasil diverifikasi! Reservasi Anda telah Lunas Penuh."
                : "Pembayaran Midtrans berhasil diverifikasi!"
            );
            fetchStatus(reservation.id);
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
          reservationId: reservation.id,
          amountType,
          paymentResult: { payment_type: "qris", transaction_status: "settlement" },
        });
        alert(
          amountType === "settlement"
            ? "Pelunasan sisa berhasil dikonfirmasi! Status pemesanan Anda kini Lunas Penuh."
            : "Pembayaran simulasi Sandbox Midtrans berhasil dikonfirmasi!"
        );
        fetchStatus(reservation.id);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal memproses sesi pembayaran Midtrans.");
    } finally {
      setPaying(false);
    }
  };

  const statusInfo = reservation
    ? STATUS_CONFIG[reservation.status] || { label: reservation.status, class: "badge-neutral" }
    : null;
  const paymentInfo = reservation
    ? STATUS_CONFIG[reservation.paymentStatus] || { label: reservation.paymentStatus, class: "badge-neutral" }
    : null;

  const isPendingPayment = reservation?.paymentStatus === "pending";
  const isDpPaid = reservation?.paymentStatus === "dp_paid";
  const remainingAmount = reservation ? reservation.totalAmount * 0.5 : 0;

  const TIMELINE = reservation
    ? [
        {
          label: "Pemesanan Terdaftar",
          sub: "Data reservasi diterima oleh studio",
          done: true,
          active: false,
        },
        {
          label: "Verifikasi Pembayaran",
          sub: isPendingPayment ? "Menunggu pembayaran deposit DP" : "Deposit telah terkonfirmasi",
          done: reservation.paymentStatus !== "pending",
          active: isPendingPayment,
        },
        {
          label: "Konfirmasi Jadwal Studio",
          sub: `Fotografer: ${reservation.photographerName}`,
          done: reservation.status !== "pending",
          active: reservation.status === "pending" && !isPendingPayment,
        },
        {
          label: "Pelaksanaan Sesi Foto",
          sub: "Sesi pemotretan di studio Jimbaran",
          done: reservation.status === "completed",
          active: reservation.status === "confirmed",
        },
        {
          label: "Master File & Galeri Cloud",
          sub: "Penyerahan foto hasil retouch & resolusi tinggi",
          done: reservation.status === "completed",
          active: false,
        },
      ]
    : [];

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerBg} />
        <div className="container">
          <div className={styles.headerContent}>
            <div className="section-eyebrow">Informasi Pemesanan</div>
            <h1 className={styles.headerTitle}>Detail & Pelacakan Reservasi</h1>
            <p className={styles.headerSubtitle}>
              Periksa rincian sesi foto, status verifikasi pembayaran, fotografer pendamping, dan simpan bukti pemesanan Anda.
            </p>
          </div>
        </div>
      </div>

      <div className="container section">
        {/* Top Navigation Row */}
        <div className={styles.topNavRow}>
          <Link href="/history" className={styles.backLink}>
            ← Kembali ke Riwayat Sesi
          </Link>

          <form onSubmit={handleSearch} className={styles.miniSearchForm}>
            <input
              type="text"
              className={styles.miniSearchInput}
              placeholder="Cari ID Lain (cth: RES-2024-001)"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
            <button type="submit" className="btn btn-gold btn-sm" disabled={loading}>
              {loading ? "..." : "Cari"}
            </button>
          </form>
        </div>

        {/* Error Notification */}
        {error && (
          <div
            style={{
              background: "rgba(224,85,85,0.1)",
              border: "1px solid rgba(224,85,85,0.3)",
              color: "var(--color-danger)",
              padding: "1.25rem",
              borderRadius: "12px",
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Loading Spinner */}
        {loading && (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gold-primary)" }}>
            <Icons.RefreshCw size={28} className="animate-spin" style={{ margin: "0 auto 1rem auto" }} />
            <div>Memuat data rincian reservasi...</div>
          </div>
        )}

        {/* Empty State (When no ID loaded) */}
        {!loading && !reservation && (
          <div className={styles.lookupCard}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
              <Icons.Search size={40} color="#7E7873" />
            </div>
            <h3 style={{ color: "#FFFFFF", fontSize: "1.25rem", marginBottom: "0.5rem" }}>
              Lacak Kode Reservasi Anda
            </h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.875rem", lineHeight: 1.6 }}>
              Ketikkan nomor kode reservasi yang Anda dapatkan saat booking (misal: <code>RES-2024-001</code>).
            </p>

            <form onSubmit={handleSearch} className={styles.lookupForm}>
              <input
                type="text"
                className={styles.lookupInput}
                placeholder="Masukkan Kode Reservasi..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <button type="submit" className="btn btn-gold">
                Lacak
              </button>
            </form>

            <div style={{ marginTop: "1.5rem" }}>
              <Link href="/reservation" className="btn btn-outline btn-sm">
                + Buat Reservasi Baru
              </Link>
            </div>
          </div>
        )}

        {/* Result: Clean 2-Column Detail Layout */}
        {!loading && reservation && (
          <div className={styles.detailGrid}>
            {/* Left Main Card */}
            <div className={styles.mainCard} id="printable-area">
              {/* Card Header */}
              <div className={styles.cardHeader}>
                <div>
                  <div className={styles.codeBadgeRow}>
                    <button
                      type="button"
                      className={styles.codeBadge}
                      onClick={handleCopyId}
                      title="Klik untuk menyalin"
                    >
                      <Icons.Copy size={13} />
                      <span>{reservation.id}</span>
                      {copied && <span style={{ color: "#4CAF88" }}>✓ Tersalin</span>}
                    </button>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                      Dipesan pada {formatDate(reservation.createdAt || reservation.date)}
                    </span>
                  </div>
                  <h2 className={styles.packageName}>{reservation.packageName}</h2>
                </div>

                <div className={styles.badgesGroup}>
                  <span className={`badge ${statusInfo?.class}`}>{statusInfo?.label}</span>
                  <span className={`badge ${paymentInfo?.class}`}>{paymentInfo?.label}</span>
                </div>
              </div>

              {/* Information Grid */}
              <div className={styles.infoSectionTitle}>Rincian Sesi Pemotretan</div>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <Icons.Calendar size={18} className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>Tanggal Sesi</div>
                    <div className={styles.infoValue}>{formatDate(reservation.date)}</div>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Icons.Clock size={18} className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>Waktu Kunjungan</div>
                    <div className={styles.infoValue}>{reservation.time} WITA (Bali)</div>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Icons.User size={18} className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>Fotografer Bertugas</div>
                    <div className={styles.infoValue}>{reservation.photographerName}</div>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Icons.Package size={18} className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>Durasi Pemotretan</div>
                    <div className={styles.infoValue}>{reservation.duration}</div>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Icons.Users size={18} className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>Nama Klien</div>
                    <div className={styles.infoValue}>{reservation.customerName}</div>
                  </div>
                </div>

                <div className={styles.infoItem}>
                  <Icons.Phone size={18} className={styles.infoIcon} />
                  <div>
                    <div className={styles.infoLabel}>Nomor WhatsApp</div>
                    <div className={styles.infoValue}>{reservation.customerPhone}</div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {reservation.notes && (
                <div className={styles.notesBox}>
                  <div className={styles.notesLabel}>Catatan Dari Klien</div>
                  <div className={styles.notesText}>{reservation.notes}</div>
                </div>
              )}

              {/* Billing Summary */}
              <div className={styles.billingCard}>
                <div className={styles.billingHeader}>
                  <div className={styles.billingTitle}>Ringkasan Pembayaran</div>
                  <div className={styles.billingTotal}>{formatCurrency(reservation.totalAmount)}</div>
                </div>

                <div className={styles.billingRows}>
                  <div className={styles.billingRow}>
                    <span>Status Verifikasi:</span>
                    <span
                      className={styles.billingRowVal}
                      style={{
                        color: paymentInfo?.class.includes("success") ? "#4CAF88" : "#F0A050",
                        fontWeight: 600,
                      }}
                    >
                      {paymentInfo?.label}
                    </span>
                  </div>

                  {isDpPaid && (
                    <div className={styles.billingRow}>
                      <span>Sisa Tagihan Pelunasan (50%):</span>
                      <span className={styles.billingRowVal} style={{ color: "var(--color-gold-primary)", fontWeight: 700 }}>
                        {formatCurrency(remainingAmount)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Midtrans Payment */}
                {isPendingPayment && (
                  <div className={styles.paymentPrompt}>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#FFFFFF" }}>
                        Selesaikan Pembayaran via Midtrans Gateway
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        Pilih DP 50% atau pelunasan penuh untuk mengunci jadwal sesi Anda.
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="btn btn-gold btn-sm"
                        disabled={paying}
                        onClick={() => handlePayMidtrans("dp")}
                      >
                        <Icons.CreditCard size={14} style={{ marginRight: 4 }} />
                        {paying ? "Memproses..." : `Bayar DP (${formatCurrency(reservation.totalAmount * 0.5)})`}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        disabled={paying}
                        onClick={() => handlePayMidtrans("full")}
                      >
                        {paying ? "Memproses..." : `Pelunasan Penuh (${formatCurrency(reservation.totalAmount)})`}
                      </button>
                    </div>
                  </div>
                )}

                {isDpPaid && (
                  <div className={styles.paymentPrompt}>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#FFFFFF" }}>
                        Deposit DP 50% Telah Diterima
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                        Pelunasan sisa sebesar {formatCurrency(remainingAmount)} dapat diselesaikan sekarang.
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn btn-gold btn-sm"
                      disabled={paying}
                      onClick={() => handlePayMidtrans("settlement")}
                    >
                      {paying ? "Memproses..." : `Pelunasan Sisa (${formatCurrency(remainingAmount)})`}
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Action Buttons */}
              <div className={styles.actionRow}>
                <div className={styles.actionBtnGroup}>
                  <button type="button" className="btn btn-outline btn-sm" onClick={handlePrint}>
                    <Icons.Printer size={14} />
                    <span>Cetak Bukti Reservasi</span>
                  </button>
                  <a
                    href={`https://wa.me/6282340619880?text=Halo%20Letra%20Studio,%20saya%20ingin%20bertanya%20mengenai%20reservasi%20saya%20dengan%20Kode%20${reservation.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    <Icons.MessageSquare size={14} />
                    <span>Chat WhatsApp Studio</span>
                  </a>
                </div>

                <a
                  href="https://www.google.com/maps/place/Letra+Studio/@-8.7771849,115.1807007,955m/data=!3m2!1e3!4b1!4m6!3m5!1s0x2dd245e838f2176d:0x68804cb55cf165a7!8m2!3d-8.7771849!4d115.1832756!16s%2Fg%2F11t4fysdsm"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-ghost btn-sm"
                  style={{ color: "var(--color-gold-light)" }}
                >
                  <Icons.MapPin size={14} />
                  <span>Petunjuk Arah Google Maps →</span>
                </a>
              </div>
            </div>

            {/* Right Sidebar: Timeline & Studio Info */}
            <div>
              <div className={styles.sidebarCard}>
                <div className={styles.sidebarTitle}>
                  <Icons.Sliders size={16} />
                  <span>Status Sesi</span>
                </div>

                <div className={styles.timeline}>
                  {TIMELINE.map((item, i) => (
                    <div
                      key={i}
                      className={`${styles.timelineItem} ${item.done ? styles.timelineDone : ""} ${
                        item.active ? styles.timelineActive : ""
                      }`}
                    >
                      <div className={styles.timelineDot}>
                        {item.done ? <Icons.Check size={12} /> : i + 1}
                      </div>

                      {i < TIMELINE.length - 1 && (
                        <div
                          className={`${styles.timelineLine} ${
                            TIMELINE[i + 1].done ? styles.timelineLineDone : ""
                          }`}
                        />
                      )}

                      <div className={styles.timelineText}>
                        <div className={styles.timelineLabel}>{item.label}</div>
                        <div className={styles.timelineSub}>{item.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Studio Info Card */}
                <div className={styles.studioBox}>
                  <div className={styles.studioBoxTitle}>Lokasi & Kontak Studio</div>
                  <div className={styles.studioBoxText}>
                    <strong>Letra Studio Jimbaran</strong>
                    <div style={{ marginTop: "0.2rem", color: "var(--color-text-muted)" }}>
                      {STUDIO_INFO.address}
                    </div>
                    <div style={{ marginTop: "0.35rem", color: "var(--color-gold-light)", fontSize: "0.75rem" }}>
                      Buka Setiap Hari: 09:00 – 19:00 WITA
                    </div>
                  </div>
                </div>

                <a
                  href={`https://wa.me/6282340619880?text=Halo%20Letra%20Studio,%20saya%20ingin%20konsultasi%20jadwal%20${reservation.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-gold btn-sm w-full"
                  style={{ justifyContent: "center" }}
                >
                  <Icons.Phone size={14} />
                  <span>Konsultasi Studio via WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ReservationStatusPage() {
  return (
    <Suspense
      fallback={
        <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-gold-primary)" }}>
          Memuat status pelacakan...
        </div>
      }
    >
      <ReservationStatusContent />
    </Suspense>
  );
}
