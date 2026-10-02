import { z } from "zod";

const optionalText = (max: number, label: string) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be at most ${max} characters`)
    .optional()
    .transform((v) => (v ? v : undefined));

// Mirrors CreateViewingRequestZodSchema: future date, optional HH:mm, message <= 1000.
export const viewingRequestSchema = z
  .object({
    requestedDate: z.string().min(1, "Choose a viewing date"),
    requestedTime: z
      .string()
      .optional()
      .refine((v) => !v || /^([01]\d|2[0-3]):[0-5]\d$/.test(v), "Use a 24-hour time like 14:30"),
    message: optionalText(1000, "Message"),
  })
  .refine(
    (data) => {
      const when = new Date(`${data.requestedDate}T${data.requestedTime || "23:59"}:00`);
      return when.getTime() > Date.now();
    },
    { message: "The viewing must be scheduled in the future", path: ["requestedDate"] },
  );
export type ViewingRequestInput = z.input<typeof viewingRequestSchema>;

// Mirrors CreateApplicationZodSchema.
export const applicationSchema = z.object({
  viewingRequestId: z.string().optional(),
  message: optionalText(2000, "Message"),
});
export type ApplicationInput = z.input<typeof applicationSchema>;

export const maintenanceSchema = z.object({
  roomId: z.string().uuid("Choose the room with the issue"),
  title: z.string().trim().min(1, "Title is required").max(160, "Title must be at most 160 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Please describe the issue in at least 10 characters")
    .max(5000, "Description must be at most 5000 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});
export type MaintenanceInput = z.input<typeof maintenanceSchema>;
