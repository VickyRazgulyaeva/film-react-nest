import { webcrypto } from 'node:crypto';

if (!('crypto' in globalThis)) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
  });
}