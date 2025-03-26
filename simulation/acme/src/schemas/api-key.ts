import { z } from 'zod';

export const apiKeySchema = z.object({
  key: z.string().min(32),
  name: z.string().min(1),
  createdAt: z.date(),
  lastUsed: z.date().optional(),
  isActive: z.boolean().default(true),
  webhookUrl: z.string().url().optional(),
  //webhookSecret: z.string().min(1).optional()
});

export const apiKeyResponseSchema = apiKeySchema.omit({ key: true });

export type APIKey = z.infer<typeof apiKeySchema>;
export type APIKeyResponse = z.infer<typeof apiKeyResponseSchema>;
