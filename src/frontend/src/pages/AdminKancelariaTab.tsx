import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  DEFAULT_HOURS,
  DEFAULT_KANCELARIA_META,
  DEFAULT_MATTERS,
  KANCELARIA_HOURS_KEY,
  KANCELARIA_MATTERS_KEY,
  KANCELARIA_META_KEY,
  type KancelariaMeta,
  type Matter,
  type OfficeHour,
  useKancelariaHours,
  useKancelariaMatters,
  useKancelariaMeta,
} from "./KancelariaPage";

// ============================================================
// ACTOR WAIT HELPER
// ============================================================

function useActorRef() {
  const { actor, isFetching } = useActor();
  const actorRef = useRef<any>(null);
  const fetchingRef = useRef<boolean>(true);
  React.useEffect(() => {
    actorRef.current = actor;
    fetchingRef.current = isFetching;
  }, [actor, isFetching]);
  return { actorRef, fetchingRef };
}

async function waitForActor(
  actorRef: React.MutableRefObject<any>,
  fetchingRef: React.MutableRefObject<boolean>,
) {
  if (actorRef.current) return actorRef.current;
  for (let i = 0; i < 100; i++) {
    await new Promise<void>((r) => setTimeout(r, 100));
    if (actorRef.current) return actorRef.current;
    if (!fetchingRef.current && !actorRef.current)
      throw new Error("Actor not available");
  }
  throw new Error("Actor timed out");
}

// ============================================================
// SAVE HELPER
// ============================================================

async function saveContentBlock(
  actorRef: React.MutableRefObject<any>,
  fetchingRef: React.MutableRefObject<boolean>,
  key: string,
  value: string,
) {
  const actor = await waitForActor(actorRef, fetchingRef);
  await (actor as any).updateContentBlock(key, value);
}

// ============================================================
// IMAGE UPLOAD
// ============================================================

function ImageUploadField({
  label,
  currentUrl,
  onUpload,
}: {
  label: string;
  currentUrl: string;
  onUpload: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      const url = blob.getDirectURL();
      onUpload(url ?? "");
      toast.success("Zdjęcie załadowane. Zapisz formularz, aby zachować.");
    } catch {
      toast.error("Błąd wczytywania zdjęcia.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="font-sans text-sm font-light">{label}</Label>
      <div className="flex items-center gap-3">
        {currentUrl && (
          <img
            src={currentUrl}
            alt=""
            className="w-16 h-10 object-cover rounded-lg border border-border"
          />
        )}
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-xs font-sans font-light hover:bg-muted/70 transition-colors disabled:opacity-50"
          data-ocid="kancelaria.hero.upload_button"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          Wgraj zdjęcie
        </button>
        {currentUrl && (
          <button
            type="button"
            onClick={() => onUpload("")}
            className="text-xs font-sans font-light text-muted-foreground hover:text-destructive transition-colors"
          >
            Usuń
          </button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
    </div>
  );
}

// ============================================================
// HERO SECTION
// ============================================================

function HeroSection() {
  const { actorRef, fetchingRef } = useActorRef();
  const qc = useQueryClient();
  const { data } = useKancelariaMeta();
  const [form, setForm] = useState<KancelariaMeta | null>(null);

  const current = form ?? data ?? DEFAULT_KANCELARIA_META;

  const { mutate, isPending } = useMutation({
    mutationFn: async (val: KancelariaMeta) =>
      saveContentBlock(
        actorRef,
        fetchingRef,
        KANCELARIA_META_KEY,
        JSON.stringify(val),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KANCELARIA_META_KEY] });
      toast.success("Hero zapisany.");
    },
    onError: () => toast.error("Błąd zapisu."),
  });

  return (
    <div className="space-y-5">
      <h3 className="font-display text-lg font-light text-foreground">
        Hero – teksty
      </h3>
      <div className="space-y-4">
        <div>
          <Label className="font-sans text-sm font-light">Nagłówek</Label>
          <Input
            value={current.heroTitle}
            onChange={(e) => setForm({ ...current, heroTitle: e.target.value })}
            className="mt-1 font-sans font-light"
            data-ocid="kancelaria.hero.input"
          />
        </div>
        <div>
          <Label className="font-sans text-sm font-light">Podtytuł</Label>
          <Textarea
            value={current.heroSubtitle}
            onChange={(e) =>
              setForm({ ...current, heroSubtitle: e.target.value })
            }
            rows={2}
            className="mt-1 font-sans font-light"
            data-ocid="kancelaria.hero.textarea"
          />
        </div>
        <div>
          <Label className="font-sans text-sm font-light">
            Opis (opcjonalny)
          </Label>
          <Textarea
            value={current.heroDescription}
            onChange={(e) =>
              setForm({ ...current, heroDescription: e.target.value })
            }
            rows={2}
            className="mt-1 font-sans font-light"
          />
        </div>
        <ImageUploadField
          label="Zdjęcie tła"
          currentUrl={current.heroImageUrl}
          onUpload={(url) => setForm({ ...current, heroImageUrl: url })}
        />
      </div>
      <Button
        onClick={() => mutate(current)}
        disabled={isPending}
        size="sm"
        className="font-sans font-light"
        data-ocid="kancelaria.hero.save_button"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Zapisz hero
      </Button>
    </div>
  );
}

// ============================================================
// HOURS SECTION
// ============================================================

function HoursSection() {
  const { actorRef, fetchingRef } = useActorRef();
  const qc = useQueryClient();
  const { data } = useKancelariaHours();
  const [localHours, setLocalHours] = useState<OfficeHour[] | null>(null);

  const hours = localHours ?? data ?? DEFAULT_HOURS;

  const { mutate, isPending } = useMutation({
    mutationFn: async (val: OfficeHour[]) =>
      saveContentBlock(
        actorRef,
        fetchingRef,
        KANCELARIA_HOURS_KEY,
        JSON.stringify(val),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KANCELARIA_HOURS_KEY] });
      toast.success("Godziny zapisane.");
    },
    onError: () => toast.error("Błąd zapisu."),
  });

  const update = (id: string, patch: Partial<OfficeHour>) => {
    setLocalHours(hours.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  };

  const addHour = () => {
    const newH: OfficeHour = {
      id: Date.now().toString(),
      day: "Nowy dzień",
      hours: "00:00 – 00:00",
      visible: true,
    };
    setLocalHours([...hours, newH]);
  };

  const remove = (id: string) =>
    setLocalHours(hours.filter((h) => h.id !== id));

  return (
    <div className="space-y-5">
      <h3 className="font-display text-lg font-light text-foreground">
        Godziny kancelarii
      </h3>
      <div className="space-y-3">
        {hours.map((h, i) => (
          <div
            key={h.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
            data-ocid={`kancelaria.hours.row.${i + 1}`}
          >
            <Switch
              checked={h.visible}
              onCheckedChange={(v) => update(h.id, { visible: v })}
              data-ocid={`kancelaria.hours.switch.${i + 1}`}
            />
            <Input
              value={h.day}
              onChange={(e) => update(h.id, { day: e.target.value })}
              className="flex-1 font-sans font-light h-8 text-sm"
              placeholder="Dzień"
            />
            <Input
              value={h.hours}
              onChange={(e) => update(h.id, { hours: e.target.value })}
              className="w-36 font-sans font-light h-8 text-sm"
              placeholder="Godziny"
            />
            <button
              type="button"
              onClick={() => remove(h.id)}
              className="text-muted-foreground hover:text-destructive transition-colors"
              data-ocid={`kancelaria.hours.delete_button.${i + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={addHour}
          className="inline-flex items-center gap-1.5 text-sm font-sans font-light text-primary hover:text-primary/70 transition-colors"
          data-ocid="kancelaria.hours.primary_button"
        >
          <Plus className="w-4 h-4" /> Dodaj dzień
        </button>
      </div>
      <Button
        onClick={() => mutate(hours)}
        disabled={isPending}
        size="sm"
        className="font-sans font-light"
        data-ocid="kancelaria.hours.save_button"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Zapisz godziny
      </Button>
    </div>
  );
}

// ============================================================
// MATTER FORM
// ============================================================

function MatterForm({
  initial,
  onSave,
  onCancel,
}: {
  initial: Matter;
  onSave: (m: Matter) => void;
  onCancel: () => void;
}) {
  const [m, setM] = useState<Matter>(initial);
  const [newDoc, setNewDoc] = useState("");

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="font-sans text-xs font-light">Nazwa</Label>
          <Input
            value={m.name}
            onChange={(e) => setM({ ...m, name: e.target.value })}
            className="mt-1 font-sans font-light"
            data-ocid="kancelaria.matter.input"
          />
        </div>
        <div>
          <Label className="font-sans text-xs font-light">Krótki opis</Label>
          <Input
            value={m.shortDesc}
            onChange={(e) => setM({ ...m, shortDesc: e.target.value })}
            className="mt-1 font-sans font-light"
          />
        </div>
      </div>
      <div>
        <Label className="font-sans text-xs font-light">Pełny opis</Label>
        <Textarea
          value={m.description}
          onChange={(e) => setM({ ...m, description: e.target.value })}
          rows={3}
          className="mt-1 font-sans font-light"
          data-ocid="kancelaria.matter.textarea"
        />
      </div>
      <div>
        <Label className="font-sans text-xs font-light mb-2 block">
          Wymagane dokumenty
        </Label>
        <div className="space-y-1.5 mb-2">
          {m.documents.map((doc, i) => (
            <div key={`doc-${i}-${doc}`} className="flex items-center gap-2">
              <span className="flex-1 font-sans text-sm font-light text-foreground/80">
                {doc}
              </span>
              <button
                type="button"
                onClick={() =>
                  setM({
                    ...m,
                    documents: m.documents.filter((_, j) => j !== i),
                  })
                }
                className="text-muted-foreground hover:text-destructive transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newDoc}
            onChange={(e) => setNewDoc(e.target.value)}
            placeholder="Dodaj dokument…"
            className="flex-1 font-sans font-light h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newDoc.trim()) {
                setM({ ...m, documents: [...m.documents, newDoc.trim()] });
                setNewDoc("");
              }
            }}
          />
          <button
            type="button"
            onClick={() => {
              if (newDoc.trim()) {
                setM({ ...m, documents: [...m.documents, newDoc.trim()] });
                setNewDoc("");
              }
            }}
            className="rounded-lg border border-border bg-muted px-2.5 py-1 text-xs font-sans hover:bg-muted/70 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label className="font-sans text-xs font-light">Kiedy zgłosić</Label>
          <Input
            value={m.whenToRegister}
            onChange={(e) => setM({ ...m, whenToRegister: e.target.value })}
            className="mt-1 font-sans font-light"
          />
        </div>
        <div>
          <Label className="font-sans text-xs font-light">Kontakt</Label>
          <Input
            value={m.contactInfo}
            onChange={(e) => setM({ ...m, contactInfo: e.target.value })}
            className="mt-1 font-sans font-light"
          />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          onClick={() => onSave(m)}
          className="font-sans font-light"
          data-ocid="kancelaria.matter.save_button"
        >
          Zapisz
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onCancel}
          className="font-sans font-light"
          data-ocid="kancelaria.matter.cancel_button"
        >
          Anuluj
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// MATTERS SECTION
// ============================================================

function MattersSection() {
  const { actorRef, fetchingRef } = useActorRef();
  const qc = useQueryClient();
  const { data } = useKancelariaMatters();
  const [localMatters, setLocalMatters] = useState<Matter[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const matters = localMatters ?? data ?? DEFAULT_MATTERS;

  const { mutate, isPending } = useMutation({
    mutationFn: async (val: Matter[]) =>
      saveContentBlock(
        actorRef,
        fetchingRef,
        KANCELARIA_MATTERS_KEY,
        JSON.stringify(val),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KANCELARIA_MATTERS_KEY] });
      toast.success("Sprawy zapisane.");
    },
    onError: () => toast.error("Błąd zapisu."),
  });

  const save = (updated: Matter) => {
    const next = matters.map((m) => (m.id === updated.id ? updated : m));
    setLocalMatters(next);
    setEditingId(null);
  };

  const add = (m: Matter) => {
    const next = [...matters, m];
    setLocalMatters(next);
    setAdding(false);
  };

  const remove = (id: string) =>
    setLocalMatters(matters.filter((m) => m.id !== id));

  const move = (id: string, dir: -1 | 1) => {
    const idx = matters.findIndex((m) => m.id === id);
    if (idx < 0) return;
    const next = [...matters];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setLocalMatters(next.map((m, i) => ({ ...m, order: i })));
  };

  return (
    <div className="space-y-5">
      <h3 className="font-display text-lg font-light text-foreground">
        Zarządzaj sprawami
      </h3>
      <div className="space-y-3">
        {matters.map((m, i) =>
          editingId === m.id ? (
            <MatterForm
              key={m.id}
              initial={m}
              onSave={save}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={m.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
              data-ocid={`kancelaria.matters.row.${i + 1}`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-sans text-sm font-light text-foreground truncate">
                  {m.name}
                </p>
                <p className="font-sans text-xs font-light text-muted-foreground truncate">
                  {m.shortDesc}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(m.id, -1)}
                  disabled={i === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(m.id, 1)}
                  disabled={i === matters.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(m.id)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  data-ocid={`kancelaria.matters.edit_button.${i + 1}`}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(m.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  data-ocid={`kancelaria.matters.delete_button.${i + 1}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ),
        )}
        {adding && (
          <MatterForm
            initial={{
              id: Date.now().toString(),
              name: "",
              shortDesc: "",
              description: "",
              documents: [],
              whenToRegister: "",
              contactInfo: "",
              order: matters.length,
            }}
            onSave={add}
            onCancel={() => setAdding(false)}
          />
        )}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-1.5 text-sm font-sans font-light text-primary hover:text-primary/70 transition-colors"
          data-ocid="kancelaria.matters.primary_button"
        >
          <Plus className="w-4 h-4" /> Dodaj sprawę
        </button>
        <Button
          onClick={() => mutate(matters)}
          disabled={isPending}
          size="sm"
          className="font-sans font-light"
          data-ocid="kancelaria.matters.save_button"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Zapisz sprawy
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// CONTACT + DOCS + ANNOUNCEMENT + CLOSING
// ============================================================

function MetaSection() {
  const { actorRef, fetchingRef } = useActorRef();
  const qc = useQueryClient();
  const { data } = useKancelariaMeta();
  const [form, setForm] = useState<KancelariaMeta | null>(null);
  const [newDoc, setNewDoc] = useState("");

  const current = form ?? data ?? DEFAULT_KANCELARIA_META;

  const { mutate, isPending } = useMutation({
    mutationFn: async (val: KancelariaMeta) =>
      saveContentBlock(
        actorRef,
        fetchingRef,
        KANCELARIA_META_KEY,
        JSON.stringify(val),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KANCELARIA_META_KEY] });
      toast.success("Dane zapisane.");
    },
    onError: () => toast.error("Błąd zapisu."),
  });

  return (
    <div className="space-y-8">
      {/* CONTACT */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-light text-foreground">
          Dane kontaktowe
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label className="font-sans text-sm font-light">Telefon</Label>
            <Input
              value={current.contactPhone}
              onChange={(e) =>
                setForm({ ...current, contactPhone: e.target.value })
              }
              className="mt-1 font-sans font-light"
              data-ocid="kancelaria.contact.input"
            />
          </div>
          <div>
            <Label className="font-sans text-sm font-light">Email</Label>
            <Input
              value={current.contactEmail}
              onChange={(e) =>
                setForm({ ...current, contactEmail: e.target.value })
              }
              className="mt-1 font-sans font-light"
            />
          </div>
          <div>
            <Label className="font-sans text-sm font-light">Adres</Label>
            <Input
              value={current.contactAddress}
              onChange={(e) =>
                setForm({ ...current, contactAddress: e.target.value })
              }
              className="mt-1 font-sans font-light"
            />
          </div>
        </div>
        <div>
          <Label className="font-sans text-sm font-light">
            Uwaga pod godzinami (opcjonalna)
          </Label>
          <Input
            value={current.contactNote}
            onChange={(e) =>
              setForm({ ...current, contactNote: e.target.value })
            }
            placeholder="np. W sprawach pilnych prosimy o kontakt telefoniczny."
            className="mt-1 font-sans font-light"
          />
        </div>
      </div>

      {/* COMMON DOCS */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-light text-foreground">
          Najczęściej wymagane dokumenty
        </h3>
        <div className="space-y-2 mb-2">
          {current.commonDocuments.map((doc, i) => (
            <div
              key={`doc-${i}-${doc}`}
              className="flex items-center gap-2"
              data-ocid={`kancelaria.documents.row.${i + 1}`}
            >
              <span className="flex-1 font-sans text-sm font-light">{doc}</span>
              <button
                type="button"
                onClick={() =>
                  setForm({
                    ...current,
                    commonDocuments: current.commonDocuments.filter(
                      (_, j) => j !== i,
                    ),
                  })
                }
                className="text-muted-foreground hover:text-destructive transition-colors"
                data-ocid={`kancelaria.documents.delete_button.${i + 1}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newDoc}
            onChange={(e) => setNewDoc(e.target.value)}
            placeholder="Nowy dokument…"
            className="flex-1 font-sans font-light h-8 text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && newDoc.trim()) {
                setForm({
                  ...current,
                  commonDocuments: [...current.commonDocuments, newDoc.trim()],
                });
                setNewDoc("");
              }
            }}
            data-ocid="kancelaria.documents.input"
          />
          <button
            type="button"
            onClick={() => {
              if (newDoc.trim()) {
                setForm({
                  ...current,
                  commonDocuments: [...current.commonDocuments, newDoc.trim()],
                });
                setNewDoc("");
              }
            }}
            className="rounded-lg border border-border bg-muted px-2.5 py-1 text-xs font-sans hover:bg-muted/70 transition-colors"
            data-ocid="kancelaria.documents.primary_button"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ANNOUNCEMENT */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-light text-foreground">
          Komunikat
        </h3>
        <div className="flex items-center gap-3">
          <Switch
            checked={current.announcementVisible}
            onCheckedChange={(v) =>
              setForm({ ...current, announcementVisible: v })
            }
            data-ocid="kancelaria.announcement.switch"
          />
          <Label className="font-sans text-sm font-light">
            Pokaż komunikat na stronie
          </Label>
        </div>
        <Textarea
          value={current.announcement}
          onChange={(e) =>
            setForm({ ...current, announcement: e.target.value })
          }
          rows={3}
          placeholder="np. W czasie kolędy kancelaria może być nieczynna."
          className="font-sans font-light"
          data-ocid="kancelaria.announcement.textarea"
        />
      </div>

      {/* CLOSING */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-light text-foreground">
          Blok końcowy
        </h3>
        <div>
          <Label className="font-sans text-sm font-light">Nagłówek</Label>
          <Input
            value={current.closingTitle}
            onChange={(e) =>
              setForm({ ...current, closingTitle: e.target.value })
            }
            className="mt-1 font-sans font-light"
            data-ocid="kancelaria.closing.input"
          />
        </div>
        <div>
          <Label className="font-sans text-sm font-light">Tekst</Label>
          <Textarea
            value={current.closingText}
            onChange={(e) =>
              setForm({ ...current, closingText: e.target.value })
            }
            rows={2}
            className="mt-1 font-sans font-light"
            data-ocid="kancelaria.closing.textarea"
          />
        </div>
      </div>

      <Button
        onClick={() => mutate(current)}
        disabled={isPending}
        size="sm"
        className="font-sans font-light"
        data-ocid="kancelaria.meta.save_button"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        Zapisz dane
      </Button>
    </div>
  );
}

// ============================================================
// MAIN TAB
// ============================================================

export function KancelariaTab() {
  const { identity } = useInternetIdentity();
  if (!identity) {
    return (
      <div
        className="py-12 text-center font-sans text-sm font-light text-muted-foreground"
        data-ocid="kancelaria.access_denied.panel"
      >
        Zaloguj się, aby zarządzać kancelarią.
      </div>
    );
  }

  return (
    <div className="space-y-12 py-6" data-ocid="kancelaria.admin.panel">
      <div className="rounded-2xl border border-border bg-card p-6">
        <HeroSection />
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <HoursSection />
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <MattersSection />
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <MetaSection />
      </div>
    </div>
  );
}
