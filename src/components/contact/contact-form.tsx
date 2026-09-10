"use client";

import { useActionState } from "react";
import { Loader2, Send } from "lucide-react";
import { submitContact, type ContactState } from "@/app/actions/contact";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const initialState: ContactState = { ok: false, message: "" };

export function ContactForm({ productId }: { productId?: string }) {
  const [state, action, pending] = useActionState(submitContact, initialState);

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="source" value="contacto" />
      {productId ? <input type="hidden" name="productId" value={productId} /> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input id="name" name="name" required minLength={2} placeholder="Tu nombre" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Correo electrónico</Label>
          <Input id="email" name="email" type="email" required placeholder="tu@correo.com" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">WhatsApp (opcional)</Label>
        <Input id="phone" name="phone" type="tel" placeholder="+57 300 000 0000" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">¿Cómo podemos ayudarte?</Label>
        <Textarea
          id="message"
          name="message"
          required
          minLength={5}
          maxLength={2000}
          rows={5}
          placeholder="Cuéntanos qué pieza buscas, una fecha especial, un presupuesto…"
        />
      </div>

      {state.message ? (
        <p
          className={`rounded-lg px-4 py-3 text-sm ${
            state.ok
              ? "bg-esmerald-700/10 text-esmerald-800"
              : "bg-red-900/10 text-red-800"
          }`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}

      <Button type="submit" variant="gold" size="lg" disabled={pending}>
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Enviar mensaje
      </Button>
    </form>
  );
}