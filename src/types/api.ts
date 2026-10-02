// Types mirror the DTOs returned by the NestMate (PH-6 Housing & Roommate) API.
// Dates arrive as ISO strings over JSON.

export type Role = "ADMIN" | "OWNER" | "TENANT";

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  meta?: ApiMeta;
  data: T;
}

export interface Paginated<T> {
  data: T[];
  meta: ApiMeta;
}

export interface ApiErrorSource {
  path: string;
  message: string;
}

export interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string;
  errors?: ApiErrorSource[];
}

// ---------- Enums ----------

export const PROPERTY_TYPES = ["APARTMENT", "HOUSE", "BUILDING", "CONDO", "VILLA", "OTHER"] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const PROPERTY_STATUSES = ["DRAFT", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"] as const;
export type PropertyStatus = (typeof PROPERTY_STATUSES)[number];

export const UNIT_STATUSES = [
  "AVAILABLE",
  "PARTIALLY_OCCUPIED",
  "FULLY_OCCUPIED",
  "MAINTENANCE",
  "UNAVAILABLE",
] as const;
export type UnitStatus = (typeof UNIT_STATUSES)[number];

export const ROOM_TYPES = ["PRIVATE", "SHARED", "MASTER", "STUDIO"] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

export const ROOM_STATUSES = ["AVAILABLE", "RESERVED", "OCCUPIED", "MAINTENANCE", "UNAVAILABLE"] as const;
export type RoomStatus = (typeof ROOM_STATUSES)[number];

export const AVAILABILITY_STATUSES = ["AVAILABLE", "UNAVAILABLE", "RESERVED", "OCCUPIED"] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export const VIEWING_STATUSES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "COMPLETED"] as const;
export type ViewingRequestStatus = (typeof VIEWING_STATUSES)[number];

export const APPLICATION_STATUSES = ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "WITHDRAWN"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const LEASE_STATUSES = ["PENDING", "ACTIVE", "EXPIRED", "TERMINATED"] as const;
export type LeaseStatus = (typeof LEASE_STATUSES)[number];

export const PAYMENT_STATUSES = ["PENDING", "PROCESSING", "PAID", "LATE", "FAILED", "REFUNDED", "CANCELLED"] as const;
export type RentPaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const UTILITY_TYPES = ["ELECTRICITY", "GAS", "WATER", "INTERNET", "OTHER"] as const;
export type UtilityType = (typeof UTILITY_TYPES)[number];

export const UTILITY_BILL_STATUSES = ["PENDING", "PARTIALLY_PAID", "PAID", "OVERDUE"] as const;
export type UtilityBillStatus = (typeof UTILITY_BILL_STATUSES)[number];

export type UtilitySplitStatus = "PENDING" | "PAID" | "OVERDUE";

export const MAINTENANCE_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;
export type MaintenancePriority = (typeof MAINTENANCE_PRIORITIES)[number];

export const MAINTENANCE_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
export type MaintenanceStatus = (typeof MAINTENANCE_STATUSES)[number];

// ---------- Users ----------

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
  createdAt: string;
  roles: Role[];
}

export interface AuthResult {
  user: AuthUser;
  accessToken: string;
}

export interface UserSummary {
  id: string;
  name: string;
  image: string | null;
}

// ---------- Properties ----------

export interface AvailabilityWindow {
  id: string;
  availableFrom: string;
  availableTo: string | null;
}

export interface PublicRoom {
  id: string;
  roomNumber: string;
  name: string | null;
  roomType: RoomType;
  monthlyRent: number | null;
  securityDeposit: number | null;
  buildingName: string;
  unitNumber: string;
  floor: number | null;
  bedrooms: number;
  bathrooms: number;
  availability: AvailabilityWindow[];
}

export interface PublicProperty {
  id: string;
  title: string;
  description: string | null;
  propertyType: PropertyType;
  address: string;
  city: string;
  state: string | null;
  country: string;
  zipCode: string | null;
  latitude: number | null;
  longitude: number | null;
  status: PropertyStatus;
  minMonthlyRent: number | null;
  maxMonthlyRent: number | null;
  availableRoomCount: number;
  /** Only present on the detail endpoint. */
  rooms?: PublicRoom[];
  createdAt: string;
  updatedAt: string;
}

/** Owner-facing property record (`/properties/my-properties`, create, update). */
export interface Property {
  id: string;
  ownerId: string;
  managerId: string | null;
  title: string;
  description: string | null;
  propertyType: PropertyType;
  address: string;
  city: string;
  state: string | null;
  country: string;
  zipCode: string | null;
  latitude: string | null;
  longitude: string | null;
  status: PropertyStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Building {
  id: string;
  propertyId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Unit {
  id: string;
  buildingId: string;
  unitNumber: string;
  floor: number | null;
  bedrooms: number;
  bathrooms: number;
  status: UnitStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  unitId: string;
  roomNumber: string;
  name: string | null;
  roomType: RoomType;
  /** Prisma Decimal - serialized as a string. */
  monthlyRent: string;
  securityDeposit: string;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
}

export interface RoomAvailability {
  id: string;
  roomId: string;
  availableFrom: string;
  availableTo: string | null;
  status: AvailabilityStatus;
  createdAt: string;
  updatedAt: string;
}

// ---------- Shared nested shapes ----------

export interface PropertySummary {
  id: string;
  title: string;
  propertyType: PropertyType;
  address?: string;
  city: string;
  state?: string | null;
  country: string;
  ownerId?: string;
  managerId?: string | null;
}

export interface RoomSummary {
  id: string;
  roomNumber: string;
  name: string | null;
  roomType?: RoomType;
  monthlyRent?: number | null;
  unit: {
    id: string;
    unitNumber: string;
    building: { id: string; name: string; property?: PropertySummary };
  };
}

// ---------- Rental workflow ----------

export interface ViewingRequest {
  id: string;
  userId: string;
  propertyId: string;
  roomId: string | null;
  requestedDate: string;
  requestedTime: string | null;
  message: string | null;
  status: ViewingRequestStatus;
  createdAt: string;
  updatedAt: string;
  tenant: UserSummary;
  property: PropertySummary;
  room: RoomSummary | null;
}

export interface Application {
  id: string;
  userId: string;
  roomId: string;
  viewingRequestId: string | null;
  message: string | null;
  status: ApplicationStatus;
  submittedAt: string;
  updatedAt: string;
  tenant: UserSummary;
  property: PropertySummary;
  room: RoomSummary;
  viewingRequest: {
    id: string;
    status: ViewingRequestStatus;
    requestedDate: string;
    requestedTime: string | null;
  } | null;
}

export interface Lease {
  id: string;
  applicationId: string;
  tenantId: string;
  roomId: string;
  startDate: string;
  endDate: string | null;
  monthlyRent: number;
  securityDeposit: number;
  status: LeaseStatus;
  createdAt: string;
  updatedAt: string;
  tenant: UserSummary;
  room: RoomSummary;
}

export interface Payment {
  id: string;
  leaseId: string;
  tenantId: string;
  amount: number;
  currency: string;
  dueDate: string;
  paidAt: string | null;
  status: RentPaymentStatus;
  paymentMethod: string | null;
  provider: string | null;
  providerPaymentId: string | null;
  providerSessionId: string | null;
  providerStatus: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  tenant: UserSummary;
  lease: { id: string; room: RoomSummary };
}

export interface CreatePaymentResult {
  payment: Payment;
  checkoutUrl: string | null;
}

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  propertyId: string;
  roomId: string | null;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
  tenant: UserSummary;
  property: PropertySummary;
  room: RoomSummary | null;
}

export interface UtilityBillSplit {
  id: string;
  billId: string;
  tenantId: string;
  amount: number;
  status: UtilitySplitStatus;
  paidAt: string | null;
  createdAt: string;
  tenant?: UserSummary;
}

export interface UtilityBill {
  id: string;
  propertyId: string;
  unitId: string | null;
  type: UtilityType;
  totalAmount: number;
  currency: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  dueDate: string;
  status: UtilityBillStatus;
  createdAt: string;
  updatedAt: string;
  property: PropertySummary;
  unit: { id: string; unitNumber: string; building: { id: string; name: string } } | null;
  splits?: UtilityBillSplit[];
}

// ---------- Roommates ----------

export interface ProfilePreference {
  preferenceId: string;
  name: string;
  type: string | null;
  value: string | null;
}

export interface RoommateProfile {
  id: string;
  bio: string | null;
  occupation: string | null;
  budgetMin: number | null;
  budgetMax: number | null;
  preferredLocation: string | null;
  moveInDate: string | null;
  smoking: boolean;
  pets: boolean;
  genderPreference: string | null;
  isDiscoverable: boolean;
  createdAt: string;
  updatedAt: string;
  user: UserSummary;
  preferences: ProfilePreference[];
}

export interface RoommateMatch {
  profile: RoommateProfile;
  compatibilityScore: number;
  breakdown: {
    budget: number;
    location: number;
    moveIn: number;
    lifestyle: number;
    preferences: number;
  };
}

export interface PreferenceOption {
  id: string;
  name: string;
  type: string | null;
  createdAt: string;
}

export interface MyPreference {
  preferenceId: string;
  value: string | null;
  createdAt: string;
  preference: { id: string; name: string; type: string | null };
}

// ---------- Audit ----------

export interface AuditLog {
  id: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: unknown;
  newValue: unknown;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  actor: { id: string; name: string; email: string } | null;
}
