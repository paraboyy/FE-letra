// ============================================================
// LETRA STUDIO — TypeScript Definitions & API Types
// ============================================================

export type ReservationStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "dp_paid" | "paid" | "refunded";
export type CustomerStatus = "active" | "inactive";
export type TransactionStatus = "pending" | "success" | "refunded";
export type PackageCategory = "portrait" | "family" | "prewedding" | "graduation" | "business" | "premium";

export interface Package {
  id: string;
  name: string;
  category: PackageCategory;
  price: number;
  duration: string;
  photos: number;
  editedPhotos: number;
  description: string;
  features: string[];
  popular: boolean;
  color?: string;
  icon: string;
}

export interface PhotographerPortfolioItem {
  id: number;
  title: string;
  category: string;
  image: string;
  specs?: string;
  description?: string;
}

export interface Photographer {
  id: string;
  name: string;
  photo: string;
  roleTitle?: string;
  bio?: string;
  gear?: string[];
  portfolio?: PhotographerPortfolioItem[];
  specialty: string[];
  experience: string;
  rating: number;
  totalSessions: number;
  status: "active" | "inactive";
  phone: string;
  email: string;
  schedule: string[];
}

export interface Reservation {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  packageId: string;
  packageName: string;
  photographerId: string;
  photographerName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: string;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  notes?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  totalReservations: number;
  totalSpending: number;
  lastVisit: string;
  joinDate: string;
  status: CustomerStatus;
}

export interface Transaction {
  id: string;
  reservationId: string;
  customerName: string;
  packageName: string;
  amount: number;
  paymentMethod: "Transfer Bank" | "QRIS" | "Cash" | string;
  status: TransactionStatus;
  date: string;
  proofUrl: string | null;
}

export interface DashboardStats {
  totalReservations: number;
  reservationsThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  pendingReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  revenueGrowth: number;
  reservationGrowth: number;
  customerGrowth: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  text: string;
  rating: number;
  package: string;
}

export interface ServiceItem {
  icon: string;
  title: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "staff" | "customer";
  phone?: string;
  token?: string;
}

// Standard API Response Wrappers
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}
