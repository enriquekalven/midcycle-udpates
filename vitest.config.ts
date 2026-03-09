import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    env: {
      GEMINI_API_KEY: 'mock_key',
      GOOGLE_GENAI_API_KEY: 'mock_key',
      GOOGLE_CLOUD_PROJECT: 'enriquekchan-b646b',
      GOOGLE_CLOUD_LOCATION: 'us-central1'
    }
  },
});
