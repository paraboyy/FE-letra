"use client";

import { useEffect, useState, useMemo } from "react";
import { Photographer, Reservation } from "@/lib/types";
import { photographersService, reservationsService } from "@/lib/services";
import Icons from "@/components/shared/Icons";
import Link from "next/link";
import styles from "./page.module.css";

const DAY_NAMES = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const MONTH_NAMES = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

// Helper: Format Date to YYYY-MM-DD
function formatDateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper: Get Start of Week (Monday)
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
}

// Generate 1-Click Google Calendar Event URL
function generateGoogleCalendarUrl(booking: Reservation, photographerName?: string): string {
  const dateClean = (booking.date || "2026-09-30").replace(/-/g, "");
  const timeRaw = booking.time || "10:00";
  const [hourStr, minStr] = timeRaw.split(":");
  const startH = parseInt(hourStr || "10", 10);
  const startM = minStr || "00";
  const startDateTime = `${dateClean}T${String(startH).padStart(2, "0")}${startM}00`;
  
  const endH = String((startH + 2) % 24).padStart(2, "0");
  const endDateTime = `${dateClean}T${endH}${startM}00`;

  const title = encodeURIComponent(`Sesi Foto: ${booking.packageName} — ${booking.customerName} [Letra Studio]`);
  const details = encodeURIComponent(
    `JADWAL SESI PEMOTRETAN LETRA STUDIO\n` +
    `====================================\n` +
    `ID Reservasi : ${booking.id}\n` +
    `Nama Klien   : ${booking.customerName}\n` +
    `WhatsApp     : ${booking.customerPhone}\n` +
    `Email        : ${booking.customerEmail || "-"}\n` +
    `Paket Foto   : ${booking.packageName}\n` +
    `Fotografer   : ${photographerName || booking.photographerName || "Staf Fotografer"}\n` +
    `Durasi Sesi  : ${booking.duration || "2 Jam"}\n` +
    `Status Bayar : ${booking.paymentStatus.toUpperCase()}\n` +
    `Catatan      : ${booking.notes || "Tidak ada catatan khusus"}\n` +
    `====================================\n` +
    `Studio: Letra Studio — Fine Art & Portraiture`
  );
  const location = encodeURIComponent("Letra Studio, Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan");

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDateTime}/${endDateTime}&details=${details}&location=${location}`;
}

// Generate RFC 5545 iCalendar (.ics) content for single booking
function downloadIcsFile(booking: Reservation, photographerName?: string) {
  const dateClean = (booking.date || "2026-09-30").replace(/-/g, "");
  const timeRaw = booking.time || "10:00";
  const [hourStr, minStr] = timeRaw.split(":");
  const startH = parseInt(hourStr || "10", 10);
  const startM = minStr || "00";
  const startISO = `${dateClean}T${String(startH).padStart(2, "0")}${startM}00`;
  const endH = String((startH + 2) % 24).padStart(2, "0");
  const endISO = `${dateClean}T${endH}${startM}00`;
  const nowISO = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Letra Studio//ID//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.id}-${dateClean}@letrastudio.id`,
    `DTSTAMP:${nowISO}`,
    `DTSTART:${startISO}`,
    `DTEND:${endISO}`,
    `SUMMARY:Sesi Foto: ${booking.packageName} - ${booking.customerName} (Letra Studio)`,
    `DESCRIPTION:ID: ${booking.id} | Klien: ${booking.customerName} (${booking.customerPhone}) | Fotografer: ${photographerName || booking.photographerName} | Paket: ${booking.packageName}`,
    "LOCATION:Letra Studio\\, Jl. Senopati No. 45\\, Kebayoran Baru\\, Jakarta Selatan",
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsLines], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `letra-${booking.id}-schedule.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate batch .ics file for multiple bookings
function downloadBatchIcs(bookings: Reservation[], photographersList: Photographer[], label: string) {
  if (bookings.length === 0) {
    alert("Tidak ada jadwal reservasi pada periode terpilih untuk diekspor.");
    return;
  }

  const nowISO = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const events = bookings.map((b) => {
    const dateClean = (b.date || "2026-09-30").replace(/-/g, "");
    const timeRaw = b.time || "10:00";
    const [hourStr, minStr] = timeRaw.split(":");
    const startH = parseInt(hourStr || "10", 10);
    const startM = minStr || "00";
    const startISO = `${dateClean}T${String(startH).padStart(2, "0")}${startM}00`;
    const endH = String((startH + 2) % 24).padStart(2, "0");
    const endISO = `${dateClean}T${endH}${startM}00`;
    const phoName = photographersList.find((p) => p.id === b.photographerId)?.name || b.photographerName;

    return [
      "BEGIN:VEVENT",
      `UID:${b.id}-${dateClean}@letrastudio.id`,
      `DTSTAMP:${nowISO}`,
      `DTSTART:${startISO}`,
      `DTEND:${endISO}`,
      `SUMMARY:Sesi Foto: ${b.packageName} - ${b.customerName} (Letra Studio)`,
      `DESCRIPTION:ID: ${b.id} | Klien: ${b.customerName} (${b.customerPhone}) | Fotografer: ${phoName} | Paket: ${b.packageName}`,
      "LOCATION:Letra Studio\\, Jl. Senopati No. 45\\, Kebayoran Baru\\, Jakarta Selatan",
      "STATUS:CONFIRMED",
      "END:VEVENT",
    ].join("\r\n");
  });

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Letra Studio//ID//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:Letra Studio Roster (${label})`,
    ...events,
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `letra-studio-roster-${label.replace(/[^a-zA-Z0-9]/g, "-")}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminSchedulePage() {
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic Selected Date (defaults to today or sample date matching DB)
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date("2026-09-20"));
  const [viewMode, setViewMode] = useState<"week" | "month">("week");
  const [selectedBooking, setSelectedBooking] = useState<Reservation | null>(null);

  // Photographer Filter & Google Calendar Modal State
  const [selectedPhotographerFilter, setSelectedPhotographerFilter] = useState<string>("");
  const [isGcalModalOpen, setIsGcalModalOpen] = useState(false);

  useEffect(() => {
    async function loadScheduleData() {
      try {
        const [phs, res] = await Promise.all([
          photographersService.getAll(),
          reservationsService.getAll(),
        ]);
        setPhotographers(phs);
        setReservations(res);
      } catch (err) {
        console.error("Failed to load schedule from API:", err);
      } finally {
        setLoading(false);
      }
    }
    loadScheduleData();
  }, []);

  // Compute 7 days of the currently selected week (Monday -> Sunday)
  const weekDays = useMemo(() => {
    const monday = getMonday(currentDate);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = formatDateISO(d);
      const dayIndex = d.getDay(); // 0 is Sunday, 1 is Monday...
      return {
        dateObj: d,
        iso,
        dayName: DAY_NAMES[dayIndex],
        dayNum: d.getDate(),
        isToday: formatDateISO(new Date()) === iso,
      };
    });
  }, [currentDate]);

  // Compute Days for Monthly Calendar Grid (full month + leading/trailing cells)
  const monthCalendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const firstDayOfWeek = firstDay.getDay(); // 0 (Sun) - 6 (Sat)
    // Offset for Monday start (0: Mon, ..., 6: Sun)
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const days = [];

    // Previous month filler days
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month, -i);
      const iso = formatDateISO(d);
      days.push({
        dateObj: d,
        iso,
        dayNum: d.getDate(),
        isCurrentMonth: false,
        isToday: formatDateISO(new Date()) === iso,
      });
    }

    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const d = new Date(year, month, i);
      const iso = formatDateISO(d);
      days.push({
        dateObj: d,
        iso,
        dayNum: i,
        isCurrentMonth: true,
        isToday: formatDateISO(new Date()) === iso,
      });
    }

    // Next month filler days to complete 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      const iso = formatDateISO(d);
      days.push({
        dateObj: d,
        iso,
        dayNum: i,
        isCurrentMonth: false,
        isToday: formatDateISO(new Date()) === iso,
      });
    }

    return days;
  }, [currentDate]);

  // Navigation handlers
  const handlePrevWeek = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setCurrentDate(new Date(e.target.value));
    }
  };

  const filteredReservations = useMemo(() => {
    if (!selectedPhotographerFilter) return reservations;
    return reservations.filter((r) => r.photographerId === selectedPhotographerFilter);
  }, [reservations, selectedPhotographerFilter]);

  // KPI Calculations
  const activePeriodSessions = useMemo(() => {
    if (viewMode === "week") {
      const weekISOs = new Set(weekDays.map((w) => w.iso));
      return filteredReservations.filter((r) => weekISOs.has(r.date));
    } else {
      const currentYearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
      return filteredReservations.filter((r) => r.date.startsWith(currentYearMonth));
    }
  }, [filteredReservations, weekDays, viewMode, currentDate]);

  const displayedPhotographers = useMemo(() => {
    if (!selectedPhotographerFilter) return photographers;
    return photographers.filter((p) => p.id === selectedPhotographerFilter);
  }, [photographers, selectedPhotographerFilter]);

  const activePhotographersCount = displayedPhotographers.length;

  return (
    <div className={styles.page}>
      {/* Top Header & Navigation Controls */}
      <div className={styles.topBar}>
        <div className={styles.titleArea}>
          <h1 className={styles.pageTitle}>
            <Icons.Calendar size={22} color="#C9A84C" />
            <span>Jadwal Roster Studio & Fotografer</span>
          </h1>
          <div className={styles.periodSubtitle}>
            {viewMode === "week" ? (
              <>
                Pekan: <strong>{weekDays[0]?.dayNum} {MONTH_NAMES[weekDays[0]?.dateObj.getMonth()]}</strong> – <strong>{weekDays[6]?.dayNum} {MONTH_NAMES[weekDays[6]?.dateObj.getMonth()]} {weekDays[6]?.dateObj.getFullYear()}</strong>
              </>
            ) : (
              <>
                Bulan: <strong>{MONTH_NAMES[currentDate.getMonth()]} {currentDate.getFullYear()}</strong>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Navigation Toolbar */}
        <div className={styles.controlsArea}>
          {/* Photographer Filter Dropdown */}
          <select
            className={styles.filterSelect}
            value={selectedPhotographerFilter}
            onChange={(e) => setSelectedPhotographerFilter(e.target.value)}
            id="photographer-filter-select"
            title="Filter Berdasarkan Fotografer"
          >
            <option value="">Semua Fotografer ({photographers.length})</option>
            {photographers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Google Calendar Hub Trigger */}
          <button
            type="button"
            className={styles.gcalHubBtn}
            onClick={() => setIsGcalModalOpen(true)}
            id="open-gcal-modal-btn"
            title="Hubungkan & Sinkronkan dengan Google Calendar"
          >
            <Icons.Calendar size={14} />
            <span>Sync Google Calendar</span>
          </button>

          {/* Navigation Buttons for Week / Month */}
          <div className={styles.navButtonGroup}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={handlePrevMonth}
              title="Bulan Lalu (-1 Bulan)"
              id="prev-month-btn"
            >
              « Bln Lalu
            </button>
            <div className={styles.navDivider} />
            <button
              type="button"
              className={styles.navBtn}
              onClick={handlePrevWeek}
              title="Pekan Lalu (-7 Hari)"
              id="prev-week-btn"
            >
              ‹ Pekan Lalu
            </button>
            <div className={styles.navDivider} />
            <button
              type="button"
              className={styles.navBtn}
              onClick={handleGoToToday}
              title="Kembali ke Hari Ini"
              id="today-btn"
              style={{ fontWeight: 600, color: "var(--color-gold-light)" }}
            >
              Hari Ini
            </button>
            <div className={styles.navDivider} />
            <button
              type="button"
              className={styles.navBtn}
              onClick={handleNextWeek}
              title="Pekan Depan (+7 Hari)"
              id="next-week-btn"
            >
              Pekan Depan ›
            </button>
            <div className={styles.navDivider} />
            <button
              type="button"
              className={styles.navBtn}
              onClick={handleNextMonth}
              title="Bulan Depan (+1 Bulan)"
              id="next-month-btn"
            >
              Bln Depan »
            </button>
          </div>

          {/* Quick Date Picker */}
          <input
            type="date"
            className={styles.dateInput}
            value={formatDateISO(currentDate)}
            onChange={handleDateInputChange}
            title="Pilih Tanggal Langsung"
            id="schedule-date-picker"
          />

          {/* View Mode Tabs (Mingguan vs Bulanan) */}
          <div className={styles.viewTabs}>
            <button
              type="button"
              className={`${styles.viewTabBtn} ${viewMode === "week" ? styles.viewTabBtnActive : ""}`}
              onClick={() => setViewMode("week")}
              id="tab-week-view"
            >
              Mingguan
            </button>
            <button
              type="button"
              className={`${styles.viewTabBtn} ${viewMode === "month" ? styles.viewTabBtnActive : ""}`}
              onClick={() => setViewMode("month")}
              id="tab-month-view"
            >
              Bulanan
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>
            <Icons.Calendar size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{activePeriodSessions.length}</div>
            <div className={styles.kpiLabel}>Sesi Foto di Periode Ini</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>
            <Icons.Users size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>{activePhotographersCount}</div>
            <div className={styles.kpiLabel}>Fotografer Ditampilkan</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>
            <Icons.Clock size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>
              {activePeriodSessions.filter((s) => s.status === "confirmed" || s.status === "completed").length}
            </div>
            <div className={styles.kpiLabel}>Sesi Terkonfirmasi</div>
          </div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon}>
            <Icons.CheckCircle size={20} />
          </div>
          <div>
            <div className={styles.kpiValue}>
              {activePeriodSessions.filter((s) => s.paymentStatus === "paid").length}
            </div>
            <div className={styles.kpiLabel}>Sesi Lunas 100%</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-gold-primary)" }}>
          <Icons.RefreshCw size={24} className="animate-spin" style={{ margin: "0 auto 0.75rem" }} />
          <div>Memuat matriks jadwal fotografer...</div>
        </div>
      ) : viewMode === "week" ? (
        /* ================= WEEKLY MATRIX VIEW ================= */
        <div className={styles.matrixWrapper}>
          <div className={styles.matrixGrid}>
            {/* Header Column: Photographer Title */}
            <div className={styles.matrixHeaderCell}>
              <span className={styles.dayName}>Fotografer / Roster</span>
              <div className={styles.dayNumber} style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                Status Tugas
              </div>
            </div>

            {/* 7 Days of the Week Columns */}
            {weekDays.map((day) => (
              <div
                key={day.iso}
                className={`${styles.matrixHeaderCell} ${day.isToday ? styles.matrixHeaderToday : ""}`}
              >
                <div className={styles.dayName}>{day.dayName}</div>
                <div className={styles.dayNumber}>{day.dayNum}</div>
                {day.isToday && <div className={styles.dayTodayBadge}>Hari Ini</div>}
              </div>
            ))}

            {/* Photographer Rows */}
            {displayedPhotographers.map((ph) => (
              <div key={ph.id} style={{ display: "contents" }}>
                {/* Photographer Name Cell */}
                <div className={styles.phNameCell}>
                  <div className={styles.phAvatar}>{ph.name.charAt(0)}</div>
                  <div className={styles.phInfo}>
                    <span className={styles.phName}>{ph.name}</span>
                    <span className={styles.phSpecialty}>{ph.specialty[0]}</span>
                  </div>
                </div>

                {/* 7 Days Grid Cells for this photographer */}
                {weekDays.map((day) => {
                  const isWorkingDay = ph.schedule?.includes(day.dayName);
                  const dayBookings = filteredReservations.filter(
                    (r) => r.photographerId === ph.id && r.date === day.iso
                  );

                  return (
                    <div
                      key={`${ph.id}-${day.iso}`}
                      className={`${styles.dayCell} ${day.isToday ? styles.dayCellToday : ""}`}
                      id={`cell-${ph.id}-${day.iso}`}
                    >
                      {!isWorkingDay ? (
                        <div className={styles.offBadge}>Off / Libur</div>
                      ) : dayBookings.length > 0 ? (
                        dayBookings.map((b) => (
                          <div
                            key={b.id}
                            className={styles.bookingChip}
                            onClick={() => setSelectedBooking(b)}
                            title="Klik untuk detail sesi foto"
                          >
                            <div className={styles.bookingChipTime}>
                              <Icons.Camera size={11} /> {b.time}
                            </div>
                            <div className={styles.bookingChipCustomer}>{b.customerName}</div>
                            <div className={styles.bookingChipPkg}>{b.packageName}</div>
                          </div>
                        ))
                      ) : (
                        <div className={styles.slotReady}>Slot Siap</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* ================= MONTHLY CALENDAR GRID VIEW ================= */
        <div className={styles.monthWrapper}>
          <div className={styles.monthGrid}>
            {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map((d) => (
              <div key={d} className={styles.monthHeaderCell}>
                {d}
              </div>
            ))}

            {monthCalendarData.map((cell) => {
              const cellBookings = filteredReservations.filter((r) => r.date === cell.iso);

              return (
                <div
                  key={cell.iso}
                  className={`${styles.monthDayCell} ${!cell.isCurrentMonth ? styles.monthDayCellOther : ""} ${cell.isToday ? styles.monthDayCellToday : ""}`}
                >
                  <div className={styles.monthDayHeader}>
                    <span className={`${styles.monthDayNum} ${cell.isToday ? styles.monthDayNumToday : ""}`}>
                      {cell.dayNum}
                    </span>
                    {cellBookings.length > 0 && (
                      <span style={{ fontSize: "0.68rem", color: "var(--color-gold-primary)", fontWeight: 700 }}>
                        {cellBookings.length} Sesi
                      </span>
                    )}
                  </div>

                  <div className={styles.monthPills}>
                    {cellBookings.slice(0, 3).map((b) => (
                      <div
                        key={b.id}
                        className={styles.monthBookingPill}
                        onClick={() => setSelectedBooking(b)}
                        title={`${b.time} - ${b.customerName} (${b.packageName})`}
                      >
                        {b.time} {b.customerName}
                      </div>
                    ))}
                    {cellBookings.length > 3 && (
                      <div style={{ fontSize: "0.65rem", color: "var(--color-text-muted)" }}>
                        +{cellBookings.length - 3} sesi lainnya
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Booking Quick Details Modal with Google Calendar Sync */}
      {selectedBooking && (
        <div className={styles.modalOverlay} onClick={() => setSelectedBooking(null)}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={() => setSelectedBooking(null)}
            >
              <Icons.X size={16} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span className="badge badge-gold" style={{ textTransform: "uppercase" }}>
                {selectedBooking.id}
              </span>
              <span className={`badge ${selectedBooking.status === "confirmed" ? "badge-success" : "badge-warning"}`}>
                {selectedBooking.status}
              </span>
            </div>

            <h3 style={{ fontSize: "1.2rem", fontWeight: 600, color: "#FFFFFF", marginBottom: "0.25rem" }}>
              {selectedBooking.packageName}
            </h3>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "1.25rem" }}>
              Klien: <strong style={{ color: "#FFF" }}>{selectedBooking.customerName}</strong> · {selectedBooking.customerPhone}
            </p>

            <div style={{ background: "#0E0E0E", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div>
                <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Tanggal & Waktu</span>
                <div style={{ fontSize: "0.85rem", color: "#FFF", fontWeight: 600, marginTop: 2 }}>
                  {selectedBooking.date} ({selectedBooking.time} WITA)
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Fotografer Bertugas</span>
                <div style={{ fontSize: "0.85rem", color: "var(--color-gold-light)", fontWeight: 600, marginTop: 2 }}>
                  {photographers.find((p) => p.id === selectedBooking.photographerId)?.name || "Fotografer Studio"}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Total Investasi</span>
                <div style={{ fontSize: "0.85rem", color: "#FFF", fontWeight: 600, marginTop: 2 }}>
                  Rp {selectedBooking.totalAmount.toLocaleString("id-ID")}
                </div>
              </div>

              <div>
                <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "uppercase" }}>Status Bayar</span>
                <div style={{ fontSize: "0.85rem", color: "var(--color-gold-primary)", fontWeight: 600, marginTop: 2 }}>
                  {selectedBooking.paymentStatus.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Google Calendar Actions for this Session */}
            <div className={styles.gcalActions}>
              <div className={styles.gcalActionsTitle}>
                <Icons.Calendar size={14} color="#C9A84C" />
                <span>Sinkronisasi Google Calendar</span>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <a
                  href={generateGoogleCalendarUrl(selectedBooking)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.gcalDirectBtn}
                  id="gcal-add-event-btn"
                >
                  <Icons.ExternalLink size={13} />
                  <span>+ Tambah ke Google Calendar</span>
                </a>
                <button
                  type="button"
                  className={styles.icsDownloadBtn}
                  onClick={() => downloadIcsFile(selectedBooking)}
                  id="ics-download-session-btn"
                >
                  <Icons.Download size={13} />
                  <span>Unduh File .ICS</span>
                </button>
              </div>
              <p className={styles.gcalNote}>
                💡 Sesi foto ini dapat langsung masuk ke kalender fotografer tanpa perlu membebani kapasitas database lokal Letra Studio.
              </p>
            </div>

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
              <Link
                href={`/admin/reservations?search=${selectedBooking.id}`}
                className="btn btn-gold w-full"
                style={{ justifyContent: "center", fontSize: "0.85rem" }}
              >
                Buka di Menu Reservasi Admin →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Google Calendar Hub Modal */}
      {isGcalModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsGcalModalOpen(false)}>
          <div className={styles.modalCard} style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.modalCloseBtn}
              onClick={() => setIsGcalModalOpen(false)}
            >
              <Icons.X size={16} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <Icons.Calendar size={22} color="#C9A84C" />
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#FFFFFF", margin: 0 }}>
                Integrasi Google Calendar Studio
              </h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "1rem" }}>
              Sinkronkan jadwal sesi pemotretan fotografer ke Google Calendar agar jadwal tersimpan di cloud eksternal dan meringankan beban database lokal.
            </p>

            {/* Info Card: API Status & Free Tier */}
            <div className={styles.gcalInfoBanner}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem" }}>
                <span className="badge badge-success" style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}>
                  API Gratis (1.000.000 req/hari)
                </span>
                <span style={{ fontSize: "0.75rem", color: "#A1A1AA" }}>Google Cloud Platform</span>
              </div>
              <p style={{ fontSize: "0.8rem", color: "#D4D4D8", margin: 0, lineHeight: 1.45 }}>
                Google Calendar API <strong>100% GRATIS</strong> untuk kuota hingga 1 juta permintaan per hari. Sangat hemat dan tidak membutuhkan biaya berlangganan API bulanan.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
              <div style={{ background: "#0E0E0E", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "0.85rem" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#FFF", marginBottom: "0.25rem" }}>
                  Ekspor Roster {selectedPhotographerFilter ? photographers.find((p) => p.id === selectedPhotographerFilter)?.name : "Semua Fotografer"}
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.6rem" }}>
                  Unduh seluruh sesi foto di periode aktif ({activePeriodSessions.length} sesi) dalam format standar iCalendar (.ics) untuk di-import langsung ke Google Calendar atau Apple Calendar.
                </p>
                <button
                  type="button"
                  className="btn btn-gold"
                  style={{ fontSize: "0.8rem", padding: "0.5rem 0.85rem", gap: "0.4rem" }}
                  onClick={() =>
                    downloadBatchIcs(
                      activePeriodSessions,
                      photographers,
                      selectedPhotographerFilter
                        ? photographers.find((p) => p.id === selectedPhotographerFilter)?.name || "Fotografer"
                        : "Semua-Fotografer"
                    )
                  }
                  disabled={activePeriodSessions.length === 0}
                >
                  <Icons.Download size={14} />
                  <span>Ekspor Roster (.ics) ({activePeriodSessions.length} Sesi)</span>
                </button>
              </div>

              <div style={{ background: "#0E0E0E", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "0.85rem" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-gold-light)", marginBottom: "0.25rem" }}>
                  Sinkronisasi Otomatis 2-Arah (Google Service Account)
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.45 }}>
                  Untuk integrasi tanpa klik unduh (otomatis kirim ke Google Calendar setiap reservasi baru dibuat), backend memerlukan Service Account Key atau OAuth 2.0 Client ID dari Google Cloud Console.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: "0.85rem" }}
                onClick={() => setIsGcalModalOpen(false)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
