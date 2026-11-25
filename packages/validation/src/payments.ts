// packages/validation/src/payments.ts
// Owner: Afridi | Task: PAY-2 (Online payments: SSLCommerz with bKash, Nagad, Rocket, Cards)

import { z } from 'zod';
import { paymentMethodSchema } from './booking';

export const paymentGatewayEnum = z.enum([
  'sslcommerz',
  'bkash',
  'cash',
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

export type PaymentGateway = z.infer<typeof paymentGatewayEnum>;
export type InitPaymentSessionInput = z.infer<typeof initPaymentSessionSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;
