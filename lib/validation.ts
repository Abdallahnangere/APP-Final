import { z } from 'zod';

/**
 * Validation Schemas for API Endpoints
 * All requests go through these schemas for validation
 */

// Agent Schemas
export const AgentRegisterSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Invalid phone number'),
  pin: z.string().regex(/^[0-9]{4}$/, 'PIN must be exactly 4 digits'),
});

export const AgentLoginSchema = z.object({
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Invalid phone number'),
  pin: z.string().regex(/^[0-9]{4}$/, 'PIN must be exactly 4 digits'),
});

// Transaction Schemas
export const TransactionVerifySchema = z.object({
  tx_ref: z.string().min(1, 'Transaction reference required'),
});

export const InitiatePaymentSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Invalid phone number'),
  name: z.string().min(2, 'Name required').max(100),
  state: z.string().min(2, 'State required').max(100),
  simId: z.string().uuid('Invalid SIM ID').optional(),
});

export const DataPurchaseSchema = z.object({
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Invalid phone number'),
  network: z.enum(['MTN', 'AIRTEL', 'GLO']),
  planId: z.number().positive('Invalid plan ID'),
  agentId: z.string().uuid('Invalid agent ID').optional(),
  agentPin: z.string().regex(/^[0-9]{4}$/, 'PIN must be exactly 4 digits').optional(),
});

export const ManualTopupSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Invalid phone number'),
  agentId: z.string().uuid('Invalid agent ID'),
  agentPin: z.string().regex(/^[0-9]{4}$/, 'PIN must be exactly 4 digits'),
});

export const AgentPurchaseSchema = z.object({
  agentId: z.string().uuid('Invalid agent ID'),
  agentPin: z.string().regex(/^[0-9]{4}$/, 'PIN must be exactly 4 digits'),
  type: z.enum(['data', 'ecommerce']),
  payload: z.object({
    planId: z.string().uuid().optional(),
    productId: z.string().uuid().optional(),
    simId: z.string().uuid().optional(),
    phone: z.string().regex(/^[0-9]{10,11}$/, 'Invalid phone number').optional(),
    name: z.string().min(2).max(100).optional(),
    state: z.string().min(2).max(100).optional(),
  }).strict(),
});

// Support Schemas
export const SupportTicketSchema = z.object({
  phone: z.string().regex(/^[0-9]{10,11}$/, 'Invalid phone number'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000),
  subject: z.string().optional(),
});

// Admin Schemas
export const AdminActionSchema = z.object({
  adminPassword: z.string().min(6, 'Invalid password'),
});

export const AdminFundAgentSchema = z.object({
  agentId: z.string().uuid('Invalid agent ID'),
  amount: z.number().positive('Amount must be positive'),
  reason: z.string().optional(),
  adminPassword: z.string().min(6, 'Invalid password'),
});

// Helper function to validate request body
export const validateRequestBody = async <T>(body: unknown, schema: z.ZodSchema<T>): Promise<{ valid: true; data: T } | { valid: false; errors: z.ZodError }> => {
  try {
    const data = await schema.parseAsync(body);
    return { valid: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, errors: error };
    }
    throw error;
  }
};
