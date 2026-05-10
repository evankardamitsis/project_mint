import { z } from "zod";

export const createOfferFormSchema = z.object({
  listing_id: z.string().uuid(),
  amount_euros: z.string().min(1, "Amount is required."),
});

export const counterOfferFormSchema = z.object({
  offer_id: z.string().uuid(),
  amount_euros: z.string().min(1, "Amount is required."),
});

export type CreateOfferFormInput = z.infer<typeof createOfferFormSchema>;
export type CounterOfferFormInput = z.infer<typeof counterOfferFormSchema>;
