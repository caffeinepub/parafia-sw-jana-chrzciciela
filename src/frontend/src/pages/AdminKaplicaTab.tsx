import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, Check, Pencil, Star, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useActor } from "../hooks/useActor";

// ============================================================
// TYPES
// ============================================================

interface PrayerIntention {
  id: string;
  name: string;
  title: string;
  content: string;
  email: string;
  visibility: string;
  status: string;
  date: string;
  prayerCount: bigint;
  featured: boolean;
}

type StatusFilter =
  | "all"
  | "pending"
  | "approved"
  | "private"
  | "assigned"
  | "rejected"
  | "archived";

const STATUS_LABELS: Record<string, string> = {
  pending: "Oczekująca",
  approved: "Publiczna",
  private: "Prywatna",
  assigned: "Przypisana do Mszy",
  rejected: "Odrzucona",
  archived: "Archiwalna",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  approved: "bg-green-100 text-green-800 border-green-300",
  private: "bg-blue-100 text-blue-800 border-blue-300",
  assigned: "bg-amber-100 text-amber-800 border-amber-300",
  rejected: "bg-red-100 text-red-800 border-red-300",
  archived: "bg-gray-100 text-gray-600 border-gray-300",
};

// ============================================================
// HOOKS
// ============================================================

function useAllIntentions() {
  const { actor, isFetching } = useActor();
  return useQuery<PrayerIntention[]>({
    queryKey: ["allIntentions"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        return (await (
          actor as any
        ).getAllPrayerIntentions()) as PrayerIntention[];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

function useAllContentBlocks() {
  const { actor, isFetching } = useActor();
  return useQuery<Record<string, string>>({
    queryKey: ["allContentBlocks"],
    queryFn: async () => {
      if (!actor) return {};
      try {
        const blocks = await actor.getAllContentBlocks();
        const map: Record<string, string> = {};
        for (const b of blocks) map[b.id] = b.content;
        return map;
      } catch {
        return {};
      }
    },
    enabled: !!actor && !isFetching,
  });
}

// ============================================================
// EDIT MODAL
// ============================================================

interface EditModalProps {
  intention: PrayerIntention | null;
  onClose: () => void;
  onSaved: () => void;
}

function EditModal({ intention, onClose, onSaved }: EditModalProps) {
  const { actor } = useActor();
  const [draft, setDraft] = useState<PrayerIntention | null>(intention);
  const [saving, setSaving] = useState(false);

  if (!draft) return null;

  const handleSave = async () => {
    if (!actor || !draft) return;
    setSaving(true);
    try {
      await (actor as any).updatePrayerIntention(draft.id, draft);
      onSaved();
      onClose();
    } catch {
      /* silent */
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!intention} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="max-w-lg rounded-2xl"
        data-ocid="admin.kaplica.edit.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display font-light">
            Edytuj intencję
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-light text-muted-foreground">
                Imię
              </Label>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background font-sans text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-light text-muted-foreground">
                Email
              </Label>
              <input
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background font-sans text-sm"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-light text-muted-foreground">
              Tytuł
            </Label>
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background font-sans text-sm"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-light text-muted-foreground">
              Treść
            </Label>
            <Textarea
              value={draft.content}
              onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              rows={4}
              className="font-sans text-sm resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-light text-muted-foreground">
                Status
              </Label>
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background font-sans text-sm"
              >
                {Object.keys(STATUS_LABELS).map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-light text-muted-foreground">
                Widoczność
              </Label>
              <select
                value={draft.visibility}
                onChange={(e) =>
                  setDraft({ ...draft, visibility: e.target.value })
                }
                className="w-full px-3 py-2 rounded-lg border border-border bg-background font-sans text-sm"
              >
                <option value="public">Publiczna</option>
                <option value="private">Prywatna</option>
              </select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            data-ocid="admin.kaplica.edit.cancel_button"
          >
            Anuluj
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            data-ocid="admin.kaplica.edit.save_button"
          >
            {saving ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// HERO TEXTS SECTION
// ============================================================

const KAPLICA_BLOCKS = [
  { key: "kaplica_hero_title", label: "Tytuł Hero" },
  { key: "kaplica_hero_subtitle", label: "Podtytuł Hero" },
  { key: "kaplica_hero_description", label: "Opis Hero" },
  { key: "kaplica_donation_title", label: "Tytuł Ofiary" },
  { key: "kaplica_donation_text", label: "Tekst Ofiary" },
  { key: "kaplica_account_number", label: "Numer konta" },
] as const;

function HeroTextsSection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const { data: allBlocks = {} } = useAllContentBlocks();

  const blocks = KAPLICA_BLOCKS.map((b) => ({
    ...b,
    value: allBlocks[b.key] ?? "",
  }));

  const handleSave = async (key: string) => {
    if (!actor) return;
    const value = drafts[key];
    if (value === undefined) return;
    setSaving(key);
    try {
      await actor.updateContentBlock(key, value);
      queryClient.invalidateQueries({ queryKey: ["allContentBlocks"] });
      setDrafts((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
    } catch {
      /* silent */
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="mb-8 p-5 rounded-2xl border border-border bg-card/50 space-y-4">
      <h3 className="font-display text-base font-light text-foreground">
        Teksty zakładki Kaplica
      </h3>
      {blocks.map((b) => (
        <div key={b.key} className="space-y-1">
          <Label className="text-xs font-light text-muted-foreground">
            {b.label}
          </Label>
          <div className="flex gap-2">
            <Textarea
              value={drafts[b.key] !== undefined ? drafts[b.key] : b.value}
              onChange={(e) =>
                setDrafts((prev) => ({ ...prev, [b.key]: e.target.value }))
              }
              rows={
                b.key.includes("account") || b.key.includes("description")
                  ? 3
                  : 1
              }
              className="font-sans text-sm resize-none flex-1"
            />
            {drafts[b.key] !== undefined && (
              <Button
                size="sm"
                onClick={() => handleSave(b.key)}
                disabled={saving === b.key}
                className="shrink-0 self-start"
              >
                {saving === b.key ? "..." : "Zapisz"}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// MAIN TAB
// ============================================================

export function KaplicaTab() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { data: intentions = [], isLoading } = useAllIntentions();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [editTarget, setEditTarget] = useState<PrayerIntention | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [actioning, setActioning] = useState<string | null>(null);

  const refetch = () =>
    queryClient.invalidateQueries({ queryKey: ["allIntentions"] });

  const doAction = async (id: string, action: () => Promise<void>) => {
    setActioning(id);
    try {
      await action();
      refetch();
    } catch {
      /* silent */
    } finally {
      setActioning(null);
    }
  };

  const setStatus = (id: string, status: string) =>
    doAction(id, () => (actor as any).updatePrayerIntentionStatus(id, status));

  const toggleFeatured = (intention: PrayerIntention) =>
    doAction(intention.id, () =>
      (actor as any).setFeaturedPrayerIntention(
        intention.id,
        !intention.featured,
      ),
    );

  const deleteIntention = async (id: string) => {
    if (!actor) return;
    setActioning(id);
    try {
      await (actor as any).deletePrayerIntention(id);
      refetch();
    } catch {
      /* silent */
    } finally {
      setActioning(null);
      setConfirmDelete(null);
    }
  };

  const FILTERS: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "Wszystkie" },
    { key: "pending", label: "Oczekujące" },
    { key: "approved", label: "Publiczne" },
    { key: "private", label: "Prywatne" },
    { key: "assigned", label: "Przypisane" },
    { key: "rejected", label: "Odrzucone" },
    { key: "archived", label: "Archiwalne" },
  ];

  const filtered =
    filter === "all"
      ? intentions
      : intentions.filter((i) => i.status === filter);

  return (
    <div className="space-y-6">
      <HeroTextsSection />

      <div>
        <h2 className="font-display text-xl font-light text-foreground mb-1">
          Moderacja intencji
        </h2>
        <p className="font-sans text-sm font-light text-muted-foreground mb-4">
          Zarządzaj intencjami złożonymi przez parafian
        </p>

        {/* Status filter tabs */}
        <div
          className="flex flex-wrap gap-1 mb-5"
          data-ocid="admin.kaplica.status.tab"
        >
          {FILTERS.map((f) => {
            const count =
              f.key === "all"
                ? intentions.length
                : intentions.filter((i) => i.status === f.key).length;
            return (
              <button
                type="button"
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-full text-xs font-sans font-light transition-all ${
                  filter === f.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {f.label}
                {count > 0 && (
                  <span className="ml-1.5 opacity-60">({count})</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Intentions list */}
        {isLoading ? (
          <div
            className="text-center py-8 text-muted-foreground text-sm"
            data-ocid="admin.kaplica.intentions.loading_state"
          >
            Ładowanie...
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="text-center py-8 text-muted-foreground text-sm"
            data-ocid="admin.kaplica.intentions.empty_state"
          >
            Brak intencji w tej kategorii
          </div>
        ) : (
          <div className="space-y-3" data-ocid="admin.kaplica.intentions.list">
            {filtered.map((intention, i) => (
              <div
                key={intention.id}
                className="rounded-2xl border border-border bg-card/60 p-4"
                data-ocid={`admin.kaplica.intentions.item.${i + 1}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-display text-sm font-light">
                        {intention.title}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs border ${
                          STATUS_COLORS[intention.status] ??
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {STATUS_LABELS[intention.status] ?? intention.status}
                      </span>
                      {intention.featured && (
                        <Badge
                          variant="outline"
                          className="text-xs border-amber-400/50 text-amber-600"
                        >
                          ⭐
                        </Badge>
                      )}
                    </div>
                    <p className="font-sans text-xs font-light text-muted-foreground line-clamp-2 mb-1">
                      {intention.content}
                    </p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground/60 font-sans">
                      <span>{intention.name || "Anonimowo"}</span>
                      {intention.email && <span>· {intention.email}</span>}
                      <span>· {intention.date}</span>
                      <span>· 🙏 {Number(intention.prayerCount)}</span>
                      <span>
                        ·{" "}
                        {intention.visibility === "public"
                          ? "Publiczna"
                          : "Prywatna"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 shrink-0">
                    {intention.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2 text-green-700 border-green-300 hover:bg-green-50"
                        onClick={() => setStatus(intention.id, "approved")}
                        disabled={actioning === intention.id}
                        data-ocid={`admin.kaplica.approve_button.${i + 1}`}
                      >
                        <Check className="w-3 h-3 mr-1" /> Zatwierdź
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2 text-amber-700 border-amber-300 hover:bg-amber-50"
                      onClick={() => setStatus(intention.id, "assigned")}
                      disabled={actioning === intention.id}
                    >
                      🙏 Przypisz do Mszy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`text-xs h-7 px-2 ${
                        intention.featured
                          ? "text-amber-600 border-amber-300"
                          : "text-muted-foreground"
                      }`}
                      onClick={() => toggleFeatured(intention)}
                      disabled={actioning === intention.id}
                    >
                      <Star
                        className={`w-3 h-3 mr-1 ${intention.featured ? "fill-amber-400" : ""}`}
                      />
                      {intention.featured ? "Odznacz" : "Wyróżnij"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2"
                      onClick={() => setEditTarget(intention)}
                      data-ocid={`admin.kaplica.edit_button.${i + 1}`}
                    >
                      <Pencil className="w-3 h-3 mr-1" /> Edytuj
                    </Button>
                    {intention.status !== "rejected" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2 text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => setStatus(intention.id, "rejected")}
                        disabled={actioning === intention.id}
                      >
                        <X className="w-3 h-3 mr-1" /> Odrzuć
                      </Button>
                    )}
                    {intention.status !== "archived" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-2 text-muted-foreground"
                        onClick={() => setStatus(intention.id, "archived")}
                        disabled={actioning === intention.id}
                      >
                        <Archive className="w-3 h-3 mr-1" /> Archiwizuj
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 px-2 text-destructive border-destructive/30 hover:bg-destructive/10"
                      onClick={() => setConfirmDelete(intention.id)}
                      data-ocid={`admin.kaplica.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      <EditModal
        intention={editTarget}
        onClose={() => setEditTarget(null)}
        onSaved={refetch}
      />

      {/* Delete confirm dialog */}
      <Dialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
      >
        <DialogContent
          className="max-w-sm rounded-2xl"
          data-ocid="admin.kaplica.delete.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display font-light">
              Usuń intencję
            </DialogTitle>
          </DialogHeader>
          <p className="font-sans text-sm font-light text-muted-foreground">
            Tej operacji nie można cofnąć. Czy na pewno chcesz usunąć tę
            intencję?
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(null)}
              data-ocid="admin.kaplica.delete.cancel_button"
            >
              Anuluj
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => confirmDelete && deleteIntention(confirmDelete)}
              disabled={!!actioning}
              data-ocid="admin.kaplica.delete.confirm_button"
            >
              Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
