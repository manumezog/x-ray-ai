import { config } from 'dotenv';
config();

import '@/ai/flows/generate-diagnostic-report.ts';
import '@/ai/flows/summarize-existing-report.ts';
import '@/ai/flows/validate-xray-image.ts';
