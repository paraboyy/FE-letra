import apiClient from "../api";
import { Testimonial, ServiceItem } from "../types";

export interface StudioInfo {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  instagram: string;
  workingHours: string;
}

export interface PortfolioItem {
  id: number;
  src: string;
  category: string;
  title: string;
  specs: string;
  client: string;
}

export const studioService = {
  async getInfo(): Promise<StudioInfo> {
    const res = await apiClient.get<StudioInfo>("/studio/info");
    return res.data;
  },

  async getServices(): Promise<ServiceItem[]> {
    const res = await apiClient.get<ServiceItem[]>("/studio/services");
    return res.data;
  },

  async getTestimonials(): Promise<Testimonial[]> {
    const res = await apiClient.get<Testimonial[]>("/studio/testimonials");
    return res.data;
  },

  async getPortfolio(): Promise<PortfolioItem[]> {
    const res = await apiClient.get<PortfolioItem[]>("/studio/portfolio");
    return res.data;
  },
};
