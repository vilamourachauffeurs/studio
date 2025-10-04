

import { Timestamp } from "firebase/firestore";

export type UserRole = "admin" | "partner" | "driver";

export type BookingStatus =
  | "draft"
  | "pending_admin"
  | "approved"
  | "assigned"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentType = "credit_card" | "account" | "cash";

export type VehicleType = "Sedan" | "Minivan";

export type BookingType = "rightNow" | "inAdvance";

export type User = {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  role: UserRole;
};

export type Booking = {
  id: string;
  clientName?: string;
  createdById: string; // User ID of admin or partner
  requestedBy?: string; // Name of person requesting booking (e.g. concierge)
  partnerId?: string; // Operator
  partner?: Partner;
  pickupLocation: string;
  dropoffLocation:string;
  pickupTime: Timestamp | Date;
  pax: number; // Number of passengers
  vehicleType: VehicleType;
  status: BookingStatus;
  driverId?: string;
  driver?: Driver;
  createdAt: Timestamp | Date;
  notes: string;
  cost: number;
  paymentType: PaymentType;
  bookingType: BookingType;
};

export type Driver = {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
  status: "online" | "offline";
  birthday: Timestamp | Date;
  age: number;
  nationalId: string;
  driversLicense: string;
  currentJobId?: string;
  performance?: {
    completedJobs: number;
    onTimePercent: number;
    lastMonthEarnings: number;
  };
  documents?: {
    licenseUrl: string;
    insuranceUrl: string;
  };
};

export type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  company?: string;
  notes: string;
};

export type Partner = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  commissionRate: number;
  bookingsCount: number;
  totalCommissionPaid: number;
};

export type Notification = {
  id: string;
  type: "booking_request" | "job_assigned" | "status_update";
  bookingId: string;
  recipientRole: "admin" | "driver";
  recipientId: string;
  status: "sent" | "delivered" | "read";
  sentAt: Date;
  message: string;
};

    