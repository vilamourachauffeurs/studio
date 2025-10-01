"use client";

import AdminView from "@/components/dashboard/admin-view";
import DriverView from "@/components/dashboard/driver-view";
import PartnerView from "@/components/dashboard/partner-view";
import { useUser } from "@/firebase";
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc } from '@/firebase';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = user ? doc(firestore, `users/${user.uid}`) : null;
  const { data: userProfile } = useDoc(userDocRef);


  if (!user || !userProfile) {
    return null; // Or a loading spinner
  }

  const renderDashboard = () => {
    // @ts-ignore
    switch (userProfile.role) {
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
