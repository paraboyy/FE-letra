"use client";

import { useEffect, useState } from "react";
import { STATUS_CONFIG, formatCurrency, formatDate } from "@/lib/data";
import { DashboardStats, MonthlyRevenue, Reservation, User } from "@/lib/types";
import { reportsService, reservationsService, authService } from "@/lib/services";
import Icons from "@/components/shared/Icons";
import styles from "./page.module.css";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [recentReservations, setRecentReservations] = useState<Reservation[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      const user = authService.getCurrentUser();
      setCurrentUser(user);

      try {
        const [statsData, revenueData, reservationsData] = await Promise.all([
          reportsService.getDashboardStats(),
          reportsService.getMonthlyRevenue(),
          reservationsService.getAll(),
        ]);
        setStats(statsData);
        setMonthlyRevenue(revenueData);
        setRecentReservations(reservationsData.slice(0, 6));
      } catch (err) {
        console.error("Failed to load dashboard data from API:", err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const isStaff = currentUser?.role === "staff";
  const maxRevenue = monthlyRevenue.length > 0 ? Math.max(...monthlyRevenue.map((m) => m.revenue)) : 10000000;

  if (loading || !stats) {
    return (
      <div style={{ textAlign: "center", padding: "5rem 0", color: "var(--color-gold-primary)" }}>
        Memuat data dashboard dari backend API...
      </div>
    );
  }

  // Define stats based on role
  const adminStats = [
    {
      icon: <Icons.CreditCard size={22} color="#C9A84C" />,
      label: "Total Pendapatan",
      value: formatCurrency(stats.totalRevenue),
      change: `+${stats.revenueGrowth}%`,
      up: true,
      sub: `${formatCurrency(stats.revenueThisMonth)} omset bulan ini`,
      color: "#C9A84C",
    },
    {
      icon: <Icons.Calendar size={22} color="#5090E0" />,
      label: "Total Reservasi",
      value: stats.totalReservations,
      change: `+${stats.reservationGrowth}%`,
      up: true,
      sub: `${stats.reservationsThisMonth} sesi bulan ini`,
      color: "#5090E0",
    },
    {
      icon: <Icons.Users size={22} color="#4CAF88" />,
      label: "Basis Pelanggan",
      value: stats.totalCustomers,
      change: `+${stats.customerGrowth}%`,
      up: true,
      sub: `${stats.newCustomersThisMonth} klien baru`,
      color: "#4CAF88",
    },
    {
      icon: <Icons.Clock size={22} color="#F0A050" />,
      label: "Menunggu Konfirmasi",
      value: stats.pendingReservations,
      change: "Tindakan Diperlukan",
      up: false,
      sub: "Permintaan booking baru",
      color: "#F0A050",
    },
  ];

  const staffStats = [
    {
      icon: <Icons.Clock size={22} color="#F0A050" />,
      label: "Perlu Dikonfirmasi",
      value: stats.pendingReservations,
      change: "Antrean Masuk",
      up: false,
      sub: "Permintaan sesi belum verifikasi",
      color: "#F0A050",
    },
    {
      icon: <Icons.Calendar size={22} color="#5090E0" />,
      label: "Sesi Siap / Terjadwal",
      value: recentReservations.filter((r) => r.status === "confirmed").length,
      change: "Jadwal Siap",
      up: true,
      sub: "Sesi terkonfirmasi studio",
      color: "#5090E0",
    },
    {
      icon: <Icons.CheckCircle size={22} color="#4CAF88" />,
      label: "Sesi Sukses Selesai",
      value: stats.completedReservations,
      change: "Selesai",
      up: true,
      sub: "Sesi selesai terlaksana",
      color: "#4CAF88",
    },
    {
      icon: <Icons.Users size={22} color="#C9A84C" />,
      label: "Total Klien Aktif",
      value: stats.totalCustomers,
      change: "Direktori",
      up: true,
      sub: "Klien terdaftar di sistem",
      color: "#C9A84C",
    },
  ];

  const activeStats = isStaff ? staffStats : adminStats;

  return (
    <div className={styles.page}>
      {/* Welcome Banner */}
      <div className={styles.welcomeBanner}>
        <div>
          <h2 className={styles.welcomeTitle}>
            {isStaff ? "Dashboard Operasional Studio" : "Dashboard Eksekutif & Manajemen Studio"}
          </h2>
          <p className={styles.welcomeSub}>
            {isStaff
              ? "Panel kerja staf operasional: kelola antrean reservasi masuk, koordinasi fotografer, dan verifikasi bukti transfer."
              : "Pantau metrik pendapatan studio, performa paket foto, dan kelola master data sistem secara menyeluruh."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {isStaff ? (
            <>
              <Link href="/admin/reservations" className="btn btn-gold btn-sm">
                Antrean Reservasi
              </Link>
              <Link href="/admin/transactions" className="btn btn-outline btn-sm">
                Verifikasi Pembayaran
              </Link>
            </>
          ) : (
            <>
              <Link href="/admin/reservations" className="btn btn-gold btn-sm">
                Kelola Reservasi
              </Link>
              <Link href="/admin/reports" className="btn btn-outline btn-sm">
                Laporan Keuangan
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {activeStats.map((stat, i) => (
          <div key={i} className={`card ${styles.statCard}`}>
            <div className={styles.statTop}>
              <div className={styles.statIconWrap} style={{ background: `${stat.color}18` }}>
                {stat.icon}
              </div>
              <span className={`${styles.statChange} ${stat.up ? styles.up : styles.warn}`}>
                {stat.change}
              </span>
            </div>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
            <div className={styles.statSub}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts & Main Content (Admin gets full revenue chart, Staff gets operational task board) */}
      <div className={styles.mainGrid}>
        {!isStaff ? (
          /* Admin: Revenue Chart */
          <div className={`card ${styles.chartCard}`}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Arus Pendapatan Bulanan</h3>
              <span className="badge badge-gold">Tahun Berjalan</span>
            </div>
            <div className={styles.chart}>
              {monthlyRevenue.map((m) => (
                <div key={m.month} className={styles.bar}>
                  <div className={styles.barTooltip}>{formatCurrency(m.revenue)}</div>
                  <div
                    className={styles.barFill}
                    style={{ height: `${(m.revenue / maxRevenue) * 100}%` }}
                  />
                  <span className={styles.barLabel}>{m.month}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Staff: Operational Tasks Checklist */
          <div className={`card ${styles.chartCard}`}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Tugas Operasional Harian Staf</h3>
              <span className="badge badge-neutral">SOP Studio</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", padding: "0.5rem 0" }}>
              <div style={{ padding: "0.875rem 1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#F0EDE8" }}>1. Verifikasi Pembayaran Masuk</div>
                  <div style={{ fontSize: "0.75rem", color: "#8C8680", marginTop: "2px" }}>Periksa mutasi rekening & konfirmasi DP klien yang statusnya pending</div>
                </div>
                <Link href="/admin/transactions" className="btn btn-outline btn-sm" style={{ fontSize: "0.75rem" }}>
                  Buka Transaksi →
                </Link>
              </div>

              <div style={{ padding: "0.875rem 1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#F0EDE8" }}>2. Konfirmasi & Jadwalkan Sesi</div>
                  <div style={{ fontSize: "0.75rem", color: "#8C8680", marginTop: "2px" }}>Ubah status reservasi dari pending menjadi confirmed dan tugaskan fotografer</div>
                </div>
                <Link href="/admin/reservations" className="btn btn-outline btn-sm" style={{ fontSize: "0.75rem" }}>
                  Buka Reservasi →
                </Link>
              </div>

              <div style={{ padding: "0.875rem 1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "#F0EDE8" }}>3. Monitor Kalender Roster Studio</div>
                  <div style={{ fontSize: "0.75rem", color: "#8C8680", marginTop: "2px" }}>Pastikan kesiapan studio dan kehadiran fotografer pada jam sesi</div>
                </div>
                <Link href="/admin/schedule" className="btn btn-outline btn-sm" style={{ fontSize: "0.75rem" }}>
                  Buka Roster →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Status Distribution */}
        <div className={`card ${styles.statusCard}`}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Distribusi Sesi Studio</h3>
          </div>
          <div className={styles.statusList}>
            {[
              { label: "Menunggu Konfirmasi", count: stats.pendingReservations, color: "#F0A050", badge: "badge-warning" },
              { label: "Sesi Selesai", count: stats.completedReservations, color: "#4CAF88", badge: "badge-success" },
              { label: "Dibatalkan", count: stats.cancelledReservations, color: "#E05555", badge: "badge-danger" },
            ].map((st) => (
              <div key={st.label} className={styles.statusItem}>
                <div className={styles.statusLeft}>
                  <div className={styles.statusDot} style={{ background: st.color }} />
                  <span className={styles.statusName}>{st.label}</span>
                </div>
                <span className={`badge ${st.badge}`}>{st.count} sesi</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className={`card ${styles.tableCard}`}>
        <div className={styles.tableHeader}>
          <h3 className={styles.cardTitle}>
            {isStaff ? "Antrean Reservasi Terbaru" : "Aktivitas Reservasi Terkini"}
          </h3>
          <Link href="/admin/reservations" className="btn btn-outline btn-sm" id="view-all-res-btn">
            Lihat Semua Reservasi →
          </Link>
        </div>
        <div className="table-wrapper" style={{ border: "none", borderRadius: 0 }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Klien</th>
                <th>Paket</th>
                <th>Jadwal Sesi</th>
                <th>Fotografer</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentReservations.map((res) => {
                const statusInfo = STATUS_CONFIG[res.status];
                return (
                  <tr key={res.id}>
                    <td>
                      <span className={styles.resId}>{res.id}</span>
                    </td>
                    <td style={{ fontWeight: 500, color: "#F0EDE8" }}>{res.customerName}</td>
                    <td>{res.packageName}</td>
                    <td>
                      <div style={{ fontSize: "0.85rem", color: "#DDD" }}>{formatDate(res.date)}</div>
                      <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>{res.time} WIB</div>
                    </td>
                    <td>{res.photographerName}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(res.totalAmount)}</td>
                    <td>
                      <span className={`badge ${statusInfo?.class}`}>{statusInfo?.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
