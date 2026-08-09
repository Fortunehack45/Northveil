import { NorthveilClient } from './client.js';
import { NorthveilConfig } from './types.js';

export { NorthveilClient };
export { NorthveilClient as Northveil };

export function createNorthveil(config?: NorthveilConfig): NorthveilClient {
  return new NorthveilClient(config);
}

export default NorthveilClient;
export * from './types.js';
