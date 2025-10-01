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
import { doc, updateDoc } from "firebase/firestore";
import { getSdks } from "@/firebase";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "@/firebase/config";
import { getFirestore } from "firebase/firestore";

// This is a temporary workaround to get an initialized firestore instance on the server.
// In a real app, you would likely have a more robust server-side initialization.
const getApp = () => {
    try {
        return initializeApp();
    } catch {
        return initializeApp(firebaseConfig);
    }
}
const firestore = getFirestore(getApp());


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
