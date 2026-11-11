import { z } from 'zod';

export const paymentMethodEnum = z.enum([
  'cash',
  'bkash',
  'nagad',
  'rocket',
  'card',
]);

export const paymentStatusEnum = z.enum([
  'pending',
  'completed',
  'failed',
  'refunded',
]);

export const initPaymentSessionSchema = z.object({
  booking_id: z.string().uuid().optional(),
  order_id: z.string().uuid().optional(),
  amount: z.number().positive(),
  payment_method: paymentMethodEnum,
  customer_name: z.string().min(2),
  customer_phone: z.string(),
  customer_email: z.string().email().optional(),
});

