// Server-only contract. A schema-valid sentence is not necessarily authorized testimony.
const invalid = () => new Error('Invalid NPC performance.');
const within = (text, max) => typeof text === 'string' && text.trim().length > 0 && [...text].length <= max;

export function performancePair(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) throw invalid();
  const keys = Reflect.ownKeys(value);
  if (keys.length !== 2 || !keys.includes('narration') || !keys.includes('dialogue')) throw invalid();
  const descriptors = Object.getOwnPropertyDescriptors(value);
  if (!Object.hasOwn(descriptors.narration, 'value') || !Object.hasOwn(descriptors.dialogue, 'value')) throw invalid();
  const { narration, dialogue } = value;
  if ((narration !== null && !within(narration, 240)) || !within(dialogue, 1200)
    || Buffer.byteLength(JSON.stringify({ narration, dialogue }), 'utf8') > 4096) throw invalid();
  return { narration, dialogue };
}

export function validatePerformance(value, performances) {
  const pair = performancePair(value);
  if (!performances.some((allowed) => allowed.narration === pair.narration && allowed.dialogue === pair.dialogue)) throw invalid();
  // Return only freshly projected fields, never a provider-owned object.
  return pair;
}

export function parsePerformance(text, performances) {
  if (typeof text !== 'string' || Buffer.byteLength(text, 'utf8') > 4096) throw invalid();
  let value;
  try { value = JSON.parse(text); } catch { throw invalid(); }
  return validatePerformance(value, performances);
}

export function validatePerformanceContext(context) {
  if (!context || !within(context.style, 500) || !within(context.intent, 64)
    || !['neutral', 'receptive', 'irritated', 'uneasy'].includes(context.demeanor)
    || !Array.isArray(context.performances) || context.performances.length < 1 || context.performances.length > 4) throw invalid();
  const performances = context.performances.map(performancePair);
  if (!performances.some((p) => p.narration === null)) throw invalid();
  return { style: context.style, demeanor: context.demeanor, intent: context.intent, performances };
}

const format = {
  type: 'json_schema', name: 'npc_performance', strict: true,
  schema: { type: 'object', properties: { narration: { type: ['string', 'null'] }, dialogue: { type: 'string' } },
    required: ['narration', 'dialogue'], additionalProperties: false },
};

export function createOpenAINPCPerformer({ client, model, timeoutMs = 8000 } = {}) {
  if (!client || !model) return null;
  return {
    async perform(input, { signal } = {}) {
      const context = validatePerformanceContext(input);
      const controller = new AbortController();
      let timer;
      let abort;
      try {
        const interrupted = new Promise((_resolve, reject) => {
          abort = () => { controller.abort(); reject(invalid()); };
          if (signal?.aborted) abort();
          else signal?.addEventListener('abort', abort, { once: true });
          timer = setTimeout(abort, timeoutMs);
        });
        // Race as well as abort: even a provider that ignores cancellation cannot hold play open.
        const request = controller.signal.aborted ? Promise.reject(invalid()) : client.responses.create({
          model, store: false,
          instructions: 'Select one of the supplied performances. Return exactly its narration and dialogue as JSON, verbatim. Narration may be null. Do not combine different pairs, add facts or omit testimony. Use the style and demeanor only to choose among the supplied pairs.',
          input: JSON.stringify(context), text: { format: structuredClone(format) },
        }, { signal: controller.signal, maxRetries: 0, timeout: timeoutMs });
        const response = await Promise.race([request, interrupted]);
        if (response?.status !== 'completed' || response.output?.some((item) => item.content?.some((part) => part.type === 'refusal'))) throw invalid();
        return parsePerformance(response.output_text, context.performances);
      } catch { throw invalid(); }
      finally { clearTimeout(timer); signal?.removeEventListener('abort', abort); }
    },
  };
}

export async function createConfiguredNPCPerformer({ env = process.env, createClient = null } = {}) {
  const { OPENAI_API_KEY: apiKey, OPENAI_MODEL: model } = env;
  if (!apiKey || !model) return null;
  try {
    const options = { apiKey, maxRetries: 0, timeout: 8000, logLevel: 'off' };
    const client = createClient ? await createClient(options) : new (await import('openai')).default(options);
    return createOpenAINPCPerformer({ client, model });
  } catch { return null; }
}
