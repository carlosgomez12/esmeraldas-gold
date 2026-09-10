"use client";

import { useActionState } from "react";
import { Loader2, Send } from "lucide-react";
import { subscribeToNewsletter } from "@/app/actions/newsletter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const initialState = { ok: false, message: "" };

export function NewsletterForm() {
  const [state, action, pending] = useActionState(
    subscribeToNewsletter,
    initialState
  );

  return (
    <form action={action} className="mx-auto mt-8 max-w-xl">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          type="email"
          name="email"
          placeholder="Tu correo electrónico"
          required
          aria-label="Correo electrónico"
          className="h-12 flex-1 border-ivory-50/20 bg-white/10 text-ivory-50 placeholder:text-ivory-200/50 focus:border-gold-400"
        />
        <input type="hidden" name="source" value="home" />
        <Button
          type="submit"
          variant="gold"
          size="lg"
          disabled={pending}
          className="h-12"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Suscribirme
        </Button>
      </div>
      {state.message ? (
        <p
          className={`mt-3 text-sm ${
            state.ok ? "text-esmerald-500" : "text-red-400"
          }`}
          role="status"
        >
          {state.message}
        </p>
      ) : null}
      <p className="mt-3 text-xs text-ivory-200/60">
        Recibe primicias y ediciones limitadas. Sin spam.
      </p>
    </form>
  );
}