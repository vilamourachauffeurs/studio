import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-client-notes.ts';
import '@/ai/flows/suggest-driver-for-booking.ts';
import '@/ai/flows/handle-notification-flow.ts';
