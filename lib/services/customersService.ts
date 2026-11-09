import apiClient from "../api";
import { Customer } from "../types";

export const customersService = {
  async getAll(params?: { search?: string; status?: string }): Promise<Customer[]> {
    const res = await apiClient.get<Customer[]>("/customers", params);
    return res.data;
  },

  async getById(id: string): Promise<Customer> {
    const res = await apiClient.get<Customer>(`/customers/${id}`);
    return res.data;
  },

  async update(id: string, payload: Partial<Customer>): Promise<Customer> {
    const res = await apiClient.put<Customer>(`/customers/${id}`, payload);
    return res.data;
  },
};
