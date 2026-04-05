import { C as createLucideIcon, D as useLiturgy, F as useActor, R as React, G as getRegistrations, H as loadRegistrationsFromBackend, j as jsxRuntimeExports, J as BookOpen, B as Button, K as ChevronDown, f as Badge, i as ue, M as lsLoadAll, N as ensureAllDays, O as parseMinistersFromDescription, Q as serializeMinistersToDescription, U as lsSaveWeek, V as saveRegistrations, W as syncRegistrationsToBackend } from "./index-CJw8i4Cr.js";
import { T as Trash2 } from "./trash-2-bnm1AKKe.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "M10 14 21 3", key: "gplh6r" }],
  ["path", { d: "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6", key: "a6xqqp" }]
];
const ExternalLink = createLucideIcon("external-link", __iconNode);
function AdminLiturgiaTab() {
  const { week, saveWeek } = useLiturgy();
  const { actor } = useActor();
  const [registrations, setRegistrations] = React.useState([]);
  const [showApproved, setShowApproved] = React.useState(false);
  const [showRejected, setShowRejected] = React.useState(false);
  const refreshRegs = React.useCallback(() => {
    setRegistrations(getRegistrations());
  }, []);
  React.useEffect(() => {
    refreshRegs();
  }, [refreshRegs]);
  React.useEffect(() => {
    if (!actor) return;
    void loadRegistrationsFromBackend(actor).then((merged) => {
      if (merged) setRegistrations(merged);
    });
  }, [actor]);
  const pending = registrations.filter((r) => r.status === "pending");
  const approved = registrations.filter((r) => r.status === "approved");
  const rejected = registrations.filter((r) => r.status === "rejected");
  const handleApprove = async (reg) => {
    if (!week) {
      ue.error("Nie załadowano tygodnia liturgicznego.");
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
              order: BigInt(e.order)
            }))
          }))
        };
      }
    }
    if (!targetWeek) {
      ue.error("Nie znaleziono tygodnia liturgicznego dla tej intencji.");
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
            ministers.psalmists
          )
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
      const regs = getRegistrations().map(
        (r) => r.id === reg.id ? { ...r, status: "approved" } : r
      );
      saveRegistrations(regs);
      void syncRegistrationsToBackend(actor, regs);
      refreshRegs();
      ue.success(`${reg.name} (${reg.role}) został zatwierdzony.`);
    } catch {
      ue.error("Błąd podczas zatwierdzania.");
    }
  };
  const handleReject = (reg) => {
    const regs = getRegistrations().map(
      (r) => r.id === reg.id ? { ...r, status: "rejected" } : r
    );
    saveRegistrations(regs);
    void syncRegistrationsToBackend(actor, regs);
    refreshRegs();
    ue.success("Zgłoszenie odrzucone.");
  };
  const handleDelete = (reg) => {
    const regs = getRegistrations().filter((r) => r.id !== reg.id);
    saveRegistrations(regs);
    void syncRegistrationsToBackend(actor, regs);
    refreshRegs();
  };
  const roleBadge = (role) => /* @__PURE__ */ jsxRuntimeExports.jsx(
    Badge,
    {
      variant: "secondary",
      className: `font-sans text-xs font-medium ${role === "lektor" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"}`,
      children: role === "lektor" ? "Lektor" : "Psalmista"
    }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-light text-foreground", children: "Liturgia" }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm text-muted-foreground leading-relaxed", children: "Zarządzaj tygodniowym grafikiem intencji mszalnych i nabożeństw. Edycja odbywa się bezpośrednio na stronie zakładki Liturgia." }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-card border border-border rounded-xl p-6 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-5 h-5 text-muted-foreground" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-base font-light text-foreground", children: "Grafik liturgiczny" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm font-light text-muted-foreground", children: "Dodawaj Msze i nabożeństwa, edytuj godziny i intencje, generuj PDF do wydruku." })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "a",
        {
          href: "/liturgia",
          onClick: (e) => {
            e.preventDefault();
            window.history.pushState({}, "", "/liturgia");
            window.dispatchEvent(new PopStateEvent("popstate"));
          },
          className: "inline-flex items-center gap-2 font-sans text-sm font-light text-primary hover:text-primary/80 transition-colors",
          "data-ocid": "admin.liturgia.link",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(ExternalLink, { className: "w-3.5 h-3.5" }),
            "Przejdź do zakładki Liturgia"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-light text-foreground border-b border-border/40 pb-3", children: "Lektorzy i Psalmiści" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-sans text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground", children: [
          "Oczekujące (",
          pending.length,
          ")"
        ] }),
        pending.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "bg-muted/30 rounded-xl p-5 text-center",
            "data-ocid": "admin.liturgia.minister.empty_state",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm font-light text-muted-foreground", children: "Brak oczekujących zgłoszeń." })
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: pending.map((reg, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3",
            "data-ocid": `admin.liturgia.minister.item.${i + 1}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-sans text-sm font-medium text-foreground", children: reg.name }),
                  roleBadge(reg.role)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-sans text-xs font-light text-muted-foreground", children: [
                  reg.massDate,
                  " · ",
                  reg.massTime
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 shrink-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "font-sans font-light text-xs h-8 border-emerald-500/40 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20",
                    onClick: () => handleApprove(reg),
                    "data-ocid": `admin.liturgia.minister.confirm_button.${i + 1}`,
                    children: "Zatwierdź"
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "outline",
                    className: "font-sans font-light text-xs h-8 border-destructive/40 text-destructive hover:bg-destructive/10",
                    onClick: () => handleReject(reg),
                    "data-ocid": `admin.liturgia.minister.delete_button.${i + 1}`,
                    children: "Odrzuć"
                  }
                )
              ] })
            ]
          },
          reg.id
        )) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            className: "flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors",
            onClick: () => setShowApproved((v) => !v),
            "data-ocid": "admin.liturgia.minister.toggle",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ChevronDown,
                {
                  className: `w-3.5 h-3.5 transition-transform ${showApproved ? "rotate-180" : ""}`
                }
              ),
              "Zatwierdzone (",
              approved.length,
              ")"
            ]
          }
        ),
        showApproved && approved.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: approved.map((reg, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "bg-muted/30 border border-border/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 opacity-80",
            "data-ocid": `admin.liturgia.minister.approved.item.${i + 1}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-sans text-sm font-medium text-foreground", children: reg.name }),
                  roleBadge(reg.role),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Badge,
                    {
                      variant: "outline",
                      className: "font-sans text-xs font-light text-emerald-600 border-emerald-500/40",
                      children: "zatwierdzone"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-sans text-xs font-light text-muted-foreground", children: [
                  reg.massDate,
                  " · ",
                  reg.massTime
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  className: "font-sans font-light text-xs h-8 text-muted-foreground hover:text-destructive shrink-0",
                  onClick: () => handleDelete(reg),
                  "data-ocid": `admin.liturgia.minister.approved.delete_button.${i + 1}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
                }
              )
            ]
          },
          reg.id
        )) })
      ] }),
      rejected.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            className: "flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors",
            onClick: () => setShowRejected((v) => !v),
            "data-ocid": "admin.liturgia.minister.rejected.toggle",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                ChevronDown,
                {
                  className: `w-3.5 h-3.5 transition-transform ${showRejected ? "rotate-180" : ""}`
                }
              ),
              "Odrzucone (",
              rejected.length,
              ")"
            ]
          }
        ),
        showRejected && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: rejected.map((reg, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "bg-muted/20 border border-border/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 opacity-60",
            "data-ocid": `admin.liturgia.minister.rejected.item.${i + 1}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0 space-y-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-sans text-sm font-medium text-foreground line-through", children: reg.name }),
                  roleBadge(reg.role)
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-sans text-xs font-light text-muted-foreground", children: [
                  reg.massDate,
                  " · ",
                  reg.massTime
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  className: "font-sans font-light text-xs h-8 text-muted-foreground hover:text-destructive shrink-0",
                  onClick: () => handleDelete(reg),
                  "data-ocid": `admin.liturgia.minister.rejected.delete_button.${i + 1}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
                }
              )
            ]
          },
          reg.id
        )) })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-muted/40 rounded-xl p-4 border border-border/60", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-sans text-xs text-muted-foreground leading-relaxed", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "font-medium text-foreground/70", children: "Wskazówka:" }),
      " ",
      "Po zalogowaniu, na stronie Liturgii pojawią się przyciski edycji przy każdym dniu tygodnia. Możesz dodawać Msze i nabożeństwa, usuwać wpisy oraz generować piękny PDF do wywieszenia w kościele."
    ] }) })
  ] });
}
export {
  AdminLiturgiaTab
};
