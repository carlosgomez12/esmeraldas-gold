export type PaymentProviderName = "wompi" | "mock";

export interface ProviderCustomer {
  email: string;
  phone?: string | null;
  fullName?: string | null;
}

export interface TransactionInput {
  amount: number;
  currency: string;
  reference: string;
  customer: ProviderCustomer;
  paymentMethodToken: string;
  acceptanceToken?: string | null;
  installments?: number;
}

export type TransactionStatus =
  | "PENDING"
  | "APPROVED"
  | "DECLINED"
  | "VOIDED"
  | "ERROR";

export interface TransactionResult {
  ok: boolean;
  status: TransactionStatus;
  providerReference: string | null;
  failureReason?: string | null;
  raw: unknown;
}

export interface PaymentProvider {
  name: PaymentProviderName;
  /** Token de aceptación legal de pasarelas (Wompi: /v1/merchants/{key}/accepted_payment_methods). */
  getAcceptanceToken(): Promise<string | null>;
  /** Convierte un monto en unidad mayor (COP) a unidad menor del proveedor. */
  toMinorUnits(amount: number): number;
  /** Crea una transacción con el método de pago ya tokenizado por el cliente. */
  createTransaction(input: TransactionInput): Promise<TransactionResult>;
  /** Verifica el estado de una transacción por su referencia en el proveedor. */
  verifyTransaction(providerReference: string): Promise<TransactionResult>;
  /** Valida y parsea un evento de webhook. Devuelve null si es inválido. */
  verifyWebhookEvent(
    rawBody: string,
    headers: Record<string, string | undefined>
  ): Promise<{
    event: string;
    transactionId: string;
    status: TransactionStatus;
    raw: unknown;
  } | null>;
}