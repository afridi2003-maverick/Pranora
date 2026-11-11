export interface CreatePaymentSessionParams {
  bookingId?: string;
  orderId?: string;
  amount: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
}

export interface PaymentSessionResult {
  gatewayUrl: string;
  sessionId: string;
}

export interface PaymentProvider {
  createSession(params: CreatePaymentSessionParams): Promise<PaymentSessionResult>;
  validateIpn(payload: Record<string, unknown>): Promise<boolean>;
  refund(paymentId: string, amount: number, reason: string): Promise<boolean>;
}

