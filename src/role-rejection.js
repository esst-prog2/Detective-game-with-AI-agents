// Only locally classified failures contribute metadata to the server-side pilot trace.
const stages = Object.freeze({
  request_failed: 'provider_request',
  incomplete_response: 'provider_response',
  refusal: 'provider_response',
  missing_output: 'response_text',
  output_too_large: 'response_text',
  invalid_json: 'json_parse',
  schema_mismatch: 'response_shape',
  unauthorized_performance: 'offer_membership',
  invalid_strategy: 'strategy_validation',
  invalid_projection: 'role_projection',
  attempt_spent: 'dispatch',
  provider_timeout: 'turn_deadline',
  stale_turn: 'turn_authority',
});
const diagnostics = new WeakMap();

export function roleFailure(category, message = 'Role unavailable') {
  if (!Object.hasOwn(stages, category)) throw Error('Unknown rejection category');
  const error = new Error(message);
  diagnostics.set(error, Object.freeze({ stage: stages[category], category }));
  return error;
}

export function roleRejection(error) {
  return diagnostics.get(error) ?? { stage: 'role_execution', category: 'unclassified_error' };
}
