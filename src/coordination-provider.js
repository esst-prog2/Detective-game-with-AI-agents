import { parseRoleOutput, validatePerformance, validatePerformanceContext } from './npc-performance.js';
import { roleFailure } from './role-rejection.js';
import { strategies, witnesses } from './cases/greyhaven-reactions.js';
import { validatedStrategy } from './greyhaven-coordination.js';

const directorSchema = { type: 'object', properties: { strategy: { type: 'string', enum: strategies } },
  required: ['strategy'], additionalProperties: false };

function tags(values, allowed, cap) {
  if (!Array.isArray(values) || values.length > cap || values.some(v => !allowed.includes(v))) throw roleFailure('invalid_projection');
  return [...values];
}

export function createCoordinationRoles(client, model) {
  async function request(name, instructions, input, schema, options) {
    const body = { model, store: false, instructions,
      input: JSON.stringify(input), text: { format: { type: 'json_schema', name, strict: true, schema } }
    };
    options.onRequestStart?.();
    let response;
    try {
      response = await client.responses.create(body, { signal: options.signal, timeout: options.timeout, maxRetries: 0 });
    } catch (error) {
      const failure = roleFailure('request_failed');
      if (Number.isInteger(error?.status) && error.status >= 100 && error.status <= 599) failure.status = error.status;
      throw failure;
    }
    options.onUsage?.(response?.usage);
    if (response?.status !== 'completed') throw roleFailure('incomplete_response');
    if (response.output?.some(item => item.content?.some(part => part.type === 'refusal'))) throw roleFailure('refusal');
    return response.output_text;
  }
  return {
    async direct(context, options) {
      const input = { speakers: ['Owen', 'Mara'], actions: tags(context.actions,
        ['inspection', 'account', 'clarification', 'challenge', 'presentation'], 4), strategies };
      const output = await request('interview_strategy',
        'Direct two connected interviews. Weigh the recent detective actions in order. Decide whether inviting an account or setting a boundary best serves both interviews. Choose one offered strategy.',
        input, directorSchema, options);
      return { strategy: validatedStrategy(parseRoleOutput(output, 256)) };
    },
    async act(context, options) {
      const witness = Object.hasOwn(witnesses, context.speaker) && witnesses[context.speaker];
      if (!witness || context.goal !== witness.goal || context.style !== witness.style
        || !strategies.some(strategy => witness[strategy].instruction === context.instruction)) throw roleFailure('invalid_projection');
      let performanceContext;
      try { performanceContext = validatePerformanceContext(context); }
      catch { throw roleFailure('invalid_projection'); }
      // A dialogue enum encodes exact pairs because all E1 offers have null narration.
      if (performanceContext.performances.some(pair => pair.narration !== null)) throw roleFailure('invalid_projection');
      const input = { ...performanceContext, speaker: context.speaker, goal: witness.goal,
        instruction: context.instruction, memory: tags(context.memory, ['gave-account', 'clarified', 'revisited'], 2) };
      const output = await request('interview_reaction',
        'Act for this witness. Use your acting goal, intent, style, instruction and own memory to choose how to respond. Return one entire offered pair verbatim.',
        input, { type: 'object', properties: { narration: { type: 'null' },
          dialogue: { type: 'string', enum: input.performances.map(pair => pair.dialogue) } },
          required: ['narration', 'dialogue'], additionalProperties: false }, options);
      const pair = parseRoleOutput(output, 4096);
      if (pair?.narration !== null) throw roleFailure('schema_mismatch');
      return validatePerformance(pair, input.performances);
    }
  };
}
