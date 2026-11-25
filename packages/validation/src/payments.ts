// packages/validation/src/payments.ts
// Owner: Afridi | Task: PAY-2 & PAY-3 (Payments, Invoices & Refunds)

import { z } from 'zod';
import { paymentMethodSchema } from './booking';

export const paymentGatewayEnum = z.enum([
  'sslcommerz',
  'bkash',
  'cash',
]);

export const refundStatusEnum = z.enum([
  'none',
  'requested',
  'approved',
  'rejected',
  'processed',
]);

export const initPaymentSessionSchema = z.object({
  bookingId: z.string().uuid({ message: 'Booking ID must be a valid UUID' }).optional(),
  orderId: z.string().uuid({ message: 'Order ID must be a valid UUID' }).optional(),
  amount: z.number().positive({ message: 'Amount must be greater than zero' }),
  method: paymentMethodSchema,
  customerName: z.string().min(2, { message: 'Customer name is required' }),
  customerPhone: z.string().min(11, { message: 'Valid phone number is required' }),
  customerEmail: z.string().email().optional(),
  gateway: paymentGatewayEnum.default('sslcommerz'),
});

export const verifyPaymentSchema = z.object({
  gatewayTranId: z.string().min(1, { message: 'Transaction ID is required' }),
  valId: z.string().optional(),
  status: z.enum(['VALID', 'FAILED', 'CANCELLED']).default('VALID'),
  bankTranId: z.string().optional(),
  cardType: z.string().optional(),
  cardBrand: z.string().optional(),
});

export const requestRefundSchema = z.object({
  paymentId: z.string().uuid({ message: 'Payment ID must be a valid UUID' }),
  reason: z.string().min(5, { message: 'Reason must be at least 5 characters' }).max(500),
  amount: z.number().positive().optional(),
});

export const processRefundSchema = z.object({
  paymentId: z.string().uuid({ message: 'Payment ID must be a valid UUID' }),
  action: z.enum(['approved', 'rejected', 'processed']),
  adminNote: z.string().max(500).optional(),
});

export type PaymentGateway = z.infer<typeof paymentGatewayEnum>;
export type RefundStatus = z.infer<typeof refundStatusEnum>;
export type InitPaymentSessionInput = z.infer<typeof initPaymentSessionSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type RequestRefundInput = z.infer<typeof requestRefundSchema>;
export type ProcessRefundInput = z.infer<typeof processRefundSchema>;
