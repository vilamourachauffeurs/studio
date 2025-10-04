
"use server";

import {
  summarizeClientNotes,
  type SummarizeClientNotesInput,
} from "@/ai/flows/summarize-client-notes";
import {
  suggestDriverForBooking,
  type SuggestDriverForBookingInput,
} from "@/ai/flows/suggest-driver-for-booking";
import { BookingStatus } from "./types";
import { firestore } from "@/firebase/server";


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
