"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateOrderStatus, updateOrderNotes } from "@/app/actions/admin";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const ORDER_STATUSES = [
  { value: "PENDING", label: "Pendiente" },
  { value: "CONFIRMED", label: "Confirmado" },
  { value: "PROCESSING", label: "En proceso" },
  { value: "SHIPPED", label: "Enviado" },
  { value: "DELIVERED", label: "Entregado" },
  { value: "CANCELLED", label: "Cancelado" },
  { value: "REFUNDED", label: "Reembolsado" },
] as const;

export function OrderStatusForm({
  orderId,
  current,
}: {
  orderId: string;
  current: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const status = new FormData(e.currentTarget).get("status");
    if (typeof status !== "string" || status === current) return;
    setBusy(true);
    const result = await updateOrderStatus(orderId, status);
    setBusy(false);
    if (result.ok) {
      toast.success("Estado actualizado");
      router.refresh();
    } else {
      toast.error(result.error ?? "No se pudo actualizar el estado");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Label htmlFor={`status-${orderId}`}>Estado del pedido</Label>
      <div className="flex gap-3">
        <Select id={`status-${orderId}`} name="status" defaultValue={current}>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="gold" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Guardar
        </Button>
      </div>
    </form>
  );
}

export function OrderNotesForm({
  orderId,
  initial,
}: {
  orderId: string;
  initial: string | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const notes = new FormData(e.currentTarget).get("notes");
    setBusy(true);
    const result = await updateOrderNotes(orderId, String(notes ?? ""));
    setBusy(false);
    if (result.ok) {
      toast.success("Notas guardadas");
      router.refresh();
    } else {
      toast.error(result.error ?? "No se pudieron guardar las notas");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Label htmlFor={`notes-${orderId}`}>Notas internas (solo el equipo)</Label>
      <Textarea
        id={`notes-${orderId}`}
        name="notes"
        rows={3}
        defaultValue={initial ?? ""}
        placeholder="Instrucciones de embalaje, seguimiento del proveedor…"
      />
      <Button type="submit" variant="outline" disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Guardar notas
      </Button>
    </form>
  );
}