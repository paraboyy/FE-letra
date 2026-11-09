import apiClient from "../api";
import { Reservation, ReservationStatus, PaymentStatus } from "../types";

export interface CreateReservationDto {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress?: string;
  packageId: string;
  photographerId: string;
  date: string;
  time: string;
  notes?: string;
}

export const reservationsService = {
  async getAll(params?: {
    status?: string;
    search?: string;
    date?: string;
    customerEmail?: string;
    customerId?: string;
  }): Promise<Reservation[]> {
    const res = await apiClient.get<Reservation[]>("/reservations", params);
    return res.data;
  },

  async getById(id: string): Promise<Reservation> {
    const res = await apiClient.get<Reservation>(`/reservations/${id}`);
    return res.data;
  },

  async create(payload: CreateReservationDto): Promise<Reservation> {
    const res = await apiClient.post<Reservation>("/reservations", payload);
    return res.data;
  },

  async updateStatus(id: string, status: ReservationStatus): Promise<Reservation> {
    const res = await apiClient.patch<Reservation>(`/reservations/${id}/status`, { status });
    return res.data;
  },

  async updatePaymentStatus(id: string, paymentStatus: PaymentStatus): Promise<Reservation> {
    const res = await apiClient.patch<Reservation>(`/reservations/${id}/payment-status`, { paymentStatus });
    return res.data;
  },

  async delete(id: string): Promise<boolean> {
    await apiClient.delete(`/reservations/${id}`);
    return true;
  },
};
