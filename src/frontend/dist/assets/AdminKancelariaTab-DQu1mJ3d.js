import { Y as useInternetIdentity, j as jsxRuntimeExports, Z as useQueryClient, _ as useKancelariaMeta, r as reactExports, $ as useMutation, L as Label, I as Input, a0 as DEFAULT_KANCELARIA_META, T as Textarea, B as Button, d as Save, a1 as useKancelariaHours, a2 as DEFAULT_HOURS, S as Switch, P as Plus, a3 as useKancelariaMatters, a4 as DEFAULT_MATTERS, a5 as ChevronUp, K as ChevronDown, g as Pencil, X, F as useActor, R as React, i as ue, a6 as KANCELARIA_META_KEY, a7 as KANCELARIA_HOURS_KEY, a8 as KANCELARIA_MATTERS_KEY, E as ExternalBlob } from "./index-CJw8i4Cr.js";
import { L as LoaderCircle } from "./loader-circle-Cjz6SUfw.js";
import { T as Trash2 } from "./trash-2-bnm1AKKe.js";
import { U as Upload } from "./upload-ls2JlI_9.js";
function useActorRef() {
  const { actor, isFetching } = useActor();
  const actorRef = reactExports.useRef(null);
  const fetchingRef = reactExports.useRef(true);
  React.useEffect(() => {
    actorRef.current = actor;
    fetchingRef.current = isFetching;
  }, [actor, isFetching]);
  return { actorRef, fetchingRef };
}
async function waitForActor(actorRef, fetchingRef) {
  if (actorRef.current) return actorRef.current;
  for (let i = 0; i < 100; i++) {
    await new Promise((r) => setTimeout(r, 100));
    if (actorRef.current) return actorRef.current;
    if (!fetchingRef.current && !actorRef.current)
      throw new Error("Actor not available");
  }
  throw new Error("Actor timed out");
}
async function saveContentBlock(actorRef, fetchingRef, key, value) {
  const actor = await waitForActor(actorRef, fetchingRef);
  await actor.updateContentBlock(key, value);
}
function ImageUploadField({
  label,
  currentUrl,
  onUpload
}) {
  const [uploading, setUploading] = reactExports.useState(false);
  const ref = reactExports.useRef(null);
  const handleFile = async (file) => {
    setUploading(true);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      const url = blob.getDirectURL();
      onUpload(url ?? "");
      ue.success("Zdjęcie załadowane. Zapisz formularz, aby zachować.");
    } catch {
      ue.error("Błąd wczytywania zdjęcia.");
    } finally {
      setUploading(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
      currentUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: currentUrl,
          alt: "",
          className: "w-16 h-10 object-cover rounded-lg border border-border"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            var _a;
            return (_a = ref.current) == null ? void 0 : _a.click();
          },
          disabled: uploading,
          className: "inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-xs font-sans font-light hover:bg-muted/70 transition-colors disabled:opacity-50",
          "data-ocid": "kancelaria.hero.upload_button",
          children: [
            uploading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-3.5 h-3.5" }),
            "Wgraj zdjęcie"
          ]
        }
      ),
      currentUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          type: "button",
          onClick: () => onUpload(""),
          className: "text-xs font-sans font-light text-muted-foreground hover:text-destructive transition-colors",
          children: "Usuń"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        ref,
        type: "file",
        accept: "image/*",
        className: "hidden",
        onChange: (e) => {
          var _a;
          const f = (_a = e.target.files) == null ? void 0 : _a[0];
          if (f) handleFile(f);
        }
      }
    )
  ] });
}
function HeroSection() {
  const { actorRef, fetchingRef } = useActorRef();
  const qc = useQueryClient();
  const { data } = useKancelariaMeta();
  const [form, setForm] = reactExports.useState(null);
  const current = form ?? data ?? DEFAULT_KANCELARIA_META;
  const { mutate, isPending } = useMutation({
    mutationFn: async (val) => saveContentBlock(
      actorRef,
      fetchingRef,
      KANCELARIA_META_KEY,
      JSON.stringify(val)
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KANCELARIA_META_KEY] });
      ue.success("Hero zapisany.");
    },
    onError: () => ue.error("Błąd zapisu.")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-light text-foreground", children: "Hero – teksty" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Nagłówek" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: current.heroTitle,
            onChange: (e) => setForm({ ...current, heroTitle: e.target.value }),
            className: "mt-1 font-sans font-light",
            "data-ocid": "kancelaria.hero.input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Podtytuł" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: current.heroSubtitle,
            onChange: (e) => setForm({ ...current, heroSubtitle: e.target.value }),
            rows: 2,
            className: "mt-1 font-sans font-light",
            "data-ocid": "kancelaria.hero.textarea"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Opis (opcjonalny)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: current.heroDescription,
            onChange: (e) => setForm({ ...current, heroDescription: e.target.value }),
            rows: 2,
            className: "mt-1 font-sans font-light"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ImageUploadField,
        {
          label: "Zdjęcie tła",
          currentUrl: current.heroImageUrl,
          onUpload: (url) => setForm({ ...current, heroImageUrl: url })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        onClick: () => mutate({
          ...data ?? DEFAULT_KANCELARIA_META,
          heroTitle: current.heroTitle,
          heroSubtitle: current.heroSubtitle,
          heroDescription: current.heroDescription,
          heroImageUrl: current.heroImageUrl
        }),
        disabled: isPending,
        size: "sm",
        className: "font-sans font-light",
        "data-ocid": "kancelaria.hero.save_button",
        children: [
          isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4 mr-2" }),
          "Zapisz hero"
        ]
      }
    )
  ] });
}
function HoursSection() {
  const { actorRef, fetchingRef } = useActorRef();
  const qc = useQueryClient();
  const { data } = useKancelariaHours();
  const [localHours, setLocalHours] = reactExports.useState(null);
  const hours = localHours ?? data ?? DEFAULT_HOURS;
  const { mutate, isPending } = useMutation({
    mutationFn: async (val) => saveContentBlock(
      actorRef,
      fetchingRef,
      KANCELARIA_HOURS_KEY,
      JSON.stringify(val)
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KANCELARIA_HOURS_KEY] });
      ue.success("Godziny zapisane.");
    },
    onError: () => ue.error("Błąd zapisu.")
  });
  const update = (id, patch) => {
    setLocalHours(hours.map((h) => h.id === id ? { ...h, ...patch } : h));
  };
  const addHour = () => {
    const newH = {
      id: Date.now().toString(),
      day: "Nowy dzień",
      hours: "00:00 – 00:00",
      visible: true
    };
    setLocalHours([...hours, newH]);
  };
  const remove = (id) => setLocalHours(hours.filter((h) => h.id !== id));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-light text-foreground", children: "Godziny kancelarii" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: hours.map((h, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3",
        "data-ocid": `kancelaria.hours.row.${i + 1}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Switch,
            {
              checked: h.visible,
              onCheckedChange: (v) => update(h.id, { visible: v }),
              "data-ocid": `kancelaria.hours.switch.${i + 1}`
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: h.day,
              onChange: (e) => update(h.id, { day: e.target.value }),
              className: "flex-1 font-sans font-light h-8 text-sm",
              placeholder: "Dzień"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: h.hours,
              onChange: (e) => update(h.id, { hours: e.target.value }),
              className: "w-36 font-sans font-light h-8 text-sm",
              placeholder: "Godziny"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => remove(h.id),
              className: "text-muted-foreground hover:text-destructive transition-colors",
              "data-ocid": `kancelaria.hours.delete_button.${i + 1}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
            }
          )
        ]
      },
      h.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-3", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        onClick: addHour,
        className: "inline-flex items-center gap-1.5 text-sm font-sans font-light text-primary hover:text-primary/70 transition-colors",
        "data-ocid": "kancelaria.hours.primary_button",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
          " Dodaj dzień"
        ]
      }
    ) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        onClick: () => mutate(hours),
        disabled: isPending,
        size: "sm",
        className: "font-sans font-light",
        "data-ocid": "kancelaria.hours.save_button",
        children: [
          isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4 mr-2" }),
          "Zapisz godziny"
        ]
      }
    )
  ] });
}
function MatterForm({
  initial,
  onSave,
  onCancel
}) {
  const [m, setM] = reactExports.useState(initial);
  const [newDoc, setNewDoc] = reactExports.useState("");
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl border border-border bg-muted/20 p-5 space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-xs font-light", children: "Nazwa" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: m.name,
            onChange: (e) => setM({ ...m, name: e.target.value }),
            className: "mt-1 font-sans font-light",
            "data-ocid": "kancelaria.matter.input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-xs font-light", children: "Krótki opis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: m.shortDesc,
            onChange: (e) => setM({ ...m, shortDesc: e.target.value }),
            className: "mt-1 font-sans font-light"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-xs font-light", children: "Pełny opis" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          value: m.description,
          onChange: (e) => setM({ ...m, description: e.target.value }),
          rows: 3,
          className: "mt-1 font-sans font-light",
          "data-ocid": "kancelaria.matter.textarea"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-xs font-light mb-2 block", children: "Wymagane dokumenty" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5 mb-2", children: m.documents.map((doc, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 font-sans text-sm font-light text-foreground/80", children: doc }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setM({
              ...m,
              documents: m.documents.filter((_, j) => j !== i)
            }),
            className: "text-muted-foreground hover:text-destructive transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" })
          }
        )
      ] }, `doc-${i}-${doc}`)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: newDoc,
            onChange: (e) => setNewDoc(e.target.value),
            placeholder: "Dodaj dokument…",
            className: "flex-1 font-sans font-light h-8 text-sm",
            onKeyDown: (e) => {
              if (e.key === "Enter" && newDoc.trim()) {
                setM({ ...m, documents: [...m.documents, newDoc.trim()] });
                setNewDoc("");
              }
            }
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              if (newDoc.trim()) {
                setM({ ...m, documents: [...m.documents, newDoc.trim()] });
                setNewDoc("");
              }
            },
            className: "rounded-lg border border-border bg-muted px-2.5 py-1 text-xs font-sans hover:bg-muted/70 transition-colors",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-xs font-light", children: "Kiedy zgłosić" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: m.whenToRegister,
            onChange: (e) => setM({ ...m, whenToRegister: e.target.value }),
            className: "mt-1 font-sans font-light"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-xs font-light", children: "Kontakt" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: m.contactInfo,
            onChange: (e) => setM({ ...m, contactInfo: e.target.value }),
            className: "mt-1 font-sans font-light"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 pt-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          onClick: () => onSave(m),
          className: "font-sans font-light",
          "data-ocid": "kancelaria.matter.save_button",
          children: "Zapisz"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          size: "sm",
          variant: "ghost",
          onClick: onCancel,
          className: "font-sans font-light",
          "data-ocid": "kancelaria.matter.cancel_button",
          children: "Anuluj"
        }
      )
    ] })
  ] });
}
function MattersSection() {
  const { actorRef, fetchingRef } = useActorRef();
  const qc = useQueryClient();
  const { data } = useKancelariaMatters();
  const [localMatters, setLocalMatters] = reactExports.useState(null);
  const [editingId, setEditingId] = reactExports.useState(null);
  const [adding, setAdding] = reactExports.useState(false);
  const matters = localMatters ?? data ?? DEFAULT_MATTERS;
  const { mutate, isPending } = useMutation({
    mutationFn: async (val) => saveContentBlock(
      actorRef,
      fetchingRef,
      KANCELARIA_MATTERS_KEY,
      JSON.stringify(val)
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KANCELARIA_MATTERS_KEY] });
      ue.success("Sprawy zapisane.");
    },
    onError: () => ue.error("Błąd zapisu.")
  });
  const save = (updated) => {
    const next = matters.map((m) => m.id === updated.id ? updated : m);
    setLocalMatters(next);
    setEditingId(null);
  };
  const add = (m) => {
    const next = [...matters, m];
    setLocalMatters(next);
    setAdding(false);
  };
  const remove = (id) => setLocalMatters(matters.filter((m) => m.id !== id));
  const move = (id, dir) => {
    const idx = matters.findIndex((m) => m.id === id);
    if (idx < 0) return;
    const next = [...matters];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setLocalMatters(next.map((m, i) => ({ ...m, order: i })));
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-light text-foreground", children: "Zarządzaj sprawami" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
      matters.map(
        (m, i) => editingId === m.id ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          MatterForm,
          {
            initial: m,
            onSave: save,
            onCancel: () => setEditingId(null)
          },
          m.id
        ) : /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3",
            "data-ocid": `kancelaria.matters.row.${i + 1}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm font-light text-foreground truncate", children: m.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-xs font-light text-muted-foreground truncate", children: m.shortDesc })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => move(m.id, -1),
                    disabled: i === 0,
                    className: "text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => move(m.id, 1),
                    disabled: i === matters.length - 1,
                    className: "text-muted-foreground hover:text-foreground disabled:opacity-30 transition-colors",
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => setEditingId(m.id),
                    className: "text-muted-foreground hover:text-foreground transition-colors",
                    "data-ocid": `kancelaria.matters.edit_button.${i + 1}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" })
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "button",
                  {
                    type: "button",
                    onClick: () => remove(m.id),
                    className: "text-muted-foreground hover:text-destructive transition-colors",
                    "data-ocid": `kancelaria.matters.delete_button.${i + 1}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                  }
                )
              ] })
            ]
          },
          m.id
        )
      ),
      adding && /* @__PURE__ */ jsxRuntimeExports.jsx(
        MatterForm,
        {
          initial: {
            id: Date.now().toString(),
            name: "",
            shortDesc: "",
            description: "",
            documents: [],
            whenToRegister: "",
            contactInfo: "",
            order: matters.length
          },
          onSave: add,
          onCancel: () => setAdding(false)
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          type: "button",
          onClick: () => setAdding(true),
          className: "inline-flex items-center gap-1.5 text-sm font-sans font-light text-primary hover:text-primary/70 transition-colors",
          "data-ocid": "kancelaria.matters.primary_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
            " Dodaj sprawę"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => mutate(matters),
          disabled: isPending,
          size: "sm",
          className: "font-sans font-light",
          "data-ocid": "kancelaria.matters.save_button",
          children: [
            isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4 mr-2" }),
            "Zapisz sprawy"
          ]
        }
      )
    ] })
  ] });
}
function MetaSection() {
  const { actorRef, fetchingRef } = useActorRef();
  const qc = useQueryClient();
  const { data } = useKancelariaMeta();
  const [form, setForm] = reactExports.useState(null);
  const [newDoc, setNewDoc] = reactExports.useState("");
  const current = form ?? data ?? DEFAULT_KANCELARIA_META;
  const { mutate, isPending } = useMutation({
    mutationFn: async (val) => saveContentBlock(
      actorRef,
      fetchingRef,
      KANCELARIA_META_KEY,
      JSON.stringify(val)
    ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [KANCELARIA_META_KEY] });
      ue.success("Dane zapisane.");
    },
    onError: () => ue.error("Błąd zapisu.")
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-light text-foreground", children: "Dane kontaktowe" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Telefon" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: current.contactPhone,
              onChange: (e) => setForm({ ...current, contactPhone: e.target.value }),
              className: "mt-1 font-sans font-light",
              "data-ocid": "kancelaria.contact.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Email" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: current.contactEmail,
              onChange: (e) => setForm({ ...current, contactEmail: e.target.value }),
              className: "mt-1 font-sans font-light"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Adres" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: current.contactAddress,
              onChange: (e) => setForm({ ...current, contactAddress: e.target.value }),
              className: "mt-1 font-sans font-light"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Uwaga pod godzinami (opcjonalna)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: current.contactNote,
            onChange: (e) => setForm({ ...current, contactNote: e.target.value }),
            placeholder: "np. W sprawach pilnych prosimy o kontakt telefoniczny.",
            className: "mt-1 font-sans font-light"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-light text-foreground", children: "Najczęściej wymagane dokumenty" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 mb-2", children: current.commonDocuments.map((doc, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "div",
        {
          className: "flex items-center gap-2",
          "data-ocid": `kancelaria.documents.row.${i + 1}`,
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 font-sans text-sm font-light", children: doc }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setForm({
                  ...current,
                  commonDocuments: current.commonDocuments.filter(
                    (_, j) => j !== i
                  )
                }),
                className: "text-muted-foreground hover:text-destructive transition-colors",
                "data-ocid": `kancelaria.documents.delete_button.${i + 1}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3.5 h-3.5" })
              }
            )
          ]
        },
        `doc-${i}-${doc}`
      )) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: newDoc,
            onChange: (e) => setNewDoc(e.target.value),
            placeholder: "Nowy dokument…",
            className: "flex-1 font-sans font-light h-8 text-sm",
            onKeyDown: (e) => {
              if (e.key === "Enter" && newDoc.trim()) {
                setForm({
                  ...current,
                  commonDocuments: [...current.commonDocuments, newDoc.trim()]
                });
                setNewDoc("");
              }
            },
            "data-ocid": "kancelaria.documents.input"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => {
              if (newDoc.trim()) {
                setForm({
                  ...current,
                  commonDocuments: [...current.commonDocuments, newDoc.trim()]
                });
                setNewDoc("");
              }
            },
            className: "rounded-lg border border-border bg-muted px-2.5 py-1 text-xs font-sans hover:bg-muted/70 transition-colors",
            "data-ocid": "kancelaria.documents.primary_button",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-3.5 h-3.5" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-light text-foreground", children: "Komunikat" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Switch,
          {
            checked: current.announcementVisible,
            onCheckedChange: (v) => setForm({ ...current, announcementVisible: v }),
            "data-ocid": "kancelaria.announcement.switch"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Pokaż komunikat na stronie" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          value: current.announcement,
          onChange: (e) => setForm({ ...current, announcement: e.target.value }),
          rows: 3,
          placeholder: "np. W czasie kolędy kancelaria może być nieczynna.",
          className: "font-sans font-light",
          "data-ocid": "kancelaria.announcement.textarea"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-light text-foreground", children: "Blok końcowy" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Nagłówek" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: current.closingTitle,
            onChange: (e) => setForm({ ...current, closingTitle: e.target.value }),
            className: "mt-1 font-sans font-light",
            "data-ocid": "kancelaria.closing.input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Tekst" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: current.closingText,
            onChange: (e) => setForm({ ...current, closingText: e.target.value }),
            rows: 2,
            className: "mt-1 font-sans font-light",
            "data-ocid": "kancelaria.closing.textarea"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        onClick: () => mutate({
          ...data ?? DEFAULT_KANCELARIA_META,
          contactPhone: current.contactPhone,
          contactEmail: current.contactEmail,
          contactAddress: current.contactAddress,
          contactNote: current.contactNote,
          commonDocuments: current.commonDocuments,
          announcementVisible: current.announcementVisible,
          announcement: current.announcement,
          closingTitle: current.closingTitle,
          closingText: current.closingText
        }),
        disabled: isPending,
        size: "sm",
        className: "font-sans font-light",
        "data-ocid": "kancelaria.meta.save_button",
        children: [
          isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin mr-2" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4 mr-2" }),
          "Zapisz dane"
        ]
      }
    )
  ] });
}
function KancelariaTab() {
  const { identity } = useInternetIdentity();
  if (!identity) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "py-12 text-center font-sans text-sm font-light text-muted-foreground",
        "data-ocid": "kancelaria.access_denied.panel",
        children: "Zaloguj się, aby zarządzać kancelarią."
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-12 py-6", "data-ocid": "kancelaria.admin.panel", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border bg-card p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeroSection, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border bg-card p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HoursSection, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border bg-card p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MattersSection, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl border border-border bg-card p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(MetaSection, {}) })
  ] });
}
export {
  KancelariaTab
};
