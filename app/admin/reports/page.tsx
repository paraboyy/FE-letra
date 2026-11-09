"use client";

import { useEffect, useState, useCallback } from "react";
import { formatCurrency, formatDate } from "@/lib/data";
import { FinancialReportData, reportsService } from "@/lib/services";
import Icons from "@/components/shared/Icons";
import styles from "./page.module.css";

const MONTHS_LIST = [
  { value: "all", label: "Semua Bulan (Setahun Penuh)" },
  { value: "1", label: "Januari" },
  { value: "2", label: "Februari" },
  { value: "3", label: "Maret" },
  { value: "4", label: "April" },
  { value: "5", label: "Mei" },
  { value: "6", label: "Juni" },
  { value: "7", label: "Juli" },
  { value: "8", label: "Agustus" },
  { value: "9", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export default function AdminReportsPage() {
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedMonth, setSelectedMonth] = useState<string>("all");
  const [reportData, setReportData] = useState<FinancialReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [txPage, setTxPage] = useState(1);
  const ROWS_PER_PAGE = 8;

  const loadFinancialReport = useCallback(async (year: string, month: string) => {
    setLoading(true);
    try {
      const data = await reportsService.getFinancialReport({ year, month });
      setReportData(data);
    } catch (err) {
      console.error("Gagal memuat laporan keuangan:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFinancialReport(selectedYear, selectedMonth);
    setTxPage(1);
  }, [selectedYear, selectedMonth, loadFinancialReport]);

  const handleResetFilter = () => {
    setSelectedYear("2026");
    setSelectedMonth("all");
  };

  // Export to Excel / CSV
  const handleExportExcel = () => {
    if (!reportData) return;

    const { stats, period, monthlyRevenue, packagePerformance, transactions } = reportData;
    const lines: string[] = [];
    lines.push("LAPORAN KEUANGAN DAN OPERASIONAL LETRA STUDIO");
    lines.push(`Periode Laporan;${period.label}`);
    lines.push(`Tanggal Cetak / Ekspor;${formatDate(new Date().toISOString())}`);
    lines.push("");
    lines.push("RINGKASAN EKSEKUTIF BISNIS");
    lines.push(`Total Pendapatan Terakumulasi;Rp ${stats.totalRevenue.toLocaleString("id-ID")}`);
    lines.push(`Total Reservasi Terdaftar;${stats.totalReservations} Sesi`);
    lines.push(`Transaksi Sukses;${stats.successTransactions} Transaksi`);
    lines.push(`Rata-rata Nilai Transaksi;Rp ${stats.averageTransaction.toLocaleString("id-ID")}`);
    lines.push("");
    lines.push("ARUS PENDAPATAN BULANAN");
    lines.push("Bulan;Pendapatan (IDR);Target Tercapai (%)");
    monthlyRevenue.forEach((m) => {
      lines.push(`${m.month};${m.revenue};${Math.round((m.revenue / (stats.totalRevenue || 1)) * 100)}%`);
    });
    lines.push("");
    lines.push("PERFORMA PENJUALAN PAKET FOTO");
    lines.push("Nama Paket;Kategori;Harga Paket (IDR);Frekuensi Pemesanan;Total Omset (IDR);Porsi (%)");
    packagePerformance.forEach((p) => {
      lines.push(`"${p.packageName}";"${p.category}";${p.price};${p.totalBookings};${p.totalRevenue};${p.percentage}%`);
    });
    lines.push("");
    lines.push("RINCIAN BUKU KAS & TRANSAKSI MASUK");
    lines.push("No. Transaksi;Tanggal;Nama Klien;Paket Sesi;Metode Pembayaran;Nominal (IDR);Status");
    transactions.forEach((t) => {
      lines.push(`"${t.id}";"${t.date}";"${t.customerName}";"${t.packageName}";"${t.paymentMethod}";${t.amount};"${t.status}"`);
    });

    const csvContent = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const fileSuffix = `${selectedYear}_${selectedMonth}`;
    link.setAttribute("download", `Laporan_Keuangan_Letra_Studio_${fileSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export / Print to PDF
  const handleExportPDF = () => {
    if (!reportData) return;

    const { stats, period, monthlyRevenue, packagePerformance, transactions } = reportData;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Harap izinkan popup browser untuk mengunduh laporan PDF.");
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="id">
      <head>
        <meta charset="UTF-8">
        <title>Laporan Keuangan - ${period.label} - Letra Studio</title>
        <style>
          @page { size: A4; margin: 1.6cm; }
          * { box-sizing: border-box; }
          body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #151515; padding: 1.5rem; line-height: 1.5; font-size: 12px; }
          .header { text-align: center; border-bottom: 2.5px solid #C9A84C; padding-bottom: 1.25rem; margin-bottom: 1.5rem; position: relative; }
          .logo { font-size: 26px; font-weight: 800; letter-spacing: 0.15em; color: #C9A84C; }
          .sub { font-size: 10px; color: #666; letter-spacing: 0.25em; text-transform: uppercase; margin-top: 2px; }
          .address { font-size: 10.5px; color: #777; margin-top: 4px; }
          .report-badge {
            display: inline-block;
            background: #fdf8eb;
            border: 1px solid #e0c878;
            color: #927318;
            font-size: 11px;
            font-weight: 700;
            padding: 4px 14px;
            border-radius: 20px;
            margin-top: 10px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
          }
          .report-title { font-size: 17px; font-weight: 700; margin-top: 0.75rem; color: #1a1a1a; letter-spacing: 0.02em; }
          .meta-date { font-size: 11px; color: #777; margin-top: 4px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.85rem; margin-bottom: 1.75rem; }
          .kpi-box { border: 1px solid #e3e3e3; border-radius: 6px; padding: 0.85rem 0.6rem; text-align: center; background: #fafafa; }
          .kpi-val { font-size: 15px; font-weight: 800; color: #B38B28; }
          .kpi-lbl { font-size: 9.5px; color: #666; text-transform: uppercase; margin-top: 4px; font-weight: 600; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 1.75rem; font-size: 11px; }
          th, td { border: 1px solid #dedede; padding: 7px 10px; text-align: left; }
          th { background: #f5f5f5; font-weight: 700; color: #333; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .section-title { font-size: 13px; font-weight: 700; margin-bottom: 0.6rem; border-left: 3.5px solid #C9A84C; padding-left: 8px; color: #222; }
          .badge-status {
            display: inline-block;
            padding: 2px 7px;
            border-radius: 4px;
            font-size: 9.5px;
            font-weight: 700;
          }
          .status-success { background: #e8f5e9; color: #2e7d32; }
          .status-pending { background: #fff8e1; color: #f57f17; }
          .status-refunded { background: #ffebee; color: #c62828; }
          .footer { margin-top: 2.5rem; display: flex; justify-content: space-between; font-size: 11px; page-break-inside: avoid; }
          .sign-box { text-align: center; width: 220px; }
          .sign-line { margin-top: 55px; border-bottom: 1px solid #333; }
          @media print {
            body { padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">LETRA STUDIO</div>
          <div class="sub">Fine Art & Portrait Photography Studio</div>
          <div class="address">Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan • Telp: 0812-3456-7890 • info@letrastudio.id</div>
          <div class="report-title">LAPORAN KINERJA KEUANGAN & OPERASIONAL</div>
          <div class="report-badge">PERIODE: ${period.label.toUpperCase()}</div>
          <div class="meta-date">Dicetak pada: ${new Date().toLocaleDateString("id-ID", { dateStyle: "full" })} pukul ${new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB</div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-box">
            <div class="kpi-val">${formatCurrency(stats.totalRevenue)}</div>
            <div class="kpi-lbl">Total Omset Bersih</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-val">${stats.totalReservations} Sesi</div>
            <div class="kpi-lbl">Total Booking Sesi</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-val">${stats.successTransactions} Transaksi</div>
            <div class="kpi-lbl">Transaksi Berhasil</div>
          </div>
          <div class="kpi-box">
            <div class="kpi-val">${formatCurrency(stats.averageTransaction)}</div>
            <div class="kpi-lbl">Rata-rata Transaksi</div>
          </div>
        </div>

        <div class="section-title">1. Ringkasan Arus Pendapatan Bulanan (${period.year === "all" ? "Semua Tahun" : `Tahun ${period.year}`})</div>
        <table>
          <thead>
            <tr>
              <th>Periode Bulan</th>
              <th class="text-right">Akumulasi Pendapatan</th>
              <th class="text-center">Jumlah Transaksi</th>
              <th class="text-right">Kontribusi Periode</th>
            </tr>
          </thead>
          <tbody>
            ${monthlyRevenue.map((m) => `
              <tr>
                <td><b>${m.month}</b></td>
                <td class="text-right">${formatCurrency(m.revenue)}</td>
                <td class="text-center">${m.bookings ?? "-"} kali</td>
                <td class="text-right">${stats.totalRevenue > 0 ? Math.round((m.revenue / stats.totalRevenue) * 100) : 0}%</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="section-title">2. Distribusi Penjualan Paket Foto (${period.label})</div>
        <table>
          <thead>
            <tr>
              <th>Nama Paket Sesi</th>
              <th>Kategori</th>
              <th class="text-right">Tarif Dasar</th>
              <th class="text-center">Frekuensi Pemesanan</th>
              <th class="text-right">Akumulasi Omset</th>
              <th class="text-right">Porsi Omset</th>
            </tr>
          </thead>
          <tbody>
            ${packagePerformance.map((p) => `
              <tr>
                <td><b>${p.packageName}</b></td>
                <td style="text-transform: capitalize;">${p.category}</td>
                <td class="text-right">${formatCurrency(p.price)}</td>
                <td class="text-center">${p.totalBookings} kali</td>
                <td class="text-right">${formatCurrency(p.totalRevenue)}</td>
                <td class="text-right">${p.percentage}%</td>
              </tr>
            `).join("")}
          </tbody>
        </table>

        <div class="section-title">3. Rincian Buku Kas & Transaksi Masuk (${period.label})</div>
        <table>
          <thead>
            <tr>
              <th>No. Transaksi</th>
              <th>Tanggal</th>
              <th>Nama Klien</th>
              <th>Paket Sesi</th>
              <th>Metode Pembayaran</th>
              <th class="text-right">Nominal</th>
              <th class="text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.length > 0 ? transactions.map((t) => `
              <tr>
                <td style="font-family: monospace; font-size: 10px;">${t.id}</td>
                <td>${t.date}</td>
                <td><b>${t.customerName}</b></td>
                <td>${t.packageName}</td>
                <td>${t.paymentMethod}</td>
                <td class="text-right" style="font-weight: 600;">${formatCurrency(t.amount)}</td>
                <td class="text-center">
                  <span class="badge-status ${t.status === "success" ? "status-success" : t.status === "pending" ? "status-pending" : "status-refunded"}">
                    ${t.status === "success" ? "Lunas" : t.status === "pending" ? "Menunggu" : "Refund"}
                  </span>
                </td>
              </tr>
            `).join("") : `
              <tr>
                <td colspan="7" class="text-center" style="padding: 1.5rem; color: #888;">
                  Tidak ada transaksi yang tercatat pada periode ini.
                </td>
              </tr>
            `}
          </tbody>
          ${transactions.length > 0 ? `
            <tfoot>
              <tr style="background: #fdf8eb; font-weight: bold;">
                <td colspan="5" class="text-right">Total Transaksi Masuk Periode Ini:</td>
                <td class="text-right" style="color: #927318;">${formatCurrency(stats.totalRevenue)}</td>
                <td></td>
              </tr>
            </tfoot>
          ` : ""}
        </table>

        <div class="footer">
          <div>
            <p><b>Catatan Resmi:</b></p>
            <p style="color: #666; font-size: 10px; max-width: 320px;">
              Dokumen ini disinkronisasi langsung dari database sistem transaksi Letra Studio. Segala bentuk audit dan rekonsiliasi kas mengacu pada nomor referensi transaksi resmi di atas.
            </p>
          </div>
          <div class="sign-box">
            <p>Jakarta, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
            <p style="margin-top: 4px; font-weight: 600;">Pimpinan & Finance Manager</p>
            <div class="sign-line"></div>
            <p style="font-weight: 700; margin-top: 6px;">Admin Letra Studio</p>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const maxRevenue = reportData?.monthlyRevenue && reportData.monthlyRevenue.length > 0
    ? Math.max(...reportData.monthlyRevenue.map((m) => m.revenue), 10000000)
    : 10000000;

  const totalTxPages = reportData
    ? Math.max(1, Math.ceil(reportData.transactions.length / ROWS_PER_PAGE))
    : 1;
  const paginatedTransactions = reportData
    ? reportData.transactions.slice((txPage - 1) * ROWS_PER_PAGE, txPage * ROWS_PER_PAGE)
    : [];

  const buildPageNumbers = (current: number, total: number): (number | "...")[] => {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | "...")[] = [1];
    if (current > 3) pages.push("...");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push("...");
    pages.push(total);
    return pages;
  };

  return (
    <div className={styles.page}>
      {/* Header Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h2 style={{ fontSize: "1.3rem", color: "#F0EDE8", fontWeight: 600, letterSpacing: "0.02em" }}>
            Laporan Keuangan & Kinerja Studio
          </h2>
          <p style={{ fontSize: "0.825rem", color: "#8C8680", marginTop: "2px" }}>
            Rekapitulasi pendapatan, arus kas, performa paket foto, dan rincian transaksi studio.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={handleExportExcel}
            id="export-excel-btn"
            disabled={loading || !reportData}
          >
            <Icons.Layers size={14} style={{ marginRight: 5 }} color="#4CAF88" />
            Unduh Excel (.CSV)
          </button>
          <button
            type="button"
            className="btn btn-gold btn-sm"
            onClick={handleExportPDF}
            id="export-pdf-btn"
            disabled={loading || !reportData}
          >
            <Icons.Camera size={14} style={{ marginRight: 5 }} color="#0A0A0A" />
            Cetak / Unduh PDF
          </button>
        </div>
      </div>

      {/* Month & Year Filter Bar */}
      <div className={styles.filterBar}>
        <div className={styles.filterControls}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="filter-year-select">
              <Icons.Calendar size={12} style={{ display: "inline", marginRight: 4 }} />
              Pilih Tahun
            </label>
            <select
              id="filter-year-select"
              className={styles.selectInput}
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="all">Semua Tahun</option>
              {(reportData?.availableYears || [2026, 2025, 2024]).map((yr) => (
                <option key={yr} value={String(yr)}>
                  Tahun {yr}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="filter-month-select">
              <Icons.Clock size={12} style={{ display: "inline", marginRight: 4 }} />
              Pilih Bulan
            </label>
            <select
              id="filter-month-select"
              className={styles.selectInput}
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {MONTHS_LIST.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.filterActions}>
          <div className={styles.periodBadge}>
            <Icons.Calendar size={13} />
            <span>{reportData ? reportData.period.label : "Memuat..."}</span>
          </div>
          {(selectedYear !== "2026" || selectedMonth !== "all") && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={handleResetFilter}
              title="Reset ke Tahun 2026 (Semua Bulan)"
            >
              <Icons.X size={12} />
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {loading && !reportData ? (
        <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-gold-primary)" }}>
          Memuat laporan analitik dari backend server...
        </div>
      ) : reportData ? (
        <>
          {/* Summary Cards */}
          <div className={styles.statsRow}>
            {[
              {
                label: "Total Pendapatan Terakumulasi",
                value: formatCurrency(reportData.stats.totalRevenue),
                change: `+${reportData.stats.revenueGrowth}%`,
                color: "#C9A84C",
                icon: <Icons.CreditCard size={18} color="#C9A84C" />,
              },
              {
                label: "Total Reservasi Studio",
                value: `${reportData.stats.totalReservations} Sesi`,
                change: `+${reportData.stats.reservationGrowth}%`,
                color: "#5090E0",
                icon: <Icons.Calendar size={18} color="#5090E0" />,
              },
              {
                label: "Transaksi Berhasil",
                value: `${reportData.stats.successTransactions} Transaksi`,
                change: `dari ${reportData.stats.totalTransactions} total`,
                color: "#4CAF88",
                icon: <Icons.CheckCircle size={18} color="#4CAF88" />,
              },
              {
                label: "Rata-rata Nilai Transaksi",
                value: formatCurrency(reportData.stats.averageTransaction),
                change: "Per transaksi sukses",
                color: "#E8C97A",
                icon: <Icons.Award size={18} color="#E8C97A" />,
              },
            ].map((s) => (
              <div key={s.label} className={`card ${styles.miniStat}`}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginBottom: "4px" }}>
                  <span className={styles.miniStatLabel}>{s.label}</span>
                  {s.icon}
                </div>
                <div className={styles.miniStatValue} style={{ color: s.color, width: "100%", textAlign: "left" }}>
                  {s.value}
                </div>
                <div style={{ fontSize: "0.72rem", color: "#4CAF88", marginTop: "4px", width: "100%", textAlign: "left" }}>
                  ▲ {s.change}
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="card" style={{ border: "1px solid var(--color-border-subtle)", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#F0EDE8" }}>
                  Grafik Pendapatan Bulanan ({selectedYear === "all" ? "Semua Tahun" : `Tahun ${selectedYear}`})
                </h3>
                <p style={{ fontSize: "0.78rem", color: "#8C8680", marginTop: "2px" }}>
                  Agregasi pendapatan realtime berdasarkan filter periode
                </p>
              </div>
              <span className="badge badge-gold">
                {selectedMonth !== "all"
                  ? `Fokus: ${MONTHS_LIST.find((m) => m.value === selectedMonth)?.label}`
                  : `Tahun ${selectedYear === "all" ? "Akumulatif" : selectedYear}`}
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem", height: "240px", paddingTop: "1.5rem" }}>
              {reportData.monthlyRevenue.map((m, idx) => {
                const isSelectedMonth = selectedMonth !== "all" && parseInt(selectedMonth, 10) === idx + 1;
                const barHeight = maxRevenue > 0 ? (m.revenue / maxRevenue) * 180 : 0;

                return (
                  <div
                    key={m.month}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.5rem",
                      height: "100%",
                      position: "relative",
                      opacity: selectedMonth === "all" || isSelectedMonth ? 1 : 0.45,
                      transition: "opacity 0.3s ease",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.68rem",
                        color: isSelectedMonth ? "#FFE599" : "var(--color-gold-primary)",
                        fontWeight: isSelectedMonth ? 700 : 500,
                        position: "absolute",
                        bottom: "100%",
                        marginBottom: "6px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {m.revenue > 0 ? formatCurrency(m.revenue) : "-"}
                    </div>
                    <div style={{ width: "100%", marginTop: "auto" }}>
                      <div
                        style={{
                          width: "100%",
                          height: `${Math.max(barHeight, m.revenue > 0 ? 6 : 2)}px`,
                          background: isSelectedMonth
                            ? `linear-gradient(to top, #D4AF37, #FFF2B2)`
                            : `linear-gradient(to top, #C9A84C, #E8C97A)`,
                          borderRadius: "4px 4px 2px 2px",
                          transition: "height 0.6s ease",
                          boxShadow: isSelectedMonth ? "0 0 12px rgba(201, 168, 76, 0.4)" : "none",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        color: isSelectedMonth ? "var(--color-gold-primary)" : "var(--color-text-muted)",
                        fontWeight: isSelectedMonth ? 700 : 500,
                      }}
                    >
                      {m.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Package Performance */}
          <div className="card" style={{ border: "1px solid var(--color-border-subtle)", marginBottom: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#F0EDE8" }}>
                Distribusi & Performa Penjualan Paket Foto ({reportData.period.label})
              </h3>
              <span style={{ fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                Total {reportData.packagePerformance.length} Paket Layanan
              </span>
            </div>
            <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama Paket Sesi</th>
                    <th>Kategori</th>
                    <th>Biaya Sesi</th>
                    <th>Frekuensi Pemesanan</th>
                    <th>Kontribusi Omset</th>
                    <th>Porsi Omset</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.packagePerformance.map((p) => (
                    <tr key={p.packageId}>
                      <td>
                        <div style={{ fontWeight: 500, color: "#F0EDE8" }}>{p.packageName}</div>
                      </td>
                      <td style={{ textTransform: "capitalize" }}>{p.category}</td>
                      <td style={{ fontWeight: 600, color: "var(--color-gold-primary)" }}>{formatCurrency(p.price)}</td>
                      <td>{p.totalBookings} kali</td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(p.totalRevenue)}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <div style={{ flex: 1, height: "6px", background: "var(--color-bg-elevated)", borderRadius: "3px", overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(p.percentage, 100)}%`, height: "100%", background: "linear-gradient(to right, #C9A84C, #E8C97A)", borderRadius: "3px" }} />
                          </div>
                          <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", minWidth: "32px" }}>{p.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rincian Transaksi Masuk (Ledger Table) */}
          <div className="card" style={{ border: "1px solid var(--color-border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "#F0EDE8" }}>
                  Rincian Buku Kas & Transaksi Masuk ({reportData.period.label})
                </h3>
                <p style={{ fontSize: "0.78rem", color: "#8C8680", marginTop: "2px" }}>
                  Daftar transaksi aktual yang terekam pada periode ini
                </p>
              </div>
              <span className="badge badge-gold">
                {reportData.transactions.length} Transaksi Terdata
              </span>
            </div>

            {reportData.transactions.length === 0 ? (
              <div className={styles.emptyState}>
                <Icons.Layers size={36} color="#8C8680" style={{ marginBottom: "0.75rem", opacity: 0.6 }} />
                <p>Tidak ada transaksi keuangan pada periode {reportData.period.label}.</p>
                <p style={{ fontSize: "0.78rem", color: "var(--color-text-muted)", marginTop: "4px" }}>
                  Gunakan pilihan tahun atau bulan lain untuk meninjau data transaksi studio.
                </p>
              </div>
            ) : (
              <>
                <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>No. Transaksi</th>
                        <th>Tanggal</th>
                        <th>Nama Klien</th>
                        <th>Paket Sesi</th>
                        <th>Metode Pembayaran</th>
                        <th>Nominal</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedTransactions.map((t) => (
                        <tr key={t.id}>
                          <td>
                            <span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "var(--color-text-muted)" }}>
                              {t.id}
                            </span>
                          </td>
                          <td>{formatDate(t.date)}</td>
                          <td>
                            <div style={{ fontWeight: 500, color: "#F0EDE8" }}>{t.customerName}</div>
                          </td>
                          <td>{t.packageName}</td>
                          <td>
                            <span style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                              {t.paymentMethod}
                            </span>
                          </td>
                          <td style={{ fontWeight: 600, color: "var(--color-gold-primary)" }}>
                            {formatCurrency(t.amount)}
                          </td>
                          <td>
                            {t.status === "success" ? (
                              <span className="badge badge-gold" style={{ fontSize: "0.72rem" }}>
                                Lunas
                              </span>
                            ) : t.status === "pending" ? (
                              <span className="badge badge-outline" style={{ fontSize: "0.72rem" }}>
                                Menunggu
                              </span>
                            ) : (
                              <span className="badge" style={{ background: "rgba(224, 85, 85, 0.15)", color: "#E05555", fontSize: "0.72rem" }}>
                                Refund
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className={styles.pagination}>
                  <span className={styles.paginationInfo}>
                    Menampilkan&nbsp;
                    <strong>{Math.min((txPage - 1) * ROWS_PER_PAGE + 1, reportData.transactions.length)}</strong>
                    &nbsp;–&nbsp;
                    <strong>{Math.min(txPage * ROWS_PER_PAGE, reportData.transactions.length)}</strong>
                    &nbsp;dari&nbsp;
                    <strong>{reportData.transactions.length}</strong>&nbsp;transaksi
                  </span>

                  <div className={styles.paginationControls}>
                    <button
                      className={styles.pageBtn}
                      onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                      disabled={txPage === 1}
                      aria-label="Halaman sebelumnya"
                    >
                      <Icons.ChevronLeft size={14} />
                    </button>

                    {buildPageNumbers(txPage, totalTxPages).map((pg, idx) =>
                      pg === "..." ? (
                        <span key={`ellipsis-${idx}`} className={styles.pageEllipsis}>…</span>
                      ) : (
                        <button
                          key={pg}
                          className={`${styles.pageBtn} ${txPage === pg ? styles.pageBtnActive : ""}`}
                          onClick={() => setTxPage(pg as number)}
                          aria-label={`Halaman ${pg}`}
                          aria-current={txPage === pg ? "page" : undefined}
                        >
                          {pg}
                        </button>
                      )
                    )}

                    <button
                      className={styles.pageBtn}
                      onClick={() => setTxPage((p) => Math.min(totalTxPages, p + 1))}
                      disabled={txPage === totalTxPages}
                      aria-label="Halaman berikutnya"
                    >
                      <Icons.ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
