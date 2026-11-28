import { clarificationCase } from './clarification-case.js';

// Used only by test registries.
export function infrastructureCase() {
  const fixture = clarificationCase();
  const { rooms, locations, suspects } = fixture.data;
  suspects[1].accusationEligible = false;
  rooms[0].connections = ['test-office'];
  rooms[1].connections = ['test-pier', 'test-lobby'];
  rooms.push({ id: 'test-lobby', name: 'the test lobby', connections: ['test-office'] });
  locations.push('the test lobby');
  return fixture;
}
