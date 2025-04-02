import { z } from "zod";

export const emailRecipientSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z.string().max(100, "Name must not exceed 100 characters"),
  active: z.boolean().default(true),
});

export type EmailRecipientForm = z.infer<typeof emailRecipientSchema>;
