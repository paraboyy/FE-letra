import apiClient from "../api";
import { Transaction } from "../types";

export const transactionsService = {
  async getAll(params?: { status?: string; search?: string }): Promise<Transaction[]> {
    const res = await apiClient.get<Transaction[]>("/transactions", params);
    return res.data;
  },

  async getById(id: string): Promise<Transaction> {
    const res = await apiClient.get<Transaction>(`/transactions/${id}`);
    return res.data;
  },

  async verify(id: string): Promise<Transaction> {
    const res = await apiClient.patch<Transaction>(`/transactions/${id}/verify`);
    return res.data;
  },

  async create(payload: {
    reservationId: string;
    customerName: string;
    packageName: string;
    amount: number;
    paymentMethod: string;
  }): Promise<Transaction> {
    const res = await apiClient.post<Transaction>("/transactions", payload);
    return res.data;
  },
};
