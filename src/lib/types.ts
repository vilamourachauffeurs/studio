

import { Timestamp } from "firebase/firestore";

export type UserRole = "admin" | "partner" | "driver" | "operator";

export type BookingStatus =
  | "draft"
  | "pending_admin"
  | "approved"
  | "assigned"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentType = "driver" | "mb" | "account";

export type VehicleType = "Sedan" | "Minivan";

export type BookingType = "rightNow" | "inAdvance";

export type User = {
  id: string;
  name: string;
  email: string;
  photoURL: string;
  role: UserRole;
  relatedId?: string; // Only used for operators and partners (multiple users per company). Drivers: user.uid = driver.id
  phone: string;
};

export type Booking = {
  id: string;
  clientName?: string;
  createdById: string; // User ID of admin or partner
  requestedBy?: string; // Name of person requesting booking (e.g. concierge)
  partnerId?: string; 
  operatorId?: string;
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
  id: string; // NEW ARCHITECTURE: Driver.id = User.id (same ID for both documents)
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
  status: "online" | "offline";
  birthday: Timestamp | Date | null;
  age: number;
  nationalId?: string;
  driversLicense?: string;
  commissionRate?: number;
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
};

export type Operator = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  commissionRate: number;
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

    