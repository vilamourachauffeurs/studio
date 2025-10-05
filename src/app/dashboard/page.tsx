
"use client";

import AdminView from "@/components/dashboard/admin-view";
import DriverView from "@/components/dashboard/driver-view";
import PartnerView from "@/components/dashboard/partner-view";
import { useUser, useMemoFirebase } from "@/firebase";
import { doc } from 'firebase/firestore';
import { useFirestore, useDoc } from '@/firebase';

export default function DashboardPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}`) : null, [user, firestore]);
  const { data: userProfile } = useDoc(userDocRef);


  if (!user || !userProfile) {
    return (
       <div className="flex h-screen w-full items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const renderDashboard = () => {
    // @ts-ignore
    switch (userProfile.role) {
      case "admin":
        return <AdminView />;
      case "partner":
      case "operator":
        return <PartnerView />;
      case "driver":
        return <DriverView />;
      default:
        return <div>Invalid user role.</div>;
    }
  };

  return <div className="space-y-6">{renderDashboard()}</div>;
}
