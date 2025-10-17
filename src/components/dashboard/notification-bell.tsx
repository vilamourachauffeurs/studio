
"use client";

import { useMemo } from "react";
import { Bell, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, orderBy, doc, updateDoc, writeBatch } from "firebase/firestore";
import type { Notification } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

function NotificationItem({ notification, onRead }: { notification: Notification, onRead: (id: string) => void }) {
  const router = useRouter();

  const handleClick = () => {
    if (notification.bookingId) {
      router.push(`/dashboard/bookings/${notification.bookingId}`);
    }
    if (!notification.read) {
        onRead(notification.id);
    }
  };
  
  return (
    <div 
      onClick={handleClick}
      className={cn(
        "flex items-start gap-4 p-3 rounded-lg cursor-pointer transition-colors",
        notification.read ? "hover:bg-muted/50" : "bg-primary/10 hover:bg-primary/20"
      )}
    >
      {!notification.read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />}
      <div className={cn("flex-1 space-y-1", notification.read && "pl-4")}>
        <p className="text-sm font-medium leading-none">
          {notification.message}
        </p>
        <p className="text-sm text-muted-foreground">
          {formatDistanceToNow(notification.sentAt.toDate(), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

export default function NotificationBell() {
  const { user } = useUser();
  const firestore = useFirestore();

  // THE FIX: Removed orderBy('sentAt') to avoid needing a composite index.
  // Sorting will be handled on the client-side.
  const notificationsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, "notifications"),
      where("recipientId", "==", user.uid)
    );
  }, [user, firestore]);

  const { data: notifications, isLoading } = useCollection<Notification>(notificationsQuery);

  // THE FIX: Sort the notifications on the client side after they are fetched.
  const sortedNotifications = useMemo(() => {
    if (!notifications) return [];
    return [...notifications].sort((a, b) => b.sentAt.toDate().getTime() - a.sentAt.toDate().getTime());
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return notifications?.filter((n) => !n.read).length || 0;
  }, [notifications]);

  const handleMarkAsRead = async (id: string) => {
    if (!user) return;
    const notifRef = doc(firestore, "notifications", id);
    try {
        await updateDoc(notifRef, { read: true });
    } catch(e) {
        console.error("Error marking notification as read:", e);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user || !notifications || unreadCount === 0) return;
    const batch = writeBatch(firestore);
    notifications.forEach(n => {
        if (!n.read) {
            const notifRef = doc(firestore, "notifications", n.id);
            batch.update(notifRef, { read: true });
        }
    });
    try {
        await batch.commit();
    } catch (e) {
        console.error("Error marking all notifications as read:", e);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-white text-xs flex items-center justify-center">
              {unreadCount}
            </div>
          )}
          <span className="sr-only">Toggle notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <Card className="border-0 shadow-none">
          <CardHeader className="border-b">
            <CardTitle>Notifications</CardTitle>
            <CardDescription>You have {unreadCount} unread messages.</CardDescription>
          </CardHeader>
          <CardContent className="p-2 max-h-96 overflow-y-auto">
            {isLoading && (
              <div className="flex justify-center items-center h-24">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {!isLoading && sortedNotifications.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">No notifications yet.</p>
            )}
            <div className="space-y-1">
              {sortedNotifications.map((n) => (
                <NotificationItem key={n.id} notification={n} onRead={handleMarkAsRead} />
              ))}
            </div>
          </CardContent>
          {unreadCount > 0 && (
            <CardFooter className="p-2 border-t">
              <Button variant="ghost" size="sm" className="w-full" onClick={handleMarkAllAsRead}>Mark all as read</Button>
            </CardFooter>
          )}
        </Card>
      </PopoverContent>
    </Popover>
  );
}
