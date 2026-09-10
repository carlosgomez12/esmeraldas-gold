import "server-only";

import { serverEnv } from "@/config/server-env";
import type { PaymentProvider } from "./types";

export const paymentProvider: PaymentProvider = getProvider();

function getProvider(): PaymentProvider {
  const useMock =
    !serverEnv.wompiPublicKey || !serverEnv.wompiPrivateKey;
  if (useMock) {
    // Dynamic require evita importar dependencias del proveedor real en vacío.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("./mock-provider").mockProvider as PaymentProvider;
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require("./wompi-provider").wompiProvider as PaymentProvider;
}

export const isPaymentMock = paymentProvider.name === "mock";