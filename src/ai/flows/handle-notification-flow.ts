
'use server';
/**
 * @fileOverview A flow for handling and sending notifications.
 *
 * - sendNotification - A function that handles sending a notification.
 * - SendNotificationInput - The input type for the sendNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { getMessaging } from 'firebase-admin/messaging';
import { firestore } from '@/firebase/server';
import { Timestamp } from 'firebase-admin/firestore';


const SendNotificationInputSchema = z.object({
  type: z.enum(['booking_request', 'job_assigned', 'status_update']).describe('The type of notification.'),
  recipientId: z.string().describe('The ID of the recipient user.'),
  message: z.string().describe('The content of the notification.'),
  bookingId: z.string().describe('The ID of the associated booking.'),
});
export type SendNotificationInput = z.infer<typeof SendNotificationInputSchema>;


export async function sendNotification(input: SendNotificationInput): Promise<void> {
  return handleNotificationFlow(input);
}


const handleNotificationFlow = ai.defineFlow(
  {
    name: 'handleNotificationFlow',
    inputSchema: SendNotificationInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    // 1. Fetch the user's document to get their FCM tokens.
    const userDocRef = firestore.collection('users').doc(input.recipientId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      console.error(`User with ID ${input.recipientId} not found.`);
      return;
    }

    const userData = userDoc.data();
    const tokens = userData?.fcmTokens;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      console.log(`No FCM tokens found for user ${input.recipientId}.`);
      // Do not proceed if there are no tokens.
    } else {
        // 2. Construct the FCM message payload.
        const payload = {
            notification: {
                title: 'New Job Assignment',
                body: input.message,
            },
            tokens: tokens,
        };

        // 3. Send the message using the firebase-admin SDK.
        try {
            const response = await getMessaging().sendMulticast(payload);
            console.log('Successfully sent message:', response);
            if (response.failureCount > 0) {
                const failedTokens: string[] = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(tokens[idx]);
                    }
                });
                console.log('List of tokens that caused failures: ' + failedTokens);
                // Here you might want to implement logic to remove invalid tokens from the user's document.
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }


    // 4. Store the notification details in the 'notifications' collection in Firestore.
    try {
        await firestore.collection('notifications').add({ 
            type: input.type,
            recipientId: input.recipientId,
            recipientRole: 'driver', // This would need to be more dynamic in a real app
            message: input.message,
            bookingId: input.bookingId,
            sentAt: Timestamp.now(), 
            status: 'sent' 
        });
    } catch (error) {
        console.error("Error saving notification to Firestore:", error);
    }
  }
);
