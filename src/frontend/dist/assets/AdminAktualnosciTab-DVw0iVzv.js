import { u as useAllNews, a as useCreateNews, b as useUpdateNews, c as useDeleteNews, r as reactExports, E as ExternalBlob, j as jsxRuntimeExports, B as Button, L as Label, I as Input, T as Textarea, S as Switch, d as Save, P as Plus, e as Skeleton, f as Badge, g as Pencil, h as Image, i as ue } from "./index-CJw8i4Cr.js";
import { A as AlertDialog, a as AlertDialogTrigger, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-D559dN9T.js";
import { T as Trash2 } from "./trash-2-bnm1AKKe.js";
import { U as Upload } from "./upload-ls2JlI_9.js";
function ImageUpload({
  label,
  current,
  onUpload,
  className
}) {
  const [progress, setProgress] = reactExports.useState(null);
  const ref = reactExports.useRef(null);
  const url = current == null ? void 0 : current.getDirectURL();
  const hasImage = url && url !== "";
  const handleFile = async (file) => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((p) => {
      setProgress(p);
    });
    onUpload(blob);
    setProgress(null);
    ue.success("Zdjęcie dodane. Zapisz formularz, aby przesłać.");
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `space-y-2 ${className || ""}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans text-sm font-light", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "relative rounded-lg border-2 border-dashed border-border hover:border-primary/40 transition-colors overflow-hidden aspect-video",
        "data-ocid": "admin.image.dropzone",
        onClick: () => {
          var _a;
          return (_a = ref.current) == null ? void 0 : _a.click();
        },
        onKeyDown: (e) => {
          var _a;
          if (e.key === "Enter" || e.key === " ") (_a = ref.current) == null ? void 0 : _a.click();
        },
        children: [
          hasImage ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: url, alt: "", className: "w-full h-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "img-placeholder w-full h-full flex flex-col items-center justify-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-8 h-8 opacity-30" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-sans text-xs text-muted-foreground", children: "Kliknij, aby dodać zdjęcie" })
          ] }),
          progress !== null && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-foreground/60 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-background font-sans text-sm", children: [
            Math.round(progress),
            "%"
          ] }) }),
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
              "data-ocid": "admin.image.upload_button",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-3.5 h-3.5" }),
                hasImage ? "Zmień" : "Dodaj"
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
          if (file) handleFile(file);
        }
      }
    )
  ] });
}
function AdminAktualnosciTab() {
  const { data: news, isLoading, isError } = useAllNews();
  const create = useCreateNews();
  const update = useUpdateNews();
  const del = useDeleteNews();
  const empty = {
    id: "",
    title: "",
    content: "",
    order: 0n,
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    published: false,
    image: ExternalBlob.fromURL("")
  };
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(empty);
  const openNew = () => {
    setForm({ ...empty, id: crypto.randomUUID() });
    setEditing({ ...empty, id: "new" });
  };
  const openEdit = (article) => {
    setForm(article);
    setEditing(article);
  };
  const handleSave = async () => {
    try {
      if ((editing == null ? void 0 : editing.id) === "new") {
        await create.mutateAsync(form);
        ue.success("Artykuł dodany");
      } else {
        await update.mutateAsync({ id: form.id, article: form });
        ue.success("Artykuł zaktualizowany");
      }
      setEditing(null);
    } catch {
      ue.error("Błąd zapisu");
    }
  };
  const handleDelete = async (id) => {
    try {
      await del.mutateAsync(id);
      ue.success("Artykuł usunięty");
    } catch {
      ue.error("Błąd usuwania");
    }
  };
  if (editing) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            size: "sm",
            onClick: () => setEditing(null),
            className: "font-sans font-light",
            children: "← Wróć"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-light text-foreground", children: editing.id === "new" ? "Nowy artykuł" : "Edytuj artykuł" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Tytuł" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.title,
                onChange: (e) => setForm((p) => ({ ...p, title: e.target.value })),
                placeholder: "Tytuł artykułu",
                className: "font-sans",
                "data-ocid": "admin.news.title.input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Treść" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: form.content,
                onChange: (e) => setForm((p) => ({ ...p, content: e.target.value })),
                placeholder: "Treść artykułu...",
                rows: 8,
                className: "font-sans resize-none",
                "data-ocid": "admin.news.content.textarea"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Data" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                type: "date",
                value: form.date,
                onChange: (e) => setForm((p) => ({ ...p, date: e.target.value })),
                className: "font-sans",
                "data-ocid": "admin.news.date.input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Switch,
              {
                checked: form.published,
                onCheckedChange: (v) => setForm((p) => ({ ...p, published: v })),
                "data-ocid": "admin.news.published.switch"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Opublikowany" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ImageUpload,
          {
            label: "Zdjęcie",
            current: form.image,
            onUpload: (blob) => setForm((p) => ({ ...p, image: blob }))
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleSave,
            disabled: create.isPending || update.isPending,
            className: "font-sans font-light",
            "data-ocid": "admin.news.save.submit_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4 mr-2" }),
              create.isPending || update.isPending ? "Zapisywanie..." : "Zapisz"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            onClick: () => setEditing(null),
            className: "font-sans font-light",
            "data-ocid": "admin.news.cancel.button",
            children: "Anuluj"
          }
        )
      ] })
    ] });
  }
  if (isError) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between", children: /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-light text-foreground", children: "Aktualności" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "text-center py-16 border border-dashed border-destructive/30 rounded-xl",
          "data-ocid": "admin.news.error_state",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm text-muted-foreground", children: "Wystąpił błąd podczas ładowania aktualności. Odśwież stronę i spróbuj ponownie." })
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-light text-foreground", children: "Aktualności" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: openNew,
          size: "sm",
          className: "font-sans font-light",
          "data-ocid": "admin.news.add.primary_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
            " Nowy artykuł"
          ]
        }
      )
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", "data-ocid": "admin.news.loading_state", children: [1, 2, 3].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-16 w-full" }, i)) }) : !news || news.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "text-center py-16 border border-dashed border-border rounded-xl",
        "data-ocid": "admin.news.empty_state",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm text-muted-foreground", children: "Brak artykułów. Dodaj pierwszy." })
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-2", children: news.map((article, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex items-center gap-4 bg-card rounded-lg p-4 border border-border",
        "data-ocid": `admin.news.item.${i + 1}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-sm font-light text-foreground truncate", children: article.title || "Bez tytułu" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Badge,
                {
                  variant: article.published ? "default" : "secondary",
                  className: "text-xs font-sans font-light",
                  children: article.published ? "Opublikowany" : "Szkic"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-xs text-muted-foreground mt-0.5", children: article.date })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-8 w-8",
                onClick: () => openEdit(article),
                "data-ocid": `admin.news.edit.edit_button.${i + 1}`,
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pencil, { className: "w-4 h-4" })
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                Button,
                {
                  variant: "ghost",
                  size: "icon",
                  className: "h-8 w-8 text-destructive hover:text-destructive",
                  "data-ocid": `admin.news.delete.delete_button.${i + 1}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": "admin.news.delete.dialog", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { className: "font-display font-light", children: "Usuń artykuł" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { className: "font-sans", children: "Ta operacja jest nieodwracalna." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    AlertDialogCancel,
                    {
                      className: "font-sans font-light",
                      "data-ocid": "admin.news.delete.cancel_button",
                      children: "Anuluj"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    AlertDialogAction,
                    {
                      onClick: () => handleDelete(article.id),
                      className: "font-sans font-light bg-destructive text-destructive-foreground",
                      "data-ocid": "admin.news.delete.confirm_button",
                      children: "Usuń"
                    }
                  )
                ] })
              ] })
            ] })
          ] })
        ]
      },
      article.id
    )) })
  ] });
}
export {
  AdminAktualnosciTab
};
