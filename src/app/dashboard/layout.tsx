
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import DashboardSidebar from "@/components/dashboard/sidebar";
import DashboardHeader from "@/components/dashboard/header";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => user ? doc(firestore, `users/${user.uid}`) : null, [user, firestore]);
  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  useEffect(() => {
    if (!isUserLoading && user === null) {
      router.push("/");
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || isProfileLoading || !user) {
    return (
      <div className="flex h-screen w-full">
        {/* Sidebar Skeleton */}
        <div className="hidden md:flex flex-col gap-2 border-r bg-card w-64">
           <div className="flex h-16 items-center border-b px-6">
            <Skeleton className="h-8 w-32" />
           </div>
           <div className="flex-1 overflow-auto py-2 px-2 space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
           </div>
        </div>
        <div className="flex flex-1 flex-col">
            {/* Header Skeleton */}
            <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-4 sm:px-6">
                <Skeleton className="h-8 w-36" />
                <Skeleton className="ml-auto h-8 w-8 rounded-full" />
            </header>
            {/* Content Skeleton */}
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
                <div className="space-y-4">
                    <Skeleton className="h-10 w-1/3" />
                     <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Skeleton className="h-28" />
                        <Skeleton className="h-28" />
                        <Skeleton className="h-28" />
                        <Skeleton className="h-28" />
                    </div>
                    <Skeleton className="h-96" />
                </div>
            </main>
        </div>
      </div>
    );
  }

  // @ts-ignore
  if (user && !userProfile && !isProfileLoading) {
    // This can happen briefly if the user document hasn't been created yet.
    // The login/signup page handles creation, so we can just show a loading state.
    return (
       <div className="flex h-screen w-full items-center justify-center">
        <p>Initializing user profile...</p>
      </div>
    )
  }


  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      <DashboardSidebar />
      <div className="flex flex-1 flex-col">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
