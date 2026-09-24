export function createUnavailablePhraser() {
  return { async phrase() { throw new Error('Dialogue phrasing is unavailable.'); } };
}

export function createOpenAIDialoguePhraser({ client, model, timeoutMs = 8_000 } = {}) {
  if (!client || !model) return createUnavailablePhraser();
  return {
    async phrase({ approvedContent, personality }) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await client.responses.create({
          model,
          signal: controller.signal,
          instructions: 'Return exactly one short delivery phrase (2-8 words) followed by a colon and then repeat the approved content verbatim. Do not add, remove, or change any factual content.',
          input: `Personality: ${personality}\nApproved content: ${approvedContent}`,
        });
        const output = response?.output_text?.trim();
        const suffix = `: ${approvedContent}`;
        if (!output || output.length > 500 || !output.endsWith(suffix)) throw new Error('Invalid dialogue phrasing.');
        const leadIn = output.slice(0, -suffix.length);
        if (!/^[A-Za-z ,'-]{2,80}$/.test(leadIn)) throw new Error('Invalid dialogue lead-in.');
        return output;
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
  return createOpenAIDialoguePhraser({ client: new OpenAI({ apiKey: OPENAI_API_KEY }), model: OPENAI_MODEL });
}
