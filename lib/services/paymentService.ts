import apiClient from "../api";

export interface SnapTokenResponse {
  token: string;
  redirectUrl: string;
  orderId: string;
  grossAmount: number;
  amountType: "full" | "dp" | "settlement";
  reservationId: string;
}

export const paymentService = {
  async getSnapToken(reservationId: string, amountType: "full" | "dp" | "settlement" = "dp"): Promise<SnapTokenResponse> {
    const res = await apiClient.post<SnapTokenResponse>("/payment/snap-token", {
      reservationId,
      amountType,
    });
    return res.data;
  },

  async confirmPayment(payload: {
    reservationId: string;
    amountType: "full" | "dp" | "settlement";
    paymentResult?: any;
  }): Promise<any> {
    const res = await apiClient.post("/payment/confirm", payload);
    return res.data;
  },
};
