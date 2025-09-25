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

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
};

export type Booking = {
  id: string;
  clientId: string;
  client?: Client;
  partnerId?: string;
  partner?: Partner;
  pickupLocation: string;
  dropoffLocation:string;
  pickupTime: Date;
  status: BookingStatus;
  driverId?: string;
  driver?: Driver;
  createdByRole: UserRole;
  createdById: string;
  createdAt: Date;
  notes: string;
  price: number;
  commissionPartner: number;
  commissionDriver: number;
};

export type Driver = {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatarUrl: string;
  status: "online" | "offline";
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
