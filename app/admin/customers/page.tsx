"use client";

import { useEffect, useState, useTransition } from "react";
import { STATUS_CONFIG, formatDate, formatCurrency } from "@/lib/data";
import { Customer } from "@/lib/types";
import { customersService } from "@/lib/services";
import Icons from "@/components/shared/Icons";
import styles from "./page.module.css";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const data = await customersService.getAll({ search: searchTerm || undefined });
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [searchTerm]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.searchBox}>
          <Icons.Search size={18} color="#7E7873" />
          <input
            id="search-customer"
            type="search"
            placeholder="Cari nama pelanggan, email, atau nomor kontak..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => startTransition(() => setSearchTerm(e.target.value))}
          />
        </div>
        <div className={styles.actions}>
          <button className="btn btn-outline btn-sm" id="refresh-customer-btn" onClick={loadCustomers}>
            <Icons.RefreshCw size={14} style={{ marginRight: 4 }} />
            Segarkan
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gold-primary)" }}>
          Memuat data direktori pelanggan...
        </div>
      ) : (
        <div className={styles.customerGrid}>
          {customers.map((c) => {
            const statusInfo = STATUS_CONFIG[c.status];
            return (
              <div key={c.id} className={`card ${styles.customerCard}`} id={`customer-${c.id}`}>
                <div className={styles.customerHeader}>
                  <div className={styles.avatar}>{c.name.charAt(0)}</div>
                  <div className={styles.customerInfo}>
                    <div className={styles.customerName}>{c.name}</div>
                    <div className={styles.customerId}>{c.id}</div>
                  </div>
                  <span className={`badge ${statusInfo?.class}`}>{statusInfo?.label}</span>
                </div>
                <div className="divider" style={{ margin: "1rem 0" }} />
                <div className={styles.customerDetails}>
                  <div className={styles.detailItem}>
                    <Icons.Phone size={14} color="#7E7873" />
                    <span>{c.phone}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <Icons.Mail size={14} color="#7E7873" />
                    <span>{c.email}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <Icons.Calendar size={14} color="#7E7873" />
                    <span>Terdaftar: {formatDate(c.joinDate)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <Icons.Clock size={14} color="#7E7873" />
                    <span>Kunjungan Terakhir: {formatDate(c.lastVisit)}</span>
                  </div>
                </div>
                <div className="divider" style={{ margin: "1rem 0" }} />
                <div className={styles.customerStats}>
                  <div className={styles.custStat}>
                    <div className={styles.custStatValue}>{c.totalReservations}</div>
                    <div className={styles.custStatLabel}>Sesi Selesai</div>
                  </div>
                  <div className={styles.custStatDivider} />
                  <div className={styles.custStat}>
                    <div className={styles.custStatValue}>{formatCurrency(c.totalSpending)}</div>
                    <div className={styles.custStatLabel}>Akumulasi Belanja</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
