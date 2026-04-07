import { k as useGalleryAlbums, l as useCreateAlbum, m as useUpdateAlbum, n as useDeleteAlbum, o as useAddPhoto, p as useRemovePhoto, r as reactExports, j as jsxRuntimeExports, B as Button, L as Label, I as Input, T as Textarea, q as Select, s as SelectTrigger, t as SelectValue, v as SelectContent, w as SelectItem, d as Save, X, P as Plus, e as Skeleton, g as Pencil, h as Image, i as ue, E as ExternalBlob } from "./index-D7IwDy7E.js";
import { A as AlertDialog, a as AlertDialogTrigger, b as AlertDialogContent, c as AlertDialogHeader, d as AlertDialogTitle, e as AlertDialogDescription, f as AlertDialogFooter, g as AlertDialogCancel, h as AlertDialogAction } from "./alert-dialog-C-fttA0I.js";
import { U as Upload } from "./upload-_LUTq9dM.js";
import { T as Trash2 } from "./trash-2-BZXxMHhh.js";
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
function AdminGaleriaTab() {
  const { data: albums, isLoading } = useGalleryAlbums();
  const createAlbum = useCreateAlbum();
  const updateAlbum = useUpdateAlbum();
  const deleteAlbum = useDeleteAlbum();
  const addPhoto = useAddPhoto();
  const removePhoto = useRemovePhoto();
  const [editing, setEditing] = reactExports.useState(null);
  const [form, setForm] = reactExports.useState(null);
  const [uploadingAlbumId, setUploadingAlbumId] = reactExports.useState(null);
  const fileRef = reactExports.useRef(null);
  const emptyAlbum = {
    id: "",
    date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
    name: "",
    layout: "grid",
    description: "",
    coverImage: ExternalBlob.fromURL(""),
    photos: []
  };
  const openNew = () => {
    const a = { ...emptyAlbum, id: crypto.randomUUID() };
    setForm(a);
    setEditing({ ...a, id: "new" });
  };
  const openEdit = (album) => {
    setForm(album);
    setEditing(album);
  };
  const handleSave = async () => {
    if (!form) return;
    try {
      if ((editing == null ? void 0 : editing.id) === "new") {
        await createAlbum.mutateAsync(form);
        ue.success("Album utworzony");
      } else {
        await updateAlbum.mutateAsync({ id: form.id, album: form });
        ue.success("Album zaktualizowany");
      }
      setEditing(null);
    } catch {
      ue.error("Błąd zapisu");
    }
  };
  const handleDeleteAlbum = async (id) => {
    try {
      await deleteAlbum.mutateAsync(id);
      ue.success("Album usunięty");
    } catch {
      ue.error("Błąd usuwania");
    }
  };
  const handleAddPhoto = async (albumId, file) => {
    setUploadingAlbumId(albumId);
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(bytes);
      const photo = {
        id: crypto.randomUUID(),
        order: BigInt(Date.now()),
        blob,
        date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
        caption: ""
      };
      await addPhoto.mutateAsync({ albumId, photo });
      ue.success("Zdjęcie dodane");
    } catch {
      ue.error("Błąd dodawania zdjęcia");
    } finally {
      setUploadingAlbumId(null);
    }
  };
  const handleRemovePhoto = async (albumId, photoId) => {
    try {
      await removePhoto.mutateAsync({ albumId, photoId });
      ue.success("Zdjęcie usunięte");
    } catch {
      ue.error("Błąd usuwania zdjęcia");
    }
  };
  if (editing && form) {
    const album = (albums == null ? void 0 : albums.find((a) => a.id === form.id)) || form;
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
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-light", children: editing.id === "new" ? "Nowy album" : "Edytuj album" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Nazwa albumu" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Input,
              {
                value: form.name,
                onChange: (e) => setForm((p) => p ? { ...p, name: e.target.value } : p),
                placeholder: "Nazwa albumu",
                className: "font-sans",
                "data-ocid": "admin.album.name.input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Opis" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Textarea,
              {
                value: form.description,
                onChange: (e) => setForm(
                  (p) => p ? { ...p, description: e.target.value } : p
                ),
                placeholder: "Opis albumu...",
                rows: 3,
                className: "font-sans resize-none",
                "data-ocid": "admin.album.description.textarea"
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
                onChange: (e) => setForm((p) => p ? { ...p, date: e.target.value } : p),
                className: "font-sans",
                "data-ocid": "admin.album.date.input"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Label, { className: "font-sans font-light", children: "Układ galerii" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Select,
              {
                value: form.layout,
                onValueChange: (v) => setForm((p) => p ? { ...p, layout: v } : p),
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    SelectTrigger,
                    {
                      className: "font-sans",
                      "data-ocid": "admin.album.layout.select",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(SelectValue, {})
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(SelectContent, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "grid", className: "font-sans", children: "Siatka" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "masonry", className: "font-sans", children: "Masonry" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(SelectItem, { value: "slider", className: "font-sans", children: "Slider" })
                  ] })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          ImageUpload,
          {
            label: "Okładka albumu",
            current: form.coverImage,
            onUpload: (blob) => setForm((p) => p ? { ...p, coverImage: blob } : p)
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          Button,
          {
            onClick: handleSave,
            disabled: createAlbum.isPending || updateAlbum.isPending,
            className: "font-sans font-light",
            "data-ocid": "admin.album.save.submit_button",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-4 h-4 mr-2" }),
              createAlbum.isPending || updateAlbum.isPending ? "Zapisywanie..." : "Zapisz album"
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          Button,
          {
            variant: "ghost",
            onClick: () => setEditing(null),
            className: "font-sans font-light",
            "data-ocid": "admin.album.cancel.button",
            children: "Anuluj"
          }
        )
      ] }),
      editing.id !== "new" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4 border-t border-border pt-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-display text-lg font-light", children: [
            "Zdjęcia (",
            album.photos.length,
            ")"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            Button,
            {
              size: "sm",
              variant: "outline",
              className: "font-sans font-light",
              onClick: () => {
                var _a;
                return (_a = fileRef.current) == null ? void 0 : _a.click();
              },
              disabled: !!uploadingAlbumId,
              "data-ocid": "admin.album.addphoto.upload_button",
              children: uploadingAlbumId ? "Dodawanie..." : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Upload, { className: "w-3.5 h-3.5 mr-2" }),
                " Dodaj zdjęcia"
              ] })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              ref: fileRef,
              type: "file",
              accept: "image/*",
              multiple: true,
              className: "hidden",
              onChange: async (e) => {
                const files = Array.from(e.target.files || []);
                for (const file of files) {
                  await handleAddPhoto(album.id, file);
                }
              }
            }
          )
        ] }),
        album.photos.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: "text-center py-10 border border-dashed border-border rounded-xl",
            "data-ocid": "admin.album.photos.empty_state",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm text-muted-foreground", children: "Brak zdjęć. Dodaj pierwsze." })
          }
        ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3", children: album.photos.map((photo, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "div",
          {
            className: "relative group aspect-square rounded-lg overflow-hidden bg-muted",
            "data-ocid": `admin.album.photo.item.${i + 1}`,
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: photo.blob.getDirectURL(),
                  alt: photo.caption,
                  className: "w-full h-full object-cover"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-colors flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialog, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTrigger, { asChild: true, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Button,
                  {
                    size: "icon",
                    variant: "ghost",
                    className: "opacity-0 group-hover:opacity-100 h-8 w-8 text-background hover:text-background hover:bg-destructive/80 transition-all",
                    "data-ocid": `admin.photo.delete.delete_button.${i + 1}`,
                    children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
                  }
                ) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": "admin.photo.delete.dialog", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { className: "font-display font-light", children: "Usuń zdjęcie" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { className: "font-sans", children: "Ta operacja jest nieodwracalna." })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      AlertDialogCancel,
                      {
                        className: "font-sans font-light",
                        "data-ocid": "admin.photo.delete.cancel_button",
                        children: "Anuluj"
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      AlertDialogAction,
                      {
                        onClick: () => handleRemovePhoto(album.id, photo.id),
                        className: "font-sans font-light bg-destructive text-destructive-foreground",
                        "data-ocid": "admin.photo.delete.confirm_button",
                        children: "Usuń"
                      }
                    )
                  ] })
                ] })
              ] }) })
            ]
          },
          photo.id
        )) })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-xl font-light", children: "Galeria" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Button,
        {
          onClick: openNew,
          size: "sm",
          className: "font-sans font-light",
          "data-ocid": "admin.gallery.add.primary_button",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-4 h-4 mr-2" }),
            " Nowy album"
          ]
        }
      )
    ] }),
    isLoading ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
        "data-ocid": "admin.gallery.loading_state",
        children: [1, 2].map((i) => /* @__PURE__ */ jsxRuntimeExports.jsx(Skeleton, { className: "h-32" }, i))
      }
    ) : !albums || albums.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "text-center py-16 border border-dashed border-border rounded-xl",
        "data-ocid": "admin.gallery.empty_state",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-sm text-muted-foreground", children: "Brak albumów." })
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: albums.map((album, i) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        className: "flex gap-4 bg-card rounded-xl p-4 border border-border",
        "data-ocid": `admin.gallery.album.item.${i + 1}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0", children: album.coverImage.getDirectURL() ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: album.coverImage.getDirectURL(),
              alt: album.name,
              className: "w-full h-full object-cover"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "img-placeholder w-full h-full" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display text-sm font-light text-foreground truncate", children: album.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "font-sans text-xs text-muted-foreground", children: [
              album.date,
              " · ",
              album.photos.length,
              " zdjęć"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-sans text-xs text-muted-foreground mt-1 capitalize", children: album.layout })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              Button,
              {
                variant: "ghost",
                size: "icon",
                className: "h-8 w-8",
                onClick: () => openEdit(album),
                "data-ocid": `admin.gallery.album.edit.edit_button.${i + 1}`,
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
                  "data-ocid": `admin.gallery.album.delete.delete_button.${i + 1}`,
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
                }
              ) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogContent, { "data-ocid": "admin.gallery.album.delete.dialog", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogHeader, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogTitle, { className: "font-display font-light", children: "Usuń album" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogDescription, { className: "font-sans", children: "Ta operacja jest nieodwracalna. Wszystkie zdjęcia zostaną usunięte." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(AlertDialogFooter, { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    AlertDialogCancel,
                    {
                      className: "font-sans font-light",
                      "data-ocid": "admin.gallery.album.delete.cancel_button",
                      children: "Anuluj"
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    AlertDialogAction,
                    {
                      onClick: () => handleDeleteAlbum(album.id),
                      className: "font-sans font-light bg-destructive text-destructive-foreground",
                      "data-ocid": "admin.gallery.album.delete.confirm_button",
                      children: "Usuń album"
                    }
                  )
                ] })
              ] })
            ] })
          ] })
        ]
      },
      album.id
    )) })
  ] });
}
export {
  AdminGaleriaTab
};
