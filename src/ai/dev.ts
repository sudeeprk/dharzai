import { config } from 'dotenv';
config();

import '@/ai/flows/generate-initial-prompt.ts';
import '@/ai/flows/contextual-conversation.ts';