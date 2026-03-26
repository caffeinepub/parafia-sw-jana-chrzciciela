import { aT as useZycieData, j as jsxRuntimeExports, a9 as Tabs, aa as TabsList, ab as TabsTrigger, ac as TabsContent, r as reactExports, aq as Separator, L as Label, I as Input, T as Textarea, B as Button, d as Save, R as React, P as Plus, i as ue, h as Image, aU as GripVertical } from "./index-aJFlCKTC.js";
import { u as useZycieImageUpload } from "./useZycieImageUpload-2RFN16b_.js";
import { L as LoaderCircle } from "./loader-circle-D0Gv4FCv.js";
import { T as Trash2 } from "./trash-2-se2l6nCJ.js";
import { U as Upload } from "./upload-6_LkQSOO.js";
function generateId() {
  return `tile_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
function ImageField({
  value,
  onChange,
  label,
  aspectRatio = "4/3"
}) {
  const ref = reactExports.useRef(null);
  const { upload } = useZycieImageUpload();
  const [uploading, setUploading] = reactExports.useState(false);
  const [progress, setProgressVal] = reactExports.useState(0);
  const handleFile = async (file) => {
    setUploading(true);
    setProgressVal(0);
    try {
      const url = await upload(file);
      onChange(url);
    } catch (e) {
      console.error("Image upload failed:", e);
      ue.error("Nie udało się wgrać zdjęcia");
    } finally {
      setUploading(false);
      setProgressVal(0);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "button",
      {
        type: "button",
        className: "relative w-full rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors overflow-hidden cursor-pointer text-left",
        style: { aspectRatio },
        onClick: () => {
          var _a;
          return (_a = ref.current) == null ? void 0 : _a.click();
        },
        "aria-label": "Dodaj zdjęcie",
        children: [
          value ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: value,
              alt: "Podgląd",
              className: "w-full h-full object-cover"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-10 h-10 text-muted-foreground/30" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-sans text-sm text-muted-foreground/60", children: "Kliknij, aby dodać zdjęcie" })
          ] }),
          uploading && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute inset-0 bg-background/70 flex flex-col items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 text-primary animate-spin" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-sans text-muted-foreground", children: progress > 0 ? `${progress}%` : "Wgrywanie…" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-2 right-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "button",
              className: "bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs font-sans hover:bg-card transition-colors",
              onClick: (e) => {
                var _a;
                e.stopPropagation();
                (_a = ref.current) == null ? void 0 : _a.click();
              },
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-3.5 h-3.5" }),
                value ? "Zmień" : "Dodaj"
              ]
            }
          ) })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "input",
      {
        ref,
        type: "file",
        accept: "image/*",
        className: "hidden",
        onChange: (e) => {
          var _a;
          const file = (_a = e.target.files) == null ? void 0 : _a[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }
      }
    )
  ] });
}
function HeroTextsSubTab({
  data,
  saveData
}) {
  const [draft, setDraft] = reactExports.useState(data.heroTexts);
  const [saving, setSaving] = reactExports.useState(false);
  const save = async () => {
    setSaving(true);
    try {
      await saveData({ ...data, heroTexts: draft });
      ue.success("Zapisano teksty hero");
    } catch {
      ue.error("Błąd zapisu");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-semibold text-foreground", children: "Teksty sekcji Hero" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-sans", children: 'Edytuj nagłówek i opis sekcji "Życie"' })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 max-w-xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "zycie-title", children: "Tytuł" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "zycie-title",
            value: draft.title,
            onChange: (e) => setDraft((p) => ({ ...p, title: e.target.value })),
            "data-ocid": "zycie.hero.title.input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "zycie-subtitle", children: "Podtytuł" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            id: "zycie-subtitle",
            value: draft.subtitle,
            onChange: (e) => setDraft((p) => ({ ...p, subtitle: e.target.value })),
            "data-ocid": "zycie.hero.subtitle.input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { htmlFor: "zycie-desc", children: "Opis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            id: "zycie-desc",
            rows: 3,
            value: draft.description,
            onChange: (e) => setDraft((p) => ({ ...p, description: e.target.value })),
            "data-ocid": "zycie.hero.description.textarea"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: save,
          disabled: saving,
          "data-ocid": "zycie.hero.save_button",
          children: [
            saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4 mr-2" }),
            "Zapisz"
          ]
        }
      )
    ] })
  ] });
}
function TileEditor({
  tile,
  index,
  onChange,
  onDelete
}) {
  const update = (fields) => onChange({ ...tile, ...fields });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "border border-border/60 rounded-xl p-5 space-y-4 bg-muted/20",
      "data-ocid": `zycie.tile.card.${index + 1}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(GripVertical, { className: "w-4 h-4 text-muted-foreground/50" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-sm font-sans font-medium text-muted-foreground", children: [
              "Kafelek #",
              index + 1
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              variant: "ghost",
              size: "sm",
              onClick: onDelete,
              className: "text-destructive hover:text-destructive hover:bg-destructive/10",
              "data-ocid": `zycie.tile.delete_button.${index + 1}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tytuł kafelka" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: tile.title,
                onChange: (e) => update({ title: e.target.value }),
                placeholder: "np. I Komunia, Rekolekcje…",
                "data-ocid": `zycie.tile.title.input.${index + 1}`
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2 md:col-span-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
            ImageField,
            {
              value: tile.image,
              onChange: (url) => update({ image: url }),
              label: "Zdjęcie kafelka (16:9)",
              aspectRatio: "16/9"
            }
          ) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 md:col-span-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Treść" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                rows: 3,
                value: tile.content,
                onChange: (e) => update({ content: e.target.value }),
                placeholder: "Opis, ogłoszenie, cytat…",
                "data-ocid": `zycie.tile.content.textarea.${index + 1}`
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link YouTube" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: tile.youtubeUrl,
                onChange: (e) => update({ youtubeUrl: e.target.value }),
                placeholder: "https://youtube.com/watch?v=…",
                "data-ocid": `zycie.tile.youtube.input.${index + 1}`
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "URL audio (zewnętrzny)" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: tile.audioUrl,
                onChange: (e) => update({ audioUrl: e.target.value }),
                placeholder: "https://…/kazanie.mp3",
                "data-ocid": `zycie.tile.audio.input.${index + 1}`
              }
            )
          ] })
        ] })
      ]
    }
  );
}
function YearsTilesSubTab({
  data,
  saveData
}) {
  const [draft, setDraft] = reactExports.useState(data);
  const [selectedYear, setSelectedYear] = reactExports.useState("2026");
  const [newYear, setNewYear] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  React.useEffect(() => {
    setDraft(data);
  }, [data]);
  const availableYears = Object.keys(draft.years).sort(
    (a, b) => Number(b) - Number(a)
  );
  const yearData = draft.years[selectedYear] ?? {
    heroImage: "",
    heroDescription: "",
    tiles: []
  };
  const updateYearField = reactExports.useCallback(
    (fields) => {
      setDraft((prev) => ({
        ...prev,
        years: {
          ...prev.years,
          [selectedYear]: { ...prev.years[selectedYear], ...fields }
        }
      }));
    },
    [selectedYear]
  );
  const updateTiles = reactExports.useCallback(
    (tiles) => {
      setDraft((prev) => ({
        ...prev,
        years: {
          ...prev.years,
          [selectedYear]: { ...prev.years[selectedYear], tiles }
        }
      }));
    },
    [selectedYear]
  );
  const addTile = () => {
    const newTile = {
      id: generateId(),
      title: "",
      content: "",
      image: "",
      youtubeUrl: "",
      audioUrl: ""
    };
    updateTiles([...yearData.tiles, newTile]);
  };
  const updateTile = (index, tile) => {
    const updated = yearData.tiles.map((t, i) => i === index ? tile : t);
    updateTiles(updated);
  };
  const deleteTile = (index) => {
    updateTiles(yearData.tiles.filter((_, i) => i !== index));
  };
  const addYear = () => {
    const y = newYear.trim();
    if (!y || draft.years[y]) {
      ue.error("Rok już istnieje lub jest pusty");
      return;
    }
    setDraft((prev) => ({
      ...prev,
      years: {
        ...prev.years,
        [y]: { heroImage: "", heroDescription: "", tiles: [] }
      }
    }));
    setSelectedYear(y);
    setNewYear("");
  };
  const deleteYear = (y) => {
    if (Object.keys(draft.years).length <= 1) {
      ue.error("Musi pozostać przynajmniej jeden rok");
      return;
    }
    setDraft((prev) => {
      const updated = { ...prev.years };
      delete updated[y];
      return { ...prev, years: updated };
    });
    const remaining = Object.keys(draft.years).filter((k) => k !== y);
    setSelectedYear(remaining[0] ?? "2026");
  };
  const save = async () => {
    setSaving(true);
    try {
      await saveData(draft);
      ue.success(`Zapisano rok ${selectedYear}`);
    } catch {
      ue.error("Błąd zapisu");
    } finally {
      setSaving(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-semibold text-foreground", children: "Wybór roku" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: availableYears.map((y) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => setSelectedYear(y),
            "data-ocid": "zycie.year.tab",
            className: `px-4 py-1.5 rounded-full text-sm font-sans font-medium border transition-all ${selectedYear === y ? "bg-foreground text-background border-foreground" : "border-border text-muted-foreground hover:text-foreground"}`,
            children: y
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            type: "button",
            onClick: () => deleteYear(y),
            className: "p-1 rounded-full hover:bg-destructive/10 text-muted-foreground/50 hover:text-destructive transition-colors",
            "data-ocid": "zycie.year.delete_button",
            title: `Usuń rok ${y}`,
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
          }
        )
      ] }, y)) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2 items-center max-w-xs", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: newYear,
            onChange: (e) => setNewYear(e.target.value),
            placeholder: "np. 2027",
            maxLength: 4,
            "data-ocid": "zycie.year.input"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: addYear,
            "data-ocid": "zycie.year.add_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
              "Dodaj rok"
            ]
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg font-semibold text-foreground", children: [
        "Centralny obraz roku ",
        selectedYear
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ImageField,
          {
            value: yearData.heroImage,
            onChange: (url) => updateYearField({ heroImage: url }),
            label: `Centralny obraz roku ${selectedYear}`,
            aspectRatio: "4/3"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Opis pod zdjęciem" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Textarea,
            {
              rows: 3,
              value: yearData.heroDescription,
              onChange: (e) => updateYearField({ heroDescription: e.target.value }),
              placeholder: "Rok wspólnoty i nadziei…",
              "data-ocid": "zycie.year.hero_description.input"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg font-semibold text-foreground", children: [
          "Kafelki (",
          yearData.tiles.length,
          ")"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            variant: "outline",
            size: "sm",
            onClick: addTile,
            "data-ocid": "zycie.tile.add_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-1" }),
              "Dodaj kafelek"
            ]
          }
        )
      ] }),
      yearData.tiles.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "text-center py-10 border border-dashed border-border/50 rounded-xl text-muted-foreground text-sm font-sans",
          "data-ocid": "zycie.tiles.empty_state",
          children: 'Brak kafelków. Kliknij "Dodaj kafelek" żeby dodać pierwszy.'
        }
      ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-4", children: yearData.tiles.map((tile, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        TileEditor,
        {
          tile,
          index: i,
          onChange: (updated) => updateTile(i, updated),
          onDelete: () => deleteTile(i)
        },
        tile.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Button, { onClick: save, disabled: saving, "data-ocid": "zycie.save_button", children: [
      saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 mr-2 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4 mr-2" }),
      "Zapisz rok ",
      selectedYear
    ] })
  ] });
}
function AdminZycieTab() {
  const { data, saveData } = useZycieData();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-semibold text-foreground tracking-tight", children: "Życie parafii" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-sans", children: "Zarządzaj kroniką życia parafii rok po roku" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "lata", className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "bg-muted/40 p-1 rounded-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabsTrigger,
          {
            value: "hero",
            className: "rounded-lg text-sm font-sans font-light",
            "data-ocid": "zycie.admin.hero.tab",
            children: "Treści hero"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabsTrigger,
          {
            value: "lata",
            className: "rounded-lg text-sm font-sans font-light",
            "data-ocid": "zycie.admin.years.tab",
            children: "Lata i kafelki"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "hero", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeroTextsSubTab, { data, saveData }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "lata", children: /* @__PURE__ */ jsxRuntimeExports.jsx(YearsTilesSubTab, { data, saveData }) })
    ] })
  ] });
}
export {
  AdminZycieTab
};
