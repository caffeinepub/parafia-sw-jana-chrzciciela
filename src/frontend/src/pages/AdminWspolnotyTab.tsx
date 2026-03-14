import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import {
  type Community,
  DEFAULT_META,
  type WspolnotyMeta,
  useAllCommunities,
  useWspolnotyMeta,
} from "./WspolnotyPage";

const CONTENT_KEY = "communities";
const META_KEY = "wspolnotyMeta";

// ============================================================
// ACTOR REF
// ============================================================

function useActorRef() {
  const { actor, isFetching } = useActor();
  const actorRef = React.useRef<any>(null);
  const fetchingRef = React.useRef<boolean>(true);
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
// HELPERS
// ============================================================

function generateId() {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

async function saveCommunities(actor: any, communities: Community[]) {
  await actor.updateContentBlock(CONTENT_KEY, JSON.stringify(communities));
}

async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 800;
        let { width, height } = img;
        if (width > maxW) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("No canvas context"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================
// MUTATIONS
// ============================================================

function useCreateCommunity() {
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (community: Community) => {
      const a = await waitForActor(actorRef, fetchingRef);
      const current: Community[] =
        queryClient.getQueryData(["communities"]) ?? [];
      const updated = [...current, community].sort((x, y) => x.order - y.order);
      await saveCommunities(a, updated);
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["communities"], updated);
      toast.success("Wspólnota dodana");
    },
    onError: (err) => {
      console.error("createCommunity error", err);
      toast.error("Błąd zapisu");
    },
  });
}

function useUpdateCommunity() {
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      community,
    }: { id: string; community: Community }) => {
      const a = await waitForActor(actorRef, fetchingRef);
      const current: Community[] =
        queryClient.getQueryData(["communities"]) ?? [];
      const updated = current
        .map((c) => (c.id === id ? { ...community, id } : c))
        .sort((x, y) => x.order - y.order);
      await saveCommunities(a, updated);
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["communities"], updated);
      toast.success("Wspólnota zaktualizowana");
    },
    onError: (err) => {
      console.error("updateCommunity error", err);
      toast.error("Błąd zapisu");
    },
  });
}

function useDeleteCommunity() {
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const a = await waitForActor(actorRef, fetchingRef);
      const current: Community[] =
        queryClient.getQueryData(["communities"]) ?? [];
      const updated = current.filter((c) => c.id !== id);
      await saveCommunities(a, updated);
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["communities"], updated);
      toast.success("Wspólnota usunięta");
    },
    onError: (err) => {
      console.error("deleteCommunity error", err);
      toast.error("Błąd usuwania");
    },
  });
}

// ============================================================
// FORM
// ============================================================

const EMPTY_FORM = {
  name: "",
  shortDescription: "",
  fullDescription: "",
  meetingDay: "",
  meetingTime: "",
  meetingPlace: "",
  caretaker: "",
  contactPhone: "",
  contactEmail: "",
  order: "0",
  heroImageUrl: "",
};

type FormData = typeof EMPTY_FORM;

function CommunityForm({
  initial,
  onSave,
  onCancel,
  isPending,
}: {
  initial?: Community;
  onSave: (data: FormData) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [form, setForm] = useState<FormData>(
    initial
      ? {
          name: initial.name,
          shortDescription: initial.shortDescription,
          fullDescription: initial.fullDescription,
          meetingDay: initial.meetingDay,
          meetingTime: initial.meetingTime,
          meetingPlace: initial.meetingPlace,
          caretaker: initial.caretaker,
          contactPhone: initial.contactPhone,
          contactEmail: initial.contactEmail,
          order: String(initial.order),
          heroImageUrl: initial.heroImageUrl ?? "",
        }
      : { ...EMPTY_FORM },
  );
  const [imageLoading, setImageLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set =
    (key: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageLoading(true);
    try {
      const dataUrl = await compressImage(file);
      setForm((prev) => ({ ...prev, heroImageUrl: dataUrl }));
    } catch (err) {
      console.error("Image compression error", err);
      toast.error("Błąd wczytywania zdjęcia");
    } finally {
      setImageLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Image upload */}
      <div className="space-y-2">
        <Label className="font-sans text-sm font-light">Zdjęcie główne</Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
          data-ocid="wspolnoty.form.upload_button"
        />
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="w-24 h-24 rounded-xl border border-border overflow-hidden bg-muted/30 flex-shrink-0 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            {imageLoading ? (
              <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
            ) : form.heroImageUrl ? (
              <img
                src={form.heroImageUrl}
                alt="Podgląd"
                className="w-full h-full object-cover"
              />
            ) : (
              <ImagePlus className="w-6 h-6 text-muted-foreground/40" />
            )}
          </button>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-sans font-light text-sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={imageLoading}
            >
              {imageLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ImagePlus className="w-4 h-4 mr-2" />
              )}
              {form.heroImageUrl ? "Zmień zdjęcie" : "Dodaj zdjęcie"}
            </Button>
            {form.heroImageUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="font-sans font-light text-sm text-muted-foreground"
                onClick={() =>
                  setForm((prev) => ({ ...prev, heroImageUrl: "" }))
                }
              >
                <X className="w-4 h-4 mr-1" /> Usuń zdjęcie
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <Label className="font-sans text-sm font-light">Nazwa *</Label>
          <Input
            value={form.name}
            onChange={set("name")}
            placeholder="np. Ministranci"
            className="font-sans font-light"
            data-ocid="wspolnoty.form.input"
          />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label className="font-sans text-sm font-light">Krótki opis</Label>
          <Input
            value={form.shortDescription}
            onChange={set("shortDescription")}
            placeholder="Jedno zdanie o wspólnocie"
            className="font-sans font-light"
          />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label className="font-sans text-sm font-light">Pełny opis</Label>
          <Textarea
            value={form.fullDescription}
            onChange={set("fullDescription")}
            placeholder="Pełna historia i opis wspólnoty…"
            className="font-sans font-light min-h-[120px]"
            data-ocid="wspolnoty.form.textarea"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-sans text-sm font-light">Dzień spotkań</Label>
          <Input
            value={form.meetingDay}
            onChange={set("meetingDay")}
            placeholder="np. Środa"
            className="font-sans font-light"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-sans text-sm font-light">Godzina</Label>
          <Input
            value={form.meetingTime}
            onChange={set("meetingTime")}
            placeholder="np. 19:00"
            className="font-sans font-light"
          />
        </div>
        <div className="sm:col-span-2 space-y-1.5">
          <Label className="font-sans text-sm font-light">
            Miejsce spotkań
          </Label>
          <Input
            value={form.meetingPlace}
            onChange={set("meetingPlace")}
            placeholder="np. Sala parafialna"
            className="font-sans font-light"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-sans text-sm font-light">Opiekun</Label>
          <Input
            value={form.caretaker}
            onChange={set("caretaker")}
            placeholder="np. ks. Jan Kowalski"
            className="font-sans font-light"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-sans text-sm font-light">Kolejność</Label>
          <Input
            type="number"
            value={form.order}
            onChange={set("order")}
            className="font-sans font-light"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-sans text-sm font-light">Telefon</Label>
          <Input
            value={form.contactPhone}
            onChange={set("contactPhone")}
            placeholder="np. +48 123 456 789"
            className="font-sans font-light"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="font-sans text-sm font-light">Email</Label>
          <Input
            value={form.contactEmail}
            onChange={set("contactEmail")}
            placeholder="np. wspolnota@parafia.pl"
            className="font-sans font-light"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="font-sans font-light"
          data-ocid="wspolnoty.form.cancel_button"
        >
          Anuluj
        </Button>
        <Button
          onClick={() => onSave(form)}
          disabled={isPending || !form.name.trim()}
          className="font-sans font-light"
          data-ocid="wspolnoty.form.submit_button"
        >
          {isPending ? "Zapisywanie…" : "Zapisz"}
        </Button>
      </div>
    </div>
  );
}

// ============================================================
// META EDITOR
// ============================================================

function WspolnotyMetaEditor() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: metaData } = useWspolnotyMeta();
  const [metaForm, setMetaForm] = useState<WspolnotyMeta>({ ...DEFAULT_META });
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (metaData) {
      setMetaForm({ ...DEFAULT_META, ...metaData });
    }
  }, [metaData]);

  const saveMeta = useMutation({
    mutationFn: async (form: WspolnotyMeta) => {
      const a = await waitForActor(actorRef, fetchingRef);
      await a.updateContentBlock(META_KEY, JSON.stringify(form));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wspolnotyMeta"] });
      toast.success("Teksty zakładki zapisane");
    },
    onError: (err) => {
      console.error("saveMeta error", err);
      toast.error("Błąd zapisu tekstów");
    },
  });

  const setField =
    (key: keyof WspolnotyMeta) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setMetaForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors font-sans text-sm font-medium text-foreground"
        onClick={() => setIsOpen((v) => !v)}
        data-ocid="wspolnoty.meta.toggle"
      >
        <span>Teksty zakładki „Wspólnoty"</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 space-y-4 bg-card">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="font-sans text-sm font-light">
                Podtytuł hero (główny tekst pod nagłówkiem)
              </Label>
              <Textarea
                value={metaForm.heroSubtitle}
                onChange={setField("heroSubtitle")}
                className="font-sans font-light min-h-[60px]"
                data-ocid="wspolnoty.meta.herosubtitle.textarea"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="font-sans text-sm font-light">
                Opis hero (mniejszy tekst)
              </Label>
              <Textarea
                value={metaForm.heroDescription}
                onChange={setField("heroDescription")}
                className="font-sans font-light min-h-[60px]"
                data-ocid="wspolnoty.meta.herodescription.textarea"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-sm font-light">
                Podpis nad mapą (mały)
              </Label>
              <Input
                value={metaForm.mapLabel}
                onChange={setField("mapLabel")}
                className="font-sans font-light"
                data-ocid="wspolnoty.meta.maplabel.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-sm font-light">
                Tytuł sekcji mapy
              </Label>
              <Input
                value={metaForm.mapTitle}
                onChange={setField("mapTitle")}
                className="font-sans font-light"
                data-ocid="wspolnoty.meta.maptitle.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-sm font-light">
                Centrum mapy – linia 1
              </Label>
              <Input
                value={metaForm.centerLine1}
                onChange={setField("centerLine1")}
                className="font-sans font-light"
                data-ocid="wspolnoty.meta.centerline1.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-sm font-light">
                Centrum mapy – linia 2
              </Label>
              <Input
                value={metaForm.centerLine2}
                onChange={setField("centerLine2")}
                className="font-sans font-light"
                data-ocid="wspolnoty.meta.centerline2.input"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="font-sans text-sm font-light">
                Tytuł sekcji zaproszenia
              </Label>
              <Input
                value={metaForm.invitationTitle}
                onChange={setField("invitationTitle")}
                className="font-sans font-light"
                data-ocid="wspolnoty.meta.invitationtitle.input"
              />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="font-sans text-sm font-light">
                Tekst sekcji zaproszenia
              </Label>
              <Textarea
                value={metaForm.invitationText}
                onChange={setField("invitationText")}
                className="font-sans font-light min-h-[60px]"
                data-ocid="wspolnoty.meta.invitationtext.textarea"
              />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <Button
              onClick={() => saveMeta.mutate(metaForm)}
              disabled={saveMeta.isPending}
              className="font-sans font-light"
              data-ocid="wspolnoty.meta.save_button"
            >
              {saveMeta.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {saveMeta.isPending ? "Zapisywanie…" : "Zapisz teksty"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MAIN TAB
// ============================================================

export function WspolnotyTab() {
  const { data: communities = [], isLoading } = useAllCommunities();
  const createCommunity = useCreateCommunity();
  const updateCommunity = useUpdateCommunity();
  const deleteCommunity = useDeleteCommunity();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Community | null>(null);

  const handleSave = (form: FormData) => {
    const communityData: Community = {
      id: editing?.id ?? generateId(),
      name: form.name,
      shortDescription: form.shortDescription,
      fullDescription: form.fullDescription,
      meetingDay: form.meetingDay,
      meetingTime: form.meetingTime,
      meetingPlace: form.meetingPlace,
      caretaker: form.caretaker,
      contactPhone: form.contactPhone,
      contactEmail: form.contactEmail,
      order: Number(form.order) || 0,
      heroImageUrl: form.heroImageUrl || undefined,
    };

    if (editing) {
      updateCommunity.mutate(
        { id: editing.id, community: communityData },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setEditing(null);
          },
        },
      );
    } else {
      createCommunity.mutate(communityData, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setEditing(null);
        },
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Meta editor at top */}
      <WspolnotyMetaEditor />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-extralight text-foreground">
            Wspólnoty
          </h2>
          <p className="font-sans text-sm text-muted-foreground mt-1">
            Zarządzaj wspólnotami parafialnymi
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setIsDialogOpen(true);
          }}
          className="font-sans font-light rounded-full"
          data-ocid="wspolnoty.add.primary_button"
        >
          <Plus className="w-4 h-4 mr-2" /> Dodaj wspólnotę
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3" data-ocid="wspolnoty.list.loading_state">
          {Array.from({ length: 3 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
            <Skeleton key={`sk-${i}`} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : communities.length === 0 ? (
        <div
          className="text-center py-16 rounded-2xl border border-dashed border-border"
          data-ocid="wspolnoty.list.empty_state"
        >
          <p className="font-sans text-muted-foreground text-sm">
            Brak wspólnot. Dodaj pierwszą.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {communities.map((community, i) => (
            <div
              key={community.id}
              className="bg-card border border-border rounded-xl overflow-hidden"
              data-ocid={`wspolnoty.item.${i + 1}`}
            >
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {community.heroImageUrl && (
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={community.heroImageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium text-foreground truncate">
                      {community.name}
                    </p>
                    {community.shortDescription && (
                      <p className="font-sans text-xs text-muted-foreground truncate mt-0.5">
                        {community.shortDescription}
                      </p>
                    )}
                    {community.meetingDay && (
                      <p className="font-sans text-xs text-muted-foreground/60 mt-0.5">
                        {community.meetingDay} {community.meetingTime}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditing(community);
                      setIsDialogOpen(true);
                    }}
                    className="rounded-full w-8 h-8"
                    data-ocid={`wspolnoty.item.edit_button.${i + 1}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        data-ocid={`wspolnoty.item.delete_button.${i + 1}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-display font-light">
                          Usuń wspólnotę
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-sans font-light">
                          Czy na pewno chcesz usunąć „{community.name}"? Tej
                          operacji nie można cofnąć.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel
                          className="font-sans font-light"
                          data-ocid="wspolnoty.delete.cancel_button"
                        >
                          Anuluj
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteCommunity.mutate(community.id)}
                          className="font-sans font-light bg-destructive hover:bg-destructive/90"
                          data-ocid="wspolnoty.delete.confirm_button"
                        >
                          Usuń
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setEditing(null);
        }}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="wspolnoty.form.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display font-light text-xl">
              {editing ? "Edytuj wspólnotę" : "Nowa wspólnota"}
            </DialogTitle>
          </DialogHeader>
          <CommunityForm
            initial={editing ?? undefined}
            onSave={handleSave}
            onCancel={() => {
              setIsDialogOpen(false);
              setEditing(null);
            }}
            isPending={createCommunity.isPending || updateCommunity.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
