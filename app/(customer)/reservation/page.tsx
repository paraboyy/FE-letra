"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/data";
import { Package, Photographer, Reservation, User } from "@/lib/types";
import { packagesService, photographersService, reservationsService, paymentService, authService } from "@/lib/services";
import Icons from "@/components/shared/Icons";
import Link from "next/link";
import PhotographerDetailModal from "@/components/customer/PhotographerDetailModal";
import styles from "./page.module.css";

const STEPS = [
  { id: 1, label: "Pilih Paket", icon: <Icons.Package size={18} /> },
  { id: 2, label: "Data Klien", icon: <Icons.User size={18} /> },
  { id: 3, label: "Jadwal & Fotografer", icon: <Icons.Calendar size={18} /> },
  { id: 4, label: "Konfirmasi", icon: <Icons.CheckCircle size={18} /> },
];

const TIME_CATEGORIES = [
  {
    title: "Sesi Pagi",
    timePeriod: "09:00 – 11:30 WITA",
    slots: ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"],
  },
  {
    title: "Sesi Siang",
    timePeriod: "12:00 – 15:00 WITA",
    slots: ["12:00", "13:00", "13:30", "14:00", "14:30", "15:00"],
  },
  {
    title: "Sesi Sore & Golden Hour",
    timePeriod: "15:30 – 18:00 WITA",
    slots: ["15:30", "16:00", "16:30", "17:00", "17:30", "18:00"],
  },
];

function ReservationContent() {
  const searchParams = useSearchParams();
  const packageParam = searchParams.get("package");

  const [step, setStep] = useState(1);
  const [packages, setPackages] = useState<Package[]>([]);
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(packageParam || null);
  const [selectedPhotographer, setSelectedPhotographer] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "", notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState("");
  const [payingWithMidtrans, setPayingWithMidtrans] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [viewingPhotographer, setViewingPhotographer] = useState<Photographer | null>(null);

  useEffect(() => {
    async function initData() {
      const user = authService.getCurrentUser();
      setCurrentUser(user);

      if (user) {
        setForm((prev) => ({
          ...prev,
          name: prev.name || user.name || "",
          email: prev.email || user.email || "",
          phone: prev.phone || user.phone || "",
        }));
      }

      try {
        const [pkgs, phs] = await Promise.all([
          packagesService.getAll(),
          photographersService.getAll({ status: "active" }),
        ]);
        setPackages(pkgs);
        setPhotographers(phs);
        if (packageParam && pkgs.some((p) => p.id === packageParam)) {
          setSelectedPkg(packageParam);
        }
      } catch (err) {
        console.error("Failed to load reservation form data:", err);
      }
    }
    initData();
  }, [packageParam]);

  const pkg = packages.find((p) => p.id === selectedPkg);

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    if (!selectedPkg || !selectedPhotographer || !selectedDate || !selectedTime) {
      setErrorMsg("Mohon lengkapi seluruh kolom formulir reservasi.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const result = await reservationsService.create({
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        customerAddress: form.address,
        packageId: selectedPkg,
        photographerId: selectedPhotographer,
        date: selectedDate,
        time: selectedTime,
        notes: form.notes,
      });
      setCreatedReservation(result);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Gagal memproses reservasi. Silakan coba kembali.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayWithMidtrans = async (amountType: "full" | "dp") => {
    if (!createdReservation) return;

    setPayingWithMidtrans(true);
    try {
      const snapData = await paymentService.getSnapToken(createdReservation.id, amountType);

      // Check if Midtrans Snap SDK is loaded in window
      if (typeof window !== "undefined" && (window as any).snap) {
        (window as any).snap.pay(snapData.token, {
          onSuccess: async (result: any) => {
            await paymentService.confirmPayment({
              reservationId: createdReservation.id,
              amountType,
              paymentResult: result,
            });
            setPaymentSuccessMsg(
              `Pembayaran via Midtrans (${amountType === "dp" ? "DP 50%" : "Pelunasan Penuh"}) berhasil diverifikasi! Status reservasi telah terkonfirmasi otomatis.`
            );
            setCreatedReservation((prev) => (prev ? { ...prev, paymentStatus: amountType === "dp" ? "dp_paid" : "paid", status: "confirmed" } : null));
          },
          onPending: (result: any) => {
            alert("Menunggu pembayaran Anda diselesaikan melalui aplikasi/metode terpilih.");
          },
          onError: (result: any) => {
            alert("Pembayaran Midtrans tidak berhasil. Silakan coba metode pembayaran lain.");
          },
          onClose: () => {
            console.log("Customer closed the Midtrans Snap modal popup.");
          },
        });
      } else {
        // Fallback: direct simulation confirmation for dev sandbox testing
        await paymentService.confirmPayment({
          reservationId: createdReservation.id,
          amountType,
          paymentResult: { payment_type: "qris", transaction_status: "settlement" },
        });
        setPaymentSuccessMsg(
          `Pembayaran simulasi Sandbox Midtrans (${amountType === "dp" ? "DP 50%" : "Pelunasan Penuh"}) berhasil dikonfirmasi!`
        );
        setCreatedReservation((prev) => (prev ? { ...prev, paymentStatus: amountType === "dp" ? "dp_paid" : "paid", status: "confirmed" } : null));
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Gagal memproses pembayaran Midtrans.");
    } finally {
      setPayingWithMidtrans(false);
    }
  };

  const canNext = () => {
    if (step === 1) return !!selectedPkg;
    if (step === 2) return !!(form.name && form.phone && form.email);
    if (step === 3) return !!(selectedDate && selectedTime && selectedPhotographer);
    return true;
  };

  const selectedPhotographerObj = photographers.find((p) => p.id === selectedPhotographer);

  // Format date in Indonesian locale
  const getFormattedSelectedDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  // Success Screen
  if (createdReservation) {
    const isPaid = createdReservation.paymentStatus === "paid" || createdReservation.paymentStatus === "dp_paid";

    return (
      <div className={styles.successWrapper}>
        <div className="container">
          <div className={`card ${styles.successCard}`}>
            <div className={styles.successIcon}>
              <Icons.CheckCircle size={48} color="#C9A84C" />
            </div>
            <div className="section-eyebrow" style={{ justifyContent: "center" }}>Reservasi Berhasil Diajukan</div>
            <h1 className={styles.successTitle}>Terima Kasih, {createdReservation.customerName}!</h1>
            <p className={styles.successSub}>
              Permintaan booking sesi pemotretan Anda telah terdaftar di sistem Letra Studio.
            </p>

            <div className={styles.bookingCode}>
              <span className={styles.bookingCodeLabel}>Kode Reservasi Resmi</span>
              <span className={styles.bookingCodeValue}>{createdReservation.id}</span>
              <span className={styles.bookingCodeHint}>Simpan kode ini untuk melacak progres sesi Anda</span>
            </div>

            {paymentSuccessMsg && (
              <div style={{
                background: "rgba(76, 175, 136, 0.15)",
                border: "1px solid rgba(76, 175, 136, 0.3)",
                color: "#4CAF88",
                padding: "1rem",
                borderRadius: "10px",
                fontSize: "0.85rem",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <Icons.Check size={18} />
                <span>{paymentSuccessMsg}</span>
              </div>
            )}

            {/* Summary Details */}
            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}>
                <span>Paket Sesi</span>
                <span className={styles.summaryVal}>{createdReservation.packageName}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Fotografer Pendamping</span>
                <span className={styles.summaryVal}>{createdReservation.photographerName}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Tanggal & Waktu</span>
                <span className={styles.summaryVal}>{getFormattedSelectedDate(createdReservation.date)} · Pukul {createdReservation.time} WIB</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Total Biaya</span>
                <span className={styles.summaryVal} style={{ color: "var(--color-gold-primary)", fontWeight: 700 }}>
                  {formatCurrency(createdReservation.totalAmount)}
                </span>
              </div>
            </div>

            {/* Midtrans Online Payment Gateway Card */}
            {!isPaid && (
              <div style={{
                background: "linear-gradient(135deg, rgba(201, 168, 76, 0.08) 0%, rgba(20, 20, 20, 0.95) 100%)",
                border: "1px solid rgba(201, 168, 76, 0.3)",
                borderRadius: "12px",
                padding: "1.5rem",
                marginBottom: "1.75rem",
                textAlign: "left"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <Icons.CreditCard size={20} color="#C9A84C" />
                    <span style={{ fontWeight: 600, color: "#F0EDE8", fontSize: "0.95rem" }}>
                      Pembayaran Online via Midtrans Payment Gateway
                    </span>
                  </div>
                  <span className="badge badge-gold">Otomatis & Terverifikasi</span>
                </div>

                <p style={{ fontSize: "0.8rem", color: "#8C8680", marginBottom: "1rem", lineHeight: 1.5 }}>
                  Dukung berbagai metode pembayaran instan: <b>GoPay, QRIS, BCA Virtual Account, Mandiri, BNI, BRI, ShopeePay, dan Kartu Kredit</b>.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <button
                    type="button"
                    className="btn btn-gold"
                    id="pay-dp-midtrans-btn"
                    disabled={payingWithMidtrans}
                    onClick={() => handlePayWithMidtrans("dp")}
                    style={{ fontSize: "0.825rem", padding: "0.75rem 1rem" }}
                  >
                    {payingWithMidtrans ? "Menyiapkan Midtrans..." : `Bayar Deposit DP 50% (${formatCurrency(createdReservation.totalAmount * 0.5)})`}
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline"
                    id="pay-full-midtrans-btn"
                    disabled={payingWithMidtrans}
                    onClick={() => handlePayWithMidtrans("full")}
                    style={{ fontSize: "0.825rem", padding: "0.75rem 1rem" }}
                  >
                    {payingWithMidtrans ? "Menyiapkan Midtrans..." : `Pelunasan Penuh 100% (${formatCurrency(createdReservation.totalAmount)})`}
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className={styles.successActions}>
              <Link href={`/reservation/status?id=${createdReservation.id}`} className="btn btn-gold" id="track-booking-btn">
                Lacak Status Reservasi Ini →
              </Link>
              <Link href="/history" className="btn btn-outline" id="view-history-btn">
                Lihat Riwayat Sesi Saya
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerBg} />
        <div className="container">
          <div className={styles.headerContent}>
            <div className="section-eyebrow">Formulir Booking</div>
            <h1 className={styles.headerTitle}>Reservasi Sesi Studio</h1>
            <p className={styles.headerSubtitle}>
              Pilih paket foto, tentukan tanggal & waktu pemotretan yang ideal, serta pilih fotografer pendamping Anda.
            </p>
          </div>
        </div>
      </div>

      <div className="container section">
        {/* Stepper */}
        <div className={styles.stepper}>
          {STEPS.map((s, i) => (
            <div key={s.id} className={styles.stepperItem}>
              <div
                className={`${styles.stepCircle} ${step === s.id ? styles.stepActive : step > s.id ? styles.stepDone : ""}`}
              >
                {step > s.id ? <Icons.Check size={16} /> : s.icon}
              </div>
              <span className={`${styles.stepLabel} ${step >= s.id ? styles.stepLabelActive : ""}`}>{s.label}</span>
              {i < STEPS.length - 1 && (
                <div className={`${styles.stepLine} ${step > s.id ? styles.stepLineDone : ""}`} />
              )}
            </div>
          ))}
        </div>

        {errorMsg && (
          <div className={styles.errorAlert}>
            {errorMsg}
          </div>
        )}

        <div className={styles.formLayout}>
          {/* Main Form */}
          <div className={styles.formMain}>
            {/* Step 1: Choose Package */}
            {step === 1 && (
              <div className={`card ${styles.stepCard}`}>
                <h2 className={styles.stepTitle}>Langkah 1: Pilih Paket Foto</h2>
                <div className={styles.pkgGrid}>
                  {packages.map((p) => (
                    <div
                      key={p.id}
                      id={`select-pkg-${p.id}`}
                      className={`${styles.pkgOption} ${selectedPkg === p.id ? styles.pkgSelected : ""}`}
                      onClick={() => setSelectedPkg(p.id)}
                    >
                      <div className={styles.pkgOptionHeader}>
                        <div className={styles.packageIconWrap}>
                          <Icons.Camera size={20} color="#C9A84C" />
                        </div>
                        <div>
                          <div className={styles.pkgOptionName}>{p.name}</div>
                          <div className={styles.pkgOptionMeta}>{p.duration} · {p.editedPhotos} retouched photos</div>
                        </div>
                      </div>
                      <div className={styles.pkgOptionPrice}>{formatCurrency(p.price)}</div>
                      {selectedPkg === p.id && (
                        <div className={styles.pkgCheckmark}>
                          <Icons.Check size={12} color="#0A0A0A" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Personal Data */}
            {step === 2 && (
              <div className={`card ${styles.stepCard}`}>
                <h2 className={styles.stepTitle}>Langkah 2: Data Lengkap Klien</h2>

                {currentUser ? (
                  <div style={{
                    padding: "0.75rem 1rem",
                    background: "rgba(201, 168, 76, 0.08)",
                    border: "1px solid rgba(201, 168, 76, 0.25)",
                    borderRadius: "8px",
                    marginBottom: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    fontSize: "0.825rem",
                    color: "#F0EDE8"
                  }}>
                    <Icons.Sparkles size={16} color="#C9A84C" />
                    <span>
                      Data otomatis terisi dari akun Anda (<b>{currentUser.name}</b>). Anda tetap dapat mengubah kolom di bawah jika reservasi ditujukan untuk orang lain.
                    </span>
                  </div>
                ) : (
                  <div style={{
                    padding: "0.6rem 0.85rem",
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px dashed rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                    marginBottom: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.8rem",
                    color: "#8C8680"
                  }}>
                    <span>Sudah memiliki akun terdaftar di Letra Studio?</span>
                    <Link href="/auth/login" style={{ color: "#C9A84C", fontWeight: 600, textDecoration: "none" }}>
                      Masuk untuk Isi Otomatis →
                    </Link>
                  </div>
                )}

                <div className={styles.formGrid}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="res-name">Nama Lengkap *</label>
                    <input
                      id="res-name"
                      type="text"
                      className="form-input"
                      placeholder="Masukkan nama Anda"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="res-phone">Nomor WhatsApp / Telepon *</label>
                    <input
                      id="res-phone"
                      type="tel"
                      className="form-input"
                      placeholder="08xx-xxxx-xxxx"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label" htmlFor="res-email">Alamat Email *</label>
                    <input
                      id="res-email"
                      type="email"
                      className="form-input"
                      placeholder="nama@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label" htmlFor="res-address">Alamat Domisili (Opsional)</label>
                    <input
                      id="res-address"
                      type="text"
                      className="form-input"
                      placeholder="Kota / Alamat domisili"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label" htmlFor="res-notes">Catatan Tambahan / Konsep Pemotretan</label>
                    <textarea
                      id="res-notes"
                      className="form-input"
                      rows={3}
                      placeholder="Contoh: membawa kostum tambahan, konsep foto keluarga 5 orang, dresscode hitam elegan..."
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Schedule & Photographer */}
            {step === 3 && (
              <div className={`card ${styles.stepCard}`}>
                <h2 className={styles.stepTitle}>Langkah 3: Jadwal & Fotografer</h2>

                {/* Date Selection */}
                <div>
                  <div className={styles.sectionHeaderGroup}>
                    <label className={styles.sectionGroupTitle} htmlFor="res-date">
                      <Icons.Calendar size={16} color="#C9A84C" />
                      <span>1. Tentukan Tanggal Pemotretan *</span>
                    </label>
                  </div>
                  <input
                    id="res-date"
                    type="date"
                    className="form-input"
                    value={selectedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={{ maxWidth: "340px" }}
                  />
                  {selectedDate && (
                    <div>
                      <div className={styles.dateDisplayPill}>
                        <Icons.CheckCircle size={15} color="#C9A84C" />
                        <span>Sesi Terpilih: <b>{getFormattedSelectedDate(selectedDate)}</b></span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Categorized Time Slots */}
                <div className={styles.timeSlotSection}>
                  <div className={styles.sectionHeaderGroup}>
                    <label className={styles.sectionGroupTitle}>
                      <Icons.Clock size={16} color="#C9A84C" />
                      <span>2. Pilih Jam Mulai Sesi Studio *</span>
                    </label>
                    {pkg && (
                      <span style={{ fontSize: "0.75rem", color: "#C9A84C", fontWeight: 600 }}>
                        Estimasi Durasi: {pkg.duration}
                      </span>
                    )}
                  </div>

                  <div className={styles.timeCategoryGrid}>
                    {TIME_CATEGORIES.map((cat) => (
                      <div key={cat.title} className={styles.timeCategoryBox}>
                        <div className={styles.timeCategoryHeader}>
                          <span>{cat.title}</span>
                          <span style={{ fontSize: "0.65rem", color: "#8C8680", textTransform: "none", fontWeight: 400 }}>
                            {cat.timePeriod}
                          </span>
                        </div>
                        <div className={styles.timeSlotsSubgrid}>
                          {cat.slots.map((slotTime) => (
                            <button
                              key={slotTime}
                              type="button"
                              id={`slot-${slotTime.replace(":", "")}`}
                              className={`${styles.timeBtn} ${selectedTime === slotTime ? styles.timeSelected : ""}`}
                              onClick={() => setSelectedTime(slotTime)}
                            >
                              {slotTime} WIB
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Luxury Photographers Selection */}
                <div className={styles.photographerSection}>
                  <div className={styles.sectionHeaderGroup}>
                    <label className={styles.sectionGroupTitle}>
                      <Icons.Camera size={16} color="#C9A84C" />
                      <span>3. Pilih Fotografer Pendamping *</span>
                    </label>
                    <span style={{ fontSize: "0.75rem", color: "#8C8680" }}>
                      {photographers.length} Staf Fotografer Aktif
                    </span>
                  </div>

                  <div className={styles.photographerGrid}>
                    {photographers.map((p) => {
                      const isSelected = selectedPhotographer === p.id;
                      return (
                        <div
                          key={p.id}
                          id={`select-photographer-${p.id}`}
                          className={`${styles.photographerCard} ${isSelected ? styles.photographerSelected : ""}`}
                          onClick={() => setSelectedPhotographer(p.id)}
                        >
                          <div className={styles.photographerTop}>
                            {p.photo ? (
                              <img
                                src={p.photo}
                                alt={p.name}
                                className={styles.photographerAvatarImg}
                              />
                            ) : (
                              <div className={styles.photographerAvatar}>
                                {p.name.charAt(0)}
                              </div>
                            )}
                            <div className={styles.photographerMeta}>
                              <div className={styles.photographerName}>{p.name}</div>
                              <div className={styles.photographerExp}>
                                <span>★ {p.rating || 5.0}</span>
                                <span>·</span>
                                <span>{p.experience}</span>
                                {p.totalSessions && (
                                  <>
                                    <span>·</span>
                                    <span>{p.totalSessions} Sesi</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className={styles.photographerSpecialties}>
                            {p.specialty?.map((s) => (
                              <span key={s} className={styles.specialtyPill}>{s}</span>
                            ))}
                          </div>

                          <div className={styles.scheduleAvailability}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} />
                            <span>Tersedia untuk Sesi Studio</span>
                          </div>

                          <div className={styles.photographerCardFooter}>
                            <button
                              type="button"
                              className={styles.viewPortfolioBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingPhotographer(p);
                              }}
                              title="Lihat Detail Profil & Portofolio Karya"
                            >
                              <Icons.Eye size={13} color="#C9A84C" />
                              <span>Detail & Portofolio</span>
                            </button>

                            <button
                              type="button"
                              className={`${styles.selectPhotographerBtn} ${isSelected ? styles.selectedBtnActive : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPhotographer(p.id);
                              }}
                            >
                              {isSelected ? (
                                <>
                                  <Icons.Check size={12} />
                                  <span>Terpilih</span>
                                </>
                              ) : (
                                <span>Pilih</span>
                              )}
                            </button>
                          </div>

                          {isSelected && (
                            <div className={styles.pkgCheckmark}>
                              <Icons.Check size={12} color="#0A0A0A" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Confirmation */}
            {step === 4 && (
              <div className={`card ${styles.stepCard}`}>
                <h2 className={styles.stepTitle}>Langkah 4: Konfirmasi Rincian Pemesanan</h2>
                <div className={styles.reviewBox}>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Paket Foto</span>
                    <span className={styles.reviewValue}>{pkg?.name} ({formatCurrency(pkg?.price || 0)})</span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Nama Pemesan</span>
                    <span className={styles.reviewValue}>{form.name}</span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Kontak WhatsApp</span>
                    <span className={styles.reviewValue}>{form.phone}</span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Email Konfirmasi</span>
                    <span className={styles.reviewValue}>{form.email}</span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Jadwal Sesi</span>
                    <span className={styles.reviewValue}>
                      {getFormattedSelectedDate(selectedDate)} · Pukul {selectedTime} WIB
                    </span>
                  </div>
                  <div className={styles.reviewRow}>
                    <span className={styles.reviewLabel}>Fotografer Pendamping</span>
                    <span className={styles.reviewValue}>{selectedPhotographerObj?.name}</span>
                  </div>
                  {form.notes && (
                    <div className={styles.reviewRow}>
                      <span className={styles.reviewLabel}>Catatan Khusus</span>
                      <span className={styles.reviewValue}>{form.notes}</span>
                    </div>
                  )}
                  <div className={styles.reviewTotal}>
                    <span>Total Estimasi Biaya</span>
                    <span className={styles.reviewTotalAmount}>{formatCurrency(pkg?.price || 0)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className={styles.formNav}>
              {step > 1 && (
                <button
                  type="button"
                  className="btn btn-outline"
                  id="prev-step-btn"
                  onClick={() => setStep(step - 1)}
                  disabled={submitting}
                >
                  ← Langkah Sebelumnya
                </button>
              )}
              <button
                type="button"
                className={`btn btn-gold ${step === 1 ? "w-full" : ""}`}
                id="next-step-btn"
                disabled={!canNext() || submitting}
                onClick={handleNext}
              >
                {submitting ? "Memproses Pemesanan..." : step === 4 ? "Kirim Permintaan Booking →" : "Lanjutkan →"}
              </button>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className={styles.formSidebar}>
            <div className={`card ${styles.summaryCard}`}>
              <h3 className={styles.summaryCardTitle}>Ringkasan Booking</h3>
              <div className="divider" style={{ margin: "1rem 0" }} />

              {pkg ? (
                <div className={styles.sidebarPkg}>
                  <div className={styles.sidebarPkgName}>{pkg.name}</div>
                  <div className={styles.sidebarPkgMeta}>{pkg.duration} · {pkg.editedPhotos} foto teredit</div>
                  <div className={styles.sidebarPkgPrice}>{formatCurrency(pkg.price)}</div>
                </div>
              ) : (
                <p className={styles.placeholderText}>Belum ada paket yang dipilih</p>
              )}

              {selectedDate && (
                <div className={styles.sidebarDetail}>
                  <Icons.Calendar size={15} color="#C9A84C" />
                  <span>{getFormattedSelectedDate(selectedDate)} {selectedTime && `· ${selectedTime} WIB`}</span>
                </div>
              )}

              {selectedPhotographerObj && (
                <div className={styles.sidebarDetail}>
                  <Icons.Camera size={15} color="#C9A84C" />
                  <span>Fotografer: {selectedPhotographerObj.name}</span>
                </div>
              )}

              <div className="divider" style={{ margin: "1rem 0" }} />
              <div className={styles.sidebarTotal}>
                <span>Estimasi Biaya</span>
                <span className={styles.sidebarTotalVal}>{formatCurrency(pkg?.price || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Photographer Detail & Portfolio Modal */}
      <PhotographerDetailModal
        photographer={viewingPhotographer}
        isOpen={!!viewingPhotographer}
        onClose={() => setViewingPhotographer(null)}
        onSelectPhotographer={(id) => setSelectedPhotographer(id)}
        isSelected={viewingPhotographer ? selectedPhotographer === viewingPhotographer.id : false}
      />
    </div>
  );
}

export default function ReservationPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-gold-primary)" }}>Memuat formulir booking...</div>}>
      <ReservationContent />
    </Suspense>
  );
}
