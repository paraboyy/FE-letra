import {
  PHOTO_PACKAGES,
  PHOTOGRAPHERS,
  RESERVATIONS,
  CUSTOMERS,
  TRANSACTIONS,
  DASHBOARD_STATS,
  MONTHLY_REVENUE,
  TESTIMONIALS,
  SERVICES,
  STUDIO_INFO,
} from "./data";
import { Package, Photographer, Reservation, Customer, Transaction } from "./types";

// In-memory store for Next.js API Routes (simulating Backend DB)
class MockStore {
  packages: Package[] = [...(PHOTO_PACKAGES as unknown as Package[])];
  photographers: Photographer[] = [...(PHOTOGRAPHERS as unknown as Photographer[])];
  reservations: Reservation[] = [...(RESERVATIONS as unknown as Reservation[])];
  customers: Customer[] = [...(CUSTOMERS as unknown as Customer[])];
  transactions: Transaction[] = [...(TRANSACTIONS as unknown as Transaction[])];
  dashboardStats = { ...DASHBOARD_STATS };
  monthlyRevenue = [...MONTHLY_REVENUE];
  testimonials = [...TESTIMONIALS];
  services = [...SERVICES];
  studioInfo = { ...STUDIO_INFO };
}

// Global singleton to preserve state in hot-reloading dev environment
const globalForStore = globalThis as unknown as { mockStore?: MockStore };

export const mockStore = globalForStore.mockStore ?? new MockStore();
if (process.env.NODE_ENV !== "production") globalForStore.mockStore = mockStore;

export function jsonResponse<T>(data: T, message = "Success", status = 200, meta?: { page?: number; limit?: number; total?: number }) {
  return Response.json(
    {
      success: status >= 200 && status < 300,
      message,
      data,
      meta,
    },
    { status }
  );
}

export function errorResponse(message: string, status = 400, errors?: Record<string, string[]>) {
  return Response.json(
    {
      success: false,
      message,
      errors,
    },
    { status }
  );
}
