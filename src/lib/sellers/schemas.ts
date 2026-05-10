import { z } from "zod";

export const sellerProfileFormSchema = z.object({
  display_name: z
    .string()
    .trim()
    .min(2, "Display name must be at least 2 characters.")
    .max(120, "Display name is too long."),
  bio: z
    .string()
    .trim()
    .max(2000, "Bio is too long.")
    .optional()
    .default(""),
  location: z
    .string()
    .trim()
    .max(200, "Location is too long.")
    .optional()
    .default(""),
  phone: z
    .string()
    .trim()
    .max(40, "Phone is too long.")
    .optional()
    .default(""),
});

export type SellerProfileFormFields = z.infer<typeof sellerProfileFormSchema>;
