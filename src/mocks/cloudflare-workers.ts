// Mock for cloudflare:workers
export const env = {
  USAGE_KV: {
    get: async () => null,
    put: async () => {},
  }
};
