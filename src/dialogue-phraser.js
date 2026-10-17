import { validatePerformance } from './npc-performance.js';

export function createUnavailablePhraser() {
  return { async phrase() { throw new Error('Dialogue phrasing is unavailable.'); } };
}

export function createOpenAIDialoguePhraser({ client, model, timeoutMs = 8_000 } = {}) {
  if (!client || !model) return createUnavailablePhraser();
  return {
    async phrase({ approvedContent, personality }) {
      const performances = legacyPerformances(approvedContent);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await client.responses.create({
          model,
          store: false,
          instructions: 'Select and return one supplied dialogue verbatim. Return only that text. Style only guides selection; do not add or change any words.',
          input: JSON.stringify({ style: personality, performances }),
        }, { signal: controller.signal });
        const output = response?.output_text?.trim();
        try { return validatePerformance({ narration: null, dialogue: output }, performances).dialogue; }
        catch { throw new Error('Invalid dialogue lead-in.'); }
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}

export async function createConfiguredOpenAIPhraser() {
  const { OPENAI_API_KEY, OPENAI_MODEL } = process.env;
  if (!OPENAI_API_KEY || !OPENAI_MODEL) return createUnavailablePhraser();
  const { default: OpenAI } = await import('openai');
  return createOpenAIDialoguePhraser({ client: new OpenAI({ apiKey: OPENAI_API_KEY, logLevel: 'off' }), model: OPENAI_MODEL });
}

// Compatibility delivery choices are authored text, never a free-form factual prefix.
export function legacyPerformances(approvedContent) {
  return ['', 'quietly: ', 'I hesitated: ', 'firmly: '].map((prefix) => ({ narration: null, dialogue: `${prefix}${approvedContent}` }));
}
