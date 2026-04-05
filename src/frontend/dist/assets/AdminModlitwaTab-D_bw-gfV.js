import { C as createLucideIcon, j as jsxRuntimeExports, a9 as Tabs, aa as TabsList, ab as TabsTrigger, ac as TabsContent, F as useActor, r as reactExports, ad as loadMassIntentions, ae as intentionFromBackend, af as saveMassIntentions, ag as intentionToBackend, i as ue, ah as getWeekId, ai as getWeekDates, B as Button, aj as loadPrayers, ak as prayerFromBackend, al as savePrayers, am as prayerToBackend, an as Check, A as EyeOff, z as Eye, ao as loadConfig, ap as saveConfig, L as Label, I as Input, T as Textarea, d as Save, f as Badge, K as ChevronDown, X } from "./index-DKYgLZIG.js";
import { T as Trash2 } from "./trash-2-bEPXptws.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["rect", { width: "20", height: "5", x: "2", y: "3", rx: "1", key: "1wp1u1" }],
  ["path", { d: "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8", key: "1s80jp" }],
  ["path", { d: "M10 12h4", key: "a56b0p" }]
];
const Archive = createLucideIcon("archive", __iconNode);
const LS_KEY = "liturgy_weeks";
function loadAllLiturgyWeeks() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const all = JSON.parse(raw);
    const result = {};
    for (const [weekId, weekRaw] of Object.entries(all)) {
      try {
        const w = weekRaw;
        result[weekId] = {
          id: weekId,
          weekStart: w.weekStart || "",
          weekEnd: w.weekEnd || "",
          heroTitle: w.heroTitle || "",
          heroSubtitle: w.heroSubtitle || "",
          heroDescription: w.heroDescription || "",
          days: (w.days || []).map((day) => {
            const d = day;
            return {
              dayIndex: BigInt(d.dayIndex ?? 0),
              entries: (d.entries || []).map((e) => {
                const entry = e;
                return {
                  id: entry.id || "",
                  time: entry.time || "",
                  entryType: entry.entryType || "",
                  serviceType: entry.serviceType || "",
                  description: entry.description || "",
                  intention: entry.intention || "",
                  order: BigInt(entry.order ?? 0)
                };
              })
            };
          })
        };
      } catch {
      }
    }
    return result;
  } catch {
    return {};
  }
}
function saveLiturgyWeekToLS(week) {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[week.id] = {
      ...week,
      days: week.days.map((day) => ({
        ...day,
        dayIndex: day.dayIndex.toString(),
        entries: day.entries.map((e) => ({
          ...e,
          order: e.order.toString()
        }))
      }))
    };
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch {
  }
}
function PrayersTab() {
  const { actor } = useActor();
  const [prayers, setPrayers] = reactExports.useState(loadPrayers);
  reactExports.useEffect(() => {
    if (!actor) return;
    void actor.getPrayerStars().then((backendPrayers) => {
      if (backendPrayers.length > 0 || loadPrayers().length === 0) {
        const converted = backendPrayers.map(prayerFromBackend);
        savePrayers(converted);
        setPrayers(converted);
      }
    }).catch(() => {
    });
  }, [actor]);
  const pending = prayers.filter((p) => !p.isApproved && !p.isHidden);
  const approved = prayers.filter((p) => p.isApproved && !p.isHidden);
  const hidden = prayers.filter((p) => p.isHidden);
  const approve = reactExports.useCallback(
    (id) => {
      setPrayers((prev) => {
        const updated = prev.map(
          (p) => p.id === id ? { ...p, isApproved: true } : p
        );
        savePrayers(updated);
        const approvedStar = updated.find((p) => p.id === id);
        if (approvedStar) {
          void (async () => {
            try {
              if (actor)
                await actor.savePrayerStar(prayerToBackend(approvedStar));
            } catch {
            }
          })();
        }
        return updated;
      });
      ue.success("Modlitwa zatwierdzona.");
    },
    [actor]
  );
  const remove = reactExports.useCallback(
    (id) => {
      setPrayers((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        savePrayers(updated);
        return updated;
      });
      void (async () => {
        try {
          if (actor) await actor.deletePrayerStar(id);
        } catch {
        }
      })();
      ue.success("Wpis usunięty.");
    },
    [actor]
  );
  const toggleHidden = reactExports.useCallback(
    (id) => {
      setPrayers((prev) => {
        const updated = prev.map(
          (p) => p.id === id ? { ...p, isHidden: !p.isHidden } : p
        );
        savePrayers(updated);
        const toggled = updated.find((p) => p.id === id);
        if (toggled) {
          void (async () => {
            try {
              if (actor) await actor.savePrayerStar(prayerToBackend(toggled));
            } catch {
            }
          })();
        }
        return updated;
      });
    },
    [actor]
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between flex-wrap gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-amber-600", children: pending.length }),
      " ",
      "oczekujących ·",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-green-600", children: approved.length }),
      " ",
      "zatwierdzonych"
    ] }) }),
    prayers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "text-center py-10 text-muted-foreground text-sm",
        "data-ocid": "admin.prayers.empty_state",
        children: "Brak modlitw."
      }
    ),
    pending.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-medium text-muted-foreground uppercase tracking-widest", children: "Oczekujące" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", "data-ocid": "admin.prayers.pending.list", children: pending.map((prayer, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-start gap-3 p-4 rounded-xl border border-border bg-card",
          "data-ocid": `admin.prayers.pending.item.${idx + 1}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "w-3 h-3 rounded-full mt-1 flex-shrink-0",
                style: { background: prayer.color }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: prayer.name || "Anonim" }),
                prayer.city && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: prayer.city })
              ] }),
              prayer.intention && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 line-clamp-2", children: prayer.intention }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/50 mt-1", children: new Date(prayer.joinedAt).toLocaleDateString("pl-PL") })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  className: "h-8 w-8 p-0 text-green-600 hover:bg-green-50",
                  onClick: () => approve(prayer.id),
                  title: "Zatwierdź",
                  "data-ocid": `admin.prayers.approve.button.${idx + 1}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  className: "h-8 w-8 p-0 text-muted-foreground hover:text-foreground",
                  onClick: () => toggleHidden(prayer.id),
                  title: "Ukryj",
                  "data-ocid": `admin.prayers.hide.button.${idx + 1}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  className: "h-8 w-8 p-0 text-destructive hover:bg-destructive/10",
                  onClick: () => remove(prayer.id),
                  title: "Usuń",
                  "data-ocid": `admin.prayers.delete.button.${idx + 1}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                }
              )
            ] })
          ]
        },
        prayer.id
      )) })
    ] }),
    approved.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-medium text-muted-foreground uppercase tracking-widest", children: "Zatwierdzone" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: approved.map((prayer, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center gap-3 p-4 rounded-xl border border-border bg-card/50",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "div",
              {
                className: "w-3 h-3 rounded-full flex-shrink-0",
                style: { background: prayer.color }
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm text-foreground", children: prayer.name || "Anonim" }),
              prayer.city && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground ml-2", children: prayer.city })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  className: "h-8 w-8 p-0 text-muted-foreground",
                  onClick: () => toggleHidden(prayer.id),
                  "data-ocid": `admin.prayers.toggle.button.${idx + 1}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  size: "sm",
                  variant: "ghost",
                  className: "h-8 w-8 p-0 text-destructive hover:bg-destructive/10",
                  onClick: () => remove(prayer.id),
                  "data-ocid": `admin.prayers.del.button.${idx + 1}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                }
              )
            ] })
          ]
        },
        prayer.id
      )) })
    ] }),
    hidden.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-medium text-muted-foreground uppercase tracking-widest", children: "Ukryte" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "space-y-2 opacity-60",
          "data-ocid": "admin.prayers.hidden.list",
          children: hidden.map((prayer, idx) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "div",
            {
              className: "flex items-start gap-3 p-4 rounded-xl border border-border bg-card",
              "data-ocid": `admin.prayers.hidden.item.${idx + 1}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: "w-3 h-3 rounded-full mt-1 flex-shrink-0",
                    style: { background: prayer.color }
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: prayer.name || "Anonim" }),
                    prayer.city && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: prayer.city })
                  ] }),
                  prayer.intention && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 line-clamp-2", children: prayer.intention }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground/50 mt-1", children: new Date(prayer.joinedAt).toLocaleDateString("pl-PL") })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-shrink-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "sm",
                      variant: "ghost",
                      className: "h-8 w-8 p-0 text-blue-600 hover:bg-blue-50",
                      onClick: () => {
                        toggleHidden(prayer.id);
                        ue.success("Modlitwa przywrócona.");
                      },
                      title: "Przywróć",
                      "data-ocid": `admin.prayers.restore.button.${idx + 1}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-4 h-4" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "sm",
                      variant: "ghost",
                      className: "h-8 w-8 p-0 text-destructive hover:bg-destructive/10",
                      onClick: () => remove(prayer.id),
                      title: "Usuń",
                      "data-ocid": `admin.prayers.hidden.delete.button.${idx + 1}`,
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                    }
                  )
                ] })
              ]
            },
            prayer.id
          ))
        }
      )
    ] })
  ] });
}
function MassIntentionsTab() {
  const { actor } = useActor();
  const [intentions, setIntentions] = reactExports.useState(loadMassIntentions);
  const [liturgyWeeks, setLiturgyWeeks] = reactExports.useState(
    {}
  );
  const [expandedId, setExpandedId] = reactExports.useState(null);
  const [assignDate, setAssignDate] = reactExports.useState("");
  const [assignTime, setAssignTime] = reactExports.useState("");
  reactExports.useEffect(() => {
    setLiturgyWeeks(loadAllLiturgyWeeks());
  }, []);
  reactExports.useEffect(() => {
    if (!actor) return;
    void actor.listLiturgyWeeks().then((weeks) => {
      if (!weeks || weeks.length === 0) return;
      const map = {};
      for (const w of weeks) {
        map[w.id] = w;
        saveLiturgyWeekToLS(w);
      }
      setLiturgyWeeks(map);
    }).catch(() => {
    });
  }, [actor]);
  reactExports.useEffect(() => {
    if (!actor) return;
    void actor.getMassIntentions().then((backendIntentions) => {
      if (backendIntentions.length > 0 || loadMassIntentions().length === 0) {
        const convertedInt = backendIntentions.map(intentionFromBackend);
        saveMassIntentions(convertedInt);
        setIntentions(convertedInt);
      }
    }).catch(() => {
    });
  }, [actor]);
  reactExports.useEffect(() => {
    setAssignDate("");
    setAssignTime("");
  }, [expandedId]);
  const pending = intentions.filter((i) => i.status === "pending");
  const approved = intentions.filter((i) => i.status === "approved");
  const rejected = intentions.filter((i) => i.status === "rejected");
  const updateIntention = reactExports.useCallback(
    (id, changes) => {
      setIntentions((prev) => {
        const updated = prev.map(
          (i) => i.id === id ? { ...i, ...changes } : i
        );
        saveMassIntentions(updated);
        const updatedItem = updated.find((i) => i.id === id);
        if (updatedItem) {
          void (async () => {
            try {
              if (actor)
                await actor.saveMassIntention(intentionToBackend(updatedItem));
            } catch {
            }
          })();
        }
        return updated;
      });
    },
    [actor]
  );
  const handleApprove = reactExports.useCallback(
    (id) => {
      updateIntention(id, { status: "approved" });
      ue.success("Intencja zatwierdzona.");
    },
    [updateIntention]
  );
  const handleReject = reactExports.useCallback(
    (id) => {
      updateIntention(id, { status: "rejected" });
      ue.success("Intencja odrzucona.");
    },
    [updateIntention]
  );
  const handleRemove = reactExports.useCallback(
    (id) => {
      const intentionToRemove = intentions.find((i) => i.id === id);
      setIntentions((prev) => {
        const updated = prev.filter((i) => i.id !== id);
        saveMassIntentions(updated);
        return updated;
      });
      void (async () => {
        try {
          if (actor) await actor.deleteMassIntention(id);
        } catch {
        }
      })();
      if ((intentionToRemove == null ? void 0 : intentionToRemove.assignedWeekId) && (intentionToRemove == null ? void 0 : intentionToRemove.assignedEntryId)) {
        const allWeeks = loadAllLiturgyWeeks();
        const week = allWeeks[intentionToRemove.assignedWeekId];
        if (week) {
          const updatedWeek = {
            ...week,
            days: week.days.map((d) => ({
              ...d,
              entries: d.entries.filter(
                (e) => e.id !== intentionToRemove.assignedEntryId
              )
            }))
          };
          saveLiturgyWeekToLS(updatedWeek);
          setLiturgyWeeks((prev) => ({
            ...prev,
            [intentionToRemove.assignedWeekId]: updatedWeek
          }));
          void (async () => {
            try {
              const a = actor;
              if (a) await a.saveLiturgyWeek(updatedWeek);
            } catch {
            }
          })();
        }
      }
      ue.success("Wpis usunięty.");
    },
    [intentions, actor]
  );
  const handleMarkOffering = reactExports.useCallback(
    (id, paid) => {
      updateIntention(id, { offeringStatus: paid ? "paid" : "pending" });
      ue.success(
        paid ? "Ofiara oznaczona jako złożona." : "Status ofiary zmieniony."
      );
    },
    [updateIntention]
  );
  const handleAssignToMass = reactExports.useCallback(
    (intentionId) => {
      if (!assignDate || !assignTime) {
        ue.error("Wybierz datę i godzinę Mszy Świętej.");
        return;
      }
      const intention = intentions.find((i) => i.id === intentionId);
      if (!intention) return;
      const [year, month, day] = assignDate.split("-").map(Number);
      const chosenDate = new Date(year, month - 1, day);
      const weekId = getWeekId(chosenDate);
      const jsDay = chosenDate.getDay();
      const dayIdx = jsDay === 0 ? 6 : jsDay - 1;
      let week = liturgyWeeks[weekId];
      if (!week) {
        const { start, end } = getWeekDates(weekId);
        const fmt = (d) => {
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
            entries: []
          }))
        };
      }
      const newEntryId = `assigned-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const newEntry = {
        id: newEntryId,
        time: assignTime,
        entryType: "msza",
        serviceType: "",
        description: "",
        intention: intention.intention,
        order: BigInt(0)
      };
      const updatedWeek = {
        ...week,
        days: week.days.map((d) => {
          if (Number(d.dayIndex) === dayIdx) {
            return {
              ...d,
              entries: [
                ...d.entries,
                { ...newEntry, order: BigInt(d.entries.length) }
              ]
            };
          }
          return d;
        })
      };
      saveLiturgyWeekToLS(updatedWeek);
      setLiturgyWeeks((prev) => ({ ...prev, [weekId]: updatedWeek }));
      void (async () => {
        try {
          const a = actor;
          if (a) {
            await a.saveLiturgyWeek(updatedWeek);
          }
        } catch {
        }
      })();
      const massDateStr = chosenDate.toLocaleDateString("pl-PL", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      });
      updateIntention(intentionId, {
        assignedWeekId: weekId,
        assignedDayIndex: dayIdx,
        assignedEntryId: newEntryId,
        assignedMassTime: assignTime,
        assignedMassDate: massDateStr,
        status: "approved"
      });
      setExpandedId(null);
      setAssignDate("");
      setAssignTime("");
      ue.success(
        `Intencja przypisana do Mszy ${assignTime} (${massDateStr}).`
      );
    },
    [assignDate, assignTime, intentions, liturgyWeeks, updateIntention, actor]
  );
  const renderIntentionCard = (intention, idx, showActions = true) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "border border-border rounded-xl bg-card overflow-hidden",
      "data-ocid": `admin.intentions.item.${idx + 1}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3 p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "div",
            {
              className: "w-3 h-3 rounded-full mt-1 flex-shrink-0",
              style: { background: intention.color }
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-medium text-foreground", children: intention.name }),
              intention.status === "approved" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { className: "text-xs bg-green-100 text-green-800 border-0", children: "Zatwierdzona" }),
              intention.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "outline", className: "text-xs", children: "Oczekująca" }),
              intention.status === "rejected" && /* @__PURE__ */ jsxRuntimeExports.jsx(Badge, { variant: "destructive", className: "text-xs", children: "Odrzucona" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground mt-1 line-clamp-2", children: intention.intention }),
            intention.phone && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
              "📞 ",
              intention.phone
            ] }),
            intention.email && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground mt-0.5", children: [
              "✉️ ",
              intention.email
            ] }),
            intention.assignedMassDate && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-blue-600 mt-1", children: [
              "📅 ",
              intention.assignedMassDate,
              " ",
              intention.assignedMassTime
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  className: "text-xs cursor-pointer",
                  style: {
                    background: intention.offeringStatus === "paid" ? "rgba(34,197,94,0.15)" : "rgba(251,146,60,0.15)",
                    color: intention.offeringStatus === "paid" ? "#16a34a" : "#ea580c",
                    border: "none"
                  },
                  onClick: () => handleMarkOffering(
                    intention.id,
                    intention.offeringStatus !== "paid"
                  ),
                  title: "Kliknij aby zmienić status ofiary",
                  children: intention.offeringStatus === "paid" ? "✔ Ofiara złożona" : "⏳ Ofiara oczekuje"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground/50", children: new Date(intention.createdAt).toLocaleDateString("pl-PL") })
            ] })
          ] }),
          showActions && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-1 flex-shrink-0", children: [
            intention.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "ghost",
                className: "h-8 w-8 p-0 text-green-600 hover:bg-green-50",
                onClick: () => handleApprove(intention.id),
                title: "Zatwierdź",
                "data-ocid": `admin.intentions.approve.button.${idx + 1}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4" })
              }
            ),
            intention.status !== "rejected" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "ghost",
                className: "h-8 w-8 p-0",
                onClick: () => setExpandedId(
                  expandedId === intention.id ? null : intention.id
                ),
                title: "Przypisz do Mszy",
                "data-ocid": `admin.intentions.assign.button.${idx + 1}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  ChevronDown,
                  {
                    className: `w-4 h-4 transition-transform ${expandedId === intention.id ? "rotate-180" : ""}`
                  }
                )
              }
            ),
            intention.status === "pending" && /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "ghost",
                className: "h-8 w-8 p-0 text-muted-foreground",
                onClick: () => handleReject(intention.id),
                title: "Odrzuć",
                "data-ocid": `admin.intentions.reject.button.${idx + 1}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "ghost",
                className: "h-8 w-8 p-0 text-destructive hover:bg-destructive/10",
                onClick: () => handleRemove(intention.id),
                title: "Usuń",
                "data-ocid": `admin.intentions.delete.button.${idx + 1}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
              }
            )
          ] })
        ] }),
        expandedId === intention.id && /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "px-4 pb-4 pt-2 border-t border-border",
            style: { background: "rgba(0,0,0,0.03)" },
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider", children: "Przypisz do Mszy Świętej" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground mb-1 block", children: "Data Mszy Świętej" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "date",
                      value: assignDate,
                      onChange: (e) => setAssignDate(e.target.value),
                      className: "text-sm",
                      "data-ocid": "admin.intentions.assign.date.input"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground mb-1 block", children: "Godzina Mszy Świętej" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Input,
                    {
                      type: "time",
                      value: assignTime,
                      onChange: (e) => setAssignTime(e.target.value),
                      className: "text-sm",
                      "data-ocid": "admin.intentions.assign.time.input"
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    Button,
                    {
                      size: "sm",
                      onClick: () => handleAssignToMass(intention.id),
                      disabled: !assignDate || !assignTime,
                      className: "flex-1",
                      "data-ocid": "admin.intentions.assign.save_button",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-3 h-3 mr-1" }),
                        " Przypisz i zatwierdź"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    Button,
                    {
                      size: "sm",
                      variant: "ghost",
                      onClick: () => {
                        setExpandedId(null);
                        setAssignDate("");
                        setAssignTime("");
                      },
                      "data-ocid": "admin.intentions.assign.cancel_button",
                      children: "Anuluj"
                    }
                  )
                ] })
              ] })
            ]
          }
        )
      ]
    },
    intention.id
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between flex-wrap gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-amber-600", children: pending.length }),
        " ",
        "oczekujących ·",
        " ",
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium text-green-600", children: approved.length }),
        " ",
        "zatwierdzonych"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          size: "sm",
          onClick: () => {
            setIntentions((prev) => {
              const updated = prev.map(
                (i) => i.status === "approved" || i.status === "rejected" ? { ...i, status: "archived" } : i
              );
              saveMassIntentions(updated);
              void (async () => {
                try {
                  if (actor) {
                    for (const item of updated.filter(
                      (i) => i.status === "archived"
                    )) {
                      await actor.saveMassIntention(intentionToBackend(item));
                    }
                  }
                } catch {
                }
              })();
              return updated;
            });
            ue.success("Zatwierdzone intencje zarchiwizowane.");
          },
          disabled: approved.length === 0,
          className: "gap-2",
          "data-ocid": "admin.intentions.archive.button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Archive, { className: "w-4 h-4" }),
            " Archiwizuj zatwierdzone"
          ]
        }
      )
    ] }),
    intentions.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "text-center py-10 text-muted-foreground text-sm",
        "data-ocid": "admin.intentions.empty_state",
        children: "Brak intencji mszalnych."
      }
    ),
    pending.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-medium text-muted-foreground uppercase tracking-widest", children: "Oczekujące na zatwierdzenie" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: pending.map((int, idx) => renderIntentionCard(int, idx)) })
    ] }),
    approved.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-medium text-muted-foreground uppercase tracking-widest", children: "Zatwierdzone" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: approved.map((int, idx) => renderIntentionCard(int, idx)) })
    ] }),
    rejected.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xs font-medium text-muted-foreground uppercase tracking-widest", children: "Odrzucone" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 opacity-60", children: rejected.map((int, idx) => renderIntentionCard(int, idx, true)) })
    ] })
  ] });
}
function ConfigTab() {
  const { actor } = useActor();
  const [cfg, setCfg] = reactExports.useState(loadConfig);
  const [saved, setSaved] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!actor) return;
    void actor.getModlitwaConfig().then((backendCfg) => {
      if (backendCfg) {
        saveConfig(backendCfg);
        setCfg(backendCfg);
      }
    }).catch(() => {
    });
  }, [actor]);
  const handleSave = reactExports.useCallback(() => {
    saveConfig(cfg);
    setSaved(true);
    setTimeout(() => setSaved(false), 2e3);
    ue.success("Konfiguracja zapisana.");
    void (async () => {
      try {
        if (actor) await actor.saveModlitwaConfig(cfg);
      } catch {
      }
    })();
  }, [cfg, actor]);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-lg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-foreground", children: "Teksty hero" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Nagłówek" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: cfg.heroTitle,
              onChange: (e) => setCfg((d) => ({ ...d, heroTitle: e.target.value })),
              className: "mt-1",
              "data-ocid": "admin.modlitwa.config.title.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Podtytuł" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: cfg.heroSubtitle,
              onChange: (e) => setCfg((d) => ({ ...d, heroSubtitle: e.target.value })),
              className: "mt-1",
              "data-ocid": "admin.modlitwa.config.subtitle.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Opis" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: cfg.heroDescription,
              onChange: (e) => setCfg((d) => ({ ...d, heroDescription: e.target.value })),
              rows: 3,
              className: "mt-1",
              "data-ocid": "admin.modlitwa.config.desc.textarea"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-foreground", children: "Dane do ofiary" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Nazwa właściciela konta" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: cfg.bankOwner,
              onChange: (e) => setCfg((d) => ({ ...d, bankOwner: e.target.value })),
              className: "mt-1",
              "data-ocid": "admin.modlitwa.config.bankowner.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Numer konta" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: cfg.accountNumber,
              onChange: (e) => setCfg((d) => ({ ...d, accountNumber: e.target.value })),
              className: "mt-1 font-mono",
              "data-ocid": "admin.modlitwa.config.account.input"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-sm font-medium text-foreground", children: "Komunikat końcowy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Tytuł" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: cfg.thankYouTitle,
              onChange: (e) => setCfg((d) => ({ ...d, thankYouTitle: e.target.value })),
              className: "mt-1",
              "data-ocid": "admin.modlitwa.config.thanktitle.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs text-muted-foreground", children: "Tekst" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: cfg.thankYouText,
              onChange: (e) => setCfg((d) => ({ ...d, thankYouText: e.target.value })),
              rows: 2,
              className: "mt-1",
              "data-ocid": "admin.modlitwa.config.thanktext.textarea"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Button,
      {
        onClick: handleSave,
        className: "gap-2",
        "data-ocid": "admin.modlitwa.config.save_button",
        children: saved ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-4 h-4" }),
          " Zapisano"
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
          " Zapisz konfiguracje"
        ] })
      }
    )
  ] });
}
function ModlitwaTab() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-light text-foreground", children: "Modlitwa – Sanktuarium" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground mt-1", children: "Zarządzaj modlitwami, intencjami mszalnymi i konfiguracją sekcji." })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "intentions", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "w-full", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabsTrigger,
          {
            value: "intentions",
            className: "flex-1",
            "data-ocid": "admin.modlitwa.tab.intentions",
            children: "Intencje mszalne"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabsTrigger,
          {
            value: "prayers",
            className: "flex-1",
            "data-ocid": "admin.modlitwa.tab.prayers",
            children: "Modlące się"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabsTrigger,
          {
            value: "config",
            className: "flex-1",
            "data-ocid": "admin.modlitwa.tab.config",
            children: "Konfiguracja"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "intentions", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MassIntentionsTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "prayers", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PrayersTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "config", className: "mt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ConfigTab, {}) })
    ] })
  ] });
}
export {
  ModlitwaTab
};
