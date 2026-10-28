import { beforeEach } from "vitest";

const AI_ENV_NAMES = [
  "DEMO_MODE",
  "AI_PROVIDER",
  "AI_API_KEY",
  "DEEPSEEK_API_KEY",
  "OPENAI_API_KEY",
  "AI_BASE_URL",
  "AI_MODEL",
  "OPENAI_BASE_URL",
  "OPENAI_MODEL",
  "AI_REQUEST_TIMEOUT_MS",
  "AI_MAX_TOKENS",
  "AI_DEMO_LIMIT",
  "DAILY_AI_LIMIT",
  "AI_RATE_LIMIT_PER_MINUTE",
  "AI_MAX_INPUT_CHARS",
];

// Unit tests must never inherit a developer's real provider credentials.
beforeEach(() => {
  AI_ENV_NAMES.forEach((name) => {
    delete process.env[name];
  });
});
