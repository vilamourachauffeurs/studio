// This file is machine-generated - do not edit!

'use server';

/**
 * @fileOverview An AI agent that suggests a suitable driver for a new booking request.
 *
 * - suggestDriverForBooking - A function that suggests a driver for a booking.
 * - SuggestDriverForBookingInput - The input type for the suggestDriverForBooking function.
 * - SuggestDriverForBookingOutput - The return type for the suggestDriverForBooking function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { sendNotification } from './handle-notification-flow';

const SuggestDriverForBookingInputSchema = z.object({
  pickupLocation: z.string().describe('The pickup location of the booking.'),
  dropoffLocation: z.string().describe('The dropoff location of the booking.'),
  pickupTime: z.string().describe('The pickup time of the booking (ISO format).'),
  notes: z.string().optional().describe('Any notes for the booking.'),
});
export type SuggestDriverForBookingInput = z.infer<typeof SuggestDriverForBookingInputSchema>;

const SuggestDriverForBookingOutputSchema = z.object({
  driverId: z.string().describe('The ID of the suggested driver.'),
  reason: z.string().describe('The reason for suggesting this driver.'),
});
export type SuggestDriverForBookingOutput = z.infer<typeof SuggestDriverForBookingOutputSchema>;

export async function suggestDriverForBooking(
  input: SuggestDriverForBookingInput
): Promise<SuggestDriverForBookingOutput> {
  return suggestDriverForBookingFlow(input);
}

const getAvailableDrivers = ai.defineTool({
  name: 'getAvailableDrivers',
  description: 'Returns a list of available drivers.',
  inputSchema: z.object({
    pickupTime: z.string().describe('The pickup time for which to check driver availability (ISO format).'),
  }),
  outputSchema: z.array(z.object({
    id: z.string().describe('The driver ID.'),
    name: z.string().describe('The driver name.'),
    currentLocation: z.string().describe('The current location of the driver.'),
    status: z.string().describe('The status of the driver (online/offline).'),
    performance: z.object({
      completedJobs: z.number().describe('The number of completed jobs.'),
      onTimePercent: z.number().describe('The percentage of on-time jobs.'),
    }).optional(),
  })),
}, async (input) => {
  // TODO: Implement the logic to fetch available drivers from the database.
  // This is a placeholder implementation.
  return [
    {
      id: 'driver1',
      name: 'John Doe',
      currentLocation: 'Downtown',
      status: 'online',
      performance: {completedJobs: 100, onTimePercent: 95},
    },
    {
      id: 'driver2',
      name: 'Jane Smith',
      currentLocation: 'Uptown',
      status: 'online',
      performance: {completedJobs: 50, onTimePercent: 98},
    },
  ];
});

const prompt = ai.definePrompt({
  name: 'suggestDriverForBookingPrompt',
  input: {schema: SuggestDriverForBookingInputSchema},
  output: {schema: SuggestDriverForBookingOutputSchema},
  tools: [getAvailableDrivers],
  prompt: `You are an expert at suggesting the best available driver for a booking request.

  The booking request has the following details:
  - Pickup location: {{{pickupLocation}}}
  - Dropoff location: {{{dropoffLocation}}}
  - Pickup time: {{{pickupTime}}}
  - Notes: {{{notes}}}

  First, call the getAvailableDrivers tool to get a list of available drivers.
  Then, from the available drivers, select the best driver based on the following criteria:
  - Proximity to the pickup location
  - Driver's performance (on-time percentage, completed jobs)
  - Driver's current status (online)

  Return the driver ID and the reason for suggesting this driver.
`,
});

const suggestDriverForBookingFlow = ai.defineFlow(
  {
    name: 'suggestDriverForBookingFlow',
    inputSchema: SuggestDriverForBookingInputSchema,
    outputSchema: SuggestDriverForBookingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    if (output) {
      await sendNotification({
        type: 'job_assigned',
        recipientId: output.driverId,
        message: `You have been assigned a new job from ${input.pickupLocation} to ${input.dropoffLocation}.`,
      });
    }

    return output!;
  }
);
