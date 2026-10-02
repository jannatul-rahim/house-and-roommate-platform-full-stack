import { z } from "zod";
import { PROPERTY_STATUSES, PROPERTY_TYPES, ROOM_STATUSES, ROOM_TYPES, UNIT_STATUSES } from "@/types/api";

const money = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .regex(/^\d+(\.\d{1,2})?$/, `${label} must be a number with up to 2 decimals`);

const optionalText = (max: number) => z.string().trim().max(max, `At most ${max} characters`).optional();

// Mirrors CreatePropertyZodSchema.
export const propertyBaseSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(255, "At most 255 characters"),
  description: optionalText(2000),
  propertyType: z.enum(PROPERTY_TYPES, { error: "Choose a property type" }),
  address: z.string().trim().min(1, "Address is required").max(500, "At most 500 characters"),
  city: z.string().trim().min(1, "City is required").max(120, "At most 120 characters"),
  state: optionalText(120),
  country: z.string().trim().min(1, "Country is required").max(120, "At most 120 characters"),
  zipCode: optionalText(30),
  status: z.enum(PROPERTY_STATUSES),
});
export type PropertyFormInput = z.infer<typeof propertyBaseSchema>;

export const buildingSchema = z.object({
  name: z.string().trim().min(1, "Building name is required").max(255, "At most 255 characters"),
  description: optionalText(1000),
});
export type BuildingInput = z.infer<typeof buildingSchema>;

const count = (label: string) => z.coerce.number<string | number>({ error: `${label} must be a number` }).int(`${label} must be a whole number`).min(0, `${label} can't be negative`);

export const unitSchema = z.object({
  unitNumber: z.string().trim().min(1, "Unit number is required").max(50, "At most 50 characters"),
  floor: z.coerce.number<string | number>().int("Floor must be a whole number").optional(),
  bedrooms: count("Bedrooms"),
  bathrooms: count("Bathrooms"),
  status: z.enum(UNIT_STATUSES),
});
export type UnitInput = z.input<typeof unitSchema>;

export const roomSchema = z.object({
  roomNumber: z.string().trim().min(1, "Room number is required").max(50, "At most 50 characters"),
  name: optionalText(120),
  roomType: z.enum(ROOM_TYPES, { error: "Choose a room type" }),
  monthlyRent: money("Monthly rent"),
  securityDeposit: money("Security deposit"),
  status: z.enum(ROOM_STATUSES),
});
export type RoomInput = z.infer<typeof roomSchema>;

export const availabilitySchema = z
  .object({
    availableFrom: z.string().min(1, "Start date is required"),
    availableTo: z.string().min(1, "End date is required"),
  })
  .refine((d) => !d.availableFrom || !d.availableTo || d.availableFrom < d.availableTo, {
    message: "End date must be after the start date",
    path: ["availableTo"],
  });
export type AvailabilityInput = z.infer<typeof availabilitySchema>;

/** Everything the "Add property" wizard collects, validated step by step. */
export const propertyWizardSchema = z.object({
  property: propertyBaseSchema,
  building: buildingSchema,
  unit: unitSchema,
  room: roomSchema,
  availability: availabilitySchema,
});
export type PropertyWizardInput = z.input<typeof propertyWizardSchema>;
export type PropertyWizardOutput = z.output<typeof propertyWizardSchema>;
