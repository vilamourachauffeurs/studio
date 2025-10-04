
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
import { doc, updateDoc } from "firebase/firestore";
import { firestore } from "@/firebase/server";
import { format } from "date-fns";
import { FieldValue, Timestamp } from "firebase-admin/firestore";


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
        const bookingRef = firestore.collection("bookings").doc(bookingId);
        await bookingRef.update({ status });
        return { success: true };
    } catch (error) {
        console.error("Error updating booking status:", error);
        return { success: false, error: "Failed to update booking status." };
    }
}

export async function createBookingWithSequentialId(bookingData: Omit<Booking, 'id' | 'bookingId' | 'createdAt'>) {
    try {
        const newBookingId = await firestore.runTransaction(async (transaction) => {
            const today = format(new Date(), 'yyMMdd');
            const counterRef = firestore.collection('counters').doc(today);
            const counterDoc = await transaction.get(counterRef);

            let newNumber = 1;
            if (counterDoc.exists) {
                newNumber = (counterDoc.data()?.lastNumber || 0) + 1;
            }

            const bookingId = `${today}${(newNumber).toString().padStart(3, '0')}`;
            
            transaction.set(counterRef, { lastNumber: newNumber });
            
            const newBookingRef = firestore.collection('bookings').doc();
            
            transaction.set(newBookingRef, {
                ...bookingData,
                pickupTime: Timestamp.fromDate(new Date(bookingData.pickupTime)),
                id: newBookingRef.id,
                bookingId: bookingId,
                createdAt: FieldValue.serverTimestamp()
            });

            return bookingId;
        });
        
        return { success: true, bookingId: newBookingId };
    } catch (error) {
        console.error("Error creating booking with sequential ID:", error);
        return { success: false, error: "Failed to create booking." };
    }
}
