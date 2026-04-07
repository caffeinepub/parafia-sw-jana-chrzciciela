import { C as createLucideIcon, aw as useAllCommunities, r as reactExports, j as jsxRuntimeExports, B as Button, P as Plus, e as Skeleton, g as Pencil, ax as Dialog, ay as DialogContent, az as DialogHeader, aA as DialogTitle, Z as useQueryClient, $ as useMutation, aB as useWspolnotyMeta, aC as DEFAULT_META, R as React, a5 as ChevronUp, K as ChevronDown, L as Label, T as Textarea, I as Input, X, F as useActor, i as ue } from "./index-D7IwDy7E.js";
import { A as AlertDialog, a as AlertDialogTrigger, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-C-fttA0I.js";
import { T as Trash2 } from "./trash-2-BZXxMHhh.js";
import { L as LoaderCircle } from "./loader-circle-D1Dluw4w.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M16 5h6", key: "1vod17" }],
  ["path", { d: "M19 2v6", key: "4bpg5p" }],
  ["path", { d: "M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5", key: "1ue2ih" }],
  ["path", { d: "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21", key: "1xmnt7" }],
  ["circle", { cx: "9", cy: "9", r: "2", key: "af1f0g" }]
];
const ImagePlus = createLucideIcon("image-plus", __iconNode);
const CONTENT_KEY = "communities";
const META_KEY = "wspolnotyMeta";
function useActorRef() {
  const { actor, isFetching } = useActor();
  const actorRef = React.useRef(null);
  const fetchingRef = React.useRef(true);
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
function generateId() {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
async function saveCommunities(actor, communities) {
  await actor.updateContentBlock(CONTENT_KEY, JSON.stringify(communities));
}
async function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      var _a;
      const img = new Image();
      img.onload = () => {
        const maxW = 800;
        let { width, height } = img;
        if (width > maxW) {
          height = Math.round(height * maxW / width);
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
      img.src = (_a = e.target) == null ? void 0 : _a.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
function useCreateCommunity() {
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (community) => {
      const a = await waitForActor(actorRef, fetchingRef);
      const current = queryClient.getQueryData(["communities"]) ?? [];
      const updated = [...current, community].sort((x, y) => x.order - y.order);
      await saveCommunities(a, updated);
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["communities"], updated);
      ue.success("Wspólnota dodana");
    },
    onError: (err) => {
      console.error("createCommunity error", err);
      ue.error("Błąd zapisu");
    }
  });
}
function useUpdateCommunity() {
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      community
    }) => {
      const a = await waitForActor(actorRef, fetchingRef);
      const current = queryClient.getQueryData(["communities"]) ?? [];
      const updated = current.map((c) => c.id === id ? { ...community, id } : c).sort((x, y) => x.order - y.order);
      await saveCommunities(a, updated);
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["communities"], updated);
      ue.success("Wspólnota zaktualizowana");
    },
    onError: (err) => {
      console.error("updateCommunity error", err);
      ue.error("Błąd zapisu");
    }
  });
}
function useDeleteCommunity() {
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const a = await waitForActor(actorRef, fetchingRef);
      const current = queryClient.getQueryData(["communities"]) ?? [];
      const updated = current.filter((c) => c.id !== id);
      await saveCommunities(a, updated);
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["communities"], updated);
      ue.success("Wspólnota usunięta");
    },
    onError: (err) => {
      console.error("deleteCommunity error", err);
      ue.error("Błąd usuwania");
    }
  });
}
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
  heroImageUrl: ""
};
function CommunityForm({
  initial,
  onSave,
  onCancel,
  isPending
}) {
  const [form, setForm] = reactExports.useState(
    initial ? {
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
      heroImageUrl: initial.heroImageUrl ?? ""
    } : { ...EMPTY_FORM }
  );
  const [imageLoading, setImageLoading] = reactExports.useState(false);
  const fileInputRef = reactExports.useRef(null);
  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  const handleImageSelect = async (e) => {
    var _a;
    const file = (_a = e.target.files) == null ? void 0 : _a[0];
    if (!file) return;
    setImageLoading(true);
    try {
      const dataUrl = await compressImage(file);
      setForm((prev) => ({ ...prev, heroImageUrl: dataUrl }));
    } catch (err) {
      console.error("Image compression error", err);
      ue.error("Błąd wczytywania zdjęcia");
    } finally {
      setImageLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Zdjęcie główne" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          ref: fileInputRef,
          type: "file",
          accept: "image/*",
          className: "hidden",
          onChange: handleImageSelect,
          "data-ocid": "wspolnoty.form.upload_button"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            className: "w-24 h-24 rounded-xl border border-border overflow-hidden bg-muted/30 flex-shrink-0 flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors",
            onClick: () => {
              var _a;
              return (_a = fileInputRef.current) == null ? void 0 : _a.click();
            },
            children: imageLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-5 h-5 text-muted-foreground animate-spin" }) : form.heroImageUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: form.heroImageUrl,
                alt: "Podgląd",
                className: "w-full h-full object-cover"
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "w-6 h-6 text-muted-foreground/40" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              variant: "outline",
              size: "sm",
              className: "font-sans font-light text-sm",
              onClick: () => {
                var _a;
                return (_a = fileInputRef.current) == null ? void 0 : _a.click();
              },
              disabled: imageLoading,
              children: [
                imageLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { className: "w-4 h-4 mr-2" }),
                form.heroImageUrl ? "Zmień zdjęcie" : "Dodaj zdjęcie"
              ]
            }
          ),
          form.heroImageUrl && /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              type: "button",
              variant: "ghost",
              size: "sm",
              className: "font-sans font-light text-sm text-muted-foreground",
              onClick: () => setForm((prev) => ({ ...prev, heroImageUrl: "" })),
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4 mr-1" }),
                " Usuń zdjęcie"
              ]
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Nazwa *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.name,
            onChange: set("name"),
            placeholder: "np. Ministranci",
            className: "font-sans font-light",
            "data-ocid": "wspolnoty.form.input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Krótki opis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.shortDescription,
            onChange: set("shortDescription"),
            placeholder: "Jedno zdanie o wspólnocie",
            className: "font-sans font-light"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Pełny opis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: form.fullDescription,
            onChange: set("fullDescription"),
            placeholder: "Pełna historia i opis wspólnoty…",
            className: "font-sans font-light min-h-[120px]",
            "data-ocid": "wspolnoty.form.textarea"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Dzień spotkań" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.meetingDay,
            onChange: set("meetingDay"),
            placeholder: "np. Środa",
            className: "font-sans font-light"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Godzina" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.meetingTime,
            onChange: set("meetingTime"),
            placeholder: "np. 19:00",
            className: "font-sans font-light"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Miejsce spotkań" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.meetingPlace,
            onChange: set("meetingPlace"),
            placeholder: "np. Sala parafialna",
            className: "font-sans font-light"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Opiekun" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.caretaker,
            onChange: set("caretaker"),
            placeholder: "np. ks. Jan Kowalski",
            className: "font-sans font-light"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Kolejność" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            value: form.order,
            onChange: set("order"),
            className: "font-sans font-light"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Telefon" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.contactPhone,
            onChange: set("contactPhone"),
            placeholder: "np. +48 123 456 789",
            className: "font-sans font-light"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Email" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.contactEmail,
            onChange: set("contactEmail"),
            placeholder: "np. wspolnota@parafia.pl",
            className: "font-sans font-light"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-3 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          variant: "ghost",
          onClick: onCancel,
          className: "font-sans font-light",
          "data-ocid": "wspolnoty.form.cancel_button",
          children: "Anuluj"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Button,
        {
          onClick: () => onSave(form),
          disabled: isPending || !form.name.trim(),
          className: "font-sans font-light",
          "data-ocid": "wspolnoty.form.submit_button",
          children: isPending ? "Zapisywanie…" : "Zapisz"
        }
      )
    ] })
  ] });
}
function WspolnotyMetaEditor() {
  const [isOpen, setIsOpen] = reactExports.useState(false);
  const { data: metaData } = useWspolnotyMeta();
  const [metaForm, setMetaForm] = reactExports.useState({ ...DEFAULT_META });
  const { actorRef, fetchingRef } = useActorRef();
  const queryClient = useQueryClient();
  React.useEffect(() => {
    if (metaData) {
      setMetaForm({ ...DEFAULT_META, ...metaData });
    }
  }, [metaData]);
  const saveMeta = useMutation({
    mutationFn: async (form) => {
      const a = await waitForActor(actorRef, fetchingRef);
      await a.updateContentBlock(META_KEY, JSON.stringify(form));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wspolnotyMeta"] });
      ue.success("Teksty zakładki zapisane");
    },
    onError: (err) => {
      console.error("saveMeta error", err);
      ue.error("Błąd zapisu tekstów");
    }
  });
  const setField = (key) => (e) => setMetaForm((prev) => ({ ...prev, [key]: e.target.value }));
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "border border-border rounded-xl overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: "w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors font-sans text-sm font-medium text-foreground",
        onClick: () => setIsOpen((v) => !v),
        "data-ocid": "wspolnoty.meta.toggle",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: 'Teksty zakładki „Wspólnoty"' }),
          isOpen ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-4 h-4 text-muted-foreground" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4 text-muted-foreground" })
        ]
      }
    ),
    isOpen && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-4 bg-card", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Podtytuł hero (główny tekst pod nagłówkiem)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: metaForm.heroSubtitle,
              onChange: setField("heroSubtitle"),
              className: "font-sans font-light min-h-[60px]",
              "data-ocid": "wspolnoty.meta.herosubtitle.textarea"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Opis hero (mniejszy tekst)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: metaForm.heroDescription,
              onChange: setField("heroDescription"),
              className: "font-sans font-light min-h-[60px]",
              "data-ocid": "wspolnoty.meta.herodescription.textarea"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Podpis nad mapą (mały)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: metaForm.mapLabel,
              onChange: setField("mapLabel"),
              className: "font-sans font-light",
              "data-ocid": "wspolnoty.meta.maplabel.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Tytuł sekcji mapy" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: metaForm.mapTitle,
              onChange: setField("mapTitle"),
              className: "font-sans font-light",
              "data-ocid": "wspolnoty.meta.maptitle.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Centrum mapy – linia 1" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: metaForm.centerLine1,
              onChange: setField("centerLine1"),
              className: "font-sans font-light",
              "data-ocid": "wspolnoty.meta.centerline1.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Centrum mapy – linia 2" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: metaForm.centerLine2,
              onChange: setField("centerLine2"),
              className: "font-sans font-light",
              "data-ocid": "wspolnoty.meta.centerline2.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Tytuł sekcji zaproszenia" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Input,
            {
              value: metaForm.invitationTitle,
              onChange: setField("invitationTitle"),
              className: "font-sans font-light",
              "data-ocid": "wspolnoty.meta.invitationtitle.input"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "sm:col-span-2 space-y-1.5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: "Tekst sekcji zaproszenia" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              value: metaForm.invitationText,
              onChange: setField("invitationText"),
              className: "font-sans font-light min-h-[60px]",
              "data-ocid": "wspolnoty.meta.invitationtext.textarea"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end pt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => saveMeta.mutate(metaForm),
          disabled: saveMeta.isPending,
          className: "font-sans font-light",
          "data-ocid": "wspolnoty.meta.save_button",
          children: [
            saveMeta.isPending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }) : null,
            saveMeta.isPending ? "Zapisywanie…" : "Zapisz teksty"
          ]
        }
      ) })
    ] })
  ] });
}
function WspolnotyTab() {
  const { data: communities = [], isLoading } = useAllCommunities();
  const createCommunity = useCreateCommunity();
  const updateCommunity = useUpdateCommunity();
  const deleteCommunity = useDeleteCommunity();
  const [isDialogOpen, setIsDialogOpen] = reactExports.useState(false);
  const [editing, setEditing] = reactExports.useState(null);
  const handleSave = (form) => {
    const communityData = {
      id: (editing == null ? void 0 : editing.id) ?? generateId(),
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
      heroImageUrl: form.heroImageUrl || void 0
    };
    if (editing) {
      updateCommunity.mutate(
        { id: editing.id, community: communityData },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setEditing(null);
          }
        }
      );
    } else {
      createCommunity.mutate(communityData, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setEditing(null);
        }
      });
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(WspolnotyMetaEditor, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-extralight text-foreground", children: "Wspólnoty" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm text-muted-foreground mt-1", children: "Zarządzaj wspólnotami parafialnymi" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => {
            setEditing(null);
            setIsDialogOpen(true);
          },
          className: "font-sans font-light rounded-full",
          "data-ocid": "wspolnoty.add.primary_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
            " Dodaj wspólnotę"
          ]
        }
      )
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", "data-ocid": "wspolnoty.list.loading_state", children: Array.from({ length: 3 }).map((_, i) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: skeleton list
      /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-20 rounded-xl" }, `sk-${i}`)
    )) }) : communities.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "text-center py-16 rounded-2xl border border-dashed border-border",
        "data-ocid": "wspolnoty.list.empty_state",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-muted-foreground text-sm", children: "Brak wspólnot. Dodaj pierwszą." })
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: communities.map((community, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "bg-card border border-border rounded-xl overflow-hidden",
        "data-ocid": `wspolnoty.item.${i + 1}`,
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 flex-1 min-w-0", children: [
            community.heroImageUrl && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 rounded-lg overflow-hidden flex-shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: community.heroImageUrl,
                alt: "",
                className: "w-full h-full object-cover"
              }
            ) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm font-medium text-foreground truncate", children: community.name }),
              community.shortDescription && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-xs text-muted-foreground truncate mt-0.5", children: community.shortDescription }),
              community.meetingDay && /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-sans text-xs text-muted-foreground/60 mt-0.5", children: [
                community.meetingDay,
                " ",
                community.meetingTime
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 ml-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                onClick: () => {
                  setEditing(community);
                  setIsDialogOpen(true);
                },
                className: "rounded-full w-8 h-8",
                "data-ocid": `wspolnoty.item.edit_button.${i + 1}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "rounded-full w-8 h-8 text-destructive hover:text-destructive hover:bg-destructive/10",
                  "data-ocid": `wspolnoty.item.delete_button.${i + 1}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { className: "font-display font-light", children: "Usuń wspólnotę" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogDescription, { className: "font-sans font-light", children: [
                    "Czy na pewno chcesz usunąć „",
                    community.name,
                    '"? Tej operacji nie można cofnąć.'
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    AlertDialogCancel,
                    {
                      className: "font-sans font-light",
                      "data-ocid": "wspolnoty.delete.cancel_button",
                      children: "Anuluj"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    AlertDialogAction,
                    {
                      onClick: () => deleteCommunity.mutate(community.id),
                      className: "font-sans font-light bg-destructive hover:bg-destructive/90",
                      "data-ocid": "wspolnoty.delete.confirm_button",
                      children: "Usuń"
                    }
                  )
                ] })
              ] })
            ] })
          ] })
        ] })
      },
      community.id
    )) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      Dialog,
      {
        open: isDialogOpen,
        onOpenChange: (open) => {
          setIsDialogOpen(open);
          if (!open) setEditing(null);
        },
        children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          DialogContent,
          {
            className: "max-w-2xl max-h-[90vh] overflow-y-auto",
            "data-ocid": "wspolnoty.form.dialog",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(DialogHeader, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "font-display font-light text-xl", children: editing ? "Edytuj wspólnotę" : "Nowa wspólnota" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                CommunityForm,
                {
                  initial: editing ?? void 0,
                  onSave: handleSave,
                  onCancel: () => {
                    setIsDialogOpen(false);
                    setEditing(null);
                  },
                  isPending: createCommunity.isPending || updateCommunity.isPending
                }
              )
            ]
          }
        )
      }
    )
  ] });
}
export {
  WspolnotyTab
};
