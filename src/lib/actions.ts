
"use server";

import {
  summarizeClientNotes,
  type SummarizeClientNotesInput,
} from "@/ai/flows/summarize-client-notes";
import {
  suggestDriverForBooking,
  type SuggestDriverForBookingInput,
} from "@/ai/flows/suggest-driver-for-booking";
import { BookingStatus, Booking } from "./types";
import { doc, updateDoc, runTransaction, serverTimestamp, collection } from "firebase/firestore";
import { firestore } from "@/firebase/server";
import { format } from "date-fns";


export async function getDriverSuggestion(
  input: SuggestDriverForBookingInput
) {
  try {
    const result = await suggestDriverForBooking(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to get driver suggestion." };
  }
}

export async function getNotesSummary(input: SummarizeClientNotesInput) {
  try {
    const result = await summarizeClientNotes(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to summarize notes." };
  }
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
    try {
        const bookingRef = doc(firestore, "bookings", bookingId);
        await updateDoc(bookingRef, { status });
        return { success: true };
    } catch (error) {
        console.error("Error updating booking status:", error);
        return { success: false, error: "Failed to update booking status." };
    }
}

export async function createBookingWithSequentialId(bookingData: Omit<Booking, 'id' | 'bookingId' | 'createdAt'>) {
    try {
        const newBookingId = await runTransaction(firestore, async (transaction) => {
            const today = format(new Date(), 'yyMMdd');
            const counterRef = doc(firestore, 'counters', today);
            const counterDoc = await transaction.get(counterRef);

            let newNumber = 1;
            if (counterDoc.exists()) {
                newNumber = counterDoc.data().lastNumber + 1;
            }

            const bookingId = `${today}${(newNumber).toString().padStart(3, '0')}`;
            
            transaction.set(counterRef, { lastNumber: newNumber });

            // Generate the document reference on the server side
            const newBookingRef = doc(collection(firestore, 'bookings'));
            
            transaction.set(newBookingRef, {
                ...bookingData,
                id: newBookingRef.id,
                bookingId: bookingId,
                createdAt: serverTimestamp()
            });

            return bookingId;
        });
        
        return { success: true, bookingId: newBookingId };
    } catch (error) {
        console.error("Error creating booking with sequential ID:", error);
        return { success: false, error: "Failed to create booking." };
    }
}
