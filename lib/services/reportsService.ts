import apiClient from "../api";
import { DashboardStats, MonthlyRevenue, Transaction } from "../types";

export interface PackagePerformance {
  packageId: string;
  packageName: string;
  category: string;
  price: number;
  totalBookings: number;
  totalRevenue: number;
  percentage: number;
}

export interface ReportFilterParams {
  year?: number | string;
  month?: number | string;
}

export interface FinancialReportData {
  period: {
    year: string;
    month: string;
    label: string;
  };
  stats: DashboardStats & {
    totalTransactions: number;
    successTransactions: number;
    pendingTransactions: number;
    averageTransaction: number;
    periodLabel?: string;
  };
  monthlyRevenue: (MonthlyRevenue & { bookings?: number })[];
  packagePerformance: PackagePerformance[];
  transactions: Transaction[];
  availableYears: number[];
}

export const reportsService = {
  async getDashboardStats(params?: ReportFilterParams): Promise<DashboardStats> {
    const res = await apiClient.get<DashboardStats>("/reports/dashboard", params as Record<string, string | number>);
    return res.data;
  },

  async getMonthlyRevenue(
    year: number | string = new Date().getFullYear(),
    month?: number | string
  ): Promise<MonthlyRevenue[]> {
    const queryParams: Record<string, string | number> = { year };
    if (month !== undefined) queryParams.month = month;
    const res = await apiClient.get<MonthlyRevenue[]>("/reports/revenue", queryParams);
    return res.data;
  },

  async getPackagePerformance(params?: ReportFilterParams): Promise<PackagePerformance[]> {
    const res = await apiClient.get<PackagePerformance[]>("/reports/packages", params as Record<string, string | number>);
    return res.data;
  },

  async getFinancialReport(params?: ReportFilterParams): Promise<FinancialReportData> {
    const res = await apiClient.get<FinancialReportData>("/reports/financial", params as Record<string, string | number>);
    return res.data;
  },
};

