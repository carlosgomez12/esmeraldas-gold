import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev -- --port 3100",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      // Sin llaves de pago: el provider cae al mock y el checkout aprueba
      // transacciones con tokens `tok_test_`. Next carga `.env` solo para
      // variables que no existan ya en process.env.
      WOMPI_PUBLIC_KEY: "",
      WOMPI_PRIVATE_KEY: "",
      WOMPI_EVENTS_SECRET: "",
    },
  },
});