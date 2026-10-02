import { z } from "zod";

const money = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d+(\.\d{1,2})?$/.test(v), "Enter an amount like 12000");

// Mirrors RoommateProfileZodSchema (all optional server-side; we require the
// essentials so matching has something to score).
export const roommateProfileSchema = z
  .object({
    occupation: z.string().trim().min(1, "Tell others what you do").max(120, "At most 120 characters"),
    bio: z.string().trim().min(20, "Write at least 20 characters about yourself").max(2000, "At most 2000 characters"),
    budgetMin: money,
    budgetMax: money,
    preferredLocation: z.string().trim().min(1, "Where would you like to live?").max(255, "At most 255 characters"),
    moveInDate: z.string().optional(),
    smoking: z.boolean(),
    pets: z.boolean(),
    genderPreference: z.string().trim().max(80, "At most 80 characters").optional(),
    isDiscoverable: z.boolean(),
    preferenceIds: z.array(z.string()).max(50),
  })
  .refine((d) => !d.budgetMin || !d.budgetMax || Number(d.budgetMin) <= Number(d.budgetMax), {
    message: "Minimum budget must not exceed maximum budget",
    path: ["budgetMax"],
  });

export type RoommateProfileInput = z.infer<typeof roommateProfileSchema>;

export const ROOMMATE_STEPS = [
  { id: "about", title: "About you", fields: ["occupation", "bio"] },
  { id: "budget", title: "Budget & location", fields: ["budgetMin", "budgetMax", "preferredLocation", "moveInDate"] },
  { id: "lifestyle", title: "Lifestyle", fields: ["smoking", "pets", "genderPreference", "isDiscoverable"] },
  { id: "preferences", title: "Preferences", fields: ["preferenceIds"] },
  { id: "review", title: "Review", fields: [] },
] as const satisfies readonly { id: string; title: string; fields: readonly (keyof RoommateProfileInput)[] }[];
