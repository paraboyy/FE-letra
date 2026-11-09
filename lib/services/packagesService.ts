import apiClient from "../api";
import { Package } from "../types";

export const packagesService = {
  async getAll(params?: { category?: string; search?: string }): Promise<Package[]> {
    const res = await apiClient.get<Package[]>("/packages", params);
    return res.data;
  },

  async getById(id: string): Promise<Package> {
    const res = await apiClient.get<Package>(`/packages/${id}`);
    return res.data;
  },

  async create(payload: Omit<Package, "id">): Promise<Package> {
    const res = await apiClient.post<Package>("/packages", payload);
    return res.data;
  },

  async update(id: string, payload: Partial<Package>): Promise<Package> {
    const res = await apiClient.put<Package>(`/packages/${id}`, payload);
    return res.data;
  },

  async delete(id: string): Promise<boolean> {
    await apiClient.delete(`/packages/${id}`);
    return true;
  },
};
