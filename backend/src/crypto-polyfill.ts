import { randomUUID, webcrypto } from 'node:crypto';

const cryptoObject = globalThis.crypto ?? webcrypto;

Object.defineProperty(globalThis, 'crypto', {
  value: Object.assign(cryptoObject, { randomUUID }),
  configurable: true,
});