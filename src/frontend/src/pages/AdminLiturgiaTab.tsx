import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronDown, ExternalLink, Trash2 } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { useActor } from "../hooks/useActor";
import {
  ensureAllDays,
  lsLoadAll,
  lsSaveWeek,
  useLiturgy,
} from "../hooks/useLiturgy";
import {
  type MinisterRegistration,
  getRegistrations,
  loadRegistrationsFromBackend,
  parseMinistersFromDescription,
  saveRegistrations,
  serializeMinistersToDescription,
  syncRegistrationsToBackend,
} from "../hooks/useMinisterRegistrations";

export function AdminLiturgiaTab() {
  const { week, saveWeek } = useLiturgy();
  const { actor } = useActor();
  const [registrations, setRegistrations] = React.useState<
    MinisterRegistration[]
  >([]);
  const [showApproved, setShowApproved] = React.useState(false);
  const [showRejected, setShowRejected] = React.useState(false);

  const refreshRegs = React.useCallback(() => {
    setRegistrations(getRegistrations());
  }, []);

  // Load from localStorage immediately
  React.useEffect(() => {
    refreshRegs();
  }, [refreshRegs]);

  // Load from backend on mount (backend is authoritative)
  React.useEffect(() => {
    if (!actor) return;
    void loadRegistrationsFromBackend(actor).then((merged) => {
      if (merged) setRegistrations(merged);
    });
  }, [actor]);

  const pending = registrations.filter((r) => r.status === "pending");
  const approved = registrations.filter((r) => r.status === "approved");
  const rejected = registrations.filter((r) => r.status === "rejected");

  const handleApprove = async (reg: MinisterRegistration) => {
    if (!week) {
      toast.error("Nie załadowano tygodnia liturgicznego.");
      return;
    }

    let targetWeek = week.id === reg.weekId ? week : null;
    if (!targetWeek) {
      const all = lsLoadAll();
      const raw = all[reg.weekId];
      if (raw) {
        targetWeek = {
          ...raw,
          days: raw.days.map((d) => ({
            dayIndex: BigInt(d.dayIndex),
            entries: d.entries.map((e) => ({
              ...e,
              order: BigInt(e.order),
            })),
          })),
        };
      }
    }

    if (!targetWeek) {
      toast.error("Nie znaleziono tygodnia liturgicznego dla tej intencji.");
      return;
    }

    const updatedDays = ensureAllDays(targetWeek).days.map((d) => {
      if (Number(d.dayIndex) !== reg.dayIndex) return d;
      const entries = d.entries.map((e) => {
        if (e.id !== reg.entryId) return e;
        const ministers = parseMinistersFromDescription(e.description);
        if (reg.role === "lektor") {
          if (!ministers.lectors.includes(reg.name)) {
            ministers.lectors.push(reg.name);
          }
        } else {
          if (!ministers.psalmists.includes(reg.name)) {
            ministers.psalmists.push(reg.name);
          }
        }
        return {
          ...e,
          description: serializeMinistersToDescription(
            ministers.lectors,
            ministers.psalmists,
          ),
        };
      });
      return { ...d, entries };
    });

    const updatedWeek = { ...targetWeek, days: updatedDays };

    try {
      if (week.id === reg.weekId) {
        await saveWeek(updatedWeek);
      } else {
        lsSaveWeek(updatedWeek);
      }

      const regs = getRegistrations().map((r) =>
        r.id === reg.id ? { ...r, status: "approved" as const } : r,
      );
      saveRegistrations(regs);
      void syncRegistrationsToBackend(actor, regs);
      refreshRegs();
      toast.success(`${reg.name} (${reg.role}) został zatwierdzony.`);
    } catch {
      toast.error("Błąd podczas zatwierdzania.");
    }
  };

  const handleReject = (reg: MinisterRegistration) => {
    const regs = getRegistrations().map((r) =>
      r.id === reg.id ? { ...r, status: "rejected" as const } : r,
    );
    saveRegistrations(regs);
    void syncRegistrationsToBackend(actor, regs);
    refreshRegs();
    toast.success("Zgłoszenie odrzucone.");
  };

  const handleDelete = (reg: MinisterRegistration) => {
    const regs = getRegistrations().filter((r) => r.id !== reg.id);
    saveRegistrations(regs);
    void syncRegistrationsToBackend(actor, regs);
    refreshRegs();
  };

  const roleBadge = (role: "lektor" | "psalmista") => (
    <Badge
      variant="secondary"
      className={`font-sans text-xs font-medium ${role === "lektor" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"}`}
    >
      {role === "lektor" ? "Lektor" : "Psalmista"}
    </Badge>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-light text-foreground">
          Liturgia
        </h2>
      </div>

      <p className="font-sans text-sm text-muted-foreground leading-relaxed">
        Zarządzaj tygodniowym grafikiem intencji mszalnych i nabożeństw. Edycja
        odbywa się bezpośrednio na stronie zakładki Liturgia.
      </p>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="font-display text-base font-light text-foreground">
              Grafik liturgiczny
            </p>
            <p className="font-sans text-sm font-light text-muted-foreground">
              Dodawaj Msze i nabożeństwa, edytuj godziny i intencje, generuj PDF
              do wydruku.
            </p>
          </div>
        </div>

        <a
          href="/liturgia"
          onClick={(e) => {
            e.preventDefault();
            window.history.pushState({}, "", "/liturgia");
            window.dispatchEvent(new PopStateEvent("popstate"));
          }}
          className="inline-flex items-center gap-2 font-sans text-sm font-light text-primary hover:text-primary/80 transition-colors"
          data-ocid="admin.liturgia.link"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Przejdź do zakładki Liturgia
        </a>
      </div>

      <div className="space-y-4">
        <h3 className="font-display text-lg font-light text-foreground border-b border-border/40 pb-3">
          Lektorzy i Psalmiści
        </h3>

        {/* Pending */}
        <div className="space-y-3">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Oczekujące ({pending.length})
          </p>
          {pending.length === 0 ? (
            <div
              className="bg-muted/30 rounded-xl p-5 text-center"
              data-ocid="admin.liturgia.minister.empty_state"
            >
              <p className="font-sans text-sm font-light text-muted-foreground">
                Brak oczekujących zgłoszeń.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {pending.map((reg, i) => (
                <div
                  key={reg.id}
                  className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3"
                  data-ocid={`admin.liturgia.minister.item.${i + 1}`}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-sans text-sm font-medium text-foreground">
                        {reg.name}
                      </span>
                      {roleBadge(reg.role)}
                    </div>
                    <p className="font-sans text-xs font-light text-muted-foreground">
                      {reg.massDate} · {reg.massTime}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="font-sans font-light text-xs h-8 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                      onClick={() => handleApprove(reg)}
                      data-ocid={`admin.liturgia.minister.confirm_button.${i + 1}`}
                    >
                      Zatwierdź
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="font-sans font-light text-xs h-8 border-destructive/40 text-destructive hover:bg-destructive/10"
                      onClick={() => handleReject(reg)}
                      data-ocid={`admin.liturgia.minister.delete_button.${i + 1}`}
                    >
                      Odrzuć
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved */}
        <div className="space-y-3">
          <button
            type="button"
            className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setShowApproved((v) => !v)}
            data-ocid="admin.liturgia.minister.toggle"
          >
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${showApproved ? "rotate-180" : ""}`}
            />
            Zatwierdzone ({approved.length})
          </button>
          {showApproved && approved.length > 0 && (
            <div className="space-y-2">
              {approved.map((reg, i) => (
                <div
                  key={reg.id}
                  className="bg-muted/30 border border-border/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 opacity-80"
                  data-ocid={`admin.liturgia.minister.approved.item.${i + 1}`}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-sans text-sm font-medium text-foreground">
                        {reg.name}
                      </span>
                      {roleBadge(reg.role)}
                      <Badge
                        variant="outline"
                        className="font-sans text-xs font-light text-emerald-600 border-emerald-500/40"
                      >
                        zatwierdzone
                      </Badge>
                    </div>
                    <p className="font-sans text-xs font-light text-muted-foreground">
                      {reg.massDate} · {reg.massTime}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="font-sans font-light text-xs h-8 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => handleDelete(reg)}
                    data-ocid={`admin.liturgia.minister.approved.delete_button.${i + 1}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rejected */}
        {rejected.length > 0 && (
          <div className="space-y-3">
            <button
              type="button"
              className="flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowRejected((v) => !v)}
              data-ocid="admin.liturgia.minister.rejected.toggle"
            >
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showRejected ? "rotate-180" : ""}`}
              />
              Odrzucone ({rejected.length})
            </button>
            {showRejected && (
              <div className="space-y-2">
                {rejected.map((reg, i) => (
                  <div
                    key={reg.id}
                    className="bg-muted/20 border border-border/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 opacity-60"
                    data-ocid={`admin.liturgia.minister.rejected.item.${i + 1}`}
                  >
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-sans text-sm font-medium text-foreground line-through">
                          {reg.name}
                        </span>
                        {roleBadge(reg.role)}
                      </div>
                      <p className="font-sans text-xs font-light text-muted-foreground">
                        {reg.massDate} · {reg.massTime}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="font-sans font-light text-xs h-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => handleDelete(reg)}
                      data-ocid={`admin.liturgia.minister.rejected.delete_button.${i + 1}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-muted/40 rounded-xl p-4 border border-border/60">
        <p className="font-sans text-xs text-muted-foreground leading-relaxed">
          <strong className="font-medium text-foreground/70">Wskazówka:</strong>{" "}
          Po zalogowaniu, na stronie Liturgii pojawią się przyciski edycji przy
          każdym dniu tygodnia. Możesz dodawać Msze i nabożeństwa, usuwać wpisy
          oraz generować piękny PDF do wywieszenia w kościele.
        </p>
      </div>
    </div>
  );
}
