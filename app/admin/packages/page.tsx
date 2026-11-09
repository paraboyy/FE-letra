"use client";

import { useEffect, useState, useTransition } from "react";
import { formatCurrency } from "@/lib/data";
import { Package } from "@/lib/types";
import { packagesService } from "@/lib/services";
import Icons from "@/components/shared/Icons";
import styles from "./page.module.css";

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await packagesService.getAll({ search: searchTerm || undefined });
      setPackages(data);
    } catch (err) {
      console.error("Failed to load packages from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, [searchTerm]);

  const handleDelete = async (id: string) => {
    if (!confirm(`Hapus paket foto ${id}?`)) return;
    try {
      await packagesService.delete(id);
      setPackages((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus paket.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.searchBox}>
          <Icons.Search size={18} color="#7E7873" />
          <input
            id="search-package"
            type="search"
            placeholder="Cari paket foto studio..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => startTransition(() => setSearchTerm(e.target.value))}
          />
        </div>
        <div className={styles.actions}>
          <button className="btn btn-gold btn-sm" id="refresh-package-btn" onClick={loadPackages}>
            <Icons.RefreshCw size={14} style={{ marginRight: 4 }} />
            Segarkan
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gold-primary)" }}>
          Memuat daftar paket foto...
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Paket</th>
                <th>Kategori</th>
                <th>Durasi</th>
                <th>Retouched Master</th>
                <th>Harga Investasi</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((p) => (
                <tr key={p.id} id={`pkg-row-${p.id}`}>
                  <td><span style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#C9A84C" }}>{p.id}</span></td>
                  <td>
                    <div style={{ fontWeight: 600, color: "#F0EDE8" }}>{p.name}</div>
                    {p.popular && <span className="badge badge-gold" style={{ marginTop: "4px", fontSize: "0.65rem" }}>Rekomendasi Utama</span>}
                  </td>
                  <td style={{ textTransform: "capitalize" }}>{p.category}</td>
                  <td>{p.duration}</td>
                  <td>{p.editedPhotos} foto</td>
                  <td style={{ fontFamily: "'Playfair Display', serif", fontWeight: 600, color: "var(--color-gold-primary)" }}>
                    {formatCurrency(p.price)}
                  </td>
                  <td><span className="badge badge-success">Aktif di Web</span></td>
                  <td>
                    <div className={styles.rowActions}>
                      <button
                        className="btn btn-ghost btn-sm"
                        id={`delete-pkg-${p.id}`}
                        onClick={() => handleDelete(p.id)}
                        title="Hapus Paket"
                      >
                        <Icons.Trash size={15} color="#E05555" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
