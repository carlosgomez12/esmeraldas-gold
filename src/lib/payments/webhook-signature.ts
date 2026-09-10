import crypto from "node:crypto";

export interface WompiWebhookEvent {
  event: string;
  transactionId: string;
  status: string;
  raw: unknown;
}

/**
 * Verifica la firma HMAC-SHA256 que Wompi envía en el header `x-signature`.
 * Formato esperado: `{timestamp}.{rawBody}` firmado con el events secret.
 * Acepta el prefijo opcional `sha256=`.
 */
export function verifyWompiSignature(
  rawBody: string,
  headers: Record<string, string | undefined>,
  eventSecret: string | null | undefined
): boolean {
  if (!eventSecret) return false;
  const signature = headers["x-signature"];
  if (!signature) return false;
  const timestamp = headers["x-timestamp"] ?? "";

  const computed = crypto
    .createHmac("sha256", eventSecret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  const providedSignature = signature.startsWith("sha256=")
    ? signature.slice("sha256=".length)
    : signature;

  return computed === providedSignature;
}

/**
 * Parsea un evento de Wompi y devuelve la información mínima necesaria.
 * Devuelve `null` si no hay evento de transacción válido.
 */
export function parseWompiEvent(rawBody: string): WompiWebhookEvent | null {
  try {
    const payload = JSON.parse(rawBody) as {
      event?: string;
      data?: { transaction?: { id?: string; status?: string } };
    };
    const transaction = payload.data?.transaction;
    if (!payload.event || !transaction?.id || !transaction.status) {
      return null;
    }
    return {
      event: payload.event,
      transactionId: transaction.id,
      status: transaction.status,
      raw: payload,
    };
  } catch {
    return null;
  }
}

/** Helper de firma para las pruebas: construye un header `x-signature` válido. */
export function buildWompiSignature(
  rawBody: string,
  timestamp: string,
  eventSecret: string
): string {
  return crypto
    .createHmac("sha256", eventSecret)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");
}