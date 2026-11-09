"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { STATUS_CONFIG, formatDate, formatCurrency } from "@/lib/data";
import { Reservation, ReservationStatus, User } from "@/lib/types";
import { reservationsService, authService } from "@/lib/services";
import Icons from "@/components/shared/Icons";
import styles from "./page.module.css";

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"pending" | "confirmed" | "completed" | "all">("pending");
  const [viewMode, setViewMode] = useState<"stream" | "kanban">("stream");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedRes, setSelectedRes] = useState<Reservation | null>(null);
  const [, startTransition] = useTransition();

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await reservationsService.getAll();
      setReservations(data);
    } catch (err) {
      console.error("Failed to load reservations from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
    loadReservations();
  }, []);

  const handleStatusChange = async (id: string, newStatus: ReservationStatus) => {
    setUpdatingId(id);
    try {
      const updated = await reservationsService.updateStatus(id, newStatus);
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
      if (selectedRes && selectedRes.id === id) {
        setSelectedRes(updated);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengupdate status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Hapus data reservasi ${id} secara permanen dari sistem studio?`)) return;
    try {
      await reservationsService.delete(id);
      setReservations((prev) => prev.filter((r) => r.id !== id));
      if (selectedRes && selectedRes.id === id) {
        setSelectedRes(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus reservasi.");
    }
  };

  const handleCopyId = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // KPIs
  const pendingCount = useMemo(() => reservations.filter((r) => r.status === "pending").length, [reservations]);
  const confirmedCount = useMemo(() => reservations.filter((r) => r.status === "confirmed").length, [reservations]);
  const completedCount = useMemo(() => reservations.filter((r) => r.status === "completed").length, [reservations]);

  // Tab Filtering & Search
  const filteredList = useMemo(() => {
    let list = reservations;

    if (activeTab === "pending") {
      list = list.filter((r) => r.status === "pending");
    } else if (activeTab === "confirmed") {
      list = list.filter((r) => r.status === "confirmed");
    } else if (activeTab === "completed") {
      list = list.filter((r) => r.status === "completed");
    }

    if (selectedDate) {
      list = list.filter((r) => r.date === selectedDate);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.customerName.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q) ||
          r.customerPhone.toLowerCase().includes(q) ||
          r.packageName.toLowerCase().includes(q) ||
          (r.photographerName && r.photographerName.toLowerCase().includes(q))
      );
    }

    return list;
  }, [reservations, activeTab, selectedDate, searchTerm]);

  // Kanban Columns
  const kanbanPending = useMemo(() => reservations.filter((r) => r.status === "pending"), [reservations]);
  const kanbanConfirmed = useMemo(() => reservations.filter((r) => r.status === "confirmed"), [reservations]);
  const kanbanCompleted = useMemo(() => reservations.filter((r) => r.status === "completed"), [reservations]);

  const getPackageIcon = (pkgName: string) => {
    const name = pkgName.toLowerCase();
    if (name.includes("pre-wed") || name.includes("wedding") || name.includes("couple")) return "💍";
    if (name.includes("wisuda") || name.includes("graduat")) return "🎓";
    if (name.includes("keluarga") || name.includes("family")) return "👨‍👩‍👧‍👦";
    if (name.includes("bisnis") || name.includes("product") || name.includes("commercial")) return "💼";
    return "📷";
  };

  return (
    <div className={styles.page}>
      {/* Top Command Bar */}
      <div className={styles.topCommandBar}>
        <div className={styles.commandTitleArea}>
          <div className={styles.studioPulseTag}>
            <span className={styles.pulseDot} />
            <span>Studio Operations Command · Jimbaran HQ</span>
          </div>
          <h1 className={styles.commandTitle}>Antrean & Manajemen Sesi Foto</h1>
        </div>

        <div className={styles.commandActions}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={loadReservations}
            title="Segarkan data dari server"
          >
            <Icons.RefreshCw size={14} />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* 4 Interactive KPI Cards */}
      <div className={styles.metricsGrid}>
        <div
          className={`${styles.metricCard} ${pendingCount > 0 ? styles.metricCardUrgent : ""} ${activeTab === "pending" ? styles.metricCardActive : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          <div className={styles.metricIcon} style={{ color: "#F0A050" }}>
            <Icons.AlertCircle size={20} />
          </div>
          <div>
            <div className={styles.metricVal} style={{ color: "#F0A050" }}>{pendingCount}</div>
            <div className={styles.metricLabel}>Perlu Konfirmasi Segera</div>
          </div>
        </div>

        <div
          className={`${styles.metricCard} ${activeTab === "confirmed" ? styles.metricCardActive : ""}`}
          onClick={() => setActiveTab("confirmed")}
        >
          <div className={styles.metricIcon} style={{ color: "#5090E0" }}>
            <Icons.Clock size={20} />
          </div>
          <div>
            <div className={styles.metricVal} style={{ color: "#5090E0" }}>{confirmedCount}</div>
            <div className={styles.metricLabel}>Sesi Terjadwal Mendatang</div>
          </div>
        </div>

        <div
          className={`${styles.metricCard} ${activeTab === "completed" ? styles.metricCardActive : ""}`}
          onClick={() => setActiveTab("completed")}
        >
          <div className={styles.metricIcon} style={{ color: "#4CAF88" }}>
            <Icons.CheckCircle size={20} />
          </div>
          <div>
            <div className={styles.metricVal} style={{ color: "#4CAF88" }}>{completedCount}</div>
            <div className={styles.metricLabel}>Sesi Selesai Berhasil</div>
          </div>
        </div>

        <div
          className={`${styles.metricCard} ${activeTab === "all" ? styles.metricCardActive : ""}`}
          onClick={() => setActiveTab("all")}
        >
          <div className={styles.metricIcon} style={{ color: "var(--color-gold-primary)" }}>
            <Icons.Package size={20} />
          </div>
          <div>
            <div className={styles.metricVal}>{reservations.length}</div>
            <div className={styles.metricLabel}>Total Keseluruhan Sesi</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className={styles.filterRow}>
        <div className={styles.tabSegmented}>
          <button
            type="button"
            className={`${styles.tabSegmentBtn} ${activeTab === "pending" ? styles.tabSegmentBtnActive : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            <span>Menunggu</span>
            {pendingCount > 0 && <span className={styles.counterBadge}>{pendingCount}</span>}
          </button>

          <button
            type="button"
            className={`${styles.tabSegmentBtn} ${activeTab === "confirmed" ? styles.tabSegmentBtnActive : ""}`}
            onClick={() => setActiveTab("confirmed")}
          >
            <span>Terjadwal</span>
            <span style={{ fontSize: "0.7rem", opacity: 0.75 }}>({confirmedCount})</span>
          </button>

          <button
            type="button"
            className={`${styles.tabSegmentBtn} ${activeTab === "completed" ? styles.tabSegmentBtnActive : ""}`}
            onClick={() => setActiveTab("completed")}
          >
            <span>Selesai</span>
          </button>

          <button
            type="button"
            className={`${styles.tabSegmentBtn} ${activeTab === "all" ? styles.tabSegmentBtnActive : ""}`}
            onClick={() => setActiveTab("all")}
          >
            <span>Semua Sesi</span>
          </button>
        </div>

        <div className={styles.searchAndControls}>
          {/* Date Picker */}
          <input
            type="date"
            className={styles.dateInput}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            title="Filter tanggal sesi"
          />

          {selectedDate && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setSelectedDate("")}
              style={{ color: "#E05555", fontSize: "0.75rem" }}
            >
              ✕ Hapus Tanggal
            </button>
          )}

          {/* Search Box */}
          <div className={styles.searchBox}>
            <Icons.Search size={15} color="#888" />
            <input
              type="search"
              placeholder="Cari nama klien, no telepon, atau ID..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => startTransition(() => setSearchTerm(e.target.value))}
            />
          </div>

          {/* View Mode Toggle (Stream vs Kanban) */}
          <div className={styles.viewModeToggle}>
            <button
              type="button"
              className={`${styles.viewModeBtn} ${viewMode === "stream" ? styles.viewModeBtnActive : ""}`}
              onClick={() => setViewMode("stream")}
              title="Tampilan Alur Baris (Stream View)"
            >
              <Icons.Layers size={14} />
            </button>
            <button
              type="button"
              className={`${styles.viewModeBtn} ${viewMode === "kanban" ? styles.viewModeBtnActive : ""}`}
              onClick={() => setViewMode("kanban")}
              title="Tampilan Papan Kanban (Kanban View)"
            >
              <Icons.Grid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* MAIN VIEW CONTENT */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-gold-primary)" }}>
          <Icons.RefreshCw size={26} className="animate-spin" style={{ margin: "0 auto 0.75rem" }} />
          <div>Memuat antrean studio...</div>
        </div>
      ) : viewMode === "stream" ? (
        /* ================= STREAM / CARD LIST VIEW ================= */
        filteredList.length === 0 ? (
          <div className={styles.emptyState}>
            <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
              {activeTab === "pending" ? "🎉" : "📋"}
            </div>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "#FFFFFF", marginBottom: "0.25rem" }}>
              {activeTab === "pending"
                ? "Semua Antrean Bersih & Terkonfirmasi"
                : "Tidak ada data reservasi ditemukan"}
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
              {activeTab === "pending"
                ? "Tidak ada sesi foto yang membutuhkan konfirmasi manual saat ini."
                : "Ubah kata kunci pencarian atau ganti filter kategori di atas."}
            </p>
          </div>
        ) : (
          <div className={styles.streamContainer}>
            {filteredList.map((r) => {
              const statusInfo = STATUS_CONFIG[r.status];
              const isPaid = r.paymentStatus === "paid";
              const isDP = r.paymentStatus === "dp_paid";

              return (
                <div
                  key={r.id}
                  className={styles.streamCard}
                  onClick={() => setSelectedRes(r)}
                >
                  {/* 1. Time & Date Slot */}
                  <div className={styles.streamTimeBlock}>
                    <div className={styles.timeChip}>
                      <Icons.Clock size={12} />
                      <span>{r.time} WITA</span>
                    </div>
                    <span className={styles.dateSub}>{formatDate(r.date)}</span>
                  </div>

                  {/* 2. Client Identity */}
                  <div className={styles.streamClientBlock}>
                    <div className={styles.clientAvatar}>
                      {r.customerName.charAt(0)}
                    </div>
                    <div className={styles.clientDetails}>
                      <div className={styles.clientNameRow}>
                        <span className={styles.clientName}>{r.customerName}</span>
                        <div className={styles.resIdChip}>
                          <span>{r.id}</span>
                          <button
                            type="button"
                            onClick={(e) => handleCopyId(r.id, e)}
                            style={{ background: "none", border: "none", color: "#888", cursor: "pointer", padding: 0 }}
                            title="Salin ID Reservasi"
                          >
                            {copiedId === r.id ? (
                              <span style={{ color: "var(--color-gold-primary)" }}>✓</span>
                            ) : (
                              <Icons.Copy size={10} />
                            )}
                          </button>
                        </div>
                      </div>
                      <span className={styles.clientPhone}>{r.customerPhone}</span>
                    </div>
                  </div>

                  {/* 3. Package & Photographer */}
                  <div className={styles.streamPkgBlock}>
                    <div className={styles.pkgTag}>
                      <span>{getPackageIcon(r.packageName)} {r.packageName}</span>
                    </div>
                    <div className={styles.phAssignedPill}>
                      <Icons.Camera size={12} color="#C9A84C" />
                      <span>{r.photographerName || "Fotografer Bertugas"}</span>
                    </div>
                  </div>

                  {/* 4. Financial Status */}
                  <div className={styles.streamFinanceBlock}>
                    <span className={styles.totalPrice}>{formatCurrency(r.totalAmount)}</span>
                    <div className={styles.paymentProgressWrap}>
                      <div className={styles.paymentProgressBar}>
                        <div
                          className={styles.paymentProgressFill}
                          style={{
                            width: isPaid ? "100%" : isDP ? "50%" : "15%",
                            background: isPaid ? "#4CAF88" : isDP ? "#F0A050" : "#E05555",
                          }}
                        />
                      </div>
                      <span style={{ fontSize: "0.68rem", color: isPaid ? "#4CAF88" : isDP ? "#F0A050" : "#999" }}>
                        {isPaid ? "Lunas 100%" : isDP ? "Deposit DP 50%" : "Menunggu Bayar"}
                      </span>
                    </div>
                  </div>

                  {/* 5. Custom Status Changer & Quick Actions */}
                  <div className={styles.streamActionBlock} onClick={(e) => e.stopPropagation()}>
                    <select
                      className={styles.customStatusSelect}
                      value={r.status}
                      id={`status-${r.id}`}
                      disabled={updatingId === r.id}
                      style={{ color: statusInfo?.color }}
                      onChange={(e) => handleStatusChange(r.id, e.target.value as ReservationStatus)}
                    >
                      <option value="pending">● Menunggu</option>
                      <option value="confirmed">● Dikonfirmasi</option>
                      <option value="completed">● Selesai</option>
                      <option value="cancelled">● Dibatalkan</option>
                    </select>

                    <button
                      type="button"
                      className={styles.btnTouch}
                      onClick={() => setSelectedRes(r)}
                      title="Buka Lembar Sesi Studio"
                    >
                      <Icons.Eye size={14} />
                    </button>

                    <a
                      href={`https://wa.me/6282340619880?text=Halo%20${encodeURIComponent(
                        r.customerName
                      )},%20kami%20dari%20Letra%20Studio%20Jimbaran%20mengenai%20sesi%20${r.packageName}%20(${r.id}).`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.btnTouch} ${styles.btnTouchWA}`}
                      title="Chat WhatsApp Klien"
                    >
                      <Icons.MessageSquare size={14} />
                    </a>

                    {currentUser?.role === "admin" && (
                      <button
                        type="button"
                        className={`${styles.btnTouch} ${styles.btnTouchDelete}`}
                        onClick={() => handleDelete(r.id)}
                        title="Hapus Data (Admin)"
                      >
                        <Icons.Trash size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* ================= KANBAN BOARD VIEW ================= */
        <div className={styles.kanbanGrid}>
          {/* Column 1: Menunggu Konfirmasi */}
          <div className={styles.kanbanColumn}>
            <div className={styles.kanbanHeader}>
              <div className={styles.kanbanTitle} style={{ color: "#F0A050" }}>
                <span>⚡ Menunggu Konfirmasi</span>
              </div>
              <span className={styles.kanbanCount}>{kanbanPending.length}</span>
            </div>
            <div className={styles.kanbanList}>
              {kanbanPending.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem 0", color: "#666", fontSize: "0.8rem" }}>
                  Tidak ada antrean pending
                </div>
              ) : (
                kanbanPending.map((r) => (
                  <div
                    key={r.id}
                    className={styles.kanbanCard}
                    onClick={() => setSelectedRes(r)}
                  >
                    <div className={styles.kanbanCardTop}>
                      <span className={styles.kanbanCardPkg}>{getPackageIcon(r.packageName)} {r.packageName}</span>
                      <span className={styles.timeChip} style={{ fontSize: "0.72rem" }}>{r.time}</span>
                    </div>
                    <div className={styles.kanbanCardClient}>{r.customerName} · {formatDate(r.date)}</div>
                    <div className={styles.kanbanCardBottom}>
                      <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-gold-light)" }}>
                        {formatCurrency(r.totalAmount)}
                      </span>
                      <button
                        type="button"
                        className="btn btn-gold btn-sm"
                        style={{ fontSize: "0.72rem", padding: "0.25rem 0.55rem" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(r.id, "confirmed");
                        }}
                      >
                        Konfirmasi →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Sesi Terjadwal */}
          <div className={styles.kanbanColumn}>
            <div className={styles.kanbanHeader}>
              <div className={styles.kanbanTitle} style={{ color: "#5090E0" }}>
                <span>📅 Sesi Siap / Terjadwal</span>
              </div>
              <span className={styles.kanbanCount}>{kanbanConfirmed.length}</span>
            </div>
            <div className={styles.kanbanList}>
              {kanbanConfirmed.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem 0", color: "#666", fontSize: "0.8rem" }}>
                  Tidak ada sesi terjadwal
                </div>
              ) : (
                kanbanConfirmed.map((r) => (
                  <div
                    key={r.id}
                    className={styles.kanbanCard}
                    onClick={() => setSelectedRes(r)}
                  >
                    <div className={styles.kanbanCardTop}>
                      <span className={styles.kanbanCardPkg}>{getPackageIcon(r.packageName)} {r.packageName}</span>
                      <span className={styles.timeChip} style={{ fontSize: "0.72rem" }}>{r.time}</span>
                    </div>
                    <div className={styles.kanbanCardClient}>{r.customerName} · {formatDate(r.date)}</div>
                    <div className={styles.kanbanCardBottom}>
                      <span style={{ fontSize: "0.72rem", color: "#4CAF88" }}>📷 {r.photographerName}</span>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        style={{ fontSize: "0.72rem", padding: "0.25rem 0.55rem" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(r.id, "completed");
                        }}
                      >
                        Selesai ✓
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: Sesi Selesai */}
          <div className={styles.kanbanColumn}>
            <div className={styles.kanbanHeader}>
              <div className={styles.kanbanTitle} style={{ color: "#4CAF88" }}>
                <span>✅ Sesi Selesai</span>
              </div>
              <span className={styles.kanbanCount}>{kanbanCompleted.length}</span>
            </div>
            <div className={styles.kanbanList}>
              {kanbanCompleted.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem 0", color: "#666", fontSize: "0.8rem" }}>
                  Belum ada sesi selesai
                </div>
              ) : (
                kanbanCompleted.slice(0, 10).map((r) => (
                  <div
                    key={r.id}
                    className={styles.kanbanCard}
                    onClick={() => setSelectedRes(r)}
                    style={{ opacity: 0.85 }}
                  >
                    <div className={styles.kanbanCardTop}>
                      <span className={styles.kanbanCardPkg}>{getPackageIcon(r.packageName)} {r.packageName}</span>
                      <span style={{ fontSize: "0.72rem", color: "#4CAF88", fontWeight: 700 }}>Selesai ✓</span>
                    </div>
                    <div className={styles.kanbanCardClient}>{r.customerName} · {formatDate(r.date)}</div>
                    <div className={styles.kanbanCardBottom}>
                      <span style={{ fontSize: "0.8rem", color: "var(--color-gold-primary)", fontWeight: 600 }}>
                        {formatCurrency(r.totalAmount)}
                      </span>
                      <span style={{ fontSize: "0.72rem", color: "#888" }}>{r.id}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* STUDIO BRIEF SLIDE-OVER DRAWER (RIGHT PANEL) */}
      {selectedRes && (
        <div className={styles.drawerOverlay} onClick={() => setSelectedRes(null)}>
          <div className={styles.drawerPanel} onClick={(e) => e.stopPropagation()}>
            <div>
              {/* Drawer Top */}
              <div className={styles.drawerHeader}>
                <div>
                  <div className={styles.drawerEyebrow}>Studio Session Brief</div>
                  <h2 className={styles.drawerTitle}>{selectedRes.packageName}</h2>
                </div>
                <button
                  type="button"
                  className={styles.drawerCloseBtn}
                  onClick={() => setSelectedRes(null)}
                  title="Tutup (Esc)"
                >
                  <Icons.X size={18} />
                </button>
              </div>

              {/* Section 1: Client Identity */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>Informasi Klien</div>
                <div className={styles.drawerGrid2}>
                  <div className={styles.drawerItem}>
                    <span className={styles.drawerItemLabel}>Nama Pemesan</span>
                    <span className={styles.drawerItemVal}>{selectedRes.customerName}</span>
                  </div>
                  <div className={styles.drawerItem}>
                    <span className={styles.drawerItemLabel}>Nomor WhatsApp</span>
                    <span className={styles.drawerItemVal}>{selectedRes.customerPhone}</span>
                  </div>
                  <div className={styles.drawerItem}>
                    <span className={styles.drawerItemLabel}>Kode Reservasi</span>
                    <span className={styles.drawerItemVal} style={{ fontFamily: "monospace", color: "var(--color-gold-light)" }}>
                      {selectedRes.id}
                    </span>
                  </div>
                  <div className={styles.drawerItem}>
                    <span className={styles.drawerItemLabel}>Email</span>
                    <span className={styles.drawerItemVal}>{selectedRes.customerEmail || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Session Schedule & Crew */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>Jadwal Studio & Crew</div>
                <div className={styles.drawerGrid2}>
                  <div className={styles.drawerItem}>
                    <span className={styles.drawerItemLabel}>Tanggal Sesi</span>
                    <span className={styles.drawerItemVal}>{formatDate(selectedRes.date)}</span>
                  </div>
                  <div className={styles.drawerItem}>
                    <span className={styles.drawerItemLabel}>Waktu & Jam</span>
                    <span className={styles.drawerItemVal} style={{ color: "var(--color-gold-primary)" }}>
                      {selectedRes.time} WITA
                    </span>
                  </div>
                  <div className={styles.drawerItem}>
                    <span className={styles.drawerItemLabel}>Fotografer Ditugaskan</span>
                    <span className={styles.drawerItemVal}>{selectedRes.photographerName || "Fotografer Studio"}</span>
                  </div>
                  <div className={styles.drawerItem}>
                    <span className={styles.drawerItemLabel}>Lokasi Sesi</span>
                    <span className={styles.drawerItemVal}>Studio Jimbaran (Main Hall)</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Billing & Financials */}
              <div className={styles.drawerSection}>
                <div className={styles.drawerSectionTitle}>Rincian Finansial & Tagihan</div>
                <div className={styles.drawerGrid2}>
                  <div className={styles.drawerItem}>
                    <span className={styles.drawerItemLabel}>Total Paket</span>
                    <span className={styles.drawerItemVal} style={{ fontSize: "1.1rem", color: "var(--color-gold-light)" }}>
                      {formatCurrency(selectedRes.totalAmount)}
                    </span>
                  </div>
                  <div className={styles.drawerItem}>
                    <span className={styles.drawerItemLabel}>Status Pembayaran</span>
                    <span className={styles.drawerItemVal} style={{ textTransform: "capitalize" }}>
                      {selectedRes.paymentStatus === "paid" ? "Lunas 100%" : selectedRes.paymentStatus === "dp_paid" ? "DP 50% Masuk" : "Menunggu Bayar"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 4: Notes */}
              {selectedRes.notes && (
                <div className={styles.drawerSection}>
                  <div className={styles.drawerSectionTitle}>Catatan Khusus Klien</div>
                  <p style={{ fontSize: "0.85rem", color: "#CCC", lineHeight: 1.5 }}>
                    {selectedRes.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Drawer Bottom Actions */}
            <div className={styles.drawerActions}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.65rem" }}>
                {selectedRes.status === "pending" ? (
                  <button
                    type="button"
                    className="btn btn-gold btn-sm"
                    style={{ justifyContent: "center" }}
                    onClick={() => handleStatusChange(selectedRes.id, "confirmed")}
                  >
                    <Icons.Check size={14} />
                    <span>Konfirmasi Jadwal</span>
                  </button>
                ) : selectedRes.status === "confirmed" ? (
                  <button
                    type="button"
                    className="btn btn-gold btn-sm"
                    style={{ justifyContent: "center", background: "#4CAF88", borderColor: "#4CAF88" }}
                    onClick={() => handleStatusChange(selectedRes.id, "completed")}
                  >
                    <Icons.Check size={14} />
                    <span>Tandai Selesai</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ justifyContent: "center" }}
                    onClick={() => handleStatusChange(selectedRes.id, "confirmed")}
                  >
                    Buka Kembali Sesi
                  </button>
                )}

                <a
                  href={`https://wa.me/6282340619880?text=Halo%20${encodeURIComponent(
                    selectedRes.customerName
                  )},%20kami%20dari%20Letra%20Studio%20Jimbaran%20mengenai%20sesi%20${selectedRes.packageName}%20(${selectedRes.id}).`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-sm"
                  style={{ justifyContent: "center", borderColor: "rgba(37,211,102,0.4)", color: "#25D366" }}
                >
                  <Icons.MessageSquare size={14} />
                  <span>Kirim WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
