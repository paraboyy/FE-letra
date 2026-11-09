import apiClient from "../api";
import { Photographer } from "../types";

export const photographersService = {
  async getAll(params?: { specialty?: string; status?: string; search?: string }): Promise<Photographer[]> {
    const res = await apiClient.get<Photographer[]>("/photographers", params);
    return res.data;
  },

  async getById(id: string): Promise<Photographer> {
    const res = await apiClient.get<Photographer>(`/photographers/${id}`);
    return res.data;
  },

  async create(payload: Partial<Photographer>): Promise<Photographer> {
    const res = await apiClient.post<Photographer>("/photographers", payload);
    return res.data;
  },

  async update(id: string, payload: Partial<Photographer>): Promise<Photographer> {
    const res = await apiClient.put<Photographer>(`/photographers/${id}`, payload);
    return res.data;
  },

  async delete(id: string): Promise<Photographer> {
    const res = await apiClient.delete<Photographer>(`/photographers/${id}`);
    return res.data;
  },
};
