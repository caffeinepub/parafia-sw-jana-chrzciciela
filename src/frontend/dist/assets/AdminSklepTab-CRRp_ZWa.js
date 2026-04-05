import { j as jsxRuntimeExports, aq as Separator, a9 as Tabs, aa as TabsList, ab as TabsTrigger, ac as TabsContent, ar as useSklepProducts, as as useSklepConfig, r as reactExports, B as Button, P as Plus, at as Package, g as Pencil, au as DEFAULT_CONFIG, L as Label, I as Input, T as Textarea, X, d as Save, Y as useInternetIdentity, av as useShopOrders, q as Select, s as SelectTrigger, t as SelectValue, v as SelectContent, w as SelectItem, i as ue, h as Image, a5 as ChevronUp, K as ChevronDown } from "./index-CJw8i4Cr.js";
import { u as useZycieImageUpload } from "./useZycieImageUpload-bApFP2yS.js";
import { T as Trash2 } from "./trash-2-bnm1AKKe.js";
import { L as LoaderCircle } from "./loader-circle-Cjz6SUfw.js";
import { U as Upload } from "./upload-ls2JlI_9.js";
function generateId() {
  return `product_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
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
  const handleFile = async (file) => {
    setUploading(true);
    try {
      const url = await upload(file);
      onChange(url);
    } catch {
      ue.error("Nie udało się wgrać zdjęcia");
    } finally {
      setUploading(false);
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
        children: [
          value ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: value,
              alt: "Podgląd",
              className: "w-full h-full object-cover"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full h-full flex flex-col items-center justify-center gap-3 min-h-[120px]", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-8 h-8 text-muted-foreground/30" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-sans text-sm text-muted-foreground/60", children: "Kliknij, aby dodać zdjęcie" })
          ] }),
          uploading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-background/70 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 text-primary animate-spin" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-2 right-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "bg-card/80 backdrop-blur-sm border border-border rounded-lg px-3 py-1.5 flex items-center gap-1.5 text-xs font-sans", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-3.5 h-3.5" }),
            value ? "Zmień" : "Dodaj"
          ] }) })
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
const EMPTY_PRODUCT = {
  name: "",
  description: "",
  fullDescription: "",
  price: "",
  priceLabel: "Cena",
  category: "",
  status: "available",
  imageUrl: "",
  youtubeUrl: "",
  order: 0
};
function ProductForm({
  initial,
  categories,
  onSave,
  onCancel
}) {
  const [form, setForm] = reactExports.useState(
    initial ? {
      name: initial.name,
      description: initial.description,
      fullDescription: initial.fullDescription,
      price: initial.price,
      priceLabel: initial.priceLabel,
      category: initial.category,
      status: initial.status,
      imageUrl: initial.imageUrl,
      youtubeUrl: initial.youtubeUrl,
      order: initial.order
    } : { ...EMPTY_PRODUCT }
  );
  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const handleSave = () => {
    if (!form.name.trim()) {
      ue.error("Podaj nazwę produktu");
      return;
    }
    onSave({ id: (initial == null ? void 0 : initial.id) ?? generateId(), ...form });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-semibold", children: initial ? "Edytuj produkt" : "Nowy produkt" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-sans", children: "Uzupełnij dane produktu" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-5", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nazwa *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.name,
            onChange: (e) => set("name", e.target.value),
            placeholder: "np. Miód parafialny",
            "data-ocid": "sklep.product.name.input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kategoria" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.category,
            onChange: (e) => set("category", e.target.value),
            placeholder: "np. Produkty naturalne",
            list: "categories-list",
            "data-ocid": "sklep.product.category.input"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("datalist", { id: "categories-list", children: categories.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: c }, c)) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Cena / Ofiara *" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.price,
            onChange: (e) => set("price", e.target.value),
            placeholder: "np. 35 zł",
            "data-ocid": "sklep.product.price.input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Rodzaj ceny" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: form.priceLabel,
            onValueChange: (v) => set("priceLabel", v),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "sklep.product.price_label.select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Cena", children: "Cena" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "Ofiara", children: "Sugerowana ofiara" })
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Select,
          {
            value: form.status,
            onValueChange: (v) => set("status", v),
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(SelectTrigger, { "data-ocid": "sklep.product.status.select", children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {}) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "available", children: "Dostępny" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "new", children: "Nowość" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "featured", children: "Polecane" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "seasonal", children: "Sezonowy" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "soldout", children: "Wyprzedany" })
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Kolejność wyświetlania" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            type: "number",
            value: form.order,
            onChange: (e) => set("order", Number(e.target.value)),
            "data-ocid": "sklep.product.order.input"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Krótki opis" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          value: form.description,
          onChange: (e) => set("description", e.target.value),
          placeholder: "Krótki opis widoczny na karcie produktu",
          rows: 2,
          className: "resize-none",
          "data-ocid": "sklep.product.description.textarea"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Pełny opis" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Textarea,
        {
          value: form.fullDescription,
          onChange: (e) => set("fullDescription", e.target.value),
          placeholder: "Szczegółowy opis widoczny po kliknięciu produktu",
          rows: 4,
          className: "resize-none",
          "data-ocid": "sklep.product.full_description.textarea"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Link YouTube (opcjonalnie)" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Input,
        {
          value: form.youtubeUrl,
          onChange: (e) => set("youtubeUrl", e.target.value),
          placeholder: "https://youtube.com/watch?v=...",
          "data-ocid": "sklep.product.youtube.input"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      ImageField,
      {
        label: "Zdjęcie produktu",
        value: form.imageUrl,
        onChange: (url) => set("imageUrl", url)
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          variant: "outline",
          onClick: onCancel,
          className: "gap-2",
          "data-ocid": "sklep.product.form.cancel.button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" }),
            "Anuluj"
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: handleSave,
          className: "gap-2",
          "data-ocid": "sklep.product.form.save.button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
            "Zapisz produkt"
          ]
        }
      )
    ] })
  ] });
}
function ProductsSubTab() {
  const { products, saveProducts } = useSklepProducts();
  const { config } = useSklepConfig();
  const [editing, setEditing] = reactExports.useState(null);
  const [saving, setSaving] = reactExports.useState(false);
  const handleSave = async (product) => {
    setSaving(true);
    try {
      let updated;
      if (editing === "new") {
        updated = [...products, product];
      } else {
        updated = products.map((p) => p.id === product.id ? product : p);
      }
      await saveProducts(updated);
      ue.success("Produkt zapisany");
      setEditing(null);
    } catch {
      ue.error("Nie udało się zapisać");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("Usunąć ten produkt?")) return;
    setSaving(true);
    try {
      await saveProducts(products.filter((p) => p.id !== id));
      ue.success("Produkt usunięty");
    } catch {
      ue.error("Nie udało się usunąć");
    } finally {
      setSaving(false);
    }
  };
  if (editing !== null) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(
      ProductForm,
      {
        initial: editing === "new" ? null : editing,
        categories: config.categories,
        onSave: handleSave,
        onCancel: () => setEditing(null)
      }
    );
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-sans text-sm text-muted-foreground", children: [
        products.length,
        " produktów"
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: () => setEditing("new"),
          className: "gap-2",
          "data-ocid": "sklep.product.add.button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" }),
            "Nowy produkt"
          ]
        }
      )
    ] }),
    products.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "py-16 text-center text-muted-foreground",
        "data-ocid": "sklep.products.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-10 h-10 mx-auto mb-3 opacity-20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm", children: "Brak produktów" })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: [...products].sort((a, b) => a.order - b.order).map((product, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center gap-4 p-4 bg-card border border-border/40 rounded-xl",
        "data-ocid": `sklep.product.row.${i + 1}`,
        children: [
          product.imageUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: product.imageUrl,
              alt: product.name,
              className: "w-12 h-12 rounded-lg object-cover flex-shrink-0"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm font-medium text-foreground truncate", children: product.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-sans text-xs text-muted-foreground", children: [
              product.priceLabel,
              ": ",
              product.price
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: () => setEditing(product),
                disabled: saving,
                "data-ocid": `sklep.product.edit_button.${i + 1}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-3.5 h-3.5" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: "outline",
                onClick: () => handleDelete(product.id),
                disabled: saving,
                className: "text-destructive hover:bg-destructive/10",
                "data-ocid": `sklep.product.delete_button.${i + 1}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" })
              }
            )
          ] })
        ]
      },
      product.id
    )) })
  ] });
}
function ConfigSubTab() {
  const { config, saveConfig } = useSklepConfig();
  const [form, setForm] = reactExports.useState({ ...DEFAULT_CONFIG });
  const [catInput, setCatInput] = reactExports.useState("");
  const [saving, setSaving] = reactExports.useState(false);
  reactExports.useEffect(() => {
    setForm({ ...config });
  }, [config]);
  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const handleSave = async () => {
    setSaving(true);
    try {
      await saveConfig(form);
      ue.success("Konfiguracja zapisana");
    } catch {
      ue.error("Nie udało się zapisać");
    } finally {
      setSaving(false);
    }
  };
  const addCategory = () => {
    const val = catInput.trim();
    if (!val || form.categories.includes(val)) return;
    set("categories", [...form.categories, val]);
    setCatInput("");
  };
  const removeCategory = (cat) => set(
    "categories",
    form.categories.filter((c) => c !== cat)
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 max-w-2xl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-display text-lg font-semibold", children: "Konfiguracja sklepu" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-muted-foreground font-sans", children: "Teksty, płatności i kategorie" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-sans text-sm font-semibold uppercase tracking-widest text-muted-foreground", children: "Sekcja Hero" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nagłówek" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.heroTitle,
            onChange: (e) => set("heroTitle", e.target.value),
            "data-ocid": "sklep.config.hero_title.input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Podtytuł" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.heroSubtitle,
            onChange: (e) => set("heroSubtitle", e.target.value),
            "data-ocid": "sklep.config.hero_subtitle.input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Opis" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: form.heroDescription,
            onChange: (e) => set("heroDescription", e.target.value),
            rows: 3,
            className: "resize-none",
            "data-ocid": "sklep.config.hero_description.textarea"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ImageField,
        {
          label: "Obraz hero",
          value: form.heroImageUrl,
          onChange: (url) => set("heroImageUrl", url),
          aspectRatio: "16/5"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-sans text-sm font-semibold uppercase tracking-widest text-muted-foreground", children: "Płatności" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Numer BLIK (telefon parafii)" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.blikPhone,
            onChange: (e) => set("blikPhone", e.target.value),
            placeholder: "+48 123 456 789",
            "data-ocid": "sklep.config.blik_phone.input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        ImageField,
        {
          label: "Kod QR do przelewu",
          value: form.qrImageUrl,
          onChange: (url) => set("qrImageUrl", url),
          aspectRatio: "1/1"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-sans text-sm font-semibold uppercase tracking-widest text-muted-foreground", children: "Podziękowanie" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Nagłówek podziękowania" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: form.thankYouTitle,
            onChange: (e) => set("thankYouTitle", e.target.value),
            "data-ocid": "sklep.config.thankyou_title.input"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { children: "Tekst podziękowania" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Textarea,
          {
            value: form.thankYouText,
            onChange: (e) => set("thankYouText", e.target.value),
            rows: 3,
            className: "resize-none",
            "data-ocid": "sklep.config.thankyou_text.textarea"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "font-sans text-sm font-semibold uppercase tracking-widest text-muted-foreground", children: "Kategorie" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Input,
          {
            value: catInput,
            onChange: (e) => setCatInput(e.target.value),
            onKeyDown: (e) => e.key === "Enter" && addCategory(),
            placeholder: "Nowa kategoria...",
            "data-ocid": "sklep.config.category.input"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "outline",
            onClick: addCategory,
            "data-ocid": "sklep.config.add_category.button",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4" })
          }
        )
      ] }),
      form.categories.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: form.categories.map((cat) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "span",
        {
          className: "flex items-center gap-1.5 bg-muted/60 text-sm font-sans px-3 py-1.5 rounded-full border border-border",
          children: [
            cat,
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => removeCategory(cat),
                className: "text-muted-foreground hover:text-destructive transition-colors",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-3 h-3" })
              }
            )
          ]
        },
        cat
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      Button,
      {
        onClick: handleSave,
        disabled: saving,
        className: "gap-2",
        "data-ocid": "sklep.config.save.button",
        children: [
          saving ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-4 h-4 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4" }),
          "Zapisz konfigurację"
        ]
      }
    ) })
  ] });
}
const ORDER_STATUS_LABELS = {
  new: "Nowe",
  awaiting: "Oczekuje wpłaty",
  paid: "Opłacone",
  shipped: "Wysłane"
};
const ORDER_STATUS_STYLES = {
  new: "bg-sky-50 text-sky-700 border-sky-200",
  awaiting: "bg-amber-50 text-amber-700 border-amber-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  shipped: "bg-muted text-muted-foreground border-border"
};
const ORDER_FILTERS = [
  { value: "all", label: "Wszystkie" },
  { value: "new", label: "Nowe" },
  { value: "awaiting", label: "Oczekuje wpłaty" },
  { value: "paid", label: "Opłacone" },
  { value: "shipped", label: "Wysłane" }
];
function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}
function OrderCard({
  order,
  index,
  onUpdate,
  onDelete
}) {
  const [expanded, setExpanded] = reactExports.useState(false);
  const [adminNotes, setAdminNotes] = reactExports.useState(order.adminNotes);
  const [trackingNumber, setTrackingNumber] = reactExports.useState(order.trackingNumber);
  const [saving, setSaving] = reactExports.useState(false);
  const [deleting, setDeleting] = reactExports.useState(false);
  const handleStatusChange = async (status) => {
    setSaving(true);
    try {
      await onUpdate(order.id, {
        ...order,
        status,
        adminNotes,
        trackingNumber
      });
      ue.success("Status zaktualizowany");
    } catch {
      ue.error("Nie udało się zaktualizować");
    } finally {
      setSaving(false);
    }
  };
  const handleNotesBlur = async () => {
    if (adminNotes === order.adminNotes) return;
    setSaving(true);
    try {
      await onUpdate(order.id, { ...order, adminNotes, trackingNumber });
    } catch {
      ue.error("Nie udało się zapisać notatki");
    } finally {
      setSaving(false);
    }
  };
  const handleTrackingBlur = async () => {
    if (trackingNumber === order.trackingNumber) return;
    setSaving(true);
    try {
      await onUpdate(order.id, { ...order, adminNotes, trackingNumber });
      ue.success("Numer przesyłki zapisany");
    } catch {
      ue.error("Nie udało się zapisać");
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async () => {
    if (!confirm("Usunąć to zamówienie?")) return;
    setDeleting(true);
    try {
      await onDelete(order.id);
      ue.success("Zamówienie usunięte");
    } catch {
      ue.error("Nie udało się usunąć");
    } finally {
      setDeleting(false);
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      className: "bg-card border border-border/40 rounded-xl overflow-hidden",
      "data-ocid": `sklep.order.row.${index + 1}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 space-y-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 flex-wrap", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-0.5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm font-semibold text-foreground", children: order.customerName }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-sans text-xs text-muted-foreground", children: [
                order.productName,
                " · ",
                order.productPrice
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `text-xs px-2.5 py-1 rounded-full border font-sans font-medium ${ORDER_STATUS_STYLES[order.status]}`,
                  children: ORDER_STATUS_LABELS[order.status]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `text-xs px-2.5 py-1 rounded-full border font-sans ${order.deliveryType === "shipping" ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-muted text-muted-foreground border-border"}`,
                  children: order.deliveryType === "shipping" ? "Wysyłka" : "Odbiór osobisty"
                }
              ),
              order.paymentConfirmed && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-sans", children: "✓ Wpłata potwierdzona" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-4 text-xs font-sans text-muted-foreground", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: order.phone }),
            order.email && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: order.email }),
            order.deliveryType === "shipping" && order.address && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
              order.address,
              ", ",
              order.postalCode,
              " ",
              order.city
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-auto", children: formatDate(order.createdAt) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            className: "w-full flex items-center justify-between px-4 py-2 bg-muted/30 border-t border-border/30 text-xs font-sans text-muted-foreground hover:bg-muted/50 transition-colors",
            onClick: () => setExpanded((v) => !v),
            "data-ocid": `sklep.order.toggle.${index + 1}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Szczegóły i zarządzanie" }),
              expanded ? /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronUp, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-3.5 h-3.5" })
            ]
          }
        ),
        expanded && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t border-border/30 space-y-5", children: [
          order.notes && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-sans text-muted-foreground uppercase tracking-wider", children: "Uwagi klienta" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm text-foreground", children: order.notes })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-sans text-muted-foreground uppercase tracking-wider", children: "Zmień status" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap gap-2", children: ["new", "awaiting", "paid", "shipped"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                size: "sm",
                variant: order.status === s ? "default" : "outline",
                onClick: () => handleStatusChange(s),
                disabled: saving || order.status === s,
                className: "text-xs",
                "data-ocid": `sklep.order.status_${s}.button`,
                children: ORDER_STATUS_LABELS[s]
              },
              s
            )) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-sans text-muted-foreground uppercase tracking-wider", children: "Numer przesyłki" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: trackingNumber,
                onChange: (e) => setTrackingNumber(e.target.value),
                onBlur: handleTrackingBlur,
                placeholder: "np. 00123456789PL",
                className: "text-sm",
                "data-ocid": "sklep.order.tracking.input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "text-xs font-sans text-muted-foreground uppercase tracking-wider", children: "Notatki admina" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: adminNotes,
                onChange: (e) => setAdminNotes(e.target.value),
                onBlur: handleNotesBlur,
                placeholder: "Wewnętrzne notatki...",
                rows: 2,
                className: "text-sm resize-none",
                "data-ocid": "sklep.order.admin_notes.textarea"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-end pt-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
            Button,
            {
              size: "sm",
              variant: "outline",
              onClick: handleDelete,
              disabled: deleting,
              className: "gap-2 text-destructive hover:bg-destructive/10",
              "data-ocid": `sklep.order.delete_button.${index + 1}`,
              children: [
                deleting ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-3.5 h-3.5 animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }),
                "Usuń zamówienie"
              ]
            }
          ) })
        ] })
      ]
    }
  );
}
function OrdersSubTab() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const { orders, isLoading, updateOrder, deleteOrder } = useShopOrders();
  const [filter, setFilter] = reactExports.useState("all");
  const counts = {
    all: orders.length,
    new: orders.filter((o) => o.status === "new").length,
    awaiting: orders.filter((o) => o.status === "awaiting").length,
    paid: orders.filter((o) => o.status === "paid").length,
    shipped: orders.filter((o) => o.status === "shipped").length
  };
  const filtered = [...orders].filter((o) => filter === "all" || o.status === filter).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  if (!isAuthenticated) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "py-16 text-center text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm", children: "Zaloguj się, aby zarządzać zamówieniami." }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-sans text-sm text-muted-foreground", children: [
      orders.length,
      " zamówień łącznie"
    ] }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "flex flex-wrap gap-2",
        "data-ocid": "sklep.orders.filter.toggle",
        children: ORDER_FILTERS.map((f) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            type: "button",
            onClick: () => setFilter(f.value),
            "data-ocid": "sklep.orders.filter.tab",
            className: `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-sans border transition-all ${filter === f.value ? "bg-foreground text-background border-foreground" : "bg-transparent text-muted-foreground border-border hover:border-foreground/40"}`,
            children: [
              f.label,
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "span",
                {
                  className: `text-xs px-1.5 py-0.5 rounded-full ${filter === f.value ? "bg-background/20 text-background" : "bg-muted text-muted-foreground"}`,
                  children: counts[f.value]
                }
              )
            ]
          },
          f.value
        ))
      }
    ),
    isLoading && orders.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "py-12 text-center",
        "data-ocid": "sklep.orders.loading_state",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { className: "w-6 h-6 animate-spin mx-auto text-muted-foreground/40" })
      }
    ) : filtered.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "py-16 text-center text-muted-foreground",
        "data-ocid": "sklep.orders.empty_state",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Package, { className: "w-10 h-10 mx-auto mb-3 opacity-20" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm", children: filter === "all" ? "Brak zamówień" : `Brak zamówień o statusie "${ORDER_STATUS_LABELS[filter]}"` })
        ]
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: filtered.map((order, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
      OrderCard,
      {
        order,
        index: i,
        onUpdate: updateOrder,
        onDelete: deleteOrder
      },
      order.id
    )) })
  ] });
}
function AdminSklepTab() {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-semibold text-foreground", children: "Sklep parafialny" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm text-muted-foreground", children: "Zarządzaj produktami, konfiguracją i zamówieniami" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Separator, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Tabs, { defaultValue: "produkty", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(TabsList, { className: "bg-muted/40 p-1 rounded-xl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabsTrigger,
          {
            value: "produkty",
            className: "font-sans font-light text-sm",
            "data-ocid": "sklep.admin.produkty.tab",
            children: "Produkty"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabsTrigger,
          {
            value: "konfiguracja",
            className: "font-sans font-light text-sm",
            "data-ocid": "sklep.admin.konfiguracja.tab",
            children: "Konfiguracja"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          TabsTrigger,
          {
            value: "zamowienia",
            className: "font-sans font-light text-sm",
            "data-ocid": "sklep.admin.zamowienia.tab",
            children: "Zamówienia"
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "produkty", className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ProductsSubTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "konfiguracja", className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ConfigSubTab, {}) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(TabsContent, { value: "zamowienia", className: "pt-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(OrdersSubTab, {}) })
    ] })
  ] });
}
export {
  AdminSklepTab
};
