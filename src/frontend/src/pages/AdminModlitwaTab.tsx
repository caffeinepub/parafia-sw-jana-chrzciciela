import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Archive,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Save,
  Trash2,
  X,
} from "lucide-react";
import React, { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { LiturgyWeek } from "../backend";
import { useActor } from "../hooks/useActor";
import { getWeekDates, getWeekId } from "../hooks/useLiturgy";
import type { MassIntention, ModlitwaConfig, PrayerStar } from "./ModlitwaPage";
import {
  loadConfig,
  loadMassIntentions,
  loadPrayers,
  saveConfig,
  saveMassIntentions,
  savePrayers,
} from "./ModlitwaPage";

// ============================================================
// LITURGY INTEGRATION HELPERS
// ============================================================

const LS_KEY = "liturgy_weeks";

function loadAllLiturgyWeeks(): Record<string, LiturgyWeek> {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const all = JSON.parse(raw) as Record<string, unknown>;
    const result: Record<string, LiturgyWeek> = {};
    for (const [weekId, weekRaw] of Object.entries(all)) {
      try {
        const w = weekRaw as Record<string, unknown>;
        result[weekId] = {
          id: weekId,
          weekStart: (w.weekStart as string) || "",
          weekEnd: (w.weekEnd as string) || "",
          heroTitle: (w.heroTitle as string) || "",
          heroSubtitle: (w.heroSubtitle as string) || "",
          heroDescription: (w.heroDescription as string) || "",
          days: ((w.days as unknown[]) || []).map((day) => {
            const d = day as Record<string, unknown>;
            return {
              dayIndex: BigInt((d.dayIndex as string | number) ?? 0),
              entries: ((d.entries as unknown[]) || []).map((e) => {
                const entry = e as Record<string, unknown>;
                return {
                  id: (entry.id as string) || "",
                  time: (entry.time as string) || "",
                  entryType: (entry.entryType as string) || "",
                  serviceType: (entry.serviceType as string) || "",
                  description: (entry.description as string) || "",
                  intention: (entry.intention as string) || "",
                  order: BigInt((entry.order as string | number) ?? 0),
                };
              }),
            };
          }),
        } as LiturgyWeek;
      } catch {
        // skip malformed weeks
      }
    }
    return result;
  } catch {
    return {};
  }
}

function saveLiturgyWeekToLS(week: LiturgyWeek): void {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const all = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    all[week.id] = {
      ...week,
      days: week.days.map((day) => ({
        ...day,
        dayIndex: day.dayIndex.toString(),
        entries: day.entries.map((e) => ({
          ...e,
          order: e.order.toString(),
        })),
      })),
    };
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch {
    // storage unavailable
  }
}

// ============================================================
// PRAYER MODERATION
// ============================================================

function PrayersTab() {
  const [prayers, setPrayers] = useState<PrayerStar[]>(loadPrayers);

  const pending = prayers.filter((p) => !p.isApproved && !p.isHidden);
  const approved = prayers.filter((p) => p.isApproved && !p.isHidden);
  const hidden = prayers.filter((p) => p.isHidden);

  const approve = useCallback((id: string) => {
    setPrayers((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, isApproved: true } : p,
      );
      savePrayers(updated);
      return updated;
    });
    toast.success("Modlitwa zatwierdzona.");
  }, []);

  const remove = useCallback((id: string) => {
    setPrayers((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      savePrayers(updated);
      return updated;
    });
    toast.success("Wpis usunięty.");
  }, []);

  const toggleHidden = useCallback((id: string) => {
    setPrayers((prev) => {
      const updated = prev.map((p) =>
        p.id === id ? { ...p, isHidden: !p.isHidden } : p,
      );
      savePrayers(updated);
      return updated;
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-amber-600">{pending.length}</span>{" "}
          oczekujących ·{" "}
          <span className="font-medium text-green-600">{approved.length}</span>{" "}
          zatwierdzonych
        </p>
      </div>

      {prayers.length === 0 && (
        <div
          className="text-center py-10 text-muted-foreground text-sm"
          data-ocid="admin.prayers.empty_state"
        >
          Brak modlitw.
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Oczekujące
          </h3>
          <div className="space-y-2" data-ocid="admin.prayers.pending.list">
            {pending.map((prayer, idx) => (
              <div
                key={prayer.id}
                className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card"
                data-ocid={`admin.prayers.pending.item.${idx + 1}`}
              >
                <div
                  className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                  style={{ background: prayer.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">
                      {prayer.name || "Anonim"}
                    </span>
                    {prayer.city && (
                      <span className="text-xs text-muted-foreground">
                        {prayer.city}
                      </span>
                    )}
                  </div>
                  {prayer.intention && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {prayer.intention}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/50 mt-1">
                    {new Date(prayer.joinedAt).toLocaleDateString("pl-PL")}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                    onClick={() => approve(prayer.id)}
                    title="Zatwierdź"
                    data-ocid={`admin.prayers.approve.button.${idx + 1}`}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => toggleHidden(prayer.id)}
                    title="Ukryj"
                    data-ocid={`admin.prayers.hide.button.${idx + 1}`}
                  >
                    <EyeOff className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    onClick={() => remove(prayer.id)}
                    title="Usuń"
                    data-ocid={`admin.prayers.delete.button.${idx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {approved.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Zatwierdzone
          </h3>
          <div className="space-y-2">
            {approved.map((prayer, idx) => (
              <div
                key={prayer.id}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ background: prayer.color }}
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-foreground">
                    {prayer.name || "Anonim"}
                  </span>
                  {prayer.city && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {prayer.city}
                    </span>
                  )}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-muted-foreground"
                    onClick={() => toggleHidden(prayer.id)}
                    data-ocid={`admin.prayers.toggle.button.${idx + 1}`}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    onClick={() => remove(prayer.id)}
                    data-ocid={`admin.prayers.del.button.${idx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hidden.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Ukryte
          </h3>
          <div
            className="space-y-2 opacity-60"
            data-ocid="admin.prayers.hidden.list"
          >
            {hidden.map((prayer, idx) => (
              <div
                key={prayer.id}
                className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card"
                data-ocid={`admin.prayers.hidden.item.${idx + 1}`}
              >
                <div
                  className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                  style={{ background: prayer.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">
                      {prayer.name || "Anonim"}
                    </span>
                    {prayer.city && (
                      <span className="text-xs text-muted-foreground">
                        {prayer.city}
                      </span>
                    )}
                  </div>
                  {prayer.intention && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {prayer.intention}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground/50 mt-1">
                    {new Date(prayer.joinedAt).toLocaleDateString("pl-PL")}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-50"
                    onClick={() => {
                      toggleHidden(prayer.id);
                      toast.success("Modlitwa przywrócona.");
                    }}
                    title="Przywróć"
                    data-ocid={`admin.prayers.restore.button.${idx + 1}`}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                    onClick={() => remove(prayer.id)}
                    title="Usuń"
                    data-ocid={`admin.prayers.hidden.delete.button.${idx + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// MASS INTENTIONS TAB
// ============================================================

function MassIntentionsTab() {
  const { actor } = useActor();
  const [intentions, setIntentions] =
    useState<MassIntention[]>(loadMassIntentions);
  const [liturgyWeeks, setLiturgyWeeks] = useState<Record<string, LiturgyWeek>>(
    {},
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Assign selection state
  const [assignDate, setAssignDate] = useState("");
  const [assignTime, setAssignTime] = useState("");

  useEffect(() => {
    setLiturgyWeeks(loadAllLiturgyWeeks());
  }, []);

  // Reset date/time fields when assignment panel opens for a different intention
  // biome-ignore lint/correctness/useExhaustiveDependencies: expandedId change triggers form reset
  useEffect(() => {
    setAssignDate("");
    setAssignTime("");
  }, [expandedId]);

  const pending = intentions.filter((i) => i.status === "pending");
  const approved = intentions.filter((i) => i.status === "approved");
  const rejected = intentions.filter((i) => i.status === "rejected");

  const updateIntention = useCallback(
    (id: string, changes: Partial<MassIntention>) => {
      setIntentions((prev) => {
        const updated = prev.map((i) =>
          i.id === id ? { ...i, ...changes } : i,
        );
        saveMassIntentions(updated);
        return updated;
      });
    },
    [],
  );

  const handleApprove = useCallback(
    (id: string) => {
      updateIntention(id, { status: "approved" });
      toast.success("Intencja zatwierdzona.");
    },
    [updateIntention],
  );

  const handleReject = useCallback(
    (id: string) => {
      updateIntention(id, { status: "rejected" });
      toast.success("Intencja odrzucona.");
    },
    [updateIntention],
  );

  const handleRemove = useCallback(
    (id: string) => {
      const intentionToRemove = intentions.find((i) => i.id === id);
      // Remove from intentions list
      setIntentions((prev) => {
        const updated = prev.filter((i) => i.id !== id);
        saveMassIntentions(updated);
        return updated;
      });
      // Also remove from liturgy schedule if it was assigned there
      if (
        intentionToRemove?.assignedWeekId &&
        intentionToRemove?.assignedEntryId
      ) {
        const allWeeks = loadAllLiturgyWeeks();
        const week = allWeeks[intentionToRemove.assignedWeekId];
        if (week) {
          const updatedWeek: LiturgyWeek = {
            ...week,
            days: week.days.map((d) => ({
              ...d,
              entries: d.entries.filter(
                (e) => e.id !== intentionToRemove.assignedEntryId,
              ),
            })),
          };
          saveLiturgyWeekToLS(updatedWeek);
          setLiturgyWeeks((prev) => ({
            ...prev,
            [intentionToRemove.assignedWeekId!]: updatedWeek,
          }));
          // Also save to backend
          void (async () => {
            try {
              const a = actor;
              if (a) await a.saveLiturgyWeek(updatedWeek);
            } catch {
              /* silent */
            }
          })();
        }
      }
      toast.success("Wpis usunięty.");
    },
    [intentions, actor],
  );

  const handleMarkOffering = useCallback(
    (id: string, paid: boolean) => {
      updateIntention(id, { offeringStatus: paid ? "paid" : "pending" });
      toast.success(
        paid ? "Ofiara oznaczona jako złożona." : "Status ofiary zmieniony.",
      );
    },
    [updateIntention],
  );

  const handleAssignToMass = useCallback(
    (intentionId: string) => {
      if (!assignDate || !assignTime) {
        toast.error("Wybierz datę i godzinę Mszy Świętej.");
        return;
      }

      const intention = intentions.find((i) => i.id === intentionId);
      if (!intention) return;

      // Derive weekId and dayIndex from the chosen date
      const [year, month, day] = assignDate.split("-").map(Number);
      const chosenDate = new Date(year, month - 1, day);
      const weekId = getWeekId(chosenDate);
      // dayIndex: Monday=0 ... Sunday=6
      const jsDay = chosenDate.getDay(); // 0=Sun, 1=Mon ... 6=Sat
      const dayIdx = jsDay === 0 ? 6 : jsDay - 1;

      // Get or create the week in liturgyWeeks
      let week = liturgyWeeks[weekId];
      if (!week) {
        const { start, end } = getWeekDates(weekId);
        const fmt = (d: Date) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          return `${y}-${m}-${dd}`;
        };
        week = {
          id: weekId,
          weekStart: fmt(start),
          weekEnd: fmt(end),
          heroTitle: "",
          heroSubtitle: "",
          heroDescription: "",
          days: Array.from({ length: 7 }, (_, i) => ({
            dayIndex: BigInt(i),
            entries: [],
          })),
        } as LiturgyWeek;
      }

      // Create new entry for this intention
      const newEntryId = `assigned-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newEntry = {
        id: newEntryId,
        time: assignTime,
        entryType: "msza" as const,
        serviceType: "",
        description: "",
        intention: intention.intention,
        order: BigInt(0),
      };

      const updatedWeek: LiturgyWeek = {
        ...week,
        days: week.days.map((d) => {
          if (Number(d.dayIndex) === dayIdx) {
            return {
              ...d,
              entries: [
                ...d.entries,
                { ...newEntry, order: BigInt(d.entries.length) },
              ],
            };
          }
          return d;
        }),
      };

      saveLiturgyWeekToLS(updatedWeek);
      setLiturgyWeeks((prev) => ({ ...prev, [weekId]: updatedWeek }));

      // Also save to backend so LiturgyPage picks it up (not just localStorage)
      void (async () => {
        try {
          const a = actor;
          if (a) {
            await a.saveLiturgyWeek(updatedWeek);
          }
        } catch {
          // Backend save failed — data is safe in localStorage
        }
      })();

      // Format date consistently (same format as ModlitwaPage.tsx)
      const massDateStr = chosenDate.toLocaleDateString("pl-PL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });

      updateIntention(intentionId, {
        assignedWeekId: weekId,
        assignedDayIndex: dayIdx,
        assignedEntryId: newEntryId,
        assignedMassTime: assignTime,
        assignedMassDate: massDateStr,
        status: "approved",
      });

      setExpandedId(null);
      setAssignDate("");
      setAssignTime("");
      toast.success(
        `Intencja przypisana do Mszy ${assignTime} (${massDateStr}).`,
      );
    },
    [assignDate, assignTime, intentions, liturgyWeeks, updateIntention, actor],
  );

  const renderIntentionCard = (
    intention: MassIntention,
    idx: number,
    showActions = true,
  ) => (
    <div
      key={intention.id}
      className="border border-border rounded-xl bg-card overflow-hidden"
      data-ocid={`admin.intentions.item.${idx + 1}`}
    >
      <div className="flex items-start gap-3 p-4">
        <div
          className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
          style={{ background: intention.color }}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-foreground">
              {intention.name}
            </span>
            {intention.status === "approved" && (
              <Badge className="text-xs bg-green-100 text-green-800 border-0">
                Zatwierdzona
              </Badge>
            )}
            {intention.status === "pending" && (
              <Badge variant="outline" className="text-xs">
                Oczekująca
              </Badge>
            )}
            {intention.status === "rejected" && (
              <Badge variant="destructive" className="text-xs">
                Odrzucona
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {intention.intention}
          </p>
          {intention.phone && (
            <p className="text-xs text-muted-foreground mt-0.5">
              📞 {intention.phone}
            </p>
          )}
          {intention.email && (
            <p className="text-xs text-muted-foreground mt-0.5">
              ✉️ {intention.email}
            </p>
          )}
          {intention.assignedMassDate && (
            <p className="text-xs text-blue-600 mt-1">
              📅 {intention.assignedMassDate} {intention.assignedMassTime}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge
              className="text-xs cursor-pointer"
              style={{
                background:
                  intention.offeringStatus === "paid"
                    ? "rgba(34,197,94,0.15)"
                    : "rgba(251,146,60,0.15)",
                color:
                  intention.offeringStatus === "paid" ? "#16a34a" : "#ea580c",
                border: "none",
              }}
              onClick={() =>
                handleMarkOffering(
                  intention.id,
                  intention.offeringStatus !== "paid",
                )
              }
              title="Kliknij aby zmienić status ofiary"
            >
              {intention.offeringStatus === "paid"
                ? "✔ Ofiara złożona"
                : "⏳ Ofiara oczekuje"}
            </Badge>
            <span className="text-xs text-muted-foreground/50">
              {new Date(intention.createdAt).toLocaleDateString("pl-PL")}
            </span>
          </div>
        </div>
        {showActions && (
          <div className="flex gap-1 flex-shrink-0">
            {intention.status === "pending" && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-green-600 hover:bg-green-50"
                onClick={() => handleApprove(intention.id)}
                title="Zatwierdź"
                data-ocid={`admin.intentions.approve.button.${idx + 1}`}
              >
                <Check className="w-4 h-4" />
              </Button>
            )}
            {intention.status !== "rejected" && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() =>
                  setExpandedId(
                    expandedId === intention.id ? null : intention.id,
                  )
                }
                title="Przypisz do Mszy"
                data-ocid={`admin.intentions.assign.button.${idx + 1}`}
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    expandedId === intention.id ? "rotate-180" : ""
                  }`}
                />
              </Button>
            )}
            {intention.status === "pending" && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-muted-foreground"
                onClick={() => handleReject(intention.id)}
                title="Odrzuć"
                data-ocid={`admin.intentions.reject.button.${idx + 1}`}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
              onClick={() => handleRemove(intention.id)}
              title="Usuń"
              data-ocid={`admin.intentions.delete.button.${idx + 1}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Assign to Mass panel */}
      {expandedId === intention.id && (
        <div
          className="px-4 pb-4 pt-2 border-t border-border"
          style={{ background: "rgba(0,0,0,0.03)" }}
        >
          <p className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">
            Przypisz do Mszy Świętej
          </p>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Data Mszy Świętej
              </Label>
              <Input
                type="date"
                value={assignDate}
                onChange={(e) => setAssignDate(e.target.value)}
                className="text-sm"
                data-ocid="admin.intentions.assign.date.input"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">
                Godzina Mszy Świętej
              </Label>
              <Input
                type="time"
                value={assignTime}
                onChange={(e) => setAssignTime(e.target.value)}
                className="text-sm"
                data-ocid="admin.intentions.assign.time.input"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => handleAssignToMass(intention.id)}
                disabled={!assignDate || !assignTime}
                className="flex-1"
                data-ocid="admin.intentions.assign.save_button"
              >
                <Save className="w-3 h-3 mr-1" /> Przypisz i zatwierdź
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setExpandedId(null);
                  setAssignDate("");
                  setAssignTime("");
                }}
                data-ocid="admin.intentions.assign.cancel_button"
              >
                Anuluj
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-amber-600">{pending.length}</span>{" "}
          oczekujących ·{" "}
          <span className="font-medium text-green-600">{approved.length}</span>{" "}
          zatwierdzonych
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setIntentions((prev) => {
              const updated = prev.map((i) =>
                i.status === "approved" || i.status === "rejected"
                  ? { ...i, status: "archived" as const }
                  : i,
              );
              saveMassIntentions(updated);
              return updated;
            });
            toast.success("Zatwierdzone intencje zarchiwizowane.");
          }}
          disabled={approved.length === 0}
          className="gap-2"
          data-ocid="admin.intentions.archive.button"
        >
          <Archive className="w-4 h-4" /> Archiwizuj zatwierdzone
        </Button>
      </div>

      {intentions.length === 0 && (
        <div
          className="text-center py-10 text-muted-foreground text-sm"
          data-ocid="admin.intentions.empty_state"
        >
          Brak intencji mszalnych.
        </div>
      )}

      {pending.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Oczekujące na zatwierdzenie
          </h3>
          <div className="space-y-2">
            {pending.map((int, idx) => renderIntentionCard(int, idx))}
          </div>
        </div>
      )}

      {approved.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Zatwierdzone
          </h3>
          <div className="space-y-2">
            {approved.map((int, idx) => renderIntentionCard(int, idx))}
          </div>
        </div>
      )}

      {rejected.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
            Odrzucone
          </h3>
          <div className="space-y-2 opacity-60">
            {rejected.map((int, idx) => renderIntentionCard(int, idx, true))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// CONFIG TAB
// ============================================================

function ConfigTab() {
  const [cfg, setCfg] = useState<ModlitwaConfig>(loadConfig);
  const [saved, setSaved] = useState(false);

  const handleSave = useCallback(() => {
    saveConfig(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    toast.success("Konfiguracja zapisana.");
  }, [cfg]);

  return (
    <div className="space-y-6 max-w-lg">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Teksty hero</h3>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Nagłówek</Label>
            <Input
              value={cfg.heroTitle}
              onChange={(e) =>
                setCfg((d) => ({ ...d, heroTitle: e.target.value }))
              }
              className="mt-1"
              data-ocid="admin.modlitwa.config.title.input"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Podtytuł</Label>
            <Input
              value={cfg.heroSubtitle}
              onChange={(e) =>
                setCfg((d) => ({ ...d, heroSubtitle: e.target.value }))
              }
              className="mt-1"
              data-ocid="admin.modlitwa.config.subtitle.input"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Opis</Label>
            <Textarea
              value={cfg.heroDescription}
              onChange={(e) =>
                setCfg((d) => ({ ...d, heroDescription: e.target.value }))
              }
              rows={3}
              className="mt-1"
              data-ocid="admin.modlitwa.config.desc.textarea"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">Dane do ofiary</h3>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">
              Nazwa właściciela konta
            </Label>
            <Input
              value={cfg.bankOwner}
              onChange={(e) =>
                setCfg((d) => ({ ...d, bankOwner: e.target.value }))
              }
              className="mt-1"
              data-ocid="admin.modlitwa.config.bankowner.input"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Numer konta</Label>
            <Input
              value={cfg.accountNumber}
              onChange={(e) =>
                setCfg((d) => ({ ...d, accountNumber: e.target.value }))
              }
              className="mt-1 font-mono"
              data-ocid="admin.modlitwa.config.account.input"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-foreground">
          Komunikat końcowy
        </h3>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Tytuł</Label>
            <Input
              value={cfg.thankYouTitle}
              onChange={(e) =>
                setCfg((d) => ({ ...d, thankYouTitle: e.target.value }))
              }
              className="mt-1"
              data-ocid="admin.modlitwa.config.thanktitle.input"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Tekst</Label>
            <Textarea
              value={cfg.thankYouText}
              onChange={(e) =>
                setCfg((d) => ({ ...d, thankYouText: e.target.value }))
              }
              rows={2}
              className="mt-1"
              data-ocid="admin.modlitwa.config.thanktext.textarea"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={handleSave}
        className="gap-2"
        data-ocid="admin.modlitwa.config.save_button"
      >
        {saved ? (
          <>
            <Check className="w-4 h-4" /> Zapisano
          </>
        ) : (
          <>
            <Save className="w-4 h-4" /> Zapisz konfiguracje
          </>
        )}
      </Button>
    </div>
  );
}

// ============================================================
// MAIN EXPORT
// ============================================================

export function ModlitwaTab() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-light text-foreground">
          Modlitwa – Sanktuarium
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Zarządzaj modlitwami, intencjami mszalnymi i konfiguracją sekcji.
        </p>
      </div>

      <Tabs defaultValue="intentions">
        <TabsList className="w-full">
          <TabsTrigger
            value="intentions"
            className="flex-1"
            data-ocid="admin.modlitwa.tab.intentions"
          >
            Intencje mszalne
          </TabsTrigger>
          <TabsTrigger
            value="prayers"
            className="flex-1"
            data-ocid="admin.modlitwa.tab.prayers"
          >
            Modlące się
          </TabsTrigger>
          <TabsTrigger
            value="config"
            className="flex-1"
            data-ocid="admin.modlitwa.tab.config"
          >
            Konfiguracja
          </TabsTrigger>
        </TabsList>
        <TabsContent value="intentions" className="mt-6">
          <MassIntentionsTab />
        </TabsContent>
        <TabsContent value="prayers" className="mt-6">
          <PrayersTab />
        </TabsContent>
        <TabsContent value="config" className="mt-6">
          <ConfigTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
