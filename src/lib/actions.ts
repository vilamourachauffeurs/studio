
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
    // This is now a client-side only function, not a server action
    // It will be called from the client component directly
    return { success: false, error: "This function should not be called from server side." };
}
