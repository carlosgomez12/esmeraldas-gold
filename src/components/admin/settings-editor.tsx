"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, Plus } from "lucide-react";
import { toast } from "sonner";
import { updateSetting } from "@/app/actions/admin";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface SettingRow {
  key: string;
  valueJson: string;
}

function JsonRow({ setting }: { setting: SettingRow }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const result = await updateSetting(fd);
    setBusy(false);
    if (result.ok) {
      toast.success(`«${setting.key}» guardado`);
      router.refresh();
    } else {
      toast.error(result.error ?? "JSON inválido");
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-ink-900/10 bg-white/70 p-5"
    >
      <Label className="font-display text-base font-medium normal-case tracking-normal text-ink-900">
        <code>{setting.key}</code>
      </Label>
      <input type="hidden" name="key" value={setting.key} />
      <Textarea
        name="valueJson"
        rows={5}
        defaultValue={setting.valueJson}
        className="mt-3 font-mono text-xs"
        spellCheck={false}
      />
      <div className="mt-3 flex justify-end">
        <Button type="submit" variant="outline" size="sm" disabled={busy}>
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Guardar
        </Button>
      </div>
    </form>
  );
}

export function SettingsEditor({
  settings,
  allowCreate,
}: {
  settings: SettingRow[];
  allowCreate?: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);
  const [showCreate, setShowCreate] = React.useState(false);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData(e.currentTarget);
    const result = await updateSetting(fd);
    setBusy(false);
    if (result.ok) {
      toast.success("Clave creada");
      setShowCreate(false);
      router.refresh();
    } else {
      toast.error(result.error ?? "JSON inválido");
    }
  }

  return (
    <div className="space-y-4">
      {settings.length === 0 && !allowCreate ? (
        <p className="rounded-2xl border border-dashed border-ink-900/20 bg-white/50 py-12 text-center text-sm text-ink-600">
          Aún no hay claves de configuración.
        </p>
      ) : null}
      {settings.map((setting) => (
        <JsonRow key={setting.key} setting={setting} />
      ))}

      {allowCreate ? (
        showCreate ? (
          <form onSubmit={handleCreate} className="rounded-2xl border border-dashed border-ink-900/20 bg-white/50 p-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_2fr]">
              <div className="space-y-2">
                <Label htmlFor="setting-key">Clave</Label>
                <Input id="setting-key" name="key" required placeholder="e.g. seo_home" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="setting-value">Valor (JSON)</Label>
                <Textarea
                  id="setting-value"
                  name="valueJson"
                  rows={2}
                  required
                  placeholder='{"title": "…"}'
                  className="font-mono text-xs"
                  spellCheck={false}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button type="submit" variant="gold" size="sm" disabled={busy}>
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Crear
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreate(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 rounded-full border border-dashed border-ink-900/25 px-5 py-2.5 text-sm font-semibold text-ink-700 transition hover:border-gold-500 hover:text-gold-700"
          >
            <Plus className="h-4 w-4" />
            Añadir clave personalizada
          </button>
        )
      ) : null}
    </div>
  );
}