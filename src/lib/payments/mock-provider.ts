import type { PaymentProvider, TransactionInput } from "./types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Proveedor simulado para desarrollo y pruebas sin credenciales reales.
 * Aprueba transacciones para cualquier token que empiece por "tok_test".
 */
export const mockProvider: PaymentProvider = {
  name: "mock",

  async getAcceptanceToken() {
    return "mock_acceptance_token";
  },

  toMinorUnits(amount) {
    return amount;
  },

  async createTransaction(input: TransactionInput) {
    await sleep(1200);
    const approves = input.paymentMethodToken.startsWith("tok_test");
    return {
      ok: approves,
      status: approves ? "APPROVED" : "DECLINED",
      providerReference: `mock_${input.reference}`,
      failureReason: approves ? null : "Tarjeta rechazada (simulación)",
      raw: {
        provider: "mock",
        reference: input.reference,
        amount: input.amount,
      },
    };
  },

  async verifyTransaction(providerReference) {
    return {
      ok: true,
      status: "APPROVED",
      providerReference,
      raw: { provider: "mock", verified: true },
    };
  },

  async verifyWebhookEvent() {
    return null;
  },
};