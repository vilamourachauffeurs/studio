"use client";

import AdminView from "@/components/dashboard/admin-view";
import DriverView from "@/components/dashboard/driver-view";
import PartnerView from "@/components/dashboard/partner-view";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null; // Or a loading spinner
  }

  const renderDashboard = () => {
    switch (user.role) {
      case "admin":
        return <AdminView />;
      case "partner":
        return <PartnerView />;
      case "driver":
        return <DriverView />;
      default:
        return <div>Invalid user role.</div>;
    }
  };

  return <div className="space-y-6">{renderDashboard()}</div>;
}
