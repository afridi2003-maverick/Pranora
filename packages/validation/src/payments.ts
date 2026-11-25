// packages/validation/src/payments.ts
// Owner: Afridi | Tasks: PAY-2, PAY-3 & PAY-4 (Payments, Invoices, Refunds & Provider Payouts)

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

export const payoutMethodEnum = z.enum([
  'bkash',
  'nagad',
  'rocket',
  'bank_transfer',
]);

export const payoutStatusEnum = z.enum([
  'pending',
  'processing',
  'completed',
  'failed',
  'rejected',
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

export const requestPayoutSchema = z.object({
  providerId: z.string().uuid({ message: 'Provider ID must be a valid UUID' }),
  amount: z.number().min(500, { message: 'Minimum withdrawal is 500 BDT' }),
  method: payoutMethodEnum,
  accountDetails: z.object({
    accountNumber: z.string().min(11, { message: 'Account number is required' }),
    accountHolderName: z.string().optional(),
    bankName: z.string().optional(),
    branchName: z.string().optional(),
    routingNumber: z.string().optional(),
  }),
  notes: z.string().max(500).optional(),
});

export const processPayoutSchema = z.object({
  payoutId: z.string().uuid({ message: 'Payout ID must be a valid UUID' }),
  action: z.enum(['completed', 'rejected', 'processing']),
  reference: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export type PaymentGateway = z.infer<typeof paymentGatewayEnum>;
export type RefundStatus = z.infer<typeof refundStatusEnum>;
export type PayoutMethod = z.infer<typeof payoutMethodEnum>;
export type PayoutStatus = z.infer<typeof payoutStatusEnum>;
export type InitPaymentSessionInput = z.infer<typeof initPaymentSessionSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
export type RequestRefundInput = z.infer<typeof requestRefundSchema>;
export type ProcessRefundInput = z.infer<typeof processRefundSchema>;
export type RequestPayoutInput = z.infer<typeof requestPayoutSchema>;
export type ProcessPayoutInput = z.infer<typeof processPayoutSchema>;
