"use client";

import { useEffect, useState, useTransition, useMemo } from "react";
import { formatCurrency, formatDate } from "@/lib/data";
import { Transaction } from "@/lib/types";
import { transactionsService } from "@/lib/services";
import Icons from "@/components/shared/Icons";
import Link from "next/link";
import styles from "./page.module.css";

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<"pending" | "success" | "all">("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);
  const [, startTransition] = useTransition();

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await transactionsService.getAll();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to load transactions from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    try {
      const verified = await transactionsService.verify(id);
      setTransactions((prev) => prev.map((t) => (t.id === id ? verified : t)));
      if (selectedTrx && selectedTrx.id === id) {
        setSelectedTrx(verified);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal memverifikasi transaksi.");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // KPIs
  const pendingTransactions = useMemo(() => transactions.filter((t) => t.status === "pending"), [transactions]);
  const successTransactions = useMemo(() => transactions.filter((t) => t.status === "success"), [transactions]);

  const totalPendingAmount = useMemo(
    () => pendingTransactions.reduce((acc, t) => acc + t.amount, 0),
    [pendingTransactions]
  );
  const totalSuccessAmount = useMemo(
    () => successTransactions.reduce((acc, t) => acc + t.amount, 0),
    [successTransactions]
  );

  // Filtered List based on Active Tab & Search
  const displayTransactions = useMemo(() => {
    let list = transactions;

    if (activeTab === "pending") {
      list = pendingTransactions;
    } else if (activeTab === "success") {
      list = successTransactions;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (t) =>
          t.customerName.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.reservationId.toLowerCase().includes(q) ||
          t.packageName.toLowerCase().includes(q)
      );
    }

    return list;
  }, [transactions, activeTab, pendingTransactions, successTransactions, searchTerm]);

  const getTag = (t: Transaction) => {
    if (t.id.includes("-DP-")) {
      return <span className="badge badge-warning" style={{ fontSize: "0.68rem" }}>Deposit DP 50%</span>;
    }
    if (t.id.includes("-SETTLEMENT-")) {
      return <span className="badge badge-gold" style={{ fontSize: "0.68rem" }}>Pelunasan Sisa 50%</span>;
    }
    return <span className="badge badge-neutral" style={{ fontSize: "0.68rem" }}>Pelunasan Penuh 100%</span>;
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.headerArea}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>
            <Icons.CreditCard size={22} color="#C9A84C" />
            <span>Verifikasi Pembayaran Studio</span>
          </h1>
          <p className={styles.pageSubtitle}>
            Pusat persetujuan transfer uang muka (DP) dan pelunasan sesi foto klien secara ringkas & cepat.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-outline btn-sm"
          onClick={loadTransactions}
          title="Segarkan data transaksi"
        >
          <Icons.RefreshCw size={14} />
          <span>Segarkan Data</span>
        </button>
      </div>

      {/* 3 Essential KPI Cards */}
      <div className={styles.kpiRow}>
        <div className={`${styles.kpiCard} ${pendingTransactions.length > 0 ? styles.kpiCardUrgent : ""}`}>
          <div className={styles.kpiIcon} style={{ color: "#F0A050" }}>
            <Icons.AlertCircle size={22} />
          </div>
          <div>
            <div className={styles.kpiValue} style={{ color: "#F0A050" }}>
              {formatCurrency(totalPendingAmount)}
            </div>
            <div className={styles.kpiLabel}>
              {pendingTransactions.length} Pembayaran Perlu Dicek Segera
            </div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ color: "#4CAF88" }}>
            <Icons.CheckCircle size={22} />
          </div>
          <div>
            <div className={styles.kpiValue} style={{ color: "#4CAF88" }}>
              {formatCurrency(totalSuccessAmount)}
            </div>
            <div className={styles.kpiLabel}>
              Total Kas Sah Terverifikasi ({successTransactions.length} Transaksi)
            </div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ color: "var(--color-gold-primary)" }}>
            <Icons.Package size={22} />
          </div>
          <div>
            <div className={styles.kpiValue}>
              {transactions.length}
            </div>
            <div className={styles.kpiLabel}>
              Total Keseluruhan Entri Kas
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.tabButtons}>
          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "pending" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("pending")}
          >
            <span>Perlu Verifikasi</span>
            {pendingTransactions.length > 0 && (
              <span className={styles.counterBadge}>{pendingTransactions.length}</span>
            )}
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "success" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("success")}
          >
            <span>Sudah Lunas / Sah</span>
          </button>

          <button
            type="button"
            className={`${styles.tabBtn} ${activeTab === "all" ? styles.tabBtnActive : ""}`}
            onClick={() => setActiveTab("all")}
          >
            <span>Semua Transaksi</span>
          </button>
        </div>

        <div className={styles.searchBox}>
          <Icons.Search size={16} color="#888" />
          <input
            type="search"
            placeholder="Cari nama klien atau kode ID..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => startTransition(() => setSearchTerm(e.target.value))}
          />
        </div>
      </div>

      {/* Simplified Clean Table */}
      <div className={styles.tableCard}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gold-primary)" }}>
            <Icons.RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 0.5rem" }} />
            <div>Memuat data pembayaran...</div>
          </div>
        ) : displayTransactions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              {activeTab === "pending" ? "None" : "Ada Data"}
            </div>
            <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#FFFFFF", marginBottom: "0.25rem" }}>
              {activeTab === "pending"
                ? "Tidak ada pembayaran yang menunggu verifikasi"
                : "Tidak ada transaksi ditemukan"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
              {activeTab === "pending"
                ? "Semua setoran dana klien telah disetujui & masuk kas studio."
                : "Coba ubah kata kunci pencarian atau ganti filter tab."}
            </div>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Klien & Sesi Foto</th>
                <th>Tipe & Metode Transfer</th>
                <th>Nominal Dana</th>
                <th>Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody>
              {displayTransactions.map((t) => {
                const isDP = t.id.includes("-DP-");
                const isSettlement = t.id.includes("-SETTLEMENT-");

                return (
                  <tr key={t.id}>
                    {/* 1. Client & Session Block */}
                    <td>
                      <div className={styles.clientBlock}>
                        <span className={styles.clientName}>{t.customerName}</span>
                        <span className={styles.clientPkg}>{t.packageName}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span className={styles.resIdSub}>{t.reservationId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyId(t.reservationId)}
                            style={{ background: "none", border: "none", color: "#888", cursor: "pointer", padding: 0 }}
                            title="Salin ID Reservasi"
                          >
                            {copiedId === t.reservationId ? (
                              <span style={{ fontSize: "0.65rem", color: "var(--color-gold-primary)" }}>✓</span>
                            ) : (
                              <Icons.Copy size={11} />
                            )}
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* 2. Payment Type & Method */}
                    <td>
                      <div className={styles.paymentTypeBlock}>
                        <div>{getTag(t)}</div>
                        <div className={styles.paymentMethodTag}>
                          <Icons.CreditCard size={12} color="#C9A84C" />
                          <span>{t.paymentMethod || "Transfer Bank BCA / QRIS"}</span>
                        </div>
                        <span className={styles.trxDate}>{formatDate(t.date)}</span>
                      </div>
                    </td>

                    {/* 3. Amount */}
                    <td>
                      <div className={styles.amountBlock}>
                        {formatCurrency(t.amount)}
                      </div>
                    </td>

                    {/* 4. Action */}
                    <td>
                      <div className={styles.actionBlock}>
                        {t.status === "pending" ? (
                          <button
                            type="button"
                            className={styles.btnVerify}
                            disabled={verifyingId === t.id}
                            onClick={() => handleVerify(t.id)}
                            title="Setujui transfer dan masukkan ke kas studio"
                          >
                            <Icons.Check size={14} />
                            <span>
                              {verifyingId === t.id
                                ? "Memproses..."
                                : isDP
                                ? "Setujui DP"
                                : isSettlement
                                ? "Setujui Pelunasan"
                                : "Setujui Masuk Kas"}
                            </span>
                          </button>
                        ) : (
                          <span className={styles.verifiedBadge}>
                            <Icons.Check size={13} />
                            <span>Sah Masuk Kas</span>
                          </span>
                        )}

                        {/* WhatsApp Shortcut */}
                        <a
                          href={`https://wa.me/6282340619880?text=Halo%20${encodeURIComponent(
                            t.customerName
                          )},%20kami%20dari%20Letra%20Studio%20Jimbaran%20ingin%20mengonfirmasi%20pembayaran%20${t.reservationId}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.btnWhatsApp}
                          title="Hubungi Klien via WhatsApp"
                        >
                          <Icons.MessageSquare size={14} />
                        </a>

                        {/* Open Admin Quick Detail Modal */}
                        <button
                          type="button"
                          onClick={() => setSelectedTrx(t)}
                          className={styles.btnDetails}
                          title="Buka Detail Transaksi & Reservasi di Admin"
                        >
                          <Icons.Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Admin Quick Detail Modal */}
      {selectedTrx && (
        <div className={styles.modalOverlay} onClick={() => setSelectedTrx(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={() => setSelectedTrx(null)}
              title="Tutup Modal"
            >
              <Icons.X size={16} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span className="badge badge-gold" style={{ textTransform: "uppercase" }}>
                {selectedTrx.id}
              </span>
              <span className={`badge ${selectedTrx.status === "success" ? "badge-success" : "badge-warning"}`}>
                {selectedTrx.status === "success" ? "Lunas Terverifikasi" : "Menunggu Verifikasi"}
              </span>
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#FFFFFF", marginBottom: "0.25rem" }}>
              {selectedTrx.packageName}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "1.25rem" }}>
              Klien: <strong style={{ color: "#FFF" }}>{selectedTrx.customerName}</strong>
            </p>

            <div style={{
              background: "#0E0E0E",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 10,
              padding: "1rem",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "0.75rem",
              marginBottom: "1.25rem"
            }}>
              <div>
                <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Kode Reservasi</span>
                <div style={{ fontSize: "0.85rem", color: "var(--color-gold-light)", fontWeight: 600, marginTop: 2, fontFamily: "monospace" }}>
                  {selectedTrx.reservationId}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Metode Bayar</span>
                <div style={{ fontSize: "0.85rem", color: "#FFF", fontWeight: 600, marginTop: 2 }}>
                  {selectedTrx.paymentMethod || "Transfer Bank / QRIS"}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Nominal Ditransfer</span>
                <div style={{ fontSize: "0.95rem", color: "var(--color-gold-primary)", fontWeight: 700, marginTop: 2 }}>
                  {formatCurrency(selectedTrx.amount)}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Tanggal Masuk</span>
                <div style={{ fontSize: "0.85rem", color: "#FFF", fontWeight: 600, marginTop: 2 }}>
                  {formatDate(selectedTrx.date)}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {selectedTrx.status === "pending" && (
                <button
                  type="button"
                  className={styles.btnVerify}
                  style={{ width: "100%", justifyContent: "center", padding: "0.6rem" }}
                  disabled={verifyingId === selectedTrx.id}
                  onClick={() => handleVerify(selectedTrx.id)}
                >
                  <Icons.Check size={16} />
                  <span>{verifyingId === selectedTrx.id ? "Memproses..." : "Setujui Pembayaran Sekarang"}</span>
                </button>
              )}

              <Link
                href={`/admin/reservations?search=${selectedTrx.reservationId}`}
                className="btn btn-outline btn-sm"
                style={{ width: "100%", justifyContent: "center", padding: "0.55rem" }}
                onClick={() => setSelectedTrx(null)}
              >
                Buka di Menu Reservasi Admin →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
