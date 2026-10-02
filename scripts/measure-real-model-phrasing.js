import { mkdir, open } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { performance } from 'node:perf_hooks';
import { caseData, TOPICS } from '../src/data/case.js';
import { createOpenAIDialoguePhraser } from '../src/dialogue-phraser.js';

export function buildAttempts() {
  const repeats = [[0, 1, 2, 3], [2, 3, 4, 5], [4, 5, 0, 1]];
  return [
    ...caseData.suspects.flatMap((suspect) => TOPICS.map((topic) => ({ suspect, topic }))),
    ...caseData.suspects.flatMap((suspect, index) => repeats[index].map((i) => ({ suspect, topic: TOPICS[i] }))),
  ];
}

export function summarize(attempts) {
  if (attempts.length !== 30) throw new Error('A complete spike requires exactly 30 attempt records.');
  const latencies = attempts.map(({ latencyMs }) => latencyMs).sort((a, b) => a - b);
  if (latencies.some((value) => !Number.isFinite(value) || value < 0)) throw new Error('Invalid latency.');
  const passed = attempts.filter(({ outcome }) => outcome === 'passed').length;
  return {
    passed,
    total: attempts.length,
    passRatePercent: passed / attempts.length * 100,
    p50LatencyMs: latencies[Math.ceil(0.50 * latencies.length) - 1],
    p95LatencyMs: latencies[Math.ceil(0.95 * latencies.length) - 1],
  };
}

async function main() {
  const { OPENAI_API_KEY, OPENAI_MODEL } = process.env;
  if (!OPENAI_API_KEY || !OPENAI_MODEL) {
    throw new Error('Set both OPENAI_API_KEY and OPENAI_MODEL. No experiment was started.');
  }
  const { default: OpenAI } = await import('openai');
  const { VERSION: sdkVersion } = await import('openai/version');
  const client = new OpenAI({ apiKey: OPENAI_API_KEY });
  const startedAt = new Date().toISOString();
  const directory = new URL('../spikes/results/', import.meta.url);
  await mkdir(directory, { recursive: true });
  const path = new URL(`phrasing-${startedAt.replace(/[:.]/g, '-')}-${process.pid}.jsonl`, directory);
  const file = await open(path, 'wx');
  const append = (record) => file.writeFile(`${JSON.stringify(record)}\n`, 'utf8');
  const records = [];
  console.log(`Evidence: ${fileURLToPath(path)}`);
  try {
    await append({ type: 'run', startedAt, model: OPENAI_MODEL, sdkVersion, nodeVersion: process.version,
      attempts: 30, timeoutMs: 8_000, sdkMaxRetries: client.maxRetries,
      percentileMethod: 'nearest rank: sorted[ceil(p * N) - 1]; all attempts',
      latencyScope: 'phrase() start to resolve/reject, including SDK retries and validation; excluding evidence writes' });
    for (const { suspect, topic } of buildAttempts()) {
      const approvedContent = suspect.responses[topic].approvedContent;
      const record = { type: 'attempt', attempt: records.length + 1, startedAt: new Date().toISOString(),
        suspectId: suspect.id, topic, approvedContent, personality: suspect.personality,
        outcome: null, rawOutput: null, error: null };
      let responseReceived = false;
      let signal;
      const recordingClient = { responses: { create: async (body, options) => {
        record.request = body;
        signal = options.signal;
        const response = await client.responses.create(body, options);
        responseReceived = true;
        record.rawOutput = response.output_text ?? null;
        record.responseId = response.id;
        record.requestId = response._request_id;
        record.responseModel = response.model;
        record.responseStatus = response.status;
        return response;
      } } };
      const phraser = createOpenAIDialoguePhraser({ client: recordingClient, model: OPENAI_MODEL });
      const start = performance.now();
      try {
        await phraser.phrase({ approvedContent, personality: suspect.personality });
        record.outcome = 'passed';
      } catch (error) {
        record.outcome = responseReceived ? 'validation_failure'
          : signal?.aborted || error.name === 'APIConnectionTimeoutError' ? 'timeout' : 'api_error';
        record.error = { name: error.name, message: error.message, status: error.status, code: error.code };
      } finally {
        record.latencyMs = performance.now() - start;
      }
      await append(record);
      records.push(record);
      console.log(`${record.attempt}/30 ${suspect.id}/${topic}: ${record.outcome} (${record.latencyMs.toFixed(1)} ms)`);
    }
    const summary = summarize(records);
    await append({ type: 'summary', ...summary });
    console.log(`Passed / total: ${summary.passed} / ${summary.total}`);
    console.log(`Pass rate: ${summary.passRatePercent.toFixed(2)}%`);
    console.log(`p50 latency: ${summary.p50LatencyMs.toFixed(1)} ms`);
    console.log(`p95 latency: ${summary.p95LatencyMs.toFixed(1)} ms`);
  } finally {
    await file.close();
  }
}

// Importing the calculation helpers in offline tests never runs the experiment.
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
