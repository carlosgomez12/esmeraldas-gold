import { serverEnv } from "@/config/server-env";
import { verifyWompiSignature, parseWompiEvent } from "./webhook-signature";
import type {
  PaymentProvider,
  TransactionInput,
  TransactionStatus,
} from "./types";

const WOMPI_BASE = serverEnv.wompiPublicKey.startsWith("pub_test_")
  ? "https://sandbox.wompi.co/v1"
  : "https://production.wompi.co/v1";

function mapStatus(rawStatus: string): TransactionStatus {
  switch (rawStatus) {
    case "APPROVED":
      return "APPROVED";
    case "PENDING":
      return "PENDING";
    case "DECLINED":
      return "DECLINED";
    case "VOIDED":
      return "VOIDED";
    default:
      return "ERROR";
  }
}

export const wompiProvider: PaymentProvider = {
  name: "wompi",

  async getAcceptanceToken() {
    const res = await fetch(
      `${WOMPI_BASE}/merchants/${serverEnv.wompiPublicKey}/accepted_payment_methods`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      accepted_payment_methods?: { acceptance_token?: string };
    };
    return data.accepted_payment_methods?.acceptance_token ?? null;
  },

  toMinorUnits(amount) {
    return Math.round(amount * 100);
  },

  async createTransaction(input: TransactionInput) {
    const acceptanceToken =
      input.acceptanceToken ??
      (await wompiProvider.getAcceptanceToken());

    if (!acceptanceToken) {
      return {
        ok: false,
        status: "ERROR",
        providerReference: null,
        failureReason: "No se pudo obtener la autorización de transacciones.",
        raw: {},
      };
    }

    const body = {
      acceptance_token: acceptanceToken,
      amount_in_cents: wompiProvider.toMinorUnits(input.amount),
      currency: input.currency,
      reference: input.reference,
      customer_email: input.customer.email,
      customer_data: {
        full_name: input.customer.fullName ?? undefined,
        phone_number: input.customer.phone ?? undefined,
      },
      payment_method: { type: "CARD", token: input.paymentMethodToken },
      ...(input.installments ? { installments: input.installments } : {}),
    };

    try {
      const res = await fetch(`${WOMPI_BASE}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${serverEnv.wompiPrivateKey}`,
        },
        body: JSON.stringify(body),
        cache: "no-store",
      });
      const data = (await res.json()) as {
        data?: {
          id?: string;
          status?: string;
          status_message?: string;
        };
        error?: { message?: string };
      };

      if (!res.ok || !data.data) {
        return {
          ok: false,
          status: "ERROR",
          providerReference: null,
          failureReason: data.error?.message ?? "Error al procesar el pago.",
          raw: data,
        };
      }

      const status = mapStatus(data.data.status ?? "ERROR");
      return {
        ok: status === "APPROVED",
        status,
        providerReference: data.data.id ?? null,
        failureReason: data.data.status_message ?? null,
        raw: data.data,
      };
    } catch (error) {
      return {
        ok: false,
        status: "ERROR",
        providerReference: null,
        failureReason: "No se pudo contactar el proveedor de pagos.",
        raw: { error },
      };
    }
  },

  async verifyTransaction(providerReference) {
    try {
      const res = await fetch(`${WOMPI_BASE}/transactions/${providerReference}`, {
        headers: {
          Authorization: `Bearer ${serverEnv.wompiPrivateKey}`,
        },
        cache: "no-store",
      });
      const data = (await res.json()) as {
        data?: { id?: string; status?: string; status_message?: string };
      };
      if (!data.data) {
        return {
          ok: false,
          status: "ERROR",
          providerReference: null,
          failureReason: "Transacción no encontrada.",
          raw: data,
        };
      }
      const status = mapStatus(data.data.status ?? "ERROR");
      return {
        ok: status === "APPROVED",
        status,
        providerReference: data.data.id ?? null,
        failureReason: data.data.status_message ?? null,
        raw: data.data,
      };
    } catch (error) {
      return {
        ok: false,
        status: "ERROR",
        providerReference: null,
        failureReason: "Error verificando la transacción.",
        raw: { error },
      };
    }
  },

  async verifyWebhookEvent(rawBody, headers) {
    const eventSecret = serverEnv.wompiEventsSecret;

    if (!verifyWompiSignature(rawBody, headers, eventSecret)) return null;

    const parsed = parseWompiEvent(rawBody);
    if (!parsed) return null;

    return {
      event: parsed.event,
      transactionId: parsed.transactionId,
      status: mapStatus(parsed.status),
      raw: parsed.raw,
    };
  },
};