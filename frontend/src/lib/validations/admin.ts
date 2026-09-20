import { z } from "zod";

export const amenitySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must be at most 100 characters"),
  description: z.string().trim().max(255, "Description must be at most 255 characters").optional().or(z.literal("")),
  category: z.enum(["Heating & Comfort", "Wellness & Leisure", "Atmosphere & Views", "Dining & Outdoor", "Coastal Stays", "Other"], {
    message: "Please select a valid category",
  }),
  is_active: z.boolean().optional(),
});

export const ruleSchema = z.object({
  name: z.string().trim().min(2, "Rule name must be at least 2 characters").max(100, "Rule name must be at most 100 characters"),
  description: z.string().trim().max(255, "Description must be at most 255 characters").optional().or(z.literal("")),
  category: z.enum(["Nighttime Serenity", "Animal & Pet stays", "Clean Air & Safety", "Noise & Community", "Fire Safety & Capacity", "Media Licensing", "Others"], {
    message: "Please select a valid category",
  }),
  is_active: z.boolean().optional(),
});

export const commissionSchema = z.object({
  commission_percentage: z
    .number({ message: "Commission must be a number" })
    .min(0, "Commission cannot be negative")
    .max(100, "Commission cannot exceed 100%")
    .refine((v) => Number(v.toFixed(2)) === v, "Max 2 decimal places"),
  justification: z.string().trim().min(10, "Please provide at least 10 characters justification").max(500, "Justification too long"),
});

export const rejectPropertySchema = z.object({
  rejection_reason: z.string().trim().min(10, "Please provide at least 10 characters").max(500, "Reason too long (max 500)"),
});

export type AmenityFormData = z.infer<typeof amenitySchema>;
export type RuleFormData = z.infer<typeof ruleSchema>;
export type CommissionFormData = z.infer<typeof commissionSchema>;
