"use client";

import { useEffect, useState, useTransition } from "react";
import { Photographer } from "@/lib/types";
import { photographersService } from "@/lib/services";
import Icons from "@/components/shared/Icons";
import styles from "./page.module.css";

const ALL_DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
const ALL_SPECIALTIES = ["Portrait", "Pre-Wedding", "Wedding", "Family", "Commercial", "Wisuda", "Corporate", "Editorial"];

export default function AdminPhotographersPage() {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [, startTransition] = useTransition();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPhotographer, setEditingPhotographer] = useState<Photographer | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    experience: "3 Tahun",
    specialty: ["Portrait"],
    schedule: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
    status: "active" as "active" | "inactive",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadPhotographers = async () => {
    setLoading(true);
    try {
      const data = await photographersService.getAll({
        search: searchTerm || undefined,
        status: filterStatus !== "Semua" ? filterStatus : undefined,
      });
      setPhotographers(data);
    } catch (err) {
      console.error("Failed to load photographers from API:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotographers();
  }, [searchTerm, filterStatus]);

  const handleOpenAddModal = () => {
    setEditingPhotographer(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      experience: "2 Tahun",
      specialty: ["Portrait"],
      schedule: ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"],
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Photographer) => {
    setEditingPhotographer(p);
    setForm({
      name: p.name,
      email: p.email,
      phone: p.phone,
      experience: p.experience,
      specialty: p.specialty || ["Portrait"],
      schedule: p.schedule || ["Senin", "Selasa", "Rabu"],
      status: p.status || "active",
    });
    setIsModalOpen(true);
  };

  const handleToggleSpecialty = (spec: string) => {
    if (form.specialty.includes(spec)) {
      if (form.specialty.length > 1) {
        setForm({ ...form, specialty: form.specialty.filter((s) => s !== spec) });
      }
    } else {
      setForm({ ...form, specialty: [...form.specialty, spec] });
    }
  };

  const handleToggleDay = (day: string) => {
    if (form.schedule.includes(day)) {
      if (form.schedule.length > 1) {
        setForm({ ...form, schedule: form.schedule.filter((d) => d !== day) });
      }
    } else {
      setForm({ ...form, schedule: [...form.schedule, day] });
    }
  };

  const handleToggleStatus = async (p: Photographer) => {
    const newStatus = p.status === "active" ? "inactive" : "active";
    try {
      const updated = await photographersService.update(p.id, { status: newStatus });
      setPhotographers((prev) => prev.map((item) => (item.id === p.id ? updated : item)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal mengubah status fotografer.");
    }
  };

  const handleDelete = async (p: Photographer) => {
    if (!confirm(`Hapus data staf fotografer ${p.name} (${p.id}) secara permanen?`)) return;
    try {
      await photographersService.delete(p.id);
      setPhotographers((prev) => prev.filter((item) => item.id !== p.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus staf fotografer.");
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingPhotographer) {
        const updated = await photographersService.update(editingPhotographer.id, form);
        setPhotographers((prev) => prev.map((item) => (item.id === editingPhotographer.id ? updated : item)));
      } else {
        const created = await photographersService.create(form);
        setPhotographers((prev) => [created, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan data fotografer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Header with Search and Actions */}
      <div className={styles.header}>
        <div className={styles.searchBox}>
          <Icons.Search size={18} color="#7E7873" />
          <input
            id="search-photographer"
            type="search"
            placeholder="Cari fotografer, email, atau keahlian..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => startTransition(() => setSearchTerm(e.target.value))}
          />
        </div>
        <div className={styles.actions}>
          <select
            className="form-input form-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: "auto", minWidth: "140px" }}
          >
            <option value="Semua">Semua Status</option>
            <option value="active">Aktif Roster</option>
            <option value="inactive">Nonaktif</option>
          </select>
          <button
            className="btn btn-gold btn-sm"
            id="add-photographer-btn"
            onClick={handleOpenAddModal}
          >
            + Tambah Fotografer
          </button>
          <button className="btn btn-outline btn-sm" id="refresh-photographer-btn" onClick={loadPhotographers}>
            <Icons.RefreshCw size={14} style={{ marginRight: 4 }} />
            Segarkan
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gold-primary)" }}>
          Memuat data staf fotografer dari backend server...
        </div>
      ) : (
        <div className={styles.photographerGrid} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {photographers.map((p) => {
            const isActive = p.status === "active" || !p.status;
            return (
              <div key={p.id} className={`card ${styles.customerCard}`} id={`ph-card-${p.id}`} style={{ border: "1px solid var(--color-border-subtle)", opacity: isActive ? 1 : 0.7 }}>
                {/* Header */}
                <div className={styles.customerHeader}>
                  <div className={styles.avatar} style={{ background: isActive ? "linear-gradient(135deg, #C9A84C, #9B7A2F)" : "#333" }}>
                    {p.name.charAt(0)}
                  </div>
                  <div className={styles.customerInfo}>
                    <div className={styles.customerName}>{p.name}</div>
                    <div className={styles.customerId}>{p.id}</div>
                  </div>
                  <span className={`badge ${isActive ? "badge-success" : "badge-neutral"}`}>
                    {isActive ? "Aktif Roster" : "Nonaktif"}
                  </span>
                </div>

                <div className="divider" style={{ margin: "1rem 0" }} />

                <div className={styles.customerDetails}>
                  <div className={styles.detailItem}>
                    <Icons.Phone size={14} color="#7E7873" />
                    <span>{p.phone}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <Icons.Mail size={14} color="#7E7873" />
                    <span>{p.email}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <Icons.Camera size={14} color="#7E7873" />
                    <span>Pengalaman: <b>{p.experience}</b></span>
                  </div>
                </div>

                {/* Specialties */}
                <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginTop: "0.75rem" }}>
                  {p.specialty?.map((s) => (
                    <span key={s} className="badge badge-neutral" style={{ fontSize: "0.7rem" }}>{s}</span>
                  ))}
                </div>

                <div className="divider" style={{ margin: "1rem 0" }} />

                <div className={styles.customerStats}>
                  <div className={styles.custStat}>
                    <div className={styles.custStatValue} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                      <Icons.Star size={14} color="#C9A84C" />
                      <span>{p.rating || 5.0}</span>
                    </div>
                    <div className={styles.custStatLabel}>Rating Klien</div>
                  </div>
                  <div className={styles.custStatDivider} />
                  <div className={styles.custStat}>
                    <div className={styles.custStatValue}>{p.totalSessions || 0}</div>
                    <div className={styles.custStatLabel}>Sesi Sukses</div>
                  </div>
                </div>

                {/* Schedule */}
                <div style={{ marginTop: "0.75rem" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginBottom: "0.4rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>Hari Tugas Studio</div>
                  <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                    {ALL_DAYS.map((day) => {
                      const available = p.schedule?.includes(day);
                      return (
                        <span key={day} style={{
                          fontSize: "0.65rem", fontWeight: 600, padding: "0.2rem 0.35rem",
                          borderRadius: "4px", border: "1px solid",
                          borderColor: available ? "rgba(201,168,76,0.3)" : "transparent",
                          background: available ? "rgba(201,168,76,0.1)" : "rgba(255,255,255,0.03)",
                          color: available ? "var(--color-gold-primary)" : "var(--color-text-muted)",
                        }}>{day.slice(0, 3)}</span>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="divider" style={{ margin: "1rem 0" }} />
                <div style={{ display: "flex", gap: "0.5rem", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: "0.72rem", padding: "0.3rem 0.6rem" }}
                    onClick={() => handleToggleStatus(p)}
                    title={isActive ? "Nonaktifkan Fotografer" : "Aktifkan Fotografer"}
                  >
                    {isActive ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <div style={{ display: "flex", gap: "0.35rem" }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: "0.72rem", padding: "0.3rem 0.6rem" }}
                      onClick={() => handleOpenEditModal(p)}
                    >
                      <Icons.Edit size={13} style={{ marginRight: 3 }} /> Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      style={{ color: "#E05555", padding: "0.3rem 0.5rem" }}
                      onClick={() => handleDelete(p)}
                      title="Hapus Data Fotografer"
                    >
                      <Icons.Trash size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Photographer Modal */}
      {isModalOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1.5rem"
        }}>
          <div className="card" style={{ maxWidth: "540px", width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.25rem", color: "#F0EDE8", fontWeight: 600 }}>
                {editingPhotographer ? `Edit Staf: ${editingPhotographer.name}` : "Tambah Fotografer Baru"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", color: "#8C8680", fontSize: "1.25rem", cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label className="form-label">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Aditya Pratama"
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label className="form-label">Alamat Email</label>
                  <input
                    type="email"
                    required
                    placeholder="nama@letrastudio.id"
                    className="form-input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">No. Telepon / WA</label>
                  <input
                    type="tel"
                    required
                    placeholder="0812-3456-7890"
                    className="form-input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                <div>
                  <label className="form-label">Pengalaman Kerja</label>
                  <input
                    type="text"
                    placeholder="Contoh: 4 Tahun"
                    className="form-input"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Status Roster</label>
                  <select
                    className="form-input form-select"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })}
                  >
                    <option value="active">Aktif (Bisa Ditugaskan)</option>
                    <option value="inactive">Nonaktif (Cuti / Libur)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Keahlian / Spesialisasi Foto</label>
                <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.35rem" }}>
                  {ALL_SPECIALTIES.map((spec) => {
                    const selected = form.specialty.includes(spec);
                    return (
                      <button
                        type="button"
                        key={spec}
                        onClick={() => handleToggleSpecialty(spec)}
                        className={`badge ${selected ? "badge-gold" : "badge-neutral"}`}
                        style={{ cursor: "pointer", padding: "0.35rem 0.65rem", fontSize: "0.75rem" }}
                      >
                        {selected ? `✓ ${spec}` : spec}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="form-label">Hari Tugas Kerja Studio</label>
                <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.35rem" }}>
                  {ALL_DAYS.map((day) => {
                    const selected = form.schedule.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => handleToggleDay(day)}
                        className={`badge ${selected ? "badge-gold" : "badge-neutral"}`}
                        style={{ cursor: "pointer", padding: "0.35rem 0.6rem", fontSize: "0.75rem" }}
                      >
                        {selected ? `✓ ${day}` : day}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", marginTop: "1rem" }}>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-gold btn-sm"
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : editingPhotographer ? "Simpan Perubahan" : "Tambahkan Staf"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
